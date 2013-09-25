<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/ArchivableBehaviorObjectBuilderModifier.php';
require_once dirname(__FILE__) . '/ArchivableBehaviorQueryBuilderModifier.php';

/**
 * Keeps tracks of an ActiveRecord object, even after deletion
 *
 * @author    Francois Zaninotto
 * @version		$Revision$
 * @package		propel.generator.archivable
 */
class ArchivableBehavior extends Behavior
{
    // default parameters value
    protected $parameters = array(
        'archive_table'       => '',
        'archive_phpname'     => NULL,
        'archive_class'       => '',
        'log_archived_at'     => 'true',
        'archived_at_column'  => 'archived_at',
        'archive_on_insert'   => 'false',
        'archive_on_update'   => 'false',
        'archive_on_delete'   => 'true',
    );

    protected $archiveTable;
    protected $objectBuilderModifier;
    protected $queryBuilderModifier;

    public function modifyDatabase()
    {
        foreach ($this->getDatabase()->getTables() as $table) {
            if ($table->hasBehavior($this->getName())) {
                // don't add the same behavior twice
                continue;
            }
            if (property_exists($table, 'isArchiveTable')) {
                // don't add the behavior to archive tables
                continue;
            }
            $b = clone $this;
            $table->addBehavior($b);
        }
    }

    public function modifyTable()
    {
        if ($this->getParameter('archive_class') && $this->getParameter('archive_table')) {
            throw new InvalidArgumentException('Please set only one of the two parameters "archive_class" and "archive_table".');
        }
        if (!$this->getParameter('archive_class')) {
            $this->addArchiveTable();
        }
    }

    protected function addArchiveTable()
    {
        $table = $this->getTable();
        $database = $table->getDatabase();
        $archiveTableName = $this->getParameter('archive_table') ? $this->getParameter('archive_table') : ($this->getTable()->getName() . '_archive');
        if (!$database->hasTable($archiveTableName)) {
            // create the version table
            $archiveTable = $database->addTable(array(
                'name'      => $archiveTableName,
                'phpName'   => $this->getParameter('archive_phpname'),
                'package'   => $table->getPackage(),
                'schema'    => $table->getSchema(),
                'namespace' => $table->getNamespace() ? '\\' . $table->getNamespace() : null,
            ));
            $archiveTable->isArchiveTable = true;
            // copy all the columns
            foreach ($table->getColumns() as $column) {
                $columnInArchiveTable = clone $column;
                if ($columnInArchiveTable->hasReferrers()) {
                    $columnInArchiveTable->clearReferrers();
                }
                if ($columnInArchiveTable->isAutoincrement()) {
                    $columnInArchiveTable->setAutoIncrement(false);
                }
                $archiveTable->addColumn($columnInArchiveTable);
            }
            // add archived_at column
            if ($this->getParameter('log_archived_at') == 'true') {
                $archiveTable->addColumn(array(
                    'name' => $this->getParameter('archived_at_column'),
                    'type' => 'TIMESTAMP'
                ));
            }
            // do not copy foreign keys
            // copy the indices
            foreach ($table->getIndices() as $index) {
                $copiedIndex = clone $index;
                $copiedIndex->setName('');
                $archiveTable->addIndex($copiedIndex);
            }
            // copy unique indices to indices
            // see https://github.com/propelorm/Propel/issues/175 for details
            foreach ($table->getUnices() as $unique) {
                $index = new Index();
                foreach ($unique->getColumns() as $columnName) {
                    if ($size = $unique->getColumnSize($columnName)) {
                        $index->addColumn(array('name' => $columnName, 'size' => $size));
                    } else {
                        $index->addColumn(array('name' => $columnName));
                    }
                }
                $archiveTable->addIndex($index);
            }
            // every behavior adding a table should re-execute database behaviors
            foreach ($database->getBehaviors() as $behavior) {
                $behavior->modifyDatabase();
            }
            $this->archiveTable = $archiveTable;
        } else {
            $this->archiveTable = $database->getTable($archiveTableName);
        }
    }

    /**
     * @return Table
     */
    public function getArchiveTable()
    {
        return $this->archiveTable;
    }

    public function getArchiveTablePhpName($builder)
    {
        if ($this->hasArchiveClass()) {
            return $this->getParameter('archive_class');
        }

        return $builder->getNewStubObjectBuilder($this->getArchiveTable())->getClassname();
    }

    public function getArchiveTableQueryName($builder)
    {
        if ($this->hasArchiveClass()) {
            return $this->getParameter('archive_class') . 'Query';
        }

        return $builder->getNewStubQueryBuilder($this->getArchiveTable())->getClassname();
    }

    public function hasArchiveClass()
    {
        return $this->getParameter('archive_class') != '';
    }

    /**
     * @return Column
     */
    public function getArchivedAtColumn()
    {
        if ($this->getArchiveTable() && $this->getParameter('log_archived_at') == 'true') {
            return $this->getArchiveTable()->getColumn($this->getParameter('archived_at_column'));
        }
    }

    public function isArchiveOnInsert()
    {
        return $this->getParameter('archive_on_insert') == 'true';
    }

    public function isArchiveOnUpdate()
    {
        return $this->getParameter('archive_on_update') == 'true';
    }

    public function isArchiveOnDelete()
    {
        return $this->getParameter('archive_on_delete') == 'true';
    }

    public function getObjectBuilderModifier()
    {
        if (is_null($this->objectBuilderModifier)) {
            $this->objectBuilderModifier = new ArchivableBehaviorObjectBuilderModifier($this);
        }

        return $this->objectBuilderModifier;
    }

    public function getQueryBuilderModifier()
    {
        if (is_null($this->queryBuilderModifier)) {
            $this->queryBuilderModifier = new ArchivableBehaviorQueryBuilderModifier($this);
        }

        return $this->queryBuilderModifier;
    }
}
