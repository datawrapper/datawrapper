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
class SortableBehaviorPeerBuilderModifierTest extends BookstoreSortableTestBase
{
	protected function setUp()
	{
		parent::setUp();
		$this->populateTable11();
	}

	public function testStaticAttributes()
	{
		$this->assertEquals(Table11Peer::RANK_COL, 'table11.SORTABLE_RANK');
	}

	public function testGetMaxRank()
	{
		$this->assertEquals(4, Table11Peer::getMaxRank(), 'getMaxRank() returns the maximum rank');
		$t4 = Table11Peer::retrieveByRank(4);
		$t4->delete();
		$this->assertEquals(3, Table11Peer::getMaxRank(), 'getMaxRank() returns the maximum rank');
		Table11Peer::doDeleteAll();
		$this->assertNull(Table11Peer::getMaxRank(), 'getMaxRank() returns null for empty tables');
	}
	public function testRetrieveByRank()
	{
		$t = Table11Peer::retrieveByRank(5);
		$this->assertNull($t, 'retrieveByRank() returns null for an unknown rank');
		$t3 = Table11Peer::retrieveByRank(3);
		$this->assertEquals(3, $t3->getRank(), 'retrieveByRank() returns the object with the required rank');
		$this->assertEquals('row3', $t3->getTitle(), 'retrieveByRank() returns the object with the required rank');
	}

	public function testReorder()
	{
		$objects = Table11Peer::doSelect(new Criteria());
		$ids = array();
		foreach ($objects as $object) {
			$ids[]= $object->getPrimaryKey();
		}
		$ranks = array(4, 3, 2, 1);
		$order = array_combine($ids, $ranks);
		Table11Peer::reorder($order);
		$expected = array(1 => 'row3', 2 => 'row2', 3 => 'row4', 4 => 'row1');
		$this->assertEquals($expected, $this->getFixturesArray(), 'reorder() reorders the suite');
	}

	public function testDoSelectOrderByRank()
	{
		$objects = Table11Peer::doSelectOrderByRank();
		$oldRank = 0;
		while ($object = array_shift($objects)) {
			$this->assertTrue($object->getRank() > $oldRank);
			$oldRank = $object->getRank();
		}
		$objects = Table11Peer::doSelectOrderByRank(null, Criteria::DESC);
		$oldRank = 10;
		while ($object = array_shift($objects)) {
			$this->assertTrue($object->getRank() < $oldRank);
			$oldRank = $object->getRank();
		}
	}


}