<?php

/*
 *	$Id$
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/builder/util/XmlToAppData.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/config/GeneratorConfig.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/platform/DefaultPlatform.php';
require_once dirname(__FILE__) . '/../../../tools/helpers/DummyPlatforms.php';

/**
 * Tests for Table model class
 *
 * @author     Martin Poeschl (mpoeschl@marmot.at)
 * @version    $Revision$
 * @package    generator.model
 */
class TableTest extends PHPUnit_Framework_TestCase
{

	/**
	 * test if the tables get the package name from the properties file
	 *
	 */
	public function testIdMethodHandling()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="iddb" defaultIdMethod="native">
  <table name="table_native">
    <column name="table_a_id" required="true" autoIncrement="true" primaryKey="true" type="INTEGER" />
    <column name="col_a" type="CHAR" size="5" />
  </table>
  <table name="table_none" idMethod="none">
    <column name="table_a_id" required="true" primaryKey="true" type="INTEGER" />
    <column name="col_a" type="CHAR" size="5" />
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);

		$db = $appData->getDatabase("iddb");
		$this->assertEquals(IDMethod::NATIVE, $db->getDefaultIdMethod());

		$table1 = $db->getTable("table_native");
		$this->assertEquals(IDMethod::NATIVE, $table1->getIdMethod());

		$table2 = $db->getTable("table_none");
		$this->assertEquals(IDMethod::NO_ID_METHOD, $table2->getIdMethod());
	}

	public function testGeneratorConfig()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="test1">
  <table name="table1">
    <column name="id" type="INTEGER" primaryKey="true" />
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
		$table = $appData->getDatabase('test1')->getTable('table1');
		$config = new GeneratorConfig();
		$config->setBuildProperties(array('propel.foo.bar.class' => 'bazz'));
		$table->getDatabase()->getAppData()->setGeneratorConfig($config);
		$this->assertThat($table->getGeneratorConfig(), $this->isInstanceOf('GeneratorConfig'), 'getGeneratorConfig() returns an instance of the generator configuration');
		$this->assertEquals($table->getGeneratorConfig()->getBuildProperty('fooBarClass'), 'bazz', 'getGeneratorConfig() returns the instance of the generator configuration used in the platform');
	}

	public function testAddBehavior()
	{
		$include_path = get_include_path();
		set_include_path($include_path . PATH_SEPARATOR . realpath(dirname(__FILE__) . '/../../../../generator/lib'));
		$xmlToAppData = new XmlToAppData(new DefaultPlatform());
		$config = new GeneratorConfig();
		$config->setBuildProperties(array(
			'propel.platform.class' => 'propel.engine.platform.DefaultPlatform',
			'propel.behavior.timestampable.class' => 'behavior.TimestampableBehavior'
		));
		$xmlToAppData->setGeneratorConfig($config);
		$schema = <<<EOF
<database name="test1">
  <table name="table1">
    <behavior name="timestampable" />
    <column name="id" type="INTEGER" primaryKey="true" />
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
		set_include_path($include_path);
		$table = $appData->getDatabase('test1')->getTable('table1');
		$this->assertThat($table->getBehavior('timestampable'), $this->isInstanceOf('TimestampableBehavior'), 'addBehavior() uses the behavior class defined in build.properties');
	}

	/**
	 * @expectedException EngineException
	 */
	public function testUniqueColumnName()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="columnTest" defaultIdMethod="native">
	<table name="columnTestTable">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" description="Book Id" />
		<column name="title" type="VARCHAR" required="true" description="Book Title" />
		<column name="title" type="VARCHAR" required="true" description="Book Title" />
	</table>
</database>
EOF;
		// Parsing file with duplicate column names in one table throws exception
		$appData = $xmlToAppData->parseString($schema);
	}

	/**
	 * @expectedException EngineException
	 */
	public function testUniqueTableName()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="columnTest" defaultIdMethod="native">
	<table name="columnTestTable">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" description="Book Id" />
		<column name="title" type="VARCHAR" required="true" description="Book Title" />
	</table>
	<table name="columnTestTable">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" description="Book Id" />
		<column name="title" type="VARCHAR" required="true" description="Book Title" />
	</table>
