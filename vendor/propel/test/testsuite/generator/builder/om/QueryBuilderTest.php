<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreDataPopulator.php';

/**
 * Test class for QueryBuilder.
 *
 * @author     François Zaninotto
 * @version    $Id: QueryBuilderTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    generator.builder.om
 */
class QueryBuilderTest extends BookstoreTestBase
{

    public function testExtends()
    {
        $q = new BookQuery();
        $this->assertTrue($q instanceof ModelCriteria, 'Model query extends ModelCriteria');
    }

    public function testConstructor()
    {
        $query = new BookQuery();
        $this->assertEquals($query->getDbName(), 'bookstore', 'Constructor sets dabatase name');
        $this->assertEquals($query->getModelName(), 'Book', 'Constructor sets model name');
    }

    public function testCreate()
    {
        $query = BookQuery::create();
        $this->assertTrue($query instanceof BookQuery, 'create() returns an object of its class');
        $this->assertEquals($query->getDbName(), 'bookstore', 'create() sets dabatase name');
        $this->assertEquals($query->getModelName(), 'Book', 'create() sets model name');
        $query = BookQuery::create('foo');
        $this->assertTrue($query instanceof BookQuery, 'create() returns an object of its class');
        $this->assertEquals($query->getDbName(), 'bookstore', 'create() sets dabatase name');
        $this->assertEquals($query->getModelName(), 'Book', 'create() sets model name');
        $this->assertEquals($query->getModelAlias(), 'foo', 'create() can set the model alias');
    }

    public function testCreateCustom()
    {
        // see the myBookQuery class definition at the end of this file
        $query = myCustomBookQuery::create();
        $this->assertTrue($query instanceof myCustomBookQuery, 'create() returns an object of its class');
        $this->assertTrue($query instanceof BookQuery, 'create() returns an object of its class');
        $this->assertEquals($query->getDbName(), 'bookstore', 'create() sets dabatase name');
        $this->assertEquals($query->getModelName(), 'Book', 'create() sets model name');
        $query = myCustomBookQuery::create('foo');
        $this->assertTrue($query instanceof myCustomBookQuery, 'create() returns an object of its class');
        $this->assertEquals($query->getDbName(), 'bookstore', 'create() sets dabatase name');
        $this->assertEquals($query->getModelName(), 'Book', 'create() sets model name');
        $this->assertEquals($query->getModelAlias(), 'foo', 'create() can set the model alias');
    }

    public function testBasePreSelect()
    {
        $method = new ReflectionMethod('Table2Query', 'basePreSelect');
        $this->assertEquals('ModelCriteria', $method->getDeclaringClass()->getName(), 'BaseQuery does not override basePreSelect() by default');

        $method = new ReflectionMethod('Table3Query', 'basePreSelect');
        $this->assertEquals('BaseTable3Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides basePreSelect() when a behavior is registered');
    }

    public function testBasePreDelete()
    {
        $method = new ReflectionMethod('Table2Query', 'basePreDelete');
        $this->assertEquals('ModelCriteria', $method->getDeclaringClass()->getName(), 'BaseQuery does not override basePreDelete() by default');

        $method = new ReflectionMethod('Table3Query', 'basePreDelete');
        $this->assertEquals('BaseTable3Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides basePreDelete() when a behavior is registered');
    }

    public function testBasePostDelete()
    {
        $method = new ReflectionMethod('Table2Query', 'basePostDelete');
        $this->assertEquals('ModelCriteria', $method->getDeclaringClass()->getName(), 'BaseQuery does not override basePostDelete() by default');

        $method = new ReflectionMethod('Table3Query', 'basePostDelete');
        $this->assertEquals('BaseTable3Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides basePostDelete() when a behavior is registered');
    }

    public function testBasePreUpdate()
    {
        $method = new ReflectionMethod('Table2Query', 'basePreUpdate');
        $this->assertEquals('ModelCriteria', $method->getDeclaringClass()->getName(), 'BaseQuery does not override basePreUpdate() by default');

        $method = new ReflectionMethod('Table3Query', 'basePreUpdate');
        $this->assertEquals('BaseTable3Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides basePreUpdate() when a behavior is registered');
    }

    public function testBasePostUpdate()
    {
        $method = new ReflectionMethod('Table2Query', 'basePostUpdate');
        $this->assertEquals('ModelCriteria', $method->getDeclaringClass()->getName(), 'BaseQuery does not override basePostUpdate() by default');

        $method = new ReflectionMethod('Table3Query', 'basePostUpdate');
        $this->assertEquals('BaseTable3Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides basePostUpdate() when a behavior is registered');
    }

