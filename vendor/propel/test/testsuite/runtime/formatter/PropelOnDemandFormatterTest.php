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
 * Test class for PropelOnDemandFormatter.
 *
 * @author     Francois Zaninotto
 * @version    $Id: PropelOnDemandFormatterTest.php 1374 2009-12-26 23:21:37Z francois $
 * @package    runtime.formatter
 */
class PropelOnDemandFormatterTest extends BookstoreEmptyTestBase
{

    public function testFormatNoCriteria()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelOnDemandFormatter();
        try {
            $books = $formatter->format($stmt);
            $this->fail('PropelOnDemandFormatter::format() trows an exception when called with no valid criteria');
        } catch (PropelException $e) {
            $this->assertTrue(true,'PropelOnDemandFormatter::format() trows an exception when called with no valid criteria');
        }
    }

    public function testFormatManyResults()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        BookstoreDataPopulator::populate($con);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelOnDemandFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PropelOnDemandCollection, 'PropelOnDemandFormatter::format() returns a PropelOnDemandCollection');
        $this->assertEquals(4, count($books), 'PropelOnDemandFormatter::format() returns a collection that counts as many rows as the results in the query');
        foreach ($books as $book) {
            $this->assertTrue($book instanceof Book, 'PropelOnDemandFormatter::format() returns an traversable collection of Model objects');
        }
    }

    /**
     * @expectedException PropelException
     */
    public function testFormatManyResultsIteratedTwice()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        BookstoreDataPopulator::populate($con);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelOnDemandFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        foreach ($books as $book) {
            // do nothing
        }
        foreach ($books as $book) {
            // this should throw a PropelException since we're iterating a second time over a stream
        }
    }

    public function testFormatALotOfResults()
    {
        $nbBooks = 50;
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        Propel::disableInstancePooling();
        $book = new Book();
        for ($i=0; $i < $nbBooks; $i++) {
            $book->clear();
            $book->setTitle('BookTest' . $i);
            $book->setIsbn('124' . $i);

            $book->save($con);
        }

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelOnDemandFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PropelOnDemandCollection, 'PropelOnDemandFormatter::format() returns a PropelOnDemandCollection');
        $this->assertEquals($nbBooks, count($books), 'PropelOnDemandFormatter::format() returns a collection that counts as many rows as the results in the query');
        $i = 0;
        foreach ($books as $book) {
            $this->assertTrue($book instanceof Book, 'PropelOnDemandFormatter::format() returns a collection of Model objects');
            $this->assertEquals('BookTest' . $i, $book->getTitle(), 'PropelOnDemandFormatter::format() returns the model objects matching the query');
            $i++;
        }
        Propel::enableInstancePooling();
    }


    public function testFormatOneResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        BookstoreDataPopulator::populate($con);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "Quicksilver"');
        $formatter = new PropelOnDemandFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PropelOnDemandCollection, 'PropelOnDemandFormatter::format() returns a PropelOnDemandCollection');
        $this->assertEquals(1, count($books), 'PropelOnDemandFormatter::format() returns a collection that counts as many rows as the results in the query');
        foreach ($books as $book) {
            $this->assertTrue($book instanceof Book, 'PropelOnDemandFormatter::format() returns a collection of Model objects');
            $this->assertEquals('Quicksilver', $book->getTitle(), 'PropelOnDemandFormatter::format() returns the model objects matching the query');
        }
    }

    public function testFormatNoResult()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        $stmt = $con->query('SELECT * FROM book WHERE book.TITLE = "foo"');
        $formatter = new PropelOnDemandFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $books = $formatter->format($stmt);

        $this->assertTrue($books instanceof PropelOnDemandCollection, 'PropelOnDemandFormatter::format() returns a PropelCollection');
        $this->assertEquals(0, count($books), 'PropelOnDemandFormatter::format() returns an empty collection when no record match the query');
        foreach ($books as $book) {
            $this->fail('PropelOnDemandFormatter returns an empty iterator when no record match the query');
        }
    }

    public function testFormatOneManyResults()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        BookstoreDataPopulator::populate($con);

        $stmt = $con->query('SELECT * FROM book');
        $formatter = new PropelOnDemandFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));
        $book = $formatter->formatOne($stmt);

        $this->assertTrue($book instanceof Book, 'PropelOnDemandFormatter::formatOne() returns a model object');
    }

    public function testFormatSingleTableInheritanceManyResults()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        BookstoreDataPopulator::populate($con);

        $stmt = $con->query('SELECT * FROM bookstore_employee');
        $formatter = new PropelOnDemandFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'BookstoreEmployee'));

        $employees = $formatter->format($stmt);

        foreach ($employees as $employee) {
            $row = array();
            $row[1] = $employee->getClassKey();

            $omClass = BookstoreEmployeePeer::getOMClass($row, 0, false);
            $actualClass = get_class($employee);

            $this->assertEquals($omClass, $actualClass, 'PropelOnDemandFormatter::format() should handle single table inheritance');
        }
    }
}
