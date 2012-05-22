<?php

/*
 *	$Id$
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/behavior/BookstoreNestedSetTestBase.php';

/**
 * Tests for NestedSetBehaviorPeerBuilderModifier class
 *
 * @author		François Zaninotto
 * @version		$Revision$
 * @package		generator.behavior.nestedset
 */
class NestedSetBehaviorPeerBuilderModifierTest extends BookstoreNestedSetTestBase
{
	public function testConstants()
	{
		$this->assertEquals(Table9Peer::LEFT_COL, 'table9.TREE_LEFT', 'nested_set adds a LEFT_COL constant');
		$this->assertEquals(Table9Peer::RIGHT_COL, 'table9.TREE_RIGHT', 'nested_set adds a RIGHT_COL constant');
		$this->assertEquals(Table9Peer::LEVEL_COL, 'table9.TREE_LEVEL', 'nested_set adds a LEVEL_COL constant');
	}

	public function testRetrieveRoot()
	{
		$this->assertTrue(method_exists('Table9Peer', 'retrieveRoot'), 'nested_set adds a retrieveRoot() method');
		Table9Peer::doDeleteAll();
		$this->assertNull(Table9Peer::retrieveRoot(), 'retrieveRoot() returns null as long as no root node is defined');
		$t1 = new Table9();
		$t1->setLeftValue(123);
		$t1->setRightValue(456);
		$t1->save();
		$this->assertNull(Table9Peer::retrieveRoot(), 'retrieveRoot() returns null as long as no root node is defined');
		$t2 = new Table9();
		$t2->setLeftValue(1);
		$t2->setRightValue(2);
		$t2->save();
		$this->assertEquals(Table9Peer::retrieveRoot(), $t2, 'retrieveRoot() retrieves the root node');
	}

	public function testRetrieveTree()
	{
		list($t1, $t2, $t3, $t4, $t5, $t6, $t7) = $this->initTree();
		$tree = Table9Peer::retrieveTree();
		$this->assertEquals(array($t1, $t2, $t3, $t4, $t5, $t6, $t7), $tree, 'retrieveTree() retrieves the whole tree');
		$c = new Criteria();
		$c->add(Table9Peer::LEFT_COL, 4, Criteria::GREATER_EQUAL);
		$tree = Table9Peer::retrieveTree($c);
		$this->assertEquals(array($t3, $t4, $t5, $t6, $t7), $tree, 'retrieveTree() accepts a Criteria as first parameter');
	}

	public function testIsValid()
	{
		$this->assertTrue(method_exists('Table9Peer', 'isValid'), 'nested_set adds an isValid() method');
		$this->assertFalse(Table9Peer::isValid(null), 'isValid() returns false when passed null ');
		$t1 = new Table9();
		$this->assertFalse(Table9Peer::isValid($t1), 'isValid() returns false when passed an empty node object');
		$t2 = new Table9();
		$t2->setLeftValue(5)->setRightValue(2);
		$this->assertFalse(Table9Peer::isValid($t2), 'isValid() returns false when passed a node object with left > right');
		$t3 = new Table9();
		$t3->setLeftValue(5)->setRightValue(5);
		$this->assertFalse(Table9Peer::isValid($t3), 'isValid() returns false when passed a node object with left = right');
		$t4 = new Table9();
		$t4->setLeftValue(2)->setRightValue(5);
		$this->assertTrue(Table9Peer::isValid($t4), 'isValid() returns true when passed a node object with left < right');
	}

	public function testDeleteTree()
	{
		$this->initTree();
		Table9Peer::deleteTree();
		$this->assertEquals(array(), Table9Peer::doSelect(new Criteria()), 'deleteTree() deletes the whole tree');
	}

