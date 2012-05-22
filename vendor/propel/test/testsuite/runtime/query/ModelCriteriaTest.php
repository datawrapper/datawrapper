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
 * Test class for ModelCriteria.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.query
 */
class ModelCriteriaTest extends BookstoreTestBase
{
	protected function assertCriteriaTranslation($criteria, $expectedSql, $expectedParams, $message = '')
	{
		$params = array();
		$result = BasePeer::createSelectSql($criteria, $params);

		$this->assertEquals($expectedSql, $result, $message);
		$this->assertEquals($expectedParams, $params, $message);
	}

	public function testGetModelName()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$this->assertEquals('Book', $c->getModelName(), 'getModelName() returns the name of the class associated to the model class');
	}

	public function testGetModelPeerName()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$this->assertEquals('BookPeer', $c->getModelPeerName(), 'getModelPeerName() returns the name of the Peer class associated to the model class');
	}

	public function testFormatter()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$this->assertTrue($c->getFormatter() instanceof PropelFormatter, 'getFormatter() returns a PropelFormatter instance');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_STATEMENT);
		$this->assertTrue($c->getFormatter() instanceof PropelStatementFormatter, 'setFormatter() accepts the name of a PropelFormatter class');

		try {
			$c->setFormatter('Book');
			$this->fail('setFormatter() throws an exception when passed the name of a class not extending PropelFormatter');
		} catch(PropelException $e) {
			$this->assertTrue(true, 'setFormatter() throws an exception when passed the name of a class not extending PropelFormatter');
		}
		$c = new ModelCriteria('bookstore', 'Book');
		$formatter = new PropelStatementFormatter();
		$c->setFormatter($formatter);
		$this->assertTrue($c->getFormatter() instanceof PropelStatementFormatter, 'setFormatter() accepts a PropelFormatter instance');

		try {
			$formatter = new Book();
			$c->setFormatter($formatter);
			$this->fail('setFormatter() throws an exception when passed an object not extending PropelFormatter');
		} catch(PropelException $e) {
			$this->assertTrue(true, 'setFormatter() throws an exception when passedan object not extending PropelFormatter');
		}

	}

	public static function conditionsForTestReplaceNames()
	{
		return array(
			array('Book.Title = ?', 'Title', 'book.TITLE = ?'), // basic case
			array('Book.Title=?', 'Title', 'book.TITLE=?'), // without spaces
			array('Book.Id<= ?', 'Id', 'book.ID<= ?'), // with non-equal comparator
			array('Book.AuthorId LIKE ?', 'AuthorId', 'book.AUTHOR_ID LIKE ?'), // with SQL keyword separator
			array('(Book.AuthorId) LIKE ?', 'AuthorId', '(book.AUTHOR_ID) LIKE ?'), // with parenthesis
			array('(Book.Id*1.5)=1', 'Id', '(book.ID*1.5)=1'), // ignore numbers
			// dealing with quotes
			array("Book.Id + ' ' + Book.AuthorId", null, "book.ID + ' ' + book.AUTHOR_ID"),
			array("'Book.Id' + Book.AuthorId", null, "'Book.Id' + book.AUTHOR_ID"),
			array("Book.Id + 'Book.AuthorId'", null, "book.ID + 'Book.AuthorId'"),
			array('1=1', null, '1=1'), // with no name
			array('', null, '') // with empty string
		);
	}

	/**
	 * @dataProvider conditionsForTestReplaceNames
	 */
	public function testReplaceNames($origClause, $columnPhpName = false, $modifiedClause)
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$this->doTestReplaceNames($c, BookPeer::getTableMap(), $origClause, $columnPhpName = false, $modifiedClause);
	}

	public function doTestReplaceNames($c, $tableMap, $origClause, $columnPhpName = false, $modifiedClause)
	{
		$c->replaceNames($origClause);
		$columns = $c->replacedColumns;
		if ($columnPhpName) {
			$this->assertEquals(array($tableMap->getColumnByPhpName($columnPhpName)), $columns);
		}
		$this->assertEquals($modifiedClause, $origClause);
	}

	public static function conditionsForTestReplaceMultipleNames()
	{
		return array(
			array('(Book.Id+Book.Id)=1', array('Id', 'Id'), '(book.ID+book.ID)=1'), // match multiple names
			array('CONCAT(Book.Title,"Book.Id")= ?', array('Title', 'Id'), 'CONCAT(book.TITLE,"Book.Id")= ?'), // ignore names in strings
			array('CONCAT(Book.Title," Book.Id ")= ?', array('Title', 'Id'), 'CONCAT(book.TITLE," Book.Id ")= ?'), // ignore names in strings
			array('MATCH (Book.Title,Book.ISBN) AGAINST (?)', array('Title', 'ISBN'), 'MATCH (book.TITLE,book.ISBN) AGAINST (?)'),
		);
	}

	/**
	 * @dataProvider conditionsForTestReplaceMultipleNames
	 */
	public function testReplaceMultipleNames($origClause, $expectedColumns, $modifiedClause)
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->replaceNames($origClause);
		$foundColumns = $c->replacedColumns;
		foreach ($foundColumns as $column) {
			$expectedColumn = BookPeer::getTableMap()->getColumnByPhpName(array_shift($expectedColumns));
			$this->assertEquals($expectedColumn, $column);
		}
		$this->assertEquals($modifiedClause, $origClause);
	}

	public function testTableAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b');
		$c->where('b.Title = ?', 'foo');

		$sql = "SELECT  FROM `book` WHERE book.TITLE = :p1";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'setModelAlias() allows the definition of the alias after constrution');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');

		$sql = "SELECT  FROM `book` WHERE book.TITLE = :p1";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'A ModelCriteria accepts a model name with an alias');
	}

	public function testTrueTableAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$c->where('b.Title = ?', 'foo');
		$c->join('b.Author a');
		$c->where('a.FirstName = ?', 'john');


		$sql = "SELECT  FROM `book` `b` INNER JOIN `author` `a` ON (b.AUTHOR_ID=a.ID) WHERE b.TITLE = :p1 AND a.FIRST_NAME = :p2";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => 'author', 'column' => 'FIRST_NAME', 'value' => 'john'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'setModelAlias() allows the definition of a true SQL alias after constrution');
	}

	public function testCondition()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'Book.Title like ?', '%bar%');
		$c->combine(array('cond1', 'cond2'), 'or');

		$sql = "SELECT  FROM `book` WHERE (book.TITLE <> :p1 OR book.TITLE like :p2)";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => 'book', 'column' => 'TITLE', 'value' => '%bar%'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'condition() can store condition for later combination');
	}

	public function testConditionCustomOperator()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->withColumn('SUBSTRING(Book.Title, 1, 4)', 'title_start');
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'title_start like ?', '%bar%', PDO::PARAM_STR);
		$c->combine(array('cond1', 'cond2'), 'or');

		$sql = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID, SUBSTRING(book.TITLE, 1, 4) AS title_start FROM `book` WHERE (book.TITLE <> :p1 OR title_start like :p2)";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => null, 'type' => PDO::PARAM_STR, 'value' => '%bar%'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'condition() accepts RAW sql parameters');
	}

	public static function conditionsForTestWhere()
	{
		return array(
			array('Book.Title = ?', 'foo', 'book.TITLE = :p1', array(array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'))),
			array('Book.AuthorId = ?', 12, 'book.AUTHOR_ID = :p1', array(array('table' => 'book', 'column' => 'AUTHOR_ID', 'value' => 12))),
			array('Book.AuthorId IS NULL', null, 'book.AUTHOR_ID IS NULL', array()),
			array('Book.Id BETWEEN ? AND ?', array(3, 4), 'book.ID BETWEEN :p1 AND :p2', array(array('table' => 'book', 'column' => 'ID', 'value' => 3), array('table' => 'book', 'column' => 'ID', 'value' => 4))),
			array('Book.Id betWEen ? and ?', array(3, 4), 'book.ID betWEen :p1 and :p2', array(array('table' => 'book', 'column' => 'ID', 'value' => 3), array('table' => 'book', 'column' => 'ID', 'value' => 4))),
			array('Book.Id IN ?', array(1, 2, 3), 'book.ID IN (:p1,:p2,:p3)', array(array('table' => 'book', 'column' => 'ID', 'value' => 1), array('table' => 'book', 'column' => 'ID', 'value' => 2), array('table' => 'book', 'column' => 'ID', 'value' => 3))),
			array('Book.Id in ?', array(1, 2, 3), 'book.ID in (:p1,:p2,:p3)', array(array('table' => 'book', 'column' => 'ID', 'value' => 1), array('table' => 'book', 'column' => 'ID', 'value' => 2), array('table' => 'book', 'column' => 'ID', 'value' => 3))),
			array('Book.Id IN ?', array(), '1<>1', array()),
			array('Book.Id not in ?', array(), '1=1', array()),
			array('UPPER(Book.Title) = ?', 'foo', 'UPPER(book.TITLE) = :p1', array(array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'))),
			array('MATCH (Book.Title,Book.ISBN) AGAINST (?)', 'foo', 'MATCH (book.TITLE,book.ISBN) AGAINST (:p1)', array(array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'))),
		);
	}

	/**
	 * @dataProvider conditionsForTestWhere
	 */
	public function testWhere($clause, $value, $sql, $params)
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->where($clause, $value);
		$sql = 'SELECT  FROM `book` WHERE ' . $sql;
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() accepts a string clause');
	}

	public function testWhereUsesDefaultOperator()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->where('Book.Id = ?', 12);
		$c->_or();
		$c->where('Book.Title = ?', 'foo');
		$sql = 'SELECT  FROM `book` WHERE (book.ID = :p1 OR book.TITLE = :p2)';
		$params = array(
			array('table' => 'book', 'column' => 'ID', 'value' => '12'),
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() uses the default operator');
	}

	public function testWhereTwiceSameColumn()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->where('Book.Id IN ?', array(1, 2, 3));
		$c->where('Book.Id <> ?', 5);
		$params = array(
			array('table' => 'book', 'column' => 'ID', 'value' => '1'),
			array('table' => 'book', 'column' => 'ID', 'value' => '2'),
			array('table' => 'book', 'column' => 'ID', 'value' => '3'),
			array('table' => 'book', 'column' => 'ID', 'value' => '5'),
		);
		$sql = 'SELECT  FROM `book` WHERE (book.ID IN (:p1,:p2,:p3) AND book.ID <> :p4)';
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() adds clauses on the same column correctly');
	}

	public function testWhereConditions()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'Book.Title like ?', '%bar%');
		$c->where(array('cond1', 'cond2'));

		$sql = "SELECT  FROM `book` WHERE (book.TITLE <> :p1 AND book.TITLE like :p2)";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => 'book', 'column' => 'TITLE', 'value' => '%bar%'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() accepts an array of named conditions');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'Book.Title like ?', '%bar%');
		$c->where(array('cond1', 'cond2'), Criteria::LOGICAL_OR);

		$sql = "SELECT  FROM `book` WHERE (book.TITLE <> :p1 OR book.TITLE like :p2)";
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() accepts an array of named conditions with operator');
	}

	public function testWhereNoReplacement()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');
		$c->where('1=1');

		$sql = "SELECT  FROM `book` WHERE book.TITLE = :p1 AND 1=1";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() results in a Criteria::CUSTOM if no column name is matched');

		$c = new ModelCriteria('bookstore', 'Book');
		try {
			$c->where('b.Title = ?', 'foo');
			$this->fail('where() throws an exception when it finds a ? but cannot determine a column');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'where() throws an exception when it finds a ? but cannot determine a column');
		}
	}

	public function testWhereFunction()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('UPPER(b.Title) = ?', 'foo');

		$sql = "SELECT  FROM `book` WHERE UPPER(book.TITLE) = :p1";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() accepts a complex calculation');
	}

	public function testWhereTypeValue()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('LOCATE(\'foo\', b.Title) = ?', true, PDO::PARAM_BOOL);

		$sql = "SELECT  FROM `book` WHERE LOCATE('foo', book.TITLE) = :p1";
		$params = array(
			array('table' => null, 'type' => PDO::PARAM_BOOL, 'value' => true),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'where() accepts a complex calculation');
		$c->find($this->con);
		$expected = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE LOCATE('foo', book.TITLE) = true";
		$this->assertEquals($expected, $this->con->getLastExecutedQuery());
	}

	public function testOrWhere()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->where('Book.Title <> ?', 'foo');
		$c->orWhere('Book.Title like ?', '%bar%');

		$sql = "SELECT  FROM `book` WHERE (book.TITLE <> :p1 OR book.TITLE like :p2)";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => 'book', 'column' => 'TITLE', 'value' => '%bar%'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'orWhere() combines the clause with the previous one using  OR');
	}

	public function testOrWhereConditions()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->where('Book.Id = ?', 12);
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'Book.Title like ?', '%bar%');
		$c->orWhere(array('cond1', 'cond2'));

		$sql = "SELECT  FROM `book` WHERE (book.ID = :p1 OR (book.TITLE <> :p2 AND book.TITLE like :p3))";
		$params = array(
			array('table' => 'book', 'column' => 'ID', 'value' => 12),
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => 'book', 'column' => 'TITLE', 'value' => '%bar%'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'orWhere() accepts an array of named conditions');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->where('Book.Id = ?', 12);
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'Book.Title like ?', '%bar%');
		$c->orWhere(array('cond1', 'cond2'), Criteria::LOGICAL_OR);

		$sql = "SELECT  FROM `book` WHERE (book.ID = :p1 OR (book.TITLE <> :p2 OR book.TITLE like :p3))";
		$this->assertCriteriaTranslation($c, $sql, $params, 'orWhere() accepts an array of named conditions with operator');
	}

	public function testMixedCriteria()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->where('Book.Title = ?', 'foo');
		$c->add(BookPeer::ID, array(1, 2), Criteria::IN);

		$sql = 'SELECT  FROM `book` WHERE book.TITLE = :p1 AND book.ID IN (:p2,:p3)';
		$params =  array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => 'book', 'column' => 'ID', 'value' => 1),
			array('table' => 'book', 'column' => 'ID', 'value' => 2)
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'ModelCriteria accepts Criteria operators');
	}

	public function testFilterBy()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->filterBy('Title', 'foo');

		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$params =  array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'filterBy() accepts a simple column name');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->filterBy('Title', 'foo', Criteria::NOT_EQUAL);

		$sql = 'SELECT  FROM `book` WHERE book.TITLE<>:p1';
		$params =  array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'filterBy() accepts a sicustom comparator');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->filterBy('Title', 'foo');

		$sql = 'SELECT  FROM `book` WHERE book.TITLE=:p1';
		$params =  array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'filterBy() accepts a simple column name, even if initialized with an alias');
	}

	public function testHaving()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->having('Book.Title <> ?', 'foo');

		$sql = "SELECT  FROM  HAVING book.TITLE <> :p1";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'having() accepts a string clause');
	}

	public function testHavingConditions()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'Book.Title like ?', '%bar%');
		$c->having(array('cond1', 'cond2'));

		$sql = "SELECT  FROM  HAVING (book.TITLE <> :p1 AND book.TITLE like :p2)";
		$params = array(
			array('table' => 'book', 'column' => 'TITLE', 'value' => 'foo'),
			array('table' => 'book', 'column' => 'TITLE', 'value' => '%bar%'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'having() accepts an array of named conditions');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->condition('cond1', 'Book.Title <> ?', 'foo');
		$c->condition('cond2', 'Book.Title like ?', '%bar%');
		$c->having(array('cond1', 'cond2'), Criteria::LOGICAL_OR);

		$sql = "SELECT  FROM  HAVING (book.TITLE <> :p1 OR book.TITLE like :p2)";
		$this->assertCriteriaTranslation($c, $sql, $params, 'having() accepts an array of named conditions with an operator');
	}

	public function testHavingWithColumn()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->withColumn('SUBSTRING(Book.Title, 1, 4)', 'title_start');
		$c->having('title_start = ?', 'foo', PDO::PARAM_STR);

		$sql = 'SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID, SUBSTRING(book.TITLE, 1, 4) AS title_start FROM `book` HAVING title_start = :p1';
		$params = array(
			array('table' => null, 'type' => 2, 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'having() accepts a string clause');
		$c->find($this->con);
		$expected = 'SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID, SUBSTRING(book.TITLE, 1, 4) AS title_start FROM `book` HAVING title_start = \'foo\'';
		$this->assertEquals($expected, $this->con->getLastExecutedQuery());
	}

	public function testOrderBy()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Book.Title');

		$sql = 'SELECT  FROM  ORDER BY book.TITLE ASC';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'orderBy() accepts a column name and adds an ORDER BY clause');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Book.Title', 'desc');

		$sql = 'SELECT  FROM  ORDER BY book.TITLE DESC';
		$this->assertCriteriaTranslation($c, $sql, $params, 'orderBy() accepts an order parameter');

		$c = new ModelCriteria('bookstore', 'Book');
		try {
			$c->orderBy('Book.Foo');
			$this->fail('orderBy() throws an exception when called with an unknown column name');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'orderBy() throws an exception when called with an unknown column name');
		}
		$c = new ModelCriteria('bookstore', 'Book');
		try {
			$c->orderBy('Book.Title', 'foo');
			$this->fail('orderBy() throws an exception when called with an unknown order');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'orderBy() throws an exception when called with an unknown order');
		}
	}

	public function testOrderBySimpleColumn()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Title');

		$sql = 'SELECT  FROM  ORDER BY book.TITLE ASC';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'orderBy() accepts a simple column name and adds an ORDER BY clause');
	}

	public function testOrderByAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->addAsColumn('t', BookPeer::TITLE);
		$c->orderBy('t');

		$sql = 'SELECT book.TITLE AS t FROM  ORDER BY t ASC';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'orderBy() accepts a column alias and adds an ORDER BY clause');
	}

	public function testGroupBy()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->groupBy('Book.AuthorId');

		$sql = 'SELECT  FROM  GROUP BY book.AUTHOR_ID';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupBy() accepts a column name and adds a GROUP BY clause');

		$c = new ModelCriteria('bookstore', 'Book');
		try {
			$c->groupBy('Book.Foo');
			$this->fail('groupBy() throws an exception when called with an unknown column name');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'groupBy() throws an exception when called with an unknown column name');
		}
	}

	public function testGroupBySimpleColumn()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->groupBy('AuthorId');

		$sql = 'SELECT  FROM  GROUP BY book.AUTHOR_ID';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupBy() accepts a simple column name and adds a GROUP BY clause');
	}

	public function testGroupByAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->addAsColumn('t', BookPeer::TITLE);
		$c->groupBy('t');

		$sql = 'SELECT book.TITLE AS t FROM  GROUP BY t';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupBy() accepts a column alias and adds a GROUP BY clause');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testGroupByClassThrowsExceptionOnUnknownClass()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->groupByClass('Author');
	}

	public function testGroupByClass()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->groupByClass('Book');

		$sql = 'SELECT  FROM  GROUP BY book.ID,book.TITLE,book.ISBN,book.PRICE,book.PUBLISHER_ID,book.AUTHOR_ID';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupByClass() accepts a class name and adds a GROUP BY clause for all columns of the class');
	}

	public function testGroupByClassAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->groupByClass('b');

		$sql = 'SELECT  FROM  GROUP BY book.ID,book.TITLE,book.ISBN,book.PRICE,book.PUBLISHER_ID,book.AUTHOR_ID';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupByClass() accepts a class alias and adds a GROUP BY clause for all columns of the class');
	}

	public function testGroupByClassTrueAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$c->groupByClass('b');

		$sql = 'SELECT  FROM  GROUP BY b.ID,b.TITLE,b.ISBN,b.PRICE,b.PUBLISHER_ID,b.AUTHOR_ID';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupByClass() accepts a true class alias and adds a GROUP BY clause for all columns of the class');
	}

	public function testGroupByClassJoinedModel()
	{
		$c = new ModelCriteria('bookstore', 'Author');
		$c->join('Author.Book');
		$c->groupByClass('Book');

		$sql = 'SELECT  FROM `author` INNER JOIN `book` ON (author.ID=book.AUTHOR_ID) GROUP BY book.ID,book.TITLE,book.ISBN,book.PRICE,book.PUBLISHER_ID,book.AUTHOR_ID';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupByClass() accepts the class name of a joined model');
	}

	public function testGroupByClassJoinedModelWithAlias()
	{
		$c = new ModelCriteria('bookstore', 'Author');
		$c->join('Author.Book b');
		$c->groupByClass('b');

		$sql = 'SELECT  FROM `author` INNER JOIN `book` `b` ON (author.ID=b.AUTHOR_ID) GROUP BY b.ID,b.TITLE,b.ISBN,b.PRICE,b.PUBLISHER_ID,b.AUTHOR_ID';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'groupByClass() accepts the alias of a joined model');
	}

	public function testDistinct()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->distinct();
		$sql = 'SELECT DISTINCT  FROM ';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'distinct() adds a DISTINCT clause');
	}

	public function testLimit()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->limit(10);
		$sql = 'SELECT  FROM  LIMIT 10';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'limit() adds a LIMIT clause');
	}

	public function testOffset()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->limit(50);
		$c->offset(10);
		$sql = 'SELECT  FROM  LIMIT 10, 50';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'offset() adds an OFFSET clause');
	}




	public function testAddJoin()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID);
		$c->addJoin(BookPeer::PUBLISHER_ID, PublisherPeer::ID);
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID) INNER JOIN `publisher` ON (book.PUBLISHER_ID=publisher.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'addJoin() works the same as in Criteria');
	}

	public function testJoin()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() uses a relation to guess the columns');

		$c = new ModelCriteria('bookstore', 'Book');
		try {
			$c->join('Book.Foo');
			$this->fail('join() throws an exception when called with a non-existing relation');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'join() throws an exception when called with a non-existing relation');
		}

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');
		$c->where('Author.FirstName = ?', 'Leo');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE author.FIRST_NAME = :p1';
		$params = array(
			array('table' => 'author', 'column' => 'FIRST_NAME', 'value' => 'Leo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() uses a relation to guess the columns');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Author');
		$c->where('Author.FirstName = ?', 'Leo');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE author.FIRST_NAME = :p1';
		$params = array(
			array('table' => 'author', 'column' => 'FIRST_NAME', 'value' => 'Leo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() uses the current model name when given a simple relation name');
	}

	public function testJoinQuery()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		BookstoreDataPopulator::depopulate($con);
		BookstoreDataPopulator::populate($con);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');
		$c->where('Author.FirstName = ?', 'Neal');
		$books = BookPeer::doSelect($c);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE author.FIRST_NAME = 'Neal'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'join() issues a real JOIN query');
		$this->assertEquals(1, count($books), 'join() issues a real JOIN query');
	}

	public function testJoinRelationName()
	{
		$c = new ModelCriteria('bookstore', 'BookstoreEmployee');
		$c->join('BookstoreEmployee.Supervisor');
		$sql = 'SELECT  FROM  INNER JOIN `bookstore_employee` ON (bookstore_employee.SUPERVISOR_ID=bookstore_employee.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() uses relation names as defined in schema.xml');
	}

	public function testJoinComposite()
	{
		$c = new ModelCriteria('bookstore', 'ReaderFavorite');
		$c->join('ReaderFavorite.BookOpinion');
		$sql = 'SELECT  FROM `reader_favorite` INNER JOIN `book_opinion` ON (reader_favorite.BOOK_ID=book_opinion.BOOK_ID AND reader_favorite.READER_ID=book_opinion.READER_ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() knows how to create a JOIN clause for relationships with composite fkeys');
	}

	public function testJoinType()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() adds an INNER JOIN by default');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() adds an INNER JOIN by default');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::LEFT_JOIN);
		$sql = 'SELECT  FROM `book` LEFT JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() can add a LEFT JOIN');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::RIGHT_JOIN);
		$sql = 'SELECT  FROM `book` RIGHT JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() can add a RIGHT JOIN');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', 'incorrect join');
		$sql = 'SELECT  FROM `book` incorrect join `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() accepts any join string');
	}

	public function testJoinDirection()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() adds a JOIN clause correctly for many to one relationship');

		$c = new ModelCriteria('bookstore', 'Author');
		$c->join('Author.Book');
		$sql = 'SELECT  FROM `author` INNER JOIN `book` ON (author.ID=book.AUTHOR_ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() adds a JOIN clause correctly for one to many relationship');

		$c = new ModelCriteria('bookstore', 'BookstoreEmployee');
		$c->join('BookstoreEmployee.BookstoreEmployeeAccount');
		$sql = 'SELECT  FROM `bookstore_employee` INNER JOIN `bookstore_employee_account` ON (bookstore_employee.ID=bookstore_employee_account.EMPLOYEE_ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() adds a JOIN clause correctly for one to one relationship');

		$c = new ModelCriteria('bookstore', 'BookstoreEmployeeAccount');
		$c->join('BookstoreEmployeeAccount.BookstoreEmployee');
		$sql = 'SELECT  FROM `bookstore_employee_account` INNER JOIN `bookstore_employee` ON (bookstore_employee_account.EMPLOYEE_ID=bookstore_employee.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() adds a JOIN clause correctly for one to one relationship');
	}

	public function testJoinSeveral()
	{
		$c = new ModelCriteria('bookstore', 'Author');
		$c->join('Author.Book');
		$c->join('Book.Publisher');
		$c->where('Publisher.Name = ?', 'foo');
		$sql = 'SELECT  FROM `author` INNER JOIN `book` ON (author.ID=book.AUTHOR_ID) INNER JOIN `publisher` ON (book.PUBLISHER_ID=publisher.ID) WHERE publisher.NAME = :p1';
		$params = array(
			array('table' => 'publisher', 'column' => 'NAME', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() can guess relationships from related tables');
	}

	public function testJoinAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('b.Author');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() supports relation on main alias');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('Author');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() can use a simple relation name when the model has an alias');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author a');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` `a` ON (book.AUTHOR_ID=a.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() supports relation alias');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('b.Author a');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` `a` ON (book.AUTHOR_ID=a.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() supports relation alias on main alias');

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('b.Author a');
		$c->where('a.FirstName = ?', 'Leo');
		$sql = 'SELECT  FROM `book` INNER JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = :p1';
		$params = array(
			array('table' => 'author', 'column' => 'FIRST_NAME', 'value' => 'Leo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() allows the use of relation alias in where()');

		$c = new ModelCriteria('bookstore', 'Author', 'a');
		$c->join('a.Book b');
		$c->join('b.Publisher p');
		$c->where('p.Name = ?', 'foo');
		$sql = 'SELECT  FROM `author` INNER JOIN `book` `b` ON (author.ID=b.AUTHOR_ID) INNER JOIN `publisher` `p` ON (b.PUBLISHER_ID=p.ID) WHERE p.NAME = :p1';
		$params = array(
			array('table' => 'publisher', 'column' => 'NAME', 'value' => 'foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() allows the use of relation alias in further join()');
	}

	public function testJoinTrueTableAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$c->join('b.Author');
		$sql = 'SELECT  FROM `book` `b` INNER JOIN `author` ON (b.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() supports relation on true table alias');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$c->join('Author');
		$sql = 'SELECT  FROM `book` `b` INNER JOIN `author` ON (b.AUTHOR_ID=author.ID)';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() supports relation without alias name on true table alias');
	}

	public function testJoinOnSameTable()
	{
		$c = new ModelCriteria('bookstore', 'BookstoreEmployee', 'be');
		$c->join('be.Supervisor sup');
		$c->join('sup.Subordinate sub');
		$c->where('sub.Name = ?', 'Foo');
		$sql = 'SELECT  FROM `bookstore_employee` INNER JOIN `bookstore_employee` `sup` ON (bookstore_employee.SUPERVISOR_ID=sup.ID) INNER JOIN `bookstore_employee` `sub` ON (sup.ID=sub.SUPERVISOR_ID) WHERE sub.NAME = :p1';
		$params = array(
			array('table' => 'bookstore_employee', 'column' => 'NAME', 'value' => 'Foo'),
		);
		$this->assertCriteriaTranslation($c, $sql, $params, 'join() allows two joins on the same table thanks to aliases');
	}

	public function testJoinAliasQuery()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('b.Author a');
		$c->where('a.FirstName = ?', 'Leo');
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = 'Leo'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'join() allows the use of relation alias in where()');

		$c = new ModelCriteria('bookstore', 'BookstoreEmployee', 'be');
		$c->join('be.Supervisor sup');
		$c->join('sup.Subordinate sub');
		$c->where('sub.Name = ?', 'Foo');
		$employees = BookstoreEmployeePeer::doSelect($c, $con);
		$expectedSQL = "SELECT bookstore_employee.ID, bookstore_employee.CLASS_KEY, bookstore_employee.NAME, bookstore_employee.JOB_TITLE, bookstore_employee.SUPERVISOR_ID FROM `bookstore_employee` INNER JOIN `bookstore_employee` `sup` ON (bookstore_employee.SUPERVISOR_ID=sup.ID) INNER JOIN `bookstore_employee` `sub` ON (sup.ID=sub.SUPERVISOR_ID) WHERE sub.NAME = 'Foo'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'join() allows the use of relation alias in further joins()');
	}

	public function testAddJoinConditionSimple()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$c->addJoinCondition('Author', 'Book.Title IS NOT NULL');
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID AND book.TITLE IS NOT NULL)";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'addJoinCondition() allows the use of custom conditions');
	}

	public function testAddJoinConditionBinding()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$c->addJoinCondition('Author', 'Book.Title = ?', 'foo');
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID AND book.TITLE = 'foo')";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'addJoinCondition() allows the use of custom conditions with values to bind');
	}

	public function testAddJoinConditionSeveral()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$c->addJoinCondition('Author', 'Book.Title = ?', 'foo');
		$c->addJoinCondition('Author', 'Book.ISBN IS NOT NULL');
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON ((book.AUTHOR_ID=author.ID AND book.TITLE = 'foo') AND book.ISBN IS NOT NULL)";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'addJoinCondition() allows the use of several custom conditions');
	}

	public function testAddJoinConditionBindingAndWhere()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->where('Book.Title LIKE ?', 'foo%');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$c->addJoinCondition('Author', 'Book.Title = ?', 'foo');
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID AND book.TITLE = 'foo') WHERE book.TITLE LIKE 'foo%'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'addJoinCondition() allows the use of custom conditions with values and lives well with WHERE conditions');
	}

	public function testAddJoinConditionAlias()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author a', Criteria::INNER_JOIN);
		$c->addJoinCondition('a', 'Book.Title IS NOT NULL');
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` `a` ON (book.AUTHOR_ID=a.ID AND book.TITLE IS NOT NULL)";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'addJoinCondition() allows the use of custom conditions even on aliased relations');
	}

	public function testAddJoinConditionOperator()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$c->addJoinCondition('Author', 'Book.Title IS NOT NULL', null, Criteria::LOGICAL_OR);
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON (book.AUTHOR_ID=author.ID OR book.TITLE IS NOT NULL)";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'addJoinCondition() allows the use of custom conditions with a custom operator');
	}

	public function testSetJoinConditionCriterion()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$criterion = $c->getNewCriterion(BookPeer::TITLE, BookPeer::TITLE . ' = ' . AuthorPeer::FIRST_NAME, Criteria::CUSTOM);
		$c->setJoinCondition('Author', $criterion);
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON book.TITLE = author.FIRST_NAME";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'setJoinCondition() can override a previous join condition with a Criterion');
	}

	public function testSetJoinConditionNamedCondition()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author', Criteria::INNER_JOIN);
		$c->condition('cond1', 'Book.Title = Author.FirstName');
		$c->setJoinCondition('Author', 'cond1');
		$books = BookPeer::doSelect($c, $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` ON book.TITLE = author.FIRST_NAME";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'setJoinCondition() can override a previous join condition with a named condition');
	}

	public function testGetJoin()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');

		$joins = $c->getJoins();
		$this->assertEquals($joins['Author'], $c->getJoin('Author'), "getJoin() returns a specific Join from the ModelCriteria");
	}

	public function testWith()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');
		$c->with('Author');
		$withs = $c->getWith();
		$this->assertTrue(array_key_exists('Author', $withs), 'with() adds an entry to the internal list of Withs');
		$this->assertTrue($withs['Author'] instanceof ModelWith, 'with() references the ModelWith object');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testWithThrowsExceptionWhenJoinLacks()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->with('Author');
	}

	public function testWithAlias()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->join('Book.Author a');
		$c->with('a');
		$withs = $c->getWith();
		$this->assertTrue(array_key_exists('a', $withs), 'with() uses the alias for the index of the internal list of Withs');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testWithThrowsExceptionWhenNotUsingAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->join('Book.Author a');
		$c->with('Author');
	}

	public function testWithAddsSelectColumns()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		BookPeer::addSelectColumns($c);
		$c->join('Book.Author');
		$c->with('Author');
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'with() adds the columns of the related table');
	}

	public function testWithAliasAddsSelectColumns()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		BookPeer::addSelectColumns($c);
		$c->join('Book.Author a');
		$c->with('a');
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			'a.ID',
			'a.FIRST_NAME',
			'a.LAST_NAME',
			'a.EMAIL',
			'a.AGE'
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'with() adds the columns of the related table');
	}

	public function testWithAddsSelectColumnsOfMainTable()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->join('Book.Author');
		$c->with('Author');
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'with() adds the columns of the main table if required');
	}

	public function testWithAliasAddsSelectColumnsOfMainTable()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$c->join('b.Author a');
		$c->with('a');
		$expectedColumns = array(
			'b.ID',
			'b.TITLE',
			'b.ISBN',
			'b.PRICE',
			'b.PUBLISHER_ID',
			'b.AUTHOR_ID',
			'a.ID',
			'a.FIRST_NAME',
			'a.LAST_NAME',
			'a.EMAIL',
			'a.AGE'
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'with() adds the columns of the main table with an alias if required');
	}

	public function testWithOneToManyAddsSelectColumns()
	{
		$c = new TestableModelCriteria('bookstore', 'Author');
		AuthorPeer::addSelectColumns($c);
		$c->leftJoin('Author.Book');
		$c->with('Book');
		$expectedColumns = array(
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE,
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'with() adds the columns of the related table even in a one-to-many relationship');
	}

	public function testJoinWith()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->joinWith('Book.Author');
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'joinWith() adds the join');
		$joins = $c->getJoins();
		$join = $joins['Author'];
		$this->assertEquals(Criteria::INNER_JOIN, $join->getJoinType(), 'joinWith() adds an INNER JOIN by default');
	}

	public function testJoinWithType()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->joinWith('Book.Author', Criteria::LEFT_JOIN);
		$joins = $c->getJoins();
		$join = $joins['Author'];
		$this->assertEquals(Criteria::LEFT_JOIN, $join->getJoinType(), 'joinWith() accepts a join type as second parameter');
	}

	public function testJoinWithAlias()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->joinWith('Book.Author a');
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			'a.ID',
			'a.FIRST_NAME',
			'a.LAST_NAME',
			'a.EMAIL',
			'a.AGE'
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'joinWith() adds the join with the alias');
	}

	public function testJoinWithSeveral()
	{
		$c = new TestableModelCriteria('bookstore', 'Review');
		$c->joinWith('Review.Book');
		$c->joinWith('Book.Author');
		$c->joinWith('Book.Publisher');
		$expectedColumns = array(
			ReviewPeer::ID,
			ReviewPeer::REVIEWED_BY,
			ReviewPeer::REVIEW_DATE,
			ReviewPeer::RECOMMENDED,
			ReviewPeer::STATUS,
			ReviewPeer::BOOK_ID,
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE,
			PublisherPeer::ID,
			PublisherPeer::NAME
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'joinWith() adds the with');
		$joins = $c->getJoins();
		$expectedJoinKeys = array('Book', 'Author', 'Publisher');
		$this->assertEquals($expectedJoinKeys, array_keys($joins), 'joinWith() adds the join');
	}

	public function testJoinWithTwice()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->join('Book.Review');
		$c->joinWith('Book.Author');
		$c->joinWith('Book.Review');
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE,
			ReviewPeer::ID,
			ReviewPeer::REVIEWED_BY,
			ReviewPeer::REVIEW_DATE,
			ReviewPeer::RECOMMENDED,
			ReviewPeer::STATUS,
			ReviewPeer::BOOK_ID,
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'joinWith() adds the with');
		$joins = $c->getJoins();
		$expectedJoinKeys = array('Review', 'Author');
		$this->assertEquals($expectedJoinKeys, array_keys($joins), 'joinWith() adds the join');
	}

	public static function conditionsForTestWithColumn()
	{
		return array(
			array('Book.Title', 'BookTitle', 'book.TITLE AS BookTitle'),
			array('Book.Title', null, 'book.TITLE AS BookTitle'),
			array('UPPER(Book.Title)', null, 'UPPER(book.TITLE) AS UPPERBookTitle'),
			array('CONCAT(Book.Title, Book.ISBN)', 'foo', 'CONCAT(book.TITLE, book.ISBN) AS foo'),
		);
	}

	/**
	 * @dataProvider conditionsForTestWithColumn
	 */
	public function testWithColumn($clause, $alias, $selectTranslation)
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->withColumn($clause, $alias);
		$sql = 'SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID, ' . $selectTranslation . ' FROM `book`';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'withColumn() adds a calculated column to the select clause');
	}

	public static function conditionsForTestWithColumnAndQuotes()
	{
		return array(
			// Examples for simple string concatenation needed for MSSQL.
			// MSSQL has no CONCAT() function so uses + to join strings.
			array("CONVERT(varchar, Author.Age, 120) + \' GMT\'", 'GMTCreatedAt', "CONVERT(varchar, author.AGE, 120) + \' GMT\' AS GMTCreatedAt"),
			array("(Author.FirstName + ' ' + Author.LastName)", 'AuthorFullname', "(author.FIRST_NAME + ' ' + author.LAST_NAME) AS AuthorFullname"),
			array("('\"' + Author.FirstName + ' ' + Author.LastName + '\"')", 'QuotedAuthorFullname', "('\"' + author.FIRST_NAME + ' ' + author.LAST_NAME + '\"') AS QuotedAuthorFullname"),

			// Examples for simple string concatenation needed for Sqlite
			// Sqlite has no CONCAT() function so uses || to join strings.  || can also be used to join strings in PQSql and Oracle
			array("(Author.FirstName || ' ' || Author.LastName)", 'AuthorFullname', "(author.FIRST_NAME || ' ' || author.LAST_NAME) AS AuthorFullname"),
			array("('\"' || Author.FirstName || ' ' || Author.LastName || '\"')", 'QuotedAuthorFullname', "('\"' || author.FIRST_NAME || ' ' || author.LAST_NAME || '\"') AS QuotedAuthorFullname"),
		);
	}

	/**
	 * @dataProvider conditionsForTestWithColumnAndQuotes
	 */
	public function testWithColumnAndQuotes($clause, $alias, $selectTranslation)
	{
		$c = new ModelCriteria('bookstore', 'Author');
		$c->withColumn($clause, $alias);
		$sql = 'SELECT author.ID, author.FIRST_NAME, author.LAST_NAME, author.EMAIL, author.AGE, ' . $selectTranslation . ' FROM `author`';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'withColumn() adds a calculated column using quotes to the select clause');
	}

	public function testWithColumnAndSelectColumns()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->withColumn('UPPER(Book.Title)', 'foo');
		$sql = 'SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID, UPPER(book.TITLE) AS foo FROM `book`';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'withColumn() adds the object columns if the criteria has no select columns');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->addSelectColumn('book.ID');
		$c->withColumn('UPPER(Book.Title)', 'foo');
		$sql = 'SELECT book.ID, UPPER(book.TITLE) AS foo FROM `book`';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'withColumn() does not add the object columns if the criteria already has select columns');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->addSelectColumn('book.ID');
		$c->withColumn('UPPER(Book.Title)', 'foo');
		$c->addSelectColumn('book.TITLE');
		$sql = 'SELECT book.ID, book.TITLE, UPPER(book.TITLE) AS foo FROM `book`';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'withColumn() does adds as column after the select columns even though the withColumn() method was called first');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->addSelectColumn('book.ID');
		$c->withColumn('UPPER(Book.Title)', 'foo');
		$c->withColumn('UPPER(Book.ISBN)', 'isbn');
		$sql = 'SELECT book.ID, UPPER(book.TITLE) AS foo, UPPER(book.ISBN) AS isbn FROM `book`';
		$params = array();
		$this->assertCriteriaTranslation($c, $sql, $params, 'withColumn() called repeatedly adds several as colums');
	}

	public function testKeepQuery()
	{
		$c = BookQuery::create();
		$this->assertTrue($c->isKeepQuery(), 'keepQuery is enabled by default');
		$c->keepQuery(false);
		$this->assertFalse($c->isKeepQuery(), 'keepQuery(false) disables the keepQuery property');
		$c->keepQuery();
		$this->assertTrue($c->isKeepQuery(), 'keepQuery() enables the keepQuery property');
	}

	public function testKeepQueryFind()
	{
		$c = BookQuery::create();
		$c->filterByTitle('foo');
		$c->find();
		$this->assertEquals(array(), $c->getSelectColumns(), 'find() clones the query by default');

		$c = BookQuery::create();
		$c->filterByTitle('foo');
		$c->keepQuery(false);
		$c->find();
		$expected = array('book.ID', 'book.TITLE', 'book.ISBN', 'book.PRICE', 'book.PUBLISHER_ID', 'book.AUTHOR_ID');
		$this->assertEquals($expected, $c->getSelectColumns(), 'keepQuery(false) forces find() to use the original query');
	}

	public function testKeepQueryFindOne()
	{
		$c = BookQuery::create();
		$c->filterByTitle('foo');
		$c->findOne();
		$this->assertEquals(0, $c->getLimit(), 'findOne() clones the query by default');

		$c = BookQuery::create();
		$c->filterByTitle('foo');
		$c->keepQuery(false);
		$c->findOne();
		$this->assertEquals(1, $c->getLimit(), 'keepQuery(false) forces findOne() to use the original query');
	}

	public function testKeepQueryFindPk()
	{
		$c = BookQuery::create();
		$c->findPk(1);
		$this->assertEquals(array(), $c->getSelectColumns(), 'findPk() clones the query by default');

		$c = BookQuery::create('b');
		$c->keepQuery(false);
		$c->findPk(1);
		$expected = array('book.ID', 'book.TITLE', 'book.ISBN', 'book.PRICE', 'book.PUBLISHER_ID', 'book.AUTHOR_ID');
		$this->assertEquals($expected, $c->getSelectColumns(), 'keepQuery(false) forces findPk() to use the original query');
	}

	public function testKeepQueryCount()
	{
		$c = BookQuery::create();
		$c->orderByTitle();
		$c->count();
		$this->assertEquals(array('book.TITLE ASC'), $c->getOrderByColumns(), 'count() clones the query by default');

		$c = BookQuery::create();
		$c->orderByTitle();
		$c->keepQuery(false);
		$c->count();
		$this->assertEquals(array(), $c->getOrderByColumns(), 'keepQuery() forces count() to use the original query');
	}

	public function testFind()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');
		$books = $c->find();
		$this->assertTrue($books instanceof PropelCollection, 'find() returns a collection by default');
		$this->assertEquals(0, count($books), 'find() returns an empty array when the query returns no result');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('b.Author a');
		$c->where('a.FirstName = ?', 'Neal');
		$books = $c->find();
		$this->assertTrue($books instanceof PropelCollection, 'find() returns a collection by default');
		$this->assertEquals(1, count($books), 'find() returns as many rows as the results in the query');
		$book = $books->shift();
		$this->assertTrue($book instanceof Book, 'find() returns an array of Model objects by default');
		$this->assertEquals('Quicksilver', $book->getTitle(), 'find() returns the model objects matching the query');
	}

	public function testFindAddsSelectColumns()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->find($con);
		$sql = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book`";
		$this->assertEquals($sql, $con->getLastExecutedQuery(), 'find() adds the select columns of the current model');
	}

	public function testFindTrueAliasAddsSelectColumns()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$books = $c->find($con);
		$sql = "SELECT b.ID, b.TITLE, b.ISBN, b.PRICE, b.PUBLISHER_ID, b.AUTHOR_ID FROM `book` `b`";
		$this->assertEquals($sql, $con->getLastExecutedQuery(), 'find() uses the true model alias if available');
	}

	public function testFindOne()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');
		$book = $c->findOne();
		$this->assertNull($book, 'findOne() returns null when the query returns no result');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->orderBy('b.Title');
		$book = $c->findOne();
		$this->assertTrue($book instanceof Book, 'findOne() returns a Model object by default');
		$this->assertEquals('Don Juan', $book->getTitle(), 'find() returns the model objects matching the query');
	}

	public function testFindOneOrCreateNotExists()
	{
		BookQuery::create()->deleteAll();
		$book = BookQuery::create('b')
			->where('b.Title = ?', 'foo')
			->filterByPrice(125)
			->findOneOrCreate();
		$this->assertTrue($book instanceof Book, 'findOneOrCreate() returns an instance of the model when the request has no result');
		$this->assertTrue($book->isNew(), 'findOneOrCreate() returns a new instance of the model when the request has no result');
		$this->assertEquals('foo', $book->getTitle(), 'findOneOrCreate() returns a populated objects based on the conditions');
		$this->assertEquals(125, $book->getPrice(), 'findOneOrCreate() returns a populated objects based on the conditions');
	}

	public function testFindOneOrCreateNotExistsFormatter()
	{
		BookQuery::create()->deleteAll();
		$book = BookQuery::create('b')
			->where('b.Title = ?', 'foo')
			->filterByPrice(125)
			->setFormatter(ModelCriteria::FORMAT_ARRAY)
			->findOneOrCreate();
		$this->assertTrue(is_array($book), 'findOneOrCreate() uses the query formatter even when the request has no result');
		$this->assertEquals('foo', $book['Title'], 'findOneOrCreate() returns a populated array based on the conditions');
		$this->assertEquals(125, $book['Price'], 'findOneOrCreate() returns a populated array based on the conditions');
	}

	public function testFindOneOrCreateExists()
	{
		BookQuery::create()->deleteAll();
		$book = new Book();
		$book->setTitle('foo');
		$book->setPrice(125);
		$book->save();
		$book = BookQuery::create('b')
			->where('b.Title = ?', 'foo')
			->filterByPrice(125)
			->findOneOrCreate();
		$this->assertTrue($book instanceof Book, 'findOneOrCreate() returns an instance of the model when the request has one result');
		$this->assertFalse($book->isNew(), 'findOneOrCreate() returns an existing instance of the model when the request has one result');
		$this->assertEquals('foo', $book->getTitle(), 'findOneOrCreate() returns a populated objects based on the conditions');
		$this->assertEquals(125, $book->getPrice(), 'findOneOrCreate() returns a populated objects based on the conditions');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testFindOneOrCreateThrowsExceptionWhenQueryContainsJoin()
	{
		$book = BookQuery::create('b')
			->filterByPrice(125)
			->useAuthorQuery()
			->filterByFirstName('Leo')
			->endUse()
			->findOneOrCreate();
	}

	public function testFindOneOrCreateMakesOneQueryWhenRecordNotExists()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		BookQuery::create()->deleteAll($con);
		$count = $con->getQueryCount();
		$book = BookQuery::create('b')
			->filterByPrice(125)
			->findOneOrCreate($con);
		$this->assertEquals($count + 1, $con->getQueryCount(), 'findOneOrCreate() makes only a single query when the record doesn\'t exist');
	}

	public function testFindOneOrCreateMakesOneQueryWhenRecordExists()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		BookQuery::create()->deleteAll($con);
		$book = new Book();
		$book->setPrice(125);
		$book->save($con);
		$count = $con->getQueryCount();
		$book = BookQuery::create('b')
			->filterByPrice(125)
			->findOneOrCreate($con);
		$this->assertEquals($count + 1, $con->getQueryCount(), 'findOneOrCreate() makes only a single query when the record exists');
	}

	public function testFindOneOrCreateWithEnums()
	{
		Book2Query::create()->deleteAll();

		$book = Book2Query::create('b')
			->where('b.Title = ?', 'bar')
			->filterByStyle('poetry')
			->findOneOrCreate();
		$this->assertTrue($book instanceof Book2, 'findOneOrCreate() returns an instance of the model when the request has no result');
		$this->assertTrue($book->isNew(), 'findOneOrCreate() returns a new instance of the model when the request has no result');
		$this->assertEquals('bar', $book->getTitle(), 'findOneOrCreate() returns a populated objects based on the conditions');
		$this->assertEquals('poetry', $book->getStyle(), 'findOneOrCreate() returns a populated objects based on the conditions');

		$book = Book2Query::create('b')
			->where('b.Title = ?', 'foobar')
			->filterByStyle('essay')
			->findOneOrCreate();
		$this->assertTrue($book instanceof Book2, 'findOneOrCreate() returns an instance of the model when the request has no result');
		$this->assertTrue($book->isNew(), 'findOneOrCreate() returns a new instance of the model when the request has no result');
		$this->assertEquals('foobar', $book->getTitle(), 'findOneOrCreate() returns a populated objects based on the conditions');
		$this->assertEquals('essay', $book->getStyle(), 'findOneOrCreate() returns a populated objects based on the conditions');

		$book = Book2Query::create('b')
			->where('b.Style = ?', 'novel')
			->findOneOrCreate();
		$this->assertTrue($book instanceof Book2, 'findOneOrCreate() returns an instance of the model when the request has no result');
		$this->assertTrue($book->isNew(), 'findOneOrCreate() returns a new instance of the model when the request has no result');
		$this->assertEquals('novel', $book->getStyle(), 'findOneOrCreate() returns a populated objects based on the conditions');
	}

	public function testFindOneOrCreateWithArrays()
	{
		Book2Query::create()->deleteAll();

		$book = Book2Query::create('b')
			->filterByTag('russian')
			->findOneOrCreate();
		$this->assertTrue($book instanceof Book2, 'findOneOrCreate() returns an instance of the model when the request has no result');
		$this->assertTrue($book->isNew(), 'findOneOrCreate() returns a new instance of the model when the request has no result');
		$this->assertTrue(is_array($book->getTags()), 'findOneOrCreate() returns a populated objects based on the conditions');
		$this->assertSame(array('russian'), $book->getTags(), 'findOneOrCreate() returns a populated objects based on the conditions');

		$book = Book2Query::create('b')
			->filterByTags(array('poetry'))
			->findOneOrCreate();
		$this->assertTrue($book instanceof Book2, 'findOneOrCreate() returns an instance of the model when the request has no result');
		$this->assertTrue($book->isNew(), 'findOneOrCreate() returns a new instance of the model when the request has no result');
		$this->assertTrue(is_array($book->getTags()), 'findOneOrCreate() returns a populated objects based on the conditions');
		$this->assertSame(array('poetry'), $book->getTags(), 'findOneOrCreate() returns a populated objects based on the conditions');
	}

	public function testFindPkSimpleKey()
	{
		BookstoreDataPopulator::depopulate();

		$c = new ModelCriteria('bookstore', 'Book');
		$book = $c->findPk(765432);
		$this->assertNull($book, 'findPk() returns null when the primary key is not found');

		BookstoreDataPopulator::populate();

		// retrieve the test data
		$c = new ModelCriteria('bookstore', 'Book');
		$testBook = $c->findOne();

		$c = new ModelCriteria('bookstore', 'Book');
		$book = $c->findPk($testBook->getId());
		$this->assertEquals($testBook, $book, 'findPk() returns a model object corresponding to the pk');
	}

	public function testFindPksSimpleKey()
	{
		BookstoreDataPopulator::depopulate();

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->findPks(array(765432, 434535));
		$this->assertTrue($books instanceof PropelCollection, 'findPks() returns a PropelCollection');
		$this->assertEquals(0, count($books), 'findPks() returns an empty collection when the primary keys are not found');

		BookstoreDataPopulator::populate();

		// retrieve the test data
		$c = new ModelCriteria('bookstore', 'Book');
		$testBooks = $c->find();
		$testBook1 = $testBooks->pop();
		$testBook2 = $testBooks->pop();

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->findPks(array($testBook1->getId(), $testBook2->getId()));
		$this->assertEquals(array($testBook2, $testBook1), $books->getData(), 'findPks() returns an array of model objects corresponding to the pks');
	}

	public function testFindPkCompositeKey()
	{
		BookstoreDataPopulator::depopulate();

		$c = new ModelCriteria('bookstore', 'BookListRel');
		$bookListRel = $c->findPk(array(1, 2));
		$this->assertNull($bookListRel, 'findPk() returns null when the composite primary key is not found');

		Propel::enableInstancePooling();
		BookstoreDataPopulator::populate();

		// save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->find();
		foreach ($books as $book) {
			$book->save();
		}

		// retrieve the test data
		$c = new ModelCriteria('bookstore', 'BookListRel');
		$bookListRelTest = $c->findOne();
		$pk = $bookListRelTest->getPrimaryKey();

		$c = new ModelCriteria('bookstore', 'BookListRel');
		$bookListRel = $c->findPk($pk);
		$this->assertEquals($bookListRelTest, $bookListRel, 'findPk() can find objects with composite primary keys');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testFindPksCompositeKey()
	{
		$c = new ModelCriteria('bookstore', 'BookListRel');
		$bookListRel = $c->findPks(array(array(1, 2)));

	}

	public function testFindBy()
	{
		try {
			$c = new ModelCriteria('bookstore', 'Book');
			$books = $c->findBy('Foo', 'Bar');
			$this->fail('findBy() throws an exception when called on an unknown column name');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'findBy() throws an exception when called on an unknown column name');
		}

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->findBy('Title', 'Don Juan', $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findBy() adds simple column conditions');
		$this->assertTrue($books instanceof PropelCollection, 'findBy() issues a find()');
		$this->assertEquals(1, count($books), 'findBy() adds simple column conditions');
		$book = $books->shift();
		$this->assertTrue($book instanceof Book, 'findBy() returns an array of Model objects by default');
		$this->assertEquals('Don Juan', $book->getTitle(), 'findBy() returns the model objects matching the query');
	}

	public function testFindByArray()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->findByArray(array('Title' => 'Don Juan', 'ISBN' => 12345), $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan' AND book.ISBN=12345";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findByArray() adds multiple column conditions');
	}

	public function testFindOneBy()
	{
		try {
			$c = new ModelCriteria('bookstore', 'Book');
			$book = $c->findOneBy('Foo', 'Bar');
			$this->fail('findOneBy() throws an exception when called on an unknown column name');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'findOneBy() throws an exception when called on an unknown column name');
		}

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$book = $c->findOneBy('Title', 'Don Juan', $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findOneBy() adds simple column conditions');
		$this->assertTrue($book instanceof Book, 'findOneBy() returns a Model object by default');
		$this->assertEquals('Don Juan', $book->getTitle(), 'findOneBy() returns the model object matching the query');
	}

	public function testFindOneByArray()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Book');
		$book = $c->findOneByArray(array('Title' => 'Don Juan', 'ISBN' => 12345), $con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan' AND book.ISBN=12345 LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findOneBy() adds multiple column conditions');
	}

	public function testCount()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');
		$nbBooks = $c->count();
		$this->assertTrue(is_int($nbBooks), 'count() returns an integer');
		$this->assertEquals(0, $nbBooks, 'count() returns 0 when the query returns no result');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('b.Author a');
		$c->where('a.FirstName = ?', 'Neal');
		$nbBooks = $c->count();
		$this->assertTrue(is_int($nbBooks), 'count() returns an integer');
		$this->assertEquals(1, $nbBooks, 'count() returns the number of results in the query');
	}

	public function testPaginate()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->join('b.Author a');
		$c->where('a.FirstName = ?', 'Neal');
		$books = $c->paginate(1, 5);
		$this->assertTrue($books instanceof PropelModelPager, 'paginate() returns a PropelModelPager');
		$this->assertEquals(1, count($books), 'paginate() returns a countable pager with the correct count');
		foreach ($books as $book) {
			$this->assertEquals('Neal', $book->getAuthor()->getFirstName(), 'paginate() returns an iterable pager');
		}
	}

	public function testDelete()
	{
		BookstoreDataPopulator::depopulate();
		BookstoreDataPopulator::populate();

		$c = new ModelCriteria('bookstore', 'Book');
		try {
			$nbBooks = $c->delete();
			$this->fail('delete() throws an exception when called on an empty Criteria');
		} catch (PropelException $e) {
			$this->assertTrue(true, 'delete() throws an exception when called on an empty Criteria');
		}

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');
		$nbBooks = $c->delete();
		$this->assertTrue(is_int($nbBooks), 'delete() returns an integer');
		$this->assertEquals(0, $nbBooks, 'delete() returns 0 when the query deleted no rows');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'Don Juan');
		$nbBooks = $c->delete();
		$this->assertTrue(is_int($nbBooks), 'delete() returns an integer');
		$this->assertEquals(1, $nbBooks, 'delete() returns the number of the deleted rows');

		$c = new ModelCriteria('bookstore', 'Book');
		$nbBooks = $c->count();
		$this->assertEquals(3, $nbBooks, 'delete() deletes rows in the database');
	}

	public function testDeleteUsingTableAlias()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', false);
		$c->where('b.Title = ?', 'foo');
		$c->delete();
		$expectedSQL = "DELETE FROM `book` WHERE book.TITLE = 'foo'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'delete() also works on tables with table alias');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$c->where('b.Title = ?', 'foo');
		$c->delete();
		$expectedSQL = "DELETE b FROM `book` AS b WHERE b.TITLE = 'foo'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'delete() also works on tables with true table alias');
	}

	public function testDeleteAll()
	{
		BookstoreDataPopulator::depopulate();
		BookstoreDataPopulator::populate();

		$c = new ModelCriteria('bookstore', 'Book');
		$nbBooks = $c->deleteAll();
		$this->assertTrue(is_int($nbBooks), 'deleteAll() returns an integer');
		$this->assertEquals(4, $nbBooks, 'deleteAll() returns the number of deleted rows');

		BookstoreDataPopulator::depopulate();
		BookstoreDataPopulator::populate();

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'Don Juan');
		$nbBooks = $c->deleteAll();
		$this->assertEquals(4, $nbBooks, 'deleteAll() ignores conditions on the criteria');
	}

	public function testUpdate()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		BookstoreDataPopulator::depopulate($con);
		BookstoreDataPopulator::populate($con);

		$count = $con->getQueryCount();
		$c = new ModelCriteria('bookstore', 'Book');
		$nbBooks = $c->update(array('Title' => 'foo'), $con);
		$this->assertEquals(4, $nbBooks, 'update() returns the number of updated rows');
		$this->assertEquals($count + 1, $con->getQueryCount(), 'update() updates all the objects in one query by default');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');
		$nbBooks = $c->count();
		$this->assertEquals(4, $nbBooks, 'update() updates all records by default');

		BookstoreDataPopulator::depopulate($con);
		BookstoreDataPopulator::populate($con);

		$count = $con->getQueryCount();
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'Don Juan');
		$nbBooks = $c->update(array('ISBN' => '3456'), $con);
		$this->assertEquals(1, $nbBooks, 'update() updates only the records matching the criteria');
		$this->assertEquals($count + 1, $con->getQueryCount(), 'update() updates all the objects in one query by default');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'Don Juan');
		$book = $c->findOne();
		$this->assertEquals('3456', $book->getISBN(), 'update() updates only the records matching the criteria');
	}

	public function testUpdateUsingTableAlias()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', false);
		$c->where('b.Title = ?', 'foo');
		$c->update(array('Title' => 'foo2'), $con);
		$expectedSQL = "UPDATE `book` SET `TITLE`='foo2' WHERE book.TITLE = 'foo'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'update() also works on tables with table alias');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('b', true);
		$c->where('b.Title = ?', 'foo');
		$c->update(array('Title' => 'foo2'), $con);
		$expectedSQL = "UPDATE `book` `b` SET `TITLE`='foo2' WHERE b.TITLE = 'foo'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'update() also works on tables with true table alias');
	}

	public function testUpdateOneByOne()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		BookstoreDataPopulator::depopulate($con);
		BookstoreDataPopulator::populate($con);

		// save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->find();
		foreach ($books as $book) {
			$book->save();
		}

		$count = $con->getQueryCount();
		$c = new ModelCriteria('bookstore', 'Book');
		$nbBooks = $c->update(array('Title' => 'foo'), $con, true);
		$this->assertEquals(4, $nbBooks, 'update() returns the number of updated rows');
		$this->assertEquals($count + 1 + 4, $con->getQueryCount(), 'update() updates the objects one by one when called with true as last parameter');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'foo');
		$nbBooks = $c->count();
		$this->assertEquals(4, $nbBooks, 'update() updates all records by default');

		BookstoreDataPopulator::depopulate($con);
		BookstoreDataPopulator::populate($con);

		// save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->find();
		foreach ($books as $book) {
			$book->save();
		}

		$count = $con->getQueryCount();
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'Don Juan');
		$nbBooks = $c->update(array('ISBN' => '3456'), $con, true);
		$this->assertEquals(1, $nbBooks, 'update() updates only the records matching the criteria');
		$this->assertEquals($count + 1 + 1, $con->getQueryCount(), 'update() updates the objects one by one when called with true as last parameter');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->where('b.Title = ?', 'Don Juan');
		$book = $c->findOne();
		$this->assertEquals('3456', $book->getISBN(), 'update() updates only the records matching the criteria');
	}

	public static function conditionsForTestGetRelationName()
	{
		return array(
			array('Author', 'Author'),
			array('Book.Author', 'Author'),
			array('Author.Book', 'Book'),
			array('Book.Author a', 'a'),
		);
	}

	/**
	 * @dataProvider conditionsForTestGetRelationName
	 */
	public function testGetRelationName($relation, $relationName)
	{
		$this->assertEquals($relationName, ModelCriteria::getrelationName($relation));
	}

	public function testMagicJoin()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->leftJoin('b.Author a');
		$c->where('a.FirstName = ?', 'Leo');
		$books = $c->findOne($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` LEFT JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = 'Leo' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'leftJoin($x) is turned into join($x, Criteria::LEFT_JOIN)');

		$books = BookQuery::create()
			->leftJoinAuthor('a')
			->where('a.FirstName = ?', 'Leo')
			->findOne($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` LEFT JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = 'Leo' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'leftJoinX() is turned into join($x, Criteria::LEFT_JOIN)');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->innerJoin('b.Author a');
		$c->where('a.FirstName = ?', 'Leo');
		$books = $c->findOne($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = 'Leo' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'innerJoin($x) is turned into join($x, Criteria::INNER_JOIN)');

		$books = BookQuery::create()
			->innerJoinAuthor('a')
			->where('a.FirstName = ?', 'Leo')
			->findOne($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` INNER JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = 'Leo' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'innerJoinX() is turned into join($x, Criteria::INNER_JOIN)');

		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->rightJoin('b.Author a');
		$c->where('a.FirstName = ?', 'Leo');
		$books = $c->findOne($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` RIGHT JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = 'Leo' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'rightJoin($x) is turned into join($x, Criteria::RIGHT_JOIN)');

		$books = BookQuery::create()
			->rightJoinAuthor('a')
			->where('a.FirstName = ?', 'Leo')
			->findOne($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` RIGHT JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE a.FIRST_NAME = 'Leo' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'rightJoinX() is turned into join($x, Criteria::RIGHT_JOIN)');

		$books = BookQuery::create()
			->leftJoinAuthor()
			->where('Author.FirstName = ?', 'Leo')
			->findOne($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` LEFT JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE author.FIRST_NAME = 'Leo' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'leftJoinX() is turned into join($x, Criteria::LEFT_JOIN)');
	}

	public function testMagicJoinWith()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->leftJoinWith('Book.Author a');
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			'a.ID',
			'a.FIRST_NAME',
			'a.LAST_NAME',
			'a.EMAIL',
			'a.AGE'
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'leftJoinWith() adds the join with the alias');
		$joins = $c->getJoins();
		$join = $joins['a'];
		$this->assertEquals(Criteria::LEFT_JOIN, $join->getJoinType(), 'leftJoinWith() adds a LEFT JOIN');
	}

	public function testMagicJoinWithRelation()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->joinWithAuthor();
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'joinWithXXX() adds the join with the XXX relation');
		$joins = $c->getJoins();
		$join = $joins['Author'];
		$this->assertEquals(Criteria::INNER_JOIN, $join->getJoinType(), 'joinWithXXX() adds an INNER JOIN');
	}

	public function testMagicJoinWithTypeAndRelation()
	{
		$c = new TestableModelCriteria('bookstore', 'Book');
		$c->leftJoinWithAuthor();
		$expectedColumns = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID,
			AuthorPeer::ID,
			AuthorPeer::FIRST_NAME,
			AuthorPeer::LAST_NAME,
			AuthorPeer::EMAIL,
			AuthorPeer::AGE
		);
		$this->assertEquals($expectedColumns, $c->getSelectColumns(), 'leftJoinWithXXX() adds the join with the XXX relation');
		$joins = $c->getJoins();
		$join = $joins['Author'];
		$this->assertEquals(Criteria::LEFT_JOIN, $join->getJoinType(), 'leftJoinWithXXX() adds an INNER JOIN');
	}

	public function testMagicFind()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->findByTitle('Don Juan');
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findByXXX($value) is turned into findBy(XXX, $value)');

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->findByTitleAndISBN('Don Juan', 1234);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan' AND book.ISBN=1234";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findByXXXAndYYY($value) is turned into findBy(array(XXX,YYY), $value)');

		$c = new ModelCriteria('bookstore', 'Book');
		$book = $c->findOneByTitle('Don Juan');
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan' LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findOneByXXX($value) is turned into findOneBy(XXX, $value)');

		$c = new ModelCriteria('bookstore', 'Book');
		$book = $c->findOneByTitleAndISBN('Don Juan', 1234);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan' AND book.ISBN=1234 LIMIT 1";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findOneByXXX($value) is turned into findOneBy(XXX, $value)');
	}

	public function testMagicFindByObject()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new ModelCriteria('bookstore', 'Author');
		$testAuthor = $c->findOne();
		$q = BookQuery::create()
			->findByAuthor($testAuthor);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.AUTHOR_ID=" . $testAuthor->getId();
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findByXXX($value) is turned into findBy(XXX, $value)');

		$c = new ModelCriteria('bookstore', 'Author');
		$testAuthor = $c->findOne();
		$q = BookQuery::create()
			->findByAuthorAndISBN($testAuthor, 1234);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.AUTHOR_ID=" . $testAuthor->getId() . " AND book.ISBN=1234";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'findByXXXAndYYY($value) is turned into findBy(array(XXX, YYY), $value)');
	}

	public function testMagicFilterBy()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->filterByTitle('Don Juan')->find($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE='Don Juan'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'filterByXXX($value) is turned into filterBy(XXX, $value)');
	}

	public function testMagicOrderBy()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->orderByTitle()->find($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` ORDER BY book.TITLE ASC";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'orderByXXX() is turned into orderBy(XXX)');

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->orderByTitle(Criteria::DESC)->find($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` ORDER BY book.TITLE DESC";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'orderByXXX($direction) is turned into orderBy(XXX, $direction)');
	}

	public function testMagicGroupBy()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$c = new ModelCriteria('bookstore', 'Book');
		$books = $c->groupByTitle()->find($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` GROUP BY book.TITLE";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'groupByXXX() is turned into groupBy(XXX)');
	}

	public function testUseQuery()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->thisIsMe = true;
		$c->where('b.Title = ?', 'foo');
		$c->setOffset(10);
		$c->leftJoin('b.Author');

		$c2 = $c->useQuery('Author');
		$this->assertTrue($c2 instanceof AuthorQuery, 'useQuery() returns a secondary Criteria');
		$this->assertEquals($c, $c2->getPrimaryCriteria(), 'useQuery() sets the primary Criteria os the secondary Criteria');
		$c2->where('Author.FirstName = ?', 'john');
		$c2->limit(5);

		$c = $c2->endUse();
		$this->assertTrue($c->thisIsMe, 'endUse() returns the Primary Criteria');
		$this->assertEquals('Book', $c->getModelName(), 'endUse() returns the Primary Criteria');

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c->find($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` LEFT JOIN `author` ON (book.AUTHOR_ID=author.ID) WHERE book.TITLE = 'foo' AND author.FIRST_NAME = 'john' LIMIT 10, 5";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'useQuery() and endUse() allow to merge a secondary criteria');
	}

	public function testUseQueryAlias()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->thisIsMe = true;
		$c->where('b.Title = ?', 'foo');
		$c->setOffset(10);
		$c->leftJoin('b.Author a');

		$c2 = $c->useQuery('a');
		$this->assertTrue($c2 instanceof AuthorQuery, 'useQuery() returns a secondary Criteria');
		$this->assertEquals($c, $c2->getPrimaryCriteria(), 'useQuery() sets the primary Criteria os the secondary Criteria');
		$this->assertEquals(array('a' => 'author'), $c2->getAliases(), 'useQuery() sets the secondary Criteria alias correctly');
		$c2->where('a.FirstName = ?', 'john');
		$c2->limit(5);

		$c = $c2->endUse();
		$this->assertTrue($c->thisIsMe, 'endUse() returns the Primary Criteria');
		$this->assertEquals('Book', $c->getModelName(), 'endUse() returns the Primary Criteria');

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c->find($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` LEFT JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE book.TITLE = 'foo' AND a.FIRST_NAME = 'john' LIMIT 10, 5";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'useQuery() and endUse() allow to merge a secondary criteria');
	}

	public function testUseQueryCustomClass()
	{
		$c = new ModelCriteria('bookstore', 'Book', 'b');
		$c->thisIsMe = true;
		$c->where('b.Title = ?', 'foo');
		$c->setLimit(10);
		$c->leftJoin('b.Author a');

		$c2 = $c->useQuery('a', 'ModelCriteriaForUseQuery');
		$this->assertTrue($c2 instanceof ModelCriteriaForUseQuery, 'useQuery() returns a secondary Criteria with the custom class');
		$c2->withNoName();
		$c = $c2->endUse();

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c->find($con);
		$expectedSQL = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` LEFT JOIN `author` `a` ON (book.AUTHOR_ID=a.ID) WHERE book.TITLE = 'foo' AND a.FIRST_NAME IS NOT NULL  AND a.LAST_NAME IS NOT NULL LIMIT 10";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'useQuery() and endUse() allow to merge a custom secondary criteria');
	}

	public function testUseQueryJoinWithFind()
	{
		$c = new ModelCriteria('bookstore', 'Review');
		$c->joinWith('Book');

		$c2 = $c->useQuery('Book');

		$joins = $c->getJoins();
		$this->assertEquals($c->getPreviousJoin(), null, 'The default value for previousJoin remains null');
		$this->assertEquals($c2->getPreviousJoin(), $joins['Book'], 'useQuery() sets the previousJoin');

		// join Book with Author, which is possible since previousJoin is set, which makes resolving of relations possible during hydration
		$c2->joinWith('Author');

		$c = $c2->endUse();

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c->find($con);
		$expectedSQL = "SELECT review.ID, review.REVIEWED_BY, review.REVIEW_DATE, review.RECOMMENDED, review.STATUS, review.BOOK_ID, book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID, author.ID, author.FIRST_NAME, author.LAST_NAME, author.EMAIL, author.AGE FROM `review` INNER JOIN `book` ON (review.BOOK_ID=book.ID) INNER JOIN `author` ON (book.AUTHOR_ID=author.ID)";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'useQuery() and joinWith() can be used together and form a correct query');
	}

	public function testUseQueryCustomRelationPhpName()
	{
		$c = new ModelCriteria('bookstore', 'BookstoreContest');
		$c->leftJoin('BookstoreContest.Work');
		$c2 = $c->useQuery('Work');
		$this->assertTrue($c2 instanceof BookQuery, 'useQuery() returns a secondary Criteria');
		$this->assertEquals($c, $c2->getPrimaryCriteria(), 'useQuery() sets the primary Criteria os the secondary Criteria');
		//$this->assertEquals(array('a' => 'author'), $c2->getAliases(), 'useQuery() sets the secondary Criteria alias correctly');
		$c2->where('Work.Title = ?', 'War And Peace');

		$c = $c2->endUse();
		$this->assertEquals('BookstoreContest', $c->getModelName(), 'endUse() returns the Primary Criteria');

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c->find($con);
		$expectedSQL = "SELECT bookstore_contest.BOOKSTORE_ID, bookstore_contest.CONTEST_ID, bookstore_contest.PRIZE_BOOK_ID FROM `bookstore_contest` LEFT JOIN `book` ON (bookstore_contest.PRIZE_BOOK_ID=book.ID) WHERE book.TITLE = 'War And Peace'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'useQuery() and endUse() allow to merge a secondary criteria');
	}

	public function testUseQueryCustomRelationPhpNameAndAlias()
	{
		$c = new ModelCriteria('bookstore', 'BookstoreContest');
		$c->leftJoin('BookstoreContest.Work w');
		$c2 = $c->useQuery('w');
		$this->assertTrue($c2 instanceof BookQuery, 'useQuery() returns a secondary Criteria');
		$this->assertEquals($c, $c2->getPrimaryCriteria(), 'useQuery() sets the primary Criteria os the secondary Criteria');
		//$this->assertEquals(array('a' => 'author'), $c2->getAliases(), 'useQuery() sets the secondary Criteria alias correctly');
		$c2->where('w.Title = ?', 'War And Peace');

		$c = $c2->endUse();
		$this->assertEquals('BookstoreContest', $c->getModelName(), 'endUse() returns the Primary Criteria');

		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c->find($con);
		$expectedSQL = "SELECT bookstore_contest.BOOKSTORE_ID, bookstore_contest.CONTEST_ID, bookstore_contest.PRIZE_BOOK_ID FROM `bookstore_contest` LEFT JOIN `book` `w` ON (bookstore_contest.PRIZE_BOOK_ID=w.ID) WHERE w.TITLE = 'War And Peace'";
		$this->assertEquals($expectedSQL, $con->getLastExecutedQuery(), 'useQuery() and endUse() allow to merge a secondary criteria');
	}

	public function testMergeWithJoins()
	{
		$c1 = new ModelCriteria('bookstore', 'Book', 'b');
		$c1->leftJoin('b.Author a');
		$c2 = new ModelCriteria('bookstore', 'Author');
		$c1->mergeWith($c2);
		$joins = $c1->getJoins();
		$this->assertEquals(1, count($joins), 'mergeWith() does not remove an existing join');
		$this->assertEquals('LEFT JOIN author a ON (book.AUTHOR_ID=a.ID)', $joins['a']->toString(), 'mergeWith() does not remove an existing join');
		$c1 = new ModelCriteria('bookstore', 'Book', 'b');
		$c2 = new ModelCriteria('bookstore', 'Book', 'b');
		$c2->leftJoin('b.Author a');
		$c1->mergeWith($c2);
		$joins = $c1->getJoins();
		$this->assertEquals(1, count($joins), 'mergeWith() merge joins to an empty join');
		$this->assertEquals('LEFT JOIN author a ON (book.AUTHOR_ID=a.ID)', $joins['a']->toString(), 'mergeWith() merge joins to an empty join');

		$c1 = new ModelCriteria('bookstore', 'Book', 'b');
		$c1->leftJoin('b.Author a');
		$c2 = new ModelCriteria('bookstore', 'Book', 'b');
		$c2->innerJoin('b.Publisher p');
		$c1->mergeWith($c2);
		$joins = $c1->getJoins();
		$this->assertEquals(2, count($joins), 'mergeWith() merge joins to an existing join');
		$this->assertEquals('LEFT JOIN author a ON (book.AUTHOR_ID=a.ID)', $joins['a']->toString(), 'mergeWith() merge joins to an empty join');
		$this->assertEquals('INNER JOIN publisher p ON (book.PUBLISHER_ID=p.ID)', $joins['p']->toString(), 'mergeWith() merge joins to an empty join');
	}

	public function testMergeWithWiths()
	{
		$c1 = new ModelCriteria('bookstore', 'Book', 'b');
		$c1->leftJoinWith('b.Author a');
		$c2 = new ModelCriteria('bookstore', 'Author');
		$c1->mergeWith($c2);
		$with = $c1->getWith();
		$this->assertEquals(1, count($with), 'mergeWith() does not remove an existing join');
		$this->assertEquals('modelName: Author, relationName: Author, relationMethod: setAuthor, leftPhpName: , rightPhpName: a', $with['a']->__toString(), 'mergeWith() does not remove an existing join');

		$c1 = new ModelCriteria('bookstore', 'Book', 'b');
		$c2 = new ModelCriteria('bookstore', 'Book', 'b');
		$c2->leftJoinWith('b.Author a');
		$c1->mergeWith($c2);
		$with = $c1->getWith();
		$this->assertEquals(1, count($with), 'mergeWith() merge joins to an empty join');
		$this->assertEquals('modelName: Author, relationName: Author, relationMethod: setAuthor, leftPhpName: , rightPhpName: a', $with['a']->__toString(), 'mergeWith() merge joins to an empty join');

		$c1 = new ModelCriteria('bookstore', 'Book', 'b');
		$c1->leftJoinWith('b.Author a');
		$c2 = new ModelCriteria('bookstore', 'Book', 'b');
		$c2->innerJoinWith('b.Publisher p');
		$c1->mergeWith($c2);
		$with = $c1->getWith();
		$this->assertEquals(2, count($with), 'mergeWith() merge joins to an existing join');
		$this->assertEquals('modelName: Author, relationName: Author, relationMethod: setAuthor, leftPhpName: , rightPhpName: a', $with['a']->__toString(), 'mergeWith() merge joins to an empty join');
		$this->assertEquals('modelName: Publisher, relationName: Publisher, relationMethod: setPublisher, leftPhpName: , rightPhpName: p', $with['p']->__toString(), 'mergeWith() merge joins to an empty join');

	}

	public function testGetAliasedColName()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$this->assertEquals(BookPeer::TITLE, $c->getAliasedColName(BookPeer::TITLE), 'getAliasedColName() returns the input when the table has no alias');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('foo');
		$this->assertEquals(BookPeer::TITLE, $c->getAliasedColName(BookPeer::TITLE), 'getAliasedColName() returns the input when the table has a query alias');

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setModelAlias('foo', true);
		$this->assertEquals('foo.TITLE', $c->getAliasedColName(BookPeer::TITLE), 'getAliasedColName() returns the column name with table alias when the table has a true alias');
	}

	public function testAddUsingAliasNoAlias()
	{
		$c1 = new ModelCriteria('bookstore', 'Book');
		$c1->addUsingAlias(BookPeer::TITLE, 'foo');
		$c2 = new ModelCriteria('bookstore', 'Book');
		$c2->add(BookPeer::TITLE, 'foo');
		$this->assertEquals($c2, $c1, 'addUsingalias() translates to add() when the table has no alias');
	}

	public function testAddUsingAliasQueryAlias()
	{
		$c1 = new ModelCriteria('bookstore', 'Book', 'b');
		$c1->addUsingAlias(BookPeer::TITLE, 'foo');
		$c2 = new ModelCriteria('bookstore', 'Book', 'b');
		$c2->add(BookPeer::TITLE, 'foo');
		$this->assertEquals($c2, $c1, 'addUsingalias() translates the colname using the table alias before calling add() when the table has a true alias');
	}

	public function testAddUsingAliasTrueAlias()
	{
		$c1 = new ModelCriteria('bookstore', 'Book');
		$c1->setModelAlias('b', true);
		$c1->addUsingAlias(BookPeer::TITLE, 'foo');
		$c2 = new ModelCriteria('bookstore', 'Book');
		$c2->setModelAlias('b', true);
		$c2->add('b.TITLE', 'foo');
		$this->assertEquals($c2, $c1, 'addUsingalias() translates to add() when the table has a true alias');
	}

	public function testAddUsingAliasTwice()
	{
		$c1 = new ModelCriteria('bookstore', 'Book');
		$c1->addUsingAlias(BookPeer::TITLE, 'foo');
		$c1->addUsingAlias(BookPeer::TITLE, 'bar');
		$c2 = new ModelCriteria('bookstore', 'Book');
		$c2->add(BookPeer::TITLE, 'foo');
		$c2->addAnd(BookPeer::TITLE, 'bar');
		$this->assertEquals($c2, $c1, 'addUsingalias() translates to addAnd() when the table already has a condition on the column');
	}

	public function testAddUsingAliasTrueAliasTwice()
	{
		$c1 = new ModelCriteria('bookstore', 'Book');
		$c1->setModelAlias('b', true);
		$c1->addUsingAlias(BookPeer::TITLE, 'foo');
		$c1->addUsingAlias(BookPeer::TITLE, 'bar');
		$c2 = new ModelCriteria('bookstore', 'Book');
		$c2->setModelAlias('b', true);
		$c2->add('b.TITLE', 'foo');
		$c2->addAnd('b.TITLE', 'bar');
		$this->assertEquals($c2, $c1, 'addUsingalias() translates to addAnd() when the table already has a condition on the column');
	}

	public function testCloneCopiesConditions()
	{
		$bookQuery1 = BookQuery::create()
			->filterByPrice(1);
		$bookQuery2 = clone $bookQuery1;
		$bookQuery2
			->filterByPrice(2);
		$params = array();
		$sql = BasePeer::createSelectSql($bookQuery1, $params);
		$this->assertEquals('SELECT  FROM `book` WHERE book.PRICE=:p1', $sql, 'conditions applied on a cloned query don\'t get applied on the original query');
	}

	public function testCloneCopiesFormatter()
	{
		$formatter1 = new PropelArrayFormatter();
		$formatter1->test = false;
		$bookQuery1 = BookQuery::create();
		$bookQuery1->setFormatter($formatter1);
		$bookQuery2 = clone $bookQuery1;
		$formatter2 = $bookQuery2->getFormatter();
		$this->assertFalse($formatter2->test);
		$formatter2->test = true;
		$this->assertFalse($formatter1->test);
	}

	public function testCloneCopiesSelect()
	{
		$bookQuery1 = BookQuery::create();
		$bookQuery1->select(array('Id', 'Title'));
		$bookQuery2 = clone $bookQuery1;
		$bookQuery2->select(array('ISBN', 'Price'));
		$this->assertEquals(array('Id', 'Title'), $bookQuery1->getSelect());
	}

	public function testOrderByWithInsensitiveCase()
	{
		$sql = 'SELECT  FROM  ORDER BY book.TITLE ASC';
		$params = array();

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Book.title');
		$this->assertCriteriaTranslation($c, $sql, $params);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Book.TiTle');
		$this->assertCriteriaTranslation($c, $sql, $params);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Book.Title');
		$this->assertCriteriaTranslation($c, $sql, $params);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Book.TITLE');
		$this->assertCriteriaTranslation($c, $sql, $params);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('title');
		$this->assertCriteriaTranslation($c, $sql, $params);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('Title');
		$this->assertCriteriaTranslation($c, $sql, $params);

		$c = new ModelCriteria('bookstore', 'Book');
		$c->orderBy('TITLE');
		$this->assertCriteriaTranslation($c, $sql, $params);
	}
}

class TestableModelCriteria extends ModelCriteria
{
	public $joins = array();

	public function replaceNames(&$clause)
	{
		return parent::replaceNames($clause);
	}

}

class ModelCriteriaForUseQuery extends ModelCriteria
{
	public function __construct($dbName = 'bookstore', $modelName = 'Author', $modelAlias = null)
	{
		parent::__construct($dbName, $modelName, $modelAlias);
	}

	public function withNoName()
	{
		return $this
			->filterBy('FirstName', null, Criteria::ISNOTNULL)
			->where($this->getModelAliasOrName() . '.LastName IS NOT NULL');
	}
}
