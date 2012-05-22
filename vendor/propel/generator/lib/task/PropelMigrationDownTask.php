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
 * This Task executes the next migration down
 *
 * @author     Francois Zaninotto
 * @package    propel.generator.task
 */
class PropelMigrationDownTask extends BasePropelMigrationTask
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

		$previousTimestamps = $manager->getAlreadyExecutedMigrationTimestamps();
		if (!$nextMigrationTimestamp = array_pop($previousTimestamps)) {
			$this->log('No migration were ever executed on this database - nothing to reverse.');
			return false;
		}
		$this->log(sprintf(
			'Executing migration %s down',
			$manager->getMigrationClassName($nextMigrationTimestamp)
		));

		if ($nbPreviousTimestamps = count($previousTimestamps)) {
			$previousTimestamp = array_pop($previousTimestamps);
		} else {
			$previousTimestamp = 0;
		}

		$migration = $manager->getMigrationObject($nextMigrationTimestamp);
		if (false === $migration->preDown($manager)) {
			$this->log('preDown() returned false. Aborting migration.', Project::MSG_ERR);
			return false;
		}

		foreach ($migration->getDownSQL() as $datasource => $sql) {
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
					$this->log(sprintf('Failed to execute SQL "%s"', $statement), Project::MSG_ERR);
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

			$manager->updateLatestMigrationTimestamp($datasource, $previousTimestamp);
			$this->log(sprintf(
				'Downgraded migration date to %d for datasource "%s"',
				$previousTimestamp,
				$datasource
			), Project::MSG_VERBOSE);
		}

		$migration->postDown($manager);

		if ($nbPreviousTimestamps) {
			$this->log(sprintf('Reverse migration complete. %d more migrations available for reverse.', $nbPreviousTimestamps));
		} else {
			$this->log('Reverse migration complete. No more migration available for reverse');
		}
	}
}