	public function testShiftRLValuesDelta()
	{
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 1, $left = 1);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(2, 15, 0),
			't2' => array(3, 4, 1),
			't3' => array(5, 14, 1),
			't4' => array(6, 7, 2),
			't5' => array(8, 13, 2),
			't6' => array(9, 10, 3),
			't7' => array(11, 12, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues shifts all nodes with a positive amount');
		$this->initTree();
		Table9Peer::shiftRLValues($delta = -1, $left = 1);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(0, 13, 0),
			't2' => array(1, 2, 1),
			't3' => array(3, 12, 1),
			't4' => array(4, 5, 2),
			't5' => array(6, 11, 2),
			't6' => array(7, 8, 3),
			't7' => array(9, 10, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues can shift all nodes with a negative amount');
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 3, $left = 1);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1'=> array(4, 17, 0),
			't2' => array(5, 6, 1),
			't3' => array(7, 16, 1),
			't4' => array(8, 9, 2),
			't5' => array(10, 15, 2),
			't6' => array(11, 12, 3),
			't7' => array(13, 14, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues shifts all nodes several units to the right');
		Table9Peer::shiftRLValues($delta = -3, $left = 1);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues shifts all nodes several units to the left');
	}

	public function testShiftRLValuesLeftLimit()
	{
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 1, $left = 15);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues does not shift anything when the left parameter is higher than the highest right value');
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 1, $left = 5);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 15, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 14, 1),
			't4' => array(6, 7, 2),
			't5' => array(8, 13, 2),
			't6' => array(9, 10, 3),
			't7' => array(11, 12, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues shifts only the nodes having a LR value higher than the given left parameter');
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 1, $left = 1);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1'=> array(2, 15, 0),
			't2' => array(3, 4, 1),
			't3' => array(5, 14, 1),
			't4' => array(6, 7, 2),
			't5' => array(8, 13, 2),
			't6' => array(9, 10, 3),
			't7' => array(11, 12, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues shifts all nodes when the left parameter is 1');
	}

	public function testShiftRLValuesRightLimit()
	{
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 1, $left = 1, $right = 0);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues does not shift anything when the right parameter is 0');
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 1, $left = 1, $right = 5);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(2, 14, 0),
			't2' => array(3, 4, 1),
			't3' => array(5, 13, 1),
			't4' => array(6, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues shiftRLValues shifts only the nodes having a LR value lower than the given right parameter');
		$this->initTree();
		Table9Peer::shiftRLValues($delta = 1, $left = 1, $right = 15);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1'=> array(2, 15, 0),
			't2' => array(3, 4, 1),
			't3' => array(5, 14, 1),
			't4' => array(6, 7, 2),
			't5' => array(8, 13, 2),
			't6' => array(9, 10, 3),
			't7' => array(11, 12, 3),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftRLValues shifts all nodes when the right parameter is higher than the highest right value');
	}

	public function testShiftLevel()
	{
		/* Tree used for tests
		 t1
		 |  \
		 t2 t3
		    |  \
		    t4 t5
		       |  \
		       t6 t7
		*/
		$this->initTree();
		Table9Peer::shiftLevel($delta = 1, $first = 7, $last = 12);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 3),
			't6' => array(8, 9, 4),
			't7' => array(10, 11, 4),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftLevel shifts all nodes with a left value between the first and last');
		$this->initTree();
		Table9Peer::shiftLevel($delta = -1, $first = 7, $last = 12);
		Table9Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 1),
			't6' => array(8, 9, 2),
			't7' => array(10, 11, 2),
		);
		$this->assertEquals($this->dumpTree(), $expected, 'shiftLevel shifts all nodes wit ha negative amount');
	}

	public function testUpdateLoadedNodes()
	{
		$this->assertTrue(method_exists('Table9Peer', 'updateLoadedNodes'), 'nested_set adds a updateLoadedNodes() method');
		$fixtures = $this->initTree();
		Table9Peer::shiftRLValues(1, 5);
		$expected = array(
			't1' => array(1, 14),
			't2' => array(2, 3),
			't3' => array(4, 13),
			't4' => array(5, 6),
			't5' => array(7, 12),
			't6' => array(8, 9),
			't7' => array(10, 11),
		);
		$actual = array();
		foreach ($fixtures as $t) {
			$actual[$t->getTitle()] = array($t->getLeftValue(), $t->getRightValue());
		}
		$this->assertEquals($actual, $expected, 'Loaded nodes are not in sync before calling updateLoadedNodes()');
		Table9Peer::updateLoadedNodes();
		$expected = array(
			't1' => array(1, 15),
			't2' => array(2, 3),
			't3' => array(4, 14),
			't4' => array(6, 7),
			't5' => array(8, 13),
			't6' => array(9, 10),
			't7' => array(11, 12),
		);
		$actual = array();
		foreach ($fixtures as $t) {
			$actual[$t->getTitle()] = array($t->getLeftValue(), $t->getRightValue());
		}
		$this->assertEquals($actual, $expected, 'Loaded nodes are in sync after calling updateLoadedNodes()');
	}

	public function testMakeRoomForLeaf()
	{
		$this->assertTrue(method_exists('Table9Peer', 'makeRoomForLeaf'), 'nested_set adds a makeRoomForLeaf() method');
		list($t1, $t2, $t3, $t4, $t5, $t6, $t7) = $this->initTree();
		/* Tree used for tests
		 t1
		 |  \
		 t2 t3
		    |  \
		    t4 t5
		       |  \
		       t6 t7
		*/
		$t = Table9Peer::makeRoomForLeaf(5); // first child of t3
		$expected = array(
			't1' => array(1, 16, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 15, 1),
			't4' => array(7, 8, 2),
			't5' => array(9, 14, 2),
			't6' => array(10, 11, 3),
			't7' => array(12, 13, 3),
		);
		$this->assertEquals($expected, $this->dumpTree(), 'makeRoomForLeaf() shifts the other nodes correctly');
		foreach ($expected as $key => $values)
		{
			$this->assertEquals($values, array($$key->getLeftValue(), $$key->getRightValue(), $$key->getLevel()), 'makeRoomForLeaf() updates nodes already in memory');
		}
	}

	public function testFixLevels()
	{
		$fixtures = $this->initTree();
		// reset the levels
		foreach ($fixtures as $node) {
			$node->setLevel(null)->save();
		}
		// fix the levels
		Table9Peer::fixLevels();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
		);
		$this->assertEquals($expected, $this->dumpTree(), 'fixLevels() fixes the levels correctly');
		Table9Peer::fixLevels();
		$this->assertEquals($expected, $this->dumpTree(), 'fixLevels() can be called several times');
	}
}
