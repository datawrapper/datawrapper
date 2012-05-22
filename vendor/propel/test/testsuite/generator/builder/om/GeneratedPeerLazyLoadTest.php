<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests the generated Peer classes for lazy load columns.
 *
 * @package    generator.builder.om
 */
class GeneratedPeerLazyLoadTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		if (!class_exists('LazyLoadActiveRecord2')) {
			$schema = <<<EOF
<database name="lazy_load_active_record_2">
	<table name="lazy_load_active_record_2">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="foo" type="VARCHAR" size="100" />
		<column name="bar" type="VARCHAR" size="100" lazyLoad="true" />
		<column name="baz" type="VARCHAR" size="100" />
	</table>
</database>
EOF;
			PropelQuickBuilder::buildSchema($schema);
		}
	}

	public function testNumHydrateColumns()
	{
		$this->assertEquals(3, LazyLoadActiveRecord2Peer::NUM_HYDRATE_COLUMNS);
	}

	public function testPopulateObjectNotInPool()
	{
		LazyLoadActiveRecord2Peer::clearInstancePool();
		$values = array(123, 'fooValue', 'bazValue');
		$col = 0;
		list($obj, $col) = LazyLoadActiveRecord2Peer::populateObject($values, $col);
		$this->assertEquals(3, $col);
		$this->assertEquals(123, $obj->getId());
		$this->assertEquals('fooValue', $obj->getFoo());
		$this->assertNull($obj->getBar());
		$this->assertEquals('bazValue', $obj->getBaz());
	}

	public function testPopulateObjectInPool()
	{
		LazyLoadActiveRecord2Peer::clearInstancePool();
		$ar = new LazyLoadActiveRecord2();
		$ar->setId(123);
		$ar->setFoo('fooValue');
		$ar->setBaz('bazValue');
		$ar->setNew(false);
		LazyLoadActiveRecord2Peer::addInstanceToPool($ar, 123);
		$values = array(123, 'fooValue', 'bazValue');
		$col = 0;
		list($obj, $col) = LazyLoadActiveRecord2Peer::populateObject($values, $col);
		$this->assertEquals(3, $col);
		$this->assertEquals(123, $obj->getId());
		$this->assertEquals('fooValue', $obj->getFoo());
		$this->assertNull($obj->getBar());
		$this->assertEquals('bazValue', $obj->getBaz());
	}

	public function testPopulateObjectNotInPoolStartColGreaterThanOne()
	{
		LazyLoadActiveRecord2Peer::clearInstancePool();
		$values = array('dummy', 'dummy', 123, 'fooValue', 'bazValue', 'dummy');
		$col = 2;
		list($obj, $col) = LazyLoadActiveRecord2Peer::populateObject($values, $col);
		$this->assertEquals(5, $col);
		$this->assertEquals(123, $obj->getId());
		$this->assertEquals('fooValue', $obj->getFoo());
		$this->assertNull($obj->getBar());
		$this->assertEquals('bazValue', $obj->getBaz());
	}

	public function testPopulateObjectInPoolStartColGreaterThanOne()
	{
		LazyLoadActiveRecord2Peer::clearInstancePool();
		$ar = new LazyLoadActiveRecord2();
		$ar->setId(123);
		$ar->setFoo('fooValue');
		$ar->setBaz('bazValue');
		$ar->setNew(false);
		LazyLoadActiveRecord2Peer::addInstanceToPool($ar, 123);
		$values = array('dummy', 'dummy', 123, 'fooValue', 'bazValue', 'dummy');
		$col = 2;
		list($obj, $col) = LazyLoadActiveRecord2Peer::populateObject($values, $col);
		$this->assertEquals(5, $col);
		$this->assertEquals(123, $obj->getId());
		$this->assertEquals('fooValue', $obj->getFoo());
		$this->assertNull($obj->getBar());
		$this->assertEquals('bazValue', $obj->getBaz());
	}

}
