<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreEmptyTestBase.php';

/**
 * Tests the generated Object classes.
 *
 * The database is relaoded before every test and flushed after every test.  This
 * means that you can always rely on the contents of the databases being the same
 * for each test method in this class.  See the BookstoreDataPopulator::populate()
 * method for the exact contents of the database.
 *
 * @see        BookstoreDataPopulator
 * @author     Hans Lellelid <hans@xmpl.org>
 * @package    generator.builder.om
 */
class GeneratedObjectWithFixturesTest extends BookstoreEmptyTestBase
{
    protected function setUp()
    {
        parent::setUp();
        require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/behavior/TestAuthor.php';
    }

    /**
     * Test the reload() method.
     */
    public function testReload()
    {
        BookstoreDataPopulator::populate();
        $a = AuthorPeer::doSelectOne(new Criteria());

        $origName = $a->getFirstName();

        $a->setFirstName(md5(time()));

        $this->assertNotEquals($origName, $a->getFirstName());
        $this->assertTrue($a->isModified());

        $a->reload();

        $this->assertEquals($origName, $a->getFirstName());
        $this->assertFalse($a->isModified());

    }

    /**
     * Test reload(deep=true) method.
     */
    public function testReloadDeep()
    {
        BookstoreDataPopulator::populate();

        // arbitrary book
        $b = BookPeer::doSelectOne(new Criteria());

        // arbitrary, different author
        $c = new Criteria();
        $c->add(AuthorPeer::ID, $b->getAuthorId(), Criteria::NOT_EQUAL);
        $a = AuthorPeer::doSelectOne($c);

        $origAuthor = $b->getAuthor();

        $b->setAuthor($a);

        $this->assertNotEquals($origAuthor, $b->getAuthor(), "Expected just-set object to be different from obj from DB");
        $this->assertTrue($b->isModified());

        $b->reload($deep=true);

        $this->assertEquals($origAuthor, $b->getAuthor(), "Expected object in DB to be restored");
        $this->assertFalse($a->isModified());
    }

    /**
     * Test deleting an object using the delete() method.
     */
    public function testDelete()
    {
        BookstoreDataPopulator::populate();

        // 1) grab an arbitrary object
        $book = BookPeer::doSelectOne(new Criteria());
        $bookId = $book->getId();

        // 2) delete it
        $book->delete();

        // 3) make sure it can't be save()d now that it's deleted
        try {
            $book->setTitle("Will Fail");
            $book->save();
            $this->fail("Expect an exception to be thrown when attempting to save() a deleted object.");
        } catch (PropelException $e) {}

            // 4) make sure that it doesn't exist in db
            $book = BookPeer::retrieveByPK($bookId);
        $this->assertNull($book, "Expect NULL from retrieveByPK on deleted Book.");

    }

    /**
     * Tests new one-to-one functionality.
     */
    public function testOneToOne()
    {
        BookstoreDataPopulator::populate();

        $emp = BookstoreEmployeePeer::doSelectOne(new Criteria());

        $acct = new BookstoreEmployeeAccount();
        $acct->setBookstoreEmployee($emp);
        $acct->setLogin("testuser");
        $acct->setPassword("testpass");

        $this->assertSame($emp->getBookstoreEmployeeAccount(), $acct, "Expected same object instance.");
    }

    /**
     * Test the type sensitivity of the resturning columns.
     *
     */
    public function testTypeSensitive()
    {
        BookstoreDataPopulator::populate();

        $book = BookPeer::doSelectOne(new Criteria());

        $r = new Review();
        $r->setReviewedBy("testTypeSensitive Tester");
        $r->setReviewDate(time());
        $r->setBook($book);
        $r->setRecommended(true);
        $r->save();

        $id = $r->getId();
        unset($r);

        // clear the instance cache to force reload from database.
        ReviewPeer::clearInstancePool();
        BookPeer::clearInstancePool();

        // reload and verify that the types are the same
        $r2 = ReviewPeer::retrieveByPK($id);

        $this->assertInternalType('integer', $r2->getId(), "Expected getId() to return an integer.");
        $this->assertInternalType('string', $r2->getReviewedBy(), "Expected getReviewedBy() to return a string.");
        $this->assertInternalType('boolean', $r2->getRecommended(), "Expected getRecommended() to return a boolean.");
        $this->assertInstanceOf('Book', $r2->getBook(), "Expected getBook() to return a Book.");
        $this->assertInternalType('float', $r2->getBook()->getPrice(), "Expected Book->getPrice() to return a float.");
        $this->assertInstanceOf('DateTime', $r2->getReviewDate(null), "Expected Book->getReviewDate() to return a DateTime.");

    }

