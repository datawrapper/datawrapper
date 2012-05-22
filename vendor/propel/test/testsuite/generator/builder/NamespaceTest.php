<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../runtime/lib/Propel.php';
set_include_path(get_include_path() . PATH_SEPARATOR . realpath(dirname(__FILE__) . '/../../../fixtures/namespaced/build/classes'));

/**
 * Tests for Namespaces in generated classes class
 * Requires a build of the 'namespaced' fixture
 *
 * @version    $Revision$
 * @package    generator.builder
 */
class NamespaceTest extends PHPUnit_Framework_TestCase
{
	protected function setUp()
	{
		if (version_compare(PHP_VERSION, '5.3.0') < 0) {
			$this->markTestSkipped('Namespace support requires PHP 5.3');
		}
		parent::setUp();
		Propel::init(dirname(__FILE__) . '/../../../fixtures/namespaced/build/conf/bookstore_namespaced-conf.php');
	}

	protected function tearDown()
	{
		parent::tearDown();
		Propel::init(dirname(__FILE__) . '/../../../fixtures/bookstore/build/conf/bookstore-conf.php');
	}

	public function testInsert()
	{
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('foo');
		$book->setISBN('something');
		$book->save();
		$this->assertFalse($book->isNew());

		$publisher = new \Baz\NamespacedPublisher();
		$publisher->save();
		$this->assertFalse($publisher->isNew());
	}

	public function testUpdate()
	{
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('foo');
		$book->setISBN('something');
		$book->save();
		$book->setTitle('bar');
		$book->save();
		$this->assertFalse($book->isNew());
	}

	public function testRelate()
	{
		$author = new NamespacedAuthor();
		$author->setFirstName('Chuck');
		$author->setLastname('Norris');
		$book = new \Foo\Bar\NamespacedBook();
		$book->setNamespacedAuthor($author);
		$book->setTitle('foo');
		$book->setISBN('something');
		$book->save();
		$this->assertFalse($book->isNew());
		$this->assertFalse($author->isNew());

		$author = new NamespacedAuthor();
		$author->setFirstName('Henning');
		$author->setLastname('Mankell');
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('Mördare utan ansikte');
		$book->setISBN('1234');
		$author->addNamespacedBook($book);
		$author->save();
		$this->assertFalse($book->isNew());
		$this->assertFalse($author->isNew());

		$publisher = new \Baz\NamespacedPublisher();
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('Där vi en gång gått');
		$book->setISBN('1234');
		$book->setNamespacedPublisher($publisher);
		$book->save();
		$this->assertFalse($book->isNew());
		$this->assertFalse($publisher->isNew());
	}

	public function testBasicQuery()
	{
		\Foo\Bar\NamespacedBookQuery::create()->deleteAll();
		\Baz\NamespacedPublisherQuery::create()->deleteAll();
		$noNamespacedBook = \Foo\Bar\NamespacedBookQuery::create()->findOne();
		$this->assertNull($noNamespacedBook);
		$noPublihser = \Baz\NamespacedPublisherQuery::create()->findOne();
		$this->assertNull($noPublihser);
	}

	public function testFind()
	{
		\Foo\Bar\NamespacedBookQuery::create()->deleteAll();
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('War And Peace');
		$book->setISBN('1234');
		$book->save();
		$book2 = \Foo\Bar\NamespacedBookQuery::create()->findPk($book->getId());
		$this->assertEquals($book, $book2);
		$book3 = \Foo\Bar\NamespacedBookQuery::create()->findOneByTitle($book->getTitle());
		$this->assertEquals($book, $book3);
	}

	public function testGetRelatedManyToOne()
	{
		\Foo\Bar\NamespacedBookQuery::create()->deleteAll();
		\Baz\NamespacedPublisherQuery::create()->deleteAll();
		$publisher = new \Baz\NamespacedPublisher();
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('Something');
		$book->setISBN('1234');
		$book->setNamespacedPublisher($publisher);
		$book->save();
		\Foo\Bar\NamespacedBookPeer::clearInstancePool();
		\Baz\NamespacedPublisherPeer::clearInstancePool();
		$book2 = \Foo\Bar\NamespacedBookQuery::create()->findPk($book->getId());
		$publisher2 = $book2->getNamespacedPublisher();
		$this->assertEquals($publisher->getId(), $publisher2->getId());
	}

	public function testGetRelatedOneToMany()
	{
		\Foo\Bar\NamespacedBookQuery::create()->deleteAll();
		\Baz\NamespacedPublisherQuery::create()->deleteAll();
		$author = new NamespacedAuthor();
		$author->setFirstName('Foo');
		$author->setLastName('Bar');
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('Quux');
		$book->setISBN('1235');
		$book->setNamespacedAuthor($author);
		$book->save();
		\Foo\Bar\NamespacedBookPeer::clearInstancePool();
		NamespacedAuthorPeer::clearInstancePool();
		$author2 = NamespacedAuthorQuery::create()->findPk($author->getId());
		$book2 = $author2->getNamespacedBooks()->getFirst();
		$this->assertEquals($book->getId(), $book2->getId());
	}

