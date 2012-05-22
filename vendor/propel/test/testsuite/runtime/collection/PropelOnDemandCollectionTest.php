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
 * Test class for PropelOnDemandCollection.
 *
 * @author     Francois Zaninotto
 * @version    $Id: PropelObjectCollectionTest.php 1348 2009-12-03 21:49:00Z francois $
 * @package    runtime.collection
 */
class PropelOnDemandCollectionTest extends BookstoreEmptyTestBase
{
	protected function setUp()
	{
		parent::setUp();
		BookstoreDataPopulator::populate($this->con);
		Propel::disableInstancePooling();
		$this->books = PropelQuery::from('Book')->setFormatter(ModelCriteria::FORMAT_ON_DEMAND)->find();
	}

	protected function tearDown()
	{
		parent::tearDown();
		Propel::enableInstancePooling();
	}

	public function testSetFormatter()
	{
		$this->assertTrue($this->books instanceof PropelOnDemandCollection);
		$this->assertEquals(4, count($this->books));
	}

	public function testKeys()
	{
		$i = 0;
		foreach ($this->books as $key => $book) {
			$this->assertEquals($i, $key);
			$i++;
		}
	}

	/**
	 * @expectedException PropelException
	 */
	public function testoffsetExists()
	{
		$this->books->offsetExists(2);
	}

	/**
	 * @expectedException PropelException
	 */
	public function testoffsetGet()
	{
		$this->books->offsetGet(2);
	}

	/**
	 * @expectedException PropelException
	 */
	public function testoffsetSet()
	{
		$this->books->offsetSet(2, 'foo');
	}

	/**
	 * @expectedException PropelException
	 */
	public function testoffsetUnset()
	{
		$this->books->offsetUnset(2);
	}

	public function testToArray()
	{
		$this->assertNotEquals(array(), $this->books->toArray());
		// since the code from toArray comes frmo PropelObjectCollection, we'll assume it's good
	}

	/**
	 * @expectedException PropelException
	 */
	public function testFromArray()
	{
		$this->books->fromArray(array());
	}

}