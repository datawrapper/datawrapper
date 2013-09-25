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
 * Test the utility class PropelPager
 *
 * @author		 Francois Zaninotto
 * @version		 $Id: PropelModelPagerTest.php
 * @package		 runtime.util
 */
class PropelModelPagerTest extends BookstoreEmptyTestBase
{
    private $authorId;
    private $books;

    protected function createBooks($nb = 15, $con = null)
    {
        BookQuery::create()->deleteAll($con);
        $books = new PropelObjectCollection();
        $books->setModel('Book');
        for ($i=0; $i < $nb; $i++) {
            $b = new Book();
            $b->setTitle('Book' . $i);
            $b->setIsbn('12345' . $i);

            $books[]= $b;
        }
        $books->save($con);
    }

    protected function getPager($maxPerPage, $page = 1)
    {
        $pager = new PropelModelPager(BookQuery::create(), $maxPerPage);
        $pager->setPage($page);
        $pager->init();

        return $pager;
    }

    public function testHaveToPaginate()
    {
        BookQuery::create()->deleteAll();
        $this->assertEquals(false, $this->getPager(0)->haveToPaginate(), 'haveToPaginate() returns false when there is no result');
        $this->createBooks(5);
        $this->assertEquals(false, $this->getPager(0)->haveToPaginate(), 'haveToPaginate() returns false when the maxPerPage is null');
        $this->assertEquals(true, $this->getPager(2)->haveToPaginate(), 'haveToPaginate() returns true when the maxPerPage is less than the number of results');
        $this->assertEquals(false, $this->getPager(6)->haveToPaginate(), 'haveToPaginate() returns false when the maxPerPage is greater than the number of results');
        $this->assertEquals(false, $this->getPager(5)->haveToPaginate(), 'haveToPaginate() returns false when the maxPerPage is equal to the number of results');
    }

    public function testGetNbResults()
    {
        BookQuery::create()->deleteAll();
        $pager = $this->getPager(4, 1);
        $this->assertEquals(0, $pager->getNbResults(), 'getNbResults() returns 0 when there are no results');
        $this->createBooks(5);
        $pager = $this->getPager(4, 1);
        $this->assertEquals(5, $pager->getNbResults(), 'getNbResults() returns the total number of results');
        $pager = $this->getPager(2, 1);
        $this->assertEquals(5, $pager->getNbResults(), 'getNbResults() returns the total number of results');
        $pager = $this->getPager(2, 2);
        $this->assertEquals(5, $pager->getNbResults(), 'getNbResults() returns the total number of results');
        $pager = $this->getPager(7, 6);
        $this->assertEquals(5, $pager->getNbResults(), 'getNbResults() returns the total number of results');
        $pager = $this->getPager(0, 0);
        $this->assertEquals(5, $pager->getNbResults(), 'getNbResults() returns the total number of results');
    }

    public function testGetResults()
    {
        $this->createBooks(5);
        $pager = $this->getPager(4, 1);
        $this->assertTrue($pager->getResults() instanceof PropelObjectCollection, 'getResults() returns a PropelObjectCollection');
        $this->assertEquals(4, count($pager->getResults()), 'getResults() returns at most $maxPerPage results');
        $pager = $this->getPager(4, 2);
        $this->assertEquals(1, count($pager->getResults()), 'getResults() returns the remaining results when in the last page');
        $pager = $this->getPager(4, 3);
        $this->assertEquals(1, count($pager->getResults()), 'getResults() returns the results of the last page when called on nonexistent pages');
    }

    public function testGetResultsRespectsFormatter()
    {
        $this->createBooks(5);
        $query = BookQuery::create();
        $query->setFormatter(ModelCriteria::FORMAT_ARRAY);
        $pager = new PropelModelPager($query, 4);
        $pager->setPage(1);
        $pager->init();
        $this->assertTrue($pager->getResults() instanceof PropelArrayCollection, 'getResults() returns a PropelArrayCollection if the query uses array hydration');
    }

