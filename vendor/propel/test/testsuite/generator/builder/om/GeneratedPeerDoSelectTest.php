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
 * Tests the generated Peer classes.
 *
 * This test uses generated Bookstore classes to test the behavior of various
 * peer operations.
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
class GeneratedPeerDoSelectTest extends BookstoreEmptyTestBase
{
    protected function setUp()
    {
        parent::setUp();
        BookstoreDataPopulator::populate();
    }

    public function testDoSelect()
    {
        $books = BookPeer::doSelect(new Criteria());
        $this->assertEquals(4, count($books), 'doSelect() with an empty Criteria returns all results');
        $book1 = $books[0];

        $c = new Criteria();
        $c->add(BookPeer::ID, $book1->getId());
        $res = BookPeer::doSelect($c);
        $this->assertEquals(array($book1), $res, 'doSelect() accepts a Criteria object with a condition');

        $c = new Criteria();
        $c->add(BookPeer::ID, $book1->getId());
        $c->add(BookPeer::TITLE, $book1->getTitle());
        $res = BookPeer::doSelect($c);
        $this->assertEquals(array($book1), $res, 'doSelect() accepts a Criteria object with several condition');

        $c = new Criteria();
        $c->add(BookPeer::ID, 'foo');
        $res = BookPeer::doSelect($c);
        $this->assertEquals(array(), $res, 'doSelect() accepts an incorrect Criteria');
    }

    /**
     * Tests performing doSelect() and doSelectJoin() using LIMITs.
     */
    public function testDoSelect_Limit()
    {
        // 1) get the total number of items in a particular table
        $count = BookPeer::doCount(new Criteria());

        $this->assertTrue($count > 1, "Need more than 1 record in books table to perform this test.");

        $limitcount = $count - 1;

        $lc = new Criteria();
        $lc->setLimit($limitcount);

        $results = BookPeer::doSelect($lc);

        $this->assertEquals($limitcount, count($results), "Expected $limitcount results from BookPeer::doSelect()");

        // re-create it just to avoid side-effects
        $lc2 = new Criteria();
        $lc2->setLimit($limitcount);
        $results2 = BookPeer::doSelectJoinAuthor($lc2);

        $this->assertEquals($limitcount, count($results2), "Expected $limitcount results from BookPeer::doSelectJoinAuthor()");

    }

    /**
     * Test the basic functionality of the doSelectJoin*() methods.
     */
    public function testDoSelectJoin()
    {

        BookPeer::clearInstancePool();

        $c = new Criteria();

        $books = BookPeer::doSelect($c);
        $obj = $books[0];
        // $size = strlen(serialize($obj));

        BookPeer::clearInstancePool();

        $joinBooks = BookPeer::doSelectJoinAuthor($c);
        $obj2 = $joinBooks[0];
        $obj2Array = $obj2->toArray(BasePeer::TYPE_PHPNAME, true, array(), true);
        // $joinSize = strlen(serialize($obj2));

        $this->assertEquals(count($books), count($joinBooks), "Expected to find same number of rows in doSelectJoin*() call as doSelect() call.");

        // $this->assertTrue($joinSize > $size, "Expected a serialized join object to be larger than a non-join object.");

        $this->assertTrue(array_key_exists('Author', $obj2Array));
    }

    /**
     * Test the doSelectJoin*() methods when the related object is NULL.
     */
    public function testDoSelectJoin_NullFk()
    {
        $b1 = new Book();
        $b1->setTitle("Test NULLFK 1");
        $b1->setISBN("NULLFK-1");
        $b1->save();

        $b2 = new Book();
        $b2->setTitle("Test NULLFK 2");
        $b2->setISBN("NULLFK-2");
        $b2->setAuthor(new Author());
        $b2->getAuthor()->setFirstName("Hans")->setLastName("L");
        $b2->save();

        BookPeer::clearInstancePool();
        AuthorPeer::clearInstancePool();

        $c = new Criteria();
        $c->add(BookPeer::ISBN, 'NULLFK-%', Criteria::LIKE);
        $c->addAscendingOrderByColumn(BookPeer::ISBN);

        $matches = BookPeer::doSelectJoinAuthor($c);
        $this->assertEquals(2, count($matches), "Expected 2 matches back from new books; got back " . count($matches));

        $this->assertNull($matches[0]->getAuthor(), "Expected first book author to be null");
        $this->assertInstanceOf('Author', $matches[1]->getAuthor(), "Expected valid Author object for second book.");
    }

    public function testDoSelectJoinOneToOne()
    {
        $con = Propel::getConnection();
        $count = $con->getQueryCount();
        Propel::disableInstancePooling();
        $c = new Criteria();
        $accs = BookstoreEmployeeAccountPeer::doSelectJoinBookstoreEmployee($c);
        Propel::enableInstancePooling();
        $this->assertEquals(1, $con->getQueryCount() - $count, 'doSelectJoin() makes only one query in a one-to-one relationship');
    }

