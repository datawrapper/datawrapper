<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreDataPopulator.php';

/**
 * Test class for ModelJoin.
 *
 * @author     François Zaninotto
 * @version    $Id: ModelJoinTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    runtime.query
 */
class ModelJoinTest extends BookstoreTestBase
{
    public function testTableMap()
    {
        $join = new ModelJoin();
        $this->assertNull($join->getTableMap(), 'getTableMap() returns null as long as no table map is set');

        $tmap = new TableMap();
        $tmap->foo = 'bar';

        $join->setTableMap($tmap);
        $this->assertEquals($tmap, $join->getTableMap(), 'getTableMap() returns the TableMap previously set by setTableMap()');
    }

    public function testSetRelationMap()
    {
        $join = new ModelJoin();
        $this->assertNull($join->getRelationMap(), 'getRelationMap() returns null as long as no relation map is set');
        $bookTable = BookPeer::getTableMap();
        $relationMap = $bookTable->getRelation('Author');
        $join->setRelationMap($relationMap);
        $this->assertEquals($relationMap, $join->getRelationMap(), 'getRelationMap() returns the RelationMap previously set by setRelationMap()');
    }

    public function testSetRelationMapDefinesJoinColumns()
    {
        $bookTable = BookPeer::getTableMap();
        $join = new ModelJoin();
        $join->setTableMap($bookTable);
        $join->setRelationMap($bookTable->getRelation('Author'));
        $this->assertEquals(array(BookPeer::AUTHOR_ID), $join->getLeftColumns(), 'setRelationMap() automatically sets the left columns');
        $this->assertEquals(array(AuthorPeer::ID), $join->getRightColumns(), 'setRelationMap() automatically sets the right columns');
    }

    public function testSetRelationMapLeftAlias()
    {
        $bookTable = BookPeer::getTableMap();
        $join = new ModelJoin();
        $join->setTableMap($bookTable);
        $join->setRelationMap($bookTable->getRelation('Author'), 'b');
        $this->assertEquals(array('b.author_id'), $join->getLeftColumns(), 'setRelationMap() automatically sets the left columns using the left table alias');
        $this->assertEquals(array(AuthorPeer::ID), $join->getRightColumns(), 'setRelationMap() automatically sets the right columns');
    }

    public function testSetRelationMapRightAlias()
    {
        $bookTable = BookPeer::getTableMap();
        $join = new ModelJoin();
        $join->setTableMap($bookTable);
        $join->setRelationMap($bookTable->getRelation('Author'), null, 'a');
        $this->assertEquals(array(BookPeer::AUTHOR_ID), $join->getLeftColumns(), 'setRelationMap() automatically sets the left columns');
        $this->assertEquals(array('a.id'), $join->getRightColumns(), 'setRelationMap() automatically sets the right columns  using the right table alias');
    }

    public function testSetRelationMapComposite()
    {
        $table = ReaderFavoritePeer::getTableMap();
        $join = new ModelJoin();
        $join->setTableMap($table);
        $join->setRelationMap($table->getRelation('BookOpinion'));
        $this->assertEquals(array(ReaderFavoritePeer::BOOK_ID, ReaderFavoritePeer::READER_ID), $join->getLeftColumns(), 'setRelationMap() automatically sets the left columns for composite relationships');
        $this->assertEquals(array(BookOpinionPeer::BOOK_ID, BookOpinionPeer::READER_ID), $join->getRightColumns(), 'setRelationMap() automatically sets the right columns for composite relationships');
    }
}
