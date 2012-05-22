<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Tests the BasePeer classes.
 *
 * @see        BookstoreDataPopulator
 * @author     Hans Lellelid <hans@xmpl.org>
 * @package    runtime.util
 */
class BasePeerTest extends BookstoreTestBase
{

	/**
	 * @link       http://propel.phpdb.org/trac/ticket/425
	 */
	public function testMultipleFunctionInCriteria()
	{
		$db = Propel::getDB(BookPeer::DATABASE_NAME);
		try {
			$c = new Criteria();
			$c->setDistinct();
			if ($db instanceof DBPostgres) {
				$c->addSelectColumn("substring(".BookPeer::TITLE." from position('Potter' in ".BookPeer::TITLE.")) AS col");
			} else {
				$this->markTestSkipped();
			}
			$stmt = BookPeer::doSelectStmt( $c );
		} catch (PropelException $x) {
			$this->fail("Paring of nested functions failed: " . $x->getMessage());
		}
	}

	public function testNeedsSelectAliases()
	{
		$c = new Criteria();
		$this->assertFalse(BasePeer::needsSelectAliases($c), 'Empty Criterias dont need aliases');

		$c = new Criteria();
		$c->addSelectColumn(BookPeer::ID);
		$c->addSelectColumn(BookPeer::TITLE);
		$this->assertFalse(BasePeer::needsSelectAliases($c), 'Criterias with distinct column names dont need aliases');

		$c = new Criteria();
		BookPeer::addSelectColumns($c);
		$this->assertFalse(BasePeer::needsSelectAliases($c), 'Criterias with only the columns of a model dont need aliases');

		$c = new Criteria();
		$c->addSelectColumn(BookPeer::ID);
		$c->addSelectColumn(AuthorPeer::ID);
		$this->assertTrue(BasePeer::needsSelectAliases($c), 'Criterias with common column names do need aliases');
	}

