<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/PlatformTestProvider.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/platform/SqlitePlatform.php';

/**
 *
 * @package    generator.platform
 */
class SqlitePlatformTest extends PlatformTestProvider
{
	/**
	 * Get the Platform object for this class
	 *
	 * @return     Platform
	 */
	protected function getPlatform()
	{
		return new SqlitePlatform();
	}

	public function testQuoteConnected()
	{
		$p = $this->getPlatform();
		$p->setConnection(new PDO("sqlite::memory:"));

		$unquoted = "Naughty ' string";
		$quoted = $p->quote($unquoted);

		$expected = "'Naughty '' string'";
		$this->assertEquals($expected, $quoted);
	}

	public function testGetSequenceNameDefault()
	{
		$table = new Table('foo');
		$table->setIdMethod(IDMethod::NATIVE);
		$expected = 'foo_SEQ';
		$this->assertEquals($expected, $this->getPlatform()->getSequenceName($table));
	}

	public function testGetSequenceNameCustom()
	{
		$table = new Table('foo');
		$table->setIdMethod(IDMethod::NATIVE);
		$idMethodParameter = new IdMethodParameter();
		$idMethodParameter->setValue('foo_sequence');
		$table->addIdMethodParameter($idMethodParameter);
		$table->setIdMethod(IDMethod::NATIVE);
		$expected = 'foo_sequence';
		$this->assertEquals($expected, $this->getPlatform()->getSequenceName($table));
	}

	/**
	 * @dataProvider providerForTestGetAddTablesDDL
	 */
	public function testGetAddTablesDDL($schema)
	{
		$database = $this->getDatabaseFromSchema($schema);
		$expected = <<<EOF

-----------------------------------------------------------------------
-- book
-----------------------------------------------------------------------

DROP TABLE IF EXISTS book;

CREATE TABLE book
(
	id INTEGER NOT NULL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	author_id INTEGER
);

CREATE INDEX book_I_1 ON book (title);

-- SQLite does not support foreign keys; this is just for reference
-- FOREIGN KEY (author_id) REFERENCES author (id)

-----------------------------------------------------------------------
-- author
-----------------------------------------------------------------------

DROP TABLE IF EXISTS author;

CREATE TABLE author
(
	id INTEGER NOT NULL PRIMARY KEY,
	first_name VARCHAR(100),
	last_name VARCHAR(100)
);

EOF;
		$this->assertEquals($expected, $this->getPlatform()->getAddTablesDDL($database));
	}

	/**
	 * @dataProvider providerForTestGetAddTablesSkipSQLDDL
	 */
	public function testGetAddTablesSkipSQLDDL($schema)
	{
		$database = $this->getDatabaseFromSchema($schema);
		$expected = '';
		$this->assertEquals($expected, $this->getPlatform()->getAddTablesDDL($database));
	}

	/**
	 * @dataProvider providerForTestGetAddTableDDLSimplePK
	 */
	public function testGetAddTableDDLSimplePK($schema)
	{
		$table = $this->getTableFromSchema($schema);
		$expected = "
-- This is foo table
CREATE TABLE foo
(
	id INTEGER NOT NULL PRIMARY KEY,
	bar VARCHAR(255) NOT NULL
);
";
		$this->assertEquals($expected, $this->getPlatform()->getAddTableDDL($table));
	}
	
	/**
	 * @dataProvider providerForTestGetAddTableDDLNonIntegerPK
	 */
	public function testGetAddTableDDLNonIntegerPK($schema)
	{
		$table = $this->getTableFromSchema($schema);
		$expected = "
-- This is foo table
CREATE TABLE foo
(
	foo VARCHAR(255) NOT NULL,
	bar VARCHAR(255) NOT NULL,
	PRIMARY KEY (foo)
);
";
		$this->assertEquals($expected, $this->getPlatform()->getAddTableDDL($table));
	}

	/**
	 * @dataProvider providerForTestGetAddTableDDLCompositePK
	 */
	public function testGetAddTableDDLCompositePK($schema)
	{
		$table = $this->getTableFromSchema($schema);
		$expected = "
CREATE TABLE foo
(
	foo INTEGER NOT NULL,
	bar INTEGER NOT NULL,
	baz VARCHAR(255) NOT NULL,
	PRIMARY KEY (foo,bar)
);
";
		$this->assertEquals($expected, $this->getPlatform()->getAddTableDDL($table));
	}

	/**
	 * @dataProvider providerForTestGetAddTableDDLUniqueIndex
	 */
	public function testGetAddTableDDLUniqueIndex($schema)
	{
		$table = $this->getTableFromSchema($schema);
		$expected = "
CREATE TABLE foo
(
	id INTEGER NOT NULL PRIMARY KEY,
	bar INTEGER,
	UNIQUE (bar)
);
";
		$this->assertEquals($expected, $this->getPlatform()->getAddTableDDL($table));
	}

	public function testGetDropTableDDL()
	{
		$table = new Table('foo');
		$expected = "
DROP TABLE IF EXISTS foo;
";
		$this->assertEquals($expected, $this->getPlatform()->getDropTableDDL($table));
	}

	public function testGetColumnDDL()
	{
		$c = new Column('foo');
		$c->getDomain()->copy($this->getPlatform()->getDomainForType('DOUBLE'));
		$c->getDomain()->replaceScale(2);
		$c->getDomain()->replaceSize(3);
		$c->setNotNull(true);
		$c->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$expected = 'foo DOUBLE(3,2) DEFAULT 123 NOT NULL';
		$this->assertEquals($expected, $this->getPlatform()->getColumnDDL($c));
	}

