<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/query/Criteria.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/util/BasePeer.php';

/**
 * Test class for Criteria.
 *
 * @author     <a href="mailto:celkins@scardini.com">Christopher Elkins</a>
 * @author     <a href="mailto:sam@neurogrid.com">Sam Joseph</a>
 * @version    $Id: CriteriaTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    runtime.query
 */
class CriteriaMergeTest extends BookstoreTestBase
{

	protected function assertCriteriaTranslation($criteria, $expectedSql, $message = '')
	{
		$params = array();
		$result = BasePeer::createSelectSql($criteria, $params);
		$this->assertEquals($expectedSql, $result, $message);
	}

	public function testMergeWithLimit()
	{
		$c1 = new Criteria();
		$c1->setLimit(123);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(123, $c1->getLimit(), 'mergeWith() does not remove an existing limit');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->setLimit(123);
		$c1->mergeWith($c2);
		$this->assertEquals(123, $c1->getLimit(), 'mergeWith() merges the limit');
		$c1 = new Criteria();
		$c1->setLimit(456);
		$c2 = new Criteria();
		$c2->setLimit(123);
		$c1->mergeWith($c2);
		$this->assertEquals(456, $c1->getLimit(), 'mergeWith() does not merge the limit in case of conflict');
	}

	public function testMergeWithOffset()
	{
		$c1 = new Criteria();
		$c1->setOffset(123);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(123, $c1->getOffset(), 'mergeWith() does not remove an existing offset');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->setOffset(123);
		$c1->mergeWith($c2);
		$this->assertEquals(123, $c1->getOffset(), 'mergeWith() merges the offset');
		$c1 = new Criteria();
		$c1->setOffset(456);
		$c2 = new Criteria();
		$c2->setOffset(123);
		$c1->mergeWith($c2);
		$this->assertEquals(456, $c1->getOffset(), 'mergeWith() does not merge the offset in case of conflict');
	}

	public function testMergeWithSelectModifiers()
	{
		$c1 = new Criteria();
		$c1->setDistinct();
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(array(Criteria::DISTINCT), $c1->getSelectModifiers(), 'mergeWith() does not remove an existing select modifier');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->setDistinct();
		$c1->mergeWith($c2);
		$this->assertEquals(array(Criteria::DISTINCT), $c1->getSelectModifiers(), 'mergeWith() merges the select modifiers');
		$c1 = new Criteria();
		$c1->setDistinct();
		$c2 = new Criteria();
		$c2->setDistinct();
		$c1->mergeWith($c2);
		$this->assertEquals(array(Criteria::DISTINCT), $c1->getSelectModifiers(), 'mergeWith() does not duplicate select modifiers');
		$c1 = new Criteria();
		$c1->setAll();
		$c2 = new Criteria();
		$c2->setDistinct();
		$c1->mergeWith($c2);
		$this->assertEquals(array(Criteria::ALL), $c1->getSelectModifiers(), 'mergeWith() does not merge the select modifiers in case of conflict');
	}

