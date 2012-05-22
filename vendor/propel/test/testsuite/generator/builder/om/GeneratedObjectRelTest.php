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
 * Tests relationships between generated Object classes.
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
class GeneratedObjectRelTest extends BookstoreEmptyTestBase
{

	protected function setUp()
	{
		parent::setUp();
	}

	/**
	 * Tests one side of a bi-directional setting of many-to-many relationships.
	 */
	public function testManyToMany_Dir1()
	{
		$list = new BookClubList();
		$list->setGroupLeader('Archimedes Q. Porter');
		// No save ...

		$book = new Book();
		$book->setTitle( "Jungle Expedition Handbook" );
		$book->setISBN('TEST');
		// No save ...

		$this->assertEquals(0, count($list->getBookListRels()) );
		$this->assertEquals(0, count($book->getBookListRels()) );
		$this->assertEquals(0, count(BookListRelPeer::doSelect(new Criteria())) );

		$xref = new BookListRel();
		$xref->setBook($book);
		$list->addBookListRel($xref);

		$this->assertEquals(1, count($list->getBookListRels()));
		$this->assertEquals(1, count($book->getBookListRels()) );
		$this->assertEquals(0, count(BookListRelPeer::doSelect(new Criteria())) );

		$list->save();

		$this->assertEquals(1, count($list->getBookListRels()) );
		$this->assertEquals(1, count($book->getBookListRels()) );
		$this->assertEquals(1, count(BookListRelPeer::doSelect(new Criteria())) );

	}

	/**
	 * Tests reverse setting of one of many-to-many relationship, with all saves cascaded.
	 */
	public function testManyToMany_Dir2_Unsaved()
	{
		$list = new BookClubList();
		$list->setGroupLeader('Archimedes Q. Porter');
		// No save ...

		$book = new Book();
		$book->setTitle( "Jungle Expedition Handbook" );
		$book->setISBN('TEST');
		// No save (yet) ...

		$this->assertEquals(0, count($list->getBookListRels()) );
		$this->assertEquals(0, count($book->getBookListRels()) );
		$this->assertEquals(0, count(BookListRelPeer::doSelect(new Criteria())) );

		$xref = new BookListRel();
		$xref->setBookClubList($list);
		$book->addBookListRel($xref);

		$this->assertEquals(1, count($list->getBookListRels()) );
		$this->assertEquals(1, count($book->getBookListRels()) );
		$this->assertEquals(0, count(BookListRelPeer::doSelect(new Criteria())) );
		$book->save();

		$this->assertEquals(1, count($list->getBookListRels()) );
		$this->assertEquals(1, count($book->getBookListRels()) );
		$this->assertEquals(1, count(BookListRelPeer::doSelect(new Criteria())) );

	}

	/**
	 * Tests reverse setting of relationships, saving one of the objects first.
	 * @link       http://propel.phpdb.org/trac/ticket/508
	 */
	public function testManyToMany_Dir2_Saved()
	{
		$list = new BookClubList();
		$list->setGroupLeader('Archimedes Q. Porter');
		$list->save();

		$book = new Book();
		$book->setTitle( "Jungle Expedition Handbook" );
		$book->setISBN('TEST');
		// No save (yet) ...

		$this->assertEquals(0, count($list->getBookListRels()) );
		$this->assertEquals(0, count($book->getBookListRels()) );
		$this->assertEquals(0, count(BookListRelPeer::doSelect(new Criteria())) );

		// Now set the relationship from the opposite direction.

		$xref = new BookListRel();
		$xref->setBookClubList($list);
		$book->addBookListRel($xref);

		$this->assertEquals(1, count($list->getBookListRels()) );
		$this->assertEquals(1, count($book->getBookListRels()) );
		$this->assertEquals(0, count(BookListRelPeer::doSelect(new Criteria())) );
		$book->save();

		$this->assertEquals(1, count($list->getBookListRels()) );
		$this->assertEquals(1, count($book->getBookListRels()) );
		$this->assertEquals(1, count(BookListRelPeer::doSelect(new Criteria())) );

	}

	public function testManyToManyGetterExists()
	{
		$this->assertTrue(method_exists('BookClubList', 'getBooks'), 'Object generator correcly adds getter for the crossRefFk');
		$this->assertFalse(method_exists('BookClubList', 'getBookClubLists'), 'Object generator correcly adds getter for the crossRefFk');
	}

