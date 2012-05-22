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
class NestedSetBehaviorPeerBuilderModifierWithScopeTest extends BookstoreNestedSetTestBase
{
	public function testConstants()
	{
		$this->assertEquals(Table10Peer::LEFT_COL, 'table10.MY_LEFT_COLUMN', 'nested_set adds a LEFT_COL constant using the custom left_column parameter');
		$this->assertEquals(Table10Peer::RIGHT_COL, 'table10.MY_RIGHT_COLUMN', 'nested_set adds a RIGHT_COL constant using the custom right_column parameter');
		$this->assertEquals(Table10Peer::LEVEL_COL, 'table10.MY_LEVEL_COLUMN', 'nested_set adds a LEVEL_COL constant using the custom level_column parameter');
		$this->assertEquals(Table10Peer::SCOPE_COL, 'table10.MY_SCOPE_COLUMN', 'nested_set adds a SCOPE_COL constant when the use_scope parameter is true');
	}

	public function testRetrieveRoots()
	{
		$this->assertTrue(method_exists('Table10Peer', 'retrieveRoots'), 'nested_set adds a retrieveRoots() method for trees that use scope');
		$this->assertFalse(method_exists('Table9Peer', 'retrieveRoots'), 'nested_set does not add a retrieveRoots() method for trees that don\'t use scope');
		list($t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9, $t10) = $this->initTreeWithScope();
		/* Tree used for tests
		 Scope 1
		 t1
		 |  \
		 t2 t3
		    |  \
		    t4 t5
		       |  \
		       t6 t7
		 Scope 2
		 t8
		 | \
		 t9 t10
		*/
		$this->assertEquals(array($t1, $t8), Table10Peer::retrieveRoots(), 'retrieveRoots() returns the tree roots');
		$c = new Criteria();
		$c->add(Table10Peer::TITLE, 't1');
		$this->assertEquals(array($t1), Table10Peer::retrieveRoots($c), 'retrieveRoots() accepts a Criteria as first parameter');
	}

  public function testRetrieveRoot()
	{
		$this->assertTrue(method_exists('Table10Peer', 'retrieveRoot'), 'nested_set adds a retrieveRoot() method');
		Table10Peer::doDeleteAll();
		$t1 = new Table10();
		$t1->setLeftValue(1);
		$t1->setRightValue(2);
		$t1->setScopeValue(2);
		$t1->save();
		$this->assertNull(Table10Peer::retrieveRoot(1), 'retrieveRoot() returns null as long as no root node is defined in the required scope');
		$t2 = new Table10();
		$t2->setLeftValue(1);
		$t2->setRightValue(2);
		$t2->setScopeValue(1);
		$t2->save();
		$this->assertEquals(Table10Peer::retrieveRoot(1), $t2, 'retrieveRoot() retrieves the root node in the required scope');
	}

	public function testRetrieveTree()
	{
		list($t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9, $t10) = $this->initTreeWithScope();
		/* Tree used for tests
		 Scope 1
		 t1
		 |  \
		 t2 t3
		    |  \
		    t4 t5
		       |  \
		       t6 t7
		 Scope 2
		 t8
		 | \
		 t9 t10
		*/
		$tree = Table10Peer::retrieveTree(1);
		$this->assertEquals(array($t1, $t2, $t3, $t4, $t5, $t6, $t7), $tree, 'retrieveTree() retrieves the scoped tree');
		$tree = Table10Peer::retrieveTree(2);
		$this->assertEquals(array($t8, $t9, $t10), $tree, 'retrieveTree() retrieves the scoped tree');
		$c = new Criteria();
		$c->add(Table10Peer::LEFT_COL, 4, Criteria::GREATER_EQUAL);
		$tree = Table10Peer::retrieveTree(1, $c);
		$this->assertEquals(array($t3, $t4, $t5, $t6, $t7), $tree, 'retrieveTree() accepts a Criteria as first parameter');
	}

	public function testDeleteTree()
	{
		$this->initTreeWithScope();
		Table10Peer::deleteTree(1);
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($this->dumpTreeWithScope(2), $expected, 'deleteTree() does not delete anything out of the scope');
	}

