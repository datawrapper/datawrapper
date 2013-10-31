<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Service class for validating XML schemas.
 * Only implements validation rules that cannot be implemented in XSD.
 *
 * @example Basic usage:
 * <code>
 * $validator = new PropelSchemaValidator($appData);
 * if (!$validator->validate()) {
 *   throw new Exception("Invalid schema:\n" . join("\n", $validator->getErrors()));
 * }
 * </code>
 *
 * @package    propel.generator.util
 * @author     François Zaninotto
 */
class PropelSchemaValidator
{
    protected $appData;
    protected $errors = array();

    public function __construct(AppData $appData)
    {
        $this->appData = $appData;
    }

    /**
     * @return boolean true if valid, false otherwise
     */
    public function validate()
    {
        foreach ($this->appData->getDatabases() as $database) {
            $this->validateDatabaseTables($database);
        }

        return count($this->errors) == 0;
    }

    protected function validateDatabaseTables(Database $database)
    {
        $phpNames = array();
        $namespaces = array();
        foreach ($database->getTables() as $table) {
            $list = &$phpNames;
            if ($table->getNamespace()) {
                if (!isset($namespaces[$table->getNamespace()])) {
                    $namespaces[$table->getNamespace()] = array();
                }

                $list = &$namespaces[$table->getNamespace()];
            }
            if (in_array($table->getPhpName(), $list)) {
                $this->errors[] = sprintf('Table "%s" declares a phpName already used in another table', $table->getName());
            }
            $list[]= $table->getPhpName();
            $this->validateTableAttributes($table);
            $this->validateTableColumns($table);
        }
    }

    protected function validateTableAttributes(Table $table)
    {
        $reservedTableNames = array('table_name');
        $tableName = strtolower($table->getName());
        if (in_array($tableName, $reservedTableNames)) {
            $this->errors[] = sprintf('Table "%s" uses a reserved keyword as name', $table->getName());
        }
        if ($table->getIsCrossRef()) {
            $fkTables = array();
            foreach ($table->getForeignKeys() as $fk) {
                $foreignTableName = $fk->getForeignTableName();
                if (isset($fkTables[$foreignTableName])) {
                    $this->errors[] = sprintf('Table "%s" implements an equal nest relationship for table "%s". This feature is not supported', $table->getName(), $foreignTableName);
                    break;
                }
                $fkTables[$foreignTableName] = true;
            }
        }
    }

    protected function validateTableColumns(Table $table)
    {
        if (!$table->hasPrimaryKey() && !$table->isSkipSql()) {
            $this->errors[] = sprintf('Table "%s" does not have a primary key defined. Propel requires all tables to have a primary key.', $table->getName());
        }
        $phpNames = array();
        foreach ($table->getColumns() as $column) {
            if (in_array($column->getPhpName(), $phpNames)) {
                $this->errors[] = sprintf('Column "%s" declares a phpName already used in table "%s"', $column->getName(), $table->getName());
            }
            $phpNames[]= $column->getPhpName();
        }
    }

    /**
     * @return array A list of error messages
     */
    public function getErrors()
    {
        return $this->errors;
    }

}