	public function testManyToManyGetterNewObject()
	{
		$blc1 = new BookClubList();
		$books = $blc1->getBooks();
		$this->assertTrue($books instanceof PropelObjectCollection, 'getCrossRefFK() returns a Propel collection');
		$this->assertEquals('Book', $books->getModel(), 'getCrossRefFK() returns a collection of the correct model');
		$this->assertEquals(0, count($books), 'getCrossRefFK() returns an empty list for new objects');
		$query = BookQuery::create()
			->filterByTitle('Harry Potter and the Order of the Phoenix');
		$books = $blc1->getBooks($query);
		$this->assertEquals(0, count($books), 'getCrossRefFK() accepts a query as first parameter');
	}

	public function testManyToManyGetter()
	{
		BookstoreDataPopulator::populate();
		$blc1 = BookClubListQuery::create()->findOneByGroupLeader('Crazyleggs');
		$books = $blc1->getBooks();
		$this->assertTrue($books instanceof PropelObjectCollection, 'getCrossRefFK() returns a Propel collection');
		$this->assertEquals('Book', $books->getModel(), 'getCrossRefFK() returns a collection of the correct model');
		$this->assertEquals(2, count($books), 'getCrossRefFK() returns the correct list of objects');
		$query = BookQuery::create()
			->filterByTitle('Harry Potter and the Order of the Phoenix');
		$books = $blc1->getBooks($query);
		$this->assertEquals(1, count($books), 'getCrossRefFK() accepts a query as first parameter');
	}

	public function testManyToManyCounterExists()
	{
		$this->assertTrue(method_exists('BookClubList', 'countBooks'), 'Object generator correcly adds counter for the crossRefFk');
		$this->assertFalse(method_exists('BookClubList', 'countBookClubLists'), 'Object generator correcly adds counter for the crossRefFk');
	}

	public function testManyToManyCounterNewObject()
	{
		$blc1 = new BookClubList();
		$nbBooks = $blc1->countBooks();
		$this->assertEquals(0, $nbBooks, 'countCrossRefFK() returns 0 for new objects');
		$query = BookQuery::create()
			->filterByTitle('Harry Potter and the Order of the Phoenix');
		$nbBooks = $blc1->countBooks($query);
		$this->assertEquals(0, $nbBooks, 'countCrossRefFK() accepts a query as first parameter');
	}

	public function testManyToManyCounter()
	{
		BookstoreDataPopulator::populate();
		$blc1 = BookClubListQuery::create()->findOneByGroupLeader('Crazyleggs');
		$nbBooks = $blc1->countBooks();
		$this->assertEquals(2, $nbBooks, 'countCrossRefFK() returns the correct list of objects');
		$query = BookQuery::create()
			->filterByTitle('Harry Potter and the Order of the Phoenix');
		$nbBooks = $blc1->countBooks($query);
		$this->assertEquals(1, $nbBooks, 'countCrossRefFK() accepts a query as first parameter');
	}

	public function testManyToManyAdd()
	{
		$list = new BookClubList();
		$list->setGroupLeader('Archimedes Q. Porter');

		$book = new Book();
		$book->setTitle( "Jungle Expedition Handbook" );
		$book->setISBN('TEST');

		$list->addBook($book);
		$this->assertEquals(1, $list->countBooks(), 'addCrossFk() sets the internal collection properly');
		$this->assertEquals(1, $list->countBookListRels(), 'addCrossFk() sets the internal cross reference collection properly');

		$list->save();
		$this->assertFalse($book->isNew(), 'related object is saved if added');
		$rels = $list->getBookListRels();
		$rel = $rels[0];
		$this->assertFalse($rel->isNew(), 'cross object is saved if added');

		$list->clearBookListRels();
		$list->clearBooks();
		$books = $list->getBooks();
		$expected = new PropelObjectCollection(array($book));
		$expected->setModel('Book');
		$this->assertEquals($expected, $books, 'addCrossFk() adds the object properly');
		$this->assertEquals(1, $list->countBookListRels());
	}


	/**
	 * Test behavior of columns that are implicated in multiple foreign keys.
	 * @link       http://propel.phpdb.org/trac/ticket/228
	 */
	public function testMultiFkImplication()
	{
		BookstoreDataPopulator::populate();
		// Create a new bookstore, contest, bookstore_contest, and bookstore_contest_entry
		$b = new Bookstore();
		$b->setStoreName("Foo!");
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

		$bce->setBookstoreId(null);

		$this->assertNull($bce->getBookstoreContest());
		$this->assertNull($bce->getBookstore());
	}

