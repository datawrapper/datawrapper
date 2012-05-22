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
 * Test class for PropelObjectCollection.
 *
 * @author     Francois Zaninotto
 * @version    $Id: PropelObjectCollectionTest.php 1348 2009-12-03 21:49:00Z francois $
 * @package    runtime.collection
 */
class PropelArrayCollectionTest extends BookstoreEmptyTestBase
{
	protected function setUp()
	{
		parent::setUp();
		BookstoreDataPopulator::populate($this->con);
	}

	public function testSave()
	{
		$books = PropelQuery::from('Book')->setFormatter(ModelCriteria::FORMAT_ARRAY)->find();
		foreach ($books as &$book) {
			$book['Title'] = 'foo';
		}
		$books->save();
		// check that the modifications are persisted
		BookPeer::clearInstancePool();
		$books = PropelQuery::from('Book')->find();
		foreach ($books as $book) {
			$this->assertEquals('foo', $book->getTitle('foo'));
		}
	}

	/**
	 * @expectedException PropelException
	 */
	public function testSaveOnReadOnlyEntityThrowsException()
	{
		$col = new PropelArrayCollection();
		$col->setModel('ContestView');
		$cv = new ContestView();
		$col []= $cv;
		$col->save();
	}

	public function testDelete()
	{
		$books = PropelQuery::from('Book')->setFormatter(ModelCriteria::FORMAT_ARRAY)->find();
		$books->delete();
		// check that the modifications are persisted
		BookPeer::clearInstancePool();
		$books = PropelQuery::from('Book')->find();
		$this->assertEquals(0, count($books));
	}

	/**
	 * @expectedException PropelException
	 */
	public function testDeleteOnReadOnlyEntityThrowsException()
	{
		$col = new PropelArrayCollection();
		$col->setModel('ContestView');
		$cv = new ContestView();
		$cv->setNew(false);
		$col []= $cv;
		$col->delete();
	}

	public function testGetPrimaryKeys()
	{
		$books = PropelQuery::from('Book')->setFormatter(ModelCriteria::FORMAT_ARRAY)->find();
		$pks = $books->getPrimaryKeys();
		$this->assertEquals(4, count($pks));

		$keys = array('Book_0', 'Book_1', 'Book_2', 'Book_3');
		$this->assertEquals($keys, array_keys($pks));

		$pks = $books->getPrimaryKeys(false);
		$keys = array(0, 1, 2, 3);
		$this->assertEquals($keys, array_keys($pks));

		$bookObjects = PropelQuery::from('Book')->find();
		foreach ($pks as $key => $value) {
			$this->assertEquals($bookObjects[$key]->getPrimaryKey(), $value);
		}
	}

	public function testFromArray()
	{
		$author = new Author();
		$author->setFirstName('Jane');
		$author->setLastName('Austen');
		$author->save();
		$books = array(
			array('Title' => 'Mansfield Park', 'AuthorId' => $author->getId()),
			array('Title' => 'Pride And PRejudice', 'AuthorId' => $author->getId())
		);
		$col = new PropelArrayCollection();
		$col->setModel('Book');
		$col->fromArray($books);
		$col->save();

		$nbBooks = PropelQuery::from('Book')->count();
		$this->assertEquals(6, $nbBooks);

		$booksByJane = PropelQuery::from('Book b')
			->join('b.Author a')
			->where('a.LastName = ?', 'Austen')
			->count();
		$this->assertEquals(2, $booksByJane);
	}

	public function testToArray()
	{
		$books = PropelQuery::from('Book')->setFormatter(ModelCriteria::FORMAT_ARRAY)->find();
		$booksArray = $books->toArray();
		$this->assertEquals(4, count($booksArray));

		$bookObjects = PropelQuery::from('Book')->find();
		foreach ($booksArray as $key => $book) {
			$this->assertEquals($bookObjects[$key]->toArray(), $book);
		}

		$booksArray = $books->toArray();
		$keys = array(0, 1, 2, 3);
		$this->assertEquals($keys, array_keys($booksArray));

		$booksArray = $books->toArray(null, true);
		$keys = array('Book_0', 'Book_1', 'Book_2', 'Book_3');
		$this->assertEquals($keys, array_keys($booksArray));

		$booksArray = $books->toArray('Title');
		$keys = array('Harry Potter and the Order of the Phoenix', 'Quicksilver', 'Don Juan', 'The Tin Drum');
		$this->assertEquals($keys, array_keys($booksArray));

		$booksArray = $books->toArray('Title', true);
		$keys = array('Book_Harry Potter and the Order of the Phoenix', 'Book_Quicksilver', 'Book_Don Juan', 'Book_The Tin Drum');
		$this->assertEquals($keys, array_keys($booksArray));
	}

	public function testToArrayDeep()
	{
		$author = new Author();
		$author->setId(5678);
		$author->setFirstName('George');
		$author->setLastName('Byron');
		$book = new Book();
		$book->setId(9012);
		$book->setTitle('Don Juan');
		$book->setISBN('0140422161');
		$book->setPrice(12.99);
		$book->setAuthor($author);

		$coll = new PropelArrayCollection();
		$coll->setModel('Book');
		$coll[]= $book->toArray(BasePeer::TYPE_PHPNAME, true, array(), true);
		$expected = array(array(
			'Id' => 9012,
			'Title' => 'Don Juan',
			'ISBN' => '0140422161',
			'Price' => 12.99,
			'PublisherId' => null,
			'AuthorId' => 5678,
			'Author' => array(
				'Id' => 5678,
				'FirstName' => 'George',
				'LastName' => 'Byron',
				'Email' => null,
				'Age' => null,
				'Books' => array(
					'Book_0' => '*RECURSION*',
				)
			),
		));
		$this->assertEquals($expected, $coll->toArray());
	}

	public function getWorkerObject()
	{
		$col = new TestablePropelArrayCollection();
		$col->setModel('Book');
		$book = $col->getWorkerObject();
		$this->assertTrue($book instanceof Book, 'getWorkerObject() returns an object of the collection model');
		$book->foo = 'bar';
		$this->assertEqual('bar', $col->getWorkerObject()->foo, 'getWorkerObject() returns always the same object');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testGetWorkerObjectNoModel()
	{
		$col = new TestablePropelArrayCollection();
		$col->getWorkerObject();
	}

}

class TestablePropelArrayCollection extends PropelArrayCollection
{
	public function getWorkerObject()
	{
		return parent::getWorkerObject();
	}
}