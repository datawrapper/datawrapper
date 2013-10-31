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
class ArchivableBehaviorObjectBuilderModifierTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        if (!class_exists('ArchivableTest10')) {
            $schema = <<<EOF
<database name="archivable_behavior_test_10">

    <table name="archivable_test_10">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <column name="age" type="INTEGER" />
        <column name="foo_id" type="INTEGER" />
        <foreign-key foreignTable="archivable_test_20">
            <reference local="foo_id" foreign="id" />
        </foreign-key>
        <index>
            <index-column name="title" />
            <index-column name="age" />
        </index>
        <behavior name="archivable" />
    </table>

    <table name="archivable_test_20">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <behavior name="archivable" />
    </table>

    <table name="archivable_test_20_archive">
        <column name="id" required="true" primaryKey="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
    </table>

    <table name="archivable_test_30">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <column name="age" type="INTEGER" />
        <column name="foo_id" type="INTEGER" />
        <behavior name="archivable">
            <parameter name="log_archived_at" value="false" />
            <parameter name="archive_table" value="my_old_archivable_test_30" />
            <parameter name="archive_on_insert" value="true" />
            <parameter name="archive_on_update" value="true" />
            <parameter name="archive_on_delete" value="false" />
        </behavior>
    </table>

    <table name="archivable_test_40">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
        <column name="age" type="INTEGER" />
        <behavior name="archivable">
            <parameter name="archive_class" value="FooArchive" />
        </behavior>
    </table>

</database>
EOF;
            PropelQuickBuilder::buildSchema($schema);
        }
    }

    public function testHasGetArchiveMethod()
    {
        $this->assertTrue(method_exists('ArchivableTest10', 'getArchive'));
    }

    public function testGetArchiveReturnsNullOnNewObjects()
    {
        $a = new ArchivableTest10();
        $this->assertNull($a->getArchive());
    }

    public function testGetArchiveReturnsNullWhenNoArchiveIsFound()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $this->assertNull($a->getArchive());
    }

    public function testGetArchiveReturnsExistingArchive()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $archive = new ArchivableTest10Archive();
        $archive->setId($a->getId());
        $archive->setTitle('bar');
        $archive->save();
        $this->assertSame($archive, $a->getArchive());
    }

    public function testHasArchiveMethod()
    {
        $this->assertTrue(method_exists('ArchivableTest10', 'archive'));
    }

    public function testArchiveCreatesACopyByDefault()
    {
        ArchivableTest10ArchiveQuery::create()->deleteAll();
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $a->archive();
        $archive = ArchivableTest10ArchiveQuery::create()
            ->filterById($a->getId())
            ->findOne();
        $this->assertInstanceOf('ArchivableTest10Archive', $archive);
        $this->assertEquals('foo', $archive->getTitle());
        $this->assertEquals(12, $archive->getAge());
    }

    public function testArchiveUpdatesExistingArchive()
    {
        ArchivableTest10ArchiveQuery::create()->deleteAll();
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $b = new ArchivableTest10Archive();
        $b->setId($a->getId());
        $b->setTitle('bar');
        $b->save();
        $a->archive();
        $this->assertEquals(1, ArchivableTest10ArchiveQuery::create()->count());
        $this->assertEquals('foo', $b->getTitle());
    }

    public function testArchiveUsesArchiveClassIfSpecified()
    {
        $a = new ArchivableTest40();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $a->archive();
        $archive = FooArchiveCollection::getArchiveSingleton();
        $this->assertEquals($a->getId(), $archive->id);
        $this->assertEquals('foo', $archive->title);
        $this->assertEquals(12, $archive->age);
    }

    public function testArchiveReturnsArchivedObject()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->save();
        $ret = $a->archive();
        $this->assertInstanceOf('ArchivableTest10Archive', $ret);
        $this->assertEquals($a->getPrimaryKey(), $ret->getPrimaryKey());
        $this->assertEquals($a->getTitle(), $ret->getTitle());
    }

    /**
     * @expectedException PropelException
     */
    public function testArchiveThrowsExceptionOnNewObjects()
    {
        $a = new ArchivableTest10();
        $a->archive();
    }

    public function testHasRestoreFromArchiveMethod()
    {
        $this->assertTrue(method_exists('ArchivableTest10', 'restoreFromArchive'));
    }

    /**
     * @expectedException PropelException
     */
    public function testRestoreFromArchiveThrowsExceptionOnUnarchivedObjects()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $a->restoreFromArchive();
    }

    public function testRestoreFromArchiveChangesStateToTheArchiveState()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $archive = new ArchivableTest10Archive();
        $archive->setId($a->getId());
        $archive->setTitle('bar');
        $archive->setAge(15);
        $archive->save();
        $a->restoreFromArchive();
        $this->assertEquals('bar', $a->getTitle());
        $this->assertEquals(15, $a->getAge());
    }

    public function testHasPopulateFromArchiveMethod()
    {
        $this->assertTrue(method_exists('ArchivableTest10', 'populateFromArchive'));
    }

    public function testPopulateFromArchiveReturnsCurrentObject()
    {
        $archive = new ArchivableTest10Archive();
        $a = new ArchivableTest10();
        $ret = $a->populateFromArchive($archive);
        $this->assertSame($ret, $a);
    }

    public function testPopulateFromArchive()
    {
        ArchivableTest10ArchiveQuery::create()->deleteAll();
        ArchivableTest10Query::create()->deleteAllWithoutArchive();
        $archive = new ArchivableTest10Archive();
        $archive->setId(123); // not autoincremented
        $archive->setTitle('foo');
        $archive->setAge(12);
        $archive->save();
        $a = new ArchivableTest10();
        $a->populateFromArchive($archive);
        $this->assertNotEquals(123, $a->getId());
        $this->assertEquals('foo', $a->getTitle());
        $this->assertEquals(12, $a->getAge());
        $b = new ArchivableTest10();
        $b->populateFromArchive($archive, true);
        $this->assertEquals(123, $b->getId());
    }

    public function testInsertDoesNotCreateArchiveByDefault()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        ArchivableTest10ArchiveQuery::create()->deleteAll();
        $a->save();
        $this->assertEquals(0, ArchivableTest10ArchiveQuery::create()->count());
    }

    public function testInsertCreatesArchiveIfSpecified()
    {
        $a = new ArchivableTest30();
        $a->setTitle('foo');
        $a->setAge(12);
        MyOldArchivableTest30Query::create()->deleteAll();
        $a->save();
        $this->assertEquals(1, MyOldArchivableTest30Query::create()->count());
        $archive = MyOldArchivableTest30Query::create()
            ->filterById($a->getId())
            ->findOne();
        $this->assertInstanceOf('MyOldArchivableTest30', $archive);
        $this->assertEquals('foo', $archive->getTitle());
        $this->assertEquals(12, $archive->getAge());
    }

    public function testUpdateDoesNotCreateArchiveByDefault()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $a->setTitle('bar');
        ArchivableTest10ArchiveQuery::create()->deleteAll();
        $a->save();
        $this->assertEquals(0, ArchivableTest10ArchiveQuery::create()->count());
    }

    public function testUpdateCreatesArchiveIfSpecified()
    {
        $a = new ArchivableTest30();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $a->setTitle('bar');
        MyOldArchivableTest30Query::create()->deleteAll();
        $a->save();
        $this->assertEquals(1, MyOldArchivableTest30Query::create()->count());
        $archive = MyOldArchivableTest30Query::create()
            ->filterById($a->getId())
            ->findOne();
        $this->assertInstanceOf('MyOldArchivableTest30', $archive);
        $this->assertEquals('bar', $archive->getTitle());
        $this->assertEquals(12, $archive->getAge());
    }

    public function testDeleteCreatesArchiveByDefault()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        ArchivableTest10ArchiveQuery::create()->deleteAll();
        $a->delete();
        $this->assertEquals(1, ArchivableTest10ArchiveQuery::create()->count());
        $archive = ArchivableTest10ArchiveQuery::create()
            ->filterById($a->getId())
            ->findOne();
        $this->assertInstanceOf('ArchivableTest10Archive', $archive);
        $this->assertEquals('foo', $archive->getTitle());
        $this->assertEquals(12, $archive->getAge());
    }

    public function testDeleteDoesNotCreateArchiveIfSpecified()
    {
        $a = new ArchivableTest30();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        MyOldArchivableTest30Query::create()->deleteAll();
        $a->delete();
        $this->assertEquals(0, MyOldArchivableTest30Query::create()->count());
    }

    public function testHasSaveWithoutArchiveMethod()
    {
        $this->assertTrue(method_exists('ArchivableTest30', 'saveWithoutArchive'));
    }

    public function testSaveWithoutArchiveDoesNotCreateArchiveOnInsert()
    {
        $a = new ArchivableTest30();
        $a->setTitle('foo');
        $a->setAge(12);
        MyOldArchivableTest30Query::create()->deleteAll();
        $a->saveWithoutArchive();
        $this->assertEquals(0, MyOldArchivableTest30Query::create()->count());
    }

    public function testSaveWithoutArchiveDoesNotCreateArchiveOnUpdate()
    {
        $a = new ArchivableTest30();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        $a->setTitle('bar');
        MyOldArchivableTest30Query::create()->deleteAll();
        $a->saveWithoutArchive();
        $this->assertEquals(0, MyOldArchivableTest30Query::create()->count());
    }

    public function testHasDeleteWithoutArchiveMethod()
    {
        $this->assertTrue(method_exists('ArchivableTest10', 'deleteWithoutArchive'));
    }

    public function testDeleteWithoutArchiveDoesNotCreateArchive()
    {
        $a = new ArchivableTest10();
        $a->setTitle('foo');
        $a->setAge(12);
        $a->save();
        ArchivableTest10ArchiveQuery::create()->deleteAll();
        $a->deleteWithoutArchive();
        $this->assertEquals(0, ArchivableTest10ArchiveQuery::create()->count());
    }

  public function testArchiveSetArchivedAtToTheCurrentTime()
  {
    $a = new ArchivableTest10();
    $a->setTitle('foo');
    $a->save();
    $ret = $a->archive();
    // time without seconds
    $this->assertEquals(date('Y-m-d H:i'), $ret->getArchivedAt('Y-m-d H:i'));
  }
}

class FooArchiveQuery
{
    protected $pk;

    public static function create()
    {
        return new self();
    }

    public function filterByPrimaryKey($pk)
    {
        $this->pk = $pk;

        return $this;
    }

    public function findOne()
    {
        $archive = FooArchiveCollection::getArchiveSingleton();
        $archive->setId($this->pk);

        return $archive;
    }
}

class FooArchive
{
    public $id, $title, $age;

    public function setId($value)
    {
        $this->id = $value;
    }

    public function setTitle($value)
    {
        $this->title = $value;
    }

    public function setAge($value)
    {
        $this->age = $value;
    }

    public function save()
    {
        return $this;
    }
}

class FooArchiveCollection
{
    protected static $instance;

    public static function getArchiveSingleton()
    {
        if (null === self::$instance) {
            self::$instance = new FooArchive();
        }

        return self::$instance;
    }
}
