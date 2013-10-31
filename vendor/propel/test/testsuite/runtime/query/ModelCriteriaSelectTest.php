<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreDataPopulator.php';

/**
 * Test class for ModelCriteria select() method.
 *
 * @author     Francois Zaninotto
 * @version    $Id: ModelCriteriaTest.php 1842 2010-07-22 22:39:40Z KRavEN $
 * @package    runtime.query
 */
class ModelCriteriaSelectTest extends BookstoreTestBase
{
    /**
     * @expectedException PropelException
     */
    public function testSelectThrowsExceptionWhenCalledWithAnEmptyString()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('');
    }

    /**
     * @expectedException PropelException
     */
    public function testSelectThrowsExceptionWhenCalledWithAnEmptyArray()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->select(array());
    }

    public function testSelectStringNoResult()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->where('Book.Title = ?', 'kdjfhlkdsh');
        $c->select('Title');
        $titles = $c->find($this->con);

        $expectedSQL = 'SELECT book.title AS "Title" FROM `book` WHERE book.title = \'kdjfhlkdsh\'';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'find() called after select(string) selects a single column');
        $this->assertTrue($titles instanceof PropelArrayCollection, 'find() called after select(string) returns a PropelArrayCollection object');
        $this->assertTrue(is_array($titles->getData()), 'find() called after select(string) returns an empty PropelArrayCollection object');
        $this->assertEquals(0, count($titles), 'find() called after select(string) returns an empty array if no record is found');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->where('Book.Title = ?', 'kdjfhlkdsh');
        $c->select('Title');
        $title = $c->findOne();
        $this->assertTrue(is_null($title), 'findOne() called after select(string) returns null when no record is found');
    }

    public function testSelectStringAcceptsColumnNames()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('Title');
        $titles = $c->find();
        $expectedSQL = 'SELECT book.title AS "Title" FROM `book`';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'select() accepts short column names');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('Book.Title');
        $titles = $c->find();
        $expectedSQL = 'SELECT book.title AS "Book.Title" FROM `book`';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'select() accepts complete column names');

        $c = new ModelCriteria('bookstore', 'Book', 'b');
        $c->select('b.Title');
        $titles = $c->find();
        $expectedSQL = 'SELECT book.title AS "b.Title" FROM `book`';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'select() accepts complete column names with table aliases');
    }

    public function testSelectStringFind()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('Title');
        $titles = $c->find($this->con);
        $this->assertEquals($titles->count(), 4, 'find() called after select(string) returns an array with one row for each record');
        $this->assertEquals($titles->shift(), 'Harry Potter and the Order of the Phoenix', 'find() called after select(string) returns an array of column values');
        $this->assertEquals($titles->shift(), 'Quicksilver', 'find() called after select(string) returns an array of column values');

        $c = new ModelCriteria('bookstore', 'Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select('FirstName');
        $authors = $c->find($this->con);
        $this->assertEquals($authors->count(), 1, 'find() called after select(string) allows for where() statements');
        $expectedSQL = "SELECT author.first_name AS \"FirstName\" FROM `author` WHERE author.first_name = 'Neal'";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'find() called after select(string) allows for where() statements');

        $c = new ModelCriteria('bookstore', 'Author');
        $c->select(AuthorPeer::FIRST_NAME);
        $author = $c->find($this->con);
        $expectedSQL = "SELECT author.first_name AS \"author.first_name\" FROM `author`";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'select(string) accepts model Peer Constants');
    }

    /**
    * @expectedException PropelException
    */
    public function testSelectStringFindCalledWithNonExistingColumn()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Author');
        $c->select('author.NOT_EXISTING_COLUMN');
        $author = $c->find($this->con);
    }

    public function testSelectStringFindOne()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('Title');
        $title = $c->findOne($this->con);
        $expectedSQL = 'SELECT book.title AS "Title" FROM `book` LIMIT 1';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'findOne() called after select(string) selects a single column and requests a single row');
        $this->assertTrue(is_string($title),'findOne() called after select(string) returns a string');
        $this->assertEquals($title, 'Harry Potter and the Order of the Phoenix', 'findOne() called after select(string) returns the column value of the first row matching the query');

        $c = new ModelCriteria('bookstore', 'Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select('FirstName');
        $author = $c->findOne($this->con);
        $this->assertEquals(count($author), 1, 'findOne() called after select(string) allows for where() statements');
        $expectedSQL = "SELECT author.first_name AS \"FirstName\" FROM `author` WHERE author.first_name = 'Neal' LIMIT 1";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'findOne() called after select(string) allows for where() statements');
    }

    public function testSelectStringJoin()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select('Title');
        $titles = $c->find($this->con);
        $this->assertEquals($titles->count(), 1, 'find() called after select(string) allows for join() statements');
        $expectedSQL = "SELECT book.title AS \"Title\" FROM `book` INNER JOIN `author` ON (book.author_id=author.id) WHERE author.first_name = 'Neal'";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'find() called after select(string) allows for join() statements');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select('Author.FirstName');
        $titles = $c->find($this->con);
        $this->assertEquals($titles->shift(), 'Neal', 'find() called after select(string) will return values from the joined table using complete column names');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select('Title');
        $title = $c->findOne($this->con);
        $this->assertEquals(count($title), 1, 'findOne() called after select(string) allows for join() statements');
        $expectedSQL = "SELECT book.title AS \"Title\" FROM `book` INNER JOIN `author` ON (book.author_id=author.id) WHERE author.first_name = 'Neal' LIMIT 1";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'findOne() called after select(string) allows for where() statements');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select('Author.FirstName');
        $title = $c->findOne($this->con);
        $this->assertEquals($title, 'Neal', 'findOne() called after select(string) will return values from the joined table using complete column names');
    }

    public function testSelectStringWildcard()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('*');
        $book = $c->findOne($this->con);
        $expectedSQL = 'SELECT book.id AS "Book.Id", book.title AS "Book.Title", book.isbn AS "Book.ISBN", book.price AS "Book.Price", book.publisher_id AS "Book.PublisherId", book.author_id AS "Book.AuthorId" FROM `book` LIMIT 1';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'select(\'*\') selects all the columns from the main object');
        $this->assertTrue(is_array($book), 'findOne() called after select(\'*\') returns an array');
        $this->assertEquals(array_keys($book), array('Book.Id', 'Book.Title', 'Book.ISBN', 'Book.Price', 'Book.PublisherId', 'Book.AuthorId'), 'select(\'*\') returns all the columns from the main object, in complete form');
    }

    public function testSelectArrayFind()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        // fix for a bug/limitation in pdo_dblib where it truncates columnnames to a maximum of 31 characters when doing PDO::FETCH_ASSOC
        $c = new ModelCriteria('bookstore', 'BookstoreEmployeeAccount');
        $c->select(array('BookstoreEmployeeAccount.Authenticator', 'BookstoreEmployeeAccount.Password'));
        $account = $c->findOne($this->con);
        $this->assertEquals($account, array('BookstoreEmployeeAccount.Authenticator' => 'Password', 'BookstoreEmployeeAccount.Password' => 'johnp4ss'), 'select() does not mind long column names');

        $c = new ModelCriteria('bookstore', 'Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select(array('FirstName', 'LastName'));
        $authors = $c->find($this->con);
        $this->assertEquals($authors->count(), 1, 'find() called after select(array) allows for where() statements');
        $expectedSQL = "SELECT author.first_name AS \"FirstName\", author.last_name AS \"LastName\" FROM `author` WHERE author.first_name = 'Neal'";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'find() called after select(array) allows for where() statements');
    }

    public function testSelectArrayFindOne()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select(array('FirstName', 'LastName'));
        $author = $c->findOne($this->con);
        $this->assertEquals(count($author), 2, 'findOne() called after select(array) allows for where() statements');
        $expectedSQL = "SELECT author.first_name AS \"FirstName\", author.last_name AS \"LastName\" FROM `author` WHERE author.first_name = 'Neal' LIMIT 1";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'findOne() called after select(array) allows for where() statements');
    }

    public function testSelectArrayJoin()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select(array('Title', 'ISBN'));
        $titles = $c->find($this->con);
        $this->assertEquals($titles->count(), 1, 'find() called after select(array) allows for join() statements');
        $expectedSQL = "SELECT book.title AS \"Title\", book.isbn AS \"ISBN\" FROM `book` INNER JOIN `author` ON (book.author_id=author.id) WHERE author.first_name = 'Neal'";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'find() called after select(array) allows for join() statements');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select(array('Author.FirstName', 'Author.LastName'));
        $titles = $c->find($this->con);
        $this->assertEquals(array_values($titles->shift()), array('Neal', 'Stephenson'), 'find() called after select(array) will return values from the joined table using complete column names');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select(array('Title', 'ISBN'));
        $title = $c->findOne($this->con);
        $this->assertEquals(count($title), 2, 'findOne() called after select(array) allows for join() statements');
        $expectedSQL = "SELECT book.title AS \"Title\", book.isbn AS \"ISBN\" FROM `book` INNER JOIN `author` ON (book.author_id=author.id) WHERE author.first_name = 'Neal' LIMIT 1";
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'findOne() called after select(array) allows for join() statements');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select(array('Author.FirstName', 'Author.LastName'));
        $title = $c->findOne($this->con);
        $this->assertEquals(array_values($title), array('Neal', 'Stephenson'), 'findOne() called after select(array) will return values from the joined table using complete column names');
    }

    public function testSelectArrayRelation()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->orderBy('Book.Title');
        $c->select(array('Author.LastName', 'Book.Title'));
        $rows = $c->find($this->con);
        $expectedSQL = 'SELECT author.last_name AS "Author.LastName", book.title AS "Book.Title" FROM `book` INNER JOIN `author` ON (book.author_id=author.id) ORDER BY book.title ASC';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'select(array) can select columns from several tables (many-to-one)');

        $expectedRows = array(
            array(
                'Author.LastName' => 'Byron',
                'Book.Title' => 'Don Juan',
            ),
            array(
                'Author.LastName' => 'Rowling',
                'Book.Title' => 'Harry Potter and the Order of the Phoenix',
            ),
            array(
                'Author.LastName' => 'Stephenson',
                'Book.Title' => 'Quicksilver',
            ),
            array(
                'Author.LastName' => 'Grass',
                'Book.Title' => 'The Tin Drum',
            ),
        );
        $this->assertEquals(serialize($rows->getData()), serialize($expectedRows), 'find() called after select(array) returns columns from several tables (many-to-one');

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->select(array('Author.LastName', 'Book.Title'));
        $c->orderBy('Book.Id');
        $c->orderBy('Author.Id');
        $rows = $c->find($this->con);
        $expectedSQL = 'SELECT author.last_name AS "Author.LastName", book.title AS "Book.Title" FROM `book` INNER JOIN `author` ON (book.author_id=author.id) ORDER BY book.id ASC,author.id ASC';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'select(array) can select columns from several tables (many-to-one)');

        $expectedRows = array (
            array (
                'Author.LastName' => 'Rowling',
                'Book.Title' => 'Harry Potter and the Order of the Phoenix',
            ),
            array (
                'Author.LastName' => 'Stephenson',
                'Book.Title' => 'Quicksilver',
            ),
            array (
                'Author.LastName' => 'Byron',
                'Book.Title' => 'Don Juan',
            ),
            array (
                'Author.LastName' => 'Grass',
                'Book.Title' => 'The Tin Drum',
            )
        );
        $this->assertEquals(serialize($rows->getData()), serialize($expectedRows), 'find() called after select(array) returns columns from several tables (many-to-one');
    }

    public function testSelectArrayWithColumn()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->withColumn('LOWER(Book.Title)', 'LowercaseTitle');
        $c->select(array('LowercaseTitle', 'Book.Title'));
        $c->orderBy('Book.Title');
        $rows = $c->find($this->con);
        $expectedSQL = 'SELECT LOWER(book.title) AS LowercaseTitle, book.title AS "Book.Title" FROM `book` INNER JOIN `author` ON (book.author_id=author.id) ORDER BY book.title ASC';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'find() called after select(array) can cope with a column added with withColumn()');

        $expectedRows = array (
            array (
                'LowercaseTitle' => 'don juan',
                'Book.Title' => 'Don Juan',
            ),
            array (
                'LowercaseTitle' => 'harry potter and the order of the phoenix',
                'Book.Title' => 'Harry Potter and the Order of the Phoenix',
            ),
            array (
                'LowercaseTitle' => 'quicksilver',
                'Book.Title' => 'Quicksilver',
            ),
            array (
                'LowercaseTitle' => 'the tin drum',
                'Book.Title' => 'The Tin Drum',
            ),
        );
        $this->assertEquals(serialize($rows->getData()), serialize($expectedRows), 'find() called after select(array) can cope with a column added with withColumn()');
    }

    public function testSelectArrayWithColumnOrder()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->withColumn('LOWER(Book.Title)', 'LowercaseTitle');
        $c->withColumn('UPPER(Book.Title)', 'UppercaseTitle');
        $c->select(array('Book.ISBN', 'LowercaseTitle', 'Book.Title', 'UppercaseTitle'));
        $c->orderBy('Book.Title');
        $rows = $c->find($this->con);
        $expectedSQL = 'SELECT book.isbn AS "Book.ISBN", LOWER(book.title) AS LowercaseTitle, book.title AS "Book.Title", UPPER(book.title) AS UppercaseTitle FROM `book` INNER JOIN `author` ON (book.author_id=author.id) ORDER BY book.title ASC';
        $this->assertEquals($expectedSQL, $this->con->getLastExecutedQuery(), 'find() called after select(array) can cope with a column added with withColumn()');

        $expectedRows = array (
                array (
                        'Book.ISBN' => '0140422161',
                        'LowercaseTitle' => 'don juan',
                        'Book.Title' => 'Don Juan',
                        'UppercaseTitle' => 'DON JUAN',
                ),
                array (
                        'Book.ISBN' => '043935806X',
                        'LowercaseTitle' => 'harry potter and the order of the phoenix',
                        'Book.Title' => 'Harry Potter and the Order of the Phoenix',
                        'UppercaseTitle' => 'HARRY POTTER AND THE ORDER OF THE PHOENIX',
                ),
                array (
                        'Book.ISBN' => '0380977427',
                        'LowercaseTitle' => 'quicksilver',
                        'Book.Title' => 'Quicksilver',
                        'UppercaseTitle' => 'QUICKSILVER',
                ),
                array (
                        'Book.ISBN' => '067972575X',
                        'LowercaseTitle' => 'the tin drum',
                        'Book.Title' => 'The Tin Drum',
                        'UppercaseTitle' => 'THE TIN DRUM',
                ),
        );
        $this->assertEquals(serialize($rows->getData()), serialize($expectedRows), 'find() called after select(array) can cope with a column added with withColumn()');
    }

    public function testSelectArrayPaginate()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $pager =  BookQuery::create()
            ->select(array('Id', 'Title', 'ISBN', 'Price'))
            ->paginate(1, 10, $this->con);
        $this->assertInstanceOf('PropelModelPager', $pager);
        foreach ($pager as $result) {
            $this->assertEquals(array('Id', 'Title', 'ISBN', 'Price'), array_keys($result));
        }
    }

    public function testGetSelectReturnsNullByDefault()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $this->assertNull($c->getSelect());
    }

    public function testGetSelectReturnsStringWhenSelectingASingleColumn()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('Title');
        $this->assertEquals('Title', $c->getSelect());
    }

    public function testGetSelectReturnsArrayWhenSelectingSeveralColumns()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->select(array('Id', 'Title'));
        $this->assertEquals(array('Id', 'Title'), $c->getSelect());
    }

    public function testGetSelectReturnsArrayWhenSelectingASingleColumnAsArray()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->select(array('Title'));
        $this->assertEquals(array('Title'), $c->getSelect());
    }

    public function testGetSelectReturnsArrayWhenSelectingAllColumns()
    {
        $c = new ModelCriteria('bookstore', 'Book');
        $c->select('*');
        $this->assertEquals(array('Book.Id', 'Book.Title', 'Book.ISBN', 'Book.Price', 'Book.PublisherId', 'Book.AuthorId'), $c->getSelect());
    }
}
