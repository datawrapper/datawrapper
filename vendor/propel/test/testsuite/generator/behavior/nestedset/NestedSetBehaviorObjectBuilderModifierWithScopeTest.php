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
 * Tests for NestedSetBehaviorObjectBuilderModifier class
 *
 * @author		François Zaninotto
 * @version		$Revision$
 * @package		generator.behavior.nestedset
 */
class NestedSetBehaviorObjectBuilderModifierWithScopeTest extends BookstoreNestedSetTestBase
{
	protected function getByTitle($title)
	{
		$c = new Criteria();
		$c->add(Table10Peer::TITLE, $title);
		return Table10Peer::doSelectOne($c);
	}

	/**
	 * @expectedException PropelException
	 */
	public function testSaveRootInTreeWithExistingRootWithSameScope()
	{
		Table10Peer::doDeleteAll();
		$t1 = new Table10();
		$t1->setScopeValue(1);
		$t1->makeRoot();
		$t1->save();
		$t2 = new Table10();
		$t2->setScopeValue(1);
		$t2->makeRoot();
		$t2->save();
	}

	public function testSaveRootInTreeWithExistingRootWithDifferentScope()
	{
		Table10Peer::doDeleteAll();
		$t1 = new Table10();
		$t1->setScopeValue(1);
		$t1->makeRoot();
		$t1->save();
		$t2 = new Table10();
		$t2->setScopeValue(2);
		$t2->makeRoot();
		$t2->save();
		$this->assertTrue(!$t2->isNew());
	}

