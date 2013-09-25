<?php

/*
 *	$Id$
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/sortable/SortableBehavior.php';

/**
 * Tests for SortableBehavior class
 *
 * @author		Massimiliano Arione
 * @version		$Revision$
 * @package		generator.behavior.sortable
 */
class SortableBehaviorTest extends BookstoreTestBase
{
    public function setUp()
    {
        parent::setUp();

        if (!class_exists('Test\SortableTest1')) {
            $schema = <<<EOF
<database name="sortable_behavior_test_0" namespace="Test">

    <table name="sortable_test_1">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <behavior name="sortable" />
    </table>
</database>
EOF;

            $builder = new PropelQuickBuilder();
            $builder->setSchema($schema);
            $builder->build();
        }
    }

    /**
     * See: https://github.com/propelorm/Propel/issues/515
     *
     */
    public function testShiftRank()
    {
        $peer = new \Test\SortableTest1Peer();
        $peer->shiftRank(1); //should not throw any exception
    }

    public function testParameters()
    {
        $table11 = Table11Peer::getTableMap();
        $this->assertEquals(count($table11->getColumns()), 3, 'Sortable adds one columns by default');
        $this->assertTrue(method_exists('Table11', 'getRank'), 'Sortable adds a rank column by default');

        $table12 = Table12Peer::getTableMap();
        $this->assertEquals(count($table12->getColumns()), 4, 'Sortable does not add a column when it already exists');
        $this->assertTrue(method_exists('Table12', 'getPosition'), 'Sortable allows customization of rank_column name');
    }
}
