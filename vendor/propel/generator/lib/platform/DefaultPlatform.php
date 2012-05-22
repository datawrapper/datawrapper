<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/PropelPlatformInterface.php';
require_once dirname(__FILE__) . '/../model/Column.php';
require_once dirname(__FILE__) . '/../model/Table.php';
require_once dirname(__FILE__) . '/../model/Domain.php';
require_once dirname(__FILE__) . '/../model/PropelTypes.php';

/**
 * Default implementation for the Platform interface.
 *
 * @author     Martin Poeschl <mpoeschl@marmot.at> (Torque)
 * @version    $Revision$
 * @package    propel.generator.platform
 */
class DefaultPlatform implements PropelPlatformInterface
{

	/**
	 * Mapping from Propel types to Domain objects.
	 *
	 * @var        array
	 */
	protected $schemaDomainMap;

	/**
	 * @var        PDO Database connection.
	 */
	protected $con;

	/**
	 * @var        boolean whether the identifier quoting is enabled
	 */
	protected $isIdentifierQuotingEnabled = false;

	/**
	 * Default constructor.
	 * @param      PDO $con Optional database connection to use in this platform.
	 */
	public function __construct(PDO $con = null)
	{
		if ($con) $this->setConnection($con);
		$this->initialize();
	}

	/**
	 * Set the database connection to use for this Platform class.
	 * @param      PDO $con Database connection to use in this platform.
	 */
	public function setConnection(PDO $con = null)
	{
		$this->con = $con;
	}

	/**
	 * Returns the database connection to use for this Platform class.
	 * @return     PDO The database connection or NULL if none has been set.
	 */
	public function getConnection()
	{
		return $this->con;
	}

	/**
	 * Sets the GeneratorConfig to use in the parsing.
	 *
	 * @param      GeneratorConfig $config
	 */
	public function setGeneratorConfig(GeneratorConfig $config)
	{
		// do nothing by default
	}

	/**
	 * Gets a specific propel (renamed) property from the build.
	 *
	 * @param      string $name
	 * @return     mixed
	 */
	protected function getBuildProperty($name)
	{
		if ($this->generatorConfig !== null) {
			return $this->generatorConfig->getBuildProperty($name);
		}
		return null;
	}

	/**
	 * Initialize the type -> Domain mapping.
	 */
	protected function initialize()
	{
		$this->schemaDomainMap = array();
		foreach (PropelTypes::getPropelTypes() as $type) {
			$this->schemaDomainMap[$type] = new Domain($type);
		}
		// BU_* no longer needed, so map these to the DATE/TIMESTAMP domains
		$this->schemaDomainMap[PropelTypes::BU_DATE] = new Domain(PropelTypes::DATE);
		$this->schemaDomainMap[PropelTypes::BU_TIMESTAMP] = new Domain(PropelTypes::TIMESTAMP);

		// Boolean is a bit special, since typically it must be mapped to INT type.
		$this->schemaDomainMap[PropelTypes::BOOLEAN] = new Domain(PropelTypes::BOOLEAN, "INTEGER");
	}

	/**
	 * Adds a mapping entry for specified Domain.
	 * @param      Domain $domain
	 */
	protected function setSchemaDomainMapping(Domain $domain)
	{
		$this->schemaDomainMap[$domain->getType()] = $domain;
	}

	/**
	 * Returns the short name of the database type that this platform represents.
	 * For example MysqlPlatform->getDatabaseType() returns 'mysql'.
	 * @return     string
	 */
	public function getDatabaseType()
	{
		$clazz = get_class($this);
		$pos = strpos($clazz, 'Platform');
		return strtolower(substr($clazz,0,$pos));
	}

	/**
	 * Returns the max column length supported by the db.
	 *
	 * @return     int The max column length
	 */
	public function getMaxColumnNameLength()
	{
		return 64;
	}

	/**
	 * Returns the native IdMethod (sequence|identity)
	 *
	 * @return     string The native IdMethod (PropelPlatformInterface:IDENTITY, PropelPlatformInterface::SEQUENCE).
	 */
	public function getNativeIdMethod()
	{
		return PropelPlatformInterface::IDENTITY;
	}