	public function testDelete()
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
		$t5->delete();
		$expected = array(
			't1' => array(1, 8, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 7, 1),
			't4' => array(5, 6, 2),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(1), 'delete() deletes all descendants and shifts the entire subtree correctly');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'delete() does not delete anything out of the scope');
	}

	public function testIsDescendantOf()
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
		$this->assertFalse($t8->isDescendantOf($t9), 'root is not seen as a child of root');
		$this->assertTrue($t9->isDescendantOf($t8), 'direct child is seen as a child of root');
		try {
			$t2->isDescendantOf($t8);
			$this->fail('isDescendantOf() throws an exception when comparing two nodes of different trees');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'isDescendantOf() throws an exception when comparing two nodes of different trees');
		}
	}

	public function testGetParent()
	{
		$this->initTreeWithScope();
		$t1 = $this->getByTitle('t1');
		$this->assertNull($t1->getParent($this->con), 'getParent() return null for root nodes');
		$t2 = $this->getByTitle('t2');
		$this->assertEquals($t2->getParent($this->con), $t1, 'getParent() correctly retrieves parent for leafs');
		$t3 = $this->getByTitle('t3');
		$this->assertEquals($t3->getParent($this->con), $t1, 'getParent() correctly retrieves parent for nodes');
		$t4 = $this->getByTitle('t4');
		$this->assertEquals($t4->getParent($this->con), $t3, 'getParent() retrieves the same parent for nodes');
	}

	public function testGetPrevSibling()
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
		$this->assertNull($t1->getPrevSibling($this->con), 'getPrevSibling() returns null for root nodes');
		$this->assertNull($t2->getPrevSibling($this->con), 'getPrevSibling() returns null for first siblings');
		$this->assertEquals($t3->getPrevSibling($this->con), $t2, 'getPrevSibling() correctly retrieves prev sibling');
		$this->assertNull($t6->getPrevSibling($this->con), 'getPrevSibling() returns null for first siblings');
		$this->assertEquals($t7->getPrevSibling($this->con), $t6, 'getPrevSibling() correctly retrieves prev sibling');
	}

	public function testGetNextSibling()
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
		$this->assertNull($t1->getNextSibling($this->con), 'getNextSibling() returns null for root nodes');
		$this->assertEquals($t2->getNextSibling($this->con), $t3, 'getNextSibling() correctly retrieves next sibling');
		$this->assertNull($t3->getNextSibling($this->con), 'getNextSibling() returns null for last siblings');
		$this->assertEquals($t6->getNextSibling($this->con), $t7, 'getNextSibling() correctly retrieves next sibling');
		$this->assertNull($t7->getNextSibling($this->con), 'getNextSibling() returns null for last siblings');
	}

	public function testGetDescendants()
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
		$descendants = $t3->getDescendants();
		$expected = array(
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
		);
		$this->assertEquals($expected, $this->dumpNodes($descendants), 'getDescendants() returns descendants from the current scope only');
	}

	public function testGetAncestors()
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
		$this->assertEquals(array(), $t1->getAncestors(), 'getAncestors() returns an empty array for roots');
		$ancestors = $t5->getAncestors();
		$expected = array(
			't1' => array(1, 14, 0),
			't3' => array(4, 13, 1),
		);
		$this->assertEquals($expected, $this->dumpNodes($ancestors), 'getAncestors() returns ancestors from the current scope only');
	}

	public function testInsertAsFirstChildOf()
	{
		$this->assertTrue(method_exists('Table10', 'insertAsFirstChildOf'), 'nested_set adds a insertAsFirstChildOf() method');
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
		$t11 = new PublicTable10();
		$t11->setTitle('t11');
		$t11->insertAsFirstChildOf($fixtures[2]); // first child of t3
		$this->assertEquals(1, $t11->getScopeValue(), 'insertAsFirstChildOf() sets the scope value correctly');
		$t11->save();
		$expected = array(
			't1' => array(1, 16, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 15, 1),
			't4' => array(7, 8, 2),
			't5' => array(9, 14, 2),
			't6' => array(10, 11, 3),
			't7' => array(12, 13, 3),
			't11' => array(5, 6, 2)
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(1), 'insertAsFirstChildOf() shifts the other nodes correctly');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'insertAsFirstChildOf() does not shift anything out of the scope');
	}

	public function testInsertAsFirstChildOfExistingObject()
	{
		Table10Query::create()->deleteAll();
		$t = new Table10();
		$t->setScopeValue(34);
		$t->makeRoot();
		$t->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(2, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$t1 = new Table10();
		$t1->save();
		$t1->insertAsFirstChildOf($t);
		$this->assertEquals(2, $t1->getLeftValue());
		$this->assertEquals(3, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
		$t1->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(4, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$this->assertEquals(2, $t1->getLeftValue());
		$this->assertEquals(3, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
	}

	public function testInsertAsLastChildOf()
	{
		$this->assertTrue(method_exists('Table10', 'insertAsLastChildOf'), 'nested_set adds a insertAsLastChildOf() method');
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
		$t11 = new PublicTable10();
		$t11->setTitle('t11');
		$t11->insertAsLastChildOf($fixtures[2]); // last child of t3
		$this->assertEquals(1, $t11->getScopeValue(), 'insertAsLastChildOf() sets the scope value correctly');
		$t11->save();
		$expected = array(
			't1' => array(1, 16, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 15, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
			't11' => array(13, 14, 2)
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(1), 'insertAsLastChildOf() shifts the other nodes correctly');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'insertAsLastChildOf() does not shift anything out of the scope');
	}

	public function testInsertAsLastChildOfExistingObject()
	{
		Table10Query::create()->deleteAll();
		$t = new Table10();
		$t->setScopeValue(34);
		$t->makeRoot();
		$t->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(2, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$t1 = new Table10();
		$t1->save();
		$t1->insertAsLastChildOf($t);
		$this->assertEquals(2, $t1->getLeftValue());
		$this->assertEquals(3, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
		$t1->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(4, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$this->assertEquals(2, $t1->getLeftValue());
		$this->assertEquals(3, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
	}

	public function testInsertAsPrevSiblingOf()
	{
		$this->assertTrue(method_exists('Table10', 'insertAsPrevSiblingOf'), 'nested_set adds a insertAsPrevSiblingOf() method');
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
		$t11 = new PublicTable10();
		$t11->setTitle('t11');
		$t11->insertAsPrevSiblingOf($fixtures[2]); // prev sibling of t3
		$this->assertEquals(1, $t11->getScopeValue(), 'insertAsPrevSiblingOf() sets the scope value correctly');
		$t11->save();
		$expected = array(
			't1' => array(1, 16, 0),
			't2' => array(2, 3, 1),
			't3' => array(6, 15, 1),
			't4' => array(7, 8, 2),
			't5' => array(9, 14, 2),
			't6' => array(10, 11, 3),
			't7' => array(12, 13, 3),
			't11' => array(4, 5, 1)
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(1), 'insertAsPrevSiblingOf() shifts the other nodes correctly');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'insertAsPrevSiblingOf() does not shift anything out of the scope');
	}

	public function testInsertAsPrevSiblingOfExistingObject()
	{
		Table10Query::create()->deleteAll();
		$t = new Table10();
		$t->setScopeValue(34);
		$t->makeRoot();
		$t->save();
		$t1 = new Table10();
		$t1->insertAsFirstChildOf($t);
		$t1->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(4, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$this->assertEquals(2, $t1->getLeftValue());
		$this->assertEquals(3, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
		$t2 = new Table10();
		$t2->save();
		$t2->insertAsPrevSiblingOf($t1);
		$this->assertEquals(2, $t2->getLeftValue());
		$this->assertEquals(3, $t2->getRightValue());
		$this->assertEquals(34, $t2->getScopeValue());
		$this->assertEquals(1, $t2->getLevel());
		$t2->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(6, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$this->assertEquals(4, $t1->getLeftValue());
		$this->assertEquals(5, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
		$this->assertEquals(2, $t2->getLeftValue());
		$this->assertEquals(3, $t2->getRightValue());
		$this->assertEquals(34, $t2->getScopeValue());
		$this->assertEquals(1, $t2->getLevel());
	}

	public function testInsertAsNextSiblingOf()
	{
		$this->assertTrue(method_exists('Table10', 'insertAsNextSiblingOf'), 'nested_set adds a insertAsNextSiblingOf() method');
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
		$t11 = new PublicTable10();
		$t11->setTitle('t11');
		$t11->insertAsNextSiblingOf($fixtures[2]); // next sibling of t3
		$this->assertEquals(1, $t11->getScopeValue(), 'insertAsNextSiblingOf() sets the scope value correctly');
		$t11->save();
		$expected = array(
			't1' => array(1, 16, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 13, 1),
			't4' => array(5, 6, 2),
			't5' => array(7, 12, 2),
			't6' => array(8, 9, 3),
			't7' => array(10, 11, 3),
			't11' => array(14, 15, 1)
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(1), 'insertAsNextSiblingOf() shifts the other nodes correctly');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'insertAsNextSiblingOf() does not shift anything out of the scope');
	}

	public function testInsertAsNextSiblingOfExistingObject()
	{
		Table10Query::create()->deleteAll();
		$t = new Table10();
		$t->setScopeValue(34);
		$t->makeRoot();
		$t->save();
		$t1 = new Table10();
		$t1->insertAsFirstChildOf($t);
		$t1->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(4, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$this->assertEquals(2, $t1->getLeftValue());
		$this->assertEquals(3, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
		$t2 = new Table10();
		$t2->save();
		$t2->insertAsNextSiblingOf($t1);
		$this->assertEquals(4, $t2->getLeftValue());
		$this->assertEquals(5, $t2->getRightValue());
		$this->assertEquals(34, $t2->getScopeValue());
		$this->assertEquals(1, $t2->getLevel());
		$t2->save();
		$this->assertEquals(1, $t->getLeftValue());
		$this->assertEquals(6, $t->getRightValue());
		$this->assertEquals(0, $t->getLevel());
		$this->assertEquals(2, $t1->getLeftValue());
		$this->assertEquals(3, $t1->getRightValue());
		$this->assertEquals(34, $t1->getScopeValue());
		$this->assertEquals(1, $t1->getLevel());
		$this->assertEquals(4, $t2->getLeftValue());
		$this->assertEquals(5, $t2->getRightValue());
		$this->assertEquals(34, $t2->getScopeValue());
		$this->assertEquals(1, $t2->getLevel());
	}

	public function testMoveToFirstChildOf()
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
		try {
			$t8->moveToFirstChildOf($t3);
			$this->fail('moveToFirstChildOf() throws an exception when the target is in a different tree');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'moveToFirstChildOf() throws an exception when the target is in a different tree');
		}
		try {
			$t5->moveToLastChildOf($t2);
			$this->assertTrue(true, 'moveToFirstChildOf() does not throw an exception when the target is in the same tree');
		} catch (PropelException $e) {
			$this->fail('moveToFirstChildOf() does not throw an exception when the target is in the same tree');
		}
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'moveToFirstChildOf() does not shift anything out of the scope');
	}

	public function testMoveToLastChildOf()
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
		try {
			$t8->moveToLastChildOf($t3);
			$this->fail('moveToLastChildOf() throws an exception when the target is in a different tree');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'moveToLastChildOf() throws an exception when the target is in a different tree');
		}
		try {
			$t5->moveToLastChildOf($t2);
			$this->assertTrue(true, 'moveToLastChildOf() does not throw an exception when the target is in the same tree');
		} catch (PropelException $e) {
			$this->fail('moveToLastChildOf() does not throw an exception when the target is in the same tree');
		}
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'moveToLastChildOf() does not shift anything out of the scope');
	}

	public function testMoveToPrevSiblingOf()
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
		try {
			$t8->moveToPrevSiblingOf($t3);
			$this->fail('moveToPrevSiblingOf() throws an exception when the target is in a different tree');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'moveToPrevSiblingOf() throws an exception when the target is in a different tree');
		}
		try {
			$t5->moveToPrevSiblingOf($t2);
			$this->assertTrue(true, 'moveToPrevSiblingOf() does not throw an exception when the target is in the same tree');
		} catch (PropelException $e) {
			$this->fail('moveToPrevSiblingOf() does not throw an exception when the target is in the same tree');
		}
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'moveToPrevSiblingOf() does not shift anything out of the scope');
	}

	public function testMoveToNextSiblingOf()
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
		try {
			$t8->moveToNextSiblingOf($t3);
			$this->fail('moveToNextSiblingOf() throws an exception when the target is in a different tree');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'moveToNextSiblingOf() throws an exception when the target is in a different tree');
		}
		try {
			$t5->moveToNextSiblingOf($t2);
			$this->assertTrue(true, 'moveToNextSiblingOf() does not throw an exception when the target is in the same tree');
		} catch (PropelException $e) {
			$this->fail('moveToNextSiblingOf() does not throw an exception when the target is in the same tree');
		}
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'moveToNextSiblingOf() does not shift anything out of the scope');
	}

	public function testDeleteDescendants()
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
		$this->assertEquals(4, $t3->deleteDescendants(), 'deleteDescendants() returns the number of deleted nodes');
		$expected = array(
			't1' => array(1, 6, 0),
			't2' => array(2, 3, 1),
			't3' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(1), 'deleteDescendants() shifts the entire subtree correctly');
		$expected = array(
			't8' => array(1, 6, 0),
			't9' => array(2, 3, 1),
			't10' => array(4, 5, 1),
		);
		$this->assertEquals($expected, $this->dumpTreeWithScope(2), 'deleteDescendants() does not delete anything out of the scope');
	}
}