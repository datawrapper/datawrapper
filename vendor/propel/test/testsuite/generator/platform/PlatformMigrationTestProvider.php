<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/PlatformTestBase.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/diff/PropelDatabaseComparator.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/diff/PropelTableComparator.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/diff/PropelColumnComparator.php';

/**
 * provider for platform migration unit tests
 * @package    generator.platform
 */
abstract class PlatformMigrationTestProvider extends PlatformTestBase
{

	public function providerForTestGetModifyDatabaseDDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="blooopoo" type="INTEGER" />
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
	</table>
	<table name="foo3">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="yipee" type="INTEGER" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar1" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="false" />
		<column name="baz3" type="LONGVARCHAR" />
	</table>
	<table name="foo4">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="yipee" type="INTEGER" />
	</table>
	<table name="foo5">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="lkdjfsh" type="INTEGER" />
		<column name="dfgdsgf" type="LONGVARCHAR" />
	</table>
</database>
EOF;
		$d1 = $this->getDatabaseFromSchema($schema1);
		$d2 = $this->getDatabaseFromSchema($schema2);
		return array(array(PropelDatabaseComparator::computeDiff($d1, $d2)));
	}

	public function providerForTestGetRenameTableDDL()
	{
		return array(array('foo1', 'foo2'));
	}

	public function providerForTestGetModifyTableDDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
		<foreign-key name="foo1_FK_1" foreignTable="foo2">
			<reference local="bar" foreign="bar" />
		</foreign-key>
		<foreign-key name="foo1_FK_2" foreignTable="foo2">
			<reference local="baz" foreign="baz" />
		</foreign-key>
		<index name="bar_FK">
			<index-column name="bar"/>
		</index>
		<index name="bar_baz_FK">
			<index-column name="bar"/>
			<index-column name="baz"/>
		</index>
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar1" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="false" />
		<column name="baz3" type="LONGVARCHAR" />
		<foreign-key name="foo1_FK_1" foreignTable="foo2">
			<reference local="bar1" foreign="bar" />
		</foreign-key>
		<index name="bar_FK">
			<index-column name="bar1"/>
		</index>
		<index name="baz_FK">
			<index-column name="baz3"/>
		</index>
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
	</table>
</database>
EOF;
		$t1 = $this->getDatabaseFromSchema($schema1)->getTable('foo');
		$t2 = $this->getDatabaseFromSchema($schema2)->getTable('foo');
		return array(array(PropelTableComparator::computeDiff($t1,$t2)));
	}

	public function providerForTestGetModifyTableColumnsDDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar1" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="false" />
		<column name="baz3" type="LONGVARCHAR" />
	</table>
</database>
EOF;
		$t1 = $this->getDatabaseFromSchema($schema1)->getTable('foo');
		$t2 = $this->getDatabaseFromSchema($schema2)->getTable('foo');
		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$tc->compareColumns();
		return array(array($tc->getTableDiff()));
	}

	public function providerForTestGetModifyTablePrimaryKeysDDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" />
		<column name="bar" type="INTEGER" primaryKey="true" />
		<column name="baz" type="VARCHAR" size="12" required="false" />
	</table>
</database>
EOF;
		$t1 = $this->getDatabaseFromSchema($schema1)->getTable('foo');
		$t2 = $this->getDatabaseFromSchema($schema2)->getTable('foo');
		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$tc->comparePrimaryKeys();
		return array(array($tc->getTableDiff()));
	}

	public function providerForTestGetModifyTableIndicesDDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
		<index name="bar_FK">
			<index-column name="bar"/>
		</index>
		<index name="bar_baz_FK">
			<index-column name="bar"/>
			<index-column name="baz"/>
		</index>
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
		<index name="bar_baz_FK">
			<index-column name="id"/>
			<index-column name="bar"/>
			<index-column name="baz"/>
		</index>
		<index name="baz_FK">
			<index-column name="baz"/>
		</index>
	</table>
