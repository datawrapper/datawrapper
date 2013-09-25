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
 * Tests for SortableBehavior class query modifier when the scope is enabled
 *
 * @author		Francois Zaninotto
 * @version		$Revision$
 * @package		generator.behavior.sortable
 */
class SortableBehaviorQueryBuilderModifierWithScopeTest extends BookstoreSortableTestBase
{
    protected function setUp()
    {
        parent::setUp();
        $this->populateTable12();
    }

    public function testInList()
    {
        /* List used for tests
         scope=1   scope=2
         row1      row5
         row2      row6
         row3
         row4
        */
        $query = Table12Query::create()->inList(1);
        $expectedQuery = Table12Query::create()->add(Table12Peer::MY_SCOPE_COLUMN, 1, Criteria::EQUAL);
        $this->assertEquals($expectedQuery, $query, 'inList() filters the query by scope');
        $this->assertEquals(4, $query->count(), 'inList() filters the query by scope');
        $query = Table12Query::create()->inList(2);
        $expectedQuery = Table12Query::create()->add(Table12Peer::MY_SCOPE_COLUMN, 2, Criteria::EQUAL);
        $this->assertEquals($expectedQuery, $query, 'inList() filters the query by scope');
        $this->assertEquals(2, $query->count(), 'inList() filters the query by scope');
    }

    public function testFilterByRank()
    {
        /* List used for tests
         scope=1   scope=2
         row1      row5
         row2      row6
         row3
         row4
        */
        $this->assertEquals('row1', Table12Query::create()->filterByRank(1, 1)->findOne()->getTitle(), 'filterByRank() filters on the rank and the scope');
        $this->assertEquals('row5', Table12Query::create()->filterByRank(1, 2)->findOne()->getTitle(), 'filterByRank() filters on the rank and the scope');
        $this->assertEquals('row4', Table12Query::create()->filterByRank(4, 1)->findOne()->getTitle(), 'filterByRank() filters on the rank and the scope');
        $this->assertNull(Table12Query::create()->filterByRank(4, 2)->findOne(), 'filterByRank() filters on the rank and the scope, which makes the query return no result on a non-existent rank');
    }

    public function testOrderByRank()
    {
        $this->assertTrue(Table12Query::create()->orderByRank() instanceof Table12Query, 'orderByRank() returns the current query object');
        // default order
        $query = Table12Query::create()->orderByRank();
        $expectedQuery = Table12Query::create()->addAscendingOrderByColumn(Table12Peer::POSITION);
        $this->assertEquals($expectedQuery, $query, 'orderByRank() orders the query by rank asc');
        // asc order
        $query = Table12Query::create()->orderByRank(Criteria::ASC);
        $expectedQuery = Table12Query::create()->addAscendingOrderByColumn(Table12Peer::POSITION);
        $this->assertEquals($expectedQuery, $query, 'orderByRank() orders the query by rank, using the argument as sort direction');
        // desc order
        $query = Table12Query::create()->orderByRank(Criteria::DESC);
        $expectedQuery = Table12Query::create()->addDescendingOrderByColumn(Table12Peer::POSITION);
        $this->assertEquals($expectedQuery, $query, 'orderByRank() orders the query by rank, using the argument as sort direction');
    }

    public function testFindList()
    {
        $ts = Table12Query::create()->findList(1);
        $this->assertTrue($ts instanceof PropelObjectCollection, 'findList() returns a collection of objects');
        $this->assertEquals(4, count($ts), 'findList() filters the query by scope');
        $this->assertEquals('row1', $ts[0]->getTitle(), 'findList() returns an ordered scoped list');
        $this->assertEquals('row2', $ts[1]->getTitle(), 'findList() returns an ordered scoped list');
        $this->assertEquals('row3', $ts[2]->getTitle(), 'findList() returns an ordered scoped list');
        $this->assertEquals('row4', $ts[3]->getTitle(), 'findList() returns an ordered scoped list');
        $ts = Table12Query::create()->findList(2);
        $this->assertEquals(2, count($ts), 'findList() filters the query by scope');
        $this->assertEquals('row5', $ts[0]->getTitle(), 'findList() returns an ordered scoped list');
        $this->assertEquals('row6', $ts[1]->getTitle(), 'findList() returns an ordered scoped list');
    }

    public function testFindOneByRank()
    {
        $this->assertTrue(Table12Query::create()->findOneByRank(1, 1) instanceof Table12, 'findOneByRank() returns an instance of the model object');
        $this->assertEquals('row1', Table12Query::create()->findOneByRank(1, 1)->getTitle(), 'findOneByRank() returns a single item based on the rank and the scope');
        $this->assertEquals('row5', Table12Query::create()->findOneByRank(1, 2)->getTitle(), 'findOneByRank() returns a single item based on the rank and the scope');
        $this->assertEquals('row4', Table12Query::create()->findOneByRank(4, 1)->getTitle(), 'findOneByRank() returns a single item based on the rank a,d the scope');
        $this->assertNull(Table12Query::create()->findOneByRank(4, 2), 'findOneByRank() returns no result on a non-existent rank and scope');
    }

    public function testGetMaxRank()
    {
        $this->assertEquals(4, Table12Query::create()->getMaxRank(1), 'getMaxRank() returns the maximum rank in the scope');
        $this->assertEquals(2, Table12Query::create()->getMaxRank(2), 'getMaxRank() returns the maximum rank in the scope');
        // delete one
        $t4 = Table12Query::create()->findOneByRank(4, 1);
        $t4->delete();
        $this->assertEquals(3, Table12Query::create()->getMaxRank(1), 'getMaxRank() returns the maximum rank');
        // add one
        $t = new Table12();
        $t->setMyScopeColumn(1);
        $t->save();
        $this->assertEquals(4, Table12Query::create()->getMaxRank(1), 'getMaxRank() returns the maximum rank');
        // delete all
        Table12Query::create()->deleteAll();
        $this->assertNull(Table12Query::create()->getMaxRank(1), 'getMaxRank() returns null for empty tables');
        // add one
        $t = new Table12();
        $t->setMyScopeColumn(1);
        $t->save();
        $this->assertEquals(1, Table12Query::create()->getMaxRank(1), 'getMaxRank() returns the maximum rank');
    }

    public function testReorder()
    {
        $objects = Table12Query::create()->findList(1);
        $ids = array();
        foreach ($objects as $object) {
            $ids[]= $object->getPrimaryKey();
        }
        $ranks = array(4, 3, 2, 1);
        $order = array_combine($ids, $ranks);
        Table12Query::create()->reorder($order);
        $expected = array(1 => 'row4', 2 => 'row3', 3 => 'row2', 4 => 'row1');
        $this->assertEquals($expected, $this->getFixturesArrayWithScope(1), 'reorder() reorders the suite');
        $expected = array(1 => 'row5', 2 => 'row6');
        $this->assertEquals($expected, $this->getFixturesArrayWithScope(2), 'reorder() leaves other suites unchanged');
    }
}