	/**
	 * Test the clearing of related object collection.
	 * @link       http://www.propelorm.org/ticket/529
	 */
	public function testClearRefFk()
	{
		BookstoreDataPopulator::populate();
		$book = new Book();
		$book->setISBN("Foo-bar-baz");
		$book->setTitle("The book title");

		// No save ...

		$r = new Review();
		$r->setReviewedBy('Me');
		$r->setReviewDate(new DateTime("now"));

		$book->addReview($r);

		// No save (yet) ...

		$this->assertEquals(1, count($book->getReviews()) );
		$book->clearReviews();
		$this->assertEquals(0, count($book->getReviews()));
	}

	/**
	 * Test the clearing of related object collection via a many-to-many association.
	 * @link       http://www.propelorm.org/ticket/1374
	 */
	public function testClearCrossFk()
	{
		$book = new Book();
		$bookClub = new BookClubList();
		$book->addBookClubList($bookClub);
		$this->assertEquals(1, count($book->getBookClubLists()));
		$book->clear();
		$this->assertEquals(0, count($book->getBookClubLists()));
	}

	/**
	 * This tests to see whether modified objects are being silently overwritten by calls to fk accessor methods.
	 * @link       http://propel.phpdb.org/trac/ticket/509#comment:5
	 */
	public function testModifiedObjectOverwrite()
	{
		BookstoreDataPopulator::populate();
		$author = new Author();
		$author->setFirstName("John");
		$author->setLastName("Public");

		$books = $author->getBooks(); // empty, of course
		$this->assertEquals(0, count($books), "Expected empty collection.");

		$book = new Book();
		$book->setTitle("A sample book");
		$book->setISBN("INITIAL ISBN");

		$author->addBook($book);

		$author->save();

		$book->setISBN("MODIFIED ISBN");

		$books = $author->getBooks();
		$this->assertEquals(1, count($books), "Expected 1 book.");
		$this->assertSame($book, $books[0], "Expected the same object to be returned by fk accessor.");
		$this->assertEquals("MODIFIED ISBN", $books[0]->getISBN(), "Expected the modified value NOT to have been overwritten.");
	}

