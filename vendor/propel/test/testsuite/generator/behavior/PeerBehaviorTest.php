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
 * Tests the generated Peer behavior hooks.
 *
 * @author     Francois Zaninotto
 * @package    generator.behavior
 */
class PeerBehaviorTest extends BookstoreTestBase
{
  public function testStaticAttributes()
  {
    $this->assertEquals(Table3Peer::$customStaticAttribute, 1, 'staticAttributes hook is called when adding attributes');
    $this->assertEquals(Table3Peer::$staticAttributeBuilder, 'PHP5PeerBuilder', 'staticAttributes hook is called with the peer builder as parameter');
  }

  public function testStaticMethods()
  {
    $this->assertTrue(method_exists('Table3Peer', 'hello'), 'staticMethods hook is called when adding methods');
    $this->assertEquals(Table3Peer::hello(), 'PHP5PeerBuilder', 'staticMethods hook is called with the peer builder as parameter');
  }

  public function testPreSelect()
  {
    $con = Propel::getConnection(Table3Peer::DATABASE_NAME, Propel::CONNECTION_READ);
    $con->preSelect = 0;
    Table3Peer::doSelect(new Criteria, $con);
    $this->assertNotEquals($con->preSelect, 0, 'preSelect hook is called in doSelect()');
    $con->preSelect = 0;
    Table3Peer::doSelectOne(new Criteria, $con);
    $this->assertNotEquals($con->preSelect, 0, 'preSelect hook is called in doSelectOne()');
    $con->preSelect = 0;
    Table3Peer::doCount(new Criteria, $con);
    $this->assertNotEquals($con->preSelect, 0, 'preSelect hook is called in doCount()');
    $con->preSelect = 0;
    Table3Peer::doSelectStmt(new Criteria, $con);
    $this->assertNotEquals($con->preSelect, 0, 'preSelect hook is called in doSelectStmt()');
    // and for the doSelectJoin and doCountJoin methods, well just believe my word

    $con->preSelect = 0;
    Table3Peer::doSelect(new Criteria, $con);
    $this->assertEquals($con->preSelect, 'PHP5PeerBuilder', 'preSelect hook is called with the peer builder as parameter');
  }

  public function testPeerFilter()
  {
    Table3Peer::TABLE_NAME;
    $this->assertTrue(class_exists('testPeerFilter'), 'peerFilter hook allows complete manipulation of the generated script');
    $this->assertEquals(testPeerFilter::FOO, 'PHP5PeerBuilder', 'peerFilter hook is called with the peer builder as parameter');
  }
}
