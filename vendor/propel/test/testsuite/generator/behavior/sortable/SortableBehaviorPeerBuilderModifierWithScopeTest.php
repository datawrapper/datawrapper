<?php

/*
 *	$Id: SortableBehaviorTest.php 1356 2009-12-11 16:36:55Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/behavior/BookstoreSortableTestBase.php';

/**
 * Tests for SortableBehavior class
 *
 * @author		Massimiliano Arione
 * @version		$Revision$
 * @package		generator.behavior.sortable
 */
class SortableBehaviorPeerBuilderModifierWithScopeTest extends BookstoreSortableTestBase
{
	protected function setUp()
	{
		parent::setUp();
		$this->populateTable12();
	}

	public function testStaticAttributes()
	{
		$this->assertEquals(Table12Peer::RANK_COL, 'table12.POSITION');
		$this->assertEquals(Table12Peer::SCOPE_COL, 'table12.MY_SCOPE_COLUMN');
	}

	public function testGetMaxRank()
	{
		$this->assertEquals(4, Table12Peer::getMaxRank(1), 'getMaxRank() returns the maximum rank of the suite');
		$this->assertEquals(2, Table12Peer::getMaxRank(2), 'getMaxRank() returns the maximum rank of the suite');
		$t4 = Table12Peer::retrieveByRank(4, 1);
		$t4->delete();
		$this->assertEquals(3, Table12Peer::getMaxRank(1), 'getMaxRank() returns the maximum rank');
		Table12Peer::doDeleteAll();
		$this->assertNull(Table12Peer::getMaxRank(1), 'getMaxRank() returns null for empty tables');
	}
	public function testRetrieveByRank()
	{
		$t = Table12Peer::retrieveByRank(5, 1);
		$this->assertNull($t, 'retrieveByRank() returns null for an unknown rank');
		$t3 = Table12Peer::retrieveByRank(3, 1);
		$this->assertEquals(3, $t3->getRank(), 'retrieveByRank() returns the object with the required rank in the required suite');
		$this->assertEquals('row3', $t3->getTitle(), 'retrieveByRank() returns the object with the required rank in the required suite');
		$t6 = Table12Peer::retrieveByRank(2, 2);
		$this->assertEquals(2, $t6->getRank(), 'retrieveByRank() returns the object with the required rank in the required suite');
		$this->assertEquals('row6', $t6->getTitle(), 'retrieveByRank() returns the object with the required rank in the required suite');
	}

	public function testReorder()
	{
		$c = new Criteria();
		$c->add(Table12Peer::SCOPE_COL, 1);
		$objects = Table12Peer::doSelectOrderByRank($c);
		$ids = array();
		foreach ($objects as $object) {
			$ids[]= $object->getPrimaryKey();
		}
		$ranks = array(4, 3, 2, 1);
		$order = array_combine($ids, $ranks);
		Table12Peer::reorder($order);
		$expected = array(1 => 'row4', 2 => 'row3', 3 => 'row2', 4 => 'row1');
		$this->assertEquals($expected, $this->getFixturesArrayWithScope(1), 'reorder() reorders the suite');
		$expected = array(1 => 'row5', 2 => 'row6');
		$this->assertEquals($expected, $this->getFixturesArrayWithScope(2), 'reorder() leaves other suites unchanged');
	}

	public function testDoSelectOrderByRank()
	{
		$c = new Criteria();
		$c->add(Table12Peer::SCOPE_COL, 1);
		$objects = Table12Peer::doSelectOrderByRank($c);
		$oldRank = 0;
		while ($object = array_shift($objects)) {
			$this->assertTrue($object->getRank() > $oldRank);
			$oldRank = $object->getRank();
		}
		$c = new Criteria();
		$c->add(Table12Peer::SCOPE_COL, 1);
		$objects = Table12Peer::doSelectOrderByRank($c, Criteria::DESC);
		$oldRank = 10;
		while ($object = array_shift($objects)) {
			$this->assertTrue($object->getRank() < $oldRank);
			$oldRank = $object->getRank();
		}
	}

	public function testRetrieveList()
	{
	  $this->assertEquals(4, count(Table12Peer::retrieveList(1)), 'retrieveList() returns the list of objects in the scope');
	  $this->assertEquals(2, count(Table12Peer::retrieveList(2)), 'retrieveList() returns the list of objects in the scope');
	}

	public function testCountList()
	{
	  $this->assertEquals(4, Table12Peer::countList(1), 'countList() returns the list of objects in the scope');
	  $this->assertEquals(2, Table12Peer::countList(2), 'countList() returns the list of objects in the scope');
	}

	public function testDeleteList()
	{
		$this->assertEquals(4, Table12Peer::deleteList(1), 'deleteList() returns the list of objects in the scope');
		$this->assertEquals(2, Table12Peer::doCount(new Criteria()), 'deleteList() deletes the objects in the scope');
		$this->assertEquals(2, Table12Peer::deleteList(2), 'deleteList() returns the list of objects in the scope');
		$this->assertEquals(0, Table12Peer::doCount(new Criteria()), 'deleteList() deletes the objects in the scope');
	}
}