	public function testMergeWithSelectColumns()
	{
		$c1 = new Criteria();
		$c1->addSelectColumn(BookPeer::TITLE);
		$c1->addSelectColumn(BookPeer::ID);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE, BookPeer::ID), $c1->getSelectColumns(), 'mergeWith() does not remove an existing select columns');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->addSelectColumn(BookPeer::TITLE);
		$c2->addSelectColumn(BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE, BookPeer::ID), $c1->getSelectColumns(), 'mergeWith() merges the select columns to an empty select');
		$c1 = new Criteria();
		$c1->addSelectColumn(BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addSelectColumn(BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE, BookPeer::ID), $c1->getSelectColumns(), 'mergeWith() merges the select columns after the existing select columns');
		$c1 = new Criteria();
		$c1->addSelectColumn(BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addSelectColumn(BookPeer::TITLE);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE, BookPeer::TITLE), $c1->getSelectColumns(), 'mergeWith() merges the select columns to an existing select, even if duplicated');
	}

	public function testMergeWithAsColumns()
	{
		$c1 = new Criteria();
		$c1->addAsColumn('foo', BookPeer::TITLE);
		$c1->addAsColumn('bar', BookPeer::ID);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(array('foo' => BookPeer::TITLE, 'bar' => BookPeer::ID), $c1->getAsColumns(), 'mergeWith() does not remove an existing as columns');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->addAsColumn('foo', BookPeer::TITLE);
		$c2->addAsColumn('bar', BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array('foo' => BookPeer::TITLE, 'bar' => BookPeer::ID), $c1->getAsColumns(), 'mergeWith() merges the select columns to an empty as');
		$c1 = new Criteria();
		$c1->addAsColumn('foo', BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addAsColumn('bar', BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array('foo' => BookPeer::TITLE, 'bar' => BookPeer::ID), $c1->getAsColumns(), 'mergeWith() merges the select columns after the existing as columns');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testMergeWithAsColumnsThrowsException()
	{
		$c1 = new Criteria();
		$c1->addAsColumn('foo', BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addAsColumn('foo', BookPeer::ID);
		$c1->mergeWith($c2);
	}

	public function testMergeWithOrderByColumns()
	{
		$c1 = new Criteria();
		$c1->addAscendingOrderByColumn(BookPeer::TITLE);
		$c1->addAscendingOrderByColumn(BookPeer::ID);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE . ' ASC', BookPeer::ID . ' ASC'), $c1->getOrderByColumns(), 'mergeWith() does not remove an existing orderby columns');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->addAscendingOrderByColumn(BookPeer::TITLE);
		$c2->addAscendingOrderByColumn(BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE . ' ASC', BookPeer::ID . ' ASC'), $c1->getOrderByColumns(), 'mergeWith() merges the select columns to an empty order by');
		$c1 = new Criteria();
		$c1->addAscendingOrderByColumn(BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addAscendingOrderByColumn(BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE . ' ASC', BookPeer::ID . ' ASC'), $c1->getOrderByColumns(), 'mergeWith() merges the select columns after the existing orderby columns');
		$c1 = new Criteria();
		$c1->addAscendingOrderByColumn(BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addAscendingOrderByColumn(BookPeer::TITLE);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE . ' ASC'), $c1->getOrderByColumns(), 'mergeWith() does not merge duplicated orderby columns');
		$c1 = new Criteria();
		$c1->addAscendingOrderByColumn(BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addDescendingOrderByColumn(BookPeer::TITLE);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE . ' ASC', BookPeer::TITLE . ' DESC'), $c1->getOrderByColumns(), 'mergeWith() merges duplicated orderby columns with inverse direction');
	}

	public function testMergeWithGroupByColumns()
	{
		$c1 = new Criteria();
		$c1->addGroupByColumn(BookPeer::TITLE);
		$c1->addGroupByColumn(BookPeer::ID);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE, BookPeer::ID), $c1->getGroupByColumns(), 'mergeWith() does not remove an existing groupby columns');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->addGroupByColumn(BookPeer::TITLE);
		$c2->addGroupByColumn(BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE, BookPeer::ID), $c1->getGroupByColumns(), 'mergeWith() merges the select columns to an empty groupby');
		$c1 = new Criteria();
		$c1->addGroupByColumn(BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addGroupByColumn(BookPeer::ID);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE, BookPeer::ID), $c1->getGroupByColumns(), 'mergeWith() merges the select columns after the existing groupby columns');
		$c1 = new Criteria();
		$c1->addGroupByColumn(BookPeer::TITLE);
		$c2 = new Criteria();
		$c2->addGroupByColumn(BookPeer::TITLE);
		$c1->mergeWith($c2);
		$this->assertEquals(array(BookPeer::TITLE), $c1->getGroupByColumns(), 'mergeWith() does not merge duplicated groupby columns');
	}

	public function testMergeWithWhereConditions()
	{
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() does not remove an existing where condition');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'foo');
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to an empty condition');
		$c1 = new Criteria();
		$c1->add(BookPeer::ID, 123);
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'foo');
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE book.ID=:p1 AND book.TITLE=:p2';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions');
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'bar');
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE (book.TITLE=:p1 AND book.TITLE=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions on the same column');
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c1->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::LEFT_JOIN);
		$c2 = new Criteria();
		$c2->add(AuthorPeer::FIRST_NAME, 'bar');
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` LEFT JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE book.TITLE=:p1 AND author.FIRST_NAME=:p2';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions on the different tables');
	}

	public function testMergeOrWithWhereConditions()
	{
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c2 = new Criteria();
		$c1->mergeWith($c2, Criteria::LOGICAL_OR);
		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() does not remove an existing where condition');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'foo');
		$c1->mergeWith($c2, Criteria::LOGICAL_OR);
		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to an empty condition');
		$c1 = new Criteria();
		$c1->add(BookPeer::ID, 123);
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'foo');
		$c1->mergeWith($c2, Criteria::LOGICAL_OR);
		$sql = 'SELECT  FROM `book` WHERE (book.ID=:p1 OR book.TITLE=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions');
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'bar');
		$c1->mergeWith($c2, Criteria::LOGICAL_OR);
		$sql = 'SELECT  FROM `book` WHERE (book.TITLE=:p1 OR book.TITLE=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions on the same column');
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c1->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::LEFT_JOIN);
		$c2 = new Criteria();
		$c2->add(AuthorPeer::FIRST_NAME, 'bar');
		$c1->mergeWith($c2, Criteria::LOGICAL_OR);
		$sql = 'SELECT  FROM `book` LEFT JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE (book.TITLE=:p1 OR author.FIRST_NAME=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions on the different tables');
	}

	public function testMerge_OrWithWhereConditions()
	{
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c2 = new Criteria();
		$c1->_or();
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() does not remove an existing where condition');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'foo');
		$c1->_or();
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to an empty condition');
		$c1 = new Criteria();
		$c1->add(BookPeer::ID, 123);
		$c1->_or();
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'foo');
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE (book.ID=:p1 OR book.TITLE=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions');
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c1->_or();
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'bar');
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` WHERE (book.TITLE=:p1 OR book.TITLE=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions on the same column');
		$c1 = new Criteria();
		$c1->add(BookPeer::TITLE, 'foo');
		$c1->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::LEFT_JOIN);
		$c1->_or();
		$c2 = new Criteria();
		$c2->add(AuthorPeer::FIRST_NAME, 'bar');
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM `book` LEFT JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE (book.TITLE=:p1 OR author.FIRST_NAME=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges where condition to existing conditions on the different tables');
	}
	public function testMergeWithHavingConditions()
	{
		$c1 = new Criteria();
		$cton = $c1->getNewCriterion(BookPeer::TITLE, 'foo', Criteria::EQUAL);
		$c1->addHaving($cton);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM  HAVING book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() does not remove an existing having condition');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$cton = $c2->getNewCriterion(BookPeer::TITLE, 'foo', Criteria::EQUAL);
		$c2->addHaving($cton);
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM  HAVING book.TITLE=:p1';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() merges having condition to an empty having');
		$c1 = new Criteria();
		$cton = $c1->getNewCriterion(BookPeer::TITLE, 'foo', Criteria::EQUAL);
		$c1->addHaving($cton);
		$c2 = new Criteria();
		$cton = $c2->getNewCriterion(BookPeer::TITLE, 'bar', Criteria::EQUAL);
		$c2->addHaving($cton);
		$c1->mergeWith($c2);
		$sql = 'SELECT  FROM  HAVING (book.TITLE=:p1 AND book.TITLE=:p2)';
		$this->assertCriteriaTranslation($c1, $sql, 'mergeWith() combines having with AND');
	}

	public function testMergeWithAliases()
	{
		$c1 = new Criteria();
		$c1->addAlias('b', BookPeer::TABLE_NAME);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$this->assertEquals(array('b' => BookPeer::TABLE_NAME), $c1->getAliases(), 'mergeWith() does not remove an existing alias');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->addAlias('a', AuthorPeer::TABLE_NAME);
		$c1->mergeWith($c2);
		$this->assertEquals(array('a' => AuthorPeer::TABLE_NAME), $c1->getAliases(), 'mergeWith() merge aliases to an empty alias');
		$c1 = new Criteria();
		$c1->addAlias('b', BookPeer::TABLE_NAME);
		$c2 = new Criteria();
		$c2->addAlias('a', AuthorPeer::TABLE_NAME);
		$c1->mergeWith($c2);
		$this->assertEquals(array('b' => BookPeer::TABLE_NAME, 'a' => AuthorPeer::TABLE_NAME), $c1->getAliases(), 'mergeWith() merge aliases to an existing alias');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testMergeWithAliasesThrowsException()
	{
		$c1 = new Criteria();
		$c1->addAlias('b', BookPeer::TABLE_NAME);
		$c2 = new Criteria();
		$c2->addAlias('b', AuthorPeer::TABLE_NAME);
		$c1->mergeWith($c2);
	}

	public function testMergeWithJoins()
	{
		$c1 = new Criteria();
		$c1->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::LEFT_JOIN);
		$c2 = new Criteria();
		$c1->mergeWith($c2);
		$joins = $c1->getJoins();
		$this->assertEquals(1, count($joins), 'mergeWith() does not remove an existing join');
		$this->assertEquals('LEFT JOIN author ON (book.AUTHOR_ID=author.ID)', $joins[0]->toString(), 'mergeWith() does not remove an existing join');
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::LEFT_JOIN);
		$c1->mergeWith($c2);
		$joins = $c1->getJoins();
		$this->assertEquals(1, count($joins), 'mergeWith() merge joins to an empty join');
		$this->assertEquals('LEFT JOIN author ON (book.AUTHOR_ID=author.ID)', $joins[0]->toString(), 'mergeWith() merge joins to an empty join');
		$c1 = new Criteria();
		$c1->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::LEFT_JOIN);
		$c2 = new Criteria();
		$c2->addJoin(BookPeer::PUBLISHER_ID, PublisherPeer::ID, Criteria::INNER_JOIN);
		$c1->mergeWith($c2);
		$joins = $c1->getJoins();
		$this->assertEquals(2, count($joins), 'mergeWith() merge joins to an existing join');
		$this->assertEquals('LEFT JOIN author ON (book.AUTHOR_ID=author.ID)', $joins[0]->toString(), 'mergeWith() merge joins to an empty join');
		$this->assertEquals('INNER JOIN publisher ON (book.PUBLISHER_ID=publisher.ID)', $joins[1]->toString(), 'mergeWith() merge joins to an empty join');
	}

	public function testMergeWithFurtherModified()
	{
		$c1 = new Criteria();
		$c2 = new Criteria();
		$c2->setLimit(123);
		$c1->mergeWith($c2);
		$this->assertEquals(123, $c1->getLimit(), 'mergeWith() makes the merge');
		$c2->setLimit(456);
		$this->assertEquals(123, $c1->getLimit(), 'further modifying a merged criteria does not affect the merger');
	}

}
