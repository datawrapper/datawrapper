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


/**
 * Tests for the Column methods of the PropelTableComparator service class.
 *
 * @package    generator.model.diff
 */
class PropelTableIndexComparatorTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		$this->platform = new MysqlPlatform();
	}

	public function testCompareSameIndices()
	{
		$t1 = new Table();
		$c1 = new Column('Foo');
		$c1->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c1->getDomain()->replaceScale(2);
		$c1->getDomain()->replaceSize(3);
		$c1->setNotNull(true);
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t1->addColumn($c1);
		$i1 = new Index('Foo_Index');
		$i1->addColumn($c1);
		$t1->addIndex($i1);
		$t2 = new Table();
		$c2 = new Column('Foo');
		$c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceScale(2);
		$c2->getDomain()->replaceSize(3);
		$c2->setNotNull(true);
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t2->addColumn($c2);
		$i2 = new Index('Foo_Index');
		$i2->addColumn($c2);
		$t2->addIndex($i2);

		$this->assertFalse(PropelTableComparator::computeDiff($t1, $t2));
	}

	public function testCompareNotSameIndices()
	{
		$t1 = new Table();
		$c1 = new Column('Foo');
		$c1->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c1->getDomain()->replaceScale(2);
		$c1->getDomain()->replaceSize(3);
		$c1->setNotNull(true);
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t1->addColumn($c1);
		$i1 = new Index('Foo_Index');
		$i1->addColumn($c1);
		$t1->addIndex($i1);
		$t2 = new Table();
		$c2 = new Column('Foo');
		$c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceScale(2);
		$c2->getDomain()->replaceSize(3);
		$c2->setNotNull(true);
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t2->addColumn($c2);
		$i2 = new Unique('Foo_Index');
		$i2->addColumn($c2);
		$t2->addIndex($i2);

		$diff = PropelTableComparator::computeDiff($t1, $t2);
		$this->assertTrue($diff instanceof PropelTableDiff);
	}

	public function testCompareCaseInsensitive()
	{
		$t1 = new Table();
		$c1 = new Column('Foo');
		$c1->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c1->getDomain()->replaceScale(2);
		$c1->getDomain()->replaceSize(3);
		$c1->setNotNull(true);
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t1->addColumn($c1);
		$i1 = new Index('Foo_Index');
		$i1->addColumn($c1);
		$t1->addIndex($i1);
		$t2 = new Table();
		$c2 = new Column('fOO');
		$c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceScale(2);
		$c2->getDomain()->replaceSize(3);
		$c2->setNotNull(true);
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t2->addColumn($c2);
		$i2 = new Index('fOO_iNDEX');
		$i2->addColumn($c2);
		$t2->addIndex($i2);

		$this->assertFalse(PropelTableComparator::computeDiff($t1, $t2, true));
	}

	public function testCompareAddedIndices()
	{
		$t1 = new Table();
		$t2 = new Table();
		$c2 = new Column('Foo');
		$c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceScale(2);
		$c2->getDomain()->replaceSize(3);
		$c2->setNotNull(true);
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t2->addColumn($c2);
		$i2 = new Index('Foo_Index');
		$i2->addColumn($c2);
		$t2->addIndex($i2);

		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$nbDiffs = $tc->compareIndices();
		$tableDiff = $tc->getTableDiff();
		$this->assertEquals(1, $nbDiffs);
		$this->assertEquals(1, count($tableDiff->getAddedIndices()));
		$this->assertEquals(array('Foo_Index' => $i2), $tableDiff->getAddedIndices());
	}

	public function testCompareRemovedIndices()
	{
		$t1 = new Table();
		$c1 = new Column('Bar');
		$c1->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c1->getDomain()->replaceScale(2);
		$c1->getDomain()->replaceSize(3);
		$c1->setNotNull(true);
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t1->addColumn($c1);
		$i1 = new Index('Bar_Index');
		$i1->addColumn($c1);
		$t1->addIndex($i1);
		$t2 = new Table();

		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$nbDiffs = $tc->compareIndices();
		$tableDiff = $tc->getTableDiff();
		$this->assertEquals(1, $nbDiffs);
		$this->assertEquals(1, count($tableDiff->getRemovedIndices()));
		$this->assertEquals(array('Bar_Index' => $i1), $tableDiff->getRemovedIndices());
	}

	public function testCompareModifiedIndices()
	{
		$t1 = new Table();
		$c1 = new Column('Foo');
		$c1->getDomain()->copy($this->platform->getDomainForType('VARCHAR'));
		$c1->getDomain()->replaceSize(255);
		$c1->setNotNull(false);
		$t1->addColumn($c1);
		$i1 = new Index('Foo_Index');
		$i1->addColumn($c1);
		$t1->addIndex($i1);
		$t2 = new Table();
		$c2 = new Column('Foo');
		$c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceScale(2);
		$c2->getDomain()->replaceSize(3);
		$c2->setNotNull(true);
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$t2->addColumn($c2);
		$i2 = new Unique('Foo_Index');
		$i2->addColumn($c2);
		$t2->addIndex($i2);

		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$nbDiffs = $tc->compareIndices();
		$tableDiff = $tc->getTableDiff();
		$this->assertEquals(1, $nbDiffs);
		$this->assertEquals(1, count($tableDiff->getModifiedIndices()));
		$this->assertEquals(array('Foo_Index' => array($i1, $i2)), $tableDiff->getModifiedIndices());
	}

}
