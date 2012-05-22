<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/model/Behavior.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/Table.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/builder/util/XmlToAppData.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/behavior/TimestampableBehavior.php';

/**
 * Tests for Behavior class
 *
 * @author     <a href="mailto:mpoeschl@marmot.at>Martin Poeschl</a>
 * @version    $Revision$
 * @package    generator.model
 */
class BehaviorTest extends PHPUnit_Framework_TestCase {

  private $xmlToAppData;
  private $appData;

  public function testSetupObject()
  {
    $b = new Behavior();
    $b->loadFromXML(array('name' => 'foo'));
    $this->assertEquals($b->getName(), 'foo', 'setupObject() sets the Behavior name from XML attributes');
  }

  public function testName()
  {
    $b = new Behavior();
    $this->assertNull($b->getName(), 'Behavior name is null by default');
    $b->setName('foo');
    $this->assertEquals($b->getName(), 'foo', 'setName() sets the name, and getName() gets it');
  }

  public function testTable()
  {
    $b = new Behavior();
    $this->assertNull($b->getTable(), 'Behavior Table is null by default');
    $t = new Table();
    $t->setCommonName('fooTable');
    $b->setTable($t);
    $this->assertEquals($b->getTable(), $t, 'setTable() sets the name, and getTable() gets it');
  }

  public function testParameters()
  {
    $b = new Behavior();
    $this->assertEquals($b->getParameters(), array(), 'Behavior parameters is an empty array by default');
    $b->addParameter(array('name' => 'foo', 'value' => 'bar'));
    $this->assertEquals($b->getParameters(), array('foo' => 'bar'), 'addParameter() sets a parameter from an associative array');
    $b->addParameter(array('name' => 'foo2', 'value' => 'bar2'));
    $this->assertEquals($b->getParameters(), array('foo' => 'bar', 'foo2' => 'bar2'), 'addParameter() adds a parameter from an associative array');
    $b->addParameter(array('name' => 'foo', 'value' => 'bar3'));
    $this->assertEquals($b->getParameters(), array('foo' => 'bar3', 'foo2' => 'bar2'), 'addParameter() changes a parameter from an associative array');
    $this->assertEquals($b->getParameter('foo'), 'bar3', 'getParameter() retrieves a parameter value by name');
    $b->setParameters(array('foo3' => 'bar3', 'foo4' => 'bar4'));
    $this->assertEquals($b->getParameters(), array('foo3' => 'bar3', 'foo4' => 'bar4'), 'setParameters() changes the whole parameter array');
  }

	/**
	 * test if the tables get the package name from the properties file
	 *
	 */
	public function testXmlToAppData()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="test1">
  <table name="table1">
    <column name="id" type="INTEGER" primaryKey="true" />
    <column name="title" type="VARCHAR" size="100" primaryString="true" />
    <column name="created_on" type="TIMESTAMP" />
    <column name="updated_on" type="TIMESTAMP" />
    <behavior name="timestampable">
      <parameter name="create_column" value="created_on" />
      <parameter name="update_column" value="updated_on" />
    </behavior>
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
		$table = $appData->getDatabase('test1')->getTable('table1');
		$behaviors = $table->getBehaviors();
		$this->assertEquals(1, count($behaviors), 'XmlToAppData ads as many behaviors as there are behaviors tags');
		$behavior = $table->getBehavior('timestampable');
		$this->assertEquals('table1', $behavior->getTable()->getName(), 'XmlToAppData sets the behavior table correctly');
		$this->assertEquals(array('create_column' => 'created_on', 'update_column' => 'updated_on'), $behavior->getParameters(), 'XmlToAppData sets the behavior parameters correctly');
	}

  /**
   * @expectedException InvalidArgumentException
   */
	public function testUnknownBehavior()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="test1">
  <table name="table1">
    <column name="id" type="INTEGER" primaryKey="true" />
    <behavior name="foo" />
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
	}

	public function testModifyTable()
	{
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="test1">
  <table name="table2">
    <column name="id" type="INTEGER" primaryKey="true" />
    <column name="title" type="VARCHAR" size="100" primaryString="true" />
    <behavior name="timestampable" />
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
		$table = $appData->getDatabase('test1')->getTable('table2');
		$this->assertEquals(count($table->getColumns()), 4, 'A behavior can modify its table by implementing modifyTable()');
	}

  public function testModifyDatabase()
  {
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="test1">
  <behavior name="timestampable" />
  <table name="table1">
    <column name="id" type="INTEGER" primaryKey="true" />
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
		$table = $appData->getDatabase('test1')->getTable('table1');
		$this->assertTrue(array_key_exists('timestampable', $table->getBehaviors()), 'A database behavior is automatically copied to all its table');
	}

  public function testGetColumnForParameter()
  {
		$xmlToAppData = new XmlToAppData();
		$schema = <<<EOF
<database name="test1">
  <table name="table1">
    <column name="id" type="INTEGER" primaryKey="true" />
    <column name="title" type="VARCHAR" size="100" primaryString="true" />
    <column name="created_on" type="TIMESTAMP" />
    <column name="updated_on" type="TIMESTAMP" />
    <behavior name="timestampable">
      <parameter name="create_column" value="created_on" />
      <parameter name="update_column" value="updated_on" />
    </behavior>
  </table>
</database>
EOF;
		$appData = $xmlToAppData->parseString($schema);
		$table = $appData->getDatabase('test1')->getTable('table1');
		$behavior = $table->getBehavior('timestampable');
		$this->assertEquals($table->getColumn('created_on'), $behavior->getColumnForParameter('create_column'), 'getColumnForParameter() returns the configured column for behavior based on a parameter name');
  }
}
