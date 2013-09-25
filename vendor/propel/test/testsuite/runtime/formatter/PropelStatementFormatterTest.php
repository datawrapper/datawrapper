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
 * Test class for PropelStatementFormatter.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.formatter
 */
class PropelStatementFormatterTest extends BookstoreEmptyTestBase
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
        $formatter = new PropelStatementFormatter();
        try {
            $books = $formatter->format($stmt);
            $this->assertTrue(true, 'PropelStatementFormatter::format() does not trow an exception when called with no valid criteria');
        } catch (PropelException $e) {
            $this->fail('PropelStatementFormatter::format() does not trow an exception when called with no valid criteria');
        }
    }

    public function testFormatManyResults()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelStatementFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PDOStatement, 'PropelStatementFormatter::format() returns a PDOStatement');
        $this->assertEquals(4, $books->rowCount(), 'PropelStatementFormatter::format() returns as many rows as the results in the query');
        while ($book = $books->fetch()) {
            $this->assertTrue(is_array($book), 'PropelStatementFormatter::format() returns a statement that can be fetched');
        }
    }

    public function testFormatOneResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "Quicksilver"');
        $formatter = new PropelStatementFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PDOStatement, 'PropelStatementFormatter::format() returns a PDOStatement');
        $this->assertEquals(1, $books->rowCount(), 'PropelStatementFormatter::format() returns as many rows as the results in the query');
        $book = $books->fetch(PDO::FETCH_ASSOC);
        $this->assertEquals('Quicksilver', $book['title'], 'PropelStatementFormatter::format() returns the rows matching the query');
    }

    public function testFormatNoResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "foo"');
        $formatter = new PropelStatementFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PDOStatement, 'PropelStatementFormatter::format() returns a PDOStatement');
        $this->assertEquals(0, $books->rowCount(), 'PropelStatementFormatter::format() returns as many rows as the results in the query');
    }

    public function testFormatoneNoCriteria()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelStatementFormatter();
        try {
            $books = $formatter->formatOne($stmt);
            $this->assertTrue(true, 'PropelStatementFormatter::formatOne() does not trow an exception when called with no valid criteria');
        } catch (PropelException $e) {
            $this->fail('PropelStatementFormatter::formatOne() does not trow an exception when called with no valid criteria');
        }
    }

    public function testFormatOneManyResults()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelStatementFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $book = $formatter->formatOne($stmt);

        $this->assertTrue($book instanceof PDOStatement, 'PropelStatementFormatter::formatOne() returns a PDO Statement');
    }

    public function testFormatOneNoResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "foo"');
        $formatter = new PropelStatementFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $book = $formatter->formatOne($stmt);

        $this->assertNull($book, 'PropelStatementFormatter::formatOne() returns null when no result');
    }

}
