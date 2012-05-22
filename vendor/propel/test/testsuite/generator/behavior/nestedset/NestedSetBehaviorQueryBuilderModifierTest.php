<?php

/*
 *	$Id: NestedSetBehaviorQueryBuilderModifierTest.php 1347 2009-12-03 21:06:36Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/behavior/BookstoreNestedSetTestBase.php';

/**
 * Tests for NestedSetBehaviorQueryBuilderModifier class
 *
 * @author		François Zaninotto
 * @version		$Revision$
 * @package		generator.behavior.nestedset
 */
class NestedSetBehaviorQueryBuilderModifierTest extends BookstoreNestedSetTestBase
{
	public function testDescendantsOf()
	{
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
		$objs = Table9Query::create()
			->descendantsOf($t7)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array());
		$this->assertEquals($coll, $objs, 'decendantsOf() filters by descendants');
		$objs = Table9Query::create()
			->descendantsOf($t3)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t4, $t5, $t6, $t7));
		$this->assertEquals($coll, $objs, 'decendantsOf() filters by descendants');
	}

	public function testBranchOf()
	{
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
		$objs = Table9Query::create()
			->branchOf($t7)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t7));
		$this->assertEquals($coll, $objs, 'branchOf() filters by descendants and includes object passed as parameter');
		$objs = Table9Query::create()
			->branchOf($t3)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t3, $t4, $t5, $t6, $t7));
		$this->assertEquals($coll, $objs, 'branchOf() filters by descendants and includes object passed as parameter');
		$objs = Table9Query::create()
			->branchOf($t1)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t1, $t2, $t3, $t4, $t5, $t6, $t7));
		$this->assertEquals($coll, $objs, 'branchOf() returns the whole tree for the root node');
	}

	public function testChildrenOf()
	{
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
		$objs = Table9Query::create()
			->childrenOf($t6)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array());
		$this->assertEquals($coll, $objs, 'childrenOf() returns empty collection for leaf nodes');
		$objs = Table9Query::create()
			->childrenOf($t5)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t6, $t7));
		$this->assertEquals($coll, $objs, 'childrenOf() filters by children');
		$objs = Table9Query::create()
			->childrenOf($t3)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t4, $t5));
		$this->assertEquals($coll, $objs, 'childrenOf() filters by children and not by descendants');
	}

	public function testSiblingsOf()
	{
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
		$desc = Table9Query::create()
			->siblingsOf($t1)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array());
		$this->assertEquals($coll, $desc, 'siblingsOf() returns empty collection for the root node');
		$desc = Table9Query::create()
			->siblingsOf($t3)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t2));
		$this->assertEquals($coll, $desc, 'siblingsOf() filters by siblings');
	}

	public function testAncestorsOf()
	{
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
		$objs = Table9Query::create()
			->ancestorsOf($t1)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array());
		$this->assertEquals($coll, $objs, 'ancestorsOf() returns empty collection for root node');
		$objs = Table9Query::create()
			->ancestorsOf($t3)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t1));
		$this->assertEquals($coll, $objs, 'ancestorsOf() filters by ancestors');
		$objs = Table9Query::create()
			->ancestorsOf($t7)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t1, $t3, $t5));
		$this->assertEquals($coll, $objs, 'childrenOf() filters by ancestors');
	}

	public function testRootsOf()
	{
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
		$objs = Table9Query::create()
			->rootsOf($t1)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t1));
		$this->assertEquals($coll, $objs, 'rootsOf() returns the root node for root node');
		$objs = Table9Query::create()
			->rootsOf($t3)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t1, $t3));
		$this->assertEquals($coll, $objs, 'rootsOf() filters by ancestors and includes the node passed as parameter');
		$objs = Table9Query::create()
			->rootsOf($t7)
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t1, $t3, $t5, $t7));
		$this->assertEquals($coll, $objs, 'rootsOf() filters by ancestors  and includes the node passed as parameter');
	}

	public function testOrderByBranch()
	{
		list($t1, $t2, $t3, $t4, $t5, $t6, $t7) = $this->initTree();
		$t5->moveToPrevSiblingOf($t4);
		/* Results in
		 t1
		 |  \
		 t2 t3
		    |  \
		    t5 t4
		    | \
		    t6 t7
		*/
		$objs = Table9Query::create()
			->orderByBranch()
			->find();
		$coll = $this->buildCollection(array($t1, $t2, $t3, $t5, $t6, $t7, $t4), 'orderByBranch() orders by branch left to right');
		$objs = Table9Query::create()
			->orderByBranch(true)
			->find();
		$coll = $this->buildCollection(array($t4, $t7, $t6, $t5, $t3, $t2, $t1), 'orderByBranch(true) orders by branch right to left');
	}

	public function testOrderByLevel()
	{
		list($t1, $t2, $t3, $t4, $t5, $t6, $t7) = $this->initTree();
		$t5->moveToPrevSiblingOf($t4);
		/* Results in
		 t1
		 |  \
		 t2 t3
		    |  \
		    t5 t4
		    | \
		    t6 t7
		*/
		$objs = Table9Query::create()
			->orderByLevel()
			->find();
		$coll = $this->buildCollection(array($t1, $t2, $t5, $t4, $t6, $t7), 'orderByLevel() orders by level, from the root to the leaf');
		$objs = Table9Query::create()
			->orderByLevel(true)
			->find();
		$coll = $this->buildCollection(array($t7, $t6, $t4, $t5, $t2, $t1), 'orderByLevel(true) orders by level, from the leaf to the root');
	}

	public function testFindRoot()
	{
		$this->assertTrue(method_exists('Table9Query', 'findRoot'), 'nested_set adds a findRoot() method');
		Table9Query::create()->deleteAll();
		$this->assertNull(Table9Query::create()->findRoot(), 'findRoot() returns null as long as no root node is defined');
		$t1 = new Table9();
		$t1->setLeftValue(123);
		$t1->setRightValue(456);
		$t1->save();
		$this->assertNull(Table9Query::create()->findRoot(), 'findRoot() returns null as long as no root node is defined');
		$t2 = new Table9();
		$t2->setLeftValue(1);
		$t2->setRightValue(2);
		$t2->save();
		$this->assertEquals(Table9Query::create()->findRoot(), $t2, 'findRoot() retrieves the root node');
	}

	public function testfindTree()
	{
		list($t1, $t2, $t3, $t4, $t5, $t6, $t7) = $this->initTree();
		$tree = Table9Query::create()->findTree();
		$coll = $this->buildCollection(array($t1, $t2, $t3, $t4, $t5, $t6, $t7));
		$this->assertEquals($coll, $tree, 'findTree() retrieves the whole tree, ordered by branch');
	}

	protected function buildCollection($arr)
	{
		$coll = new PropelObjectCollection();
		$coll->setData($arr);
		$coll->setModel('Table9');

		return $coll;
	}

}