	public function testDoCountDuplicateColumnName()
	{
		$con = Propel::getConnection();
		$c = new Criteria();
		$c->addSelectColumn(BookPeer::ID);
		$c->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID);
		$c->addSelectColumn(AuthorPeer::ID);
		$c->setLimit(3);
		try {
			$count = BasePeer::doCount($c, $con);
		} catch (Exception $e) {
			$this->fail('doCount() cannot deal with a criteria selecting duplicate column names ');
		}
	}

	public function testBigIntIgnoreCaseOrderBy()
	{
		BookstorePeer::doDeleteAll();

		// Some sample data
		$b = new Bookstore();
		$b->setStoreName("SortTest1")->setPopulationServed(2000)->save();

		$b = new Bookstore();
		$b->setStoreName("SortTest2")->setPopulationServed(201)->save();

		$b = new Bookstore();
		$b->setStoreName("SortTest3")->setPopulationServed(302)->save();

		$b = new Bookstore();
		$b->setStoreName("SortTest4")->setPopulationServed(10000000)->save();

		$c = new Criteria();
		$c->setIgnoreCase(true);
		$c->add(BookstorePeer::STORE_NAME, 'SortTest%', Criteria::LIKE);
		$c->addAscendingOrderByColumn(BookstorePeer::POPULATION_SERVED);

		$rows = BookstorePeer::doSelect($c);
		$this->assertEquals('SortTest2', $rows[0]->getStoreName());
		$this->assertEquals('SortTest3', $rows[1]->getStoreName());
		$this->assertEquals('SortTest1', $rows[2]->getStoreName());
		$this->assertEquals('SortTest4', $rows[3]->getStoreName());
	}

	/**
	 *
	 */
	public function testMixedJoinOrder()
	{
		$this->markTestSkipped('Famous cross join problem, to be solved one day');
		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->addSelectColumn(BookPeer::ID);
		$c->addSelectColumn(BookPeer::TITLE);

		$c->addJoin(BookPeer::PUBLISHER_ID, PublisherPeer::ID, Criteria::LEFT_JOIN);
		$c->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID);

		$params = array();
		$sql = BasePeer::createSelectSql($c, $params);

		$expectedSql = "SELECT book.ID, book.TITLE FROM book LEFT JOIN publisher ON (book.PUBLISHER_ID=publisher.ID), author WHERE book.AUTHOR_ID=author.ID";
		$this->assertEquals($expectedSql, $sql);
	}

	public function testMssqlApplyLimitNoOffset()
	{
		$db = Propel::getDB(BookPeer::DATABASE_NAME);
		if(! ($db instanceof DBMSSQL))
		{
			$this->markTestSkipped();
		}

		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->addSelectColumn(BookPeer::ID);
		$c->addSelectColumn(BookPeer::TITLE);
		$c->addSelectColumn(PublisherPeer::NAME);
		$c->addAsColumn('PublisherName','(SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID)');

		$c->addJoin(BookPeer::PUBLISHER_ID, PublisherPeer::ID, Criteria::LEFT_JOIN);

		$c->setOffset(0);
		$c->setLimit(20);

		$params = array();
		$sql = BasePeer::createSelectSql($c, $params);

		$expectedSql = "SELECT TOP 20 book.ID, book.TITLE, publisher.NAME, (SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID) AS PublisherName FROM book LEFT JOIN publisher ON (book.PUBLISHER_ID=publisher.ID)";
		$this->assertEquals($expectedSql, $sql);
	}

	public function testMssqlApplyLimitWithOffset()
	{
		$db = Propel::getDB(BookPeer::DATABASE_NAME);
		if(! ($db instanceof DBMSSQL))
		{
			$this->markTestSkipped();
		}

		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->addSelectColumn(BookPeer::ID);
		$c->addSelectColumn(BookPeer::TITLE);
		$c->addSelectColumn(PublisherPeer::NAME);
		$c->addAsColumn('PublisherName','(SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID)');
		$c->addJoin(BookPeer::PUBLISHER_ID, PublisherPeer::ID, Criteria::LEFT_JOIN);
		$c->setOffset(20);
		$c->setLimit(20);

		$params = array();

		$expectedSql = "SELECT [book.ID], [book.TITLE], [publisher.NAME], [PublisherName] FROM (SELECT ROW_NUMBER() OVER(ORDER BY book.ID) AS [RowNumber], book.ID AS [book.ID], book.TITLE AS [book.TITLE], publisher.NAME AS [publisher.NAME], (SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID) AS [PublisherName] FROM book LEFT JOIN publisher ON (book.PUBLISHER_ID=publisher.ID)) AS derivedb WHERE RowNumber BETWEEN 21 AND 40";
		$sql = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expectedSql, $sql);
	}

	public function testMssqlApplyLimitWithOffsetOrderByAggregate()
	{
		$db = Propel::getDB(BookPeer::DATABASE_NAME);
		if(! ($db instanceof DBMSSQL))
		{
			$this->markTestSkipped();
		}

		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->addSelectColumn(BookPeer::ID);
		$c->addSelectColumn(BookPeer::TITLE);
		$c->addSelectColumn(PublisherPeer::NAME);
		$c->addAsColumn('PublisherName','(SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID)');
		$c->addJoin(BookPeer::PUBLISHER_ID, PublisherPeer::ID, Criteria::LEFT_JOIN);
		$c->addDescendingOrderByColumn('PublisherName');
		$c->setOffset(20);
		$c->setLimit(20);

		$params = array();

		$expectedSql = "SELECT [book.ID], [book.TITLE], [publisher.NAME], [PublisherName] FROM (SELECT ROW_NUMBER() OVER(ORDER BY (SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID) DESC) AS [RowNumber], book.ID AS [book.ID], book.TITLE AS [book.TITLE], publisher.NAME AS [publisher.NAME], (SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID) AS [PublisherName] FROM book LEFT JOIN publisher ON (book.PUBLISHER_ID=publisher.ID)) AS derivedb WHERE RowNumber BETWEEN 21 AND 40";
		$sql = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expectedSql, $sql);
	}

	public function testMssqlApplyLimitWithOffsetMultipleOrderBy()
	{
		$db = Propel::getDB(BookPeer::DATABASE_NAME);
		if(! ($db instanceof DBMSSQL))
		{
			$this->markTestSkipped();
		}

		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->addSelectColumn(BookPeer::ID);
		$c->addSelectColumn(BookPeer::TITLE);
		$c->addSelectColumn(PublisherPeer::NAME);
		$c->addAsColumn('PublisherName','(SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID)');
		$c->addJoin(BookPeer::PUBLISHER_ID, PublisherPeer::ID, Criteria::LEFT_JOIN);
		$c->addDescendingOrderByColumn('PublisherName');
		$c->addAscendingOrderByColumn(BookPeer::TITLE);
		$c->setOffset(20);
		$c->setLimit(20);

		$params = array();

		$expectedSql = "SELECT [book.ID], [book.TITLE], [publisher.NAME], [PublisherName] FROM (SELECT ROW_NUMBER() OVER(ORDER BY (SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID) DESC, book.TITLE ASC) AS [RowNumber], book.ID AS [book.ID], book.TITLE AS [book.TITLE], publisher.NAME AS [publisher.NAME], (SELECT MAX(publisher.NAME) FROM publisher WHERE publisher.ID = book.PUBLISHER_ID) AS [PublisherName] FROM book LEFT JOIN publisher ON (book.PUBLISHER_ID=publisher.ID)) AS derivedb WHERE RowNumber BETWEEN 21 AND 40";
		$sql = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expectedSql, $sql);
	}

	/**
	 * @expectedException PropelException
	 */
	public function testDoDeleteNoCondition()
	{
		$con = Propel::getConnection();
		$c = new Criteria(BookPeer::DATABASE_NAME);
		BasePeer::doDelete($c, $con);
	}

	/**
	 * @expectedException PropelException
	 */
	public function testDoDeleteJoin()
	{
		$con = Propel::getConnection();
		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->add(BookPeer::TITLE, 'War And Peace');
		$c->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID);
		BasePeer::doDelete($c, $con);
	}

	public function testDoDeleteSimpleCondition()
	{
		$con = Propel::getConnection();
		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->add(BookPeer::TITLE, 'War And Peace');
		BasePeer::doDelete($c, $con);
		$expectedSQL = "DELETE FROM `book` WHERE book.TITLE='War And Peace'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'doDelete() translates a contition into a WHERE');
	}

	public function testDoDeleteSeveralConditions()
	{
		$con = Propel::getConnection();
		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->add(BookPeer::TITLE, 'War And Peace');
		$c->add(BookPeer::ID, 12);
		BasePeer::doDelete($c, $con);
		$expectedSQL = "DELETE FROM `book` WHERE book.TITLE='War And Peace' AND book.ID=12";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'doDelete() combines conditions in WHERE whith an AND');
	}

	public function testDoDeleteTableAlias()
	{
		$con = Propel::getConnection();
		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->addAlias('b', BookPeer::TABLE_NAME);
		$c->add('b.TITLE', 'War And Peace');
		BasePeer::doDelete($c, $con);
		$expectedSQL = "DELETE b FROM `book` AS b WHERE b.TITLE='War And Peace'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'doDelete() accepts a Criteria with a table alias');
	}

	/**
	 * Not documented anywhere, and probably wrong
	 * @see http://www.propelorm.org/ticket/952
	 */
	public function testDoDeleteSeveralTables()
	{
		$con = Propel::getConnection();
		$count = $con->getQueryCount();
		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->add(BookPeer::TITLE, 'War And Peace');
		$c->add(AuthorPeer::FIRST_NAME, 'Leo');
		BasePeer::doDelete($c, $con);
		$expectedSQL = "DELETE FROM `author` WHERE author.FIRST_NAME='Leo'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'doDelete() issues two DELETE queries when passed conditions on two tables');
		$this->assertEquals($count + 2, $con->getQueryCount(), 'doDelete() issues two DELETE queries when passed conditions on two tables');

		$c = new Criteria(BookPeer::DATABASE_NAME);
		$c->add(AuthorPeer::FIRST_NAME, 'Leo');
		$c->add(BookPeer::TITLE, 'War And Peace');
		BasePeer::doDelete($c, $con);
		$expectedSQL = "DELETE FROM `book` WHERE book.TITLE='War And Peace'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'doDelete() issues two DELETE queries when passed conditions on two tables');
		$this->assertEquals($count + 4, $con->getQueryCount(), 'doDelete() issues two DELETE queries when passed conditions on two tables');
	}

	public function testCommentDoSelect()
	{
		$c = new Criteria();
		$c->setComment('Foo');
		$c->addSelectColumn(BookPeer::ID);
		$expected = 'SELECT /* Foo */ book.ID FROM `book`';
		$params = array();
		$this->assertEquals($expected, BasePeer::createSelectSQL($c, $params), 'Criteria::setComment() adds a comment to select queries');
	}

	public function testCommentDoUpdate()
	{
		$c1 = new Criteria();
		$c1->setPrimaryTableName(BookPeer::TABLE_NAME);
		$c1->setComment('Foo');
		$c2 = new Criteria();
		$c2->add(BookPeer::TITLE, 'Updated Title');
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		BasePeer::doUpdate($c1, $c2, $con);
		$expected = 'UPDATE /* Foo */ `book` SET `TITLE`=\'Updated Title\'';
		$this->assertEquals($expected, $con->getLastExecutedQuery(), 'Criteria::setComment() adds a comment to update queries');
	}

	public function testCommentDoDelete()
	{
		$c = new Criteria();
		$c->setComment('Foo');
		$c->add(BookPeer::TITLE, 'War And Peace');
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		BasePeer::doDelete($c, $con);
		$expected = 'DELETE /* Foo */ FROM `book` WHERE book.TITLE=\'War And Peace\'';
		$this->assertEquals($expected, $con->getLastExecutedQuery(), 'Criteria::setComment() adds a comment to delete queries');
	}

	public function testIneffectualUpdateUsingBookObject()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new Criteria();
		$book = BookPeer::doSelectOne($c, $con);
		$count = $con->getQueryCount();
		$book->setTitle($book->getTitle());
		$book->setISBN($book->getISBN());
		try
		{
			$rowCount = BookPeer::doUpdate($book, $con);
			$this->assertEquals(0, $rowCount, 'BookPeer::doUpdate() should indicate zero rows updated');
		}
		catch (Exception $ex)
		{
			$this->fail('BookPeer::doUpdate() threw an exception');
		}

		$this->assertEquals($count, $con->getQueryCount(), 'BookPeer::doUpdate() does not execute any queries when there are no changes');
	}
}