	public function testFindWithManyToOne()
	{
		\Foo\Bar\NamespacedBookQuery::create()->deleteAll();
		\Baz\NamespacedPublisherQuery::create()->deleteAll();
		$publisher = new \Baz\NamespacedPublisher();
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('asdf');
		$book->setISBN('something');
		$book->setNamespacedPublisher($publisher);
		$book->save();
		\Foo\Bar\NamespacedBookPeer::clearInstancePool();
		\Baz\NamespacedPublisherPeer::clearInstancePool();
		$book2 = \Foo\Bar\NamespacedBookQuery::create()
			->joinWith('NamespacedPublisher')
			->findPk($book->getId());
		$publisher2 = $book2->getNamespacedPublisher();
		$this->assertEquals($publisher->getId(), $publisher2->getId());
	}

	public function testFindWithOneToMany()
	{
		\Foo\Bar\NamespacedBookQuery::create()->deleteAll();
		NamespacedAuthorQuery::create()->deleteAll();
		$author = new NamespacedAuthor();
		$author->setFirstName('Foo');
		$author->setLastName('Bar');
		$book = new \Foo\Bar\NamespacedBook();
		$book->setTitle('asdf');
		$book->setISBN('something');
		$book->setNamespacedAuthor($author);
		$book->save();
		\Foo\Bar\NamespacedBookPeer::clearInstancePool();
		NamespacedAuthorPeer::clearInstancePool();
		$author2 = NamespacedAuthorQuery::create()
			->joinWith('NamespacedBook')
			->findPk($author->getId());
		$book2 = $author2->getNamespacedBooks()->getFirst();
		$this->assertEquals($book->getId(), $book2->getId());
	}

	public function testSingleTableInheritance()
	{
		\Foo\Bar\NamespacedBookstoreEmployeeQuery::create()->deleteAll();
		$emp = new \Foo\Bar\NamespacedBookstoreEmployee();
		$emp->setName('Henry');
		$emp->save();
		$man = new \Foo\Bar\NamespacedBookstoreManager();
		$man->setName('John');
		$man->save();
		$cas = new \Foo\Bar\NamespacedBookstoreCashier();
		$cas->setName('William');
		$cas->save();
		$emps = \Foo\Bar\NamespacedBookstoreEmployeeQuery::create()
			->orderByName()
			->find();
		$this->assertEquals(3, count($emps));
		$this->assertTrue($emps[0] instanceof \Foo\Bar\NamespacedBookstoreEmployee);
		$this->assertTrue($emps[1] instanceof \Foo\Bar\NamespacedBookstoreManager);
		$this->assertTrue($emps[2] instanceof \Foo\Bar\NamespacedBookstoreCashier);
		$nbMan = \Foo\Bar\NamespacedBookstoreManagerQuery::create()
			->count();
		$this->assertEquals(1, $nbMan);
	}

	public function testManyToMany()
	{
		\Foo\Bar\NamespacedBookQuery::create()->deleteAll();
		\Baz\NamespacedBookClubQuery::create()->deleteAll();
		NamespacedBookListRelQuery::create()->deleteAll();
		$book1 = new \Foo\Bar\NamespacedBook();
		$book1->setTitle('bar');
		$book1->setISBN('1234');
		$book1->save();
		$book2 = new \Foo\Bar\NamespacedBook();
		$book2->setTitle('foo');
		$book2->setISBN('4567');
		$book2->save();
		$bookClub1 = new \Baz\NamespacedBookClub();
		$bookClub1->addNamespacedBook($book1);
		$bookClub1->addNamespacedBook($book2);
		$bookClub1->setGroupLeader('Someone1');
		$bookClub1->save();
		$bookClub2 = new \Baz\NamespacedBookClub();
		$bookClub2->addNamespacedBook($book1);
		$bookClub2->setGroupLeader('Someone2');
		$bookClub2->save();
		$this->assertEquals(2, $book1->countNamespacedBookClubs());
		$this->assertEquals(1, $book2->countNamespacedBookClubs());
		$nbRels = NamespacedBookListRelQuery::create()->count();
		$this->assertEquals(3, $nbRels);
		$con = Propel::getConnection(NamespacedBookListRelPeer::DATABASE_NAME);
		$books = \Foo\Bar\NamespacedBookQuery::create()
			->orderByTitle()
			->joinWith('NamespacedBookListRel')
			->joinWith('NamespacedBookListRel.NamespacedBookClub')
			->find($con);
	}

	public function testUseQuery()
	{
		$book = \Foo\Bar\NamespacedBookQuery::create()
			->useNamespacedPublisherQuery()
				->filterByName('foo')
			->endUse()
			->findOne();
		$this->assertNull($book);
	}

}
