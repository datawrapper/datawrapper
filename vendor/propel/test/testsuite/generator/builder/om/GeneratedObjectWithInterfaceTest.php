<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';

class GeneratedObjectWithInterfaceTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        if (!class_exists('Foo\MyClassWithInterface')) {
            $schema = <<<EOF
<database name="a-database" namespace="Foo">
    <table name="my_class_with_interface" interface="MyInterface">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="name" type="VARCHAR" />
    </table>

    <table name="my_class_without_interface">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="name" type="VARCHAR" />
    </table>
</database>
EOF;
            $builder = new PropelQuickBuilder();
            $builder->setSchema($schema);
            $builder->buildClasses();
        }
    }

    public function testClassHasInterface()
    {
        $this->assertInstanceOf('Foo\MyInterface', new \Foo\MyClassWithInterface());
    }

    public function testClassHasDefaultInterface()
    {
        $this->assertInstanceOf('Persistent', new \Foo\MyClassWithoutInterface());
    }
}
