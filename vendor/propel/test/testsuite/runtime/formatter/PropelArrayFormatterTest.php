<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreEmptyTestBase.php';

/**
 * Test class for PropelArrayFormatter.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.formatter
 */
class PropelArrayFormatterTest extends BookstoreEmptyTestBase
{
	protected function setUp()
	{
		parent::setUp();
		BookstoreDataPopulator::populate();
	}

	public function testFormatNoCriteria()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$stmt = $con->query('SELECT * FROM book');
		$formatter = new PropelArrayFormatter();
		try {
			$books = $formatter->format($stmt);
			$this->fail('PropelArrayFormatter::format() throws an exception when called with no valid criteria');
		} catch (PropelException $e) {
			$this->assertTrue(true,'PropelArrayFormatter::format() throws an exception when called with no valid criteria');
		}
	}

	public function testFormatManyResults()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$stmt = $con->query('SELECT * FROM book');
		$formatter = new PropelArrayFormatter();
		$formatter->init(new ModelCriteria('bookstore', 'Book'));
		$books = $formatter->format($stmt);

		$this->assertTrue($books instanceof PropelCollection, 'PropelArrayFormatter::format() returns a PropelCollection');
		$this->assertEquals(4, count($books), 'PropelArrayFormatter::format() returns as many rows as the results in the query');
		foreach ($books as $book) {
			$this->assertTrue(is_array($book), 'PropelArrayFormatter::format() returns an array of arrays');
		}
	}

	public function testFormatOneResult()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "Quicksilver"');
		$formatter = new PropelArrayFormatter();
		$formatter->init(new ModelCriteria('bookstore', 'Book'));
		$books = $formatter->format($stmt);

		$this->assertTrue($books instanceof PropelCollection, 'PropelArrayFormatter::format() returns a PropelCollection');
		$this->assertEquals(1, count($books), 'PropelArrayFormatter::format() returns as many rows as the results in the query');
		$book = $books->shift();
		$this->assertTrue(is_array($book), 'PropelArrayFormatter::format() returns an array of arrays');
		$this->assertEquals('Quicksilver', $book['Title'], 'PropelArrayFormatter::format() returns the arrays matching the query');
		$expected = array('Id', 'Title', 'ISBN', 'Price', 'PublisherId', 'AuthorId');
		$this->assertEquals($expected, array_keys($book), 'PropelArrayFormatter::format() returns an associative array with column phpNames as keys');
	}

	public function testFormatNoResult()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "foo"');
		$formatter = new PropelArrayFormatter();
		$formatter->init(new ModelCriteria('bookstore', 'Book'));
		$books = $formatter->format($stmt);

		$this->assertTrue($books instanceof PropelCollection, 'PropelArrayFormatter::format() returns a PropelCollection');
		$this->assertEquals(0, count($books), 'PropelArrayFormatter::format() returns as many rows as the results in the query');
	}

	public function testFormatOneNoCriteria()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$stmt = $con->query('SELECT * FROM book');
		$formatter = new PropelArrayFormatter();
		try {
			$book = $formatter->formatOne($stmt);
			$this->fail('PropelArrayFormatter::formatOne() throws an exception when called with no valid criteria');
		} catch (PropelException $e) {
			$this->assertTrue(true,'PropelArrayFormatter::formatOne() throws an exception when called with no valid criteria');
		}
	}

	public function testFormatOneManyResults()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$stmt = $con->query('SELECT * FROM book');
		$formatter = new PropelArrayFormatter();
		$formatter->init(new ModelCriteria('bookstore', 'Book'));
		$book = $formatter->formatOne($stmt);

		$this->assertTrue(is_array($book), 'PropelArrayFormatter::formatOne() returns an array');
		$this->assertEquals(array('Id', 'Title', 'ISBN', 'Price', 'PublisherId', 'AuthorId'), array_keys($book), 'PropelArrayFormatter::formatOne() returns a single row even if the query has many results');
	}

	public function testFormatOneNoResult()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);

		$stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "foo"');
		$formatter = new PropelArrayFormatter();
		$formatter->init(new ModelCriteria('bookstore', 'Book'));
		$book = $formatter->formatOne($stmt);

		$this->assertNull($book, 'PropelArrayFormatter::formatOne() returns null when no result');
	}


}
