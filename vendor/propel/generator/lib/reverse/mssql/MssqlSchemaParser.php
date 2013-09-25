<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../BaseSchemaParser.php';

/**
 * Microsoft SQL Server database schema parser.
 *
 * @author     Hans Lellelid <hans@xmpl.org>
 * @version    $Revision$
 * @package    propel.generator.reverse.mssql
 */
class MssqlSchemaParser extends BaseSchemaParser
{

    /**
     * Map MSSQL native types to Propel types.
     * @var        array
     */
    private static $mssqlTypeMap = array(
        "binary" => PropelTypes::BINARY,
        "bit" => PropelTypes::BOOLEAN,
        "char" => PropelTypes::CHAR,
        "datetime" => PropelTypes::TIMESTAMP,
        "decimal() identity"  => PropelTypes::DECIMAL,
        "decimal"  => PropelTypes::DECIMAL,
        "image" => PropelTypes::LONGVARBINARY,
        "int" => PropelTypes::INTEGER,
        "int identity" => PropelTypes::INTEGER,
        "integer" => PropelTypes::INTEGER,
        "money" => PropelTypes::DECIMAL,
        "nchar" => PropelTypes::CHAR,
        "ntext" => PropelTypes::LONGVARCHAR,
        "numeric() identity" => PropelTypes::NUMERIC,
        "numeric" => PropelTypes::NUMERIC,
        "nvarchar" => PropelTypes::VARCHAR,
        "real" => PropelTypes::REAL,
        "float" => PropelTypes::FLOAT,
        "smalldatetime" => PropelTypes::TIMESTAMP,
        "smallint" => PropelTypes::SMALLINT,
        "smallint identity" => PropelTypes::SMALLINT,
        "smallmoney" => PropelTypes::DECIMAL,
        "sysname" => PropelTypes::VARCHAR,
        "text" => PropelTypes::LONGVARCHAR,
        "timestamp" => PropelTypes::BINARY,
        "tinyint identity" => PropelTypes::TINYINT,
        "tinyint" => PropelTypes::TINYINT,
        "uniqueidentifier" => PropelTypes::CHAR,
        "varbinary" => PropelTypes::VARBINARY,
        "varbinary(max)" => PropelTypes::CLOB,
        "varchar" => PropelTypes::VARCHAR,
        "varchar(max)" => PropelTypes::CLOB,
        "uniqueidentifier" => PropelTypes::CHAR,
    // SQL Server 2000 only
        "bigint identity" => PropelTypes::BIGINT,
        "bigint" => PropelTypes::BIGINT,
        "sql_variant" => PropelTypes::VARCHAR,
    );

  /**
   * @see        BaseSchemaParser::getTypeMapping()
   */
    protected function getTypeMapping()
    {
        return self::$mssqlTypeMap;
    }

    /**
     *
     */
    public function parse(Database $database, Task $task = null)
    {
        $stmt = $this->dbh->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME <> 'dtproperties'");

        // First load the tables (important that this happen before filling out details of tables)
        $tables = array();
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $name = $this->cleanDelimitedIdentifiers($row[0]);
            if ($name == $this->getMigrationTable()) {
                continue;
            }
            $table = new Table($name);
            $table->setIdMethod($database->getDefaultIdMethod());
            $database->addTable($table);
            $tables[] = $table;
        }

        // Now populate only columns.
        foreach ($tables as $table) {
            $this->addColumns($table);
        }

        // Now add indexes and constraints.
        foreach ($tables as $table) {
            $this->addForeignKeys($table);
            $this->addIndexes($table);
            $this->addPrimaryKey($table);
        }

