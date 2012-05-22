<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../runtime/lib/map/DatabaseMap.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/map/RelationMap.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/map/ColumnMap.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/map/TableMap.php';

/**
 * Test class for RelationMap.
 *
 * @author     François Zaninotto
 * @version    $Id$
 * @package    runtime.map
 */
class RelationMapTest extends PHPUnit_Framework_TestCase
{
  protected $databaseMap, $relationName, $rmap;

  protected function setUp()
  {
    parent::setUp();
    $this->databaseMap = new DatabaseMap('foodb');
    $this->relationName = 'foo';
    $this->rmap = new RelationMap($this->relationName);
  }

  public function testConstructor()
  {
    $this->assertEquals($this->relationName, $this->rmap->getName(), 'constructor sets the relation name');
  }

  public function testLocalTable()
  {
    $this->assertNull($this->rmap->getLocalTable(), 'A new relation has no local table');
    $tmap1 = new TableMap('foo', $this->databaseMap);
    $this->rmap->setLocalTable($tmap1);
    $this->assertEquals($tmap1, $this->rmap->getLocalTable(), 'The local table is set by setLocalTable()');
  }

  public function testForeignTable()
  {
    $this->assertNull($this->rmap->getForeignTable(), 'A new relation has no foreign table');
    $tmap2 = new TableMap('bar', $this->databaseMap);
    $this->rmap->setForeignTable($tmap2);
    $this->assertEquals($tmap2, $this->rmap->getForeignTable(), 'The foreign table is set by setForeignTable()');
  }

  public function testProperties()
  {
    $properties = array('type', 'onUpdate', 'onDelete');
    foreach ($properties as $property)
    {
      $getter = 'get' . ucfirst($property);
      $setter = 'set' . ucfirst($property);
      $this->assertNull($this->rmap->$getter(), "A new relation has no $property");
      $this->rmap->$setter('foo_value');
      $this->assertEquals('foo_value', $this->rmap->$getter(), "The $property is set by setType()");
    }
  }

  public function testColumns()
  {
    $this->assertEquals(array(), $this->rmap->getLocalColumns(), 'A new relation has no local columns');
    $this->assertEquals(array(), $this->rmap->getForeignColumns(), 'A new relation has no foreign columns');
    $tmap1 = new TableMap('foo', $this->databaseMap);
    $col1 = $tmap1->addColumn('FOO1', 'Foo1PhpName', 'INTEGER');
    $tmap2 = new TableMap('bar', $this->databaseMap);
    $col2 = $tmap2->addColumn('BAR1', 'Bar1PhpName', 'INTEGER');
    $this->rmap->addColumnMapping($col1, $col2);
    $this->assertEquals(array($col1), $this->rmap->getLocalColumns(), 'addColumnMapping() adds a local table');
    $this->assertEquals(array($col2), $this->rmap->getForeignColumns(), 'addColumnMapping() adds a foreign table');
    $expected = array('foo.FOO1' => 'bar.BAR1');
    $this->assertEquals($expected, $this->rmap->getColumnMappings(), 'getColumnMappings() returns an associative array of column mappings');
    $col3 = $tmap1->addColumn('FOOFOO', 'FooFooPhpName', 'INTEGER');
    $col4 = $tmap2->addColumn('BARBAR', 'BarBarPhpName', 'INTEGER');
    $this->rmap->addColumnMapping($col3, $col4);
    $this->assertEquals(array($col1, $col3), $this->rmap->getLocalColumns(), 'addColumnMapping() adds a local table');
    $this->assertEquals(array($col2, $col4), $this->rmap->getForeignColumns(), 'addColumnMapping() adds a foreign table');
    $expected = array('foo.FOO1' => 'bar.BAR1', 'foo.FOOFOO' => 'bar.BARBAR');
    $this->assertEquals($expected, $this->rmap->getColumnMappings(), 'getColumnMappings() returns an associative array of column mappings');
  }
}
