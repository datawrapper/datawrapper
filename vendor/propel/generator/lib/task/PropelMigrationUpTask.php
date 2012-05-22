<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/BasePropelMigrationTask.php';
require_once dirname(__FILE__) . '/../util/PropelMigrationManager.php';

/**
 * This Task executes the next migration up
 *
 * @author     Francois Zaninotto
 * @package    propel.generator.task
 */
class PropelMigrationUpTask extends BasePropelMigrationTask
{
	/**
	 * Main method builds all the targets for a typical propel project.
	 */
	public function main()
	{
		$manager = new PropelMigrationManager();
		$manager->setConnections($this->getGeneratorConfig()->getBuildConnections());
		$manager->setMigrationTable($this->getMigrationTable());
		$manager->setMigrationDir($this->getOutputDirectory());

		if (!$nextMigrationTimestamp = $manager->getFirstUpMigrationTimestamp()) {
			$this->log('All migrations were already executed - nothing to migrate.');
			return false;
		}
		$this->log(sprintf(
			'Executing migration %s up',
			$manager->getMigrationClassName($nextMigrationTimestamp)
		));

		$migration = $manager->getMigrationObject($nextMigrationTimestamp);
		if (false === $migration->preUp($manager)) {
			$this->log('preUp() returned false. Aborting migration.', Project::MSG_ERR);
			return false;
		}

		foreach ($migration->getUpSQL() as $datasource => $sql) {
			$connection = $manager->getConnection($datasource);
			$this->log(sprintf(
				'Connecting to database "%s" using DSN "%s"',
				$datasource,
				$connection['dsn']
			), Project::MSG_VERBOSE);
			$pdo = $manager->getPdoConnection($datasource);
			$res = 0;
			$statements = PropelSQLParser::parseString($sql);
			foreach ($statements as $statement) {
				try {
					$this->log(sprintf('Executing statement "%s"', $statement), Project::MSG_VERBOSE);
					$stmt = $pdo->prepare($statement);
					$stmt->execute();
					$res++;
				} catch (PDOException $e) {
					$this->log(sprintf('Failed to execute SQL "%s". Aborting migration.', $statement), Project::MSG_ERR);
					return false;
					// continue
				}
			}
			if (!$res) {
				$this->log('No statement was executed. The version was not updated.');
				$this->log(sprintf(
					'Please review the code in "%s"',
					$manager->getMigrationDir() . DIRECTORY_SEPARATOR . $manager->getMigrationClassName($nextMigrationTimestamp)
				));
				$this->log('Migration aborted', Project::MSG_ERR);
				return false;
			}
			$this->log(sprintf(
				'%d of %d SQL statements executed successfully on datasource "%s"',
				$res,
				count($statements),
				$datasource
			));
			$manager->updateLatestMigrationTimestamp($datasource, $nextMigrationTimestamp);
			$this->log(sprintf(
				'Updated latest migration date to %d for datasource "%s"',
				$nextMigrationTimestamp,
				$datasource
			), Project::MSG_VERBOSE);
		}

		$migration->postUp($manager);

		if ($timestamps = $manager->getValidMigrationTimestamps()) {
			$this->log(sprintf(
				'Migration complete. %d migrations left to execute.',
				count($timestamps)
			));
		} else {
			$this->log('Migration complete. No further migration to execute.');
		}
	}
}