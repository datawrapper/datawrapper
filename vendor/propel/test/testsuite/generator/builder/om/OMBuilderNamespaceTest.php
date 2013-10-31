<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/model/Database.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/Table.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/builder/om/OMBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/platform/MysqlPlatform.php';

/**
 * Test class for OMBuilder.
 *
 * @author     François Zaninotto
 * @version    $Id: OMBuilderBuilderTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    generator.builder.om
 */
class OMBuilderNamespaceTest extends PHPUnit_Framework_TestCase
{
    public function testNoNamespace()
    {
        $d = new Database('fooDb');
        $t = new Table('fooTable');
        $d->addTable($t);
        $builder = new TestableOMBuilder2($t);
        $this->assertNull($builder->getNamespace(), 'Builder namespace is null when neither the db nor the table have namespace');
    }

    public function testDbNamespace()
    {
        $d = new Database('fooDb');
        $d->setNamespace('Foo\\Bar');
        $t = new Table('fooTable');
        $d->addTable($t);
        $builder = new TestableOMBuilder2($t);
        $this->assertEquals('Foo\\Bar', $builder->getNamespace(), 'Builder namespace is the database namespace when no table namespace is set');
    }

    public function testTableNamespace()
    {
        $d = new Database('fooDb');
        $t = new Table('fooTable');
        $t->setNamespace('Foo\\Bar');
        $d->addTable($t);
        $builder = new TestableOMBuilder2($t);
        $this->assertEquals('Foo\\Bar', $builder->getNamespace(), 'Builder namespace is the table namespace when no database namespace is set');
    }

    public function testAbsoluteTableNamespace()
    {
        $d = new Database('fooDb');
        $t = new Table('fooTable');
        $t->setNamespace('\\Foo\\Bar');
        $d->addTable($t);
        $builder = new TestableOMBuilder2($t);
        $this->assertEquals('Foo\\Bar', $builder->getNamespace(), 'Builder namespace is the table namespace when it is set as absolute');
    }

    public function testAbsoluteTableNamespaceAndDbNamespace()
    {
        $d = new Database('fooDb');
        $d->setNamespace('Baz');
        $t = new Table('fooTable');
        $t->setNamespace('\\Foo\\Bar');
        $d->addTable($t);
        $builder = new TestableOMBuilder2($t);
        $this->assertEquals('Foo\\Bar', $builder->getNamespace(), 'Builder namespace is the table namespace when it is set as absolute');
    }

    public function testTableNamespaceAndDbNamespace()
    {
        $d = new Database('fooDb');
        $d->setNamespace('Baz');
        $t = new Table('fooTable');
        $t->setNamespace('Foo\\Bar');
        $d->addTable($t);
        $builder = new TestableOMBuilder2($t);
        $this->assertEquals('Baz\\Foo\\Bar', $builder->getNamespace(), 'Builder namespace is composed from the database and table namespaces when both are set');
    }

    public function testDeclareClassNamespace()
    {
        $builder = new TestableOMBuilder2(new Table('fooTable'));
        $builder->declareClassNamespace('Foo');
        $this->assertEquals(array('' => array('Foo')), $builder->getDeclaredClasses());
        $builder->declareClassNamespace('Bar');
        $this->assertEquals(array('' => array('Foo', 'Bar')), $builder->getDeclaredClasses());
        $builder->declareClassNamespace('Foo');
        $this->assertEquals(array('' => array('Foo', 'Bar')), $builder->getDeclaredClasses());
        $builder = new TestableOMBuilder2(new Table('fooTable'));
        $builder->declareClassNamespace('Foo', 'Foo');
        $this->assertEquals(array('Foo' => array('Foo')), $builder->getDeclaredClasses());
        $builder->declareClassNamespace('Bar', 'Foo');
        $this->assertEquals(array('Foo' => array('Foo', 'Bar')), $builder->getDeclaredClasses());
        $builder->declareClassNamespace('Foo', 'Foo');
        $this->assertEquals(array('Foo' => array('Foo', 'Bar')), $builder->getDeclaredClasses());
        $builder->declareClassNamespace('Bar', 'Bar');
        $this->assertEquals(array('Foo' => array('Foo', 'Bar'), 'Bar' => array('Bar')), $builder->getDeclaredClasses());
    }

    public function testGetDeclareClass()
    {
        $builder = new TestableOMBuilder2(new Table('fooTable'));
        $this->assertEquals(array(), $builder->getDeclaredClasses());
        $builder->declareClass('\\Foo');
        $this->assertEquals(array('Foo'), $builder->getDeclaredClasses(''));
        $builder->declareClass('Bar');
        $this->assertEquals(array('Foo', 'Bar'), $builder->getDeclaredClasses(''));
        $builder->declareClass('Foo\\Bar');
        $this->assertEquals(array('Bar'), $builder->getDeclaredClasses('Foo'));
        $builder->declareClass('Foo\\Bar\\Baz');
        $this->assertEquals(array('Bar'), $builder->getDeclaredClasses('Foo'));
        $this->assertEquals(array('Baz'), $builder->getDeclaredClasses('Foo\\Bar'));
        $builder->declareClass('\\Hello\\World');
        $this->assertEquals(array('World'), $builder->getDeclaredClasses('Hello'));
    }

    public function testDeclareClasses()
    {
        $builder = new TestableOMBuilder2(new Table('fooTable'));
        $builder->declareClasses('Foo', '\\Bar', 'Baz\\Baz', 'Hello\\Cruel\\World');
        $expected = array(
            ''             => array('Foo', 'Bar'),
            'Baz'          => array('Baz'),
            'Hello\\Cruel' => array('World')
        );
        $this->assertEquals($expected, $builder->getDeclaredClasses());
    }
}

class TestableOMBuilder2 extends OMBuilder
{
    public static function getRelatedBySuffix(ForeignKey $fk)
    {
        return parent::getRelatedBySuffix($fk);
    }

    public static function getRefRelatedBySuffix(ForeignKey $fk)
    {
        return parent::getRefRelatedBySuffix($fk);
    }

    public function getUnprefixedClassname() {}
}
