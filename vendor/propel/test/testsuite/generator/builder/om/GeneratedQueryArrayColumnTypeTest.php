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
 * Tests the generated queries for array column types filters
 *
 * @author     Francois Zaninotto
 * @package    generator.builder.om
 */
class GeneratedQueryArrayColumnTypeTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        if (!class_exists('ComplexColumnTypeEntity11')) {
            $schema = <<<EOF
<database name="generated_object_complex_type_test_11">
    <table name="complex_column_type_entity_11">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <column name="tags" type="ARRAY" />
        <column name="value_set" type="ARRAY" />
    </table>
</database>
EOF;
            PropelQuickBuilder::buildSchema($schema);
            $e0 = new ComplexColumnTypeEntity11();
            $e0->save();
            $e1 = new ComplexColumnTypeEntity11();
            $e1->setTags(array('foo', 'bar', 'baz'));
            $e1->save();
            $e2 = new ComplexColumnTypeEntity11();
            $e2->setTags(array('bar'));
            $e2->save();
            $e3 = new ComplexColumnTypeEntity11();
            $e3->setTags(array('bar23'));
            $e3->save();
        }
    }

    public function testActiveQueryMethods()
    {
        $this->assertTrue(method_exists('ComplexColumnTypeEntity11Query', 'filterByTags'));
        $this->assertTrue(method_exists('ComplexColumnTypeEntity11Query', 'filterByTag'));
        // only plural column names get a singular filter
        $this->assertTrue(method_exists('ComplexColumnTypeEntity11Query', 'filterByValueSet'));
    }

    public function testColumnHydration()
    {
        $e = ComplexColumnTypeEntity11Query::create()->orderById()->offset(1)->findOne();
        $this->assertEquals(array('foo', 'bar', 'baz'), $e->getTags(), 'array columns are correctly hydrated');
    }

    public function testWhere()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->where('ComplexColumnTypeEntity11.Tags LIKE ?', '%| bar23 |%')
            ->find();
        $this->assertEquals(1, $e->count());
        $this->assertEquals(array('bar23'), $e[0]->getTags(), 'array columns are searchable by serialized object using where()');
        $e = ComplexColumnTypeEntity11Query::create()
            ->where('ComplexColumnTypeEntity11.Tags = ?', array('bar23'))
            ->find();
        $this->assertEquals(1, $e->count());
        $this->assertEquals(array('bar23'), $e[0]->getTags(), 'array columns are searchable by object using where()');
    }

    public function testFilterByColumn()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar'))
            ->orderById()
            ->find();
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags(), 'array columns are searchable by element');
        $this->assertEquals(array('bar'), $e[1]->getTags(), 'array columns are searchable by element');
        $this->assertEquals(2, $e->count(), 'array columns do not return false positives');
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar23'))
            ->findOne();
        $this->assertEquals(array('bar23'), $e->getTags(), 'array columns are searchable by element');
    }

    public function testFilterByColumnUsingContainsAll()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array(), Criteria::CONTAINS_ALL)
            ->find();
        $this->assertEquals(4, $e->count());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar'), Criteria::CONTAINS_ALL)
            ->orderById()
            ->find();
        $this->assertEquals(2, $e->count());
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags());
        $this->assertEquals(array('bar'), $e[1]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar23'), Criteria::CONTAINS_ALL)
            ->find();
        $this->assertEquals(1, $e->count());
        $this->assertEquals(array('bar23'), $e[0]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('foo', 'bar'), Criteria::CONTAINS_ALL)
            ->find();
        $this->assertEquals(1, $e->count());
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('foo', 'bar23'), Criteria::CONTAINS_ALL)
            ->find();
        $this->assertEquals(0, $e->count());
    }

    public function testFilterByColumnUsingContainsSome()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array(), Criteria::CONTAINS_SOME)
            ->find();
        $this->assertEquals(4, $e->count());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar'), Criteria::CONTAINS_SOME)
            ->orderById()
            ->find();
        $this->assertEquals(2, $e->count());
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags());
        $this->assertEquals(array('bar'), $e[1]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar23'), Criteria::CONTAINS_SOME)
            ->find();
        $this->assertEquals(1, $e->count());
        $this->assertEquals(array('bar23'), $e[0]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('foo', 'bar'), Criteria::CONTAINS_SOME)
            ->orderById()
            ->find();
        $this->assertEquals(2, $e->count());
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags());
        $this->assertEquals(array('bar'), $e[1]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('foo', 'bar23'), Criteria::CONTAINS_SOME)
            ->find();
        $this->assertEquals(2, $e->count());
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags());
        $this->assertEquals(array('bar23'), $e[1]->getTags());
    }

    public function testFilterByColumnUsingContainsNone()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array(), Criteria::CONTAINS_NONE)
            ->find();
        $this->assertEquals(1, $e->count());
        $this->assertEquals(array(), $e[0]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar'), Criteria::CONTAINS_NONE)
            ->orderById()
            ->find();
        $this->assertEquals(2, $e->count());
        $this->assertEquals(array(), $e[0]->getTags());
        $this->assertEquals(array('bar23'), $e[1]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('bar23'), Criteria::CONTAINS_NONE)
            ->find();
        $this->assertEquals(3, $e->count());
        $this->assertEquals(array(), $e[0]->getTags());
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[1]->getTags());
        $this->assertEquals(array('bar'), $e[2]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('foo', 'bar'), Criteria::CONTAINS_NONE)
            ->orderById()
            ->find();
        $this->assertEquals(2, $e->count());
        $this->assertEquals(array(), $e[0]->getTags());
        $this->assertEquals(array('bar23'), $e[1]->getTags());
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTags(array('foo', 'bar23'), Criteria::CONTAINS_NONE)
            ->find();
        $this->assertEquals(2, $e->count());
        $this->assertEquals(array(), $e[0]->getTags());
        $this->assertEquals(array('bar'), $e[1]->getTags());
    }

    public function testFilterBySingularColumn()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTag('bar')
            ->orderById()
            ->find();
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags(), 'array columns are searchable by element');
        $this->assertEquals(array('bar'), $e[1]->getTags(), 'array columns are searchable by element');
        $this->assertEquals(2, $e->count(), 'array columns do not return false positives');
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTag('bar23')
            ->findOne();
        $this->assertEquals(array('bar23'), $e->getTags(), 'array columns are searchable by element');
    }

    public function testFilterBySingularColumnUsingContainsAll()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTag('bar', Criteria::CONTAINS_ALL)
            ->orderById()
            ->find();
        $this->assertEquals(2, $e->count(), 'array columns are searchable by element using Criteria::CONTAINS_ALL');
        $this->assertEquals(array('foo', 'bar', 'baz'), $e[0]->getTags(), 'array columns are searchable by element using Criteria::CONTAINS_ALL');
        $this->assertEquals(array('bar'), $e[1]->getTags(), 'array columns are searchable by element using Criteria::CONTAINS_ALL');
    }

    public function testFilterBySingularColumnUsingContainsNone()
    {
        $e = ComplexColumnTypeEntity11Query::create()
            ->filterByTag('bar', Criteria::CONTAINS_NONE)
            ->orderById()
            ->find();
        $this->assertEquals(2, $e->count(), 'array columns are searchable by element using Criteria::CONTAINS_NONE');
        $this->assertEquals(array(), $e[0]->getTags(), 'array columns are searchable by element using Criteria::CONTAINS_NONE');
        $this->assertEquals(array('bar23'), $e[1]->getTags(), 'array columns are searchable by element using Criteria::CONTAINS_NONE');
    }
}
