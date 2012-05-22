<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../runtime/lib/Propel.php';
set_include_path(get_include_path() . PATH_SEPARATOR . realpath(dirname(__FILE__) . '/../../../fixtures/bookstore/build/classes'));
Propel::init(dirname(__FILE__) . '/../../../fixtures/bookstore/build/conf/bookstore-conf.php');
include_once dirname(__FILE__) . '/CmsDataPopulator.php';

/**
 * Base class contains some methods shared by subclass test cases.
 */
abstract class CmsTestBase extends PHPUnit_Framework_TestCase
{
	protected $con;

	/**
	 * This is run before each unit test; it populates the database.
	 */
	protected function setUp()
	{
		parent::setUp();
		$this->con = Propel::getConnection(PagePeer::DATABASE_NAME);
		$this->con->beginTransaction();
		CmsDataPopulator::depopulate($this->con);
		CmsDataPopulator::populate($this->con);
	}

	/**
	 * This is run after each unit test.  It empties the database.
	 */
	protected function tearDown()
	{
		CmsDataPopulator::depopulate($this->con);
		$this->con->commit();
		parent::tearDown();
	}

}
