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
 * Test class for PropelObjectFormatter.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.formatter
 */
class PropelFormatterTest extends BookstoreEmptyTestBase
{
	protected function setUp()
	{
		parent::setUp();
		BookstoreDataPopulator::populate();
	}

	public function testGetWorkerObjectReturnsRightClass()
	{
		$formatter = $this->getMockForAbstractClass('PropelFormatter');

		$method = new ReflectionMethod('PropelFormatter', 'getWorkerObject');
		$method->setAccessible(true);

		$classNames = array(
			'Bookstore',
			'BookReader',
			'BookClubList',
		);

		$col = 0;
		foreach ($classNames as $className) {
			// getWorkerObject() should always return an instance of the requested class, regardless of the value of $col
			$result = $method->invoke($formatter, $col, $className);

			$this->assertEquals($className, get_class($result), 'getWorkerObject did not return an instance of the requested class');
		}
	}

	public function testGetWorkerObjectCachedInstance()
	{
		$formatter = $this->getMockForAbstractClass('PropelFormatter');

		$method = new ReflectionMethod('PropelFormatter', 'getWorkerObject');
		$method->setAccessible(true);

		$className = 'Bookstore';
		$col = 0;

		$result1 = $method->invoke($formatter, $col, $className);
		$result2 = $method->invoke($formatter, $col, $className);

		$this->assertEquals(spl_object_hash($result1), spl_object_hash($result2), 'getWorkerObject should return a cached instance of a class at the same col index');
	}
}
