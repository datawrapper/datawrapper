<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/model/Column.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/builder/util/XmlToAppData.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/platform/DefaultPlatform.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/behavior/AutoAddPkBehavior.php';

/**
 * Tests for package handling.
 *
 * @author     <a href="mailto:mpoeschl@marmot.at>Martin Poeschl</a>
 * @version    $Revision$
 * @package    generator.model
 */
class ColumnTest extends PHPUnit_Framework_TestCase
{

    /**
     * Tests static Column::makeList() method.
     * @deprecated - Column::makeList() is deprecated and set to be removed in 1.3
     */
    public function testMakeList()
    {
        $expected = '"Column0", "Column1", "Column2", "Column3", "Column4"';
        $objArray = array();
        for ($i=0; $i<5; $i++) {
            $c = new Column();
            $c->setName("Column" . $i);
            $objArray[] = $c;
        }

        $list = Column::makeList($objArray, new DefaultPlatform());
        $this->assertEquals($expected, $list, sprintf("Expected '%s' match, got '%s' ", var_export($expected, true), var_export($list,true)));

        $strArray = array();
        for ($i=0; $i<5; $i++) {
            $strArray[] = "Column" . $i;
        }

        $list = Column::makeList($strArray, new DefaultPlatform());
        $this->assertEquals($expected, $list, sprintf("Expected '%s' match, got '%s' ", var_export($expected, true), var_export($list,true)));

    }

    public function testPhpNamingMethod()
    {
        $xmlToAppData = new XmlToAppData(new DefaultPlatform());
        $schema = <<<EOF
<database name="test1">
  <behavior name="auto_add_pk" />
  <table name="table1">
    <column name="id" type="INTEGER" primaryKey="true" />
    <column name="author_id" type="INTEGER" />
    <column name="editor_id" type="INTEGER" phpNamingMethod="nochange" />
  </table>
</database>
EOF;
        $appData = $xmlToAppData->parseString($schema);
        $column = $appData->getDatabase('test1')->getTable('table1')->getColumn('author_id');
      $this->assertEquals('AuthorId', $column->getPhpName(), 'setPhpName() uses the default phpNamingMethod');
        $column = $appData->getDatabase('test1')->getTable('table1')->getColumn('editor_id');
      $this->assertEquals('editor_id', $column->getPhpName(), 'setPhpName() uses the column phpNamingMethod if given');
  }

    public function testDefaultPhpNamingMethod()
    {
        $xmlToAppData = new XmlToAppData(new DefaultPlatform());
        $schema = <<<EOF
<database name="test2" defaultPhpNamingMethod="nochange">
  <behavior name="auto_add_pk" />
  <table name="table1">
    <column name="id" primaryKey="true" />
    <column name="author_id" type="VARCHAR" />
  </table>
</database>
EOF;
        $appData = $xmlToAppData->parseString($schema);
        $column = $appData->getDatabase('test2')->getTable('table1')->getColumn('author_id');
      $this->assertEquals('author_id', $column->getPhpName(), 'setPhpName() uses the database defaultPhpNamingMethod if given');
    }

    public function testGetConstantName()
    {
        $xmlToAppData = new XmlToAppData(new DefaultPlatform());
        $schema = <<<EOF
<database name="test">
  <table name="table1">
    <column name="id" primaryKey="true" />
    <column name="title" type="VARCHAR" />
  </table>
</database>
EOF;
    $appData = $xmlToAppData->parseString($schema);
    $column = $appData->getDatabase('test')->getTable('table1')->getColumn('title');
    $this->assertEquals('Table1Peer::TITLE', $column->getConstantName(), 'getConstantName() returns the complete constant name by default');
    }

