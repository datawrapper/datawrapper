<?php

/*
 *	$Id: TableTest.php 1891 2010-08-09 15:03:18Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/model/diff/PropelColumnComparator.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/platform/MysqlPlatform.php';

/**
 * Tests for the PropelColumnComparator service class.
 *
 * @package    generator.model.diff
 */
class PropelColumnComparatorTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		$this->platform = new MysqlPlatform();
	}

	public function testCompareNoDifference()
	{
		$c1 = new Column();
		$c1->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c1->getDomain()->replaceScale(2);
		$c1->getDomain()->replaceSize(3);
		$c1->setNotNull(true);
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$c2 = new Column();
		$c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceScale(2);
		$c2->getDomain()->replaceSize(3);
		$c2->setNotNull(true);
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$this->assertEquals(array(), PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareType()
	{
		$c1 = new Column();
		$c1->getDomain()->copy($this->platform->getDomainForType('VARCHAR'));
		$c2 = new Column();
		$c2->getDomain()->copy($this->platform->getDomainForType('LONGVARCHAR'));
		$expectedChangedProperties = array(
			'type'    => array('VARCHAR', 'LONGVARCHAR'),
			'sqlType' => array('VARCHAR', 'TEXT'),
		);
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareScale()
	{
		$c1 = new Column();
		$c1->getDomain()->replaceScale(2);
		$c2 = new Column();
		$c2->getDomain()->replaceScale(3);
		$expectedChangedProperties = array('scale' => array(2, 3));
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareSize()
	{
		$c1 = new Column();
		$c1->getDomain()->replaceSize(2);
		$c2 = new Column();
		$c2->getDomain()->replaceSize(3);
		$expectedChangedProperties = array('size' => array(2, 3));
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareSqlType()
	{
		$c1 = new Column();
		$c1->getDomain()->copy($this->platform->getDomainForType('INTEGER'));
		$c2 = new Column();
		$c2->getDomain()->copy($this->platform->getDomainForType('INTEGER'));
		$c2->getDomain()->setSqlType('INTEGER(10) UNSIGNED');
		$expectedChangedProperties = array('sqlType' => array('INTEGER', 'INTEGER(10) UNSIGNED'));
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareNotNull()
	{
		$c1 = new Column();
		$c1->setNotNull(true);
		$c2 = new Column();
		$c2->setNotNull(false);
		$expectedChangedProperties = array('notNull' => array(true, false));
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareDefaultValueToNull()
	{
		$c1 = new Column();
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$c2 = new Column();
		$expectedChangedProperties = array(
			'defaultValueType' => array(ColumnDefaultValue::TYPE_VALUE, null),
			'defaultValueValue' => array(123, null)
		);
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareDefaultValueFromNull()
	{
		$c1 = new Column();
		$c2 = new Column();
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$expectedChangedProperties = array(
			'defaultValueType' => array(null, ColumnDefaultValue::TYPE_VALUE),
			'defaultValueValue' => array(null, 123)
		);
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareDefaultValueValue()
	{
		$c1 = new Column();
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$c2 = new Column();
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(456, ColumnDefaultValue::TYPE_VALUE));
		$expectedChangedProperties = array(
			'defaultValueValue' => array(123, 456)
		);
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareDefaultValueType()
	{
		$c1 = new Column();
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$c2 = new Column();
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_EXPR));
		$expectedChangedProperties = array(
			'defaultValueType' => array(ColumnDefaultValue::TYPE_VALUE, ColumnDefaultValue::TYPE_EXPR)
		);
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	/**
	 * @see http://www.propelorm.org/ticket/1141
	 */
	public function testCompareDefaultExrpCurrentTimestamp()
	{
		$c1 = new Column();
		$c1->getDomain()->setDefaultValue(new ColumnDefaultValue("NOW()", ColumnDefaultValue::TYPE_EXPR));
		$c2 = new Column();
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue("CURRENT_TIMESTAMP", ColumnDefaultValue::TYPE_EXPR));
		$this->assertEquals(array(), PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareAutoincrement()
	{
		$c1 = new Column();
		$c1->setAutoIncrement(true);
		$c2 = new Column();
		$c2->setAutoIncrement(false);
		$expectedChangedProperties = array('autoIncrement' => array(true, false));
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}

	public function testCompareMultipleDifferences()
	{
		$c1 = new Column();
		$c1->getDomain()->copy($this->platform->getDomainForType('INTEGER'));
		$c1->setNotNull(false);
		$c2 = new Column();
		$c2->getDomain()->copy($this->platform->getDomainForType('DOUBLE'));
		$c2->getDomain()->replaceScale(2);
		$c2->getDomain()->replaceSize(3);
		$c2->setNotNull(true);
		$c2->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
		$expectedChangedProperties = array(
			'type' => array('INTEGER', 'DOUBLE'),
			'sqlType' => array('INTEGER', 'DOUBLE'),
			'scale' => array(NULL, 2),
			'size' => array(NULL, 3),
			'notNull' => array(false, true),
			'defaultValueType' => array(NULL, ColumnDefaultValue::TYPE_VALUE),
			'defaultValueValue' => array(NULL, 123)
		);
		$this->assertEquals($expectedChangedProperties, PropelColumnComparator::compareColumns($c1, $c2));
	}
}
