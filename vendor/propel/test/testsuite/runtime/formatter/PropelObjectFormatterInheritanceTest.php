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
 * @version    $Id: PropelObjectFormatterTest.php 1374 2009-12-26 23:21:37Z francois $
 * @package    runtime.formatter
 */
class PropelObjectFormatterInheritanceTest extends BookstoreEmptyTestBase
{
    protected function setUp()
    {
        parent::setUp();
        $b1 = new BookstoreEmployee();
        $b1->setName('b1');
        $b1->save();
        $b2 = new BookstoreManager();
        $b2->setName('b2');
        $b2->save();
        $b3 = new BookstoreCashier();
        $b3->setName('b3');
        $b3->save();
    }

    public function testFormat()
    {
        $con = Propel::getConnection(BookPeer::DATABASE_NAME);
        BookstoreEmployeePeer::clearInstancePool();

        $stmt = $con->query('SELECT * FROM bookstore_employee');
        $formatter = new PropelObjectFormatter();
        $formatter->init(new ModelCriteria('bookstore', 'BookstoreEmployee'));
        $emps = $formatter->format($stmt);
        $expectedClass = array(
            'b1' =>'BookstoreEmployee',
            'b2' =>'BookstoreManager',
            'b3' =>'BookstoreCashier'
        );
        foreach ($emps as $emp) {
            $this->assertEquals($expectedClass[$emp->getName()], get_class($emp), 'format() creates objects of the correct class when using inheritance');
        }
    }

}