	public function testFKGetterUseInstancePool()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$author = AuthorPeer::doSelectOne(new Criteria(), $con);
		// populate book instance pool
		$books = $author->getBooks(null, $con);
		$sql = $con->getLastExecutedQuery();
		$author = $books[0]->getAuthor($con);
		$this->assertEquals($sql, $con->getLastExecutedQuery(), 'refFK getter uses instance pool if possible');
	}

	public function testRefFKGetJoin()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		PublisherPeer::clearInstancePool();
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$author = AuthorPeer::doSelectOne(new Criteria(), $con);
		// populate book instance pool
		$books = $author->getBooksJoinPublisher(null, $con);
		$sql = $con->getLastExecutedQuery();
		$publisher = $books[0]->getPublisher($con);
		$this->assertEquals($sql, $con->getLastExecutedQuery(), 'refFK getter uses instance pool if possible');
	}

	public function testRefFKAddReturnsCurrentObject()
	{
		$author = new Author();
		$author->setFirstName('Leo');
		$ret = $author->addBook(new Book());
		$this->assertSame($author, $ret);
	}

	public function testSetterCollection()
	{
		// Ensure no data
		BookQuery::create()->deleteAll();
		BookClubListQuery::create()->deleteAll();
		BookListRelQuery::create()->deleteAll();

		$books = new PropelObjectCollection();
		for ($i = 0; $i < 10; $i++) {
			$b = new Book();
			$b->setTitle('My Book ' . $i);
			$b->setIsbn($i);

			$books[] = $b;
		}
		$this->assertEquals(10, $books->count());

		// Basic usage
		$bookClubList1 = new BookClubList();
		$bookClubList1->setGroupLeader('BookClubList1 Leader');
		$bookClubList1->setBooks($books);
		$bookClubList1->save();

		$this->assertEquals(10, $bookClubList1->getBooks()->count());
		$this->assertEquals(1,  BookClubListQuery::create()->count());
		$this->assertEquals(10, BookQuery::create()->count());
		$this->assertEquals(10, BookListRelQuery::create()->count());

		$i = 0;
		foreach ($bookClubList1->getBooks() as $book) {
			$this->assertEquals('My Book ' . $i, $book->getTitle());
			$this->assertEquals($i++, $book->getIsbn());
		}

		// Remove an element
		$books->shift();
		$this->assertEquals(9, $books->count());

		$bookClubList1->setBooks($books);
		$bookClubList1->save();

		$this->assertEquals(9, $bookClubList1->getBooks()->count());
		$this->assertEquals(1, BookClubListQuery::create()->count());
		$this->assertEquals(9, BookListRelQuery::create()->count());
		$this->assertEquals(10, BookQuery::create()->count());

		// Add a new object
		$newBook = new Book();
		$newBook->setTitle('My New Book');
		$newBook->setIsbn(1234);

		// Kind of new collection
		$books   = clone $books;
		$books[] = $newBook;

		$bookClubList1->setBooks($books);
		$bookClubList1->save();

		$this->assertEquals(10, $books->count());
		$this->assertEquals(10, $bookClubList1->getBooks()->count());
		$this->assertEquals(1,  BookClubListQuery::create()->count());
		$this->assertEquals(10, BookListRelQuery::create()->count());
		$this->assertEquals(11, BookQuery::create()->count());

		// Add a new object
		$newBook1 = new Book();
		$newBook1->setTitle('My New Book1');
		$newBook1->setIsbn(1256);

		// Existing collection - The fix around reference is tested here.
		// Ths `$books` collection has ever been setted to the `$bookClubList1` object.
		// Here we are adding a new object into the collection but, in this process, it
		// added the new object in the internal `collBooks` of the `$bookClubList1`
		// object too.
		// That's why the new object is not tracked and the cross object is not created,
		// in `addBook()` we consider the `collBooks` ever contains this new object. It's
		// not true but this is the "reference" process.
		// By saying "all new objects have to be added", we solve this issue. To know if
		// it's the best solution is the question.
		$books[] = $newBook1;

		$bookClubList1->setBooks($books);
		$bookClubList1->save();

		$this->assertEquals(11, $books->count());
		$this->assertEquals(11, $bookClubList1->getBooks()->count());
		$this->assertEquals(1,  BookClubListQuery::create()->count());
		$this->assertEquals(11, BookListRelQuery::create()->count());
		$this->assertEquals(12, BookQuery::create()->count());

		// Add the same collection
		$books = $bookClubList1->getBooks();

		$bookClubList1->setBooks($books);
		$bookClubList1->save();

		$this->assertEquals(11, $books->count());
		$this->assertEquals(11, $bookClubList1->getBooks()->count());
		$this->assertEquals(1,  BookClubListQuery::create()->count());
		$this->assertEquals(11, BookListRelQuery::create()->count());
		$this->assertEquals(12, BookQuery::create()->count());
	}

	public function testSetterCollectionWithNoData()
	{
		// Ensure no data
		BookQuery::create()->deleteAll();
		BookClubListQuery::create()->deleteAll();
		BookListRelQuery::create()->deleteAll();

		$books = new PropelObjectCollection();
		$this->assertEquals(0, $books->count());

		// Basic usage
		$bookClubList1 = new BookClubList();
		$bookClubList1->setGroupLeader('BookClubList1 Leader');
		$bookClubList1->setBooks($books);
		$bookClubList1->save();

		$this->assertEquals(0, $bookClubList1->getBooks()->count());
		$this->assertEquals(1, BookClubListQuery::create()->count());
		$this->assertEquals(0, BookQuery::create()->count());
		$this->assertEquals(0, BookListRelQuery::create()->count());
	}

	public function testSetterCollectionSavesForeignObjects()
	{
		// Ensure no data
		BookQuery::create()->deleteAll();
		BookClubListQuery::create()->deleteAll();
		BookListRelQuery::create()->deleteAll();

		$book = new Book();
		$book->setTitle('My Book');
		$book->save();

		// Modify it but don't save it
		$book->setTitle('My Title');

		$coll = new PropelObjectCollection();
		$coll[] = $book;

		BookPeer::clearInstancePool();
		$book = BookQuery::create()->findPk($book->getPrimaryKey());

		$bookClubList1 = new BookClubList();
		$bookClubList1->setBooks($coll);
		$bookClubList1->save();

		$this->assertEquals(1, $bookClubList1->getBooks()->count());
		$this->assertEquals(1, BookClubListQuery::create()->count());
		$this->assertEquals(1, BookQuery::create()->count());
		$this->assertEquals(1, BookListRelQuery::create()->count());

		$result = BookQuery::create()
			->filterById($book->getId())
			->select('Title')
			->findOne();
		$this->assertSame('My Title', $result);
	}

	public function testSetterCollectionWithNewObjects()
	{
		// Ensure no data
		BookQuery::create()->deleteAll();
		BookClubListQuery::create()->deleteAll();
		BookListRelQuery::create()->deleteAll();

		$coll = new PropelObjectCollection();
		$coll->setModel('Book');

		$coll[] = new Book();
		$coll[] = new Book();
		$coll[] = new Book();

		$bookClubList = new BookClubList();
		$bookClubList->setBooks($coll);
		$bookClubList->save();

		$this->assertEquals(3, $coll->count());
		$this->assertEquals(3, count($bookClubList->getBooks()));
		$this->assertSame($coll, $bookClubList->getBooks());
		$this->assertEquals(3, BookQuery::create()->count());
		$this->assertEquals(1, BookClubListQuery::create()->count());
		$this->assertEquals(3, BookListRelQuery::create()->count());
	}

	public function testSetterCollectionWithExistingObjects()
	{
		// Ensure no data
		BookQuery::create()->deleteAll();
		BookClubListQuery::create()->deleteAll();
		BookListRelQuery::create()->deleteAll();

		for ($i = 0; $i < 3; $i++) {
			$b = new Book();
			$b->setTitle('Book ' . $i);
			$b->save();
		}

		BookPeer::clearInstancePool();
		$books = BookQuery::create()->find();

		$bookClubList = new BookClubList();
		$bookClubList->setBooks($books);
		$bookClubList->save();

		$this->assertEquals(3, count($bookClubList->getBooks()));
		$this->assertEquals(3, BookQuery::create()->count());
		$this->assertEquals(1, BookClubListQuery::create()->count());
		$this->assertEquals(3, BookListRelQuery::create()->count());

		$i = 0;
		foreach ($bookClubList->getBooks() as $book) {
			$this->assertEquals('Book ' . $i++, $book->getTitle());
		}
	}

	public function testSetterCollectionWithEmptyCollection()
	{
		// Ensure no data
		BookQuery::create()->deleteAll();
		BookClubListQuery::create()->deleteAll();
		BookListRelQuery::create()->deleteAll();

		$bookClubList = new BookClubList();
		$bookClubList->setBooks(new PropelObjectCollection());
		$bookClubList->save();

		$this->assertEquals(0, count($bookClubList->getBooks()));

		$this->assertEquals(0, BookQuery::create()->count());
		$this->assertEquals(1, BookClubListQuery::create()->count());
		$this->assertEquals(0, BookListRelQuery::create()->count());
	}

	public function testSetterCollectionReplacesOldObjectsByNewObjects()
	{
		// Ensure no data
		BookQuery::create()->deleteAll();
		BookClubListQuery::create()->deleteAll();
		BookListRelQuery::create()->deleteAll();

		$books = new PropelObjectCollection();
		foreach (array('foo', 'bar') as $title) {
			$b = new Book();
			$b->setTitle($title);
			$books[] = $b;
		}

		$bookClubList = new BookClubList();
		$bookClubList->setBooks($books);
		$bookClubList->save();

		$books = $bookClubList->getBooks();
		$this->assertEquals('foo', $books[0]->getTitle());
		$this->assertEquals('bar', $books[1]->getTitle());

		$books = new PropelObjectCollection();
		foreach (array('bam', 'bom') as $title) {
			$b = new Book();
			$b->setTitle($title);
			$books[] = $b;
		}

		$bookClubList->setBooks($books);
		$bookClubList->save();

		$books = $bookClubList->getBooks();
		$this->assertEquals('bam', $books[0]->getTitle());
		$this->assertEquals('bom', $books[1]->getTitle());

		$this->assertEquals(1, BookClubListQuery::create()->count());
		$this->assertEquals(2, BookListRelQuery::create()->count());
		$this->assertEquals(4, BookQuery::create()->count());
	}
}
