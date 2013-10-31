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
 * Tests for NestedSetBehaviorQueryBuilderModifier class with scope enabled
 *
 * @author		François Zaninotto
 * @version		$Revision$
 * @package		generator.behavior.nestedset
 */
class NestedSetBehaviorQueryBuilderModifierWithScopeTest extends BookstoreNestedSetTestBase
{
    public function testTreeRoots()
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
        $objs = Table10Query::create()
            ->treeRoots()
            ->find();
        $coll = $this->buildCollection(array($t1, $t8));
        $this->assertEquals($coll, $objs, 'treeRoots() filters by roots');
    }

    public function testInTree()
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
        $tree = Table10Query::create()
            ->inTree(1)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t1, $t2, $t3, $t4, $t5, $t6, $t7));
        $this->assertEquals($coll, $tree, 'inTree() filters by node');
        $tree = Table10Query::create()
            ->inTree(2)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t8, $t9, $t10));
        $this->assertEquals($coll, $tree, 'inTree() filters by node');
    }

    public function testDescendantsOf()
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
        $objs = Table10Query::create()
            ->descendantsOf($t1)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t2, $t3, $t4, $t5, $t6, $t7));
        $this->assertEquals($coll, $objs, 'decendantsOf() filters by descendants of the same scope');
    }

    public function testBranchOf()
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
        $objs = Table10Query::create()
            ->branchOf($t1)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t1, $t2, $t3, $t4, $t5, $t6, $t7));
        $this->assertEquals($coll, $objs, 'branchOf() filters by branch of the same scope');

    }

    public function testChildrenOf()
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
        $objs = Table10Query::create()
            ->childrenOf($t1)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t2, $t3));
        $this->assertEquals($coll, $objs, 'childrenOf() filters by children of the same scope');
    }

    public function testSiblingsOf()
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
        $desc = Table10Query::create()
            ->siblingsOf($t3)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t2));
        $this->assertEquals($coll, $desc, 'siblingsOf() returns filters by siblings of the same scope');
    }

    public function testAncestorsOf()
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
        $objs = Table10Query::create()
            ->ancestorsOf($t5)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t1, $t3), 'ancestorsOf() filters by ancestors of the same scope');
    }

    public function testRootsOf()
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
        $objs = Table10Query::create()
            ->rootsOf($t5)
            ->orderByBranch()
            ->find();
        $coll = $this->buildCollection(array($t1, $t3, $t5), 'rootsOf() filters by ancestors of the same scope');
    }

    public function testFindRoot()
    {
        $this->assertTrue(method_exists('Table10Query', 'findRoot'), 'nested_set adds a findRoot() method');
        Table10Query::create()->deleteAll();
        $this->assertNull(Table10Query::create()->findRoot(1), 'findRoot() returns null as long as no root node is defined');
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
        $this->assertEquals($t1, Table10Query::create()->findRoot(1), 'findRoot() returns a tree root');
        $this->assertEquals($t8, Table10Query::create()->findRoot(2), 'findRoot() returns a tree root');
    }

    public function testFindRoots()
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
        $objs = Table10Query::create()
            ->findRoots();
        $coll = $this->buildCollection(array($t1, $t8));
        $this->assertEquals($coll, $objs, 'findRoots() returns all root objects');
    }

    public function testFindTree()
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
        $tree = Table10Query::create()->findTree(1);
        $coll = $this->buildCollection(array($t1, $t2, $t3, $t4, $t5, $t6, $t7));
        $this->assertEquals($coll, $tree, 'findTree() retrieves the tree of a scope, ordered by branch');
        $tree = Table10Query::create()->findTree(2);
        $coll = $this->buildCollection(array($t8, $t9, $t10));
        $this->assertEquals($coll, $tree, 'findTree() retrieves the tree of a scope, ordered by branch');
    }

    protected function buildCollection($arr)
    {
        $coll = new PropelObjectCollection();
        $coll->setData($arr);
        $coll->setModel('Table10');

        return $coll;
    }

}