    public function testGetIterator()
    {
        $this->createBooks(5);

        $pager = $this->getPager(4, 1);
        $i = 0;
        foreach ($pager as $book) {
            $this->assertEquals('Book' . $i, $book->getTitle(), 'getIterator() returns an iterator');
            $i++;
        }
        $this->assertEquals(4, $i, 'getIterator() uses the results collection');
    }

    public function testIterateTwice()
    {
        $this->createBooks(5);
        $pager = $this->getPager(4, 1);

        $i = 0;
        foreach ($pager as $book) {
            $this->assertEquals('Book' . $i, $book->getTitle(), 'getIterator() returns an iterator');
            $i++;
        }
        $this->assertEquals(4, $i, 'getIterator() uses the results collection');

        $i = 0;
        foreach ($pager as $book) {
            $this->assertEquals('Book' . $i, $book->getTitle());
            $i++;
        }
        $this->assertEquals(4, $i, 'getIterator() can be called several times');
    }

    public function testSetPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(2, 2);
        $i = 2;
        foreach ($pager as $book) {
            $this->assertEquals('Book' . $i, $book->getTitle(), 'setPage() sets the list to start on a given page');
            $i++;
        }
        $this->assertEquals(4, $i, 'setPage() doesn\'t change the page count');
    }

    public function testIsFirstPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(4, 1);
        $this->assertTrue($pager->isFirstPage(), 'isFirstPage() returns true on the first page');
        $pager = $this->getPager(4, 2);
        $this->assertFalse($pager->isFirstPage(), 'isFirstPage() returns false when not on the first page');
    }

    public function testIsLastPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(4, 1);
        $this->assertFalse($pager->isLastPage(), 'isLastPage() returns false when not on the last page');
        $pager = $this->getPager(4, 2);
        $this->assertTrue($pager->isLastPage(), 'isLastPage() returns true on the last page');
    }

    public function testGetLastPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(4, 1);
        $this->assertEquals(2, $pager->getLastPage(), 'getLastPage() returns the last page number');
        $this->assertInternalType('integer', $pager->getLastPage(), 'getLastPage() returns an integer');
    }

    public function testIsFirstOnFirstPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(3, 1);
        foreach ($pager as $index => $book) {
            if ($index == 0) {
                $this->assertTrue($pager->isFirst());
            } else {
                $this->assertFalse($pager->isFirst());
            }
        }
    }

    public function testIsFirstOnNonFirstPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(3, 2);
        foreach ($pager as $index => $book) {
            if ($index == 0) {
                $this->assertTrue($pager->isFirst());
            } else {
                $this->assertFalse($pager->isFirst());
            }
        }
    }

    public function testIsLastOnNonLastPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(3, 1);
        foreach ($pager as $index => $book) {
            if ($index == 2) {
                $this->assertTrue($pager->isLast());
            } else {
                $this->assertFalse($pager->isLast());
            }
        }
    }

    public function testIsLastOnLastPage()
    {
        $this->createBooks(5);
        $pager = $this->getPager(3, 2);
        foreach ($pager as $index => $book) {
            if ($index == 1) {
                $this->assertTrue($pager->isLast());
            } else {
                $this->assertFalse($pager->isLast());
            }
        }
    }

    public function testIsEmptyIsTrueOnEmptyPagers()
    {
        $pager = $this->getPager(4, 1);
        $this->assertTrue($pager->isEmpty());
    }

    public function testIsEmptyIsFalseOnNonEmptyPagers()
    {
        $this->createBooks(1);
        $pager = $this->getPager(4, 1);
        $this->assertFalse($pager->isEmpty());
    }

    public function testIsOddAndIsEven()
    {
        $this->createBooks(5);
        $pager = $this->getPager(4, 1);
        foreach ($pager as $index => $book) {
            if ($index % 2) {
                $this->assertTrue($pager->isOdd());
                $this->assertFalse($pager->isEven());
            } else {
                $this->assertFalse($pager->isOdd());
                $this->assertTrue($pager->isEven());
            }
        }
    }

}
