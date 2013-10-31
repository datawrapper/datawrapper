<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/schemas/SchemasTestBase.php';

/**
 * Test class for PHP5TableMapBuilder with schemas.
 *
 * @author     Ulf Hermann
 * @version    $Id$
 * @package    runtime.map
 */
class GeneratedRelationMapWithSchemasTest extends SchemasTestBase
{
    protected $databaseMap;

    protected function setUp()
    {
        parent::setUp();
        $this->databaseMap = Propel::getDatabaseMap('bookstore-schemas');
    }

    public function testGetRightTable()
    {
        $bookTable = $this->databaseMap->getTableByPhpName('BookstoreSchemasBookstore');
        $contestTable = $this->databaseMap->getTableByPhpName('ContestBookstoreContest');
        $this->assertEquals(
            $bookTable->getName(),
            $contestTable->getRelation('BookstoreSchemasBookstore')->getRightTable()->getName(),
            'getRightTable() returns correct table when called on a many to one relationship'
        );
        $this->assertEquals(
            $contestTable->getName(),
            $bookTable->getRelation('ContestBookstoreContest')->getRightTable()->getName(),
            'getRightTable() returns correct table when called on a one to many relationship'
        );
        $bookCustomerTable = $this->databaseMap->getTableByPhpName('BookstoreSchemasCustomer');
        $bookCustomerAccTable = $this->databaseMap->getTableByPhpName('BookstoreSchemasCustomerAccount');
        $this->assertEquals(
            $bookCustomerAccTable->getName(),
            $bookCustomerTable->getRelation('BookstoreSchemasCustomerAccount')->getRightTable()->getName(),
            'getRightTable() returns correct table when called on a one to one relationship'
        );
        $this->assertEquals(
            $bookCustomerTable->getName(),
            $bookCustomerAccTable->getRelation('BookstoreSchemasCustomer')->getRightTable()->getName(),
            'getRightTable() returns correct table when called on a one to one relationship'
        );
    }

    public function testColumnMappings()
    {
        $contestTable = $this->databaseMap->getTableByPhpName('ContestBookstoreContest');
        $this->assertEquals(array('contest.bookstore_contest.bookstore_id' => 'bookstore_schemas.bookstore.id'), $contestTable->getRelation('BookstoreSchemasBookstore')->getColumnMappings(), 'getColumnMappings returns local to foreign by default');
        $this->assertEquals(array('contest.bookstore_contest.bookstore_id' => 'bookstore_schemas.bookstore.id'), $contestTable->getRelation('BookstoreSchemasBookstore')->getColumnMappings(RelationMap::LEFT_TO_RIGHT), 'getColumnMappings returns local to foreign when asked left to right for a many to one relationship');

        $bookTable = $this->databaseMap->getTableByPhpName('BookstoreSchemasBookstore');
        $this->assertEquals(array('contest.bookstore_contest.bookstore_id' => 'bookstore_schemas.bookstore.id'), $bookTable->getRelation('ContestBookstoreContest')->getColumnMappings(), 'getColumnMappings returns local to foreign by default');
        $this->assertEquals(array('bookstore_schemas.bookstore.id' => 'contest.bookstore_contest.bookstore_id'), $bookTable->getRelation('ContestBookstoreContest')->getColumnMappings(RelationMap::LEFT_TO_RIGHT), 'getColumnMappings returns foreign to local when asked left to right for a one to many relationship');

        $bookCustomerTable = $this->databaseMap->getTableByPhpName('BookstoreSchemasCustomer');
        $this->assertEquals(array('bookstore_schemas.customer_account.customer_id' => 'bookstore_schemas.customer.id'), $bookCustomerTable->getRelation('BookstoreSchemasCustomerAccount')->getColumnMappings(), 'getColumnMappings returns local to foreign by default');
        $this->assertEquals(array('bookstore_schemas.customer.id' => 'bookstore_schemas.customer_account.customer_id'), $bookCustomerTable->getRelation('BookstoreSchemasCustomerAccount')->getColumnMappings(RelationMap::LEFT_TO_RIGHT), 'getColumnMappings returns foreign to local when asked left to right for a one to one relationship');
    }

}
