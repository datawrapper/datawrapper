<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Test for PropelPDO subclass.
 *
 * @package    runtime.connection
 */
class PropelPDOTest extends PHPUnit_Framework_TestCase
{

	public function testSetAttribute()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$this->assertFalse($con->getAttribute(PropelPDO::PROPEL_ATTR_CACHE_PREPARES));
		$con->setAttribute(PropelPDO::PROPEL_ATTR_CACHE_PREPARES, true);
		$this->assertTrue($con->getAttribute(PropelPDO::PROPEL_ATTR_CACHE_PREPARES));

		$con->setAttribute(PDO::ATTR_CASE, PDO::CASE_LOWER);
		$this->assertEquals(PDO::CASE_LOWER, $con->getAttribute(PDO::ATTR_CASE));
	}

	public function testCommitBeforeFetch()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		AuthorPeer::doDeleteAll($con);
		$a = new Author();
		$a->setFirstName('Test');
		$a->setLastName('User');
		$a->save($con);

		$con->beginTransaction();
		$stmt = $con->prepare('SELECT author.FIRST_NAME, author.LAST_NAME FROM author');

		$stmt->execute();
		$con->commit();
		$authorArr = array(0 => 'Test', 1 => 'User');

		$i = 0;
		try {
			$row = $stmt->fetch( PDO::FETCH_NUM );
			$stmt->closeCursor();
			$this->assertEquals($authorArr, $row, 'PDO driver supports calling $stmt->fetch after the transaction has been closed');
		} catch (PDOException $e) {
			$this->fail("PDO driver does not support calling \$stmt->fetch after the transaction has been closed.\nFails with error ".$e->getMessage());
		}
	}

	public function testCommitAfterFetch()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		AuthorPeer::doDeleteAll($con);
		$a = new Author();
		$a->setFirstName('Test');
		$a->setLastName('User');
		$a->save($con);

		$con->beginTransaction();
		$stmt = $con->prepare('SELECT author.FIRST_NAME, author.LAST_NAME FROM author');

		$stmt->execute();
		$authorArr = array(0 => 'Test', 1 => 'User');

		$i = 0;
		$row = $stmt->fetch( PDO::FETCH_NUM );
		$stmt->closeCursor();
		$con->commit();
		$this->assertEquals($authorArr, $row, 'PDO driver supports calling $stmt->fetch before the transaction has been closed');
	}

	public function testNestedTransactionCommit()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$driver = $con->getAttribute(PDO::ATTR_DRIVER_NAME);

		$this->assertEquals(0, $con->getNestedTransactionCount(), 'nested transaction is equal to 0 before transaction');
		$this->assertFalse($con->isInTransaction(), 'PropelPDO is not in transaction by default');

		$con->beginTransaction();

		$this->assertEquals(1, $con->getNestedTransactionCount(), 'nested transaction is incremented after main transaction begin');
		$this->assertTrue($con->isInTransaction(), 'PropelPDO is in transaction after main transaction begin');

		try {

			$a = new Author();
			$a->setFirstName('Test');
			$a->setLastName('User');
			$a->save($con);
			$authorId = $a->getId();
			$this->assertNotNull($authorId, "Expected valid new author ID");

			$con->beginTransaction();

			$this->assertEquals(2, $con->getNestedTransactionCount(), 'nested transaction is incremented after nested transaction begin');
			$this->assertTrue($con->isInTransaction(), 'PropelPDO is in transaction after nested transaction begin');

			try {

				$a2 = new Author();
				$a2->setFirstName('Test2');
				$a2->setLastName('User2');
				$a2->save($con);
				$authorId2 = $a2->getId();
				$this->assertNotNull($authorId2, "Expected valid new author ID");

				$con->commit();

				$this->assertEquals(1, $con->getNestedTransactionCount(), 'nested transaction decremented after nested transaction commit');
				$this->assertTrue($con->isInTransaction(), 'PropelPDO is in transaction after main transaction commit');

			} catch (Exception $e) {
				$con->rollBack();
				throw $e;
			}

			$con->commit();

			$this->assertEquals(0, $con->getNestedTransactionCount(), 'nested transaction decremented after main transaction commit');
			$this->assertFalse($con->isInTransaction(), 'PropelPDO is not in transaction after main transaction commit');

		} catch (Exception $e) {
			$con->rollBack();
		}

		AuthorPeer::clearInstancePool();
		$at = AuthorPeer::retrieveByPK($authorId);
		$this->assertNotNull($at, "Committed transaction is persisted in database");
		$at2 = AuthorPeer::retrieveByPK($authorId2);
		$this->assertNotNull($at2, "Committed transaction is persisted in database");
	}

	/**
	 * @link       http://propel.phpdb.org/trac/ticket/699
	 */
	public function testNestedTransactionRollBackRethrow()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$driver = $con->getAttribute(PDO::ATTR_DRIVER_NAME);

		$con->beginTransaction();
		try {

			$a = new Author();
			$a->setFirstName('Test');
			$a->setLastName('User');
			$a->save($con);
			$authorId = $a->getId();

			$this->assertNotNull($authorId, "Expected valid new author ID");

			$con->beginTransaction();

			$this->assertEquals(2, $con->getNestedTransactionCount(), 'nested transaction is incremented after nested transaction begin');
			$this->assertTrue($con->isInTransaction(), 'PropelPDO is in transaction after nested transaction begin');

			try {
				$con->exec('INVALID SQL');
				$this->fail("Expected exception on invalid SQL");
			} catch (PDOException $x) {
				$con->rollBack();

				$this->assertEquals(1, $con->getNestedTransactionCount(), 'nested transaction decremented after nested transaction rollback');
				$this->assertTrue($con->isInTransaction(), 'PropelPDO is in transaction after main transaction rollback');

				throw $x;
			}

			$con->commit();
		} catch (Exception $x) {
			$con->rollBack();
		}

		AuthorPeer::clearInstancePool();
		$at = AuthorPeer::retrieveByPK($authorId);
		$this->assertNull($at, "Rolled back transaction is not persisted in database");
	}

	/**
	 * @link       http://propel.phpdb.org/trac/ticket/699
	 */
	public function testNestedTransactionRollBackSwallow()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$driver = $con->getAttribute(PDO::ATTR_DRIVER_NAME);

		$con->beginTransaction();
		try {

			$a = new Author();
			$a->setFirstName('Test');
			$a->setLastName('User');
			$a->save($con);

			$authorId = $a->getId();
			$this->assertNotNull($authorId, "Expected valid new author ID");

			$con->beginTransaction();
			try {

				$a2 = new Author();
				$a2->setFirstName('Test2');
				$a2->setLastName('User2');
				$a2->save($con);
				$authorId2 = $a2->getId();
				$this->assertNotNull($authorId2, "Expected valid new author ID");

				$con->exec('INVALID SQL');
				$this->fail("Expected exception on invalid SQL");
			} catch (PDOException $e) {
				$con->rollBack();
				// NO RETHROW
			}

			$a3 = new Author();
			$a3->setFirstName('Test2');
			$a3->setLastName('User2');
			$a3->save($con);

			$authorId3 = $a3->getId();
			$this->assertNotNull($authorId3, "Expected valid new author ID");

			$con->commit();
			$this->fail("Commit fails after a nested rollback");
		} catch (PropelException $e) {
			$this->assertTrue(true, "Commit fails after a nested rollback");
			$con->rollback();
		}

		AuthorPeer::clearInstancePool();
		$at = AuthorPeer::retrieveByPK($authorId);
		$this->assertNull($at, "Rolled back transaction is not persisted in database");
		$at2 = AuthorPeer::retrieveByPK($authorId2);
		$this->assertNull($at2, "Rolled back transaction is not persisted in database");
		$at3 = AuthorPeer::retrieveByPK($authorId3);
		$this->assertNull($at3, "Rolled back nested transaction is not persisted in database");
	}

	public function testNestedTransactionForceRollBack()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$driver = $con->getAttribute(PDO::ATTR_DRIVER_NAME);

		// main transaction
		$con->beginTransaction();

		$a = new Author();
		$a->setFirstName('Test');
		$a->setLastName('User');
		$a->save($con);
		$authorId = $a->getId();

		// nested transaction
		$con->beginTransaction();

		$a2 = new Author();
		$a2->setFirstName('Test2');
		$a2->setLastName('User2');
		$a2->save($con);
		$authorId2 = $a2->getId();

		// force rollback
		$con->forceRollback();

		$this->assertEquals(0, $con->getNestedTransactionCount(), 'nested transaction is null after nested transaction forced rollback');
		$this->assertFalse($con->isInTransaction(), 'PropelPDO is not in transaction after nested transaction force rollback');

		AuthorPeer::clearInstancePool();
		$at = AuthorPeer::retrieveByPK($authorId);
		$this->assertNull($at, "Rolled back transaction is not persisted in database");
		$at2 = AuthorPeer::retrieveByPK($authorId2);
		$this->assertNull($at2, "Forced Rolled back nested transaction is not persisted in database");
	}

	public function testLatestQuery()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$con->setLastExecutedQuery(123);
		$this->assertEquals(123, $con->getLastExecutedQuery(), 'PropelPDO has getter and setter for last executed query');
	}

	public function testLatestQueryMoreThanTenArgs()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new Criteria();
		$c->add(BookPeer::ID, array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1), Criteria::IN);
		$books = BookPeer::doSelect($c, $con);
		$expected = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.ID IN (1,1,1,1,1,1,1,1,1,1,1,1)";
		$this->assertEquals($expected, $con->getLastExecutedQuery(), 'PropelPDO correctly replaces arguments in queries');
	}

	public function testQueryCount()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$count = $con->getQueryCount();
		$con->incrementQueryCount();
		$this->assertEquals($count + 1, $con->getQueryCount(), 'PropelPDO has getter and incrementer for query count');
	}

	public function testUseDebug()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$con->useDebug(false);
		$this->assertEquals(array('PDOStatement'), $con->getAttribute(PDO::ATTR_STATEMENT_CLASS), 'Statement is PDOStatement when debug is false');
		$con->useDebug(true);
		$this->assertEquals(array('DebugPDOStatement', array($con)), $con->getAttribute(PDO::ATTR_STATEMENT_CLASS), 'statement is DebugPDOStament when debug is true');
	}

	public function testDebugLatestQuery()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new Criteria();
		$c->add(BookPeer::TITLE, 'Harry%s', Criteria::LIKE);

		$con->useDebug(false);
		$this->assertEquals('', $con->getLastExecutedQuery(), 'PropelPDO reinitializes the latest query when debug is set to false');

		$books = BookPeer::doSelect($c, $con);
		$this->assertEquals('', $con->getLastExecutedQuery(), 'PropelPDO does not update the last executed query when useLogging is false');

		$con->useDebug(true);
		$books = BookPeer::doSelect($c, $con);
		$latestExecutedQuery = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE LIKE 'Harry%s'";
		if (!Propel::getDB(BookPeer::DATABASE_NAME)->useQuoteIdentifier()) {
			$latestExecutedQuery = str_replace('`', '', $latestExecutedQuery);
		}
		$this->assertEquals($latestExecutedQuery, $con->getLastExecutedQuery(), 'PropelPDO updates the last executed query when useLogging is true');

		BookPeer::doDeleteAll($con);
		$latestExecutedQuery = "DELETE FROM `book`";
		$this->assertEquals($latestExecutedQuery, $con->getLastExecutedQuery(), 'PropelPDO updates the last executed query on delete operations');

		$sql = 'DELETE FROM book WHERE 1=1';
		$con->exec($sql);
		$this->assertEquals($sql, $con->getLastExecutedQuery(), 'PropelPDO updates the last executed query on exec operations');

		$sql = 'DELETE FROM book WHERE 2=2';
		$con->query($sql);
		$this->assertEquals($sql, $con->getLastExecutedQuery(), 'PropelPDO updates the last executed query on query operations');

		$stmt = $con->prepare('DELETE FROM book WHERE 1=:p1');
		$stmt->bindValue(':p1', '2');
		$stmt->execute();
		$this->assertEquals("DELETE FROM book WHERE 1='2'", $con->getLastExecutedQuery(), 'PropelPDO updates the last executed query on prapared statements');

		$con->useDebug(false);
		$this->assertEquals('', $con->getLastExecutedQuery(), 'PropelPDO reinitializes the latest query when debug is set to false');

		$con->useDebug(true);
	}

	public function testDebugQueryCount()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$c = new Criteria();
		$c->add(BookPeer::TITLE, 'Harry%s', Criteria::LIKE);

		$con->useDebug(false);
		$this->assertEquals(0, $con->getQueryCount(), 'PropelPDO does not update the query count when useLogging is false');

		$books = BookPeer::doSelect($c, $con);
		$this->assertEquals(0, $con->getQueryCount(), 'PropelPDO does not update the query count when useLogging is false');

		$con->useDebug(true);
		$books = BookPeer::doSelect($c, $con);
		$this->assertEquals(1, $con->getQueryCount(), 'PropelPDO updates the query count when useLogging is true');

		BookPeer::doDeleteAll($con);
		$this->assertEquals(2, $con->getQueryCount(), 'PropelPDO updates the query count on delete operations');

		$sql = 'DELETE FROM book WHERE 1=1';
		$con->exec($sql);
		$this->assertEquals(3, $con->getQueryCount(), 'PropelPDO updates the query count on exec operations');

		$sql = 'DELETE FROM book WHERE 2=2';
		$con->query($sql);
		$this->assertEquals(4, $con->getQueryCount(), 'PropelPDO updates the query count on query operations');

		$stmt = $con->prepare('DELETE FROM book WHERE 1=:p1');
		$stmt->bindValue(':p1', '2');
		$stmt->execute();
		$this->assertEquals(5, $con->getQueryCount(), 'PropelPDO updates the query count on prapared statements');

		$con->useDebug(false);
		$this->assertEquals(0, $con->getQueryCount(), 'PropelPDO reinitializes the query count when debug is set to false');

		$con->useDebug(true);
	}

	public function testDebugLog()
	{
		$con = Propel::getConnection(BookPeer::DATABASE_NAME);
		$config = Propel::getConfiguration(PropelConfiguration::TYPE_OBJECT);

		// save data to return to normal state after test
		$logger = $con->getLogger();

		$testLog = new myLogger();
		$con->setLogger($testLog);

		$logEverything = array('PropelPDO::exec', 'PropelPDO::query', 'PropelPDO::beginTransaction', 'PropelPDO::commit', 'PropelPDO::rollBack', 'DebugPDOStatement::execute');
		Propel::getConfiguration(PropelConfiguration::TYPE_OBJECT)->setParameter("debugpdo.logging.methods", $logEverything, false);
		$con->useDebug(true);

		// test transaction log
		$con->beginTransaction();
		$this->assertEquals('log: Begin transaction', $testLog->latestMessage, 'PropelPDO logs begin transation in debug mode');

		$con->commit();
		$this->assertEquals('log: Commit transaction', $testLog->latestMessage, 'PropelPDO logs commit transation in debug mode');

		$con->beginTransaction();
		$con->rollBack();
		$this->assertEquals('log: Rollback transaction', $testLog->latestMessage, 'PropelPDO logs rollback transation in debug mode');

		$con->beginTransaction();
		$testLog->latestMessage = '';
		$con->beginTransaction();
		$this->assertEquals('', $testLog->latestMessage, 'PropelPDO does not log nested begin transation in debug mode');
		$con->commit();
		$this->assertEquals('', $testLog->latestMessage, 'PropelPDO does not log nested commit transation in debug mode');
		$con->beginTransaction();
		$con->rollBack();
		$this->assertEquals('', $testLog->latestMessage, 'PropelPDO does not log nested rollback transation in debug mode');
		$con->rollback();

		// test query log
		$con->beginTransaction();

		$c = new Criteria();
		$c->add(BookPeer::TITLE, 'Harry%s', Criteria::LIKE);

		$books = BookPeer::doSelect($c, $con);
		$latestExecutedQuery = "SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.TITLE LIKE 'Harry%s'";
		$this->assertEquals('log: ' . $latestExecutedQuery, $testLog->latestMessage, 'PropelPDO logs queries and populates bound parameters in debug mode');

		BookPeer::doDeleteAll($con);
		$latestExecutedQuery = "DELETE FROM `book`";
		$this->assertEquals('log: ' . $latestExecutedQuery, $testLog->latestMessage, 'PropelPDO logs deletion queries in debug mode');

		$latestExecutedQuery = 'DELETE FROM book WHERE 1=1';
		$con->exec($latestExecutedQuery);
		$this->assertEquals('log: ' . $latestExecutedQuery, $testLog->latestMessage, 'PropelPDO logs exec queries in debug mode');

		$con->commit();

		// return to normal state after test
		$con->setLogger($logger);
		$config->setParameter("debugpdo.logging.methods", array('PropelPDO::exec', 'PropelPDO::query', 'DebugPDOStatement::execute'));
	}
}

class myLogger
{
	public $latestMessage = '';

	public function __call($method, $arguments)
	{
		$this->latestMessage = $method . ': ' . array_shift($arguments);
	}
}
