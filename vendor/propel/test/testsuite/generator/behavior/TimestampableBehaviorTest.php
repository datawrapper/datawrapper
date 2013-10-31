<?php

/*
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/config/GeneratorConfig.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/Behavior.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/behavior/TimestampableBehavior.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/util/PropelQuickBuilder.php';

/**
 * Tests for TimestampableBehavior class
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior
 */
class TimestampableBehaviorTest extends BookstoreTestBase
{
    public function testParameters()
    {
        $table2 = Table2Peer::getTableMap();
        $this->assertEquals(count($table2->getColumns()), 4, 'Timestampable adds two columns by default');
        $this->assertTrue(method_exists('Table2', 'getCreatedAt'), 'Timestamplable adds a created_at column by default');
        $this->assertTrue(method_exists('Table2', 'getUpdatedAt'), 'Timestamplable adds an updated_at column by default');
        $table1 = Table1Peer::getTableMap();
        $this->assertEquals(count($table1->getColumns()), 4, 'Timestampable does not add two columns when they already exist');
        $this->assertTrue(method_exists('Table1', 'getCreatedOn'), 'Timestamplable allows customization of create_column name');
        $this->assertTrue(method_exists('Table1', 'getUpdatedOn'), 'Timestamplable allows customization of update_column name');
    }

    public function testPreSave()
    {
        $t1 = new Table2();
        $this->assertNull($t1->getUpdatedAt());
        $tsave = time();
        $t1->save();
        $this->assertEquals($t1->getUpdatedAt('U'), $tsave, 'Timestampable sets updated_column to time() on creation');
        sleep(1);
        $t1->setTitle('foo');
        $tupdate = time();
        $t1->save();
        $this->assertEquals($t1->getUpdatedAt('U'), $tupdate, 'Timestampable changes updated_column to time() on update');
    }

    public function testPreSaveNoChange()
    {
        $t1 = new Table2();
        $this->assertNull($t1->getUpdatedAt());
        $tsave = time();
        $t1->save();
        $this->assertEquals($t1->getUpdatedAt('U'), $tsave, 'Timestampable sets updated_column to time() on creation');
        sleep(1);
        $tupdate = time();
        $t1->save();
        $this->assertEquals($t1->getUpdatedAt('U'), $tsave, 'Timestampable only changes updated_column if the object was modified');
    }

    public function testPreSaveManuallyUpdated()
    {
        $t1 = new Table2();
        $t1->setUpdatedAt(time() - 10);
        $tsave = time();
        $t1->save();
        $this->assertNotEquals($t1->getUpdatedAt('U'), $tsave, 'Timestampable does not set updated_column to time() on creation when it is set by the user');
        // tip: if I set it to time()-10 a second time, the object sees that I want to change it to the same value
        // and skips the update, therefore the updated_at is not in the list of modified columns,
        // and the behavior changes it to the current date... let's say it's an edge case
        $t1->setUpdatedAt(time() - 15);
        $tupdate = time();
        $t1->save();
        $this->assertNotEquals($t1->getUpdatedAt('U'), $tupdate, 'Timestampable does not change updated_column to time() on update when it is set by the user');
    }

    public function testPreInsert()
    {
        $t1 = new Table2();
        $this->assertNull($t1->getCreatedAt());
        $tsave = time();
        $t1->save();
        $this->assertEquals($t1->getCreatedAt('U'), $tsave, 'Timestampable sets created_column to time() on creation');
        sleep(1);
        $t1->setTitle('foo');
        $tupdate = time();
        $t1->save();
        $this->assertEquals($t1->getCreatedAt('U'), $tsave, 'Timestampable does not update created_column on update');
    }

    public function testPreInsertManuallyUpdated()
    {
        $t1 = new Table2();
        $t1->setCreatedAt(time() - 10);
        $tsave = time();
        $t1->save();
        $this->assertNotEquals($t1->getCreatedAt('U'), $tsave, 'Timestampable does not set created_column to time() on creation when it is set by the user');
    }

    public function testObjectKeepUpdateDateUnchanged()
    {
        $t1 = new Table2();
        $t1->setUpdatedAt(time() - 10);
        $tsave = time();
        $t1->save();
        $this->assertNotEquals($t1->getUpdatedAt('U'), $tsave);
        // let's save it a second time; the updated_at should be changed
        $t1->setTitle('foo');
        $tsave = time();
        $t1->save();
        $this->assertEquals($t1->getUpdatedAt('U'), $tsave);

        // now let's do this a second time
        $t1 = new Table2();
        $t1->setUpdatedAt(time() - 10);
        $tsave = time();
        $t1->save();
        $this->assertNotEquals($t1->getUpdatedAt('U'), $tsave);
        // let's save it a second time; the updated_at should be changed
        $t1->keepUpdateDateUnchanged();
        $t1->setTitle('foo');
        $tsave = time();
        $t1->save();
        $this->assertNotEquals($t1->getUpdatedAt('U'), $tsave, 'keepUpdateDateUnchanged() prevents the behavior from updating the update date');

    }

