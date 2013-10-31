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
 * Test class for SubQueryTest.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.query
 */
class SubQueryTest extends BookstoreTestBase
{
    protected function assertCriteriaTranslation($criteria, $expectedSql, $expectedParams, $message = '')
    {
        $params = array();
        $result = BasePeer::createSelectSql($criteria, $params);

        $this->assertEquals($expectedSql, $result, $message);
        $this->assertEquals($expectedParams, $params, $message);
    }

    public function testSubQueryExplicit()
    {
        $subCriteria = new BookQuery();
        BookPeer::addSelectColumns($subCriteria);
        $subCriteria->orderByTitle(Criteria::ASC);

        $c = new BookQuery();
        BookPeer::addSelectColumns($c, 'subCriteriaAlias');
        $c->addSelectQuery($subCriteria, 'subCriteriaAlias', false);
        $c->groupBy('subCriteriaAlias.AuthorId');

        $sql = "SELECT subCriteriaAlias.id, subCriteriaAlias.title, subCriteriaAlias.isbn, subCriteriaAlias.price, subCriteriaAlias.publisher_id, subCriteriaAlias.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book` ORDER BY book.title ASC) AS subCriteriaAlias GROUP BY subCriteriaAlias.author_id";
        $params = array();
        $this->assertCriteriaTranslation($c, $sql, $params, 'addSubQueryCriteriaInFrom() combines two queries succesfully');
    }

    public function testSubQueryWithoutSelect()
    {
        $subCriteria = new BookQuery();
        // no addSelectColumns()

        $c = new BookQuery();
        $c->addSelectQuery($subCriteria, 'subCriteriaAlias');
        $c->filterByPrice(20, Criteria::LESS_THAN);

        $sql = "SELECT subCriteriaAlias.id, subCriteriaAlias.title, subCriteriaAlias.isbn, subCriteriaAlias.price, subCriteriaAlias.publisher_id, subCriteriaAlias.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book`) AS subCriteriaAlias WHERE subCriteriaAlias.price<:p1";
        $params = array(
            array('table' => 'book', 'column' => 'price', 'value' => 20),
        );
        $this->assertCriteriaTranslation($c, $sql, $params, 'addSelectQuery() adds select columns if none given');
    }

    public function testSubQueryWithoutAlias()
    {
        $subCriteria = new BookQuery();
        $subCriteria->addSelfSelectColumns();

        $c = new BookQuery();
        $c->addSelectQuery($subCriteria); // no alias
        $c->filterByPrice(20, Criteria::LESS_THAN);

        $sql = "SELECT alias_1.id, alias_1.title, alias_1.isbn, alias_1.price, alias_1.publisher_id, alias_1.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book`) AS alias_1 WHERE alias_1.price<:p1";
        $params = array(
            array('table' => 'book', 'column' => 'price', 'value' => 20),
        );
        $this->assertCriteriaTranslation($c, $sql, $params, 'addSelectQuery() forges a unique alias if none is given');
    }

    public function testSubQueryWithoutAliasAndSelect()
    {
        $subCriteria = new BookQuery();
        // no select

        $c = new BookQuery();
        $c->addSelectQuery($subCriteria); // no alias
        $c->filterByPrice(20, Criteria::LESS_THAN);

        $sql = "SELECT alias_1.id, alias_1.title, alias_1.isbn, alias_1.price, alias_1.publisher_id, alias_1.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book`) AS alias_1 WHERE alias_1.price<:p1";
        $params = array(
            array('table' => 'book', 'column' => 'price', 'value' => 20),
        );
        $this->assertCriteriaTranslation($c, $sql, $params, 'addSelectQuery() forges a unique alias and adds select columns by default');
    }

    public function testSubQueryWithoutAliasSeveral()
    {
        $c1 = new BookQuery();
        $c1->filterByPrice(10, Criteria::GREATER_THAN);

        $c2 = new BookQuery();
        $c2->filterByPrice(20, Criteria::LESS_THAN);

        $c3 = new BookQuery();
        $c3->addSelectQuery($c1); // no alias
        $c3->addSelectQuery($c2); // no alias
        $c3->filterByTitle('War%');

        $sql = "SELECT alias_1.id, alias_1.title, alias_1.isbn, alias_1.price, alias_1.publisher_id, alias_1.author_id, alias_2.id, alias_2.title, alias_2.isbn, alias_2.price, alias_2.publisher_id, alias_2.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book` WHERE book.price>:p2) AS alias_1, (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book` WHERE book.price<:p3) AS alias_2 WHERE alias_2.title LIKE :p1";
        $params = array(
            array('table' => 'book', 'column' => 'title', 'value' => 'War%'),
            array('table' => 'book', 'column' => 'price', 'value' => 10),
            array('table' => 'book', 'column' => 'price', 'value' => 20),
        );
        $this->assertCriteriaTranslation($c3, $sql, $params, 'addSelectQuery() forges a unique alias if none is given');
    }

    public function testSubQueryWithoutAliasRecursive()
    {
        $c1 = new BookQuery();

        $c2 = new BookQuery();
        $c2->addSelectQuery($c1); // no alias
        $c2->filterByPrice(20, Criteria::LESS_THAN);

        $c3 = new BookQuery();
        $c3->addSelectQuery($c2); // no alias
        $c3->filterByTitle('War%');

        $sql = "SELECT alias_2.id, alias_2.title, alias_2.isbn, alias_2.price, alias_2.publisher_id, alias_2.author_id FROM (SELECT alias_1.id, alias_1.title, alias_1.isbn, alias_1.price, alias_1.publisher_id, alias_1.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book`) AS alias_1 WHERE alias_1.price<:p2) AS alias_2 WHERE alias_2.title LIKE :p1";
        $params = array(
            array('table' => 'book', 'column' => 'title', 'value' => 'War%'),
            array('table' => 'book', 'column' => 'price', 'value' => 20),
        );
        $this->assertCriteriaTranslation($c3, $sql, $params, 'addSelectQuery() forges a unique alias if none is given');
    }

