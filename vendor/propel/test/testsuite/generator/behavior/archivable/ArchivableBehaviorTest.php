<?php

/*
 *	$Id$
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/archivable/ArchivableBehavior.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests for ArchivableBehavior class
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior.archivable
 */
class ArchivableBehaviorTest extends PHPUnit_Framework_TestCase
{
    protected static $generatedSQL;

    public function setUp()
    {
        if (!class_exists('ArchivableTest1')) {
            $schema = <<<EOF
<database name="archivable_behavior_test_0">

    <table name="archivable_test_1">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <column name="age" type="INTEGER" />
        <column name="foo_id" type="INTEGER" />
        <foreign-key foreignTable="archivable_test_2">
            <reference local="foo_id" foreign="id" />
        </foreign-key>
        <index>
            <index-column name="title" />
            <index-column name="age" />
        </index>
        <behavior name="archivable" />
    </table>

    <table name="archivable_test_2">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <behavior name="archivable" />
    </table>

    <table name="archivable_test_2_archive">
        <column name="id" required="true" primaryKey="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
    </table>

    <table name="archivable_test_3">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <column name="age" type="INTEGER" />
        <column name="foo_id" type="INTEGER" />
        <unique>
            <unique-column name="title" />
        </unique>
        <behavior name="archivable">
            <parameter name="log_archived_at" value="false" />
            <parameter name="archive_table" value="my_old_archivable_test_3" />
            <parameter name="archive_on_insert" value="true" />
            <parameter name="archive_on_update" value="true" />
            <parameter name="archive_on_delete" value="false" />
        </behavior>
    </table>

    <table name="archivable_test_4">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <column name="age" type="INTEGER" />
        <behavior name="archivable">
            <parameter name="archive_class" value="FooArchive" />
        </behavior>
    </table>

    <table name="archivable_test_5">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <behavior name="archivable">
            <parameter name="archive_table" value="archivable_test_5_backup" />
            <parameter name="archive_phpname" value="ArchivableTest5MyBackup" />
        </behavior>
    </table>

</database>
EOF;
            $builder = new PropelQuickBuilder();
            $builder->setSchema($schema);
            self::$generatedSQL = $builder->getSQL();
            $builder->build();
        }
    }

    public function testCreatesArchiveTable()
    {
        $table = ArchivableTest1Peer::getTableMap();
        $this->assertTrue($table->getDatabaseMap()->hasTable('archivable_test_1_archive'));
        $this->assertSame("ArchivableTest1Archive", $table->getDatabaseMap()->getTable('archivable_test_1_archive')->getPhpName());
    }

    public function testDoesNotCreateCustomArchiveTableIfExists()
    {
        $table = ArchivableTest2Peer::getTableMap();
        $this->assertTrue($table->getDatabaseMap()->hasTable('archivable_test_2_archive'));
    }

    public function testCanCreateCustomArchiveTableName()
    {
        $table = ArchivableTest3Peer::getTableMap();
        $this->assertTrue($table->getDatabaseMap()->hasTable('my_old_archivable_test_3'));
        $this->assertSame("MyOldArchivableTest3", $table->getDatabaseMap()->getTable('my_old_archivable_test_3')->getPhpName());
    }

    public function testDoesNotCreateCustomArchiveTableIfArchiveClassIsSpecified()
    {
        $table = ArchivableTest4Peer::getTableMap();
        $this->assertFalse($table->getDatabaseMap()->hasTable('archivable_test_4_archive'));
    }

    public function testCanCreateCustomArchiveTableNameAndPhpName()
    {
        $table = ArchivableTest5Peer::getTableMap();
        $this->assertTrue($table->getDatabaseMap()->hasTable('archivable_test_5_backup'));
        $this->assertSame("ArchivableTest5MyBackup", $table->getDatabaseMap()->getTable('archivable_test_5_backup')->getPhpName());
    }

    public function testCopiesColumnsToArchiveTable()
    {
        $table = ArchivableTest1ArchivePeer::getTableMap();
        $this->assertTrue($table->hasColumn('id'));
        $this->assertContains('[id] INTEGER NOT NULL,', self::$generatedSQL, 'copied columns are not autoincremented');
        $this->assertTrue($table->hasColumn('title'));
        $this->assertTrue($table->hasColumn('age'));
        $this->assertTrue($table->hasColumn('foo_id'));
    }

    public function testDoesNotCopyForeignKeys()
    {
        $table = ArchivableTest1ArchivePeer::getTableMap();
        $this->assertEquals(array(), $table->getRelations());
    }

    public function testCopiesIndices()
    {
        $table = ArchivableTest1ArchivePeer::getTableMap();

        $expected = "CREATE INDEX [archivable_test_1_archive_I_1] ON [archivable_test_1_archive] ([title],[age]);";
        $this->assertContains($expected, self::$generatedSQL);
    }

    public function testCopiesUniquesToIndices()
    {
        $table = ArchivableTest2ArchivePeer::getTableMap();

        $expected = "CREATE INDEX [my_old_archivable_test_3_I_1] ON [my_old_archivable_test_3] ([title]);";
        $this->assertContains($expected, self::$generatedSQL);
    }

    public function testAddsArchivedAtColumnToArchiveTableByDefault()
    {
        $table = ArchivableTest1ArchivePeer::getTableMap();
        $this->assertTrue($table->hasColumn('archived_at'));
    }

    public function testDoesNotAddArchivedAtColumnToArchiveTableIfSpecified()
    {
        $table = MyOldArchivableTest3Peer::getTableMap();
        $this->assertFalse($table->hasColumn('archived_at'));
    }

    public function testDatabaseLevelBehavior()
    {
            $schema = <<<EOF
<database name="archivable_behavior_test_0">
    <behavior name="archivable" />
    <table name="archivable_test_01">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <behavior name="archivable" />
    </table>
</database>
EOF;
            $builder = new PropelQuickBuilder();
            $builder->setSchema($schema);
            $builder->getSQL();
    }

}
