<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../runtime/lib/Propel.php';

/**
 * Base functionality to be extended by all Propel test cases.  Test
 * case implementations are used to automate unit testing via PHPUnit.
 *
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Daniel Rall <dlr@finemaltcoding.com> (Torque)
 * @author     Christopher Elkins <celkins@scardini.com> (Torque)
 * @version    $Revision$
 */
abstract class BaseTestCase extends PHPUnit_Framework_TestCase {

	/**
	 * Conditional compilation flag.
	 */
	const DEBUG = false;

}