    /**
     * This is a test for expected exceptions when saving UNIQUE.
     * See http://propel.phpdb.org/trac/ticket/2
     */
    public function testSaveUnique()
    {
        // The whole test is in a transaction, but this test needs real transactions
        $this->con->commit();

        $emp = new BookstoreEmployee();
        $emp->setName(md5(microtime()));

        $acct = new BookstoreEmployeeAccount();
        $acct->setBookstoreEmployee($emp);
        $acct->setLogin("foo");
        $acct->setPassword("bar");
        $acct->save();

        // now attempt to create a new acct
        $acct2 = $acct->copy();

        try {
            $acct2->save();
            $this->fail("Expected PropelException in first attempt to save object with duplicate value for UNIQUE constraint.");
        } catch (Exception $x) {
            try {
                // attempt to save it again
                $acct3 = $acct->copy();
                $acct3->save();
                $this->fail("Expected PropelException in second attempt to save object with duplicate value for UNIQUE constraint.");
            } catch (Exception $x) {
                // this is expected.
            }
            // now let's double check that it can succeed if we're not violating the constraint.
            $acct3->setLogin("foo2");
            $acct3->save();
        }

        $this->con->beginTransaction();
    }

    /**
     * Test the BaseObject#equals().
     */
    public function testEquals()
    {
        BookstoreDataPopulator::populate();

        $b = BookPeer::doSelectOne(new Criteria());
        $c = new Book();
        $c->setId($b->getId());
        $this->assertTrue($b->equals($c), "Expected Book objects to be equal()");

        $a = new Author();
        $a->setId($b->getId());
        $this->assertFalse($b->equals($a), "Expected Book and Author with same primary key NOT to match.");
    }

    public function testDefaultFkColVal()
    {
        BookstoreDataPopulator::populate();

        $sale = new BookstoreSale();
        $this->assertEquals(1, $sale->getBookstoreId(), "Expected BookstoreSale object to have a default bookstore_id of 1.");

        $bookstore = BookstorePeer::doSelectOne(new Criteria());

        $sale->setBookstore($bookstore);
        $this->assertEquals($bookstore->getId(), $sale->getBookstoreId(), "Expected FK id to have changed when assigned a valid FK.");

        $sale->setBookstore(null);
        $this->assertEquals(1, $sale->getBookstoreId(), "Expected BookstoreSale object to have reset to default ID.");

        $sale->setPublisher(null);
        $this->assertEquals(null, $sale->getPublisherId(), "Expected BookstoreSale object to have reset to NULL publisher ID.");
    }

    /**
     * Test copyInto method.
     */
    public function testCopyInto_Deep()
    {
        BookstoreDataPopulator::populate();

        // Test a "normal" object
        $c = new Criteria();
        $c->add(BookPeer::TITLE, 'Harry%', Criteria::LIKE);

        $book = BookPeer::doSelectOne($c);
        $reviews = $book->getReviews();

        $b2 = $book->copy(true);
        $this->assertInstanceOf('Book', $b2);
        $this->assertNull($b2->getId());

        $r2 = $b2->getReviews();

        $this->assertEquals(count($reviews), count($r2));

        // Test a one-to-one object
        $emp = BookstoreEmployeePeer::doSelectOne(new Criteria());
        $e2 = $emp->copy(true);

        $this->assertInstanceOf('BookstoreEmployee', $e2);
        $this->assertNull($e2->getId());

        $this->assertEquals($emp->getBookstoreEmployeeAccount()->getLogin(), $e2->getBookstoreEmployeeAccount()->getLogin());
    }

