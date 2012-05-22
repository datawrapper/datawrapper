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
 * Tests the generated queries for enum column types filters
 *
 * @author     Francois Zaninotto
 * @package    generator.builder.om
 */
class GeneratedQueryEnumColumnTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		if (!class_exists('ComplexColumnTypeEntity13')) {
			$schema = <<<EOF
<database name="generated_object_complex_type_test_13">
	<table name="complex_column_type_entity_13">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="bar" type="ENUM" valueSet="foo, bar, baz, 1, 4,(, foo bar " />
		<column name="bar2" type="ENUM" valueSet="foo, bar" defaultValue="bar" />
	</table>
</database>
EOF;
			PropelQuickBuilder::buildSchema($schema);
			$e0 = new ComplexColumnTypeEntity13();
			$e0->save();
			$e1 = new ComplexColumnTypeEntity13();
			$e1->setBar('baz');
			$e1->save();
			$e2 = new ComplexColumnTypeEntity13();
			$e2->setBar('4');
			$e2->save();
			ComplexColumnTypeEntity13Peer::clearInstancePool();
		}
	}

	public function testColumnHydration()
	{
		$e = ComplexColumnTypeEntity13Query::create()
			->orderById()
			->offset(1)
			->findOne();
		$this->assertEquals('baz', $e->getBar(), 'enum columns are correctly hydrated');
	}

	public function testWhere()
	{
		$e = ComplexColumnTypeEntity13Query::create()
			->where('ComplexColumnTypeEntity13.Bar = ?', 'baz')
			->find();
		$this->assertEquals(1, $e->count(), 'object columns are searchable by enumerated value using where()');
		$this->assertEquals('baz', $e[0]->getBar(), 'object columns are searchable by enumerated value using where()');
		$e = ComplexColumnTypeEntity13Query::create()
			->where('ComplexColumnTypeEntity13.Bar IN ?', array('baz', 4))
			->find();
		$this->assertEquals(2, $e->count(), 'object columns are searchable by enumerated value using where()');
	}

	public function testFilterByColumn()
	{
		$e = ComplexColumnTypeEntity13Query::create()
			->filterByBar('4')
			->findOne();
		$this->assertEquals('4', $e->getBar(), 'enum columns are searchable by enumerated value');
		$e = ComplexColumnTypeEntity13Query::create()
			->filterByBar('baz')
			->findOne();
		$this->assertEquals('baz', $e->getBar(), 'enum columns are searchable by enumerated value');
		$e = ComplexColumnTypeEntity13Query::create()
			->filterByBar('baz', Criteria::NOT_EQUAL)
			->findOne();
		$this->assertEquals('4', $e->getBar(), 'enum columns are searchable by enumerated value');
		$nb = ComplexColumnTypeEntity13Query::create()
			->filterByBar(array('baz', '4'), Criteria::IN)
			->count();
		$this->assertEquals(2, $nb, 'enum columns are searchable by enumerated value');
		$nb = ComplexColumnTypeEntity13Query::create()
			->filterByBar(array('baz', '4'))
			->count();
		$this->assertEquals(2, $nb, 'enum columns filters default to Criteria IN when passed an array');
	}
}
