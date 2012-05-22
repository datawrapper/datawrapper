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
 * Tests the generated Peer classes for enum column type constants
 *
 * @author     Francois Zaninotto
 * @package    generator.builder.om
 */
class GeneratedPeerEnumColumnTypeTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		if (!class_exists('ComplexColumnTypeEntity103Peer')) {
			$schema = <<<EOF
<database name="generated_object_complex_type_test_103">
	<table name="complex_column_type_entity_103">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="ENUM" valueSet="foo, bar, baz, 1, 4,(, foo bar " />
	</table>
</database>
EOF;
			PropelQuickBuilder::buildSchema($schema);
		}
	}

	public function valueSetConstantProvider()
	{
		return array(
			array('ComplexColumnTypeEntity103Peer::BAR_FOO', 'foo'),
			array('ComplexColumnTypeEntity103Peer::BAR_BAR', 'bar'),
			array('ComplexColumnTypeEntity103Peer::BAR_BAZ', 'baz'),
			array('ComplexColumnTypeEntity103Peer::BAR_1', '1'),
			array('ComplexColumnTypeEntity103Peer::BAR_4', '4'),
			array('ComplexColumnTypeEntity103Peer::BAR__', '('),
			array('ComplexColumnTypeEntity103Peer::BAR_FOO_BAR', 'foo bar'),
		);
	}

	/**
	 * @dataProvider valueSetConstantProvider
	 */
	public function testValueSetConstants($constantName, $value)
	{
		$this->assertTrue(defined($constantName));
		$this->assertEquals($value, constant($constantName));
	}

	public function testGetValueSets()
	{
		$expected = array(ComplexColumnTypeEntity103Peer::BAR => array('foo', 'bar', 'baz', '1', '4', '(', 'foo bar'));
		$this->assertEquals($expected, ComplexColumnTypeEntity103Peer::getValueSets());
	}

	public function testGetValueSet()
	{
		$expected = array('foo', 'bar', 'baz', '1', '4', '(', 'foo bar');
		$this->assertEquals($expected, ComplexColumnTypeEntity103Peer::getValueSet(ComplexColumnTypeEntity103Peer::BAR));
	}
}