	public function isNativeIdMethodAutoIncrement()
	{
		return $this->getNativeIdMethod() == PropelPlatformInterface::IDENTITY;
	}

	/**
	 * Returns the db specific domain for a propelType.
	 *
	 * @param      string $propelType the Propel type name.
	 * @return     Domain The db specific domain.
	 */
	public function getDomainForType($propelType)
	{
		if (!isset($this->schemaDomainMap[$propelType])) {
			throw new EngineException("Cannot map unknown Propel type " . var_export($propelType, true) . " to native database type.");
		}
		return $this->schemaDomainMap[$propelType];
	}

	/**
	 * @return     string The RDBMS-specific SQL fragment for <code>NULL</code>
	 * or <code>NOT NULL</code>.
	 */
	public function getNullString($notNull)
	{
		return ($notNull ? "NOT NULL" : "");
	}

	/**
	 * @return     The RDBMS-specific SQL fragment for autoincrement.
	 */
	public function getAutoIncrement()
	{
		return "IDENTITY";
	}

	/**
	 * Gets the name to use for creating a sequence for a table.
	 *
	 * This will create a new name or use one specified in an id-method-parameter
	 * tag, if specified.
	 *
	 * @param      Table $table
	 *
	 * @return     string Sequence name for this table.
	 */
	public function getSequenceName(Table $table)
	{
		static $longNamesMap = array();
		$result = null;
		if ($table->getIdMethod() == IDMethod::NATIVE) {
			$idMethodParams = $table->getIdMethodParameters();
			$maxIdentifierLength = $this->getMaxColumnNameLength();
			if (empty($idMethodParams)) {
				if (strlen($table->getName() . "_SEQ") > $maxIdentifierLength) {
					if (!isset($longNamesMap[$table->getName()])) {
						$longNamesMap[$table->getName()] = strval(count($longNamesMap) + 1);
					}
					$result = substr($table->getName(), 0, $maxIdentifierLength - strlen("_SEQ_" . $longNamesMap[$table->getName()])) . "_SEQ_" . $longNamesMap[$table->getName()];
				}
				else {
					$result = substr($table->getName(), 0, $maxIdentifierLength -4) . "_SEQ";
				}
			} else {
				$result = substr($idMethodParams[0]->getValue(), 0, $maxIdentifierLength);
			}
		}
		return $result;
	}

	/**
	 * Builds the DDL SQL to add the tables of a database
	 * together with index and foreign keys
	 *
	 * @return     string
	 */
	public function getAddTablesDDL(Database $database)
	{
		$ret = $this->getBeginDDL();
		foreach ($database->getTablesForSql() as $table) {
			$ret .= $this->getCommentBlockDDL($table->getName());
			$ret .= $this->getDropTableDDL($table);
			$ret .= $this->getAddTableDDL($table);
			$ret .= $this->getAddIndicesDDL($table);
			$ret .= $this->getAddForeignKeysDDL($table);
		}
		$ret .= $this->getEndDDL();
		return $ret;
	}

	/**
	 * Gets the requests to execute at the beginning of a DDL file
	 *
	 * @return     string
	 */
	public function getBeginDDL()
	{
	}

	/**
	 * Gets the requests to execute at the end of a DDL file
	 *
	 * @return     string
	 */
	public function getEndDDL()
	{
	}

	/**
	 * Builds the DDL SQL to drop a table
	 * @return     string
	 */
	public function getDropTableDDL(Table $table)
	{
		return "
DROP TABLE " . $this->quoteIdentifier($table->getName()) . ";
";
	}

