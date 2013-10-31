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
 * Test class for PropelObjectFormatter.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.formatter
 */
class PropelObjectFormatterTest extends BookstoreEmptyTestBase
{
    protected function setUp()
    {
        parent::setUp();

        BookstoreDataPopulator::populate(null, true);
    }

    public function testFormatNoCriteria()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelObjectFormatter();
        try {
            $books = $formatter->format($stmt);
            $this->fail('PropelObjectFormatter::format() trows an exception when called with no valid criteria');
        } catch (PropelException $e) {
            $this->assertTrue(true,'PropelObjectFormatter::format() trows an exception when called with no valid criteria');
        }
    }

    public function testFormatValidClass()
    {
        $stmt = $this->con->query('SELECT * FROM book');
        $formatter = new PropelObjectFormatter();
        $formatter->setClass('Book');
        $books = $formatter->format($stmt);
        $this->assertTrue($books instanceof PropelObjectCollection);
        $this->assertEquals(5, $books->count());
    }

    public function testFormatManyResults()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelObjectFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PropelCollection, 'PropelObjectFormatter::format() returns a PropelCollection');
        $this->assertEquals(5, count($books), 'PropelObjectFormatter::format() returns as many rows as the results in the query');
        foreach ($books as $book) {
            $this->assertTrue($book instanceof Book, 'PropelObjectFormatter::format() returns an array of Model objects');
        }
    }

    public function testFormatOneResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "Quicksilver"');
        $formatter = new PropelObjectFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PropelCollection, 'PropelObjectFormatter::format() returns a PropelCollection');
        $this->assertEquals(1, count($books), 'PropelObjectFormatter::format() returns as many rows as the results in the query');
        $book = $books->shift();
        $this->assertTrue($book instanceof Book, 'PropelObjectFormatter::format() returns an array of Model objects');
        $this->assertEquals('Quicksilver', $book->getTitle(), 'PropelObjectFormatter::format() returns the model objects matching the query');
    }

    public function testFormatNoResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "foo"');
        $formatter = new PropelObjectFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PropelCollection, 'PropelObjectFormatter::format() returns a PropelCollection');
        $this->assertEquals(0, count($books), 'PropelObjectFormatter::format() returns as many rows as the results in the query');
    }

    public function testFormatOneNoCriteria()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelObjectFormatter();
        try {
            $book = $formatter->formatOne($stmt);
            $this->fail('PropelObjectFormatter::formatOne() throws an exception when called with no valid criteria');
        } catch (PropelException $e) {
            $this->assertTrue(true,'PropelObjectFormatter::formatOne() throws an exception when called with no valid criteria');
        }
    }

    public function testFormatOneManyResults()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelObjectFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $book = $formatter->formatOne($stmt);

        $this->assertTrue($book instanceof Book, 'PropelObjectFormatter::formatOne() returns a model object');
    }

    public function testFormatOneNoResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "foo"');
        $formatter = new PropelObjectFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $book = $formatter->formatOne($stmt);

        $this->assertNull($book, 'PropelObjectFormatter::formatOne() returns null when no result');
    }

    public function testFormatOneWithRelatedObjects()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        $con->useDebug(false);
        $con->useDebug(true);

        $this->assertEquals(0, $con->getQueryCount());

        $stmt = $con->query('SELECT * FROM author LEFT JOIN book ON (author.id = book.author_id) WHERE author.id = (SELECT author_id FROM book WHERE title = "The Tin Drum 2")');
        $formatter = new PropelObjectFormatter();

        $criteria  = new ModelCriteria('bookstore', 'Author');
        $criteria->joinWith('Book');

        $formatter->init($criteria);
        $author = $formatter->formatOne($stmt);

        $this->assertEquals(1, $con->getQueryCount());
        $this->assertTrue($author instanceof Author, 'PropelObjectFormatter::formatOne() returns a model object');

        $this->assertTrue($author->getBooks() instanceof PropelCollection);
        $this->assertEquals(2, $author->countBooks());

        $this->assertEquals(1, $con->getQueryCount());
    }

    public function testFormaWithRelatedObjects()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        $con->useDebug(false);
        $con->useDebug(true);

        $this->assertEquals(0, $con->getQueryCount());

        $stmt = $con->query('SELECT * FROM author LEFT JOIN book ON (author.id = book.author_id)');
        $formatter = new PropelObjectFormatter();

        $criteria  = new ModelCriteria('bookstore', 'Author');
        $criteria->joinWith('Book');

        $formatter->init($criteria);
        $authors = $formatter->format($stmt);

        $this->assertEquals(1, $con->getQueryCount());
        $this->assertTrue($authors instanceof PropelObjectCollection, 'PropelObjectFormatter::formatOne() returns a model object');

        foreach ($authors as $author) {
            $this->assertTrue($author->getBooks() instanceof PropelCollection);

            if ('Grass' === $author->getLastName()) {
                $this->assertEquals(2, $author->countBooks());
            } else {
                $this->assertEquals(1, $author->countBooks());
            }
        }

        $this->assertEquals(1, $con->getQueryCount());
    }
}
