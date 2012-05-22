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
 * Tests the exceptions thrown by the BasePeer classes.
 *
 * @see        BookstoreDataPopulator
 * @author     Francois Zaninotto
 * @package    runtime.util
 */
class BasePeerExceptionsTest extends BookstoreTestBase
{

	public function testDoSelect()
	{
		try {
			$c = new Criteria();
			$c->add(BookPeer::ID, 12, ' BAD SQL');
			BookPeer::addSelectColumns($c);
			BasePeer::doSelect($c);
		} catch (PropelException $e) {
			$this->assertContains('[SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID FROM `book` WHERE book.ID BAD SQL:p1]', $e->getMessage(), 'SQL query is written in the exception message');
		}
	}

	public function testDoCount()
	{
		try {
			$c = new Criteria();
			$c->add(BookPeer::ID, 12, ' BAD SQL');
			BookPeer::addSelectColumns($c);
			BasePeer::doCount($c);
		} catch (PropelException $e) {
			$this->assertContains('[SELECT COUNT(*) FROM `book` WHERE book.ID BAD SQL:p1]', $e->getMessage(), 'SQL query is written in the exception message');
		}
	}

	public function testDoDelete()
	{
		try {
			$c = new Criteria();
			$c->setPrimaryTableName(BookPeer::TABLE_NAME);
			$c->add(BookPeer::ID, 12, ' BAD SQL');
			BasePeer::doDelete($c, Propel::getConnection());
		} catch (PropelException $e) {
			$this->assertContains('[DELETE FROM `book` WHERE book.ID BAD SQL:p1]', $e->getMessage(), 'SQL query is written in the exception message');
		}
	}

	public function testDoDeleteAll()
	{
		try {
			BasePeer::doDeleteAll('BAD TABLE', Propel::getConnection());
		} catch (PropelException $e) {
			$this->assertContains('[DELETE FROM `BAD` `TABLE`]', $e->getMessage(), 'SQL query is written in the exception message');
		}
	}

	public function testDoUpdate()
	{
		try {
			$c1 = new Criteria();
			$c1->setPrimaryTableName(BookPeer::TABLE_NAME);
			$c1->add(BookPeer::ID, 12, ' BAD SQL');
			$c2 = new Criteria();
			$c2->add(BookPeer::TITLE, 'Foo');
			BasePeer::doUpdate($c1, $c2, Propel::getConnection());
		} catch (PropelException $e) {
			$this->assertContains('[UPDATE `book` SET `TITLE`=:p1 WHERE book.ID BAD SQL:p2]', $e->getMessage(), 'SQL query is written in the exception message');
		}
	}

	public function testDoInsert()
	{
		try {
			$c = new Criteria();
			$c->setPrimaryTableName(BookPeer::TABLE_NAME);
			$c->add(BookPeer::AUTHOR_ID, 'lkhlkhj');
			BasePeer::doInsert($c, Propel::getConnection());
		} catch (PropelException $e) {
			$this->assertContains('[INSERT INTO `book` (`AUTHOR_ID`) VALUES (:p1)]', $e->getMessage(), 'SQL query is written in the exception message');
		}
	}

}