	/**
	 * Builds the DDL SQL to add a table
	 * without index and foreign keys
	 *
	 * @return     string
	 */
	public function getAddTableDDL(Table $table)
	{
		$tableDescription = $table->hasDescription() ? $this->getCommentLineDDL($table->getDescription()) : '';

		$lines = array();

		foreach ($table->getColumns() as $column) {
			$lines[] = $this->getColumnDDL($column);
		}

		if ($table->hasPrimaryKey()) {
			$lines[] = $this->getPrimaryKeyDDL($table);
		}

		foreach ($table->getUnices() as $unique) {
			$lines[] = $this->getUniqueDDL($unique);
		}

		$sep = ",
	";

		$pattern = "
%sCREATE TABLE %s
(
	%s
);
";
		return sprintf($pattern,
			$tableDescription,
			$this->quoteIdentifier($table->getName()),
			implode($sep, $lines)
		);
	}

	/**
	 * Builds the DDL SQL for a Column object.
	 * @return     string
	 */
	public function getColumnDDL(Column $col)
	{
		$domain = $col->getDomain();

		$ddl = array($this->quoteIdentifier($col->getName()));
		$sqlType = $domain->getSqlType();
		if ($this->hasSize($sqlType) && $col->isDefaultSqlType($this)) {
			$ddl []= $sqlType . $domain->printSize();
		} else {
			$ddl []= $sqlType;
		}
		if ($default = $this->getColumnDefaultValueDDL($col)) {
			$ddl []= $default;
		}
		if ($notNull = $this->getNullString($col->isNotNull())) {
			$ddl []= $notNull;
		}
		if ($autoIncrement = $col->getAutoIncrementString()) {
			$ddl []= $autoIncrement;
		}

		return implode(' ', $ddl);
	}

	/**
	 * Returns the SQL for the default value of a Column object
	 * @return     string
	 */
	public function getColumnDefaultValueDDL(Column $col)
	{
		$default = '';
		$defaultValue = $col->getDefaultValue();
		if ($defaultValue !== null) {
			$default .= 'DEFAULT ';
			if ($defaultValue->isExpression()) {
				$default .= $defaultValue->getValue();
			} else {
				if ($col->isTextType()) {
					$default .= $this->quote($defaultValue->getValue());
				} elseif ($col->getType() == PropelTypes::BOOLEAN || $col->getType() == PropelTypes::BOOLEAN_EMU) {
					$default .= $this->getBooleanString($defaultValue->getValue());
				} elseif ($col->getType() == PropelTypes::ENUM) {
					$default .= array_search($defaultValue->getValue(), $col->getValueSet());
				} else {
					$default .= $defaultValue->getValue();
				}
			}
		}

		return $default;
	}

	/**
	 * Creates a delimiter-delimited string list of column names, quoted using quoteIdentifier().
	 * @example
	 * <code>
	 * echo $platform->getColumnListDDL(array('foo', 'bar');
	 * // '"foo","bar"'
	 * </code>
	 * @param      array Column[] or string[]
	 * @param      string $delim The delimiter to use in separating the column names.
	 *
	 * @return     string
	 */
	public function getColumnListDDL($columns, $delimiter = ',')
	{
		$list = array();
		foreach ($columns as $column) {
			if ($column instanceof Column) {
				$column = $column->getName();
			}
			$list[] = $this->quoteIdentifier($column);
		}
		return implode($delimiter, $list);
	}

	/**
	 * Returns the name of a table primary key
	 * @return     string
	 */
	public function getPrimaryKeyName(Table $table)
	{
		$tableName = $table->getCommonName();
		return $tableName . '_PK';
	}

	/**
	 * Returns the SQL for the primary key of a Table object
	 * @return     string
	 */
	public function getPrimaryKeyDDL(Table $table)
	{
		if ($table->hasPrimaryKey()) {
			return 'PRIMARY KEY (' . $this->getColumnListDDL($table->getPrimaryKey()) . ')';
		}
	}

