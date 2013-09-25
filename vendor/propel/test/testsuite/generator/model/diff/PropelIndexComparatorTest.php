<?php

/*
 *	$Id: TableTest.php 1891 2010-08-09 15:03:18Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/model/diff/PropelIndexComparator.php';

/**
 * Tests for the PropelColumnComparator service class.
 *
 * @package    generator.model.diff
 */
class PropelIndexComparatorTest extends PHPUnit_Framework_TestCase
{
    public function testCompareNoDifference()
    {
        $c1 = new Column('Foo');
        $i1 = new Index('Foo_Index');
        $i1->addColumn($c1);
        $c2 = new Column('Foo');
        $i2 = new Index('Foo_Index');
        $i2->addColumn($c2);
        $this->assertFalse(PropelIndexComparator::computeDiff($i1, $i2));

        $c1 = new Column('Foo');
        $c2 = new Column('Bar');
        $i1 = new Index('Foo_Bar_Index');
        $i1->addColumn($c1);
        $i1->addColumn($c2);
        $c3 = new Column('Foo');
        $c4 = new Column('Bar');
        $i2 = new Index('Foo_Bar_Index');
        $i2->addColumn($c3);
        $i2->addColumn($c4);
        $this->assertFalse(PropelIndexComparator::computeDiff($i1, $i2));
    }

    public function testCompareCaseInsensitive()
    {
        $c1 = new Column('Foo');
        $i1 = new Index('Foo_Index');
        $i1->addColumn($c1);
        $c2 = new Column('fOO');
        $i2 = new Index('fOO_iNDEX');
        $i2->addColumn($c2);
        $this->assertFalse(PropelIndexComparator::computeDiff($i1, $i2, true));
    }

    public function testCompareType()
    {
        $c1 = new Column('Foo');
        $i1 = new Index('Foo_Index');
        $i1->addColumn($c1);
        $c2 = new Column('Foo');
        $i2 = new Unique('Foo_Index');
        $i2->addColumn($c2);
        $this->assertTrue(PropelIndexComparator::computeDiff($i1, $i2));
    }

    public function testCompareDifferentColumns()
    {
        $c1 = new Column('Foo');
        $i1 = new Index('Foo_Index');
        $i1->addColumn($c1);
        $c2 = new Column('Bar');
        $i2 = new Unique('Foo_Index');
        $this->assertTrue(PropelIndexComparator::computeDiff($i1, $i2));
    }

    public function testCompareDifferentOrder()
    {
        $c1 = new Column('Foo');
        $c2 = new Column('Bar');
        $i1 = new Index('Foo_Bar_Index');
        $i1->addColumn($c1);
        $i1->addColumn($c2);
        $c3 = new Column('Foo');
        $c4 = new Column('Bar');
        $i2 = new Index('Foo_Bar_Index');
        $i2->addColumn($c4);
        $i2->addColumn($c3);
        $this->assertTrue(PropelIndexComparator::computeDiff($i1, $i2));
    }

}