</database>
EOF;
		// Parsing file with duplicate table name throws exception
		$appData = $xmlToAppData->parseString($schema);
	}

	public function providerForTestHasColumn()
	{
		$table = new Table();
		$column = new Column('Foo');
		$table->addColumn($column);
		return array(
			array($table, $column)
		);
	}

	/**
	 * @dataProvider providerForTestHasColumn
	 */
	public function testHasColumn($table, $column)
	{
		$this->assertTrue($table->hasColumn('Foo'));
		$this->assertFalse($table->hasColumn('foo'));
		$this->assertFalse($table->hasColumn('FOO'));
	}

	/**
	 * @dataProvider providerForTestHasColumn
	 */
	public function testHasColumnCaseInsensitive($table, $column)
	{
		$this->assertTrue($table->hasColumn('Foo', true));
		$this->assertTrue($table->hasColumn('foo', true));
		$this->assertTrue($table->hasColumn('FOO', true));
	}

	/**
	 * @dataProvider providerForTestHasColumn
	 */
	public function testGetColumn($table, $column)
	{
		$this->assertEquals($column, $table->getColumn('Foo'));
		$this->assertNull($table->getColumn('foo'));
		$this->assertNull($table->getColumn('FOO'));
	}

	/**
	 * @dataProvider providerForTestHasColumn
	 */
	public function testGetColumnCaseInsensitive($table, $column)
	{
		$this->assertEquals($column, $table->getColumn('Foo', true));
		$this->assertEquals($column, $table->getColumn('foo', true));
		$this->assertEquals($column, $table->getColumn('FOO', true));
	}

	/**
	 * @dataProvider providerForTestHasColumn
	 */
	public function testRemoveColumnFromObject($table, $column)
	{
		$table->removeColumn($column);
		$this->assertFalse($table->hasColumn('Foo'));
	}

	/**
	 * @dataProvider providerForTestHasColumn
	 */
	public function testRemoveColumnFromName($table, $column)
	{
		$table->removeColumn($column->getName());
		$this->assertFalse($table->hasColumn('Foo'));
	}

	public function testRemoveColumnFixesPositions()
	{
		$table = new Table();
		$col1 = new Column('Foo1');
		$table->addColumn($col1);
		$col2 = new Column('Foo2');
		$table->addColumn($col2);
		$col3 = new Column('Foo3');
		$table->addColumn($col3);
		$this->assertEquals(1, $col1->getPosition());
		$this->assertEquals(2, $col2->getPosition());
		$this->assertEquals(3, $col3->getPosition());
		$this->assertEquals(array(0, 1, 2), array_keys($table->getColumns()));
		$table->removeColumn($col2);
		$this->assertEquals(1, $col1->getPosition());
		$this->assertEquals(2, $col3->getPosition());
		$this->assertEquals(array(0, 1), array_keys($table->getColumns()));
	}

	public function testQualifiedName()
	{
		$table = new Table();
		$table->setSchema("foo");
		$table->setCommonName("bar");
		$this->assertEquals($table->getName(), "bar");
		$this->assertEquals($table->getCommonName(), "bar");
		$database = new Database();
		$database->addTable($table);
		$database->setPlatform(new NoSchemaPlatform());
		$this->assertEquals($table->getName(), "bar");
		$database->setPlatform(new SchemaPlatform());
		$this->assertEquals($table->getName(), "foo.bar");
	}

	public function testRemoveValidatorForColumn()
	{
		$xmlToAppData = new XmlToAppData(new DefaultPlatform());
		$schema = <<<EOF
<database name="test">
  <table name="table1">
    <column name="id" primaryKey="true" />
    <column name="title1" type="VARCHAR" />
    <validator column="title1">
      <rule name="minLength" value="4" message="Username must be at least 4 characters !" />
    </validator>
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
		$table1 = $appData->getDatabase('test')->getTable('table1');
		$title1Column = $table1->getColumn('title1');
		$this->assertNotNull($title1Column->getValidator());
		$table1->removeValidatorForColumn('title1');
		$this->assertNull($title1Column->getValidator());
	}

	public function testTableNamespaceAcrossDatabase()
	{
		$schema1 = <<<EOF
<database name="DB1" namespace="NS1">
  <table name="table1">
    <column name="id" primaryKey="true" />
    <column name="title1" type="VARCHAR" />
  </table>
</database>
EOF;
		$xmlToAppData = new XmlToAppData(new DefaultPlatform());
		$appData1 = $xmlToAppData->parseString($schema1);
		$schema2 = <<<EOF
<database name="DB1" namespace="NS2">
  <table name="table2">
    <column name="id" primaryKey="true" />
    <column name="title1" type="VARCHAR" />
  </table>
</database>
EOF;
		$xmlToAppData = new XmlToAppData(new DefaultPlatform());
		$appData2 = $xmlToAppData->parseString($schema2);
		$appData1->joinAppDatas(array($appData2));
		$this->assertEquals('NS1', $appData1->getDatabase('DB1')->getTable('table1')->getNamespace());
		$this->assertEquals('NS2', $appData1->getDatabase('DB1')->getTable('table2')->getNamespace());
	}

	public function testSetNamespaceSetsPackageWhenBuildPropertySet()
	{
		$schema = <<<EOF
<database name="DB">
  <table name="table" namespace="NS">
    <column name="id" primaryKey="true" />
    <column name="title1" type="VARCHAR" />
  </table>
</database>
EOF;
		$config = new GeneratorConfig();
		$config->setBuildProperties(array('propel.namespace.autoPackage' => 'true'));
		$xmlToAppData = new XmlToAppData(new DefaultPlatform());
		$xmlToAppData->setGeneratorConfig($config);
		$table = $xmlToAppData->parseString($schema)->getDatabase('DB')->getTable('table');
		$this->assertEquals('NS', $table->getPackage());
	}

	public function testSetNamespaceSetsCompletePackageWhenBuildPropertySet()
	{
		$schema = <<<EOF
<database name="DB" namespace="NS1">
  <table name="table" namespace="NS2">
    <column name="id" primaryKey="true" />
    <column name="title1" type="VARCHAR" />
  </table>
</database>
EOF;
		$config = new GeneratorConfig();
		$config->setBuildProperties(array('propel.namespace.autoPackage' => 'true'));
		$xmlToAppData = new XmlToAppData(new DefaultPlatform());
		$xmlToAppData->setGeneratorConfig($config);
		$table = $xmlToAppData->parseString($schema)->getDatabase('DB')->getTable('table');
		$this->assertEquals('NS1.NS2', $table->getPackage());
	}

	public function testSetPackageOverridesNamespaceAutoPackage()
	{
		$schema = <<<EOF
<database name="DB" namespace="NS1">
  <table name="table" namespace="NS2" package="foo">
    <column name="id" primaryKey="true" />
    <column name="title1" type="VARCHAR" />
  </table>
</database>
EOF;
		$config = new GeneratorConfig();
		$config->setBuildProperties(array('propel.namespace.autoPackage' => 'true'));
		$xmlToAppData = new XmlToAppData(new DefaultPlatform());
		$xmlToAppData->setGeneratorConfig($config);
		$table = $xmlToAppData->parseString($schema)->getDatabase('DB')->getTable('table');
		$this->assertEquals('foo', $table->getPackage());
	}

	public function testAppendXmlPackage() {
		$schema = <<<EOF
<?xml version="1.0"?>
<table name="test" package="test/package"/>
EOF;

		$doc = new DOMDocument('1.0');
		$doc->formatOutput = true;

		$table = new Table('test');
		$table->setPackage('test/package');
		$table->appendXml($doc);

		$xmlstr = trim($doc->saveXML());
		$this->assertSame($schema, $xmlstr);
	}

	public function testAppendXmlNamespace() {
		$schema = <<<EOF
<?xml version="1.0"?>
<table name="test" namespace="\\testNs"/>
EOF;

		$doc = new DOMDocument('1.0');
		$doc->formatOutput = true;

		$table = new Table('test');
		$table->setNamespace('\testNs');
		$table->appendXml($doc);

		$xmlstr = trim($doc->saveXML());
		$this->assertSame($schema, $xmlstr);

		$schema = <<<EOF
<?xml version="1.0"?>
<table name="test" namespace="\\testNs" package="testPkg"/>
EOF;

		$doc = new DOMDocument('1.0');
		$doc->formatOutput = true;
		$table->setPackage('testPkg');
		$table->appendXml($doc);

		$xmlstr = trim($doc->saveXML());
		$this->assertSame($schema, $xmlstr);
	}

	public function testAppendXmlNamespaceWithAutoPackage() {
		$schema = <<<EOF
<?xml version="1.0"?>
<table name="test" namespace="\\testNs"/>
EOF;

		$doc = new DOMDocument('1.0');
		$doc->formatOutput = true;

		$config = new GeneratorConfig();
		$config->setBuildProperties(array('propel.namespace.autoPackage' => 'true'));

		$appData = new AppData();
		$appData->setGeneratorConfig($config);

		$db = new Database('testDb');
		$db->setAppData($appData);

		$table = new Table('test');
		$table->setDatabase($db);
		$table->setNamespace('\testNs');
		$table->appendXml($doc);

		$xmlstr = trim($doc->saveXML());
		$this->assertSame($schema, $xmlstr);

		$schema = <<<EOF
<?xml version="1.0"?>
<table name="test" namespace="\\testNs" package="testPkg"/>
EOF;

		$doc = new DOMDocument('1.0');
		$doc->formatOutput = true;
		$table->setPackage('testPkg');
		$table->appendXml($doc);

		$xmlstr = trim($doc->saveXML());
		$this->assertSame($schema, $xmlstr);
	}

	public function testIsCrossRefAttribute()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
	<database name="iddb" defaultIdMethod="native">
		<table name="table_native">
			<column name="table_a_id" required="true" primaryKey="true" type="INTEGER" />
			<column name="col_a" type="CHAR" size="5" />
		</table>
		<table name="table_is_cross_ref_true" isCrossRef="true">
			<column name="table_a_id" required="true" primaryKey="true" type="INTEGER" />
			<column name="col_a" type="CHAR" size="5" />
		</table>
		<table name="table_is_cross_ref_false" isCrossRef="false">
			<column name="table_a_id" required="true" primaryKey="true" type="INTEGER" />
			<column name="col_a" type="CHAR" size="5" />
		</table>
	</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);

		$db = $appData->getDatabase("iddb");

		$table1 = $db->getTable("table_native");
		$this->assertFalse($table1->getIsCrossRef());

		$table2 = $db->getTable("table_is_cross_ref_true");
		$this->assertTrue($table2->getIsCrossRef());

		$table3 = $db->getTable("table_is_cross_ref_false");
		$this->assertFalse($table3->getIsCrossRef());
	}
}
