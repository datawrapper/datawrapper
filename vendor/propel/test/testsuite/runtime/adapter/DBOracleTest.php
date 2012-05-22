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
 * Tests the DbOracle adapter
 *
 * @see        BookstoreDataPopulator
 * @author     Francois EZaninotto
 * @package    runtime.adapter
 */
class DBOracleTest extends BookstoreTestBase
{
	public function testApplyLimitSimple()
	{
		Propel::setDb('oracle', new DBOracle());
		$c = new Criteria();
		$c->setDbName('oracle');
		BookPeer::addSelectColumns($c);
		$c->setLimit(1);
		$params = array();
		$sql = BasePeer::createSelectSql($c, $params);
		$this->assertEquals('SELECT B.* FROM (SELECT A.*, rownum AS PROPEL_ROWNUM FROM (SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM book) A ) B WHERE  B.PROPEL_ROWNUM <= 1', $sql, 'applyLimit() creates a subselect with the original column names by default');
	}

	public function testApplyLimitDuplicateColumnName()
	{
		Propel::setDb('oracle', new DBOracle());
		$c = new Criteria();
		$c->setDbName('oracle');
		BookPeer::addSelectColumns($c);
		AuthorPeer::addSelectColumns($c);
		$c->setLimit(1);
		$params = array();
		$sql = BasePeer::createSelectSql($c, $params);
		$this->assertEquals('SELECT B.* FROM (SELECT A.*, rownum AS PROPEL_ROWNUM FROM (SELECT book.ID AS ORA_COL_ALIAS_0, book.TITLE AS ORA_COL_ALIAS_1, book.ISBN AS ORA_COL_ALIAS_2, book.PRICE AS ORA_COL_ALIAS_3, book.PUBLISHER_ID AS ORA_COL_ALIAS_4, book.AUTHOR_ID AS ORA_COL_ALIAS_5, author.ID AS ORA_COL_ALIAS_6, author.FIRST_NAME AS ORA_COL_ALIAS_7, author.LAST_NAME AS ORA_COL_ALIAS_8, author.EMAIL AS ORA_COL_ALIAS_9, author.AGE AS ORA_COL_ALIAS_10 FROM book, author) A ) B WHERE  B.PROPEL_ROWNUM <= 1', $sql, 'applyLimit() creates a subselect with aliased column names when a duplicate column name is found');
	}

	public function testApplyLimitDuplicateColumnNameWithColumn()
	{
		Propel::setDb('oracle', new DBOracle());
		$c = new Criteria();
		$c->setDbName('oracle');
		BookPeer::addSelectColumns($c);
		AuthorPeer::addSelectColumns($c);
		$c->addAsColumn('BOOK_PRICE', BookPeer::PRICE);
		$c->setLimit(1);
		$params = array();
		$asColumns = $c->getAsColumns();
		$sql = BasePeer::createSelectSql($c, $params);
		$this->assertEquals('SELECT B.* FROM (SELECT A.*, rownum AS PROPEL_ROWNUM FROM (SELECT book.ID AS ORA_COL_ALIAS_0, book.TITLE AS ORA_COL_ALIAS_1, book.ISBN AS ORA_COL_ALIAS_2, book.PRICE AS ORA_COL_ALIAS_3, book.PUBLISHER_ID AS ORA_COL_ALIAS_4, book.AUTHOR_ID AS ORA_COL_ALIAS_5, author.ID AS ORA_COL_ALIAS_6, author.FIRST_NAME AS ORA_COL_ALIAS_7, author.LAST_NAME AS ORA_COL_ALIAS_8, author.EMAIL AS ORA_COL_ALIAS_9, author.AGE AS ORA_COL_ALIAS_10, book.PRICE AS BOOK_PRICE FROM book, author) A ) B WHERE  B.PROPEL_ROWNUM <= 1', $sql, 'applyLimit() creates a subselect with aliased column names when a duplicate column name is found');
		$this->assertEquals($asColumns, $c->getAsColumns(), 'createSelectSql supplementary add alias column');
	}

	public function testCreateSelectSqlPart()
	{
		Propel::setDb('oracle', new DBOracle());
		$db = Propel::getDB();
		$c = new Criteria();
		$c->addSelectColumn(BookPeer::ID);
		$c->addAsColumn('book_ID', BookPeer::ID);
		$fromClause = array();
		$selectSql = $db->createSelectSqlPart($c, $fromClause);
		$this->assertEquals('SELECT book.ID, book.ID AS book_ID', $selectSql, 'createSelectSqlPart() returns a SQL SELECT clause with both select and as columns');
		$this->assertEquals(array('book'), $fromClause, 'createSelectSqlPart() adds the tables from the select columns to the from clause');
	}

	public function testGetExplainPlanQuery()
	{
		$db = new DBOracle();
		$explainQuery = $db->getExplainPlanQuery('SELECT B.* FROM (SELECT A.*, rownum AS PROPEL_ROWNUM FROM (SELECT book.ID AS ORA_COL_ALIAS_0, book.TITLE AS ORA_COL_ALIAS_1, book.ISBN AS ORA_COL_ALIAS_2, book.PRICE AS ORA_COL_ALIAS_3, book.PUBLISHER_ID AS ORA_COL_ALIAS_4, book.AUTHOR_ID AS ORA_COL_ALIAS_5, author.ID AS ORA_COL_ALIAS_6, author.FIRST_NAME AS ORA_COL_ALIAS_7, author.LAST_NAME AS ORA_COL_ALIAS_8, author.EMAIL AS ORA_COL_ALIAS_9, author.AGE AS ORA_COL_ALIAS_10, book.PRICE AS BOOK_PRICE FROM book, author) A ) B WHERE  B.PROPEL_ROWNUM <= 1', 'iuyiuyiu');
		$this->assertEquals('EXPLAIN PLAN SET STATEMENT_ID = \'iuyiuyiu\' FOR SELECT B.* FROM (SELECT A.*, rownum AS PROPEL_ROWNUM FROM (SELECT book.ID AS ORA_COL_ALIAS_0, book.TITLE AS ORA_COL_ALIAS_1, book.ISBN AS ORA_COL_ALIAS_2, book.PRICE AS ORA_COL_ALIAS_3, book.PUBLISHER_ID AS ORA_COL_ALIAS_4, book.AUTHOR_ID AS ORA_COL_ALIAS_5, author.ID AS ORA_COL_ALIAS_6, author.FIRST_NAME AS ORA_COL_ALIAS_7, author.LAST_NAME AS ORA_COL_ALIAS_8, author.EMAIL AS ORA_COL_ALIAS_9, author.AGE AS ORA_COL_ALIAS_10, book.PRICE AS BOOK_PRICE FROM book, author) A ) B WHERE  B.PROPEL_ROWNUM <= 1', $explainQuery, 'getExplainPlanQuery() returns a SQL Explain query');
	}
}