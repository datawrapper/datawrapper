<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license     MIT License
 */

require_once dirname(__FILE__) . '/../Database.php';
require_once dirname(__FILE__) . '/PropelTableDiff.php';

/**
 * Value object for storing Database object diffs
 * Heavily inspired by Doctrine2's Migrations
 * (see http://github.com/doctrine/dbal/tree/master/lib/Doctrine/DBAL/Schema/)
 *
 * @package    propel.generator.model.diff
 */
class PropelDatabaseDiff
{
    protected $addedTables = array();
    protected $removedTables = array();
    protected $modifiedTables = array();
    protected $renamedTables = array();

    /**
     * Setter for the addedTables property
     *
     * @param array $addedTables
     */
    public function setAddedTables($addedTables)
    {
        $this->addedTables = $addedTables;
    }

    /**
     * Add an added table
     *
     * @param string $tableName
     * @param Table  $addedTable
     */
    public function addAddedTable($tableName, Table $addedTable)
    {
        $this->addedTables[$tableName] = $addedTable;
    }

    /**
     * Remove an added table
     *
     * @param string $tableName
     */
    public function removeAddedTable($tableName)
    {
        unset($this->addedTables[$tableName]);
    }

    /**
     * Getter for the addedTables property
     *
     * @return array
     */
    public function getAddedTables()
    {
        return $this->addedTables;
    }

    /**
     * Get the number of added tables
     *
     * @return integer
     */
    public function countAddedTables()
    {
        return count($this->addedTables);
    }

    /**
     * Get an added table
     *
     * @param string $tableName
     *
     * @param Table
     */
    public function getAddedTable($tableName)
    {
        return $this->addedTables[$tableName];
    }

    /**
     * Setter for the removedTables property
     *
     * @param array $removedTables
     */
    public function setRemovedTables($removedTables)
    {
        $this->removedTables = $removedTables;
    }

    /**
     * Add a removed table
     *
     * @param string $tableName
     * @param Table  $removedTable
     */
    public function addRemovedTable($tableName, Table $removedTable)
    {
        $this->removedTables[$tableName] = $removedTable;
    }

    /**
     * Remove a removed table
     *
     * @param string $tableName
     */
    public function removeRemovedTable($tableName)
    {
        unset($this->removedTables[$tableName]);
    }

    /**
     * Getter for the removedTables property
     *
     * @return array
     */
    public function getRemovedTables()
    {
        return $this->removedTables;
    }

    /**
     * Get the number of removed tables
     *
     * @return integer
     */
    public function countRemovedTables()
    {
        return count($this->removedTables);
    }

    /**
     * Get a removed table
     *
     * @param string $tableName
     *
     * @param Table
     */
    public function getRemovedTable($tableName)
    {
        return $this->removedTables[$tableName];
    }

    /**
     * Setter for the modifiedTables property
     *
     * @param array $modifiedTables
     */
    public function setModifiedTables($modifiedTables)
    {
        $this->modifiedTables = $modifiedTables;
    }

    /**
     * Add a table difference
     *
     * @param string          $tableName
     * @param PropelTableDiff $modifiedTable
     */
    public function addModifiedTable($tableName, PropelTableDiff $modifiedTable)
    {
        $this->modifiedTables[$tableName] = $modifiedTable;
    }

    /**
     * Get the number of modified tables
     *
     * @return integer
     */
    public function countModifiedTables()
    {
        return count($this->modifiedTables);
    }

    /**
     * Getter for the modifiedTables property
     *
     * @return array
     */
    public function getModifiedTables()
    {
        return $this->modifiedTables;
    }

    /**
     * Setter for the renamedTables property
     *
     * @param array $renamedTables
     */
    public function setRenamedTables($renamedTables)
    {
        $this->renamedTables = $renamedTables;
    }

    /**
     * Add a renamed table
     *
     * @param string $fromName
     * @param string $toName
     */
    public function addRenamedTable($fromName, $toName)
    {
        $this->renamedTables[$fromName] = $toName;
    }

    /**
     * Getter for the renamedTables property
     *
     * @return array
     */
    public function getRenamedTables()
    {
        return $this->renamedTables;
    }

    /**
     * Get the number of renamed tables
     *
     * @return integer
     */
    public function countRenamedTables()
    {
        return count($this->renamedTables);
    }

    /**
     * Get the reverse diff for this diff
     *
     * @return PropelDatabaseDiff
     */
    public function getReverseDiff()
    {
        $diff = new self();
        $diff->setAddedTables($this->getRemovedTables());
        // idMethod is not set for tables build from reverse engineering
        // FIXME: this should be handled by reverse classes
        foreach ($diff->getAddedTables() as $name => $table) {
            if ($table->getIdMethod() == IDMethod::NO_ID_METHOD) {
                $table->setIdMethod(IDMethod::NATIVE);
            }
        }
        $diff->setRemovedTables($this->getAddedTables());
        $diff->setRenamedTables(array_flip($this->getRenamedTables()));
        $tableDiffs = array();
        foreach ($this->getModifiedTables() as $name => $tableDiff) {
            $tableDiffs[$name] = $tableDiff->getReverseDiff();
        }
        $diff->setModifiedTables($tableDiffs);

        return $diff;
    }

    /**
     * Get a description of the database modifications
     *
     * @return string
     */
    public function getDescription()
    {
        $changes = array();
        if ($count = $this->countAddedTables()) {
            $changes []= sprintf('%d added tables', $count);
        }
        if ($count = $this->countRemovedTables()) {
            $changes []= sprintf('%d removed tables', $count);
        }
        if ($count = $this->countModifiedTables()) {
            $changes []= sprintf('%d modified tables', $count);
        }
        if ($count = $this->countRenamedTables()) {
            $changes []= sprintf('%d renamed tables', $count);
        }

        return implode(', ', $changes);
    }

    public function __toString()
    {
        $ret = '';
        if ($addedTables = $this->getAddedTables()) {
            $ret .= "addedTables:\n";
            foreach ($addedTables as $tableName => $table) {
                $ret .= sprintf("  - %s\n", $tableName);
            }
        }
        if ($removedTables = $this->getRemovedTables()) {
            $ret .= "removedTables:\n";
            foreach ($removedTables as $tableName => $table) {
                $ret .= sprintf("  - %s\n", $tableName);
            }
        }
        if ($modifiedTables = $this->getModifiedTables()) {
            $ret .= "modifiedTables:\n";
            foreach ($modifiedTables as $tableName => $tableDiff) {
                $ret .= $tableDiff->__toString();
            }
        }
        if ($renamedTables = $this->getRenamedTables()) {
            $ret .= "renamedTables:\n";
            foreach ($renamedTables as $fromName => $toName) {
                $ret .= sprintf("  %s: %s\n", $fromName, $toName);
            }
        }

        return $ret;
    }

}