    public function testQuery()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        $q = new BookQuery();
        $book = $q
            ->setModelAlias('b')
            ->where('b.Title like ?', 'Don%')
            ->orderBy('b.ISBN', 'desc')
            ->findOne();
        $this->assertTrue($book instanceof Book);
        $this->assertEquals('Don Juan', $book->getTitle());
    }

    public function testFindPk()
    {
        $method = new ReflectionMethod('Table4Query', 'findPk');
        $this->assertEquals('BaseTable4Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides findPk()');
    }

    public function testFindOneById()
    {
        $method = new ReflectionMethod('Table4Query', 'findOneById');
        $this->assertEquals('BaseTable4Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides findOneById()');
    }

    public function testFindPkReturnsCorrectObjectForSimplePrimaryKey()
    {
        $b = new Book();
        $b->setTitle('bar');
        $b->setIsbn('2342');
        $b->save($this->con);
        $count = $this->con->getQueryCount();

        BookPeer::clearInstancePool();

        $book = BookQuery::create()->findPk($b->getId(), $this->con);
        $this->assertEquals($b, $book);
        $this->assertEquals($count+1, $this->con->getQueryCount(), 'findPk() issues a database query when instance is not in pool');
    }

    public function testFindPkUsesInstancePoolingForSimplePrimaryKey()
    {
        $b = new Book();
        $b->setTitle('foo');
        $b->setIsbn('2342');
        $b->save($this->con);
        $count = $this->con->getQueryCount();

        $book = BookQuery::create()->findPk($b->getId(), $this->con);
        $this->assertSame($b, $book);
        $this->assertEquals($count, $this->con->getQueryCount(), 'findPk() does not issue a database query when instance is in pool');
    }

    public function testFindPkReturnsCorrectObjectForCompositePrimaryKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        // save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
        $c = new ModelCriteria('bookstore', 'Book');
        $books = $c->find();
        foreach ($books as $book) {
            $book->save();
        }

        BookPeer::clearInstancePool();

        // retrieve the test data
        $c = new ModelCriteria('bookstore', 'BookListRel');
        $bookListRelTest = $c->findOne();
        $pk = $bookListRelTest->getPrimaryKey();

        $q = new BookListRelQuery();
        $bookListRel = $q->findPk($pk);
        $this->assertEquals($bookListRelTest, $bookListRel, 'BaseQuery overrides findPk() for composite primary keysto make it faster');
    }

    public function testFindPkUsesFindPkSimpleOnEmptyQueries()
    {
        BookQuery::create()->findPk(123, $this->con);
        $expected = 'SELECT id, title, isbn, price, publisher_id, author_id FROM book WHERE id = 123';
        $this->assertEquals($expected, $this->con->getLastExecutedQuery());
    }

    public function testFindPkSimpleAddsObjectToInstancePool()
    {
        $b = new Book();
        $b->setTitle('foo');
        $b->setIsbn('2342');
        $b->save($this->con);
        BookPeer::clearInstancePool();

        BookQuery::create()->findPk($b->getId(), $this->con);
        $count = $this->con->getQueryCount();

        $book = BookQuery::create()->findPk($b->getId(), $this->con);
        $this->assertEquals($b, $book);
        $this->assertEquals($count, $this->con->getQueryCount());
    }

    public function testFindOneByIdAddsObjectToInstancePool()
    {
        $b = new Book();
        $b->setTitle('foo');
        $b->setIsbn('2342');
        $b->save($this->con);
        BookPeer::clearInstancePool();

        BookQuery::create()->findOneById($b->getId(), $this->con);
        $count = $this->con->getQueryCount();

        $book = BookQuery::create()->findOneById($b->getId(), $this->con);
        $this->assertEquals($b, $book);
        $this->assertEquals($count, $this->con->getQueryCount());
    }

    public function testFindPkUsesFindPkComplexOnNonEmptyQueries()
    {
        BookQuery::create('b')->findPk(123, $this->con);
        $expected = 'SELECT book.id, book.title, book.isbn, book.price, book.publisher_id, book.author_id FROM `book` WHERE book.id=123';
        $this->assertEquals($expected, $this->con->getLastExecutedQuery());
    }

    public function testFindPkComplexAddsObjectToInstancePool()
    {
        $b = new Book();
        $b->setTitle('foo');
        $b->setIsbn('2345');
        $b->save($this->con);
        BookPeer::clearInstancePool();

        BookQuery::create('b')->findPk($b->getId(), $this->con);
        $count = $this->con->getQueryCount();

        $book = BookQuery::create()->findPk($b->getId(), $this->con);
        $this->assertEquals($b, $book);
        $this->assertEquals($count, $this->con->getQueryCount());
    }

    public function testFindPkCallsPreSelect()
    {
        $q = new mySecondBookQuery();
        $this->assertFalse($q::$preSelectWasCalled);
        $q->findPk(123);
        $this->assertTrue($q::$preSelectWasCalled);
    }

    public function testFindPkDoesNotCallPreSelectWhenUsingInstancePool()
    {
        $b = new Book();
        $b->setTitle('foo');
        $b->setIsbn('1245');
        $b->save();

        $q = new mySecondBookQuery();
        $this->assertFalse($q::$preSelectWasCalled);
        $q->findPk($b->getId());
        $this->assertFalse($q::$preSelectWasCalled);
    }

    public function testFindPks()
    {
        $method = new ReflectionMethod('Table4Query', 'findPks');
        $this->assertEquals('BaseTable4Query', $method->getDeclaringClass()->getName(), 'BaseQuery overrides findPks()');
    }

    public function testFindPksSimpleKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        BookPeer::clearInstancePool();

        // prepare the test data
        $c = new ModelCriteria('bookstore', 'Book');
        $c->orderBy('Book.Id', 'desc');
        $testBooks = $c->find();
        $testBook1 = $testBooks->pop();
        $testBook2 = $testBooks->pop();

        $q = new BookQuery();
        $books = $q->findPks(array($testBook1->getId(), $testBook2->getId()));
        $this->assertEquals(array($testBook1, $testBook2), $books->getData(), 'BaseQuery overrides findPks() to make it faster');
    }

    public function testFindPksCompositeKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        // save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
        $c = new ModelCriteria('bookstore', 'Book');
        $books = $c->find();
        foreach ($books as $book) {
            $book->save();
        }

        BookPeer::clearInstancePool();

        // retrieve the test data
        $c = new ModelCriteria('bookstore', 'BookListRel');
        $bookListRelTest = $c->find();
        $search = array();
        foreach ($bookListRelTest as $obj) {
            $search[]= $obj->getPrimaryKey();
        }

        $q = new BookListRelQuery();
        $objs = $q->findPks($search);
        $this->assertEquals($bookListRelTest, $objs, 'BaseQuery overrides findPks() for composite primary keys to make it work');
    }

    public function testFilterBy()
    {
        foreach (BookPeer::getFieldNames(BasePeer::TYPE_PHPNAME) as $colName) {
            $filterMethod = 'filterBy' . $colName;
            $this->assertTrue(method_exists('BookQuery', $filterMethod), 'QueryBuilder adds filterByColumn() methods for every column');
            $q = BookQuery::create()->$filterMethod(1);
            $this->assertTrue($q instanceof BookQuery, 'filterByColumn() returns the current query instance');
        }
    }

    public function testFilterByPrimaryKeySimpleKey()
    {
        $q = BookQuery::create()->filterByPrimaryKey(12);
        $q1 = BookQuery::create()->add(BookPeer::ID, 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByPrimaryKey() translates to a Criteria::EQUAL in the PK column');

        $q = BookQuery::create()->setModelAlias('b', true)->filterByPrimaryKey(12);
        $q1 = BookQuery::create()->setModelAlias('b', true)->add('b.id', 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByPrimaryKey() uses true table alias if set');
    }

    public function testFilterByPrimaryKeyCompositeKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        // save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
        $c = new ModelCriteria('bookstore', 'Book');
        $books = $c->find();
        foreach ($books as $book) {
            $book->save();
        }

        BookPeer::clearInstancePool();

        // retrieve the test data
        $c = new ModelCriteria('bookstore', 'BookListRel');
        $bookListRelTest = $c->findOne();
        $pk = $bookListRelTest->getPrimaryKey();

        $q = new BookListRelQuery();
        $q->filterByPrimaryKey($pk);

        $q1 = BookListRelQuery::create()
            ->add(BookListRelPeer::BOOK_ID, $pk[0], Criteria::EQUAL)
            ->add(BookListRelPeer::BOOK_CLUB_LIST_ID, $pk[1], Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByPrimaryKey() translates to a Criteria::EQUAL in the PK columns');
    }

    public function testFilterByPrimaryKeysSimpleKey()
    {
        $q = BookQuery::create()->filterByPrimaryKeys(array(10, 11, 12));
        $q1 = BookQuery::create()->add(BookPeer::ID, array(10, 11, 12), Criteria::IN);
        $this->assertEquals($q1, $q, 'filterByPrimaryKeys() translates to a Criteria::IN on the PK column');

        $q = BookQuery::create()->setModelAlias('b', true)->filterByPrimaryKeys(array(10, 11, 12));
        $q1 = BookQuery::create()->setModelAlias('b', true)->add('b.id', array(10, 11, 12), Criteria::IN);
        $this->assertEquals($q1, $q, 'filterByPrimaryKeys() uses true table alias if set');
    }

    public function testFilterByPrimaryKeysCompositeKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        // save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
        $c = new ModelCriteria('bookstore', 'Book');
        $books = $c->find();
        foreach ($books as $book) {
            $book->save();
        }

        BookPeer::clearInstancePool();

        // retrieve the test data
        $c = new ModelCriteria('bookstore', 'BookListRel');
        $bookListRelTest = $c->find();
        $search = array();
        foreach ($bookListRelTest as $obj) {
            $search[]= $obj->getPrimaryKey();
        }

        $q = new BookListRelQuery();
        $q->filterByPrimaryKeys($search);

        $q1 = BookListRelQuery::create();
        foreach ($search as $key) {
            $cton0 = $q1->getNewCriterion(BookListRelPeer::BOOK_ID, $key[0], Criteria::EQUAL);
            $cton1 = $q1->getNewCriterion(BookListRelPeer::BOOK_CLUB_LIST_ID, $key[1], Criteria::EQUAL);
            $cton0->addAnd($cton1);
            $q1->addOr($cton0);
        }
        $this->assertEquals($q1, $q, 'filterByPrimaryKeys() translates to a series of Criteria::EQUAL in the PK columns');

        $q = new BookListRelQuery();
        $q->filterByPrimaryKeys(array());

        $q1 = BookListRelQuery::create();
        $q1->add(null, '1<>1', Criteria::CUSTOM);
        $this->assertEquals($q1, $q, 'filterByPrimaryKeys() translates to an always failing test on empty arrays');

    }

    public function testFilterByIntegerPk()
    {
        $q = BookQuery::create()->filterById(12);
        $q1 = BookQuery::create()->add(BookPeer::ID, 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByPkColumn() translates to a Criteria::EQUAL by default');

        $q = BookQuery::create()->filterById(12, Criteria::NOT_EQUAL);
        $q1 = BookQuery::create()->add(BookPeer::ID, 12, Criteria::NOT_EQUAL);
        $this->assertEquals($q1, $q, 'filterByPkColumn() accepts an optional comparison operator');

        $q = BookQuery::create()->setModelAlias('b', true)->filterById(12);
        $q1 = BookQuery::create()->setModelAlias('b', true)->add('b.id', 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByPkColumn() uses true table alias if set');

        $q = BookQuery::create()->filterById(array(10, 11, 12));
        $q1 = BookQuery::create()->add(BookPeer::ID, array(10, 11, 12), Criteria::IN);
        $this->assertEquals($q1, $q, 'filterByPkColumn() translates to a Criteria::IN when passed a simple array key');

        $q = BookQuery::create()->filterById(array(10, 11, 12), Criteria::NOT_IN);
        $q1 = BookQuery::create()->add(BookPeer::ID, array(10, 11, 12), Criteria::NOT_IN);
        $this->assertEquals($q1, $q, 'filterByPkColumn() accepts a comparison when passed a simple array key');
    }

    public function testFilterByNumber()
    {
        $q = BookQuery::create()->filterByPrice(12);
        $q1 = BookQuery::create()->add(BookPeer::PRICE, 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByNumColumn() translates to a Criteria::EQUAL by default');

        $q = BookQuery::create()->filterByPrice(12, Criteria::NOT_EQUAL);
        $q1 = BookQuery::create()->add(BookPeer::PRICE, 12, Criteria::NOT_EQUAL);
        $this->assertEquals($q1, $q, 'filterByNumColumn() accepts an optional comparison operator');

        $q = BookQuery::create()->setModelAlias('b', true)->filterByPrice(12);
        $q1 = BookQuery::create()->setModelAlias('b', true)->add('b.price', 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByNumColumn() uses true table alias if set');

        $q = BookQuery::create()->filterByPrice(array(10, 11, 12));
        $q1 = BookQuery::create()->add(BookPeer::PRICE, array(10, 11, 12), Criteria::IN);
        $this->assertEquals($q1, $q, 'filterByNumColumn() translates to a Criteria::IN when passed a simple array key');

        $q = BookQuery::create()->filterByPrice(array(10, 11, 12), Criteria::NOT_IN);
        $q1 = BookQuery::create()->add(BookPeer::PRICE, array(10, 11, 12), Criteria::NOT_IN);
        $this->assertEquals($q1, $q, 'filterByNumColumn() accepts a comparison when passed a simple array key');

        $q = BookQuery::create()->filterByPrice(array('min' => 10));
        $q1 = BookQuery::create()->add(BookPeer::PRICE, 10, Criteria::GREATER_EQUAL);
        $this->assertEquals($q1, $q, 'filterByNumColumn() translates to a Criteria::GREATER_EQUAL when passed a \'min\' key');

        $q = BookQuery::create()->filterByPrice(array('max' => 12));
        $q1 = BookQuery::create()->add(BookPeer::PRICE, 12, Criteria::LESS_EQUAL);
        $this->assertEquals($q1, $q, 'filterByNumColumn() translates to a Criteria::LESS_EQUAL when passed a \'max\' key');

        $q = BookQuery::create()->filterByPrice(array('min' => 10, 'max' => 12));
        $q1 = BookQuery::create()
            ->add(BookPeer::PRICE, 10, Criteria::GREATER_EQUAL)
            ->addAnd(BookPeer::PRICE, 12, Criteria::LESS_EQUAL);
        $this->assertEquals($q1, $q, 'filterByNumColumn() translates to a between when passed both a \'min\' and a \'max\' key');
    }

    public function testFilterByTimestamp()
    {
        $q = BookstoreEmployeeAccountQuery::create()->filterByCreated(12);
        $q1 = BookstoreEmployeeAccountQuery::create()->add(BookstoreEmployeeAccountPeer::CREATED, 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByDateColumn() translates to a Criteria::EQUAL by default');

        $q = BookstoreEmployeeAccountQuery::create()->filterByCreated(12, Criteria::NOT_EQUAL);
        $q1 = BookstoreEmployeeAccountQuery::create()->add(BookstoreEmployeeAccountPeer::CREATED, 12, Criteria::NOT_EQUAL);
        $this->assertEquals($q1, $q, 'filterByDateColumn() accepts an optional comparison operator');

        $q = BookstoreEmployeeAccountQuery::create()->setModelAlias('b', true)->filterByCreated(12);
        $q1 = BookstoreEmployeeAccountQuery::create()->setModelAlias('b', true)->add('b.created', 12, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByDateColumn() uses true table alias if set');

        $q = BookstoreEmployeeAccountQuery::create()->filterByCreated(array('min' => 10));
        $q1 = BookstoreEmployeeAccountQuery::create()->add(BookstoreEmployeeAccountPeer::CREATED, 10, Criteria::GREATER_EQUAL);
        $this->assertEquals($q1, $q, 'filterByDateColumn() translates to a Criteria::GREATER_EQUAL when passed a \'min\' key');

        $q = BookstoreEmployeeAccountQuery::create()->filterByCreated(array('max' => 12));
        $q1 = BookstoreEmployeeAccountQuery::create()->add(BookstoreEmployeeAccountPeer::CREATED, 12, Criteria::LESS_EQUAL);
        $this->assertEquals($q1, $q, 'filterByDateColumn() translates to a Criteria::LESS_EQUAL when passed a \'max\' key');

        $q = BookstoreEmployeeAccountQuery::create()->filterByCreated(array('min' => 10, 'max' => 12));
        $q1 = BookstoreEmployeeAccountQuery::create()
            ->add(BookstoreEmployeeAccountPeer::CREATED, 10, Criteria::GREATER_EQUAL)
            ->addAnd(BookstoreEmployeeAccountPeer::CREATED, 12, Criteria::LESS_EQUAL);
        $this->assertEquals($q1, $q, 'filterByDateColumn() translates to a between when passed both a \'min\' and a \'max\' key');
    }

    public function testFilterByString()
    {
        $q = BookQuery::create()->filterByTitle('foo');
        $q1 = BookQuery::create()->add(BookPeer::TITLE, 'foo', Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByStringColumn() translates to a Criteria::EQUAL by default');

        $q = BookQuery::create()->filterByTitle('foo', Criteria::NOT_EQUAL);
        $q1 = BookQuery::create()->add(BookPeer::TITLE, 'foo', Criteria::NOT_EQUAL);
        $this->assertEquals($q1, $q, 'filterByStringColumn() accepts an optional comparison operator');

        $q = BookQuery::create()->setModelAlias('b', true)->filterByTitle('foo');
        $q1 = BookQuery::create()->setModelAlias('b', true)->add('b.title', 'foo', Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByStringColumn() uses true table alias if set');

        $q = BookQuery::create()->filterByTitle(array('foo', 'bar'));
        $q1 = BookQuery::create()->add(BookPeer::TITLE, array('foo', 'bar'), Criteria::IN);
        $this->assertEquals($q1, $q, 'filterByStringColumn() translates to a Criteria::IN when passed an array');

        $q = BookQuery::create()->filterByTitle(array('foo', 'bar'), Criteria::NOT_IN);
        $q1 = BookQuery::create()->add(BookPeer::TITLE, array('foo', 'bar'), Criteria::NOT_IN);
        $this->assertEquals($q1, $q, 'filterByStringColumn() accepts a comparison when passed an array');

        $q = BookQuery::create()->filterByTitle('foo%');
        $q1 = BookQuery::create()->add(BookPeer::TITLE, 'foo%', Criteria::LIKE);
        $this->assertEquals($q1, $q, 'filterByStringColumn() translates to a Criteria::LIKE when passed a string with a % wildcard');

        $q = BookQuery::create()->filterByTitle('foo%', Criteria::NOT_LIKE);
        $q1 = BookQuery::create()->add(BookPeer::TITLE, 'foo%', Criteria::NOT_LIKE);
        $this->assertEquals($q1, $q, 'filterByStringColumn() accepts a comparison when passed a string with a % wildcard');

        $q = BookQuery::create()->filterByTitle('foo%', Criteria::EQUAL);
        $q1 = BookQuery::create()->add(BookPeer::TITLE, 'foo%', Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByStringColumn() accepts a comparison when passed a string with a % wildcard');

        $q = BookQuery::create()->filterByTitle('*foo');
        $q1 = BookQuery::create()->add(BookPeer::TITLE, '%foo', Criteria::LIKE);
        $this->assertEquals($q1, $q, 'filterByStringColumn() translates to a Criteria::LIKE when passed a string with a * wildcard, and turns * into %');

        $q = BookQuery::create()->filterByTitle('*f%o*o%');
        $q1 = BookQuery::create()->add(BookPeer::TITLE, '%f%o%o%', Criteria::LIKE);
        $this->assertEquals($q1, $q, 'filterByStringColumn() translates to a Criteria::LIKE when passed a string with mixed wildcards, and turns *s into %s');
    }

    public function testFilterByBoolean()
    {
        $q = ReviewQuery::create()->filterByRecommended(true);
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, true, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a Criteria::EQUAL by default');

        $q = ReviewQuery::create()->filterByRecommended(true, Criteria::NOT_EQUAL);
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, true, Criteria::NOT_EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() accepts an optional comparison operator');

        $q = ReviewQuery::create()->filterByRecommended(false);
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, false, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a Criteria::EQUAL by default');

        $q = ReviewQuery::create()->setModelAlias('b', true)->filterByRecommended(true);
        $q1 = ReviewQuery::create()->setModelAlias('b', true)->add('b.recommended', true, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() uses true table alias if set');

        $q = ReviewQuery::create()->filterByRecommended('true');
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, true, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a = true when passed a true string');

        $q = ReviewQuery::create()->filterByRecommended('yes');
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, true, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a = true when passed a true string');

        $q = ReviewQuery::create()->filterByRecommended('1');
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, true, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a = true when passed a true string');

        $q = ReviewQuery::create()->filterByRecommended('false');
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, false, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a = false when passed a false string');

        $q = ReviewQuery::create()->filterByRecommended('no');
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, false, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a = false when passed a false string');

        $q = ReviewQuery::create()->filterByRecommended('0');
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, false, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a = false when passed a false string');

        $q = ReviewQuery::create()->filterByRecommended('');
        $q1 = ReviewQuery::create()->add(ReviewPeer::RECOMMENDED, false, Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByBooleanColumn() translates to a = false when passed an empty string');

    }

    public function testFilterByFk()
    {
        $this->assertTrue(method_exists('BookQuery', 'filterByAuthor'), 'QueryBuilder adds filterByFk() methods');
        $this->assertTrue(method_exists('BookQuery', 'filterByPublisher'), 'QueryBuilder adds filterByFk() methods for all fkeys');

        $this->assertTrue(method_exists('EssayQuery', 'filterByAuthorRelatedByFirstAuthor'), 'QueryBuilder adds filterByFk() methods for several fkeys on the same table');
        $this->assertTrue(method_exists('EssayQuery', 'filterByAuthorRelatedBySecondAuthor'), 'QueryBuilder adds filterByFk() methods for several fkeys on the same table');
    }

    public function testFilterByFkSimpleKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        // prepare the test data
        $testBook = BookQuery::create()
            ->innerJoin('Book.Author') // just in case there are books with no author
            ->findOne();
        $testAuthor = $testBook->getAuthor();

        $book = BookQuery::create()
            ->filterByAuthor($testAuthor)
            ->findOne();
        $this->assertEquals($testBook, $book, 'Generated query handles filterByFk() methods correctly for simple fkeys');

        $q = BookQuery::create()->filterByAuthor($testAuthor);
        $q1 = BookQuery::create()->add(BookPeer::AUTHOR_ID, $testAuthor->getId(), Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByFk() translates to a Criteria::EQUAL by default');

        $q = BookQuery::create()->filterByAuthor($testAuthor, Criteria::NOT_EQUAL);
        $q1 = BookQuery::create()->add(BookPeer::AUTHOR_ID, $testAuthor->getId(), Criteria::NOT_EQUAL);
        $this->assertEquals($q1, $q, 'filterByFk() accepts an optional comparison operator');
    }

    public function testFilterByFkCompositeKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();
        BookstoreDataPopulator::populateOpinionFavorite();

        // prepare the test data
        $testOpinion = BookOpinionQuery::create()
            ->innerJoin('BookOpinion.ReaderFavorite') // just in case there are books with no author
            ->findOne();
        $testFavorite = $testOpinion->getReaderFavorite();

        $favorite = ReaderFavoriteQuery::create()
            ->filterByBookOpinion($testOpinion)
            ->findOne();
        $this->assertEquals($testFavorite, $favorite, 'Generated query handles filterByFk() methods correctly for composite fkeys');
    }

    public function testFilterByFkObjectCollection()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $authors = AuthorQuery::create()
            ->orderByFirstName()
            ->limit(2)
            ->find($this->con);

        $books = BookQuery::create()
            ->filterByAuthor($authors)
            ->find($this->con);
        $q1 = $this->con->getLastExecutedQuery();

        $books = BookQuery::create()
            ->add(BookPeer::AUTHOR_ID, $authors->getPrimaryKeys(), Criteria::IN)
            ->find($this->con);
        $q2 = $this->con->getLastExecutedQuery();

        $this->assertEquals($q2, $q1, 'filterByFk() accepts a collection and results to an IN query');
    }

    public function testFilterByRefFk()
    {
        $this->assertTrue(method_exists('BookQuery', 'filterByReview'), 'QueryBuilder adds filterByRefFk() methods');
        $this->assertTrue(method_exists('BookQuery', 'filterByMedia'), 'QueryBuilder adds filterByRefFk() methods for all fkeys');

        $this->assertTrue(method_exists('AuthorQuery', 'filterByEssayRelatedByFirstAuthor'), 'QueryBuilder adds filterByRefFk() methods for several fkeys on the same table');
        $this->assertTrue(method_exists('AuthorQuery', 'filterByEssayRelatedBySecondAuthor'), 'QueryBuilder adds filterByRefFk() methods for several fkeys on the same table');
    }

    public function testFilterByRefFkSimpleKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        // prepare the test data
        $testBook = BookQuery::create()
            ->innerJoin('Book.Author') // just in case there are books with no author
            ->findOne();
        $testAuthor = $testBook->getAuthor();

        $author = AuthorQuery::create()
            ->filterByBook($testBook)
            ->findOne();
        $this->assertEquals($testAuthor, $author, 'Generated query handles filterByRefFk() methods correctly for simple fkeys');

        $q = AuthorQuery::create()->filterByBook($testBook);
        $q1 = AuthorQuery::create()->add(AuthorPeer::ID, $testBook->getAuthorId(), Criteria::EQUAL);
        $this->assertEquals($q1, $q, 'filterByRefFk() translates to a Criteria::EQUAL by default');

        $q = AuthorQuery::create()->filterByBook($testBook, Criteria::NOT_EQUAL);
        $q1 = AuthorQuery::create()->add(AuthorPeer::ID, $testBook->getAuthorId(), Criteria::NOT_EQUAL);
        $this->assertEquals($q1, $q, 'filterByRefFk() accepts an optional comparison operator');
    }

    public function testFilterByRelationNameCompositePk()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        $testLabel = RecordLabelQuery::create()
            ->limit(2)
            ->find($this->con);

        $testRelease = ReleasePoolQuery::create()
            ->addJoin(ReleasePoolPeer::RECORD_LABEL_ID, RecordLabelPeer::ID)
            ->filterByRecordLabel($testLabel)
            ->find($this->con);
        $q1 = $this->con->getLastExecutedQuery();

        $releasePool = ReleasePoolQuery::create()
            ->addJoin(ReleasePoolPeer::RECORD_LABEL_ID, RecordLabelPeer::ID)
            ->add(ReleasePoolPeer::RECORD_LABEL_ID, $testLabel->toKeyValue('Id', 'Id'), Criteria::IN)
            ->find($this->con);
        $q2 = $this->con->getLastExecutedQuery();

        $this->assertEquals($q2, $q1, 'filterBy{RelationName}() only accepts arguments of type {RelationName} or PropelCollection');
        $this->assertEquals($releasePool, $testRelease);
    }

    public function testFilterByRefFkCompositeKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();
        BookstoreDataPopulator::populateOpinionFavorite();

        // prepare the test data
        $testOpinion = BookOpinionQuery::create()
            ->innerJoin('BookOpinion.ReaderFavorite') // just in case there are books with no author
            ->findOne();
        $testFavorite = $testOpinion->getReaderFavorite();

        $opinion = BookOpinionQuery::create()
            ->filterByReaderFavorite($testFavorite)
            ->findOne();
        $this->assertEquals($testOpinion, $opinion, 'Generated query handles filterByRefFk() methods correctly for composite fkeys');
    }

    public function testFilterByRefFkObjectCollection()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $books = BookQuery::create()
            ->orderByTitle()
            ->limit(2)
            ->find($this->con);

        $authors = AuthorQuery::create()
            ->filterByBook($books)
            ->find($this->con);
        $q1 = $this->con->getLastExecutedQuery();

        $authors = AuthorQuery::create()
            ->addJoin(AuthorPeer::ID, BookPeer::AUTHOR_ID, Criteria::LEFT_JOIN)
            ->add(BookPeer::ID, $books->getPrimaryKeys(), Criteria::IN)
            ->find($this->con);
        $q2 = $this->con->getLastExecutedQuery();

        $this->assertEquals($q2, $q1, 'filterByRefFk() accepts a collection and results to an IN query in the joined table');
    }

    public function testFilterByCrossFK()
    {
        $this->assertTrue(method_exists('BookQuery', 'filterByBookClubList'), 'Generated query handles filterByCrossRefFK() for many-to-many relationships');
        $this->assertFalse(method_exists('BookQuery', 'filterByBook'), 'Generated query handles filterByCrossRefFK() for many-to-many relationships');
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();
        $blc1 = BookClubListQuery::create()->findOneByGroupLeader('Crazyleggs');
        $nbBooks = BookQuery::create()
            ->filterByBookClubList($blc1)
            ->count();
        $this->assertEquals(2, $nbBooks, 'Generated query handles filterByCrossRefFK() methods correctly');
    }

    public function testJoinFk()
    {
        $q = BookQuery::create()
            ->joinAuthor();
        $q1 = BookQuery::create()
            ->join('Book.Author', Criteria::LEFT_JOIN);
        $this->assertTrue($q->equals($q1), 'joinFk() translates to a left join on non-required columns');

        $q = BookSummaryQuery::create()
            ->joinSummarizedBook();
        $q1 = BookSummaryQuery::create()
            ->join('BookSummary.SummarizedBook', Criteria::INNER_JOIN);
        $this->assertTrue($q->equals($q1), 'joinFk() translates to an inner join on required columns');

        $q = BookQuery::create()
            ->joinAuthor('a');
        $q1 = BookQuery::create()
            ->join('Book.Author a', Criteria::LEFT_JOIN);
        $this->assertTrue($q->equals($q1), 'joinFk() accepts a relation alias as first parameter');

        $q = BookQuery::create()
            ->joinAuthor('', Criteria::INNER_JOIN);
        $q1 = BookQuery::create()
            ->join('Book.Author', Criteria::INNER_JOIN);
        $this->assertTrue($q->equals($q1), 'joinFk() accepts a join type as second parameter');

        $q = EssayQuery::create()
            ->joinAuthorRelatedBySecondAuthor();
        $q1 = EssayQuery::create()
            ->join('Essay.AuthorRelatedBySecondAuthor', "INNER JOIN");
        $this->assertTrue($q->equals($q1), 'joinFk() translates to a "INNER JOIN" when this is defined as defaultJoin in the schema');
    }

    public function testJoinFkAlias()
    {
        $q = BookQuery::create('b')
            ->joinAuthor('a');
        $q1 = BookQuery::create('b')
            ->join('b.Author a', Criteria::LEFT_JOIN);
        $this->assertTrue($q->equals($q1), 'joinFk() works fine with table aliases');

        $q = BookQuery::create()
            ->setModelAlias('b', true)
            ->joinAuthor('a');
        $q1 = BookQuery::create()
            ->setModelAlias('b', true)
            ->join('b.Author a', Criteria::LEFT_JOIN);
        $this->assertTrue($q->equals($q1), 'joinFk() works fine with true table aliases');
    }

    public function testJoinRefFk()
    {
        $q = AuthorQuery::create()
            ->joinBook();
        $q1 = AuthorQuery::create()
            ->join('Author.Book', Criteria::LEFT_JOIN);
        $this->assertTrue($q->equals($q1), 'joinRefFk() translates to a left join on non-required columns');

        $q = BookQuery::create()
            ->joinBookSummary();
        $q1 = BookQuery::create()
            ->join('Book.BookSummary', Criteria::INNER_JOIN);
        $this->assertTrue($q->equals($q1), 'joinRefFk() translates to an inner join on required columns');

        $q = AuthorQuery::create()
            ->joinBook('b');
        $q1 = AuthorQuery::create()
            ->join('Author.Book b', Criteria::LEFT_JOIN);
        $this->assertTrue($q->equals($q1), 'joinRefFk() accepts a relation alias as first parameter');

        $q = AuthorQuery::create()
            ->joinBook('', Criteria::INNER_JOIN);
        $q1 = AuthorQuery::create()
            ->join('Author.Book', Criteria::INNER_JOIN);
        $this->assertTrue($q->equals($q1), 'joinRefFk() accepts a join type as second parameter');

        $q = AuthorQuery::create()
            ->joinEssayRelatedBySecondAuthor();
        $q1 = AuthorQuery::create()
            ->join('Author.EssayRelatedBySecondAuthor', Criteria::INNER_JOIN);
        $this->assertTrue($q->equals($q1), 'joinRefFk() translates to a "INNER JOIN" when this is defined as defaultJoin in the schema');
    }

    public function testUseFkQuerySimple()
    {
        $q = BookQuery::create()
            ->useAuthorQuery()
                ->filterByFirstName('Leo')
            ->endUse();
        $q1 = BookQuery::create()
            ->join('Book.Author', Criteria::LEFT_JOIN)
            ->add(AuthorPeer::FIRST_NAME, 'Leo', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() translates to a condition on a left join on non-required columns');

        $q = BookSummaryQuery::create()
            ->useSummarizedBookQuery()
                ->filterByTitle('War And Peace')
            ->endUse();
        $q1 = BookSummaryQuery::create()
            ->join('BookSummary.SummarizedBook', Criteria::INNER_JOIN)
            ->add(BookPeer::TITLE, 'War And Peace', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() translates to a condition on an inner join on required columns');
    }

    public function testUseFkQueryJoinType()
    {
        $q = BookQuery::create()
            ->useAuthorQuery(null, Criteria::LEFT_JOIN)
                ->filterByFirstName('Leo')
            ->endUse();
        $q1 = BookQuery::create()
            ->join('Book.Author', Criteria::LEFT_JOIN)
            ->add(AuthorPeer::FIRST_NAME, 'Leo', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() accepts a join type as second parameter');
    }

    public function testUseFkQueryAlias()
    {
        $q = BookQuery::create()
            ->useAuthorQuery('a')
                ->filterByFirstName('Leo')
            ->endUse();
        $join = new ModelJoin();
        $join->setJoinType(Criteria::LEFT_JOIN);
        $join->setTableMap(AuthorPeer::getTableMap());
        $join->setRelationMap(BookPeer::getTableMap()->getRelation('Author'), null, 'a');
        $join->setRelationAlias('a');
        $q1 = BookQuery::create()
            ->addAlias('a', AuthorPeer::TABLE_NAME)
            ->addJoinObject($join, 'a')
            ->add('a.first_name', 'Leo', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() uses the first argument as a table alias');
    }

    public function testUseFkQueryMixed()
    {
        $q = BookQuery::create()
            ->useAuthorQuery()
                ->filterByFirstName('Leo')
            ->endUse()
            ->filterByTitle('War And Peace');
        $q1 = BookQuery::create()
            ->join('Book.Author', Criteria::LEFT_JOIN)
            ->add(AuthorPeer::FIRST_NAME, 'Leo', Criteria::EQUAL)
            ->add(BookPeer::TITLE, 'War And Peace', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() allows combining conditions on main and related query');
    }

    public function testUseFkQueryTwice()
    {
        $q = BookQuery::create()
            ->useAuthorQuery()
                ->filterByFirstName('Leo')
            ->endUse()
            ->useAuthorQuery()
                ->filterByLastName('Tolstoi')
            ->endUse();
        $q1 = BookQuery::create()
            ->join('Book.Author', Criteria::LEFT_JOIN)
            ->add(AuthorPeer::FIRST_NAME, 'Leo', Criteria::EQUAL)
            ->add(AuthorPeer::LAST_NAME, 'Tolstoi', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() called twice on the same relation does not create two joins');
    }

    public function testUseFkQueryTwiceTwoAliases()
    {
        $q = BookQuery::create()
            ->useAuthorQuery('a')
                ->filterByFirstName('Leo')
            ->endUse()
            ->useAuthorQuery('b')
                ->filterByLastName('Tolstoi')
            ->endUse();
        $join1 = new ModelJoin();
        $join1->setJoinType(Criteria::LEFT_JOIN);
        $join1->setTableMap(AuthorPeer::getTableMap());
        $join1->setRelationMap(BookPeer::getTableMap()->getRelation('Author'), null, 'a');
        $join1->setRelationAlias('a');
        $join2 = new ModelJoin();
        $join2->setJoinType(Criteria::LEFT_JOIN);
        $join2->setTableMap(AuthorPeer::getTableMap());
        $join2->setRelationMap(BookPeer::getTableMap()->getRelation('Author'), null, 'b');
        $join2->setRelationAlias('b');
        $q1 = BookQuery::create()
            ->addAlias('a', AuthorPeer::TABLE_NAME)
            ->addJoinObject($join1, 'a')
            ->add('a.first_name', 'Leo', Criteria::EQUAL)
            ->addAlias('b', AuthorPeer::TABLE_NAME)
            ->addJoinObject($join2, 'b')
            ->add('b.last_name', 'Tolstoi', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() called twice on the same relation with two aliases creates two joins');
    }

    public function testUseFkQueryNested()
    {
        $q = ReviewQuery::create()
            ->useBookQuery()
                ->useAuthorQuery()
                    ->filterByFirstName('Leo')
                ->endUse()
            ->endUse();
        $q1 = ReviewQuery::create()
            ->join('Review.Book', Criteria::LEFT_JOIN)
            ->join('Book.Author', Criteria::LEFT_JOIN)
            ->add(AuthorPeer::FIRST_NAME, 'Leo', Criteria::EQUAL);
        // embedded queries create joins that keep a relation to the parent
        // as this is not testable, we need to use another testing technique
        $params = array();
        $result = BasePeer::createSelectSql($q, $params);
        $expectedParams = array();
        $expectedResult = BasePeer::createSelectSql($q1, $expectedParams);
        $this->assertEquals($expectedParams, $params, 'useFkQuery() called nested creates two joins');
        $this->assertEquals($expectedResult, $result, 'useFkQuery() called nested creates two joins');
    }

    public function testUseFkQueryTwoRelations()
    {
        $q = BookQuery::create()
            ->useAuthorQuery()
                ->filterByFirstName('Leo')
            ->endUse()
            ->usePublisherQuery()
                ->filterByName('Penguin')
            ->endUse();
        $q1 = BookQuery::create()
            ->join('Book.Author', Criteria::LEFT_JOIN)
            ->add(AuthorPeer::FIRST_NAME, 'Leo', Criteria::EQUAL)
            ->join('Book.Publisher', Criteria::LEFT_JOIN)
            ->add(PublisherPeer::NAME, 'Penguin', Criteria::EQUAL);
        $this->assertTrue($q->equals($q1), 'useFkQuery() called twice on two relations creates two joins');
    }

    public function testUseFkQueryNoAliasThenWith()
    {
        $con = Propel::getConnection();
        $books = BookQuery::create()
            ->useAuthorQuery()
                ->filterByFirstName('Leo')
            ->endUse()
            ->with('Author')
            ->find($con);
        $q1 = $con->getLastExecutedQuery();
        $books = BookQuery::create()
            ->leftJoinWithAuthor()
            ->add(AuthorPeer::FIRST_NAME, 'Leo', Criteria::EQUAL)
            ->find($con);
        $q2 = $con->getLastExecutedQuery();
        $this->assertEquals($q1, $q2, 'with() can be used after a call to useFkQuery() with no alias');
    }

    public function testPrune()
    {
        $q = BookQuery::create()->prune();
        $this->assertTrue($q instanceof BookQuery, 'prune() returns the current Query object');
    }

    public function testPruneSimpleKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        $nbBooks = BookQuery::create()->prune()->count();
        $this->assertEquals(4, $nbBooks, 'prune() does nothing when passed a null object');

        $testBook = BookQuery::create()->findOne();
        $nbBooks = BookQuery::create()->prune($testBook)->count();
        $this->assertEquals(3, $nbBooks, 'prune() removes an object from the result');
    }

    public function testPruneCompositeKey()
    {
        BookstoreDataPopulator::depopulate();
        BookstoreDataPopulator::populate();

        // save all books to make sure related objects are also saved - BookstoreDataPopulator keeps some unsaved
        $c = new ModelCriteria('bookstore', 'Book');
        $books = $c->find();
        foreach ($books as $book) {
            $book->save();
        }

        BookPeer::clearInstancePool();

        $nbBookListRel = BookListRelQuery::create()->prune()->count();
        $this->assertEquals(2, $nbBookListRel, 'prune() does nothing when passed a null object');

        $testBookListRel = BookListRelQuery::create()->findOne();
        $nbBookListRel = BookListRelQuery::create()->prune($testBookListRel)->count();
        $this->assertEquals(1, $nbBookListRel, 'prune() removes an object from the result');
    }
}

class myCustomBookQuery extends BookQuery
{
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof myCustomBookQuery) {
            return $criteria;
        }
        $query = new myCustomBookQuery();
        if (null !== $modelAlias) {
            $query->setModelAlias($modelAlias);
        }
        if ($criteria instanceof Criteria) {
            $query->mergeWith($criteria);
        }

        return $query;
    }

}

class mySecondBookQuery extends BookQuery
{
    public static $preSelectWasCalled = false;

    public function __construct($dbName = 'bookstore', $modelName = 'Book', $modelAlias = null)
    {
        self::$preSelectWasCalled = false;
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    public function preSelect(PropelPDO $con)
    {
        self::$preSelectWasCalled = true;
    }
}
