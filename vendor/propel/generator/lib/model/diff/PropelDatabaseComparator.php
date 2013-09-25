<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license     MIT License
 */

require_once dirname(__FILE__) . '/../Database.php';
require_once dirname(__FILE__) . '/PropelDatabaseDiff.php';
require_once dirname(__FILE__) . '/PropelTableComparator.php';

/**
 * Service class for comparing Database objects
 * Heavily inspired by Doctrine2's Migrations
 * (see http://github.com/doctrine/dbal/tree/master/lib/Doctrine/DBAL/Schema/)
 *
 * @package     propel.generator.model.diff
 */
class PropelDatabaseComparator
{
    protected $databaseDiff;
    protected $fromDatabase;
    protected $toDatabase;

    public function __construct($databaseDiff = null)
    {
        $this->databaseDiff = (null === $databaseDiff) ? new PropelDatabaseDiff() : $databaseDiff;
    }

    public function getDatabaseDiff()
    {
        return $this->databaseDiff;
    }

    /**
     * Setter for the fromDatabase property
     *
     * @param Database $fromDatabase
     */
    public function setFromDatabase(Database $fromDatabase)
    {
        $this->fromDatabase = $fromDatabase;
    }

    /**
     * Getter for the fromDatabase property
     *
     * @return Database
     */
    public function getFromDatabase()
    {
        return $this->fromDatabase;
    }

    /**
     * Setter for the toDatabase property
     *
     * @param Database $toDatabase
     */
    public function setToDatabase(Database $toDatabase)
    {
        $this->toDatabase = $toDatabase;
    }

    /**
     * Getter for the toDatabase property
     *
     * @return Database
     */
    public function getToDatabase()
    {
        return $this->toDatabase;
    }

    /**
     * Compute and return the difference between two database objects
     *
     * @param Database $fromDatabase
     * @param Database $toDatabase
     * @param boolean  $caseInsensitive Whether the comparison is case insensitive.
     *                                  False by default.
     *
     * @return PropelDatabaseDiff|boolean return false if the two databases are similar
     */
    public static function computeDiff(Database $fromDatabase, Database $toDatabase, $caseInsensitive = false)
    {
        $dc = new self();
        $dc->setFromDatabase($fromDatabase);
        $dc->setToDatabase($toDatabase);
        $differences = 0;
        $differences += $dc->compareTables($caseInsensitive);

        return ($differences > 0) ? $dc->getDatabaseDiff() : false;
    }

    /**
     * Compare the tables of the fromDatabase and the toDatabase,
     * and modifies the inner databaseDiff if necessary.
     * Returns the number of differences.
     *
     * @param boolean $caseInsensitive Whether the comparison is case insensitive.
     *                                  False by default.
     *
     * @return integer The number of table differences
     */
    public function compareTables($caseInsensitive = false)
    {
        $fromDatabaseTables = $this->fromDatabase->getTables();
        $toDatabaseTables = $this->toDatabase->getTables();
        $databaseDifferences = 0;

        // check for new tables in $toDatabase
        foreach ($toDatabaseTables as $table) {
            if (!$this->fromDatabase->hasTable($table->getName(), $caseInsensitive) && !$table->isSkipSql()) {
                $this->databaseDiff->addAddedTable($table->getName(), $table);
                $databaseDifferences++;
            }
        }

        // check for removed tables in $toDatabase
        foreach ($fromDatabaseTables as $table) {
            if (!$this->toDatabase->hasTable($table->getName(), $caseInsensitive) && !$table->isSkipSql()) {
                $this->databaseDiff->addRemovedTable($table->getName(), $table);
                $databaseDifferences++;
            }
        }

        // check for table differences
        foreach ($fromDatabaseTables as $fromTable) {
            if ($this->toDatabase->hasTable($fromTable->getName(), $caseInsensitive)) {
                $toTable = $this->toDatabase->getTable($fromTable->getName(), $caseInsensitive);
                $databaseDiff = PropelTableComparator::computeDiff($fromTable, $toTable, $caseInsensitive);
                if ($databaseDiff) {
                    $this->databaseDiff->addModifiedTable($fromTable->getName(), $databaseDiff);
                    $databaseDifferences++;
                }
            }
        }

        // check for table renamings
        foreach ($this->databaseDiff->getAddedTables() as $addedTableName => $addedTable) {
            foreach ($this->databaseDiff->getRemovedTables() as $removedTableName => $removedTable) {
                if (!PropelTableComparator::computeDiff($addedTable, $removedTable, $caseInsensitive)) {
                    // no difference except the name, that's probably a renaming
                    $this->databaseDiff->addRenamedTable($removedTableName, $addedTableName);
                    $this->databaseDiff->removeAddedTable($addedTableName);
                    $this->databaseDiff->removeRemovedTable($removedTableName);
                    $databaseDifferences--;
                }
            }
        }

        return $databaseDifferences;
    }

}
