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
 * This Task lists the migrations yet to be executed
 *
 * @author     Francois Zaninotto
 * @package    propel.generator.task
 */
class PropelMigrationStatusTask extends BasePropelMigrationTask
{
    public function main()
    {
        $manager = new PropelMigrationManager();
        $manager->setConnections($this->getGeneratorConfig()->getBuildConnections());
        $manager->setMigrationTable($this->getMigrationTable());
        $manager->setMigrationDir($this->getOutputDirectory());

        // the following is a verbose version of PropelMigrationManager::getValidMigrationTimestamps()
        // mostly for explicit output

        $this->log('Checking Database Versions...');
        foreach ($manager->getConnections() as $datasource => $params) {
            $this->log(sprintf(
                'Connecting to database "%s" using DSN "%s"',
                $datasource,
                $params['dsn']
            ), Project::MSG_VERBOSE);
            if (!$manager->migrationTableExists($datasource)) {
                $this->log(sprintf(
                    'Migration table does not exist in datasource "%s"; creating it.',
                    $datasource
                ), Project::MSG_VERBOSE);
                $manager->createMigrationTable($datasource);
            }
        }

        if ($oldestMigrationTimestamp = $manager->getOldestDatabaseVersion()) {
            $this->log(sprintf(
                'Latest migration was executed on %s (timestamp %d)',
                date('Y-m-d H:i:s', $oldestMigrationTimestamp),
                $oldestMigrationTimestamp
            ), Project::MSG_VERBOSE);
        } else {
            $this->log('No migration was ever executed on these connection settings.', Project::MSG_VERBOSE);
        }

        $this->log('Listing Migration files...');
        $dir = $this->getOutputDirectory();
        $migrationTimestamps = $manager->getMigrationTimestamps();
        $nbExistingMigrations = count($migrationTimestamps);
        if ($migrationTimestamps) {
            $this->log(sprintf(
                '%d valid migration classes found in "%s"',
                $nbExistingMigrations,
                $dir
            ), Project::MSG_VERBOSE);
            if ($validTimestamps = $manager->getValidMigrationTimestamps()) {
                $countValidTimestamps = count($validTimestamps);
                if ($countValidTimestamps == 1) {
                    $this->log('1 migration needs to be executed:');
                } else {
                    $this->log(sprintf('%d migrations need to be executed:', $countValidTimestamps));
                }
            }
            foreach ($migrationTimestamps as $timestamp) {
                $this->log(sprintf(
                    ' %s %s %s',
                    $timestamp == $oldestMigrationTimestamp ? '>' : ' ',
                    $manager->getMigrationClassName($timestamp),
                    $timestamp <= $oldestMigrationTimestamp ? '(executed)' : ''
                ), $timestamp <= $oldestMigrationTimestamp ? Project::MSG_VERBOSE : Project::MSG_INFO);
            }
        } else {
            $this->log(sprintf('No migration file found in "%s".', $dir));
            $this->log('Make sure you run the sql-diff task.');

            return false;
        }
        $migrationTimestamps = $manager->getValidMigrationTimestamps();
        $nbNotYetExecutedMigrations = count($migrationTimestamps);
        if (!$nbNotYetExecutedMigrations) {
            $this->log('All migration files were already executed - Nothing to migrate.');

            return false;
        }
        $this->log(sprintf(
            'Call the "migrate" task to execute %s',
            $countValidTimestamps == 1 ? 'it' : 'them'
        ));
    }
}
