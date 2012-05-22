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
 * SQLite PropelPlatformInterface implementation.
 *
 * @author     Hans Lellelid <hans@xmpl.org>
 * @version    $Revision$
 * @package    propel.generator.platform
 */
class SqlitePlatform extends DefaultPlatform
{

	/**
	 * Initializes db specific domain mapping.
	 */
	protected function initialize()
	{
		parent::initialize();
		$this->setSchemaDomainMapping(new Domain(PropelTypes::NUMERIC, "DECIMAL"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::LONGVARCHAR, "MEDIUMTEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::DATE, "DATETIME"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::BINARY, "BLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::VARBINARY, "MEDIUMBLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::LONGVARBINARY, "LONGBLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::BLOB, "LONGBLOB"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::CLOB, "LONGTEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::OBJECT, "MEDIUMTEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::PHP_ARRAY, "MEDIUMTEXT"));
		$this->setSchemaDomainMapping(new Domain(PropelTypes::ENUM, "TINYINT"));
	}

	/**
	 * @link       http://www.sqlite.org/autoinc.html
	 */
	public function getAutoIncrement()
	{
		return "PRIMARY KEY";
	}

	public function getMaxColumnNameLength()
	{
		return 1024;
	}

	public function getAddTableDDL(Table $table)
	{
		$tableDescription = $table->hasDescription() ? $this->getCommentLineDDL($table->getDescription()) : '';

		$lines = array();

		foreach ($table->getColumns() as $column) {
			$lines[] = $this->getColumnDDL($column);
		}

		if ($table->hasPrimaryKey()) {
		  $pk = $table->getPrimaryKey();
		  if (count($pk) > 1 || !$pk[0]->isAutoIncrement()) {
		    $lines[] = $this->getPrimaryKeyDDL($table);
		  }
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

	public function getDropPrimaryKeyDDL(Table $table)
	{
		// FIXME: not supported by SQLite
		return '';
	}

	public function getAddPrimaryKeyDDL(Table $table)
	{
		// FIXME: not supported by SQLite
		return '';
	}

	public function getAddForeignKeyDDL(ForeignKey $fk)
	{
		// no need for an alter table to return comments
		return $this->getForeignKeyDDL($fk);
	}

	public function getDropForeignKeyDDL(ForeignKey $fk)
	{
		return '';
	}

	public function getDropTableDDL(Table $table)
	{
		return "
DROP TABLE IF EXISTS " . $this->quoteIdentifier($table->getName()) . ";
";
	}

	public function getForeignKeyDDL(ForeignKey $fk)
	{
		$pattern = "
-- SQLite does not support foreign keys; this is just for reference
-- FOREIGN KEY (%s) REFERENCES %s (%s)
";
		return sprintf($pattern,
			$this->getColumnListDDL($fk->getLocalColumns()),
			$fk->getForeignTableName(),
			$this->getColumnListDDL($fk->getForeignColumns())
		);
	}

	public function hasSize($sqlType) {
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
		if (function_exists('sqlite_escape_string')) {
			return sqlite_escape_string($text);
		} else {
			return parent::disconnectedEscapeText($text);
		}
	}

	public function quoteIdentifier($text)
	{
		return $this->isIdentifierQuotingEnabled ? '[' . $text . ']' : $text;
	}

	/**
	 * @see        Platform::supportsMigrations()
	 */
	public function supportsMigrations()
	{
		return false;
	}

}
