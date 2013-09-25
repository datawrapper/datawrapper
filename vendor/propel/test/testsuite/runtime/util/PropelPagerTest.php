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
 * @author     Niklas Närhinen <niklas@narhinen.net>
 * @version    $Id: PropelPagerTest.php
 * @package    runtime.util
 */
class PropelPagerTest extends BookstoreEmptyTestBase
{
  private $authorId;
  private $books;

  protected function setUp()
  {
    parent::setUp();
        BookstoreDataPopulator::populate();

    $cr = new Criteria();
    $cr->add(AuthorPeer::LAST_NAME, "Rowling");
    $cr->add(AuthorPeer::FIRST_NAME, "J.K.");
    $rowling = AuthorPeer::doSelectOne($cr);
    $this->authorId = $rowling->getId();

    $book = new Book();
    $book->setTitle("Harry Potter and the Philosopher's Stone");
    $book->setISBN("1234");
    $book->setAuthor($rowling);
    $book->save();
    $this->books[] = $book->getId();

    $book = new Book();
    $book->setTitle("Harry Potter and the Chamber of Secrets");
    $book->setISBN("1234");
    $book->setAuthor($rowling);
    $book->save();
    $this->books[] = $book->getId();

    $book = new Book();
    $book->setTitle("Harry Potter and the Prisoner of Azkaban");
    $book->setISBN("1234");
    $book->setAuthor($rowling);
    $book->save();
    $this->books[] = $book->getId();

    $book = new Book();
    $book->setTitle("Harry Potter and the Goblet of Fire");
    $book->setISBN("1234");
    $book->setAuthor($rowling);
    $book->save();
    $this->books[] = $book->getId();

    $book = new Book();
    $book->setTitle("Harry Potter and the Half-Blood Prince");
    $book->setISBN("1234");
    $book->setAuthor($rowling);
    $book->save();
    $this->books[] = $book->getId();

    $book = new Book();
    $book->setTitle("Harry Potter and the Deathly Hallows");
    $book->setISBN("1234");
    $book->setAuthor($rowling);
    $book->save();
    $this->books[] = $book->getId();
  }

  protected function tearDown()
  {
    parent::tearDown();
    $cr = new Criteria();
    $cr->add(BookPeer::ID, $this->books, Criteria::IN);
    BookPeer::doDelete($cr);
  }

  public function testCountNoPageNoLimit()
  {
    $cr = new Criteria();
    $cr->add(BookPeer::AUTHOR_ID, $this->authorId);
    $pager = new PropelPager($cr, "BookPeer", "doSelect");
    $this->assertEquals(7, count($pager));
  }

  public function testCountFirstPageWithLimits()
  {
    $cr = new Criteria();
    $cr->add(BookPeer::AUTHOR_ID, $this->authorId);
    $pager = new PropelPager($cr, "BookPeer", "doSelect", 1, 5);
    $this->assertEquals(5, count($pager));
  }

  public function testCountLastPageWithLimits()
  {
    $cr = new Criteria();
    $cr->add(BookPeer::AUTHOR_ID, $this->authorId);
    $pager = new PropelPager($cr, "BookPeer", "doSelect", 2, 5);
    $this->assertEquals(2, count($pager));
  }

  public function testIterateAll()
  {
    $cr = new Criteria();
    $cr->add(BookPeer::AUTHOR_ID, $this->authorId);
    $pager = new PropelPager($cr, "BookPeer", "doSelect");
    $i = 0;
    foreach ($pager as $key => $book) {
      $i++;
    }
    $this->assertEquals(7, $i);
  }

  public function testIterateWithLimits()
  {
    $cr = new Criteria();
    $cr->add(BookPeer::AUTHOR_ID, $this->authorId);
    $pager = new PropelPager($cr, "BookPeer", "doSelect", 2, 5);
    $i = 0;
    foreach ($pager as $key => $book) {
      $i++;
    }
    $this->assertEquals(2, $i);
  }

  public function testIterateCheckSecond()
  {
    $cr = new Criteria();
    $cr->add(BookPeer::AUTHOR_ID, $this->authorId);
    $cr->addAscendingOrderByColumn(BookPeer::TITLE);
    $pager = new PropelPager($cr, "BookPeer", "doSelect");
    $books = array();
    foreach ($pager as $book) {
      $books[] = $book;
    }
    $this->assertEquals("Harry Potter and the Goblet of Fire", $books[2]->getTitle());
  }

  public function testIterateTwice()
  {
    $cr = new Criteria();
    $cr->add(BookPeer::AUTHOR_ID, $this->authorId);
    $cr->addAscendingOrderByColumn(BookPeer::TITLE);
    $pager = new PropelPager($cr, "BookPeer", "doSelect");
    $i = 0;
    foreach ($pager as $book) {
      $i++;
    }
    foreach ($pager as $book) {
      $i++;
    }
    $this->assertEquals(14, $i);
  }
}