    public function testDoSelectOne()
    {
        $books = BookPeer::doSelect(new Criteria());
        $book1 = $books[0];

        $c = new Criteria();
        $c->add(BookPeer::ID, $book1->getId());
        $res = BookPeer::doSelectOne($c);
        $this->assertEquals($book1, $res, 'doSelectOne() returns a single object');

        $c = new Criteria();
        $c->add(BookPeer::ID, 'foo');
        $res = BookPeer::doSelectOne($c);
        $this->assertNull($res, 'doSelectOne() returns null if the Criteria matches no record');
    }

    public function testObjectInstances()
    {

        $sample = BookPeer::doSelectOne(new Criteria());
        $samplePk = $sample->getPrimaryKey();

        // 1) make sure consecutive calls to retrieveByPK() return the same object.

        $b1 = BookPeer::retrieveByPK($samplePk);
        $b2 = BookPeer::retrieveByPK($samplePk);

        $sampleval = md5(microtime());

        $this->assertTrue($b1 === $b2, "Expected object instances to match for calls with same retrieveByPK() method signature.");

        // 2) make sure that calls to doSelect also return references to the same objects.
        $allbooks = BookPeer::doSelect(new Criteria());
        foreach ($allbooks as $testb) {
            if ($testb->getPrimaryKey() == $b1->getPrimaryKey()) {
                $this->assertTrue($testb === $b1, "Expected same object instance from doSelect() as from retrieveByPK()");
            }
        }

        // 3) test fetching related objects
        $book = BookPeer::retrieveByPK($samplePk);

        $bookauthor = $book->getAuthor();

        $author = AuthorPeer::retrieveByPK($bookauthor->getId());

        $this->assertTrue($bookauthor === $author, "Expected same object instance when calling fk object accessor as retrieveByPK()");

        // 4) test a doSelectJoin()
        $morebooks = BookPeer::doSelectJoinAuthor(new Criteria());
        for ($i=0,$j=0; $j < count($morebooks); $i++, $j++) {
            $testb1 = $allbooks[$i];
            $testb2 = $allbooks[$j];
            $this->assertTrue($testb1 === $testb2, "Expected the same objects from consecutive doSelect() calls.");
            // we could probably also test this by just verifying that $book & $testb are the same
            if ($testb1->getPrimaryKey() === $book) {
                $this->assertTrue($book->getAuthor() === $testb1->getAuthor(), "Expected same author object in calls to pkey-matching books.");
            }
        }

        // 5) test creating a new object, saving it, and then retrieving that object (should all be same instance)
        $b = new BookstoreEmployee();
        $b->setName("Testing");
        $b->setJobTitle("Testing");
        $b->save();

        $empId = $b->getId();

        $this->assertSame($b, BookstoreEmployeePeer::retrieveByPK($empId), "Expected newly saved object to be same instance as pooled.");

    }

    /**
     * Test inheritance features.
     */
    public function testInheritance()
    {
        $manager = new BookstoreManager();
        $manager->setName("Manager 1");
        $manager->setJobTitle("Warehouse Manager");
        $manager->save();
        $managerId = $manager->getId();

        $employee = new BookstoreEmployee();
        $employee->setName("Employee 1");
        $employee->setJobTitle("Janitor");
        $employee->setSupervisorId($managerId);
        $employee->save();
        $empId = $employee->getId();

        $cashier = new BookstoreCashier();
        $cashier->setName("Cashier 1");
        $cashier->setJobTitle("Cashier");
        $cashier->save();
        $cashierId = $cashier->getId();

        // 1) test the pooled instances'
        $c = new Criteria();
        $c->add(BookstoreEmployeePeer::ID, array($managerId, $empId, $cashierId), Criteria::IN);
        $c->addAscendingOrderByColumn(BookstoreEmployeePeer::ID);

        $objects = BookstoreEmployeePeer::doSelect($c);

        $this->assertEquals(3, count($objects), "Expected 3 objects to be returned.");

        list($o1, $o2, $o3) = $objects;

        $this->assertSame($o1, $manager);
        $this->assertSame($o2, $employee);
        $this->assertSame($o3, $cashier);

        // 2) test a forced reload from database
        BookstoreEmployeePeer::clearInstancePool();

        list($o1,$o2,$o3) = BookstoreEmployeePeer::doSelect($c);

        $this->assertTrue($o1 instanceof BookstoreManager, "Expected BookstoreManager object, got " . get_class($o1));
        $this->assertTrue($o2 instanceof BookstoreEmployee, "Expected BookstoreEmployee object, got " . get_class($o2));
        $this->assertTrue($o3 instanceof BookstoreCashier, "Expected BookstoreCashier object, got " . get_class($o3));

    }

