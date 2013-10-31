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
 * Tests the generated objects for enum column types accessor & mutator
 *
 * @author     Francois Zaninotto
 * @package    generator.builder.om
 */
class GeneratedObjectEnumColumnTypeTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        if (!class_exists('ComplexColumnTypeEntity3')) {
            $schema = <<<EOF
<database name="generated_object_complex_type_test_3">
    <table name="complex_column_type_entity_3">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <column name="bar" type="ENUM" valueSet="foo, bar, baz, 1, 4,(, foo bar " />
        <column name="bar2" type="ENUM" valueSet="foo, bar" defaultValue="bar" />
    </table>
</database>
EOF;
            PropelQuickBuilder::buildSchema($schema);
            // ok this is hackish but it makes testing of getter and setter independent of each other
            $publicAccessorCode = <<<EOF
class PublicComplexColumnTypeEntity3 extends ComplexColumnTypeEntity3
{
    public \$bar;
}
EOF;
            eval($publicAccessorCode);
        }
    }

    public function testGetter()
    {
        $this->assertTrue(method_exists('ComplexColumnTypeEntity3', 'getBar'));
        $e = new ComplexColumnTypeEntity3();
        $this->assertNull($e->getBar());
        $e = new PublicComplexColumnTypeEntity3();
        $e->bar = 0;
        $this->assertEquals('foo', $e->getBar());
        $e->bar = 3;
        $this->assertEquals('1', $e->getBar());
        $e->bar = 6;
        $this->assertEquals('foo bar', $e->getBar());
    }

    /**
     * @expectedException PropelException
     */
    public function testGetterThrowsExceptionOnUnknownKey()
    {
        $e = new PublicComplexColumnTypeEntity3();
        $e->bar = 156;
        $e->getBar();
    }

    public function testGetterDefaultValue()
    {
        $e = new PublicComplexColumnTypeEntity3();
        $this->assertEquals('bar', $e->getBar2());
    }

    public function testSetter()
    {
        $this->assertTrue(method_exists('ComplexColumnTypeEntity3', 'setBar'));
        $e = new PublicComplexColumnTypeEntity3();
        $e->setBar('foo');
        $this->assertEquals(0, $e->bar);
        $e->setBar(1);
        $this->assertEquals(3, $e->bar);
        $e->setBar('1');
        $this->assertEquals(3, $e->bar);
        $e->setBar('foo bar');
        $this->assertEquals(6, $e->bar);
    }

    /**
     * @expectedException PropelException
     */
    public function testSetterThrowsExceptionOnUnknownValue()
    {
        $e = new ComplexColumnTypeEntity3();
        $e->setBar('bazz');
    }

    public function testValueIsPersisted()
    {
        $e = new ComplexColumnTypeEntity3();
        $e->setBar('baz');
        $e->save();
        ComplexColumnTypeEntity3Peer::clearInstancePool();
        $e = ComplexColumnTypeEntity3Query::create()->findOne();
        $this->assertEquals('baz', $e->getBar());
    }

    public function testValueIsCopied()
    {
        $e1 = new ComplexColumnTypeEntity3();
        $e1->setBar('baz');
        $e2 = new ComplexColumnTypeEntity3();
        $e1->copyInto($e2);
        $this->assertEquals('baz', $e2->getBar());
    }

    /**
     * @see https://github.com/propelorm/Propel/issues/139
     */
    public function testSetterWithSameValueDoesNotUpdateObject()
    {
        $e = new ComplexColumnTypeEntity3();
        $e->setBar('baz');
        $e->resetModified();
        $e->setBar('baz');
        $this->assertFalse($e->isModified());
    }

    /**
     * @see https://github.com/propelorm/Propel/issues/139
     */
    public function testSetterWithSameValueDoesNotUpdateHydratedObject()
    {
        $e = new ComplexColumnTypeEntity3();
        $e->setBar('baz');
        $e->save();
        // force hydration
        ComplexColumnTypeEntity3Peer::clearInstancePool();
        $e = ComplexColumnTypeEntity3Query::create()->findPk($e->getPrimaryKey());
        $e->setBar('baz');
        $this->assertFalse($e->isModified());
    }
}
