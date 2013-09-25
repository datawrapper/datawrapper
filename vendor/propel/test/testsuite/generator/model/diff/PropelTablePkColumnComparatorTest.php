<?php

/*
 *	$Id: TableTest.php 1891 2010-08-09 15:03:18Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/model/diff/PropelTableComparator.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/diff/PropelTableDiff.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/platform/MysqlPlatform.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/diff/PropelColumnComparator.php';

/**
 * Tests for the Column methods of the PropelTableComparator service class.
 *
 * @package    generator.model.diff
 */
class PropelTablePkColumnComparatorTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        $this->platform = new MysqlPlatform();
    }

    public function testCompareSamePks()
    {
        $t1 = new Table();
        $c1 = new Column('Foo');
        $c1->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
        $c1->setPrimaryKey(true);
        $t1->addColumn($c1);
        $t2 = new Table();
        $c2 = new Column('Foo');
        $c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
        $c2->setPrimaryKey(true);
        $t2->addColumn($c2);

        $this->assertFalse(PropelTableComparator::computeDiff($t1, $t2));
    }

    public function testCompareNotSamePks()
    {
        $t1 = new Table();
        $c1 = new Column('Foo');
        $c1->setPrimaryKey(true);
        $t1->addColumn($c1);
        $t2 = new Table();
        $c2 = new Column('Foo');
        $t2->addColumn($c2);

        $diff = PropelTableComparator::computeDiff($t1, $t2);
        $this->assertTrue($diff instanceof PropelTableDiff);
    }

    public function testCompareAddedPkColumn()
    {
        $t1 = new Table();
        $t2 = new Table();
        $c2 = new Column('Foo');
        $c2->getDomain()->copy($this->platform->getDomainForType('INTEGER'));
        $c2->setPrimaryKey(true);
        $t2->addColumn($c2);
        $c3 = new Column('Bar');
        $c3->getDomain()->copy($this->platform->getDomainForType('LONGVARCHAR'));
        $t2->addColumn($c3);

        $tc = new PropelTableComparator();
        $tc->setFromTable($t1);
        $tc->setToTable($t2);
        $nbDiffs = $tc->comparePrimaryKeys();
        $tableDiff = $tc->getTableDiff();
        $this->assertEquals(1, $nbDiffs);
        $this->assertEquals(1, count($tableDiff->getAddedPkColumns()));
        $this->assertEquals(array('Foo' => $c2), $tableDiff->getAddedPkColumns());
    }

    public function testCompareRemovedPkColumn()
    {
        $t1 = new Table();
        $c1 = new Column('Foo');
        $c1->getDomain()->copy($this->platform->getDomainForType('INTEGER'));
        $c1->setPrimaryKey(true);
        $t1->addColumn($c1);
        $c2 = new Column('Bar');
        $c2->getDomain()->copy($this->platform->getDomainForType('LONGVARCHAR'));
        $t1->addColumn($c2);
        $t2 = new Table();

        $tc = new PropelTableComparator();
        $tc->setFromTable($t1);
        $tc->setToTable($t2);
        $nbDiffs = $tc->comparePrimaryKeys();
        $tableDiff = $tc->getTableDiff();
        $this->assertEquals(1, $nbDiffs);
        $this->assertEquals(1, count($tableDiff->getRemovedPkColumns()));
        $this->assertEquals(array('Foo' => $c1), $tableDiff->getRemovedPkColumns());
    }

    public function testCompareRenamedPkColumn()
    {
        $t1 = new Table();
        $c1 = new Column('Foo');
        $c1->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
        $c1->getDomain()->replaceScale(2);
        $c1->getDomain()->replaceSize(3);
        $c1->setNotNull(true);
        $c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
        $c1->setPrimaryKey(true);
        $t1->addColumn($c1);
        $t2 = new Table();
        $c2 = new Column('Bar');
        $c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
        $c2->getDomain()->replaceScale(2);
        $c2->getDomain()->replaceSize(3);
        $c2->setNotNull(true);
        $c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
        $c2->setPrimaryKey(true);
        $t2->addColumn($c2);

        $tc = new PropelTableComparator();
        $tc->setFromTable($t1);
        $tc->setToTable($t2);
        $nbDiffs = $tc->comparePrimaryKeys();
        $tableDiff = $tc->getTableDiff();
        $this->assertEquals(1, $nbDiffs);
        $this->assertEquals(1, count($tableDiff->getRenamedPkColumns()));
        $this->assertEquals(array(array($c1, $c2)), $tableDiff->getRenamedPkColumns());
        $this->assertEquals(array(), $tableDiff->getAddedPkColumns());
        $this->assertEquals(array(), $tableDiff->getRemovedPkColumns());
    }

    public function testCompareSeveralPrimaryKeyDifferences()
    {
        $t1 = new Table();
        $c1 = new Column('col1');
        $c1->getDomain()->copy($this->platform->getDomainForType('VARCHAR'));
        $c1->getDomain()->replaceSize(255);
        $c1->setNotNull(false);
        $t1->addColumn($c1);
        $c2 = new Column('col2');
        $c2->getDomain()->copy($this->platform->getDomainForType('INTEGER'));
        $c2->setNotNull(true);
        $c2->setPrimaryKey(true);
        $t1->addColumn($c2);
        $c3 = new Column('col3');
        $c3->getDomain()->copy($this->platform->getDomainForType('VARCHAR'));
        $c3->getDomain()->replaceSize(255);
        $c3->setPrimaryKey(true);
        $t1->addColumn($c3);

        $t2 = new Table();
        $c4 = new Column('col1');
        $c4->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
        $c4->getDomain()->replaceScale(2);
        $c4->getDomain()->replaceSize(3);
        $c4->setNotNull(true);
        $c4->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
        $t2->addColumn($c4);
        $c5 = new Column('col22');
        $c5->getDomain()->copy($this->platform->getDomainForType('INTEGER'));
        $c5->setNotNull(true);
        $c5->setPrimaryKey(true);
        $t2->addColumn($c5);
        $c6 = new Column('col4');
        $c6->getDomain()->copy($this->platform->getDomainForType('LONGVARCHAR'));
        $c6->getDomain()->setDefaultValue(new ColumnDefaultValue('123', ColumnDefaultValue::TYPE_VALUE));
        $c6->setPrimaryKey(true);
        $t2->addColumn($c6);

        // col2 was renamed, col3 was removed, col4 was added
        $tc = new PropelTableComparator();
        $tc->setFromTable($t1);
        $tc->setToTable($t2);
        $nbDiffs = $tc->comparePrimaryKeys();
        $tableDiff = $tc->getTableDiff();
        $this->assertEquals(3, $nbDiffs);
        $this->assertEquals(array(array($c2, $c5)), $tableDiff->getRenamedPkColumns());
        $this->assertEquals(array('col4' => $c6), $tableDiff->getAddedPkColumns());
        $this->assertEquals(array('col3' => $c3), $tableDiff->getRemovedPkColumns());
    }

}
