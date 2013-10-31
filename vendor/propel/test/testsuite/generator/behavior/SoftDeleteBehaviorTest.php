<?php

/*
 *	$Id$
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Tests for SoftDeleteBehavior class
 *
 * @author		 François Zaninotto
 * @version		$Revision$
 * @package		generator.behavior
 */
class SoftDeleteBehaviorTest extends BookstoreTestBase
{

    protected function setUp()
    {
        parent::setUp();
        Table4Peer::disableSoftDelete();
        Table4Peer::doDeleteAll();
        Table4Peer::enableSoftDelete();
    }

    public function testParameters()
    {
        $table2 = Table4Peer::getTableMap();
        $this->assertEquals(count($table2->getColumns()), 3, 'SoftDelete adds one columns by default');
        $this->assertTrue(method_exists('Table4', 'getDeletedAt'), 'SoftDelete adds an updated_at column by default');
        $table1 = Table5Peer::getTableMap();
        $this->assertEquals(count($table1->getColumns()), 3, 'SoftDelete does not add a column when it already exists');
        $this->assertTrue(method_exists('Table5', 'getDeletedOn'), 'SoftDelete allows customization of deleted_column name');
    }

    public function testStaticSoftDeleteStatus()
    {
        $this->assertTrue(Table4Peer::isSoftDeleteEnabled(), 'The static soft delete is enabled by default');
        Table4Peer::disableSoftDelete();
        $this->assertFalse(Table4Peer::isSoftDeleteEnabled(), 'disableSoftDelete() disables the static soft delete');
        Table4Peer::enableSoftDelete();
        $this->assertTrue(Table4Peer::isSoftDeleteEnabled(), 'enableSoftDelete() enables the static soft delete');
    }

    public function testInstancePoolingAndSoftDelete()
    {
        Table4Peer::doForceDeleteAll($this->con);
        $t = new Table4();
        $t->save($this->con);
        Table4Peer::enableSoftDelete();
        $t->delete($this->con);
        $t2 = Table4Peer::retrieveByPk($t->getPrimaryKey(), $this->con);
        $this->assertNull($t2, 'An object is removed from the instance pool on soft deletion');
        Table4Peer::disableSoftDelete();
        $t2 = Table4Peer::retrieveByPk($t->getPrimaryKey(), $this->con);
        $this->assertNotNull($t2);
        Table4Peer::enableSoftDelete();
        $t2 = Table4Peer::retrieveByPk($t->getPrimaryKey(), $this->con);
        $this->assertNull($t2, 'A soft deleted object is removed from the instance pool when the soft delete behavior is enabled');
    }

