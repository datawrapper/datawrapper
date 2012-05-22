<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/PlatformTestBase.php';

/**
 * provider for platform DDL unit tests
 * @package    generator.platform
 */
abstract class PlatformTestProvider extends PlatformTestBase
{

	public function providerForTestGetAddTablesDDL()
	{
		$schema = <<<EOF
<database name="test">
	<table name="book">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="title" type="VARCHAR" size="255" required="true" />
		<index>
			<index-column name="title" />
		</index>
		<column name="author_id" type="INTEGER"/>
		<foreign-key foreignTable="author">
			<reference local="author_id" foreign="id" />
		</foreign-key>
	</table>
	<table name="author">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="first_name" type="VARCHAR" size="100" />
		<column name="last_name" type="VARCHAR" size="100" />
	</table>
</database>
EOF;
		return array(array($schema));
	}

	public function providerForTestGetAddTablesDDLSchema()
	{
		$schema = <<<EOF
<database name="test" schema="x">
	<table name="book">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="title" type="VARCHAR" size="255" required="true" />
		<index>
			<index-column name="title" />
		</index>
		<column name="author_id" type="INTEGER"/>
		<foreign-key foreignTable="author" foreignSchema="y">
			<reference local="author_id" foreign="id" />
		</foreign-key>
	</table>
	<table name="author" schema="y">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="first_name" type="VARCHAR" size="100" />
		<column name="last_name" type="VARCHAR" size="100" />
	</table>
	<table name="book_summary">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
		<column name="book_id" required="true" type="INTEGER" />
		<column name="summary" required="true" type="LONGVARCHAR" />
		<foreign-key foreignTable="book" onDelete="cascade">
			<reference local="book_id" foreign="id" />
		</foreign-key>
	</table>
</database>
EOF;
		return array(array($schema));
	}

	public function providerForTestGetAddTablesSkipSQLDDL()
	{
		$schema = <<<EOF
<database name="test">
	<table name="book" skipSql="true">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="title" type="VARCHAR" size="255" required="true" />
		<index>
			<index-column name="title" />
		</index>
		<column name="author_id" type="INTEGER"/>
		<foreign-key foreignTable="author">
			<reference local="author_id" foreign="id" />
		</foreign-key>
	</table>
	<table name="author" skipSql="true">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="first_name" type="VARCHAR" size="100" />
		<column name="last_name" type="VARCHAR" size="100" />
	</table>
</database>
EOF;
		return array(array($schema));
	}

	public function providerForTestGetAddTableDDLSimplePK()
	{
		$schema = <<<EOF
<database name="test">
	<table name="foo" description="This is foo table">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="VARCHAR" size="255" required="true" />
	</table>
</database>
EOF;
		return array(array($schema));
	}
	
	public function providerForTestGetAddTableDDLNonIntegerPK()
	{
		$schema = <<<EOF
<database name="test">
	<table name="foo" description="This is foo table">
		<column name="foo" primaryKey="true" type="VARCHAR" />
		<column name="bar" type="VARCHAR" size="255" required="true" />
	</table>
</database>
EOF;
		return array(array($schema));
	}

	public function providerForTestGetAddTableDDLCompositePK()
	{
		$schema = <<<EOF
<database name="test">
	<table name="foo">
		<column name="foo" primaryKey="true" type="INTEGER" />
		<column name="bar" primaryKey="true" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="255" required="true" />
	</table>
</database>
EOF;
		return array(array($schema));
	}

	public function providerForTestGetAddTableDDLUniqueIndex()
	{
		$schema = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<unique>
			<unique-column name="bar" />
		</unique>
	</table>
</database>
EOF;
		return array(array($schema));
	}

	public function providerForTestGetAddTableDDLSchema()
	{
		$schema = <<<EOF
<database name="test">
	<table name="foo" schema="Woopah">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
	</table>
</database>
EOF;
		return array(array($schema));
	}


