<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests the generated objects for temporal column types accessor & mutator.
 * This requires that the model was built with propel.useDateTimeClass=true
 *
 * @author     Francois Zaninotto
 * @package    generator.builder.om
 */
class GeneratedObjectTemporalColumnTypeTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		if (!class_exists('ComplexColumnTypeEntity5')) {
			$schema = <<<EOF
<database name="generated_object_complex_type_test_5">
	<table name="complex_column_type_entity_5">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar1" type="DATE" />
		<column name="bar2" type="TIME"  />
		<column name="bar3" type="TIMESTAMP" />
	</table>
</database>
EOF;
			PropelQuickBuilder::buildSchema($schema);
		}
	}

	public function testNullValue()
	{
		$r = new ComplexColumnTypeEntity5();
		$this->assertNull($r->getBar1());
		$r->setBar1(new DateTime('2011-12-02'));
		$this->assertNotNull($r->getBar1());
		$r->setBar1(null);
		$this->assertNull($r->getBar1());
	}

	/**
	 * @link       http://propel.phpdb.org/trac/ticket/586
	 */
	public function testEmptyValue()
	{
		$r = new ComplexColumnTypeEntity5();
		$r->setBar1('');
		$this->assertNull($r->getBar1());
	}

	public function testPreEpochValue()
	{
		$r = new ComplexColumnTypeEntity5();
		$r->setBar1(new DateTime('1602-02-02'));
		$this->assertEquals('1602-02-02', $r->getBar1(null)->format('Y-m-d'));

		$r->setBar1('1702-02-02');
		$this->assertTrue($r->isModified());
		$this->assertEquals('1702-02-02', $r->getBar1(null)->format('Y-m-d'));
	}

	/**
	 * @expectedException PropelException
	 */
	public function testInvalidValueThrowsPropelException()
	{
		$r = new ComplexColumnTypeEntity5();
		$r->setBar1("Invalid Date");
	}

	public function testUnixTimestampValue()
	{
		$r = new ComplexColumnTypeEntity5();
		$r->setBar1(time());
		$this->assertEquals(date('Y-m-d'), $r->getBar1('Y-m-d'));

		$r = new ComplexColumnTypeEntity5();
		$r->setBar2(strtotime('12:55'));
		$this->assertEquals('12:55', $r->getBar2(null)->format('H:i'));

		$r = new ComplexColumnTypeEntity5();
		$r->setBar3(time());
		$this->assertEquals(date('Y-m-d H:i'), $r->getBar3('Y-m-d H:i'));
	}

	public function testDatePersistence()
	{
		$r = new ComplexColumnTypeEntity5();
		$r->setBar1(new DateTime('1999-12-20'));
		$r->save();
		ComplexColumnTypeEntity5Peer::clearInstancePool();
		$r1 = ComplexColumnTypeEntity5Query::create()->findPk($r->getId());
		$this->assertEquals('1999-12-20', $r1->getBar1(null)->format('Y-m-d'));
	}

	public function testTimePersistence()
	{
		$r = new ComplexColumnTypeEntity5();
		$r->setBar2(strtotime('12:55'));
		$r->save();
		ComplexColumnTypeEntity5Peer::clearInstancePool();
		$r1 = ComplexColumnTypeEntity5Query::create()->findPk($r->getId());
		$this->assertEquals('12:55', $r1->getBar2(null)->format('H:i'));
	}

	public function testTimestampPersistence()
	{
		$r = new ComplexColumnTypeEntity5();
		$r->setBar3(new DateTime('1999-12-20 12:55'));
		$r->save();
		ComplexColumnTypeEntity5Peer::clearInstancePool();
		$r1 = ComplexColumnTypeEntity5Query::create()->findPk($r->getId());
		$this->assertEquals('1999-12-20 12:55', $r1->getBar3(null)->format('Y-m-d H:i'));
	}

}
