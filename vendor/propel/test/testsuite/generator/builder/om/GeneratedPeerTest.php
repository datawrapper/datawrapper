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
 * Tests the generated Peer classes.
 *
 * This test uses generated Bookstore classes to test the behavior of various
 * peer operations.
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
class GeneratedPeerTest extends BookstoreTestBase
{
	public function testAlias()
	{
		$this->assertEquals('foo.ID', BookPeer::alias('foo', BookPeer::ID), 'alias() returns a column name using the table alias');
		$this->assertEquals('book.ID', BookPeer::alias('book', BookPeer::ID), 'alias() returns a column name using the table alias');
		$this->assertEquals('foo.COVER_IMAGE', MediaPeer::alias('foo', MediaPeer::COVER_IMAGE), 'alias() also works for lazy-loaded columns');
		$this->assertEquals('foo.SUBTITLE', EssayPeer::alias('foo', EssayPeer::SUBTITLE), 'alias() also works for columns with custom phpName');
	}

	public function testAddSelectColumns()
	{
		$c = new Criteria();
		BookPeer::addSelectColumns($c);
		$expected = array(
			BookPeer::ID,
			BookPeer::TITLE,
			BookPeer::ISBN,
			BookPeer::PRICE,
			BookPeer::PUBLISHER_ID,
			BookPeer::AUTHOR_ID
		);
		$this->assertEquals($expected, $c->getSelectColumns(), 'addSelectColumns() adds the columns of the model to the criteria');
	}

	public function testAddSelectColumnsLazyLoad()
	{
		$c = new Criteria();
		MediaPeer::addSelectColumns($c);
		$expected = array(
			MediaPeer::ID,
			MediaPeer::BOOK_ID
		);
		$this->assertEquals($expected, $c->getSelectColumns(), 'addSelectColumns() does not add lazy loaded columns');
	}

	public function testAddSelectColumnsAlias()
	{
		$c = new Criteria();
		BookPeer::addSelectColumns($c, 'foo');
		$expected = array(
			'foo.ID',
			'foo.TITLE',
			'foo.ISBN',
			'foo.PRICE',
			'foo.PUBLISHER_ID',
			'foo.AUTHOR_ID'
		);
		$this->assertEquals($expected, $c->getSelectColumns(), 'addSelectColumns() uses the second parameter as a table alias');
	}

	public function testAddSelectColumnsAliasLazyLoad()
	{
		$c = new Criteria();
		MediaPeer::addSelectColumns($c, 'bar');
		$expected = array(
			'bar.ID',
			'bar.BOOK_ID'
		);
		$this->assertEquals($expected, $c->getSelectColumns(), 'addSelectColumns() does not add lazy loaded columns but uses the second parameter as an alias');
	}

	public function testDefaultStringFormatConstant()
	{
		$this->assertTrue(defined('BookPeer::DEFAULT_STRING_FORMAT'), 'every Peer class has the DEFAULT_STRING_FORMAT constant');
		$this->assertEquals('YAML', AuthorPeer::DEFAULT_STRING_FORMAT, 'default string format is YAML by default');
		$this->assertEquals('XML', PublisherPeer::DEFAULT_STRING_FORMAT, 'default string format can be customized using the defaultStringFormat attribute in the schema');
	}

}