	public function providerForTestGetUniqueDDL()
	{
		$table = new Table('foo');
		$column1 = new Column('bar1');
		$column1->getDomain()->copy(new Domain('FOOTYPE'));
		$table->addColumn($column1);
		$column2 = new Column('bar2');
		$column2->getDomain()->copy(new Domain('BARTYPE'));
		$table->addColumn($column2);
		$index = new Unique('babar');
		$index->addColumn($column1);
		$index->addColumn($column2);
		$table->addUnique($index);

		return array(
			array($index)
		);
	}

	public function providerForTestGetIndicesDDL()
	{
		$table = new Table('foo');
		$column1 = new Column('bar1');
		$column1->getDomain()->copy(new Domain('FOOTYPE'));
		$table->addColumn($column1);
		$column2 = new Column('bar2');
		$column2->getDomain()->copy(new Domain('BARTYPE'));
		$table->addColumn($column2);
		$index1 = new Index('babar');
		$index1->addColumn($column1);
		$index1->addColumn($column2);
		$table->addIndex($index1);
		$index2 = new Index('foo_index');
		$index2->addColumn($column1);
		$table->addIndex($index2);

		return array(
			array($table)
		);
	}

	public function providerForTestGetIndexDDL()
	{
		$table = new Table('foo');
		$column1 = new Column('bar1');
		$column1->getDomain()->copy(new Domain('FOOTYPE'));
		$table->addColumn($column1);
		$column2 = new Column('bar2');
		$column2->getDomain()->copy(new Domain('BARTYPE'));
		$table->addColumn($column2);
		$index = new Index('babar');
		$index->addColumn($column1);
		$index->addColumn($column2);
		$table->addIndex($index);

		return array(
			array($index)
		);
	}

	public function providerForTestPrimaryKeyDDL()
	{
		$table = new Table('foo');
		$column = new Column('bar');
		$column->setPrimaryKey(true);
		$table->addColumn($column);
		return array(
			array($table)
		);
	}

	public function providerForTestGetForeignKeyDDL()
	{
		$table1 = new Table('foo');
		$column1 = new Column('bar_id');
		$column1->getDomain()->copy(new Domain('FOOTYPE'));
		$table1->addColumn($column1);
		$table2 = new Table('bar');
		$column2 = new Column('id');
		$column2->getDomain()->copy(new Domain('BARTYPE'));
		$table2->addColumn($column2);
		$fk = new ForeignKey('foo_bar_FK');
		$fk->setForeignTableCommonName('bar');
		$fk->addReference($column1, $column2);
		$fk->setOnDelete('CASCADE');
		$table1->addForeignKey($fk);
		return array(
			array($fk)
		);
	}

	public function providerForTestGetForeignKeySkipSqlDDL()
	{
		$arr = self::providerForTestGetForeignKeyDDL();
		$fk = $arr[0][0];
		$fk->setSkipSql(true);
		return array(
			array($fk)
		);
	}

	public function providerForTestGetForeignKeysDDL()
	{
		$table1 = new Table('foo');

		$column1 = new Column('bar_id');
		$column1->getDomain()->copy(new Domain('FOOTYPE'));
		$table1->addColumn($column1);
		$table2 = new Table('bar');
		$column2 = new Column('id');
		$column2->getDomain()->copy(new Domain('BARTYPE'));
		$table2->addColumn($column2);

		$fk = new ForeignKey('foo_bar_FK');
		$fk->setForeignTableCommonName('bar');
		$fk->addReference($column1, $column2);
		$fk->setOnDelete('CASCADE');
		$table1->addForeignKey($fk);

		$column3 = new Column('baz_id');
		$column3->getDomain()->copy(new Domain('BAZTYPE'));
		$table1->addColumn($column3);
		$table3 = new Table('baz');
		$column4 = new Column('id');
		$column4->getDomain()->copy(new Domain('BAZTYPE'));
		$table3->addColumn($column4);

		$fk = new ForeignKey('foo_baz_FK');
		$fk->setForeignTableCommonName('baz');
		$fk->addReference($column3, $column4);
		$fk->setOnDelete('SETNULL');
		$table1->addForeignKey($fk);

		return array(
			array($table1)
		);
	}

}
