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
 * Test class for PropelOnDemandFormatter when Criteria uses with().
 *
 * @author     Francois Zaninotto
 * @version    $Id: PropelOnDemandFormatterWithTest.php 1348 2009-12-03 21:49:00Z francois $
 * @package    runtime.formatter
 */
class PropelOnDemandFormatterWithTest extends BookstoreEmptyTestBase
{
	protected function assertCorrectHydration1($c, $msg)
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c->limit(1);
		$books = $c->find($con);
		foreach ($books as $book) {
			break;
		}
		$count = $con->getQueryCount();
		$this->assertEquals($book->getTitle(), 'Don Juan', 'Main object is correctly hydrated ' . $msg);
		$author = $book->getAuthor();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query ' . $msg);
		$this->assertEquals($author->getLastName(), 'Byron', 'Related object is correctly hydrated ' . $msg);
		$publisher = $book->getPublisher();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query ' . $msg);
		$this->assertEquals($publisher->getName(), 'Penguin', 'Related object is correctly hydrated ' . $msg);
	}

	public function testFindOneWith()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
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
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
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
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
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
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
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
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
		$c->where('Book.Title = ?', 'Foo');
		$c->leftJoin('Book.Author');
		$c->with('Author');
		$c->limit(1);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$books = $c->find($con);
		foreach ($books as $book) {
			break;
		}
		$count = $con->getQueryCount();
		$author = $book->getAuthor();
		$this->assertNull($author, 'Related object is not hydrated if empty');
	}

	public function testFindOneWithRelationName()
	{
		BookstoreDataPopulator::populate();
		BookstoreEmployeePeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'BookstoreEmployee');
		$c->join('BookstoreEmployee.Supervisor s');
		$c->with('s');
		$c->where('s.Name = ?', 'John');
		$c->limit(1);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$emps = $c->find($con);
		foreach ($emps as $emp) {
			break;
		}
		$count = $con->getQueryCount();
		$this->assertEquals($emp->getName(), 'Pieter', 'Main object is correctly hydrated');
		$sup = $emp->getSupervisor();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals($sup->getName(), 'John', 'Related object is correctly hydrated');
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
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
		$c->join('Essay.AuthorRelatedByFirstAuthor');
		$c->with('AuthorRelatedByFirstAuthor');
		$c->where('Essay.Title = ?', 'Foo');
		$c->limit(1);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$essays = $c->find($con);
		foreach ($essays as $essay) {
			break;
		}
		$count = $con->getQueryCount();
		$this->assertEquals($essay->getTitle(), 'Foo', 'Main object is correctly hydrated');
		$firstAuthor = $essay->getAuthorRelatedByFirstAuthor();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals($firstAuthor->getFirstName(), 'John', 'Related object is correctly hydrated');
		$secondAuthor = $essay->getAuthorRelatedBySecondAuthor();
		$this->assertEquals($count + 1, $con->getQueryCount(), 'with() does not hydrate objects not in with');
	}

	public function testFindOneWithDistantClass()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Review');
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
		$c->where('Review.Recommended = ?', true);
		$c->join('Review.Book');
		$c->with('Book');
		$c->join('Book.Author');
		$c->with('Author');
		$c->limit(1);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$reviews = $c->find($con);
		foreach ($reviews as $review) {
			break;
		}
		$count = $con->getQueryCount();
		$this->assertEquals($review->getReviewedBy(), 'Washington Post', 'Main object is correctly hydrated');
		$book = $review->getBook();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals('Harry Potter and the Order of the Phoenix', $book->getTitle(), 'Related object is correctly hydrated');
		$author = $book->getAuthor();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals('J.K.', $author->getFirstName(), 'Related object is correctly hydrated');
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
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$summary = $c->findOne($con);
		$count = $con->getQueryCount();
		$this->assertEquals('Harry Potter does some amazing magic!', $summary->getSummary(), 'Main object is correctly hydrated');
		$book = $summary->getSummarizedBook();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals('Harry Potter and the Order of the Phoenix', $book->getTitle(), 'Related object is correctly hydrated');
		$author = $book->getAuthor();
		$this->assertEquals($count, $con->getQueryCount(), 'with() hydrates the related objects to save a query');
		$this->assertEquals('J.K.', $author->getFirstName(), 'Related object is correctly hydrated');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testFindOneWithOneToMany()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
		$c->add(BookPeer::ISBN, '043935806X');
		$c->leftJoin('Book.Review');
		$c->with('Review');
		$books = $c->find();
	}

	public function testFindWithLeftJoinWithManyToOneAndNullObject()
	{
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$review = new Review();
		$review->save($this->con);
		$c = new ModelCriteria('bookstore', 'Review');
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
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
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
		$c->filterByTitle('The Tin Drum');
		$c->join('Book.Author');
		$c->withColumn('Author.FirstName', 'AuthorName');
		$c->withColumn('Author.LastName', 'AuthorName2');
		$c->limit(1);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$books = $c->find($con);
		foreach ($books as $book) {
			break;
		}
		$this->assertTrue($book instanceof Book, 'withColumn() do not change the resulting model class');
		$this->assertEquals('The Tin Drum', $book->getTitle());
		$this->assertEquals('Gunter', $book->getVirtualColumn('AuthorName'), 'PropelObjectFormatter adds withColumns as virtual columns');
		$this->assertEquals('Grass', $book->getVirtualColumn('AuthorName2'), 'PropelObjectFormatter correctly hydrates all virtual columns');
		$this->assertEquals('Gunter', $book->getAuthorName(), 'PropelObjectFormatter adds withColumns as virtual columns');
	}

	public function testFindOneWithClassAndColumn()
	{
		BookstoreDataPopulator::populate();
		BookPeer::clearInstancePool();
		AuthorPeer::clearInstancePool();
		ReviewPeer::clearInstancePool();
		$c = new ModelCriteria('bookstore', 'Book');
		$c->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
		$c->filterByTitle('The Tin Drum');
		$c->join('Book.Author');
		$c->withColumn('Author.FirstName', 'AuthorName');
		$c->withColumn('Author.LastName', 'AuthorName2');
		$c->with('Author');
		$c->limit(1);
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$books = $c->find($con);
		foreach ($books as $book) {
			break;
		}
		$this->assertTrue($book instanceof Book, 'withColumn() do not change the resulting model class');
		$this->assertEquals('The Tin Drum', $book->getTitle());
		$this->assertTrue($book->getAuthor() instanceof Author, 'PropelObjectFormatter correctly hydrates with class');
		$this->assertEquals('Gunter', $book->getAuthor()->getFirstName(), 'PropelObjectFormatter correctly hydrates with class');
		$this->assertEquals('Gunter', $book->getVirtualColumn('AuthorName'), 'PropelObjectFormatter adds withColumns as virtual columns');
		$this->assertEquals('Grass', $book->getVirtualColumn('AuthorName2'), 'PropelObjectFormatter correctly hydrates all virtual columns');
	}
}