    /**
     * Test hydration of joined rows that contain lazy load columns.
     * @link       http://propel.phpdb.org/trac/ticket/464
     */
    public function testHydrationJoinLazyLoad()
    {
        BookstoreEmployeeAccountPeer::doDeleteAll();
        BookstoreEmployeePeer::doDeleteAll();
        AcctAccessRolePeer::doDeleteAll();

        $bemp2 = new BookstoreEmployee();
        $bemp2->setName("Pieter");
        $bemp2->setJobTitle("Clerk");
        $bemp2->save();

        $role = new AcctAccessRole();
        $role->setName("Admin");

        $bempacct = new BookstoreEmployeeAccount();
        $bempacct->setBookstoreEmployee($bemp2);
        $bempacct->setAcctAccessRole($role);
        $bempacct->setLogin("john");
        $bempacct->setPassword("johnp4ss");
        $bempacct->save();

        $c = new Criteria();
        $results = BookstoreEmployeeAccountPeer::doSelectJoinAll($c);
        $o = $results[0];

        $this->assertEquals('Admin', $o->getAcctAccessRole()->getName());
    }

    /**
     * Testing foreign keys with multiple referrer columns.
     * @link       http://propel.phpdb.org/trac/ticket/606
     */
    public function testMultiColFk()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);

        ReaderFavoritePeer::doDeleteAll();

        $b1 = new Book();
        $b1->setTitle("Book1");
        $b1->setISBN("ISBN-1");
        $b1->save();

        $r1 = new BookReader();
        $r1-> setName("Me");
        $r1->save();

        $bo1 = new BookOpinion();
        $bo1->setBookId($b1->getId());
        $bo1->setReaderId($r1->getId());
        $bo1->setRating(9);
        $bo1->setRecommendToFriend(true);
        $bo1->save();

        $rf1 = new ReaderFavorite();
        $rf1->setReaderId($r1->getId());
        $rf1->setBookId($b1->getId());
        $rf1->save();

        $c = new Criteria(ReaderFavoritePeer::DATABASE_NAME);
        $c->add(ReaderFavoritePeer::BOOK_ID, $b1->getId());
        $c->add(ReaderFavoritePeer::READER_ID, $r1->getId());

        $results = ReaderFavoritePeer::doSelectJoinBookOpinion($c);
        $this->assertEquals(1, count($results), "Expected 1 result");
    }

    /**
     * Testing foreign keys with multiple referrer columns.
     * @link       http://propel.phpdb.org/trac/ticket/606
     */
    public function testMultiColJoin()
    {
        BookstoreContestPeer::doDeleteAll();
        BookstoreContestEntryPeer::doDeleteAll();

        $bs = new Bookstore();
        $bs->setStoreName("Test1");
        $bs->setPopulationServed(5);
        $bs->save();
        $bs1Id = $bs->getId();

        $bs2 = new Bookstore();
        $bs2->setStoreName("Test2");
        $bs2->setPopulationServed(5);
        $bs2->save();
        $bs2Id = $bs2->getId();

        $ct1 = new Contest();
        $ct1->setName("Contest1!");
        $ct1->save();
        $ct1Id = $ct1->getId();

        $ct2 = new Contest();
        $ct2->setName("Contest2!");
        $ct2->save();
        $ct2Id = $ct2->getId();

        $cmr = new Customer();
        $cmr->setName("Customer1");
        $cmr->save();
        $cmr1Id = $cmr->getId();

        $cmr2 = new Customer();
        $cmr2->setName("Customer2");
        $cmr2->save();
        $cmr2Id = $cmr2->getId();

        $contest = new BookstoreContest();
        $contest->setBookstoreId($bs1Id);
        $contest->setContestId($ct1Id);
        $contest->save();

        $contest = new BookstoreContest();
        $contest->setBookstoreId($bs2Id);
        $contest->setContestId($ct1Id);
        $contest->save();

        $entry = new BookstoreContestEntry();
        $entry->setBookstoreId($bs1Id);
        $entry->setContestId($ct1Id);
        $entry->setCustomerId($cmr1Id);
        $entry->save();

        $entry = new BookstoreContestEntry();
        $entry->setBookstoreId($bs1Id);
        $entry->setContestId($ct1Id);
        $entry->setCustomerId($cmr2Id);
        $entry->save();

        // Note: this test isn't really working very well.  We setup fkeys that
        // require that the BookstoreContest rows exist and then try to violate
        // the rules ... :-/  This may work in some lenient databases, but an error
        // is expected here.

        /*
         * Commented out for now ... though without it, this test may not really be testing anything
        $entry = new BookstoreContestEntry();
        $entry->setBookstoreId($bs1Id);
        $entry->setContestId($ct2Id);
        $entry->setCustomerId($cmr2Id);
        $entry->save();
        */

        $c = new Criteria();
        $c->addJoin(array(BookstoreContestEntryPeer::BOOKSTORE_ID, BookstoreContestEntryPeer::CONTEST_ID), array(BookstoreContestPeer::BOOKSTORE_ID, BookstoreContestPeer::CONTEST_ID) );

        $results = BookstoreContestEntryPeer::doSelect($c);
        $this->assertEquals(2, count($results) );
        foreach ($results as $result) {
            $this->assertEquals($bs1Id, $result->getBookstoreId() );
            $this->assertEquals($ct1Id, $result->getContestId() );
        }
    }
}
