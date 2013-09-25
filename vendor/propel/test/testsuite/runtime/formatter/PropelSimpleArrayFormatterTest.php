<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreEmptyTestBase.php';

class PropelSimpleArrayFormatterTest extends BookstoreEmptyTestBase
{
    protected function setUp()
    {
        parent::setUp();
        BookstoreDataPopulator::populate();
    }

    public function testFormatWithOneRowAndValueIsNotZero()
    {
        $con  = Propel::getConnection(BookPeer::DATABASE_NAME);
        $stmt = $con->query('SELECT 1 FROM book');

        $formatter = new PropelSimpleArrayFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));

        $books = $formatter->format($stmt);
        $this->assertInstanceOf('PropelCollection', $books);
        $this->assertCount(4, $books);
        $this->assertSame('1', $books[0]);
    }

    public function testFormatWithOneRowAndValueEqualsZero()
    {
        $con  = Propel::getConnection(BookPeer::DATABASE_NAME);
        $stmt = $con->query('SELECT 0 FROM book');

        $formatter = new PropelSimpleArrayFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));

        $books = $formatter->format($stmt);
        $this->assertInstanceOf('PropelCollection', $books);
        $this->assertCount(4, $books);
        $this->assertSame('0', $books[0]);
    }

    public function testFormatOneWithOneRowAndValueIsNotZero()
    {
        $con  = Propel::getConnection(BookPeer::DATABASE_NAME);
        $stmt = $con->query('SELECT 1 FROM book LIMIT 0, 1');

        $formatter = new PropelSimpleArrayFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));

        $book = $formatter->formatOne($stmt);
        $this->assertSame('1', $book);
    }

    public function testFormatOneWithOneRowAndValueEqualsZero()
    {
        $con  = Propel::getConnection(BookPeer::DATABASE_NAME);
        $stmt = $con->query('SELECT 0 FROM book LIMIT 0, 1');

        $formatter = new PropelSimpleArrayFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'Book'));

        $book = $formatter->formatOne($stmt);
        $this->assertSame('0', $book);
    }
}
