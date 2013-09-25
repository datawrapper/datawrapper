<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';

/**
 * Tests the generated Object classes.
 *
 * This test uses generated Bookstore classes to test the behavior of various
 * object operations.  The _idea_ here is to test every possible generated method
 * from Object.tpl; if necessary, bookstore will be expanded to accommodate this.
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
class GeneratedObjectTest extends BookstoreTestBase
{
    protected function setUp()
    {
        parent::setUp();
        require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/behavior/TestAuthor.php';
    }

    /**
     * Test saving an object after setting default values for it.
     */
    public function testSaveWithDefaultValues()
    {
        // From the schema.xml, I am relying on the following:
        //  - that 'Penguin' is the default Name for a Publisher
        //  - that 2001-01-01 is the default ReviewDate for a Review

        // 1) check regular values (VARCHAR)
        $pub = new Publisher();
        $pub->setName('Penguin');
        $pub->save();
        $this->assertTrue($pub->getId() !== null, "Expect Publisher to have been saved when default value set.");

        // 2) check date/time values
        $review = new Review();
        // note that this is different from how it's represented in schema, but should resolve to same unix timestamp
        $review->setReviewDate('2001-01-01');
        $this->assertTrue($review->isModified(), "Expect Review to have been marked 'modified' after default date/time value set.");

    }

    /**
     * Test isModified() to be false after setting default value second time
     */
    public function testDefaultValueSetTwice()
    {
        $pub = new Publisher();
        $pub->setName('Penguin');
        $pub->save();

        $pubId = $pub->getId();

        PublisherPeer::clearInstancePool();

        $pub2 = PublisherPeer::retrieveByPK($pubId);
        $pub2->setName('Penguin');
        $this->assertFalse($pub2->isModified(), "Expect Publisher to be not modified after setting default value second time.");
    }

    public function testHasApplyDefaultValues()
    {
        $this->assertTrue(method_exists('Publisher', 'applyDefaultValues'), 'Tables with default values should have an applyDefaultValues() method');
        $this->assertFalse(method_exists('Book', 'applyDefaultValues'), 'Tables with no default values should not have an applyDefaultValues() method');
    }

    /**
     * Test default return values.
     */
    public function testDefaultValues()
    {
        $r = new Review();
        $this->assertEquals('2001-01-01', $r->getReviewDate('Y-m-d'));

        $this->assertFalse($r->isModified(), "expected isModified() to be false");

        $acct = new BookstoreEmployeeAccount();
        $this->assertEquals(true, $acct->getEnabled());
        $this->assertFalse($acct->isModified());

        $acct->setLogin("testuser");
        $acct->setPassword("testpass");
        $this->assertTrue($acct->isModified());
    }

    /**
     * Tests the use of default expressions and the reloadOnInsert and reloadOnUpdate attributes.
     *
     * @link       http://propel.phpdb.org/trac/ticket/378
     * @link       http://propel.phpdb.org/trac/ticket/555
     */
    public function testDefaultExpresions()
    {
        if (Propel::getDb(BookstoreEmployeePeer::DATABASE_NAME) instanceof DBSqlite) {
            $this->markTestSkipped("Cannot test default expressions with SQLite");
        }
        BookstoreEmployeeAccountPeer::doDeleteAll();

        $b = new Bookstore();
        $b->setStoreName("Foo!");
        $b->save();

        $employee = new BookstoreEmployee();
        $employee->setName("Johnny Walker");

        $acct = new BookstoreEmployeeAccount();
        $acct->setBookstoreEmployee($employee);
        $acct->setLogin("test-login");

        $this->assertNull($acct->getCreated(), "Expected created column to be NULL.");
        $this->assertNull($acct->getAuthenticator(), "Expected authenticator column to be NULL.");

        $acct->save();

        $acct = BookstoreEmployeeAccountPeer::retrieveByPK($acct->getEmployeeId());

        $this->assertNotNull($acct->getAuthenticator(), "Expected a valid (non-NULL) authenticator column after save.");
        $this->assertEquals('Password', $acct->getAuthenticator(), "Expected authenticator='Password' after save.");
        $this->assertNotNull($acct->getCreated(), "Expected a valid date after retrieving saved object.");

        $now = new DateTime("now");
        $this->assertEquals($now->format("Y-m-d"), $acct->getCreated("Y-m-d"));

        $acct->setCreated($now);
        $this->assertEquals($now->format("Y-m-d"), $acct->getCreated("Y-m-d"));

        // Unfortunately we can't really test the conjunction of reloadOnInsert and reloadOnUpdate when using just
        // default values. (At least not in a cross-db way.)
    }

    /**
     * Tests the use of default expressions and the reloadOnInsert attribute.
     *
     * @link       http://propel.phpdb.org/trac/ticket/378
     * @link       http://propel.phpdb.org/trac/ticket/555
     */
    public function testDefaultExpresions_ReloadOnInsert()
    {
        if (Propel::getDb(BookstoreEmployeePeer::DATABASE_NAME) instanceof DBSqlite) {
            $this->markTestSkipped("Cannot test default date expressions with SQLite");
        }

        // Create a new bookstore, contest, bookstore_contest, and bookstore_contest_entry

        $b = new Bookstore();
        $b->setStoreName("Barnes & Noble");
        $b->save();

        $c = new Contest();
        $c->setName("Bookathon Contest");
        $c->save();

        $bc = new BookstoreContest();
        $bc->setBookstore($b);
        $bc->setContest($c);
        $bc->save();

        $c = new Customer();
        $c->setName("Happy Customer");
        $c->save();

        $bce = new BookstoreContestEntry();
        $bce->setBookstore($b);
        $bce->setBookstoreContest($bc);
        $bce->setCustomer($c);
        $bce->save();

        $this->assertNotNull($bce->getEntryDate(), "Expected a non-null entry_date after save.");
    }

    /**
     * Tests the overriding reloadOnInsert at runtime.
     *
     * @link       http://propel.phpdb.org/trac/ticket/378
     * @link       http://propel.phpdb.org/trac/ticket/555
     */
    public function testDefaultExpresions_ReloadOnInsert_Override()
    {
        if (Propel::getDb(BookstoreEmployeePeer::DATABASE_NAME) instanceof DBSqlite) {
            $this->markTestSkipped("Cannot test default date expressions with SQLite");
        }

        // Create a new bookstore, contest, bookstore_contest, and bookstore_contest_entry
        $b = new Bookstore();
        $b->setStoreName("Barnes & Noble");
        $b->save();

        $c = new Contest();
        $c->setName("Bookathon Contest");
        $c->save();

        $bc = new BookstoreContest();
        $bc->setBookstore($b);
        $bc->setContest($c);
        $bc->save();

        $c = new Customer();
        $c->setName("Happy Customer");
        $c->save();

        $bce = new BookstoreContestEntry();
        $bce->setBookstore($b);
        $bce->setBookstoreContest($bc);
        $bce->setCustomer($c);
        $bce->save(null, $skipReload=true);

        $this->assertNull($bce->getEntryDate(), "Expected a NULL entry_date after save.");
    }

    /**
     * Tests the use of default expressions and the reloadOnUpdate attribute.
     *
     * @link       http://propel.phpdb.org/trac/ticket/555
     */
    public function testDefaultExpresions_ReloadOnUpdate()
    {
        $b = new Bookstore();
        $b->setStoreName("Foo!");
        $b->save();

        $sale = new BookstoreSale();
        $sale->setBookstore(BookstorePeer::doSelectOne(new Criteria()));
        $sale->setSaleName("Spring Sale");
        $sale->save();

        // Expect that default values are set, but not default expressions
        $this->assertNull($sale->getDiscount(), "Expected discount to be NULL.");

        $sale->setSaleName("Winter Clearance");
        $sale->save();
        // Since reloadOnUpdate = true, we expect the discount to be set now.

        $this->assertNotNull($sale->getDiscount(), "Expected discount to be non-NULL after save.");
    }

    /**
     * Tests the overriding reloadOnUpdate at runtime.
     *
     * @link       http://propel.phpdb.org/trac/ticket/378
     * @link       http://propel.phpdb.org/trac/ticket/555
     */
    public function testDefaultExpresions_ReloadOnUpdate_Override()
    {
        $b = new Bookstore();
        $b->setStoreName("Foo!");
        $b->save();

        $sale = new BookstoreSale();
        $sale->setBookstore(BookstorePeer::doSelectOne(new Criteria()));
        $sale->setSaleName("Spring Sale");
        $sale->save();

        // Expect that default values are set, but not default expressions
        $this->assertNull($sale->getDiscount(), "Expected discount to be NULL.");

        $sale->setSaleName("Winter Clearance");
        $sale->save(null, $skipReload=true);

        // Since reloadOnUpdate = true, we expect the discount to be set now.

        $this->assertNull($sale->getDiscount(), "Expected NULL value for discount after save.");
    }

    /**
     * Testing creating & saving new object & instance pool.
     */
    public function testObjectInstances_New()
    {
        $emp = new BookstoreEmployee();
        $emp->setName(md5(microtime()));
        $emp->save();
        $id = $emp->getId();

        $retrieved = BookstoreEmployeePeer::retrieveByPK($id);
        $this->assertSame($emp, $retrieved, "Expected same object (from instance pool)");
    }

    /**
     *
     */
    public function testObjectInstances_Fkeys()
    {
        // Establish a relationship between one employee and account
        // and then change the employee_id and ensure that the account
        // is not pulling the old employee.

        $pub1 = new Publisher();
        $pub1->setName('Publisher 1');
        $pub1->save();

        $pub2 = new Publisher();
        $pub2->setName('Publisher 2');
        $pub2->save();

        $book = new Book();
        $book->setTitle("Book Title");
        $book->setISBN("1234");
        $book->setPublisher($pub1);
        $book->save();

        $this->assertSame($pub1, $book->getPublisher());

        // now change values behind the scenes
        $con = Propel::getConnection(BookstoreEmployeeAccountPeer::DATABASE_NAME);
        $con->exec("UPDATE " . BookPeer::TABLE_NAME . " SET "
            . " publisher_id = " . $pub2->getId()
            . " WHERE id = " . $book->getId());

        $book2 = BookPeer::retrieveByPK($book->getId());
        $this->assertSame($book, $book2, "Expected same book object instance");

        $this->assertEquals($pub1->getId(), $book->getPublisherId(), "Expected book to have OLD publisher id before reload()");

        $book->reload();

        $this->assertEquals($pub2->getId(), $book->getPublisherId(), "Expected book to have new publisher id");
        $this->assertSame($pub2, $book->getPublisher(), "Expected book to have new publisher object associated.");

        // Now let's set it back, just to be double sure ...

        $con->exec("UPDATE " . BookPeer::TABLE_NAME . " SET "
            . " publisher_id = " . $pub1->getId()
            . " WHERE id = " . $book->getId());

        $book->reload();

        $this->assertEquals($pub1->getId(), $book->getPublisherId(), "Expected book to have old publisher id (again).");
        $this->assertSame($pub1, $book->getPublisher(), "Expected book to have old publisher object associated (again).");

    }

    /**
     * Test the effect of typecast on primary key values and instance pool retrieval.
     */
    public function testObjectInstancePoolTypecasting()
    {
        $reader = new BookReader();
        $reader->setName("Tester");
        $reader->save();
        $readerId = $reader->getId();

        $book = new Book();
        $book->setTitle("BookTest");
        $book->setISBN("TEST");
        $book->save();
        $bookId = $book->getId();

        $opinion = new BookOpinion();
        $opinion->setBookId((string) $bookId);
        $opinion->setReaderId((string) $readerId);
        $opinion->setRating(5);
        $opinion->setRecommendToFriend(false);
        $opinion->save();


        $opinion2 = BookOpinionPeer::retrieveByPK($bookId, $readerId);

        $this->assertSame($opinion, $opinion2, "Expected same object to be retrieved from differently type-casted primary key values.");

    }

    /**
     * Test saving an object and getting correct number of affected rows from save().
     * This includes tests of cascading saves to fk-related objects.
     */
    public function testSaveReturnValues()
    {

        $author = new Author();
        $author->setFirstName("Mark");
        $author->setLastName("Kurlansky");
        // do not save

        $pub = new Publisher();
        $pub->setName("Penguin Books");
        // do not save

        $book = new Book();
        $book->setTitle("Salt: A World History");
        $book->setISBN("0142001619");
        $book->setAuthor($author);
        $book->setPublisher($pub);

        $affected = $book->save();
        $this->assertEquals(3, $affected, "Expected 3 affected rows when saving book + publisher + author.");

        // change nothing ...
        $affected = $book->save();
        $this->assertEquals(0, $affected, "Expected 0 affected rows when saving already-saved book.");

        // modify the book (UPDATE)
        $book->setTitle("Salt A World History");
        $affected = $book->save();
        $this->assertEquals(1, $affected, "Expected 1 affected row when saving modified book.");

        // modify the related author
        $author->setLastName("Kurlanski");
        $affected = $book->save();
        $this->assertEquals(1, $affected, "Expected 1 affected row when saving book with updated author.");

        // modify both the related author and the book
        $author->setLastName("Kurlansky");
        $book->setTitle("Salt: A World History");
        $affected = $book->save();
        $this->assertEquals(2, $affected, "Expected 2 affected rows when saving updated book with updated author.");

    }

    /*
    WTF!!!!!!
    public function testSaveCanInsertEmptyObjects()
    {
        $b = new Book();
        $b->save();
        $this->assertFalse($b->isNew());
        $this->assertNotNull($b->getId());
    }
    */

    public function testSaveCanInsertNonEmptyObjects()
    {
        $b = new Book();
        $b->setTitle('foo');
        $b->setIsbn('124');
        $b->save();
        $this->assertFalse($b->isNew());
        $this->assertNotNull($b->getId());
    }

    /**
     *
     */
    public function testNoColsModified()
    {
        $e1 = new BookstoreEmployee();
        $e1->setName('Employee 1');

        $e2 = new BookstoreEmployee();
        $e2->setName('Employee 2');

        $super = new BookstoreEmployee();
        // we don't know who the supervisor is yet
        $super->addSubordinate($e1);
        $super->addSubordinate($e2);

        $affected = $super->save();

    }

    public function testIsModifiedIsFalseForNewObjects()
    {
        $a = new Author();
        $this->assertFalse($a->isModified());
    }

    public function testIsModifiedIsTrueForNewObjectsWithModifications()
    {
        $a = new Author();
        $a->setFirstName('Foo');
        $this->assertTrue($a->isModified());
    }

    public function testIsModifiedIsFalseForNewObjectsWithNullModifications()
    {
        $a = new Author();
        $a->setFirstName(null);
        $this->assertFalse($a->isModified());
    }

    public function testIsModifiedIsFalseForObjectsAfterResetModified()
    {
        $a = new Author();
        $a->setFirstName('Foo');
        $a->resetModified();
        $this->assertFalse($a->isModified());
    }

    public function testIsModifiedIsFalseForSavedObjects()
    {
        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->save();
        $this->assertFalse($a->isModified());
    }

    public function testIsModifiedIsTrueForSavedObjectsWithModifications()
    {
        $a = new Author();
        $a->setFirstName('Foo');
        $this->assertTrue($a->isModified());
    }

    public function testIsModifiedIsFalseAfterSetToDefaultValueOnNewObject()
    {
        $p = new Publisher();
        $p->setName('Penguin'); // default column value
        $this->assertFalse($p->isModified());
    }

    public function testIsModifiedIsTrueAfterModifyingOnNonDefaultValueOnNewObject()
    {
        $p = new Publisher();
        $p->setName('Puffin Books');
        $this->assertTrue($p->isModified());
    }

    public function testIsModifiedIsTrueAfterSetToDefaultValueOnModifiedObject()
    {
        $p = new Publisher();
        $p->setName('Puffin Books');
        $p->resetModified();
        $p->setName('Penguin'); // default column value
        $this->assertTrue($p->isModified());
    }

    public function testIsModifiedIsFalseAfterChangingColumnTypeButNotValue()
    {
        $a = new Author();
        $a->setFirstName('1');
        $a->setAge(25);
        $a->resetModified();

        $a->setAge('25');
        $this->assertFalse($a->isModified());

        $a->setFirstName(1);
        $this->assertFalse($a->isModified());
    }

    public function testIsModifiedAndNullValues()
    {
        $a = new Author();
        $a->setFirstName('');
        $a->setLastName('Bar');
        $a->setAge(0);
        $a->save();

        $a->setFirstName(null);
        $this->assertTrue($a->isModified(), "Expected Author to be modified after changing empty string column value to NULL.");

        $a->setAge(null);
        $this->assertTrue($a->isModified(), "Expected Author to be modified after changing 0-value int column to NULL.");

        $a->setFirstName('');
        $this->assertTrue($a->isModified(), "Expected Author to be modified after changing NULL column value to empty string.");

        $a->setAge(0);
        $this->assertTrue($a->isModified(), "Expected Author to be modified after changing NULL column to 0-value int.");
    }

    /**
     * Test checking for non-default values.
     * @see        http://propel.phpdb.org/trac/ticket/331
     */
    public function testHasOnlyDefaultValues()
    {
        $emp = new BookstoreEmployee();
        $emp->setName(md5(microtime()));

        $acct2 = new BookstoreEmployeeAccount();

        $acct = new BookstoreEmployeeAccount();
        $acct->setBookstoreEmployee($emp);
        $acct->setLogin("foo");
        $acct->setPassword("bar");
        $acct->save();

        $this->assertFalse($acct->isModified(), "Expected BookstoreEmployeeAccount NOT to be modified after save().");

        $acct->setEnabled(true);
        $acct->setPassword($acct2->getPassword());

        $this->assertTrue($acct->isModified(), "Expected BookstoreEmployeeAccount to be modified after setting default values.");

        $this->assertTrue($acct->hasOnlyDefaultValues(), "Expected BookstoreEmployeeAccount to not have only default values.");

        $acct->setPassword("bar");
        $this->assertFalse($acct->hasOnlyDefaultValues(), "Expected BookstoreEmployeeAccount to have at one non-default value after setting one value to non-default.");

        // Test a default date/time value
        $r = new Review();
        $r->setReviewDate(new DateTime("now"));
        $this->assertFalse($r->hasOnlyDefaultValues());
    }

    public function testCountRefFk()
    {
        $book = new Book();
        $book->setTitle("Test Book");
        $book->setISBN("TT-EE-SS-TT");

        $num = 5;

        for ($i=2; $i < $num + 2; $i++) {
            $r = new Review();
            $r->setReviewedBy('Hans ' . $num);
            $dt = new DateTime("now");
            $dt->modify("-".$i." weeks");
            $r->setReviewDate($dt);
            $r->setRecommended(($i % 2) == 0);
            $book->addReview($r);
        }

        $this->assertEquals($num, $book->countReviews(), "Expected countReviews to return $num");
        $this->assertEquals($num, count($book->getReviews()), "Expected getReviews to return $num reviews");

        $book->save();

        BookPeer::clearInstancePool();
        ReviewPeer::clearInstancePool();

        $book = BookPeer::retrieveByPK($book->getId());
        $this->assertEquals($num, $book->countReviews(), "Expected countReviews() to return $num (after save)");
        $this->assertEquals($num, count($book->getReviews()), "Expected getReviews() to return $num (after save)");

        // Now set different criteria and expect different results
        $c = new Criteria();
        $c->add(ReviewPeer::RECOMMENDED, false);
        $this->assertEquals(floor($num/2), $book->countReviews($c), "Expected " . floor($num/2) . " results from countReviews(recomm=false)");

        // Change Criteria, run again -- expect different.
        $c = new Criteria();
        $c->add(ReviewPeer::RECOMMENDED, true);
        $this->assertEquals(ceil($num/2), count($book->getReviews($c)), "Expected " . ceil($num/2) . " results from getReviews(recomm=true)");

        $this->assertEquals($num, $book->countReviews(), "Expected countReviews to return $num with new empty Criteria");
    }

    /**
     * Test copying when an object has composite primary key.
     * @link http://propel.phpdb.org/trac/ticket/618
     */
    public function testCopy_CompositePK()
    {
        $br = new BookReader();
        $br->setName("TestReader");
        $br->save();
        $br->copy();

        $b = new Book();
        $b->setTitle("TestBook");
        $b->setISBN("XX-XX-XX-XX");
        $b->save();

        $op = new BookOpinion();
        $op->setBookReader($br);
        $op->setBook($b);
        $op->setRating(10);
        $op->setRecommendToFriend(true);
        $op->save();

        $br2 = $br->copy(true);

        $this->assertNull($br2->getId());

        $opinions = $br2->getBookOpinions();
        $this->assertEquals(1, count($opinions), "Expected to have a related BookOpinion after copy()");

        // We DO expect the reader_id to be null
        $this->assertNull($opinions[0]->getReaderId());
        // but we DO NOT expect the book_id to be null
        $this->assertEquals($op->getBookId(), $opinions[0]->getBookId());
    }

    /**
     * When a relation PK is a composite, replacing the list of relations will flag some of them to be deleted.
     * We primary keys on the "To be deleted" opinions must not be blanked (null) because we need to values to be able to delete the entry.
     */
    public function testReplace_RelationWithCompositePK()
    {
        BookReaderQuery::create()->deleteAll();
        BookQuery::create()->deleteAll();
        BookOpinionQuery::create()->deleteAll();

        $br1 = new BookReader();
        $br1->setName("TestReader");
        $br1->save();

        $br2 = new BookReader();
        $br2->setName("TestReader2");
        $br2->save();

        $b = new Book();
        $b->setTitle("TestBook");
        $b->setISBN("XX-XX-XX-XX");
        $b->save();

        $op1 = new BookOpinion();
        $op1->setBookReader($br1);
        $op1->setBook($b);
        $op1->setRating(10);
        $op1->setRecommendToFriend(true);
        $op1->save();

        // make sure everything is loaded correctly (and their relation too)
        $br1->reload(true);
        $b->reload(true);
        $op1->reload(true);
        $br2->reload(true);

        $op2 = new BookOpinion();
        $op2->setBookReader($br2);
        $op2->setRating(8);
        $op2->setRecommendToFriend(false);

        // the setBookOpinions function expect a PropelCollection
        $pc = new PropelObjectCollection();
        $pc->setModel('BookOpinion');
        $pc->append($op2);

        $br1->getBookOpinions(); // load the relation

        $b->setBookOpinions($pc); // this will flag to be deleted the currently assigned opinion and will add the new opinion so it will can be saved
        $b->save(); // this will delete $op1 and insert $op2

        $this->assertEquals(2, BookReaderQuery::create()->count(), '2 BookReader');
        $this->assertEquals(1, BookQuery::create()->count(), '1 Book');
        $this->assertEquals(1, BookOpinionQuery::create()->count(), 'Only 1 BookOpinion; the new one got inserted and the previously associated one got deleted');

        $this->assertEquals(1, count($b->getBookOpinions()), 'Book has 1 BookOpinion');
        $this->assertEquals(1, count($op2->getBook()), 'BookOpinion2 has a relation to the Book');
        $this->assertEquals(1, count($br1->getBookOpinions()), 'BookReader1 has 1 BookOpinion (BookOpinion1)');
        $this->assertEquals(1, count($br2->getBookOpinions()), 'BookReader2 has 1 BookOpinion (BookOpinion2)');
        
        $this->assertFalse($op1->isDeleted(), 'BookOpinion1 think it has not been deleted');

        $caughtException = false;
        try
        {
          $op1->reload(false);  // will fail because won't find the entry in the db
        } catch (PropelException $pe)
        {
          $caughtException = true;
        }

        $this->assertTrue($caughtException, 'Could not reload BookOpinion1 because it has been deleted from the db');

        $this->assertFalse($op2->isDeleted(), 'BookOpinion2 is not deleted');

        $this->assertEquals(1, count($br1->getBookOpinions()), 'BookReader1 thinks it is assigned to 1 BookOpinion (BookOpinion1)');
        $temp_op = $br1->getBookOpinions();
        $this->assertEquals(spl_object_hash($op1), spl_object_hash($temp_op[0]), 'BookReader1 assigned BookOpinion is still BookOpinion1');
        $this->assertFalse($temp_op[0]->isDeleted(), 'BookReader1 assigned BookOpinion still thinks it has not been deleted');

        $br1->reload(true);  // and reset the relations

        $this->assertEquals(0, count($br1->getBookOpinions()), 'BookReader1 no longer has any BookOpinion');
    }

    /**
     * Test removing object when FK is part of the composite PK
     */
    public function testRemove_CompositePK()
    {
        BookReaderQuery::create()->deleteAll();
        BookQuery::create()->deleteAll();
        BookOpinionQuery::create()->deleteAll();

        $br = new BookReader();
        $br->setName("TestReader");
        $br->save();

        $b = new Book();
        $b->setTitle("TestBook");
        $b->setISBN("XX-XX-XX-XX");
        $b->save();

        $op = new BookOpinion();
        $op->setBookReader($br);
        $op->setBook($b);
        $op->setRating(10);
        $op->setRecommendToFriend(true);
        $op->save();

        $this->assertEquals(1, BookReaderQuery::create()->count(), '1 BookReader');
        $this->assertEquals(1, BookQuery::create()->count(), '1 Book');
        $this->assertEquals(1, BookOpinionQuery::create()->count(), '1 BookOpinion');

        // make sure everything is loaded correctly (and their relation too)
        $br->reload(true);
        $b->reload(true);
        $op->reload(true);

        $br->getBookOpinions(); // load the relation

        $b->removeBookOpinion($op);
        $b->save();

        // the Book knows that there is no longer an opinion
        $this->assertEquals(0, count($b->getBookOpinions()), 'Book knows there is no opinion');
        // but not the BookReader
        $this->assertEquals(1, count($br->getBookOpinions()), 'BookReader still thinks it has 1 opinion');

        $br->reload(true);  // with relations

        $this->assertEquals(0, count($br->getBookOpinions()), 'BookReader now knows the opinion is gone');

        $this->assertEquals(1, BookReaderQuery::create()->count(), '1 BookReader');
        $this->assertEquals(1, BookQuery::create()->count(), '1 Book');
        $this->assertEquals(0, BookOpinionQuery::create()->count(), '0 BookOpinion');
    }
    
    /**
     *
     */
    public function testCopyConcretInheritance()
    {
        $concreteArticle = new ConcreteArticle();
        $concreteArticle->setBody('TestBody');
        $concreteArticle->save();

        $copy = $concreteArticle->copy();

        $this->assertNull($copy->getId(), "single PK not autoincremented shouldn't be copied");
    }

    public function testDeepCopyConcretInheritance()
    {
        $comment1 = new ConcreteComment();
        $comment1->setMessage('my-new-comment1');
        $concreteArticle = new ConcreteArticle();
        $concreteArticle->setBody('TestBody');
        $concreteArticle->addConcreteComment($comment1);
        $concreteArticle->save();
        $comment1->save();

        $this->assertNotNull($comment1->getId());
        $this->assertNotNull($concreteArticle->getId());
        $this->assertEquals(1, $concreteArticle->countConcreteComments());
        $this->assertEquals($comment1->getConcreteContentId(), $concreteArticle->getId());

        $copy = $concreteArticle->copy(true);
        $this->assertNull($copy->getId());
        $this->assertEquals(1, $concreteArticle->countConcreteComments());

        $comments = $copy->getConcreteContent()->getConcreteComments();
        $this->assertEquals('my-new-comment1', $comments[0]->getMessage());
    }

    public function testToArray()
    {
        $b = new Book();
        $b->setTitle('Don Juan');

        $arr1 = $b->toArray();
        $expectedKeys = array(
            'Id',
            'Title',
            'ISBN',
            'Price',
            'PublisherId',
            'AuthorId'
        );
        $this->assertEquals($expectedKeys, array_keys($arr1), 'toArray() returns an associative array with BasePeer::TYPE_PHPNAME keys by default');
        $this->assertEquals('Don Juan', $arr1['Title'], 'toArray() returns an associative array representation of the object');
    }

    public function testToArrayKeyType()
    {
        $b = new Book();
        $b->setTitle('Don Juan');

        $arr1 = $b->toArray(BasePeer::TYPE_COLNAME);
        $expectedKeys = array(
            BookPeer::ID,
            BookPeer::TITLE,
            BookPeer::ISBN,
            BookPeer::PRICE,
            BookPeer::PUBLISHER_ID,
            BookPeer::AUTHOR_ID
        );
        $this->assertEquals($expectedKeys, array_keys($arr1), 'toArray() accepts a $keyType parameter to change the result keys');
        $this->assertEquals('Don Juan', $arr1[BookPeer::TITLE], 'toArray() returns an associative array representation of the object');
    }

    public function testToArrayKeyTypePreDefined()
    {
        $schema = <<<EOF
<database name="test">
    <table name="test_key_type_table">
        <column name="id_key_type" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="name_key_type" type="VARCHAR" />
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $builder->getConfig()->setBuildProperty('defaultKeyType', 'studlyPhpName');
        $builder->buildClasses();

        $expectedKeys = array(
            'idKeyType',
            'nameKeyType',
        );

        $object = new TestKeyTypeTable();

        $this->assertEquals($expectedKeys, array_keys($object->toArray()), 'toArray() returns an associative array with pre-defined key type in properties.');
    }

    /**
     * Test regexp validator for ticket:542
     * @link       http://propel.phpdb.org/trac/ticket/542
     */
    public function testRegexValidator()
    {
        $b = new Bookstore();
        $b->setWebsite("http://this.is.valid.com/foo.bar");
        $res = $b->validate();
        $this->assertTrue($res, "Expected URL to validate");
    }

    /**
     * Test that setting the auto-increment primary key will result in exception.
     */
    public function testSettingAutoIncrementPK()
    {
        // The whole test is in a transaction, but this test needs real transactions
        $this->con->commit();

        $b = new Bookstore();
        $b->setId(1);
        $b->setStoreName("Test");
        try {
            $b->save();
            $this->fail("Expected setting auto-increment primary key to result in Exception");
        } catch (Exception $x) {
            $this->assertInstanceOf('PropelException', $x);
        }

        // ... but we should silently ignore NULL values, since these are really
        // the same as "not set" in PHP world.
        $b = new Bookstore();
        $b->setId(null);
        $b->setStoreName("Test2");
        try {
            $b->save();
        } catch (Exception $x) {
            $this->fail("Expected no exception when setting auto-increment primary key to NULL");
        }
        // success ...

        $this->con->beginTransaction();
    }

    /**
     * Checks wether we are allowed to specify the primary key on a
     * table with allowPkInsert=true set
     *
     * saves the object, gets it from data-source again and then compares
     * them for equality (thus the instance pool is also checked)
     */
    public function testAllowPkInsertOnIdMethodNativeTable()
    {
        CustomerPeer::doDeleteAll();
        $cu = new Customer;
        $cu->setPrimaryKey(100000);
        $cu->save();

        $this->assertEquals(100000, $cu->getPrimaryKey());

        $cu2 = CustomerPeer::retrieveByPk(100000);

        $this->assertSame($cu, $cu2);
    }

    /**
     * Checks if it is allowed to save new, empty objects with a auto increment column
     */
    public function testAllowEmptyWithAutoIncrement()
    {
        $bookreader = new BookReader();
        $bookreader->save();

        $this->assertFalse($bookreader->isNew());
    }

    /**
     * Test foreign key relationships based on references to unique cols but not PK.
     * @link       http://propel.phpdb.org/trac/ticket/691
     */
    public function testUniqueFkRel()
    {
        BookstoreEmployeeAccountPeer::doDeleteAll();

        $employee = new BookstoreEmployee();
        $employee->setName("Johnny Walker");

        $acct = new BookstoreEmployeeAccount();
        $acct->setBookstoreEmployee($employee);
        $acct->setLogin("test-login");
        $acct->save();
        $acctId = $acct->getEmployeeId();

        $al = new AcctAuditLog();
        $al->setBookstoreEmployeeAccount($acct);
        $al->save();
        $alId = $al->getId();

        BookstoreEmployeePeer::clearInstancePool();
        BookstoreEmployeeAccountPeer::clearInstancePool();
        AcctAuditLogPeer::clearInstancePool();

        $al2 = AcctAuditLogPeer::retrieveByPK($alId);
        /* @var $al2 AcctAuditLog */
        $mapacct = $al2->getBookstoreEmployeeAccount();
        $lookupacct = BookstoreEmployeeAccountPeer::retrieveByPK($acctId);

        $logs = $lookupacct->getAcctAuditLogs();

        $this->assertTrue(count($logs) == 1, "Expected 1 audit log result.");
        $this->assertEquals($logs[0]->getId(), $al->getId(), "Expected returned audit log to match created audit log.");
    }

    public function testIsPrimaryKeyNull()
    {
        $b = new Book();
        $this->assertTrue($b->isPrimaryKeyNull());
        $b->setPrimaryKey(123);
        $this->assertFalse($b->isPrimaryKeyNull());
        $b->setPrimaryKey(null);
        $this->assertTrue($b->isPrimaryKeyNull());
    }

    public function testIsPrimaryKeyNullCompmosite()
    {
        $b = new BookOpinion();
        $this->assertTrue($b->isPrimaryKeyNull());
        $b->setPrimaryKey(array(123, 456));
        $this->assertFalse($b->isPrimaryKeyNull());
        $b->setPrimaryKey(array(123, null));
        $this->assertFalse($b->isPrimaryKeyNull());
        $b->setPrimaryKey(array(null, 456));
        $this->assertFalse($b->isPrimaryKeyNull());
        $b->setPrimaryKey(array(null, null));
        $this->assertTrue($b->isPrimaryKeyNull());
    }

    public function testAddToStringDefault()
    {
        $this->assertTrue(method_exists('Author', '__toString'), 'addPrimaryString() adds a __toString() method even if no column has the primaryString attribute');
        $author = new Author();
        $author->setFirstName('Leo');
        $author->setLastName('Tolstoi');
        $expected = <<<EOF
Id: null
FirstName: Leo
LastName: Tolstoi
Email: null
Age: null

EOF;
        $this->assertEquals($expected, (string) $author, 'addPrimaryString() adds a __toString() method returning the YAML representation of the object where no column is defined as primaryString');
    }

    public function testAddToStringPrimaryString()
    {
        $this->assertTrue(method_exists('Book', '__toString'), 'addPrimaryString() adds a __toString() method if a column has the primaryString attribute');
        $book = new Book();
        $book->setTitle('foo');
        $this->assertEquals('foo', (string) $book, 'addPrimaryString() adds a __toString() method returning the value of the the first column where primaryString is true');
    }

    public function testPreInsert()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $this->assertEquals('PreInsertedFirstname', $author->getFirstName());
    }

    public function testPreUpdate()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $author->setNew(false);
        $author->save();
        $this->assertEquals('PreUpdatedFirstname', $author->getFirstName());
    }

    public function testPostInsert()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $this->assertEquals('PostInsertedLastName', $author->getLastName());
    }

    public function testPostUpdate()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $author->setNew(false);
        $author->save();
        $this->assertEquals('PostUpdatedLastName', $author->getLastName());
    }

    public function testPreSave()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $this->assertEquals('pre@save.com', $author->getEmail());
    }

    public function testPreSaveFalse()
    {
        $con = Propel::getConnection(AuthorPeer::DATABASE_NAME);
        $author = new TestAuthorSaveFalse();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $res = $author->save($con);
        $this->assertEquals(0, $res);
        $this->assertEquals('pre@save.com', $author->getEmail());
        $this->assertNotEquals(115, $author->getAge());
        $this->assertTrue($author->isNew());
        $this->assertEquals(1, $con->getNestedTransactionCount());
    }

    public function testPostSave()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $this->assertEquals(115, $author->getAge());
    }

    public function testPreDelete()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $author->delete();
        $this->assertEquals("Pre-Deleted", $author->getFirstName());
    }

    public function testPreDeleteFalse()
    {
        $con = Propel::getConnection(AuthorPeer::DATABASE_NAME);
        $author = new TestAuthorDeleteFalse();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save($con);
        $author->delete($con);
        $this->assertEquals("Pre-Deleted", $author->getFirstName());
        $this->assertNotEquals("Post-Deleted", $author->getLastName());
        $this->assertFalse($author->isDeleted());
        $this->assertEquals(1, $con->getNestedTransactionCount());
    }

    public function testPostDelete()
    {
        $author = new TestAuthor();
        $author->setFirstName("bogus");
        $author->setLastName("Lastname");
        $author->save();
        $author->delete();
        $this->assertEquals("Post-Deleted", $author->getLastName());
    }

    public function testPostHydrate()
    {
        $author = new TestAuthor();
        $author->hydrate(array(1, 'bogus', 'Lastname', 'bogus@mail.com', 21));
        $this->assertEquals("Post-Hydrated", $author->getLastName());
    }

    public function testMagicVirtualColumnGetter()
    {
        $book = new Book();
        $book->setVirtualColumn('Foo', 'bar');
        $this->assertEquals('bar', $book->getFoo(), 'generated __call() catches getters for virtual columns');
        $book = new Book();
        $book->setVirtualColumn('foo', 'bar');
        $this->assertEquals('bar', $book->getFoo(), 'generated __call() catches getters for virtual columns starting with a lowercase character');
    }

    /**
     * @expectedException PropelException
     */
    public function testMagicCallUndefined()
    {
        $book = new Book();
        $book->fooMethodName();
    }

    public static function conditionsForTestReadOnly()
    {
        return array(
            array('reload'),
            array('delete'),
            array('save'),
            array('doSave'),
        );
    }

    /**
     * @dataProvider conditionsForTestReadOnly
     */
    public function testReadOnly($method)
    {
        $cv = new ContestView();
        $this->assertFalse(method_exists($cv, $method), 'readOnly tables end up with no ' . $method . ' method in the generated object class');
    }

    public function testSetterOneToMany()
    {
        // Ensure no data
        BookQuery::create()->deleteAll();
        AuthorQuery::create()->deleteAll();

        $coll = new PropelObjectCollection();
        $coll->setModel('Book');

        for ($i = 0; $i < 3; $i++) {
            $b = new Book();
            $b->setTitle('Title ' . $i);
            $b->setIsbn('1204' . $i);

            $coll[] = $b;
        }

        $this->assertEquals(3, $coll->count());

        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->setBooks($coll);
        $a->save();

        $this->assertInstanceOf('PropelObjectCollection', $a->getBooks());
        $this->assertEquals(3, $a->getBooks()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(3, BookQuery::create()->count());

        $coll->shift();
        $this->assertEquals(2, $coll->count());

        $a->setBooks($coll);
        $a->save();

        $this->assertEquals(2, $a->getBooks()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
        //The book is not deleted because his fk is not required
        $this->assertEquals(3, BookQuery::create()->count());

        $newBook = new Book();
        $newBook->setTitle('My New Book');
        $newBook->setIsbn(1234);

        // Kind of new collection
        $coll = clone $coll;
        $coll[] = $newBook;

        $a->setBooks($coll);
        $a->save();

        $this->assertEquals(3, $coll->count());
        $this->assertEquals(3, $a->getBooks()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(4, BookQuery::create()->count());

        // Add a new object
        $newBook1 = new Book();
        $newBook1->setTitle('My New Book1');
        $newBook1->setIsbn(1256);

        // Existing collection - The fix around reference is tested here.
        $coll[] = $newBook1;

        $a->setBooks($coll);
        $a->save();

        $this->assertEquals(4, $coll->count());
        $this->assertEquals(4, $a->getBooks()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(5, BookQuery::create()->count());

        // Add the same collection
        $books = $a->getBooks();

        $a->setBooks($books);
        $a->save();

        $this->assertEquals(4, $books->count());
        $this->assertEquals(4, $a->getBooks()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(5, BookQuery::create()->count());
    }

    public function testSetterOneToManyWithFkRequired()
    {
        // Ensure no data
        BookSummaryQuery::create()->deleteAll();
        BookQuery::create()->deleteAll();

        $coll = new PropelObjectCollection();
        $coll->setModel('BookSummary');

        for ($i = 0; $i < 3; $i++) {
            $bs = new BookSummary();
            $bs->setSummary('A summary ' . $i);

            $coll[] = $bs;
        }

        $this->assertEquals(3, $coll->count());

        $b = new Book();
        $b->setTitle('myBook');
        $b->setBookSummarys($coll);
        $b->setIsbn('12242');
        $b->save();

        $this->assertInstanceOf('PropelObjectCollection', $b->getBookSummarys());
        $this->assertEquals(3, $b->getBookSummarys()->count());
        $this->assertEquals(1, BookQuery::create()->count());
        $this->assertEquals(3, BookSummaryQuery::create()->count());

        $coll->shift();
        $this->assertEquals(2, $coll->count());

        $b->setBookSummarys($coll);
        $b->save();

        $this->assertEquals(2, $b->getBookSummarys()->count());
        $this->assertEquals(1, BookQuery::create()->count());
        $this->assertEquals(2, BookSummaryQuery::create()->count());

        $newBookSammary = new BookSummary();
        $newBookSammary->setSummary('My sammary');

        // Kind of new collection
        $coll = clone $coll;
        $coll[] = $newBookSammary;

        $b->setBookSummarys($coll);
        $b->save();

        $this->assertEquals(3, $coll->count());
        $this->assertEquals(3, $b->getBookSummarys()->count());
        $this->assertEquals(1, BookQuery::create()->count());
        $this->assertEquals(3, BookSummaryQuery::create()->count());

        // Add a new object
        $newBookSammary1 = new BookSummary();
        $newBookSammary1->setSummary('My sammary 1');

        // Existing collection - The fix around reference is tested here.
        $coll[] = $newBookSammary1;

        $b->setBookSummarys($coll);
        $b->save();

        $this->assertEquals(4, $coll->count());
        $this->assertEquals(4, $b->getBookSummarys()->count());
        $this->assertEquals(1, BookQuery::create()->count());
        $this->assertEquals(4, BookSummaryQuery::create()->count());

        // Add the same collection
        $bookSummaries = $b->getBookSummarys();

        $b->setBookSummarys($bookSummaries);
        $b->save();

        $this->assertEquals(4, $coll->count());
        $this->assertEquals(4, $b->getBookSummarys()->count());
        $this->assertEquals(1, BookQuery::create()->count());
        $this->assertEquals(4, BookSummaryQuery::create()->count());
    }

    public function testSetterOneToManyWithNoData()
    {
        // Ensure no data
        BookQuery::create()->deleteAll();
        AuthorQuery::create()->deleteAll();

        $books = new PropelObjectCollection();
        $this->assertEquals(0, $books->count());

        // Basic usage
        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->setBooks($books);
        $a->save();

        $this->assertEquals(0, $a->getBooks()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(0, BookQuery::create()->count());
    }

    public function testSetterOneToManySavesForeignObjects()
    {
        // Ensure no data
        BookQuery::create()->deleteAll();
        AuthorQuery::create()->deleteAll();

        $book = new Book();
        $book->setTitle('My Book');
        $book->setIsbn('1245');
        $book->save();

        // Modify it but don't save it
        $book->setTitle('My Title');

        $coll = new PropelObjectCollection();
        $coll[] = $book;

        BookPeer::clearInstancePool();
        $book = BookQuery::create()->findPk($book->getPrimaryKey());

        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->setBooks($coll);
        $a->save();

        $this->assertEquals(1, $a->getBooks()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(1, BookQuery::create()->count());

        $result = BookQuery::create()
            ->filterById($book->getId())
            ->select('Title')
            ->findOne();
        $this->assertSame('My Title', $result);
    }

    public function testSetterOneToManyWithNewObjects()
    {
        // Ensure no data
        BookQuery::create()->deleteAll();
        AuthorQuery::create()->deleteAll();

        $coll = new PropelObjectCollection();
        $coll->setModel('Book');

        for ($i = 0; $i < 3; $i++) {
            $b = new Book();
            $b->setTitle('Book ' . $i);
            $b->setIsbn('124' . $i);

            $coll[] = $b;
        }

        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->setBooks($coll);
        $a->save();

        $this->assertEquals(3, $coll->count());
        $this->assertEquals(3, count($a->getBooks()));
        $this->assertSame($coll, $a->getBooks());
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(3, BookQuery::create()->count());
    }

    public function testSetterOneToManyWithExistingObjects()
    {
        // Ensure no data
        BookQuery::create()->deleteAll();
        AuthorQuery::create()->deleteAll();

        for ($i = 0; $i < 3; $i++) {
            $b = new Book();
            $b->setTitle('Book ' . $i);
            $b->setIsbn('21234' . $i);
            $b->save();
        }

        BookPeer::clearInstancePool();
        $books = BookQuery::create()->find();

        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->setBooks($books);
        $a->save();

        $this->assertEquals(3, count($a->getBooks()));
        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(3, BookQuery::create()->count());

        $i = 0;
        foreach ($a->getBooks() as $book) {
            $this->assertEquals('Book ' . $i++, $book->getTitle());
        }
    }

    public function testSetterOneToManyWithEmptyCollection()
    {
        // Ensure no data
        BookQuery::create()->deleteAll();
        AuthorQuery::create()->deleteAll();

        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->setBooks(new PropelObjectCollection());
        $a->save();

        $this->assertEquals(0, count($a->getBooks()));

        $this->assertEquals(0, BookQuery::create()->count());
        $this->assertEquals(1, AuthorQuery::create()->count());
    }

    public function testSetterOneToManyReplacesOldObjectsByNewObjects()
    {
        // Ensure no data
        BookQuery::create()->deleteAll();
        AuthorQuery::create()->deleteAll();

        $books = new PropelObjectCollection();
        foreach (array('foo', 'bar') as $title) {
            $b = new Book();
            $b->setTitle($title);
            $b->setIsbn('12354');

            $books[] = $b;
        }

        $a = new Author();
        $a->setFirstName('Foo');
        $a->setLastName('Bar');
        $a->setBooks($books);
        $a->save();

        $books = $a->getBooks();
        $this->assertEquals('foo', $books[0]->getTitle());
        $this->assertEquals('bar', $books[1]->getTitle());

        $books = new PropelObjectCollection();
        foreach (array('bam', 'bom') as $title) {
            $b = new Book();
            $b->setTitle($title);
            $b->setIsbn('1235');

            $books[] = $b;
        }

        $a->setBooks($books);
        $a->save();

        $books = $a->getBooks();
        $this->assertEquals('bam', $books[0]->getTitle());
        $this->assertEquals('bom', $books[1]->getTitle());

        $this->assertEquals(1, AuthorQuery::create()->count());
        // the replaced book are still there because the PK is not required
        $this->assertEquals(4, BookQuery::create()->count());
    }

    public function testSetterOneToManyReplacesOldObjectsByNewObjectsWithFkRequired()
    {
        // Ensure no data
        BookSummaryQuery::create()->deleteAll();
        BookQuery::create()->deleteAll();

        $bookSummaries = new PropelObjectCollection();
        foreach (array('foo', 'bar') as $summary) {
            $s = new BookSummary();
            $s->setSummary($summary);
            $bookSummaries[] = $s;
        }

        $b = new Book();
        $b->setTitle('Hello');
        $b->setBookSummarys($bookSummaries);
        $b->setIsbn('1234');
        $b->save();

        $bookSummaries = $b->getBookSummarys();
        $this->assertEquals('foo', $bookSummaries[0]->getSummary());
        $this->assertEquals('bar', $bookSummaries[1]->getSummary());

        $bookSummaries = new PropelObjectCollection();
        foreach (array('bam', 'bom') as $summary) {
            $s = new BookSummary();
            $s->setSummary($summary);
            $bookSummaries[] = $s;
        }

        $b->setBookSummarys($bookSummaries);
        $b->save();

        $bookSummaries = $b->getBookSummarys();
        $this->assertEquals('bam', $bookSummaries[0]->getSummary());
        $this->assertEquals('bom', $bookSummaries[1]->getSummary());

        $this->assertEquals(1, BookQuery::create()->count());
        $this->assertEquals(2, BookSummaryQuery::create()->count());
    }

    public function testHooksCall()
    {
        AuthorQuery::create()->deleteAll();
        BookQuery::create()->deleteAll();

        $author = new CountableAuthor();
        $author->setFirstName('Foo');
        $author->setLastName('Bar');

        $book = new Book();
        $book->setTitle('A title');
        $book->setIsbn('13456');

        $author->addBook($book);
        $author->save();

        $this->assertEquals(1, AuthorQuery::create()->count());
        $this->assertEquals(1, BookQuery::create()->count());
        $this->assertEquals(1, $author->nbCallPreSave);
    }

    /**
     * @expectedException PropelException
     */
    public function testDoInsert()
    {
        if (!class_exists('Unexistent')) {
            $schema = <<<EOF
<database name="a-database">
    <table name="unexistent">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="name" type="VARCHAR" />
    </table>
</database>
EOF;
            $builder = new PropelQuickBuilder();
            $builder->setSchema($schema);
            $builder->buildClasses();
        }

        $object = new Unexistent();
        $object->setName('Foo');
        $object->save();

        $this->fail('Should not be called');
    }
}

class CountableAuthor extends Author
{
    public $nbCallPreSave = 0;

    /**
     * {@inheritdoc}
     */
    public function preSave(PropelPDO $con = null)
    {
        $this->nbCallPreSave++;

        return parent::preSave($con);
    }
}