    /**
     * Test the toArray() method with new lazyLoad param.
     * @link       http://propel.phpdb.org/trac/ticket/527
     */
    public function testToArrayLazyLoad()
    {
        BookstoreDataPopulator::populate();

        $c = new Criteria();
        $c->add(MediaPeer::COVER_IMAGE, null, Criteria::NOT_EQUAL);
        $c->add(MediaPeer::EXCERPT, null, Criteria::NOT_EQUAL);

        $m = MediaPeer::doSelectOne($c);
        if ($m === null) {
            $this->fail("Test requires at least one media row w/ cover_image and excerpt NOT NULL");
        }

        $arr1 = $m->toArray(BasePeer::TYPE_COLNAME);
        $this->assertNotNull($arr1[MediaPeer::COVER_IMAGE]);
        $this->assertInternalType('resource', $arr1[MediaPeer::COVER_IMAGE]);

        $arr2 = $m->toArray(BasePeer::TYPE_COLNAME, false);
        $this->assertNull($arr2[MediaPeer::COVER_IMAGE]);
        $this->assertNull($arr2[MediaPeer::EXCERPT]);

        $diffKeys = array_keys(array_diff($arr1, $arr2));

        $expectedDiff = array(MediaPeer::COVER_IMAGE, MediaPeer::EXCERPT);

        $this->assertEquals($expectedDiff, $diffKeys);
    }

    public function testToArrayIncludesForeignObjects()
    {
        BookstoreDataPopulator::populate();
        BookPeer::clearInstancePool();
        AuthorPeer::clearInstancePool();
        PublisherPeer::clearInstancePool();

        $c = new Criteria();
        $c->add(BookPeer::TITLE, 'Don Juan');
        $books = BookPeer::doSelectJoinAuthor($c);
        $book = $books[0];

        $arr1 = $book->toArray(BasePeer::TYPE_PHPNAME, null, array(), true);
        $expectedKeys = array(
            'Id',
            'Title',
            'ISBN',
            'Price',
            'PublisherId',
            'AuthorId',
            'Author'
        );
        $this->assertEquals($expectedKeys, array_keys($arr1), 'toArray() can return sub arrays for hydrated related objects');
        $this->assertEquals('George', $arr1['Author']['FirstName'], 'toArray() can return sub arrays for hydrated related objects');

        $c = new Criteria();
        $c->add(BookPeer::TITLE, 'Don Juan');
        $books = BookPeer::doSelectJoinAll($c);
        $book = $books[0];

        $arr2 = $book->toArray(BasePeer::TYPE_PHPNAME, null, array(), true);
        $expectedKeys = array(
            'Id',
            'Title',
            'ISBN',
            'Price',
            'PublisherId',
            'AuthorId',
            'Publisher',
            'Author'
        );
        $this->assertEquals($expectedKeys, array_keys($arr2), 'toArray() can return sub arrays for hydrated related objects');
    }

    public function testToArrayIncludesForeignReferrers()
    {
        $a1 = new Author();
        $a1->setFirstName('Leo');
        $a1->setLastName('Tolstoi');
        $arr = $a1->toArray(BasePeer::TYPE_PHPNAME, null, array(), true);
        $this->assertFalse(array_key_exists('Books', $arr));
        $b1 = new Book();
        $b1->setTitle('War and Peace');
        $b2 = new Book();
        $b2->setTitle('Anna Karenina');
        $a1->addBook($b1);
        $a1->addBook($b2);
        $arr = $a1->toArray(BasePeer::TYPE_PHPNAME, null, array(), true);
        $this->assertTrue(array_key_exists('Books', $arr));
        $this->assertEquals(2, count($arr['Books']));
        $this->assertEquals('War and Peace', $arr['Books']['Book_0']['Title']);
        $this->assertEquals('Anna Karenina', $arr['Books']['Book_1']['Title']);
        $this->assertEquals('*RECURSION*', $arr['Books']['Book_0']['Author']);
    }

}