    public function testStaticDoForceDelete()
    {
        $t1 = new Table4();
        $t1->save();
        Table4Peer::doForceDelete($t1);
        Table4Peer::disableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria()), 'doForceDelete() actually deletes records');
    }

    public function testStaticDoSoftDelete()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        $t3 = new Table4();
        $t3->save();
        // softDelete with a criteria
        $c = new Criteria();
        $c->add(Table4Peer::ID, $t1->getId());
        Table4Peer::doSoftDelete($c);
        Table4Peer::disableSoftDelete();
        $this->assertEquals(3, Table4Peer::doCount(new Criteria()), 'doSoftDelete() keeps deleted record in the database');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(2, Table4Peer::doCount(new Criteria()), 'doSoftDelete() marks deleted record as deleted');
        // softDelete with a value
        Table4Peer::doSoftDelete(array($t2->getId()));
        Table4Peer::disableSoftDelete();
        $this->assertEquals(3, Table4Peer::doCount(new Criteria()), 'doSoftDelete() keeps deleted record in the database');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(1, Table4Peer::doCount(new Criteria()), 'doSoftDelete() marks deleted record as deleted');
        // softDelete with an object
        Table4Peer::doSoftDelete($t3);
        Table4Peer::disableSoftDelete();
        $this->assertEquals(3, Table4Peer::doCount(new Criteria()), 'doSoftDelete() keeps deleted record in the database');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria()), 'doSoftDelete() marks deleted record as deleted');
    }

    public function testStaticDoDelete()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        Table4Peer::disableSoftDelete();
        Table4Peer::doDelete($t1);
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Peer::doCount(new Criteria()), 'doDelete() calls doForceDelete() when soft delete is disabled');
        Table4Peer::enableSoftDelete();
        Table4Peer::doDelete($t2);
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Peer::doCount(new Criteria()), 'doDelete() calls doSoftDelete() when soft delete is enabled');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria()), 'doDelete() calls doSoftDelete() when soft delete is enabled');
    }

    public function testStaticDoForceDeleteAll()
    {
        $t1 = new Table4();
        $t1->save();
        Table4Peer::doForceDeleteAll();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria()), 'doForceDeleteAll() actually deletes records');
    }

    public function testStaticDoSoftDeleteAll()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        Table4Peer::enableSoftDelete();
        Table4Peer::doSoftDeleteAll();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(2, Table4Peer::doCount(new Criteria()), 'doSoftDeleteAll() keeps deleted record in the database');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria()), 'doSoftDeleteAll() marks deleted record as deleted');
    }

    public function testStaticDoDeleteAll()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        Table4Peer::disableSoftDelete();
        Table4Peer::doDeleteAll();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria()), 'doDeleteAll() calls doForceDeleteAll() when soft delete is disabled');
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        Table4Peer::enableSoftDelete();
        Table4Peer::doDeleteAll();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(2, Table4Peer::doCount(new Criteria()), 'doDeleteAll() calls doSoftDeleteAll() when soft delete is disabled');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria()), 'doDeleteAll() calls doSoftDeleteAll() when soft delete is disabled');
    }

    public function testSelect()
    {
        $t = new Table4();
        $t->setDeletedAt(123);
        $t->save();
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria), 'rows with a deleted_at date are hidden for select queries');
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Peer::doCount(new Criteria), 'rows with a deleted_at date are visible for select queries once the static soft_delete is enabled');
        $this->assertTrue(Table4Peer::isSoftDeleteEnabled(), 'Executing a select query enables the static soft delete again');
    }

    public function testDelete()
    {
        $t = new Table4();
        $t->save();
        $this->assertNull($t->getDeletedAt(), 'deleted_column is null by default');
        $t->delete();
        $this->assertNotNull($t->getDeletedAt(), 'deleted_column is not null after a soft delete');
        $this->assertEquals(0, Table4Peer::doCount(new Criteria), 'soft deleted rows are hidden for select queries');
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Peer::doCount(new Criteria), 'soft deleted rows are still present in the database');
    }

    public function testDeleteUndeletable()
    {
        $t = new UndeletableTable4();
        $t->save();
        $t->delete();
        $this->assertNull($t->getDeletedAt(), 'soft_delete is not triggered for objects wit ha preDelete hook returning false');
        $this->assertEquals(1, Table4Peer::doCount(new Criteria), 'soft_delete is not triggered for objects wit ha preDelete hook returning false');
    }

    public function testUnDelete()
    {
        $t = new Table4();
        $t->save();
        $t->delete();
        $t->undelete();
        $this->assertNull($t->getDeletedAt(), 'deleted_column is null again after an undelete');
        $this->assertEquals(1, Table4Peer::doCount(new Criteria), 'undeleted rows are visible for select queries');
    }

    public function testForceDelete()
    {
        $t = new Table4();
        $t->save();
        $t->forceDelete();
        $this->assertTrue($t->isDeleted(), 'forceDelete() actually deletes a row');
        Table4Peer::disableSoftDelete();
        $this->assertEquals(0, Table4Peer::doCount(new Criteria), 'forced deleted rows are not present in the database');
    }

    public function testForceDeleteDoesNotDisableSoftDelete()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        $t1->forceDelete();
        $t2->delete();
        $this->assertTrue($t1->isDeleted(), 'forceDelete() actually deletes a row');
        $this->assertFalse($t2->isDeleted(), 'forceDelete() does not affect further delete() calls');
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Peer::doCount(new Criteria), 'forced deleted rows are not present in the database');
    }

    public function testForceDeleteReEnablesSoftDelete()
    {
        $t = new Table4();
        $t->save();
        $t->forceDelete();
        $this->assertTrue(Table4Peer::isSoftDeleteEnabled(), 'forceDelete() reenables soft delete');
    }

    public function testForceDeleteDoesNotReEnableSoftDeleteIfDisabled()
    {
        Table4Peer::disableSoftDelete();
        $t = new Table4();
        $t->save();
        $t->forceDelete();
        $this->assertFalse(Table4Peer::isSoftDeleteEnabled(), 'forceDelete() does not reenable soft delete if previously disabled');
    }

    public function testQueryIncludeDeleted()
    {
        $t = new Table4();
        $t->setDeletedAt(123);
        $t->save();
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'rows with a deleted_at date are hidden for select queries');
        $this->assertEquals(1, Table4Query::create()->includeDeleted()->count(), 'rows with a deleted_at date are visible for select queries using includeDeleted()');
    }

    public function testQueryForceDelete()
    {
        $t1 = new Table4();
        $t1->save();
        Table4Query::create()->filterById($t1->getId())->forceDelete();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'forceDelete() actually deletes records');
    }

    public function testQuerySoftDelete()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        $t3 = new Table4();
        $t3->save();

        Table4Query::create()
            ->filterById($t1->getId())
            ->softDelete();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(3, Table4Query::create()->count(), 'softDelete() keeps deleted record in the database');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(2, Table4Query::create()->count(), 'softDelete() marks deleted record as deleted');
    }

    public function testQueryDelete()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();

        Table4Peer::disableSoftDelete();
        Table4Query::create()->filterById($t1->getId())->delete();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Query::create()->count(), 'delete() calls forceDelete() when soft delete is disabled');
        Table4Peer::enableSoftDelete();
        Table4Query::create()->filterById($t2->getId())->delete();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Query::create()->count(), 'delete() calls softDelete() when soft delete is enabled');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'delete() calls softDelete() when soft delete is enabled');
    }

    public function testQueryForceDeleteAll()
    {
        $t1 = new Table4();
        $t1->save();
        Table4Query::create()->forceDeleteAll();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'forceDeleteAll() actually deletes records');
    }

    public function testQuerySoftDeleteAll()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        Table4Peer::enableSoftDelete();
        Table4Query::create()->softDelete();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(2, Table4Query::create()->count(), 'softDelete() keeps deleted record in the database');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'softDelete() marks deleted record as deleted');
    }

    public function testQueryDeleteAll()
    {
        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        Table4Peer::disableSoftDelete();
        Table4Query::create()->deleteAll();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'deleteAll() calls forceDeleteAll() when soft delete is disabled');

        $t1 = new Table4();
        $t1->save();
        $t2 = new Table4();
        $t2->save();
        Table4Peer::enableSoftDelete();
        Table4Query::create()->deleteAll();
        Table4Peer::disableSoftDelete();
        $this->assertEquals(2, Table4Query::create()->count(), 'deleteAll() calls softDeleteAll() when soft delete is disabled');
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'deleteAll() calls softDeleteAll() when soft delete is disabled');
    }

    public function testQuerySelect()
    {
        $t = new Table4();
        $t->setDeletedAt(123);
        $t->save();
        Table4Peer::enableSoftDelete();
        $this->assertEquals(0, Table4Query::create()->count(), 'rows with a deleted_at date are hidden for select queries');
        Table4Peer::disableSoftDelete();
        $this->assertEquals(1, Table4Query::create()->count(), 'rows with a deleted_at date are visible for select queries once the static soft_delete is enabled');
        $this->assertTrue(Table4Peer::isSoftDeleteEnabled(), 'Executing a select query enables the static soft delete again');
    }

    public function testCustomization()
    {
        Table5Peer::disableSoftDelete();
        Table5Peer::doDeleteAll();
        Table5Peer::enableSoftDelete();
        $t = new Table5();
        $t->save();
        $this->assertNull($t->getDeletedOn(), 'deleted_column is null by default');
        $t->delete();
        $this->assertNotNull($t->getDeletedOn(), 'deleted_column is not null after a soft delete');
        $this->assertEquals(0, Table5Peer::doCount(new Criteria), 'soft deleted rows are hidden for select queries');
        Table5Peer::disableSoftDelete();
        $this->assertEquals(1, Table5Peer::doCount(new Criteria), 'soft deleted rows are still present in the database');
    }

    public function testPostDelete()
    {
        $t = new PostdeletehookedTable4();
        $t->setTitle('not post-deleted');
        $t->save();
        $this->assertNull($t->getDeletedAt(), 'deleted_column is null before a soft delete');
        $t->delete();
        $this->assertNotNull($t->getDeletedAt(), 'deleted_column is not null after a soft delete');
        $this->assertEquals('post-deleted', $t->getTitle(), 'postDelete hook did not set new title as expected');
    }
}

class UndeletableTable4 extends Table4
{
    public function preDelete(PropelPDO $con = null)
    {
        parent::preDelete($con);
        $this->setTitle('foo');

        return false;
    }
}

class PostdeletehookedTable4 extends Table4
{
    public function postDelete(PropelPDO $con = null)
    {
        parent::postDelete($con);
        $this->setTitle('post-deleted');
        $this->save($con);
    }
}
