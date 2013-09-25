<?php

/*
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/nestedset/NestedSetBehavior.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

class NestedSetBehaviorWithNamespaceTest extends BookstoreTestBase
{
    public function setUp()
    {
        parent::setUp();

        if (!class_exists('My\NestedSet1')) {
            $schema = <<<EOF
<database name="nested_set_database" namespace="My">
    <table name="nested_set_1">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />

        <behavior name="nested_set" />
    </table>
</database>
EOF;

            $builder = new PropelQuickBuilder();
            $builder->setSchema($schema);
            $builder->build();
        }
    }

    public function testActiveRecordApi()
    {
        $this->assertTrue(method_exists('My\NestedSet1', 'getTreeLeft'), 'nested_set adds a tree_left column by default');
        $this->assertTrue(method_exists('My\NestedSet1', 'getLeftValue'), 'nested_set maps the left_value getter with the tree_left column');
        $this->assertTrue(method_exists('My\NestedSet1', 'getTreeRight'), 'nested_set adds a tree_right column by default');
        $this->assertTrue(method_exists('My\NestedSet1', 'getRightValue'), 'nested_set maps the right_value getter with the tree_right column');
        $this->assertTrue(method_exists('My\NestedSet1', 'getTreeLevel'), 'nested_set adds a tree_level column by default');
        $this->assertTrue(method_exists('My\NestedSet1', 'getLevel'), 'nested_set maps the level getter with the tree_level column');
        $this->assertFalse(method_exists('My\NestedSet1', 'getTreeScope'), 'nested_set does not add a tree_scope column by default');
        $this->assertFalse(method_exists('My\NestedSet1', 'getScopeValue'), 'nested_set does not map the scope_value getter with the tree_scope column by default');
    }

    public function testAddChild()
    {
        $obj1 = new \My\NestedSet1();
        $obj1->save();

        $obj1->addChild(new \My\NestedSet1());
    }
}