</database>
EOF;
		$t1 = $this->getDatabaseFromSchema($schema1)->getTable('foo');
		$t2 = $this->getDatabaseFromSchema($schema2)->getTable('foo');
		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$tc->compareIndices();
		return array(array($tc->getTableDiff()));
	}

	public function providerForTestGetModifyTableForeignKeysDDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
		<foreign-key name="foo1_FK_1" foreignTable="foo2">
			<reference local="bar" foreign="bar" />
		</foreign-key>
		<foreign-key name="foo1_FK_2" foreignTable="foo2">
			<reference local="bar" foreign="bar" />
			<reference local="baz" foreign="baz" />
		</foreign-key>
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
		<foreign-key name="foo1_FK_2" foreignTable="foo2">
			<reference local="bar" foreign="bar" />
			<reference local="id" foreign="id" />
		</foreign-key>
		<foreign-key name="foo1_FK_3" foreignTable="foo2">
			<reference local="baz" foreign="baz" />
		</foreign-key>
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<column name="baz" type="VARCHAR" size="12" required="true" />
	</table>
</database>
EOF;
		$t1 = $this->getDatabaseFromSchema($schema1)->getTable('foo1');
		$t2 = $this->getDatabaseFromSchema($schema2)->getTable('foo1');
		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$tc->compareForeignKeys();
		return array(array($tc->getTableDiff()));
	}

	public function providerForTestGetModifyTableForeignKeysSkipSqlDDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<foreign-key name="foo1_FK_1" foreignTable="foo2">
			<reference local="bar" foreign="bar" />
		</foreign-key>
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<foreign-key name="foo1_FK_1" foreignTable="foo2" skipSql="true">
			<reference local="bar" foreign="bar" />
		</foreign-key>
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
	</table>
</database>
EOF;
		$t1 = $this->getDatabaseFromSchema($schema1)->getTable('foo1');
		$t2 = $this->getDatabaseFromSchema($schema2)->getTable('foo1');
		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$tc->compareForeignKeys();
		return array(array($tc->getTableDiff()));
	}

	public function providerForTestGetModifyTableForeignKeysSkipSql2DDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="foo1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
		<foreign-key name="foo1_FK_1" foreignTable="foo2" skipSql="true">
			<reference local="bar" foreign="bar" />
		</foreign-key>
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
	<table name="foo1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
	</table>
	<table name="foo2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
	</table>