	/**
	 * Builds the DDL SQL to drop the primary key of a table.
	 *
	 * @param      Table $table
	 * @return     string
	 */
	public function getDropPrimaryKeyDDL(Table $table)
	{
		$pattern = "
ALTER TABLE %s DROP CONSTRAINT %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($table->getName()),
			$this->quoteIdentifier($this->getPrimaryKeyName($table))
		);
	}

	/**
	 * Builds the DDL SQL to add the primary key of a table.
	 *
	 * @param      Table $table
	 * @return     string
	 */
	public function getAddPrimaryKeyDDL(Table $table)
	{
		$pattern = "
ALTER TABLE %s ADD %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($table->getName()),
			$this->getPrimaryKeyDDL($table)
		);
	}

	/**
	 * Builds the DDL SQL to add the indices of a table.
	 *
	 * @param      Table $table
	 * @return     string
	 */
	public function getAddIndicesDDL(Table $table)
	{
		$ret = '';
		foreach ($table->getIndices() as $fk) {
			$ret .= $this->getAddIndexDDL($fk);
		}
		return $ret;
	}

	/**
	 * Builds the DDL SQL to add an Index.
	 *
	 * @param      Index $index
	 * @return     string
	 */
	public function getAddIndexDDL(Index $index)
	{
		$pattern = "
CREATE %sINDEX %s ON %s (%s);
";
		return sprintf($pattern,
			$index->getIsUnique() ? 'UNIQUE ' : '',
			$this->quoteIdentifier($index->getName()),
			$this->quoteIdentifier($index->getTable()->getName()),
			$this->getColumnListDDL($index->getColumns())
		);
	}

	/**
	 * Builds the DDL SQL to drop an Index.
	 *
	 * @param      Index $index
	 * @return     string
	 */
	public function getDropIndexDDL(Index $index)
	{
		$pattern = "
DROP INDEX %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($index->getName())
		);
	}

	/**
	 * Builds the DDL SQL for an Index object.
	 *
	 * @param      Index $index
	 * @return     string
	 */
	public function getIndexDDL(Index $index)
	{
		return sprintf('%sINDEX %s (%s)',
			$index->getIsUnique() ? 'UNIQUE ' : '',
			$this->quoteIdentifier($index->getName()),
			$this->getColumnListDDL($index->getColumns())
		);
	}

	/**
	 * Builds the DDL SQL for a Unique constraint object.
	 *
	 * @param      Unique $unique
	 * @return     string
	 */
	public function getUniqueDDL(Unique $unique)
	{
		return sprintf('UNIQUE (%s)' , $this->getColumnListDDL($unique->getColumns()));
	}

	/**
	 * Builds the DDL SQL to add the foreign keys of a table.
	 *
	 * @param      Table $table
	 * @return     string
	 */
	public function getAddForeignKeysDDL(Table $table)
	{
		$ret = '';
		foreach ($table->getForeignKeys() as $fk) {
			$ret .= $this->getAddForeignKeyDDL($fk);
		}
		return $ret;
	}

	/**
	 * Builds the DDL SQL to add a foreign key.
	 *
	 * @param      ForeignKey $fk
	 * @return     string
	 */
	public function getAddForeignKeyDDL(ForeignKey $fk)
	{
		if ($fk->isSkipSql()) {
			return;
		}
		$pattern = "
ALTER TABLE %s ADD %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($fk->getTable()->getName()),
			$this->getForeignKeyDDL($fk)
		);
	}

	/**
	 * Builds the DDL SQL to drop a foreign key.
	 *
	 * @param      ForeignKey $fk
	 * @return     string
	 */
	public function getDropForeignKeyDDL(ForeignKey $fk)
	{
		if ($fk->isSkipSql()) {
			return;
		}
		$pattern = "
ALTER TABLE %s DROP CONSTRAINT %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($fk->getTable()->getName()),
			$this->quoteIdentifier($fk->getName())
		);
	}

	/**
	 * Builds the DDL SQL for a ForeignKey object.
	 * @return     string
	 */
	public function getForeignKeyDDL(ForeignKey $fk)
	{
		if ($fk->isSkipSql()) {
			return;
		}
		$pattern = "CONSTRAINT %s
	FOREIGN KEY (%s)
	REFERENCES %s (%s)";
		$script = sprintf($pattern,
			$this->quoteIdentifier($fk->getName()),
			$this->getColumnListDDL($fk->getLocalColumns()),
			$this->quoteIdentifier($fk->getForeignTableName()),
			$this->getColumnListDDL($fk->getForeignColumns())
		);
		if ($fk->hasOnUpdate()) {
			$script .= "
	ON UPDATE " . $fk->getOnUpdate();
		}
		if ($fk->hasOnDelete()) {
			$script .= "
	ON DELETE " . $fk->getOnDelete();
		}

		return $script;
	}

	public function getCommentLineDDL($comment)
	{
		$pattern = "-- %s
";
		return sprintf($pattern, $comment);
	}

	public function getCommentBlockDDL($comment)
	{
		$pattern = "
-----------------------------------------------------------------------
-- %s
-----------------------------------------------------------------------
";
		return sprintf($pattern, $comment);
	}

	/**
	 * Builds the DDL SQL to modify a database
	 * based on a PropelDatabaseDiff instance
	 *
	 * @return     string
	 */
	public function getModifyDatabaseDDL(PropelDatabaseDiff $databaseDiff)
	{
		$ret = $this->getBeginDDL();

		foreach ($databaseDiff->getRemovedTables() as $table) {
			$ret .= $this->getDropTableDDL($table);
		}

		foreach ($databaseDiff->getRenamedTables() as $fromTableName => $toTableName) {
			$ret .= $this->getRenameTableDDL($fromTableName, $toTableName);
		}

		foreach ($databaseDiff->getAddedTables() as $table) {
			$ret .= $this->getAddTableDDL($table);
			$ret .= $this->getAddIndicesDDL($table);
		}

		foreach ($databaseDiff->getModifiedTables() as $tableDiff) {
			$ret .= $this->getModifyTableDDL($tableDiff);
		}

		foreach ($databaseDiff->getAddedTables() as $table) {
			$ret .= $this->getAddForeignKeysDDL($table);
		}

		$ret .= $this->getEndDDL();

		return $ret;
	}

	/**
	 * Builds the DDL SQL to rename a table
	 * @return     string
	 */
	public function getRenameTableDDL($fromTableName, $toTableName)
	{
		$pattern = "
ALTER TABLE %s RENAME TO %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($fromTableName),
			$this->quoteIdentifier($toTableName)
		);
	}

	/**
	 * Builds the DDL SQL to alter a table
	 * based on a PropelTableDiff instance
	 *
	 * @return     string
	 */
	public function getModifyTableDDL(PropelTableDiff $tableDiff)
	{
		$ret = '';

		// drop indices, foreign keys
		if ($tableDiff->hasModifiedPk()) {
			$ret .= $this->getDropPrimaryKeyDDL($tableDiff->getFromTable());
		}
		foreach ($tableDiff->getRemovedFks() as $fk) {
			$ret .= $this->getDropForeignKeyDDL($fk);
		}
		foreach ($tableDiff->getModifiedFks() as $fkName => $fkModification) {
			list($fromFk, $toFk) = $fkModification;
			$ret .= $this->getDropForeignKeyDDL($fromFk);
		}
		foreach ($tableDiff->getRemovedIndices() as $index) {
			$ret .= $this->getDropIndexDDL($index);
		}
		foreach ($tableDiff->getModifiedIndices() as $indexName => $indexModification) {
			list($fromIndex, $toIndex) = $indexModification;
			$ret .= $this->getDropIndexDDL($fromIndex);
		}

		// alter table structure
		foreach ($tableDiff->getRenamedColumns() as $columnRenaming) {
			$ret .= $this->getRenameColumnDDL($columnRenaming[0], $columnRenaming[1]);
		}
		if ($modifiedColumns = $tableDiff->getModifiedColumns()) {
			$ret .= $this->getModifyColumnsDDL($modifiedColumns);
		}
		if ($addedColumns = $tableDiff->getAddedColumns()) {
			$ret .= $this->getAddColumnsDDL($addedColumns);
		}
		foreach ($tableDiff->getRemovedColumns() as $column) {
			$ret .= $this->getRemoveColumnDDL($column);
		}

		// add new indices and foreign keys
		if ($tableDiff->hasModifiedPk()) {
			$ret .= $this->getAddPrimaryKeyDDL($tableDiff->getToTable());
		}
		foreach ($tableDiff->getModifiedIndices() as $indexName => $indexModification) {
			list($fromIndex, $toIndex) = $indexModification;
			$ret .= $this->getAddIndexDDL($toIndex);
		}
		foreach ($tableDiff->getAddedIndices() as $index) {
			$ret .= $this->getAddIndexDDL($index);
		}
		foreach ($tableDiff->getModifiedFks() as $fkName => $fkModification) {
			list($fromFk, $toFk) = $fkModification;
			$ret .= $this->getAddForeignKeyDDL($toFk);
		}
		foreach ($tableDiff->getAddedFks() as $fk) {
			$ret .= $this->getAddForeignKeyDDL($fk);
		}

		return $ret;
	}

	/**
	 * Builds the DDL SQL to alter a table
	 * based on a PropelTableDiff instance
	 *
	 * @return     string
	 */
	public function getModifyTableColumnsDDL(PropelTableDiff $tableDiff)
	{
		$ret = '';

		foreach ($tableDiff->getRemovedColumns() as $column) {
			$ret .= $this->getRemoveColumnDDL($column);
		}

		foreach ($tableDiff->getRenamedColumns() as $columnRenaming) {
			$ret .= $this->getRenameColumnDDL($columnRenaming[0], $columnRenaming[1]);
		}

		if ($modifiedColumns = $tableDiff->getModifiedColumns()) {
			$ret .= $this->getModifyColumnsDDL($modifiedColumns);
		}

		if ($addedColumns = $tableDiff->getAddedColumns()) {
			$ret .= $this->getAddColumnsDDL($addedColumns);
		}

		return $ret;
	}

	/**
	 * Builds the DDL SQL to alter a table's primary key
	 * based on a PropelTableDiff instance
	 *
	 * @return     string
	 */
	public function getModifyTablePrimaryKeyDDL(PropelTableDiff $tableDiff)
	{
		$ret = '';

		if ($tableDiff->hasModifiedPk()) {
			$ret .= $this->getDropPrimaryKeyDDL($tableDiff->getFromTable());
			$ret .= $this->getAddPrimaryKeyDDL($tableDiff->getToTable());
		}

		return $ret;
	}

	/**
	 * Builds the DDL SQL to alter a table's indices
	 * based on a PropelTableDiff instance
	 *
	 * @return     string
	 */
	public function getModifyTableIndicesDDL(PropelTableDiff $tableDiff)
	{
		$ret = '';

		foreach ($tableDiff->getRemovedIndices() as $index) {
			$ret .= $this->getDropIndexDDL($index);
		}

		foreach ($tableDiff->getAddedIndices() as $index) {
			$ret .= $this->getAddIndexDDL($index);
		}

		foreach ($tableDiff->getModifiedIndices() as $indexName => $indexModification) {
			list($fromIndex, $toIndex) = $indexModification;
			$ret .= $this->getDropIndexDDL($fromIndex);
			$ret .= $this->getAddIndexDDL($toIndex);
		}

		return $ret;
	}

	/**
	 * Builds the DDL SQL to alter a table's foreign keys
	 * based on a PropelTableDiff instance
	 *
	 * @return     string
	 */
	public function getModifyTableForeignKeysDDL(PropelTableDiff $tableDiff)
	{
		$ret = '';

		foreach ($tableDiff->getRemovedFks() as $fk) {
			$ret .= $this->getDropForeignKeyDDL($fk);
		}

		foreach ($tableDiff->getAddedFks() as $fk) {
			$ret .= $this->getAddForeignKeyDDL($fk);
		}

		foreach ($tableDiff->getModifiedFks() as $fkName => $fkModification) {
			list($fromFk, $toFk) = $fkModification;
			$ret .= $this->getDropForeignKeyDDL($fromFk);
			$ret .= $this->getAddForeignKeyDDL($toFk);
		}

		return $ret;
	}

	/**
	 * Builds the DDL SQL to remove a column
	 *
	 * @return     string
	 */
	public function getRemoveColumnDDL(Column $column)
	{
		$pattern = "
ALTER TABLE %s DROP COLUMN %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($column->getTable()->getName()),
			$this->quoteIdentifier($column->getName())
		);
	}

	/**
	 * Builds the DDL SQL to rename a column
	 * @return     string
	 */
	public function getRenameColumnDDL($fromColumn, $toColumn)
	{
		$pattern = "
ALTER TABLE %s RENAME COLUMN %s TO %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($fromColumn->getTable()->getName()),
			$this->quoteIdentifier($fromColumn->getName()),
			$this->quoteIdentifier($toColumn->getName())
		);
	}

	/**
	 * Builds the DDL SQL to modify a column
	 *
	 * @return     string
	 */
	public function getModifyColumnDDL(PropelColumnDiff $columnDiff)
	{
		$toColumn = $columnDiff->getToColumn();
		$pattern = "
ALTER TABLE %s MODIFY %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($toColumn->getTable()->getName()),
			$this->getColumnDDL($toColumn)
		);
	}

	/**
	 * Builds the DDL SQL to modify a list of columns
	 *
	 * @return     string
	 */
	public function getModifyColumnsDDL($columnDiffs)
	{
		$lines = array();
		$tableName = null;
		foreach ($columnDiffs as $columnDiff) {
			$toColumn = $columnDiff->getToColumn();
			if (null === $tableName) {
				$tableName = $toColumn->getTable()->getName();
			}
			$lines []= $this->getColumnDDL($toColumn);
		}

		$sep = ",
	";

		$pattern = "
ALTER TABLE %s MODIFY
(
	%s
);
";
		return sprintf($pattern,
			$this->quoteIdentifier($tableName),
			implode($sep, $lines)
		);
	}

	/**
	 * Builds the DDL SQL to remove a column
	 *
	 * @return     string
	 */
	public function getAddColumnDDL(Column $column)
	{
		$pattern = "
ALTER TABLE %s ADD %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($column->getTable()->getName()),
			$this->getColumnDDL($column)
		);
	}

	/**
	 * Builds the DDL SQL to remove a list of columns
	 *
	 * @return     string
	 */
	public function getAddColumnsDDL($columns)
	{
		$lines = array();
		$tableName = null;
		foreach ($columns as $column) {
			if (null === $tableName) {
				$tableName = $column->getTable()->getName();
			}
			$lines []= $this->getColumnDDL($column);
		}

		$sep = ",
	";

		$pattern = "
ALTER TABLE %s ADD
(
	%s
);
";
		return sprintf($pattern,
			$this->quoteIdentifier($tableName),
			implode($sep, $lines)
		);
	}

	/**
	 * Returns if the RDBMS-specific SQL type has a size attribute.
	 *
	 * @param      string $sqlType the SQL type
	 * @return     boolean True if the type has a size attribute
	 */
	public function hasSize($sqlType)
	{
		return true;
	}

	/**
	 * Returns if the RDBMS-specific SQL type has a scale attribute.
	 *
	 * @param      string $sqlType the SQL type
	 * @return     boolean True if the type has a scale attribute
	 */
	public function hasScale($sqlType)
	{
		return true;
	}

	/**
	 * Quote and escape needed characters in the string for unerlying RDBMS.
	 * @param      string $text
	 * @return     string
	 */
	public function quote($text)
	{
		if ($con = $this->getConnection()) {
			return $con->quote($text);
		} else {
			return "'" . $this->disconnectedEscapeText($text) . "'";
		}
	}

	/**
	 * Method to escape text when no connection has been set.
	 *
	 * The subclasses can implement this using string replacement functions
	 * or native DB methods.
	 *
	 * @param      string $text Text that needs to be escaped.
	 * @return     string
	 */
	protected function disconnectedEscapeText($text)
	{
		return str_replace("'", "''", $text);
	}

	/**
	 * Quotes identifiers used in database SQL.
	 * @param      string $text
	 * @return     string Quoted identifier.
	 */
	public function quoteIdentifier($text)
	{
		return $this->isIdentifierQuotingEnabled ? '"' . strtr($text, array('.' => '"."')) . '"' : $text;
	}

	public function setIdentifierQuoting($enabled = true)
	{
		$this->isIdentifierQuotingEnabled = $enabled;
	}

	public function getIdentifierQuoting()
	{
		return $this->isIdentifierQuotingEnabled;
	}

	/**
	 * Whether RDBMS supports native ON DELETE triggers (e.g. ON DELETE CASCADE).
	 * @return     boolean
	 */
	public function supportsNativeDeleteTrigger()
	{
		return false;
	}

	/**
	 * Whether RDBMS supports INSERT null values in autoincremented primary keys
	 * @return     boolean
	 */
	public function supportsInsertNullPk()
	{
		return true;
	}

	/**
	 * Whether the underlying PDO driver for this platform returns BLOB columns as streams (instead of strings).
	 * @return     boolean
	 */
	public function hasStreamBlobImpl()
	{
		return false;
	}

	/**
	 * @see        Platform::supportsSchemas()
	 */
	public function supportsSchemas()
	{
		return false;
	}

	/**
	 * @see        Platform::supportsMigrations()
	 */
	public function supportsMigrations()
	{
		return true;
	}


	public function supportsVarcharWithoutSize()
	{
		return false;
	}
	/**
	 * Returns the boolean value for the RDBMS.
	 *
	 * This value should match the boolean value that is set
	 * when using Propel's PreparedStatement::setBoolean().
	 *
	 * This function is used to set default column values when building
	 * SQL.
	 *
	 * @param      mixed $tf A boolean or string representation of boolean ('y', 'true').
	 * @return     mixed
	 */
	public function getBooleanString($b)
	{
		$b = ($b === true || strtolower($b) === 'true' || $b === 1 || $b === '1' || strtolower($b) === 'y' || strtolower($b) === 'yes');
		return ($b ? '1' : '0');
	}

	/**
	 * Gets the preferred timestamp formatter for setting date/time values.
	 * @return     string
	 */
	public function getTimestampFormatter()
	{
		return 'Y-m-d H:i:s';
	}

	/**
	 * Gets the preferred time formatter for setting date/time values.
	 * @return     string
	 */
	public function getTimeFormatter()
	{
		return 'H:i:s';
	}

	/**
	 * Gets the preferred date formatter for setting date/time values.
	 * @return     string
	 */
	public function getDateFormatter()
	{
		return 'Y-m-d';
	}

	/**
	 * Get the PHP snippet for binding a value to a column.
	 * Warning: duplicates logic from DBAdapter::bindValue().
	 * Any code modification here must be ported there.
	 */
	public function getColumnBindingPHP($column, $identifier, $columnValueAccessor, $tab = "			")
	{
		$script = '';
		$hasValuePreparation = false;
		if ($column->isTemporalType()) {
			// nothing special, the internal value was already properly formatted by the setter
		} elseif ($column->isLobType()) {
			// we always need to make sure that the stream is rewound, otherwise nothing will
			// get written to database.
			$script .= "
if (is_resource($columnValueAccessor)) {
	rewind($columnValueAccessor);
}";
		}

		$script .= sprintf(
			"
\$stmt->bindValue(%s, %s, %s);",
			$identifier,
			$columnValueAccessor ,
			PropelTypes::getPdoTypeString($column->getType())
		);

		return preg_replace('/^(.+)/m', $tab . '$1', $script);
	}

	/**
	 * Get the PHP snippet for getting a Pk from the database.
	 * Warning: duplicates logic from DBAdapter::getId().
	 * Any code modification here must be ported there.
	 *
	 * Typical output:
	 * <code>
	 * $this->id = $con->lastInsertId();
	 * </code>
	 */
	public function getIdentifierPhp($columnValueMutator, $connectionVariableName = '$con', $sequenceName = '', $tab = "			")
	{
		return sprintf(
			"
%s%s = %s->lastInsertId(%s);",
			$tab,
			$columnValueMutator,
			$connectionVariableName,
			$sequenceName ? ("'" . $sequenceName . "'") : ''
		);
	}
}
