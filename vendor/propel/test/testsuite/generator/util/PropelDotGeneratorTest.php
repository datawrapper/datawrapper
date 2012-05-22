<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/util/PropelDotGenerator.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/AppData.php';

/**
 *
 * @package    generator.util
 */
class PropelDotGeneratorTest extends PHPUnit_Framework_TestCase
{
    public function testEmptyDatabase()
    {
        $db = new Database();
        $db->setName('Empty');

        $expected = implode("\n", array(
            'digraph G {',
            '}',
            '',
        ));
        $this->assertEquals($expected, PropelDotGenerator::create($db));
    }

    public function testSingleTableWithoutName()
    {
        $column = new Column();
        $column->setName('id');
        $column->setPrimaryKey(true);
        $column->setAutoIncrement(true);
        $column->setType('integer');

        $table = new Table();
        $table->addColumn($column);

        $db = new Database();
        $db->setName('SingleTable');
        $db->addTable($table);

        $expected = implode("\n", array(
            'digraph G {',
                'node [label="{<table>|<cols>id (integer) [PK]\l}", shape=record];',
            '}',
            '',
        ));
        $this->assertEquals($expected, PropelDotGenerator::create($db));
    }

    public function testMultipleTablesWithoutForeignKey()
    {
        $column = new Column();
        $column->setName('id');
        $column->setPrimaryKey(true);
        $column->setAutoIncrement(true);
        $column->setType('integer');

        $table = new Table();
        $table->setCommonName('table_one');
        $table->addColumn($column);

        $db = new Database();
        $db->setName('MultipleTables');
        $db->addTable($table);

        $column = new Column();
        $column->setName('id');
        $column->setPrimaryKey(true);
        $column->setAutoIncrement(true);
        $column->setType('integer');

        $table = new Table();
        $table->setCommonName('table_two');
        $table->addColumn($column);
        $db->addTable($table);

        $expected = implode("\n", array(
            'digraph G {',
                'nodetable_one [label="{<table>table_one|<cols>id (integer) [PK]\l}", shape=record];',
                'nodetable_two [label="{<table>table_two|<cols>id (integer) [PK]\l}", shape=record];',
            '}',
            '',
        ));
        $this->assertEquals($expected, PropelDotGenerator::create($db));
    }

    public function testMultipleTablesWithFK()
    {
        $column = new Column();
        $column->setName('id');
        $column->setPrimaryKey(true);
        $column->setAutoIncrement(true);
        $column->setType('integer');

        $table = new Table();
        $table->setCommonName('table_one');
        $table->addColumn($column);

        $db = new Database();
        $db->setName('MultipleTables');
        $db->addTable($table);

        $column = new Column();
        $column->setName('id');
        $column->setPrimaryKey(true);
        $column->setAutoIncrement(true);
        $column->setType('integer');

        $c2 = new Column();
        $c2->setName('foreign_id');
        $c2->setType('integer');

        $table = new Table();
        $table->setCommonName('table_two');
        $table->addColumn($column);
        $table->addColumn($c2);

        $fk = new ForeignKey();
        $fk->setName('FK_1');
        $fk->addReference('foreign_id', 'id');
        $fk->setForeignTableCommonName('table_one');

        $table->addForeignKey($fk);

        $db->addTable($table);

        $expected = implode("\n", array(
            'digraph G {',
                'nodetable_one [label="{<table>table_one|<cols>id (integer) [PK]\l}", shape=record];',
                'nodetable_two [label="{<table>table_two|<cols>id (integer) [PK]\lforeign_id (integer) [FK]\l}", shape=record];',
                'nodetable_two:cols -> nodetable_one:table [label="foreign_id=id"];',
            '}',
            '',
        ));
        $this->assertEquals($expected, PropelDotGenerator::create($db));
    }

    public function testColumnIsFKAndPK()
    {
        $column = new Column();
        $column->setName('id');
        $column->setPrimaryKey(true);
        $column->setAutoIncrement(true);
        $column->setType('integer');

        $table = new Table();
        $table->setCommonName('table_one');
        $table->addColumn($column);

        $db = new Database();
        $db->setName('MultipleTables');
        $db->addTable($table);

        $column = new Column();
        $column->setName('id');
        $column->setPrimaryKey(true);
        $column->setAutoIncrement(true);
        $column->setType('integer');

        $c2 = new Column();
        $c2->setPrimaryKey(true);
        $c2->setName('foreign_id');
        $c2->setType('integer');

        $table = new Table();
        $table->setCommonName('table_two');
        $table->addColumn($column);
        $table->addColumn($c2);

        $fk = new ForeignKey();
        $fk->setName('FK_1');
        $fk->addReference('foreign_id', 'id');
        $fk->setForeignTableCommonName('table_one');

        $table->addForeignKey($fk);

        $db->addTable($table);

        $expected = implode("\n", array(
            'digraph G {',
                'nodetable_one [label="{<table>table_one|<cols>id (integer) [PK]\l}", shape=record];',
                'nodetable_two [label="{<table>table_two|<cols>id (integer) [PK]\lforeign_id (integer) [FK] [PK]\l}", shape=record];',
                'nodetable_two:cols -> nodetable_one:table [label="foreign_id=id"];',
            '}',
            '',
        ));
        $this->assertEquals($expected, PropelDotGenerator::create($db));
    }
}
