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
 * Tests the generated classes by behaviors.
 *
 * @author     Francois Zaninotto
 * @package    generator.behavior
 */
class AddClassBehaviorTest extends BookstoreTestBase
{
  public function testClassExists()
  {
    $t = new AddClassTableFooClass();
    $this->assertTrue($t instanceof AddClassTableFooClass, 'behaviors can generate classes that are autoloaded');
  }
}
