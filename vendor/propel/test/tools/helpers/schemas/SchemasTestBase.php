<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../runtime/lib/Propel.php';
set_include_path(get_include_path() . PATH_SEPARATOR . realpath(dirname(__FILE__) . '/../../../fixtures/schemas/build/classes'));

/**
 * Bse class for tests on the schemas schema
 */
abstract class SchemasTestBase extends PHPUnit_Framework_TestCase
{

	protected function setUp()
	{
		parent::setUp();
		if (!file_exists(dirname(__FILE__) . '/../../../fixtures/schemas/build/conf/bookstore-conf.php')) {
			$this->markTestSkipped('You must build the schemas project fot this tests to run');
		}
		Propel::init(dirname(__FILE__) . '/../../../fixtures/schemas/build/conf/bookstore-conf.php');
	}

	protected function tearDown()
	{
		parent::tearDown();
		Propel::init(dirname(__FILE__) . '/../../../fixtures/bookstore/build/conf/bookstore-conf.php');
	}
}
