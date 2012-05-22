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
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/Database.php';


/**
 * Tests for the Column methods of the PropelTableComparator service class.
 *
 * @package    generator.model.diff
 */
class PropelTableForeignKeyComparatorTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		$this->platform = new MysqlPlatform();
	}

	public function testCompareSameFks()
	{
		$c1 = new Column('Foo');
		$c2 = new Column('Bar');
		$fk1 = new ForeignKey();
		$fk1->addReference($c1, $c2);
		$t1 = new Table('Baz');
		$t1->addForeignKey($fk1);
		$c3 = new Column('Foo');
		$c4 = new Column('Bar');
		$fk2 = new ForeignKey();
		$fk2->addReference($c3, $c4);
		$t2 = new Table('Baz');
		$t2->addForeignKey($fk2);

		$this->assertFalse(PropelTableComparator::computeDiff($t1, $t2));
	}

	public function testCompareNotSameFks()
	{
		$c1 = new Column('Foo');
		$c2 = new Column('Bar');
		$fk1 = new ForeignKey();
		$fk1->addReference($c1, $c2);
		$t1 = new Table('Baz');
		$t1->addForeignKey($fk1);

		$t2 = new Table('Baz');

		$diff = PropelTableComparator::computeDiff($t1, $t2);
		$this->assertTrue($diff instanceof PropelTableDiff);
	}

	public function testCaseInsensitive()
	{
		$t1 = new Table('Baz');
		$c1 = new Column('Foo');
		$c2 = new Column('Bar');
		$fk1 = new ForeignKey();
		$fk1->addReference($c1, $c2);
		$t1->addForeignKey($fk1);

		$t2 = new Table('bAZ');
		$c3 = new Column('fOO');
		$c4 = new Column('bAR');
		$fk2 = new ForeignKey();
		$fk2->addReference($c3, $c4);
		$t2->addForeignKey($fk2);

		$this->assertFalse(PropelTableComparator::computeDiff($t1, $t2, true));
	}

	public function testCompareAddedFks()
	{
		$db1 = new Database();
		$db1->setPlatform($this->platform);
		$t1 = new Table('Baz');
		$db1->addTable($t1);
		$t1->doNaming();

		$db2 = new Database();
		$db2->setPlatform($this->platform);
		$c3 = new Column('Foo');
		$c4 = new Column('Bar');
		$fk2 = new ForeignKey();
		$fk2->addReference($c3, $c4);
		$t2 = new Table('Baz');
		$t2->addForeignKey($fk2);
		$db2->addTable($t2);
		$t2->doNaming();

		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$nbDiffs = $tc->compareForeignKeys();
		$tableDiff = $tc->getTableDiff();
		$this->assertEquals(1, $nbDiffs);
		$this->assertEquals(1, count($tableDiff->getAddedFks()));
		$this->assertEquals(array('Baz_FK_1' => $fk2), $tableDiff->getAddedFks());
	}

	public function testCompareRemovedFks()
	{
		$db1 = new Database();
		$db1->setPlatform($this->platform);
		$c1 = new Column('Foo');
		$c2 = new Column('Bar');
		$fk1 = new ForeignKey();
		$fk1->addReference($c1, $c2);
		$t1 = new Table('Baz');
		$t1->addForeignKey($fk1);
		$db1->addTable($t1);
		$t1->doNaming();

		$db2 = new Database();
		$db2->setPlatform($this->platform);
		$t2 = new Table('Baz');
		$db2->addTable($t2);
		$t2->doNaming();

		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$nbDiffs = $tc->compareForeignKeys();
		$tableDiff = $tc->getTableDiff();
		$this->assertEquals(1, $nbDiffs);
		$this->assertEquals(1, count($tableDiff->getRemovedFks()));
		$this->assertEquals(array('Baz_FK_1' => $fk1), $tableDiff->getRemovedFks());
	}

	public function testCompareModifiedFks()
	{
		$db1 = new Database();
		$db1->setPlatform($this->platform);
		$c1 = new Column('Foo');
		$c2 = new Column('Bar');
		$fk1 = new ForeignKey();
		$fk1->addReference($c1, $c2);
		$t1 = new Table('Baz');
		$t1->addForeignKey($fk1);
		$db1->addTable($t1);
		$t1->doNaming();

		$db2 = new Database();
		$db2->setPlatform($this->platform);
		$c3 = new Column('Foo');
		$c4 = new Column('Bar2');
		$fk2 = new ForeignKey();
		$fk2->addReference($c3, $c4);
		$t2 = new Table('Baz');
		$t2->addForeignKey($fk2);
		$db2->addTable($t2);
		$t2->doNaming();

		$tc = new PropelTableComparator();
		$tc->setFromTable($t1);
		$tc->setToTable($t2);
		$nbDiffs = $tc->compareForeignKeys();
		$tableDiff = $tc->getTableDiff();
		$this->assertEquals(1, $nbDiffs);
		$this->assertEquals(1, count($tableDiff->getModifiedFks()));
		$this->assertEquals(array('Baz_FK_1' => array($fk1, $fk2)), $tableDiff->getModifiedFks());
	}
}
