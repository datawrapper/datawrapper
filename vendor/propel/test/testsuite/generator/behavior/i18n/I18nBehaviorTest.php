<?php

/*
 *	$Id: VersionableBehaviorTest.php 1460 2010-01-17 22:36:48Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/i18n/I18nBehavior.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests for I18nBehavior class
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior.i18n
 */
class I18nBehaviorTest extends PHPUnit_Framework_TestCase
{
    public function testModifyDatabaseOverridesDefaultLocale()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <behavior name="i18n">
        <parameter name="default_locale" value="fr_FR" />
    </behavior>
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <behavior name="i18n" />
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
-----------------------------------------------------------------------
-- i18n_behavior_test_0_i18n
-----------------------------------------------------------------------

DROP TABLE IF EXISTS [i18n_behavior_test_0_i18n];

CREATE TABLE [i18n_behavior_test_0_i18n]
(
    [id] INTEGER NOT NULL,
    [locale] VARCHAR(5) DEFAULT 'fr_FR' NOT NULL,
    PRIMARY KEY ([id],[locale])
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    public function testModifyDatabaseDoesNotOverrideTableLocale()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <behavior name="i18n">
        <parameter name="default_locale" value="fr_FR" />
    </behavior>
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <behavior name="i18n">
            <parameter name="default_locale" value="pt_PT" />
        </behavior>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
-----------------------------------------------------------------------
-- i18n_behavior_test_0_i18n
-----------------------------------------------------------------------

DROP TABLE IF EXISTS [i18n_behavior_test_0_i18n];

CREATE TABLE [i18n_behavior_test_0_i18n]
(
    [id] INTEGER NOT NULL,
    [locale] VARCHAR(5) DEFAULT 'pt_PT' NOT NULL,
    PRIMARY KEY ([id],[locale])
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    public function schemaDataProvider()
    {
        $schema1 = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <column name="foo" type="INTEGER" />
        <column name="bar" type="VARCHAR" size="100" />
        <behavior name="i18n">
            <parameter name="i18n_columns" value="bar" />
        </behavior>
    </table>
</database>
EOF;
        $schema2 = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <column name="foo" type="INTEGER" />
        <behavior name="i18n" />
    </table>
    <table name="i18n_behavior_test_0_i18n">
        <column name="id" primaryKey="true" type="INTEGER" />
        <column name="locale" primaryKey="true" type="VARCHAR" size="5" default="en_US" />
        <column name="bar" type="VARCHAR" size="100" />
        <foreign-key foreignTable="i18n_behavior_test_0">
            <reference local="id" foreign="id" />
        </foreign-key>
    </table>
</database>
EOF;

        return array(array($schema1), array($schema2));
    }

    /**
     * @dataProvider schemaDataProvider
     */
    public function testModifyTableAddsI18nTable($schema)
    {
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
-----------------------------------------------------------------------
-- i18n_behavior_test_0_i18n
-----------------------------------------------------------------------

DROP TABLE IF EXISTS [i18n_behavior_test_0_i18n];

CREATE TABLE [i18n_behavior_test_0_i18n]
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    /**
     * @dataProvider schemaDataProvider
     */
    public function testModifyTableRelatesI18nTableToMainTable($schema)
    {
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
-- FOREIGN KEY ([id]) REFERENCES i18n_behavior_test_0 ([id])
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    /**
     * @dataProvider schemaDataProvider
     */
    public function testModifyTableAddsLocaleColumnToI18n($schema)
    {
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
CREATE TABLE [i18n_behavior_test_0_i18n]
(
    [id] INTEGER NOT NULL,
    [locale] VARCHAR(5) DEFAULT 'en_US' NOT NULL,
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    /**
     * @dataProvider schemaDataProvider
     */
    public function testModifyTableMovesI18nColumns($schema)
    {
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
CREATE TABLE [i18n_behavior_test_0_i18n]
(
    [id] INTEGER NOT NULL,
    [locale] VARCHAR(5) DEFAULT 'en_US' NOT NULL,
    [bar] VARCHAR(100),
    PRIMARY KEY ([id],[locale])
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    /**
     * @dataProvider schemaDataProvider
     */
    public function testModifyTableDoesNotMoveNonI18nColumns($schema)
    {
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
CREATE TABLE [i18n_behavior_test_0]
(
    [id] INTEGER NOT NULL PRIMARY KEY,
    [foo] INTEGER
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    public function testModiFyTableMovesValidatorsOnI18nColumns()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <column name="title" type="VARCHAR" />
        <validator column="title">
            <rule name="minLength" value="4" message="title must be at least 4 characters !" />
        </validator>
        <behavior name="i18n">
            <parameter name="i18n_columns" value="title" />
        </behavior>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $table = $builder->getDatabase()->getTable('i18n_behavior_test_0');
        $this->assertEquals(array(), $table->getValidators());
        $i18nTable = $builder->getDatabase()->getTable('i18n_behavior_test_0_i18n');
        $validators = $i18nTable->getValidators();
        $this->assertEquals(1, count($validators));
        $this->assertEquals('title', $validators[0]->getColumnName());
    }

    public function testModiFyTableDoesNotMoveValidatorsOnNonI18nColumns()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <validator column="id">
            <rule name="minLength" value="4" message="title must be at least 4 characters !" />
        </validator>
        <column name="title" type="VARCHAR" />
        <behavior name="i18n">
            <parameter name="i18n_columns" value="title" />
        </behavior>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $table = $builder->getDatabase()->getTable('i18n_behavior_test_0');
        $this->assertEquals(1, count($table->getValidators()));
        $i18nTable = $builder->getDatabase()->getTable('i18n_behavior_test_0_i18n');
        $this->assertEquals(array(), $i18nTable->getValidators());
    }

    public function testModiFyTableUsesCustomI18nTableName()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <behavior name="i18n">
            <parameter name="i18n_table" value="foo_table" />
        </behavior>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
-----------------------------------------------------------------------
-- foo_table
-----------------------------------------------------------------------

DROP TABLE IF EXISTS [foo_table];

CREATE TABLE [foo_table]
(
    [id] INTEGER NOT NULL,
    [locale] VARCHAR(5) DEFAULT 'en_US' NOT NULL,
    PRIMARY KEY ([id],[locale])
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    public function testModiFyTableUsesCustomLocaleColumnName()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <behavior name="i18n">
            <parameter name="locale_column" value="culture" />
        </behavior>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
-----------------------------------------------------------------------
-- i18n_behavior_test_0_i18n
-----------------------------------------------------------------------

DROP TABLE IF EXISTS [i18n_behavior_test_0_i18n];

CREATE TABLE [i18n_behavior_test_0_i18n]
(
    [id] INTEGER NOT NULL,
    [culture] VARCHAR(5) DEFAULT 'en_US' NOT NULL,
    PRIMARY KEY ([id],[culture])
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    public function testModiFyTableUsesCustomLocaleDefault()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <behavior name="i18n">
            <parameter name="default_locale" value="fr_FR" />
        </behavior>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $expected = <<<EOF
-----------------------------------------------------------------------
-- i18n_behavior_test_0_i18n
-----------------------------------------------------------------------

DROP TABLE IF EXISTS [i18n_behavior_test_0_i18n];

CREATE TABLE [i18n_behavior_test_0_i18n]
(
    [id] INTEGER NOT NULL,
    [locale] VARCHAR(5) DEFAULT 'fr_FR' NOT NULL,
    PRIMARY KEY ([id],[locale])
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }

    /**
     * tests if i18n_pk_name options sets the right pk name in i18n table
     */
    public function testModifyTableUseCustomPkName()
    {
        $schema = <<<EOF
<database name="i18n_behavior_test_0">
    <table name="i18n_behavior_test_0">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <behavior name="i18n">
            <parameter name="default_locale" value="fr_FR" />
            <parameter name="i18n_pk_name" value="custom_id" />
        </behavior>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);

        // checks id in base table
        $table = $builder->getDatabase()->getTable('i18n_behavior_test_0');
        $this->assertTrue($table->hasColumn('id'));

        // checks id in i18n table
        $i18nTable = $builder->getDatabase()->getTable('i18n_behavior_test_0_i18n');
        $this->assertTrue($i18nTable->hasColumn('custom_id'));

        // checks foreign key
        $fkList = $i18nTable->getColumnForeignKeys('custom_id');
        $this->assertEquals(count($fkList), 1);
        $fk = array_pop($fkList);
        $this->assertEquals($fk->getForeignTableName(), 'i18n_behavior_test_0');
        $this->assertEquals($fk->getForeignColumnNames(), '[id]');

        $expected = <<<EOF
-----------------------------------------------------------------------
-- i18n_behavior_test_0_i18n
-----------------------------------------------------------------------

DROP TABLE IF EXISTS [i18n_behavior_test_0_i18n];

CREATE TABLE [i18n_behavior_test_0_i18n]
(
    [custom_id] INTEGER NOT NULL,
    [locale] VARCHAR(5) DEFAULT 'fr_FR' NOT NULL,
    PRIMARY KEY ([custom_id],[locale])
);
EOF;
        $this->assertContains($expected, $builder->getSQL());
    }


    public function testTableWithPrefix()
    {
        $schema = <<<EOF
<database name="default" tablePrefix="plop_">
    <table name="group">
        <column name="id" type="integer" required="true" primaryKey="true" autoIncrement="true" />
        <column name="title" type="varchar" primaryString="true" size="255" />

        <behavior name="i18n">
            <parameter name="i18n_columns" value="title" />
            <parameter name="locale_column" value="locale" />
        </behavior>
    </table>
</database>
EOF;

        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);

        $this->assertTrue($builder->getDatabase()->hasTable('plop_group'));
        $this->assertFalse($builder->getDatabase()->hasTable('plop_plop_group_i18n'));
        $this->assertTrue($builder->getDatabase()->hasTable('plop_group_i18n'));
    }
}
