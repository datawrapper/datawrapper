<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Tests the table structure behavior hooks.
 *
 * @author     Francois Zaninotto
 * @package    generator.behavior
 */
class TableBehaviorTest extends PHPUnit_Framework_TestCase
{
    protected function setUp()
    {
        parent::setUp();
        set_include_path(get_include_path() . PATH_SEPARATOR . "fixtures/bookstore/build/classes");
        require_once 'behavior/alternative_coding_standards/map/Table3TableMap.php';
        require_once 'behavior/alternative_coding_standards/Table3Peer.php';
    }

  public function testModifyTable()
  {
    $t = Table3Peer::getTableMap();
    $this->assertTrue($t->hasColumn('test'), 'modifyTable hook is called when building the model structure');
  }
}
