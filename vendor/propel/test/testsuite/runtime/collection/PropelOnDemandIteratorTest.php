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
 * Test class for PropelOnDemandIterator.
 *
 * @author     Francois Zaninotto
 * @version    $Id: PropelObjectCollectionTest.php 1348 2009-12-03 21:49:00Z francois $
 * @package    runtime.collection
 */
class PropelOnDemandIteratorTest extends BookstoreEmptyTestBase
{
    protected function setUp()
    {
        parent::setUp();
        BookstoreDataPopulator::populate($this->con);
    }

    public function testInstancePoolingDisabled()
    {
        Propel::enableInstancePooling();
        $books = PropelQuery::from('Book')
            ->setFormatter(ModelCriteria::FORMAT_ON_DEMAND)
            ->find($this->con);
        foreach ($books as $book) {
            $this->assertFalse(Propel::isInstancePoolingEnabled());
        }
    }

    public function testInstancePoolingReenabled()
    {
        Propel::enableInstancePooling();
        $books = PropelQuery::from('Book')
            ->setFormatter(ModelCriteria::FORMAT_ON_DEMAND)
            ->find($this->con);
        foreach ($books as $book) {
        }
        $this->assertTrue(Propel::isInstancePoolingEnabled());

        Propel::disableInstancePooling();
        $books = PropelQuery::from('Book')
            ->setFormatter(ModelCriteria::FORMAT_ON_DEMAND)
            ->find($this->con);
        foreach ($books as $book) {
        }
        $this->assertFalse(Propel::isInstancePoolingEnabled());
        Propel::enableInstancePooling();
    }

}
