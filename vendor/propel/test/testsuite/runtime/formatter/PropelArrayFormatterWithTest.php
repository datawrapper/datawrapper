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
 * Test class for PropelArrayFormatter when Criteria uses with().
 *
 * @author     Francois Zaninotto
 * @version    $Id: PropelArrayFormatterWithTest.php 1348 2009-12-03 21:49:00Z francois $
 * @package    runtime.formatter
 */
class PropelArrayFormatterWithTest extends BookstoreEmptyTestBase
{
	protected function assertCorrectHydration1($c, $msg)
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$book = $c->findOne($con);
		$count = $con->getQueryCount();
		$this->assertEquals($book['Title'], 'Don Juan', 'Main object is correctly hydrated ' . $msg);
		$author = $book['Author'];
		$this->assertEquals($author['LastName'], 'Byron', 'Related object is correctly hydrated ' . $msg);
		$publisher = $book['Publisher'];
		$this->assertEquals($publisher['Name'], 'Penguin', 'Related object is correctly hydrated ' . $msg);
	}

	public function testFindOneWith()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->orderBy('Book.Title');
		$c->join('Book.Author');
		$c->with('Author');
		$c->join('Book.Publisher');
		$c->with('Publisher');
		$this->assertCorrectHydration1($c, 'without instance pool');
	}

	public function testFindOneWithAlias()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->orderBy('Book.Title');
		$c->join('Book.Author a');
		$c->with('a');
		$c->join('Book.Publisher p');
		$c->with('p');
		$this->assertCorrectHydration1($c, 'with alias');
	}

	public function testFindOneWithMainAlias()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->setModelAlias('b', true);
		$c->orderBy('b.Title');
		$c->join('b.Author a');
		$c->with('a');
		$c->join('b.Publisher p');
		$c->with('p');
		$this->assertCorrectHydration1($c, 'with main alias');
	}

	public function testFindOneWithUsingInstancePool()
	{
		BookstoreDataPopulator::populate();
		// instance pool contains all objects by default, since they were just populated
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->orderBy('Book.Title');
		$c->join('Book.Author');
		$c->with('Author');
		$c->join('Book.Publisher');
		$c->with('Publisher');
		$this->assertCorrectHydration1($c, 'with instance pool');
	}

	public function testFindOneWithEmptyLeftJoin()
	{
		// save a book with no author
		$b = new Book();
		$b->setTitle('Foo');
		$b->save();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->where('Book.Title = ?', 'Foo');
		$c->leftJoin('Book.Author');
		$c->with('Author');
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$book = $c->findOne($con);
		$count = $con->getQueryCount();
		$author = $book['Author'];
		$this->assertEquals(array(), $author, 'Related object is not hydrated if empty');
	}

	public function testFindOneWithRelationName()
	{
		BookstoreDataPopulator::populate();
		BookstoreEmployeePeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'BookstoreEmployee');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->join('BookstoreEmployee.Supervisor s');
		$c->with('s');
		$c->where('s.Name = ?', 'John');
		$emp = $c->findOne();
		$this->assertEquals($emp['Name'], 'Pieter', 'Main object is correctly hydrated');
		$sup = $emp['Supervisor'];
		$this->assertEquals($sup['Name'], 'John', 'Related object is correctly hydrated');
	}

	/**
	 * @see http://www.propelorm.org/ticket/959
	 */
	public function testFindOneWithSameRelatedObject()
	{
		BookPeer::doDeleteAll();
		AuthorPeer::doDeleteAll();
		$auth = new Author();
		$auth->setFirstName('John');
		$auth->save();
		$book1 = new Book();
		$book1->setTitle('Hello');
		$book1->setAuthor($auth);
		$book1->save();
		$book2 = new Book();
		$book2->setTitle('World');
		$book2->setAuthor($auth);
		$book2->save();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();

		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->join('Book.Author');
		$c->with('Author');
		$books = $c->find();

		$this->assertEquals(2, count($books));
		$firstBook = $books[0];
		$this->assertTrue(isset($firstBook['Author']));
		$secondBook = $books[1];
		$this->assertTrue(isset($secondBook['Author']));
	}

	public function testFindOneWithDuplicateRelation()
	{
		EssayPeer::doDeleteAll();
		$auth1 = new Author();
		$auth1->setFirstName('John');
		$auth1->save();
		$auth2 = new Author();
		$auth2->setFirstName('Jack');
		$auth2->save();
		$essay = new Essay();
		$essay->setTitle('Foo');
		$essay->setFirstAuthor($auth1->getId());
		$essay->setSecondAuthor($auth2->getId());
		$essay->save();
		AuthorPeer::clearInstancePool();
		EssayPeer::clearInstancePool();

		$c = new ModelCriteria('bookstore', 'Essay');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->join('Essay.AuthorRelatedByFirstAuthor');
		$c->with('AuthorRelatedByFirstAuthor');
		$c->where('Essay.Title = ?', 'Foo');
		$essay = $c->findOne();
		$this->assertEquals($essay['Title'], 'Foo', 'Main object is correctly hydrated');
		$firstAuthor = $essay['AuthorRelatedByFirstAuthor'];
		$this->assertEquals($firstAuthor['FirstName'], 'John', 'Related object is correctly hydrated');
		$this->assertFalse(array_key_exists('AuthorRelatedBySecondAuthor', $essay), 'Only related object specified in with() is hydrated');
	}

	public function testFindOneWithDistantClass()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Review');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->where('Review.Recommended = ?', true);
		$c->join('Review.Book');
		$c->with('Book');
		$c->join('Book.Author');
		$c->with('Author');
		$review = $c->findOne();
		$this->assertEquals($review['ReviewedBy'], 'Washington Post', 'Main object is correctly hydrated');
		$book = $review['Book'];
		$this->assertEquals('Harry Potter and the Order of the Phoenix', $book['Title'], 'Related object is correctly hydrated');
		$author = $book['Author'];
		$this->assertEquals('J.K.', $author['FirstName'], 'Related object is correctly hydrated');
	}

	public function testFindOneWithDistantClassRenamedRelation()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		Propel::enableInstancePooling();
		$c = new ModelCriteria('bookstore', 'BookSummary');
		$c->joinWith('BookSummary.SummarizedBook');
		$c->joinWith('SummarizedBook.Author');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$summary = $c->findOne($con);
		$count = $con->getQueryCount();
		$this->assertEquals('Harry Potter does some amazing magic!', $summary['Summary'], 'Main object is correctly hydrated');
		$book = $summary['SummarizedBook'];
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals('Harry Potter and the Order of the Phoenix', $book['Title'], 'Related object is correctly hydrated');
		$author = $book['Author'];
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals('J.K.', $author['FirstName'], 'Related object is correctly hydrated');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testFindOneWithOneToManyAndLimit()
	{
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->add(BookPeer::ISBN, '043935806X');
		$c->leftJoin('Book.Review');
		$c->with('Review');
		$c->limit(5);
		$books = $c->find();
	}

	public function testFindOneWithOneToMany()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->add(BookPeer::ISBN, '043935806X');
		$c->leftJoin('Book.Review');
		$c->with('Review');
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$books = $c->find($con);
		$this->assertEquals(1, count($books), 'with() does not duplicate the main object');
		$book = $books[0];
		$this->assertEquals($book['Title'], 'Harry Potter and the Order of the Phoenix', 'Main object is correctly hydrated');
		$this->assertEquals(array('Id', 'Title', 'ISBN', 'Price', 'PublisherId', 'AuthorId', 'Reviews'), array_keys($book), 'with() adds a plural index for the one to many relationship');
		$reviews = $book['Reviews'];
		$this->assertEquals(2, count($reviews), 'Related objects are correctly hydrated');
		$review1 = $reviews[0];
		$this->assertEquals(array('Id', 'ReviewedBy', 'ReviewDate', 'Recommended', 'Status', 'BookId'), array_keys($review1), 'with() Related objects are correctly hydrated');
	}

	public function testFindOneWithOneToManyCustomOrder()
	{
		$author1 = new Author();
		$author1->setFirstName('AA');
		$author2 = new Author();
		$author2->setFirstName('BB');
		$book1 = new Book();
		$book1->setTitle('Aaa');
		$book1->setAuthor($author1);
		$book1->save();
		$book2 = new Book();
		$book2->setTitle('Bbb');
		$book2->setAuthor($author2);
		$book2->save();
		$book3 = new Book();
		$book3->setTitle('Ccc');
		$book3->setAuthor($author1);
		$book3->save();
		$authors = AuthorQuery::create()
			->setFormatter(ModelCriteria::FORMAT_ARRAY)
			->leftJoin('Author.Book')
			->orderBy('Book.Title')
			->with('Book')
			->find();
		$this->assertEquals(2, count($authors), 'with() used on a many-to-many doesn\'t change the main object count');
	}

	public function testFindOneWithOneToManyThenManyToOne()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Author');
		$c->add(AuthorPeer::LAST_NAME, 'Rowling');
		$c->leftJoinWith('Author.Book');
		$c->leftJoinWith('Book.Review');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$authors = $c->find($con);
		$this->assertEquals(1, count($authors), 'with() does not duplicate the main object');
		$rowling = $authors[0];
		$this->assertEquals($rowling['FirstName'], 'J.K.', 'Main object is correctly hydrated');
		$books = $rowling['Books'];
		$this->assertEquals(1, count($books), 'Related objects are correctly hydrated');
		$book = $books[0];
		$this->assertEquals($book['Title'], 'Harry Potter and the Order of the Phoenix', 'Related object is correctly hydrated');
		$reviews = $book['Reviews'];
		$this->assertEquals(2, count($reviews), 'Related objects are correctly hydrated');
	}

	public function testFindOneWithOneToManyThenManyToOneUsingAlias()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Author');
		$c->add(AuthorPeer::LAST_NAME, 'Rowling');
		$c->leftJoinWith('Author.Book b');
		$c->leftJoinWith('b.Review r');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$authors = $c->find($con);
		$this->assertEquals(1, count($authors), 'with() does not duplicate the main object');
		$rowling = $authors[0];
		$this->assertEquals($rowling['FirstName'], 'J.K.', 'Main object is correctly hydrated');
		$books = $rowling['Books'];
		$this->assertEquals(1, count($books), 'Related objects are correctly hydrated');
		$book = $books[0];
		$this->assertEquals($book['Title'], 'Harry Potter and the Order of the Phoenix', 'Related object is correctly hydrated');
		$reviews = $book['Reviews'];
		$this->assertEquals(2, count($reviews), 'Related objects are correctly hydrated');
	}

	public function testFindWithLeftJoinWithOneToManyAndNullObject()
	{
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$freud = new Author();
		$freud->setFirstName("Sigmund");
		$freud->setLastName("Freud");
		$freud->save($this->con);
		$c = new ModelCriteria('bookstore', 'Author');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->add(AuthorPeer::LAST_NAME, 'Freud');
		$c->leftJoinWith('Author.Book');
		$c->leftJoinWith('Book.Review');
		// should not raise a notice
		$authors = $c->find($this->con);
		$this->assertTrue(true);
	}

	public function testFindWithLeftJoinWithManyToOneAndNullObject()
	{
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$review = new Review();
		$review->save($this->con);
		$c = new ModelCriteria('bookstore', 'Review');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->leftJoinWith('Review.Book');
		$c->leftJoinWith('Book.Author');
		// should not raise a notice
		$reviews = $c->find($this->con);
		$this->assertTrue(true);
	}

	public function testFindOneWithColumn()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->filterByTitle('The Tin Drum');
		$c->join('Book.Author');
		$c->withColumn('Author.FirstName', 'AuthorName');
		$c->withColumn('Author.LastName', 'AuthorName2');
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$book = $c->findOne($con);
		$this->assertEquals(array('Id', 'Title', 'ISBN', 'Price', 'PublisherId', 'AuthorId', 'AuthorName', 'AuthorName2'), array_keys($book), 'withColumn() do not change the resulting model class');
		$this->assertEquals('The Tin Drum', $book['Title']);
		$this->assertEquals('Gunter', $book['AuthorName'], 'PropelArrayFormatter adds withColumns as columns');
		$this->assertEquals('Grass', $book['AuthorName2'], 'PropelArrayFormatter correctly hydrates all as columns');
	}

	public function testFindOneWithClassAndColumn()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ARRAY);
		$c->filterByTitle('The Tin Drum');
		$c->join('Book.Author');
		$c->withColumn('Author.FirstName', 'AuthorName');
		$c->withColumn('Author.LastName', 'AuthorName2');
		$c->with('Author');
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$book = $c->findOne($con);
		$this->assertEquals(array('Id', 'Title', 'ISBN', 'Price', 'PublisherId', 'AuthorId', 'Author', 'AuthorName', 'AuthorName2'), array_keys($book), 'withColumn() do not change the resulting model class');
		$this->assertEquals('The Tin Drum', $book['Title']);
		$this->assertEquals('Gunter', $book['Author']['FirstName'], 'PropelArrayFormatter correctly hydrates withclass and columns');
		$this->assertEquals('Gunter', $book['AuthorName'], 'PropelArrayFormatter adds withColumns as columns');
		$this->assertEquals('Grass', $book['AuthorName2'], 'PropelArrayFormatter correctly hydrates all as columns');
	}

	public function testFindPkWithOneToMany()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$book = BookQuery::create()
			->findOneByTitle('Harry Potter and the Order of the Phoenix', $con);
		$pk = $book->getPrimaryKey();
		BookPeer::clearInstancePool();
		$book = BookQuery::create()
			->setFormatter(ModelCriteria::FORMAT_ARRAY)
			->joinWith('Review')
			->findPk($pk, $con);
		$reviews = $book['Reviews'];
		$this->assertEquals(2, count($reviews), 'Related objects are correctly hydrated');
	}
}