    protected function populateUpdatedAt()
    {
        Table2Query::create()->deleteAll();
        $ts = new PropelObjectCollection();
        $ts->setModel('Table2');
        for ($i=0; $i < 10; $i++) {
            $t = new Table2();
            $t->setTitle('UpdatedAt' . $i);
            /* additional -30 in case the check is done in the same second (which we can't guarantee, so no assert(8 ...) below).*/
            $t->setUpdatedAt(time() - $i * 24 * 60 * 60 - 30);
            $ts[]= $t;
        }
        $ts->save();
    }

    protected function populateCreatedAt()
    {
        Table2Query::create()->deleteAll();
        $ts = new PropelObjectCollection();
        $ts->setModel('Table2');
        for ($i=0; $i < 10; $i++) {
            $t = new Table2();
            $t->setTitle('CreatedAt' . $i);
            $t->setCreatedAt(time() - $i * 24 * 60 * 60 - 30);
            $ts[]= $t;
        }
        $ts->save();
    }

    public function testQueryRecentlyUpdated()
    {
        $q = Table2Query::create()->recentlyUpdated();
        $this->assertTrue($q instanceof Table2Query, 'recentlyUpdated() returns the current Query object');
        $this->populateUpdatedAt();
        $ts = Table2Query::create()->recentlyUpdated()->count();
        $this->assertEquals(7, $ts, 'recentlyUpdated() returns the elements updated in the last 7 days by default');
        $ts = Table2Query::create()->recentlyUpdated(5)->count();
        $this->assertEquals(5, $ts, 'recentlyUpdated() accepts a number of days as parameter');
    }

    public function testQueryRecentlyCreated()
    {
        $q = Table2Query::create()->recentlyCreated();
        $this->assertTrue($q instanceof Table2Query, 'recentlyCreated() returns the current Query object');
        $this->populateCreatedAt();
        $ts = Table2Query::create()->recentlyCreated()->count();
        $this->assertEquals(7, $ts, 'recentlyCreated() returns the elements created in the last 7 days by default');
        $ts = Table2Query::create()->recentlyCreated(5)->count();
        $this->assertEquals(5, $ts, 'recentlyCreated() accepts a number of days as parameter');
    }

    public function testQueryLastUpdatedFirst()
    {
        $q = Table2Query::create()->lastUpdatedFirst();
        $this->assertTrue($q instanceof Table2Query, 'lastUpdatedFirst() returns the current Query object');
        $this->populateUpdatedAt();
        $t = Table2Query::create()->lastUpdatedFirst()->findOne();
        $this->assertEquals('UpdatedAt0', $t->getTitle(), 'lastUpdatedFirst() returns element with most recent update date first');
    }

    public function testQueryFirstUpdatedFirst()
    {
        $q = Table2Query::create()->firstUpdatedFirst();
        $this->assertTrue($q instanceof Table2Query, 'firstUpdatedFirst() returns the current Query object');
        $this->populateUpdatedAt();
        $t = Table2Query::create()->firstUpdatedFirst()->findOne();
        $this->assertEquals('UpdatedAt9', $t->getTitle(), 'firstUpdatedFirst() returns the element with oldest updated date first');
    }

    public function testQueryLastCreatedFirst()
    {
        $q = Table2Query::create()->lastCreatedFirst();
        $this->assertTrue($q instanceof Table2Query, 'lastCreatedFirst() returns the current Query object');
        $this->populateCreatedAt();
        $t = Table2Query::create()->lastCreatedFirst()->findOne();
        $this->assertEquals('CreatedAt0', $t->getTitle(), 'lastCreatedFirst() returns element with most recent create date first');
    }

    public function testQueryFirstCreatedFirst()
    {
        $q = Table2Query::create()->firstCreatedFirst();
        $this->assertTrue($q instanceof Table2Query, 'firstCreatedFirst() returns the current Query object');
        $this->populateCreatedAt();
        $t = Table2Query::create()->firstCreatedFirst()->findOne();
        $this->assertEquals('CreatedAt9', $t->getTitle(), 'firstCreatedFirst() returns the element with oldest create date first');
    }

    public function testDisableUpdatedAt()
    {
        $schema = <<<EOF
<database name="timestampable_database">
    <table name="table_without_updated_at">
        <column name="id" type="INTEGER" primaryKey="true" />

        <behavior name="timestampable">
            <parameter name="disable_updated_at" value="true" />
        </behavior>
    </table>
</database>
EOF;

        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $builder->build();

        $this->assertTrue(method_exists('TableWithoutUpdatedAt', 'getCreatedAt'));
        $this->assertTrue(method_exists('TableWithoutUpdatedAt', 'setCreatedAt'));
        $this->assertFalse(method_exists('TableWithoutUpdatedAt', 'getUpdatedAt'));
        $this->assertFalse(method_exists('TableWithoutUpdatedAt', 'setUpdatedAt'));

        $obj = new TableWithoutUpdatedAt();
        $this->assertNull($obj->getCreatedAt());
        $this->assertEquals(1, $obj->save());
        $this->assertNotNull($obj->getCreatedAt());
    }
}