        return count($tables);
    }

    /**
     * Adds Columns to the specified table.
     *
     * @param Table $table The Table model class to add columns to.
     */
    protected function addColumns(Table $table)
    {
        $stmt = $this->dbh->query("sp_columns '" . $table->getName() . "'");

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

            $name = $this->cleanDelimitedIdentifiers($row['COLUMN_NAME']);
            $type = $row['TYPE_NAME'];
            $size = $row['LENGTH'];
            $is_nullable = $row['NULLABLE'];
            $default = $row['COLUMN_DEF'];
            $precision = $row['PRECISION'];
            $scale = $row['SCALE'];
            $autoincrement = false;
            if (strtolower($type) == "int identity") {
                $autoincrement = true;
            }

            $propelType = $this->getMappedPropelType($type);
            if (!$propelType) {
                $propelType = Column::DEFAULT_TYPE;
                $this->warn("Column [" . $table->getName() . "." . $name. "] has a column type (".$type.") that Propel does not support.");
            }

            $column = new Column($name);
            $column->setTable($table);
            $column->setDomainForType($propelType);
            // We may want to provide an option to include this:
            // $column->getDomain()->replaceSqlType($type);
            $column->getDomain()->replaceSize($size);
            $column->getDomain()->replaceScale($scale);
            if ($default !== null) {
                $column->getDomain()->setDefaultValue(new ColumnDefaultValue($default, ColumnDefaultValue::TYPE_VALUE));
            }
            $column->setAutoIncrement($autoincrement);
            $column->setNotNull(!$is_nullable);

            $table->addColumn($column);
        }
    }

    /**
     * Load foreign keys for this table.
     */
    protected function addForeignKeys(Table $table)
    {
        $database = $table->getDatabase();

        $stmt = $this->dbh->query("SELECT ccu1.TABLE_NAME, ccu1.COLUMN_NAME, ccu2.TABLE_NAME AS FK_TABLE_NAME, ccu2.COLUMN_NAME AS FK_COLUMN_NAME
                                    FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu1 INNER JOIN
                                            INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc1 ON tc1.CONSTRAINT_NAME = ccu1.CONSTRAINT_NAME AND
                                            CONSTRAINT_TYPE = 'Foreign Key' INNER JOIN
                                            INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc1 ON rc1.CONSTRAINT_NAME = tc1.CONSTRAINT_NAME INNER JOIN
                                            INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu2 ON ccu2.CONSTRAINT_NAME = rc1.UNIQUE_CONSTRAINT_NAME
                                    WHERE (ccu1.table_name = '".$table->getName()."')");

        $foreignKeys = array(); // local store to avoid duplicates
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

            $lcol = $this->cleanDelimitedIdentifiers($row['COLUMN_NAME']);
            $ftbl = $this->cleanDelimitedIdentifiers($row['FK_TABLE_NAME']);
            $fcol = $this->cleanDelimitedIdentifiers($row['FK_COLUMN_NAME']);

            $foreignTable = $database->getTable($ftbl);
            $foreignColumn = $foreignTable->getColumn($fcol);
            $localColumn   = $table->getColumn($lcol);

            if (!isset($foreignKeys[$name])) {
                $fk = new ForeignKey($name);
                $fk->setForeignTableCommonName($foreignTable->getCommonName());
                $fk->setForeignSchemaName($foreignTable->getSchema());
                //$fk->setOnDelete($fkactions['ON DELETE']);
                //$fk->setOnUpdate($fkactions['ON UPDATE']);
                $table->addForeignKey($fk);
                $foreignKeys[$name] = $fk;
            }
            $foreignKeys[$name]->addReference($localColumn, $foreignColumn);
        }

    }

    /**
     * Load indexes for this table
     */
    protected function addIndexes(Table $table)
    {
        $stmt = $this->dbh->query("sp_indexes_rowset '" . $table->getName() . "'");

        $indexes = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $colName = $this->cleanDelimitedIdentifiers($row["COLUMN_NAME"]);
            $name = $this->cleanDelimitedIdentifiers($row['INDEX_NAME']);

            // FIXME -- Add UNIQUE support
            if (!isset($indexes[$name])) {
                $indexes[$name] = new Index($name);
                $table->addIndex($indexes[$name]);
            }

            $indexes[$name]->addColumn($table->getColumn($colName));
        }
    }

    /**
     * Loads the primary key for this table.
     */
    protected function addPrimaryKey(Table $table)
    {
        $stmt = $this->dbh->query("SELECT COLUMN_NAME
                        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                                INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ON
                        INFORMATION_SCHEMA.TABLE_CONSTRAINTS.CONSTRAINT_NAME = INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE.constraint_name
                        WHERE     (INFORMATION_SCHEMA.TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'PRIMARY KEY') AND
                        (INFORMATION_SCHEMA.TABLE_CONSTRAINTS.TABLE_NAME = '".$table->getName()."')");

        // Loop through the returned results, grouping the same key_name together
        // adding each column for that key.
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $name = $this->cleanDelimitedIdentifiers($row[0]);
            $table->getColumn($name)->setPrimaryKey(true);
        }
    }

  /**
   * according to the identifier definition, we have to clean simple quote (') around the identifier name
   * returns by mssql
   * @see http://msdn.microsoft.com/library/ms175874.aspx
   *
   * @param string $identifier
   * @return string
   */
  protected function cleanDelimitedIdentifiers($identifier)
  {
    return preg_replace('/^\'(.*)\'$/U', '$1', $identifier);
  }

}