    public function testSubQueryWithJoin()
    {
        $c1 = BookQuery::create()
            ->useAuthorQuery()
                ->filterByLastName('Rowling')
            ->endUse();

        $c2 = new BookQuery();
        $c2->addSelectQuery($c1, 'subQuery');
        $c2->filterByPrice(20, Criteria::LESS_THAN);

        $sql = "SELECT subQuery.id, subQuery.title, subQuery.isbn, subQuery.price, subQuery.publisher_id, subQuery.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book` LEFT JOIN `author` ON (book.author_id=author.id) WHERE author.last_name=:p2) AS subQuery WHERE subQuery.price<:p1";
        $params = array(
            array('table' => 'book', 'column' => 'price', 'value' => 20),
            array('table' => 'author', 'column' => 'last_name', 'value' => 'Rowling'),
        );
        $this->assertCriteriaTranslation($c2, $sql, $params, 'addSelectQuery() can add a select query with a join');
    }

    public function testSubQueryParameters()
    {
        $subCriteria = new BookQuery();
        $subCriteria->filterByAuthorId(123);

        $c = new BookQuery();
        $c->addSelectQuery($subCriteria, 'subCriteriaAlias');
        // and use filterByPrice method!
        $c->filterByPrice(20, Criteria::LESS_THAN);

        $sql = "SELECT subCriteriaAlias.id, subCriteriaAlias.title, subCriteriaAlias.isbn, subCriteriaAlias.price, subCriteriaAlias.publisher_id, subCriteriaAlias.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book` WHERE book.author_id=:p2) AS subCriteriaAlias WHERE subCriteriaAlias.price<:p1";
        $params = array(
            array('table' => 'book', 'column' => 'price', 'value' => 20),
            array('table' => 'book', 'column' => 'author_id', 'value' => 123),
        );
        $this->assertCriteriaTranslation($c, $sql, $params, 'addSubQueryCriteriaInFrom() combines two queries succesfully');
    }

    public function testSubQueryRecursive()
    {
        // sort the books (on date, if equal continue with id), filtered by a publisher
        $sortedBookQuery = new BookQuery();
        $sortedBookQuery->addSelfSelectColumns();
        $sortedBookQuery->filterByPublisherId(123);
        $sortedBookQuery->orderByTitle(Criteria::DESC);
        $sortedBookQuery->orderById(Criteria::DESC);

        // group by author, after sorting!
        $latestBookQuery = new BookQuery();
        $latestBookQuery->addSelectQuery($sortedBookQuery, 'sortedBookQuery');
        $latestBookQuery->groupBy('sortedBookQuery.AuthorId');

        // filter from these latest books, find the ones cheaper than 12 euro
        $c = new BookQuery();
        $c->addSelectQuery($latestBookQuery, 'latestBookQuery');
        $c->filterByPrice(12, Criteria::LESS_THAN);

        $sql = "SELECT latestBookQuery.id, latestBookQuery.title, latestBookQuery.isbn, latestBookQuery.price, latestBookQuery.publisher_id, latestBookQuery.author_id ".
         "FROM (SELECT sortedBookQuery.id, sortedBookQuery.title, sortedBookQuery.isbn, sortedBookQuery.price, sortedBookQuery.publisher_id, sortedBookQuery.author_id ".
         "FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id ".
         "FROM `book` ".
         "WHERE book.publisher_id=:p2 ".
         "ORDER BY book.title DESC,book.id DESC) AS sortedBookQuery ".
         "GROUP BY sortedBookQuery.author_id) AS latestBookQuery ".
         "WHERE latestBookQuery.price<:p1";
        $params = array(
            array('table' => 'book', 'column' => 'price', 'value' => 12),
            array('table' => 'book', 'column' => 'publisher_id', 'value' => 123),
        );
        $this->assertCriteriaTranslation($c, $sql, $params, 'addSubQueryCriteriaInFrom() combines two queries succesfully');
    }

    public function testSubQueryWithSelectColumns()
    {
        $subCriteria = new BookQuery();

        $c = new TestableBookQuery();
        $c->addSelectQuery($subCriteria, 'alias1', false);
        $c->select(array('alias1.Id'));
        $c->configureSelectColumns();

        $sql = "SELECT alias1.id AS \"alias1.Id\" FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book`) AS alias1";
        $params = array();
        $this->assertCriteriaTranslation($c, $sql, $params, 'addSelectQuery() forges a unique alias and adds select columns by default');
    }

    public function testSubQueryCount()
    {
        $subCriteria = new BookQuery();

        $c = new BookQuery();
        $c->addSelectQuery($subCriteria, 'subCriteriaAlias');
        $c->filterByPrice(20, Criteria::LESS_THAN);
        $nbBooks = $c->count();

        $query = Propel::getConnection()->getLastExecutedQuery();

        $sql = "SELECT COUNT(*) FROM (SELECT subCriteriaAlias.id, subCriteriaAlias.title, subCriteriaAlias.isbn, subCriteriaAlias.price, subCriteriaAlias.publisher_id, subCriteriaAlias.author_id FROM (SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book`) AS subCriteriaAlias WHERE subCriteriaAlias.price<20) propelmatch4cnt";

        $this->assertEquals($sql, $query, 'addSelectQuery() doCount is defined as complexQuery');
    }
}

class TestableBookQuery extends BookQuery
{
    public function configureSelectColumns()
    {
        return parent::configureSelectColumns();
    }
}
