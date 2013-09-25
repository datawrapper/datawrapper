<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/nestedset/NestedSetBehavior.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/platform/MysqlPlatform.php';

/**
 * Tests for NestedSetBehavior class
 *
 * @author		François Zaninotto
 * @package		generator.behavior.nestedset
 */
class NestedSetBehaviorTest extends BookstoreTestBase
{
    public function testDefault()
    {
        $table9 = Table9Peer::getTableMap();
        $this->assertEquals(count($table9->getColumns()), 5, 'nested_set adds three column by default');
        $this->assertTrue(method_exists('Table9', 'getTreeLeft'), 'nested_set adds a tree_left column by default');
        $this->assertTrue(method_exists('Table9', 'getLeftValue'), 'nested_set maps the left_value getter with the tree_left column');
        $this->assertTrue(method_exists('Table9', 'getTreeRight'), 'nested_set adds a tree_right column by default');
        $this->assertTrue(method_exists('Table9', 'getRightValue'), 'nested_set maps the right_value getter with the tree_right column');
        $this->assertTrue(method_exists('Table9', 'getTreeLevel'), 'nested_set adds a tree_level column by default');
        $this->assertTrue(method_exists('Table9', 'getLevel'), 'nested_set maps the level getter with the tree_level column');
        $this->assertFalse(method_exists('Table9', 'getTreeScope'), 'nested_set does not add a tree_scope column by default');
        $this->assertFalse(method_exists('Table9', 'getScopeValue'), 'nested_set does not map the scope_value getter with the tree_scope column by default');

    }

    public function testParameters()
    {
        $table10 = Table10Peer::getTableMap();
        $this->assertEquals(count($table10->getColumns()), 6, 'nested_set does not add columns when they already exist');
        $this->assertTrue(method_exists('Table10', 'getLeftValue'), 'nested_set maps the left_value getter with the tree_left column');
        $this->assertTrue(method_exists('Table10', 'getRightValue'), 'nested_set maps the right_value getter with the tree_right column');
        $this->assertTrue(method_exists('Table10', 'getLevel'), 'nested_set maps the level getter with the tree_level column');
        $this->assertTrue(method_exists('Table10', 'getScopeValue'), 'nested_set maps the scope_value getter with the tree_scope column when the use_scope parameter is true');
    }

    public function testGeneratedSqlForMySQL()
    {
        $schema = <<<XML
<database name="default">
    <table name="thread">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
    </table>
    <table name="post">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="body" type="VARCHAR" required="true" primaryString="true" />

        <foreign-key foreignTable="thread" onDelete="cascade">
            <reference local="thread_id" foreign="id" />
        </foreign-key>

        <behavior name="nested_set">
            <parameter name="use_scope" value="true" />
            <parameter name="scope_column" value="thread_id" />
        </behavior>

        <vendor type="mysql">
            <parameter name="Engine" value="InnoDB"/>
        </vendor>
    </table>
</database>
XML;
        $expectedSql = <<<SQL

# This is a fix for InnoDB in MySQL >= 4.1.x
# It "suspends judgement" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- thread
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `thread`;

CREATE TABLE `thread`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (`id`)
) ENGINE=MyISAM;

-- ---------------------------------------------------------------------
-- post
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `post`;

CREATE TABLE `post`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `body` VARCHAR(255) NOT NULL,
    `tree_left` INTEGER,
    `tree_right` INTEGER,
    `tree_level` INTEGER,
    `thread_id` INTEGER,
    PRIMARY KEY (`id`),
    INDEX `post_FI_1` (`thread_id`),
    CONSTRAINT `post_FK_1`
        FOREIGN KEY (`thread_id`)
        REFERENCES `thread` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;

SQL;
        $builder = new PropelQuickBuilder();
        $builder->setPlatform(new MysqlPlatform());
        $builder->setSchema($schema);

        $this->assertEquals($expectedSql, $builder->getSQL());
    }
}
