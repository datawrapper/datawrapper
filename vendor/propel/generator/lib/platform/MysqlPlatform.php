<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/DefaultPlatform.php';

/**
 * MySql PropelPlatformInterface implementation.
 *
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Martin Poeschl <mpoeschl@marmot.at> (Torque)
 * @version    $Revision$
 * @package    propel.generator.platform
 */
class MysqlPlatform extends DefaultPlatform
{

	/**
	 * @var        boolean whether the identifier quoting is enabled
	 */
	protected $isIdentifierQuotingEnabled = true;

	protected $tableEngineKeyword = 'ENGINE';  // overwritten in build.properties
	protected $defaultTableEngine = 'MyISAM';  // overwritten in build.properties

	/**
	 * Initializes db specific domain mapping.
	 */
	protected function initialize()
	{
		parent::initialize();
		$this->setSchemaDomainMapping(new Domain(PropelTypes::BOOLEAN, "TINYINT", 1));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::NUMERIC, "DECIMAL"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::LONGVARCHAR, "TEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::BINARY, "BLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::VARBINARY, "MEDIUMBLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::LONGVARBINARY, "LONGBLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::BLOB, "LONGBLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::CLOB, "LONGTEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::TIMESTAMP, "DATETIME"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::OBJECT, "TEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::PHP_ARRAY, "TEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::ENUM, "TINYINT"));
	}

	public function setGeneratorConfig(GeneratorConfig $generatorConfig)
	{
		if ($defaultTableEngine = $generatorConfig->getBuildProperty('mysqlTableType')) {
			$this->defaultTableEngine = $defaultTableEngine;
		}
		if ($tableEngineKeyword = $generatorConfig->getBuildProperty('mysqlTableEngineKeyword')) {
			$this->tableEngineKeyword = $tableEngineKeyword;
		}
	}

	/**
	 * Setter for the tableEngineKeyword property
	 *
	 * @param string $tableEngineKeyword
	 */
	function setTableEngineKeyword($tableEngineKeyword)
	{
		$this->tableEngineKeyword = $tableEngineKeyword;
	}

	/**
	 * Getter for the tableEngineKeyword property
	 *
	 * @return string
	 */
	function getTableEngineKeyword()
	{
		return $this->tableEngineKeyword;
	}

	/**
	 * Setter for the defaultTableEngine property
	 *
	 * @param string $defaultTableEngine
	 */
	function setDefaultTableEngine($defaultTableEngine)
	{
		$this->defaultTableEngine = $defaultTableEngine;
	}

	/**
	 * Getter for the defaultTableEngine property
	 *
	 * @return string
	 */
	function getDefaultTableEngine()
	{
		return $this->defaultTableEngine;
	}

	public function getAutoIncrement()
	{
		return "AUTO_INCREMENT";
	}

	public function getMaxColumnNameLength()
	{
		return 64;
	}

	public function supportsNativeDeleteTrigger()
	{
		return strtolower($this->getDefaultTableEngine()) == 'innodb';
	}

	public function getAddTablesDDL(Database $database)
	{
		$ret = $this->getBeginDDL();
		foreach ($database->getTablesForSql() as $table) {
			$ret .= $this->getCommentBlockDDL($table->getName());
			$ret .= $this->getDropTableDDL($table);
			$ret .= $this->getAddTableDDL($table);
		}
		$ret .= $this->getEndDDL();
		return $ret;
	}

	public function getBeginDDL()
	{
		return "
# This is a fix for InnoDB in MySQL >= 4.1.x
# It \"suspends judgement\" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;
";
	}

	public function getEndDDL()
	{
		return "
# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
";
	}

	public function getAddTableDDL(Table $table)
	{
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

		foreach ($table->getIndices() as $index ) {
			$lines[] = $this->getIndexDDL($index);
		}

		foreach ($table->getForeignKeys() as $foreignKey) {
			if ($foreignKey->isSkipSql()) {
				continue;
			}
			$lines[] = str_replace("
	", "
		", $this->getForeignKeyDDL($foreignKey));
		}

		$vendorSpecific = $table->getVendorInfoForType('mysql');
		if ($vendorSpecific->hasParameter('Type')) {
			$mysqlTableType = $vendorSpecific->getParameter('Type');
		} elseif ($vendorSpecific->hasParameter('Engine')) {
			$mysqlTableType = $vendorSpecific->getParameter('Engine');
		} else {
			$mysqlTableType = $this->getDefaultTableEngine();
		}

		$tableOptions = $this->getTableOptions($table);

		if ($table->getDescription()) {
			$tableOptions []= 'COMMENT=' . $this->quote($table->getDescription());
		}

		$tableOptions = $tableOptions ? ' ' . implode(' ', $tableOptions) : '';
		$sep = ",
	";

		$pattern = "
CREATE TABLE %s
(
	%s
) %s=%s%s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($table->getName()),
			implode($sep, $lines),
			$this->getTableEngineKeyword(),
			$mysqlTableType,
			$tableOptions
		);
	}

	protected function getTableOptions(Table $table)
	{
		$dbVI = $table->getDatabase()->getVendorInfoForType('mysql');
		$tableVI = $table->getVendorInfoForType('mysql');
		$vi = $dbVI->getMergedVendorInfo($tableVI);
		$tableOptions = array();
		// List of supported table options
		// see http://dev.mysql.com/doc/refman/5.5/en/create-table.html
		$supportedOptions = array(
			'AutoIncrement'   => 'AUTO_INCREMENT',
			'AvgRowLength'    => 'AVG_ROW_LENGTH',
			'Charset'         => 'CHARACTER SET',
			'Checksum'        => 'CHECKSUM',
			'Collate'         => 'COLLATE',
			'Connection'      => 'CONNECTION',
			'DataDirectory'   => 'DATA DIRECTORY',
			'Delay_key_write' => 'DELAY_KEY_WRITE',
			'DelayKeyWrite'   => 'DELAY_KEY_WRITE',
			'IndexDirectory'  => 'INDEX DIRECTORY',
			'InsertMethod'    => 'INSERT_METHOD',
			'KeyBlockSize'    => 'KEY_BLOCK_SIZE',
			'MaxRows'         => 'MAX_ROWS',
			'MinRows'         => 'MIN_ROWS',
			'Pack_Keys'       => 'PACK_KEYS',
			'PackKeys'        => 'PACK_KEYS',
			'RowFormat'       => 'ROW_FORMAT',
			'Union'           => 'UNION',
		);
		foreach ($supportedOptions as $name => $sqlName) {
			$parameterValue = NULL;

			if ($vi->hasParameter($name)) {
				$parameterValue = $vi->getParameter($name);
			} elseif ($vi->hasParameter($sqlName)) {
				$parameterValue = $vi->getParameter($sqlName);
			}

			if (!is_null($parameterValue)) {
				$parameterValue = is_numeric($parameterValue) ? $parameterValue : $this->quote($parameterValue);
				$tableOptions[] = sprintf('%s=%s', $sqlName, $parameterValue);
			}
		}

		return $tableOptions;
	}

	public function getDropTableDDL(Table $table)
	{
		return "
DROP TABLE IF EXISTS " . $this->quoteIdentifier($table->getName()) . ";
";
	}

	public function getColumnDDL(Column $col)
	{
		$domain = $col->getDomain();
		$sqlType = $domain->getSqlType();
		$notNullString = $this->getNullString($col->isNotNull());
		$defaultSetting = $this->getColumnDefaultValueDDL($col);

		// Special handling of TIMESTAMP/DATETIME types ...
		// See: http://propel.phpdb.org/trac/ticket/538
		if ($sqlType == 'DATETIME') {
			$def = $domain->getDefaultValue();
			if ($def && $def->isExpression()) { // DATETIME values can only have constant expressions
				$sqlType = 'TIMESTAMP';
			}
		} elseif ($sqlType == 'DATE') {
			$def = $domain->getDefaultValue();
			if ($def && $def->isExpression()) {
				throw new EngineException("DATE columns cannot have default *expressions* in MySQL.");
			}
		} elseif ($sqlType == 'TEXT' || $sqlType == 'BLOB') {
			if ($domain->getDefaultValue()) {
				throw new EngineException("BLOB and TEXT columns cannot have DEFAULT values. in MySQL.");
			}
		}

		$ddl = array($this->quoteIdentifier($col->getName()));
		if ($this->hasSize($sqlType) && $col->isDefaultSqlType($this)) {
			$ddl []= $sqlType . $domain->printSize();
		} else {
			$ddl []= $sqlType;
		}
		$colinfo = $col->getVendorInfoForType($this->getDatabaseType());
		if ($colinfo->hasParameter('Charset')) {
			$ddl []= 'CHARACTER SET '. $this->quote($colinfo->getParameter('Charset'));
		}
		if ($colinfo->hasParameter('Collation')) {
			$ddl []= 'COLLATE '. $this->quote($colinfo->getParameter('Collation'));
		} elseif ($colinfo->hasParameter('Collate')) {
			$ddl []= 'COLLATE '. $this->quote($colinfo->getParameter('Collate'));
		}
		if ($sqlType == 'TIMESTAMP') {
			if ($notNullString == '') {
				$notNullString = 'NULL';
			}
			if ($defaultSetting == '' && $notNullString == 'NOT NULL') {
				$defaultSetting = 'DEFAULT CURRENT_TIMESTAMP';
			}
			if ($notNullString) {
				$ddl []= $notNullString;
			}
			if ($defaultSetting) {
				$ddl []= $defaultSetting;
			}
		} else {
			if ($defaultSetting) {
				$ddl []= $defaultSetting;
			}
			if ($notNullString) {
				$ddl []= $notNullString;
			}
		}
		if ($autoIncrement = $col->getAutoIncrementString()) {
			$ddl []= $autoIncrement;
		}
		if ($col->getDescription()) {
			$ddl []= 'COMMENT ' . $this->quote($col->getDescription());
		}

		return implode(' ', $ddl);
	}

	/**
	 * Creates a comma-separated list of column names for the index.
	 * For MySQL unique indexes there is the option of specifying size, so we cannot simply use
	 * the getColumnsList() method.
	 * @param      Index $index
	 * @return     string
	 */
	protected function getIndexColumnListDDL(Index $index)
	{
		$list = array();
		foreach ($index->getColumns() as $col) {
			$list[] = $this->quoteIdentifier($col) . ($index->hasColumnSize($col) ? '(' . $index->getColumnSize($col) . ')' : '');
		}
		return implode(', ', $list);
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
ALTER TABLE %s DROP PRIMARY KEY;
";
		return sprintf($pattern,
			$this->quoteIdentifier($table->getName())
		);
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
			$this->getIndexType($index),
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
DROP INDEX %s ON %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($index->getName()),
			$this->quoteIdentifier($index->getTable()->getName())
		);
	}

	/**
	 * Builds the DDL SQL for an Index object.
	 * @return     string
	 */
	public function getIndexDDL(Index $index)
	{
		return sprintf('%sINDEX %s (%s)',
			$this->getIndexType($index),
			$this->quoteIdentifier($index->getName()),
			$this->getIndexColumnListDDL($index)
		);
	}

	protected function getIndexType(Index $index)
	{
		$type = '';
		$vendorInfo = $index->getVendorInfoForType($this->getDatabaseType());
		if ($vendorInfo && $vendorInfo->getParameter('Index_type')) {
			$type = $vendorInfo->getParameter('Index_type') . ' ';
		} elseif ($index->getIsUnique()) {
			$type = 'UNIQUE ';
		}
		return $type;
	}

	public function getUniqueDDL(Unique $unique)
	{
		return sprintf('UNIQUE INDEX %s (%s)',
			$this->quoteIdentifier($unique->getName()),
			$this->getIndexColumnListDDL($unique)
		);
	}

	public function getDropForeignKeyDDL(ForeignKey $fk)
	{
		if ($fk->isSkipSql()) {
			return;
		}
		$pattern = "
ALTER TABLE %s DROP FOREIGN KEY %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($fk->getTable()->getName()),
			$this->quoteIdentifier($fk->getName())
		);
	}

	public function getCommentBlockDDL($comment)
	{
		$pattern = "
-- ---------------------------------------------------------------------
-- %s
-- ---------------------------------------------------------------------
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

		foreach ($databaseDiff->getModifiedTables() as $tableDiff) {
			$ret .= $this->getModifyTableDDL($tableDiff);
		}

		foreach ($databaseDiff->getAddedTables() as $table) {
			$ret .= $this->getAddTableDDL($table);
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
RENAME TABLE %s TO %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($fromTableName),
			$this->quoteIdentifier($toTableName)
		);
	}

	/**
	 * Builds the DDL SQL to remove a column
	 *
	 * @return     string
	 */
	public function getRemoveColumnDDL(Column $column)
	{
		$pattern = "
ALTER TABLE %s DROP %s;
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
		return $this->getChangeColumnDDL($fromColumn, $toColumn);
	}

	/**
	 * Builds the DDL SQL to modify a column
	 *
	 * @return     string
	 */
	public function getModifyColumnDDL(PropelColumnDiff $columnDiff)
	{
		return $this->getChangeColumnDDL($columnDiff->getFromColumn(), $columnDiff->getToColumn());
	}

	/**
	 * Builds the DDL SQL to change a column
	 * @return     string
	 */
	public function getChangeColumnDDL($fromColumn, $toColumn)
	{
		$pattern = "
ALTER TABLE %s CHANGE %s %s;
";
		return sprintf($pattern,
			$this->quoteIdentifier($fromColumn->getTable()->getName()),
			$this->quoteIdentifier($fromColumn->getName()),
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
		$ret = '';
		foreach ($columnDiffs as $columnDiff) {
			$ret .= $this->getModifyColumnDDL($columnDiff);
		}

		return $ret;
	}


	/**
	 * @see        Platform::supportsSchemas()
	 */
	public function supportsSchemas()
	{
		return true;
	}

	public function hasSize($sqlType)
	{
		return !("MEDIUMTEXT" == $sqlType || "LONGTEXT" == $sqlType
				|| "BLOB" == $sqlType || "MEDIUMBLOB" == $sqlType
				|| "LONGBLOB" == $sqlType);
	}

	/**
	 * Escape the string for RDBMS.
	 * @param      string $text
	 * @return     string
	 */
	public function disconnectedEscapeText($text)
	{
		// mysql_escape_string doesn't work in PHP >= 5.4
		if (version_compare(PHP_VERSION, '5.4', '<') && function_exists('mysql_escape_string')) {
			return mysql_escape_string($text);
		} else {
			return addslashes($text);
		}
	}

	/**
	 * MySQL documentation says that identifiers cannot contain '.'. Thus it
	 * should be safe to split the string by '.' and quote each part individually
	 * to allow for a <schema>.<table> or <table>.<column> syntax.
	 *
	 * @param       string $text the identifier
	 * @return      string the quoted identifier
	 */
	public function quoteIdentifier($text)
	{
		return $this->isIdentifierQuotingEnabled ? '`' . strtr($text, array('.' => '`.`')) . '`' : $text;
	}

	public function getTimestampFormatter()
	{
		return 'Y-m-d H:i:s';
	}

	public function getColumnBindingPHP($column, $identifier, $columnValueAccessor, $tab = "			")
	{
		// FIXME - This is a temporary hack to get around apparent bugs w/ PDO+MYSQL
		// See http://pecl.php.net/bugs/bug.php?id=9919
		if ($column->getPDOType() == PDO::PARAM_BOOL) {
			return sprintf(
				"
%s\$stmt->bindValue(%s, (int) %s, PDO::PARAM_INT);",
				$tab,
				$identifier,
				$columnValueAccessor
			);
		}

		return parent::getColumnBindingPHP($column, $identifier, $columnValueAccessor, $tab);
	}

}