	public function testShiftRLValues()
	{
		$this->assertTrue(method_exists('Table10Peer', 'shiftRLValues'), 'nested_set adds a shiftRLValues() method');
		$this->initTreeWithScope();
		Table10Peer::shiftRLValues(1, 100, null, 1);
		Table10Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
		);
		$this->assertEquals($this->dumpTreeWithScope(1), $expected, 'shiftRLValues does not shift anything when the first parameter is higher than the highest right value');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($this->dumpTreeWithScope(2), $expected, 'shiftRLValues does not shift anything out of the scope');
		$this->initTreeWithScope();
		Table10Peer::shiftRLValues(1, 1, null, 1);
		Table10Peer::clearInstancePool();
		$expected = array(
			't1' => array(2, 15, 0),
			't2' => array(3, 4, 1),
			't3' => array(5, 14, 1),
			't4' => array(6, 7, 2),
			't5' => array(8, 13, 2),
			't6' => array(9, 10, 3),
			't7' => array(11, 12, 3),
		);
		$this->assertEquals($this->dumpTreeWithScope(1), $expected, 'shiftRLValues can shift all nodes to the right');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($this->dumpTreeWithScope(2), $expected, 'shiftRLValues does not shift anything out of the scope');
		$this->initTreeWithScope();
		Table10Peer::shiftRLValues(-1, 1, null, 1);
		Table10Peer::clearInstancePool();
		$expected = array(
			't1' => array(0, 13, 0),
			't2' => array(1, 2, 1),
			't3' => array(3, 12, 1),
			't4' => array(4, 5, 2),
			't5' => array(6, 11, 2),
			't6' => array(7, 8, 3),
			't7' => array(9, 10, 3),
		);
		$this->assertEquals($this->dumpTreeWithScope(1), $expected, 'shiftRLValues can shift all nodes to the left');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($this->dumpTreeWithScope(2), $expected, 'shiftRLValues does not shift anything out of the scope');
		$this->initTreeWithScope();
		Table10Peer::shiftRLValues(1, 5, null, 1);
		Table10Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 15, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 14, 1),
			't4' => array(6, 7, 2),
			't5' => array(8, 13, 2),
			't6' => array(9, 10, 3),
			't7' => array(11, 12, 3),
		);
		$this->assertEquals($this->dumpTreeWithScope(1), $expected, 'shiftRLValues can shift some nodes to the right');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($this->dumpTreeWithScope(2), $expected, 'shiftRLValues does not shift anything out of the scope');
	}

	public function testShiftLevel()
	{
		$this->initTreeWithScope();
		Table10Peer::shiftLevel($delta = 1, $first = 7, $last = 12, $scope = 1);
		Table10Peer::clearInstancePool();
		$expected = array(
			't1' => array(1, 14, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 3),
			't6' => array(8, 9, 4),
			't7' => array(10, 11, 4),
		);
		$this->assertEquals($this->dumpTreeWithScope(1), $expected, 'shiftLevel can shift level whith a scope');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($this->dumpTreeWithScope(2), $expected, 'shiftLevel does not shift anything out of the scope');
	}

	public function testMakeRoomForLeaf()
	{
		$this->assertTrue(method_exists('Table10Peer', 'makeRoomForLeaf'), 'nested_set adds a makeRoomForLeaf() method');
		$fixtures = $this->initTreeWithScope();
		/* Tree used for tests
		 Scope 1
		 t1
		 |  \
		 t2 t3
		    |  \
		    t4 t5
		       |  \
		       t6 t7
		 Scope 2
		 t8
		 | \
		 t9 t10
		*/
		$t = Table10Peer::makeRoomForLeaf(5, 1); // first child of t3
		$expected = array(
			't1' => array(1, 16, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 15, 1),
			't4' => array(7, 8, 2),
			't5' => array(9, 14, 2),
			't6' => array(10, 11, 3),
			't7' => array(12, 13, 3),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(1), 'makeRoomForLeaf() shifts the other nodes correctly');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'makeRoomForLeaf() does not shift anything out of the scope');
	}
}