    public function testIsLocalColumnsRequired()
    {
        $xmlToAppData = new XmlToAppData(new DefaultPlatform());
        $schema = <<<EOF
<database name="test">
  <table name="table1">
    <column name="id" primaryKey="true" />
    <column name="table2_foo" type="VARCHAR" />
    <foreign-key foreignTable="table2">
      <reference local="table2_foo" foreign="foo"/>
    </foreign-key>
    <column name="table2_bar" required="true" type="VARCHAR" />
    <foreign-key foreignTable="table2">
      <reference local="table2_bar" foreign="bar"/>
    </foreign-key>
  </table>
  <table name="table2">
    <column name="id" primaryKey="true" />
    <column name="foo" type="VARCHAR" />
    <column name="bar" type="VARCHAR" />
  </table>
</database>
EOF;
        $appData = $xmlToAppData->parseString($schema);
        $fk = $appData->getDatabase('test')->getTable('table1')->getColumnForeignKeys('table2_foo');
        $this->assertFalse($fk[0]->isLocalColumnsRequired());
        $fk = $appData->getDatabase('test')->getTable('table1')->getColumnForeignKeys('table2_bar');
        $this->assertTrue($fk[0]->isLocalColumnsRequired());
    }

    public function testIsNamePlural()
    {
        $column = new Column('foo');
        $this->assertFalse($column->isNamePlural());
        $column = new Column('foos');
        $this->assertTrue($column->isNamePlural());
        $column = new Column('foso');
        $this->assertFalse($column->isNamePlural());
    }

    public function testGetSingularName()
    {
        $column = new Column('foo');
        $this->assertEquals('foo', $column->getSingularName());
        $column = new Column('foos');
        $this->assertEquals('foo', $column->getSingularName());
        $column = new Column('foso');
        $this->assertEquals('foso', $column->getSingularName());
    }

    public function testGetValidator()
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
    <column name="title2" type="VARCHAR" />
    <validator column="title2">
      <rule name="minLength" value="4" message="Username must be at least 4 characters !" />
      <rule name="maxLength" value="10" message="Username must be at most 10 characters !" />
    </validator>
  </table>
</database>
EOF;
        $appData = $xmlToAppData->parseString($schema);
        $table1 = $appData->getDatabase('test')->getTable('table1');
        $this->assertNull($table1->getColumn('id')->getValidator());
        $title1Column = $table1->getColumn('title1');
        $title1Validator = $title1Column->getValidator();
        $this->assertInstanceOf('Validator', $title1Validator);
        $this->assertEquals(1, count($title1Validator->getRules()));
        $title2Column = $table1->getColumn('title2');
        $title2Validator = $title2Column->getValidator();
        $this->assertInstanceOf('Validator', $title2Validator);
        $this->assertEquals(2, count($title2Validator->getRules()));
    }

    public function testHasPlatform()
    {
        $column = new Column();
        $this->assertFalse($column->hasPlatform());
        $table = new Table();
        $table->addColumn($column);
        $this->assertFalse($column->hasPlatform());
        $database = new Database();
        $database->addTable($table);
        $this->assertFalse($column->hasPlatform());
        $platform = new DefaultPlatform();
        $database->setPlatform($platform);
        $this->assertTrue($column->hasPlatform());
    }

    public function testIsPhpArrayType()
    {
        $column = new Column();
        $this->assertFalse($column->isPhpArrayType());

        $column->setType(PropelTypes::PHP_ARRAY);
        $this->assertTrue($column->isPhpArrayType());
    }

    public function testCommaInEnumValueSet()
    {
        $column     = new Column();
        $table      = new Table();
        $database   = new Database();
        $platform   = new DefaultPlatform();

        $table->addColumn($column);
        $database->addTable($table);
        $database->setPlatform($platform);

        $column->loadFromXML(array('valueSet' => 'Foo, Bar, "Foo, Bar"'));
        $valueSet = $column->getValueSet();

        $this->assertCount(3, $valueSet);
        $this->assertEquals('Foo', $valueSet[0]);
        $this->assertEquals('Bar', $valueSet[1]);
        $this->assertEquals('Foo, Bar', $valueSet[2]);
    }
}