</database>
EOF;
		$t1 = $this->getDatabaseFromSchema($schema1)->getTable('foo1');
		$t2 = $this->getDatabaseFromSchema($schema2)->getTable('foo1');
		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$tc->compareForeignKeys();
		return array(array($tc->getTableDiff()));
	}

	public function providerForTestGetRemoveColumnDDL()
	{
		$table = new Table('foo');
		$column = new Column('bar');
		$table->addColumn($column);
		return array(array($column));
	}

	public function providerForTestGetRenameColumnDDL()
	{
		$t1 = new Table('foo');
		$c1 = new Column('bar1');
		$c1->getDomain()->setType('DOUBLE');
		$c1->getDomain()->setSqlType('DOUBLE');
		$c1->getDomain()->replaceSize(2);
		$t1->addColumn($c1);
		$t2 = new Table('foo');
		$c2 = new Column('bar2');
		$c2->getDomain()->setType('DOUBLE');
		$c2->getDomain()->setSqlType('DOUBLE');
		$c2->getDomain()->replaceSize(2);
		$t2->addColumn($c2);
		return array(array($c1, $c2));
	}

	public function providerForTestGetModifyColumnDDL()
	{
		$t1 = new Table('foo');
		$c1 = new Column('bar');
		$c1->getDomain()->copy($this->getPlatform()->getDomainForType('DOUBLE'));
		$c1->getDomain()->replaceSize(2);
		$t1->addColumn($c1);
		$t2 = new Table('foo');
		$c2 = new Column('bar');
		$c2->getDomain()->copy($this->getPlatform()->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceSize(3);
		$t2->addColumn($c2);
		return array(array(PropelColumnComparator::computeDiff($c1, $c2)));
	}

	public function providerForTestGetModifyColumnsDDL()
	{
		$t1 = new Table('foo');
		$c1 = new Column('bar1');
		$c1->getDomain()->copy($this->getPlatform()->getDomainForType('DOUBLE'));
		$c1->getDomain()->replaceSize(2);
		$t1->addColumn($c1);
		$c2 = new Column('bar2');
		$c2->getDomain()->setType('INTEGER');
		$c2->getDomain()->setSqlType('INTEGER');
		$t1->addColumn($c2);
		$t2 = new Table('foo');
		$c3 = new Column('bar1');
		$c3->getDomain()->copy($this->getPlatform()->getDomainForType('DOUBLE'));
		$c3->getDomain()->replaceSize(3);
		$t2->addColumn($c3);
		$c4 = new Column('bar2');
		$c4->getDomain()->setType('INTEGER');
		$c4->getDomain()->setSqlType('INTEGER');
		$c4->setNotNull(true);
		$t2->addColumn($c4);
		return array(array(array(
			PropelColumnComparator::computeDiff($c1, $c3),
			PropelColumnComparator::computeDiff($c2, $c4)
		)));
	}

	public function providerForTestGetAddColumnDDL()
	{
		$schema = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="INTEGER" />
	</table>
</database>
EOF;
		$column = $this->getDatabaseFromSchema($schema)->getTable('foo')->getColumn('bar');
		return array(array($column));
	}

	public function providerForTestGetAddColumnsDDL()
	{
		$schema = <<<EOF
<database name="test">
	<table name="foo">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar1" type="INTEGER" />
		<column name="bar2" type="DOUBLE" scale="2" size="3" default="-1" required="true" />
	</table>
</database>
EOF;
		$table = $this->getDatabaseFromSchema($schema)->getTable('foo');
		return array(array(array($table->getColumn('bar1'), $table->getColumn('bar2'))));
	}

	public function providerForTestGetModifyColumnRemoveDefaultValueDDL()
	{
	    $t1 = new Table('test');
	    $c1 = new Column();
	    $c1->setName('test');
	    $c1->getDomain()->setType('INTEGER');
	    $c1->setDefaultValue(0);
	    $t1->addColumn($c1);
	    $t2 = new Table('test');
	    $c2 = new Column();
	    $c2->setName('test');
	    $c2->getDomain()->setType('INTEGER');
	    $t2->addColumn($c2);
	    return array(array(PropelColumnComparator::computeDiff($c1, $c2)));
	}

	public function providerForTestGetModifyTableForeignKeysSkipSql3DDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="test">
		<column name="test" type="INTEGER" primaryKey="true" autoIncrement="true" required="true" />
		<column name="ref_test" type="INTEGER"/>
		<foreign-key foreignTable="test2" onDelete="CASCADE" onUpdate="CASCADE" skipSql="true">
		    <reference local="ref_test" foreign="test" />
	    </foreign-key>
	</table>
	<table name="test2">
		<column name="test" type="integer" primaryKey="true" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
  <table name="test">
    <column name="test" type="INTEGER" primaryKey="true" autoIncrement="true" required="true" />
    <column name="ref_test" type="INTEGER"/>
  </table>
  <table name="test2">
    <column name="test" type="integer" primaryKey="true" />
  </table>
</database>
EOF;
		$d1 = $this->getDatabaseFromSchema($schema1);
		$d2 = $this->getDatabaseFromSchema($schema2);
		$diff = PropelDatabaseComparator::computeDiff($d1, $d2);
		return array(array($diff));
	}

	public function providerForTestGetModifyTableForeignKeysSkipSql4DDL()
	{
		$schema1 = <<<EOF
<database name="test">
	<table name="test">
		<column name="test" type="INTEGER" primaryKey="true" autoIncrement="true" required="true" />
		<column name="ref_test" type="INTEGER"/>
		<foreign-key foreignTable="test2" onDelete="CASCADE" onUpdate="CASCADE" skipSql="true">
		    <reference local="ref_test" foreign="test" />
	    </foreign-key>
	</table>
	<table name="test2">
		<column name="test" type="integer" primaryKey="true" />
	</table>
</database>
EOF;
		$schema2 = <<<EOF
<database name="test">
  <table name="test">
    <column name="test" type="INTEGER" primaryKey="true" autoIncrement="true" required="true" />
    <column name="ref_test" type="INTEGER"/>
  </table>
  <table name="test2">
    <column name="test" type="integer" primaryKey="true" />
  </table>
</database>
EOF;
		$d1 = $this->getDatabaseFromSchema($schema1);
		$d2 = $this->getDatabaseFromSchema($schema2);
		$diff = PropelDatabaseComparator::computeDiff($d2, $d1);
		return array(array($diff));
	}

}