	public function testGetColumnDDLCustomSqlType()
	{
		$column = new Column('foo');
		$column->getDomain()->copy($this->getPlatform()->getDomainForType('DOUBLE'));
		$column->getDomain()->replaceScale(2);
		$column->getDomain()->replaceSize(3);
		$column->setNotNull(true);
		$column->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$column->getDomain()->replaceSqlType('DECIMAL(5,6)');
		$expected = 'foo DECIMAL(5,6) DEFAULT 123 NOT NULL';
		$this->assertEquals($expected, $this->getPlatform()->getColumnDDL($column));
	}

	public function testGetPrimaryKeyDDLSimpleKey()
	{
		$table = new Table('foo');
		$column = new Column('bar');
		$column->setPrimaryKey(true);
		$table->addColumn($column);
		$expected = 'PRIMARY KEY (bar)';
		$this->assertEquals($expected, $this->getPlatform()->getPrimaryKeyDDL($table));
	}

	public function testGetPrimaryKeyDDLCompositeKey()
	{
		$table = new Table('foo');
		$column1 = new Column('bar1');
		$column1->setPrimaryKey(true);
		$table->addColumn($column1);
		$column2 = new Column('bar2');
		$column2->setPrimaryKey(true);
		$table->addColumn($column2);
		$expected = 'PRIMARY KEY (bar1,bar2)';
		$this->assertEquals($expected, $this->getPlatform()->getPrimaryKeyDDL($table));
	}

	/**
	 * @dataProvider providerForTestPrimaryKeyDDL
	 */
	public function testGetDropPrimaryKeyDDL($table)
	{
		// not supported by SQLite
		$expected = '';
		$this->assertEquals($expected, $this->getPlatform()->getDropPrimaryKeyDDL($table));
	}

	/**
	 * @dataProvider providerForTestPrimaryKeyDDL
	 */
	public function testGetAddPrimaryKeyDDL($table)
	{
		// not supported by SQLite
		$expected = '';
		$this->assertEquals($expected, $this->getPlatform()->getAddPrimaryKeyDDL($table));
	}

	/**
	 * @dataProvider providerForTestGetIndicesDDL
	 */
	public function testAddIndicesDDL($table)
	{
		$expected = "
CREATE INDEX babar ON foo (bar1,bar2);

CREATE INDEX foo_index ON foo (bar1);
";
		$this->assertEquals($expected, $this->getPLatform()->getAddIndicesDDL($table));
	}

	/**
	 * @dataProvider providerForTestGetIndexDDL
	 */
	public function testAddIndexDDL($index)
	{
		$expected = "
CREATE INDEX babar ON foo (bar1,bar2);
";
		$this->assertEquals($expected, $this->getPLatform()->getAddIndexDDL($index));
	}

	/**
	 * @dataProvider providerForTestGetIndexDDL
	 */
	public function testDropIndexDDL($index)
	{
		$expected = "
DROP INDEX babar;
";
		$this->assertEquals($expected, $this->getPLatform()->getDropIndexDDL($index));
	}

	/**
	 * @dataProvider providerForTestGetIndexDDL
	 */
	public function testGetIndexDDL($index)
	{
		$expected = 'INDEX babar (bar1,bar2)';
		$this->assertEquals($expected, $this->getPLatform()->getIndexDDL($index));
	}

	/**
	 * @dataProvider providerForTestGetUniqueDDL
	 */
	public function testGetUniqueDDL($index)
	{
		$expected = 'UNIQUE (bar1,bar2)';
		$this->assertEquals($expected, $this->getPlatform()->getUniqueDDL($index));
	}

	/**
	 * @dataProvider providerForTestGetForeignKeysDDL
	 */
	public function testGetAddForeignKeysDDL($table)
	{
		$expected = "
-- SQLite does not support foreign keys; this is just for reference
-- FOREIGN KEY (bar_id) REFERENCES bar (id)

-- SQLite does not support foreign keys; this is just for reference
-- FOREIGN KEY (baz_id) REFERENCES baz (id)
";
		$this->assertEquals($expected, $this->getPLatform()->getAddForeignKeysDDL($table));
	}

	/**
	 * @dataProvider providerForTestGetForeignKeyDDL
	 */
	public function testGetAddForeignKeyDDL($fk)
	{
		$expected = "
-- SQLite does not support foreign keys; this is just for reference
-- FOREIGN KEY (bar_id) REFERENCES bar (id)
";
		$this->assertEquals($expected, $this->getPLatform()->getAddForeignKeyDDL($fk));
	}

	/**
	 * @dataProvider providerForTestGetForeignKeyDDL
	 */
	public function testGetDropForeignKeyDDL($fk)
	{
		$expected = '';
		$this->assertEquals($expected, $this->getPLatform()->getDropForeignKeyDDL($fk));
	}

	/**
	 * @dataProvider providerForTestGetForeignKeyDDL
	 */
	public function testGetForeignKeyDDL($fk)
	{
		$expected = "
-- SQLite does not support foreign keys; this is just for reference
-- FOREIGN KEY (bar_id) REFERENCES bar (id)
";
		$this->assertEquals($expected, $this->getPLatform()->getForeignKeyDDL($fk));
	}

	public function testGetCommentBlockDDL()
	{
		$expected = "
-----------------------------------------------------------------------
-- foo bar
-----------------------------------------------------------------------
";
		$this->assertEquals($expected, $this->getPLatform()->getCommentBlockDDL('foo bar'));
	}

}
