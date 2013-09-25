<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Test class for PHP5TableMapBuilder.
 *
 * @author     François Zaninotto
 * @version    $Id$
 * @package    generator.builder.om
 */
class PHP5TableMapBuilderTest extends BookstoreTestBase
{
  protected $databaseMap;

  protected function setUp()
  {
      parent::setUp();
    $this->databaseMap = Propel::getDatabaseMap('bookstore');
  }

  public function testColumnDefaultValue()
  {
    $table = $this->databaseMap->getTableByPhpName('BookstoreEmployeeAccount');
    $this->assertNull($table->getColumn('login')->getDefaultValue(), 'null default values are correctly mapped');
    $this->assertEquals('\'@\'\'34"', $table->getColumn('password')->getDefaultValue(), 'string default values are correctly escaped and mapped');
    $this->assertTrue($table->getColumn('enabled')->getDefaultValue(), 'boolean default values are correctly mapped');
    $this->assertFalse($table->getColumn('not_enabled')->getDefaultValue(), 'boolean default values are correctly mapped');
    $this->assertEquals('CURRENT_TIMESTAMP', $table->getColumn('created')->getDefaultValue(), 'expression default values are correctly mapped');
    $this->assertNull($table->getColumn('role_id')->getDefaultValue(), 'explicit null default values are correctly mapped');
  }

  public function testRelationCount()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertEquals(14, count($bookTable->getRelations()), 'The map builder creates relations for both incoming and outgoing keys');
  }

  public function testSimpleRelationName()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertTrue($bookTable->hasRelation('Publisher'), 'The map builder creates relations based on the foreign table name, calemized');
    $this->assertTrue($bookTable->hasRelation('BookListRel'), 'The map builder creates relations based on the foreign table phpName, if provided');
  }

  public function testAliasRelationName()
  {
    $bookEmpTable = $this->databaseMap->getTableByPhpName('BookstoreEmployee');
    $this->assertTrue($bookEmpTable->hasRelation('Supervisor'), 'The map builder creates relations based on the foreign key phpName');
    $this->assertTrue($bookEmpTable->hasRelation('Subordinate'), 'The map builder creates relations based on the foreign key refPhpName');
  }

  public function testDuplicateRelationName()
  {
    $essayTable = $this->databaseMap->getTableByPhpName('Essay');
    $this->assertTrue($essayTable->hasRelation('AuthorRelatedByFirstAuthor'), 'The map builder creates relations based on the foreign table name and the foreign key');
    $this->assertTrue($essayTable->hasRelation('AuthorRelatedBySecondAuthor'), 'The map builder creates relations based on the foreign table name and the foreign key');
  }

  public function testRelationDirectionManyToOne()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertEquals(RelationMap::MANY_TO_ONE, $bookTable->getRelation('Publisher')->getType(), 'The map builder creates MANY_TO_ONE relations for every foreign key');
    $this->assertEquals(RelationMap::MANY_TO_ONE, $bookTable->getRelation('Author')->getType(), 'The map builder creates MANY_TO_ONE relations for every foreign key');
  }

  public function testRelationDirectionOneToMany()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertEquals(RelationMap::ONE_TO_MANY, $bookTable->getRelation('Review')->getType(), 'The map builder creates ONE_TO_MANY relations for every incoming foreign key');
    $this->assertEquals(RelationMap::ONE_TO_MANY, $bookTable->getRelation('Media')->getType(), 'The map builder creates ONE_TO_MANY relations for every incoming foreign key');
    $this->assertEquals(RelationMap::ONE_TO_MANY, $bookTable->getRelation('BookListRel')->getType(), 'The map builder creates ONE_TO_MANY relations for every incoming foreign key');
    $this->assertEquals(RelationMap::ONE_TO_MANY, $bookTable->getRelation('BookOpinion')->getType(), 'The map builder creates ONE_TO_MANY relations for every incoming foreign key');
    $this->assertEquals(RelationMap::ONE_TO_MANY, $bookTable->getRelation('ReaderFavorite')->getType(), 'The map builder creates ONE_TO_MANY relations for every incoming foreign key');
    $this->assertEquals(RelationMap::ONE_TO_MANY, $bookTable->getRelation('BookstoreContest')->getType(), 'The map builder creates ONE_TO_MANY relations for every incoming foreign key');
  }

  public function testRelationDirectionOneToOne()
  {
    $bookEmpTable = $this->databaseMap->getTableByPhpName('BookstoreEmployee');
    $this->assertEquals(RelationMap::ONE_TO_ONE, $bookEmpTable->getRelation('BookstoreEmployeeAccount')->getType(), 'The map builder creates ONE_TO_ONE relations for every incoming foreign key to a primary key');
  }

  public function testRelationDirectionManyToMAny()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertEquals(RelationMap::MANY_TO_MANY, $bookTable->getRelation('BookClubList')->getType(), 'The map builder creates MANY_TO_MANY relations for every cross key');
  }

  public function testRelationsColumns()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $expectedMapping = array('book.publisher_id' => 'publisher.id');
    $this->assertEquals($expectedMapping, $bookTable->getRelation('Publisher')->getColumnMappings(), 'The map builder adds columns in the correct order for foreign keys');
    $expectedMapping = array('review.book_id' => 'book.id');
    $this->assertEquals($expectedMapping, $bookTable->getRelation('Review')->getColumnMappings(), 'The map builder adds columns in the correct order for incoming foreign keys');
    $publisherTable = $this->databaseMap->getTableByPhpName('Publisher');
    $expectedMapping = array('book.publisher_id' => 'publisher.id');
    $this->assertEquals($expectedMapping, $publisherTable->getRelation('Book')->getColumnMappings(), 'The map builder adds local columns where the foreign key lies');
    $rfTable = $this->databaseMap->getTableByPhpName('ReaderFavorite');
    $expectedMapping = array(
      'reader_favorite.book_id'   => 'book_opinion.book_id',
      'reader_favorite.reader_id' => 'book_opinion.reader_id'
    );
    $this->assertEquals($expectedMapping, $rfTable->getRelation('BookOpinion')->getColumnMappings(), 'The map builder adds all columns for composite foreign keys');
    $expectedMapping = array();
    $this->assertEquals($expectedMapping, $bookTable->getRelation('BookClubList')->getColumnMappings(), 'The map builder provides no column mapping for many-to-many relationships');
  }

  public function testRelationOnDelete()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertEquals('SET NULL', $bookTable->getRelation('Publisher')->getOnDelete(), 'The map builder adds columns with the correct onDelete');
  }

  public function testRelationOnUpdate()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertNull($bookTable->getRelation('Publisher')->getOnUpdate(), 'The map builder adds columns with onDelete null by default');
    $this->assertEquals('CASCADE', $bookTable->getRelation('Author')->getOnUpdate(), 'The map builder adds columns with the correct onUpdate');
  }

  public function testBehaviors()
  {
    $bookTable = $this->databaseMap->getTableByPhpName('Book');
    $this->assertEquals($bookTable->getBehaviors(), array(), 'getBehaviors() returns an empty array when no behaviors are registered');
    $tmap = Propel::getDatabaseMap(Table1Peer::DATABASE_NAME)->getTable(Table1Peer::TABLE_NAME);
    $expectedBehaviorParams = array('timestampable' => array('create_column' => 'created_on', 'update_column' => 'updated_on', 'disable_updated_at' => 'false'));
    $this->assertEquals($tmap->getBehaviors(), $expectedBehaviorParams, 'The map builder creates a getBehaviors() method to retrieve behaviors parameters when behaviors are registered');
  }

     public function testSingleTableInheritance()
    {
        $bookTable = $this->databaseMap->getTableByPhpName('Book');
        $this->assertFalse($bookTable->isSingleTableInheritance(), 'isSingleTabkeInheritance() returns false by default');

        $empTable = $this->databaseMap->getTableByPhpName('BookstoreEmployee');
        $this->assertTrue($empTable->isSingleTableInheritance(), 'isSingleTabkeInheritance() returns true for tables using single table inheritance');
    }

    public function testPrimaryString()
    {
        $bookTable = $this->databaseMap->getTableByPhpName('Book');
        $this->assertTrue($bookTable->hasPrimaryStringColumn(), 'The map builder adds primaryString columns.');
        $this->assertEquals($bookTable->getColumn('title'), $bookTable->getPrimaryStringColumn(), 'The map builder maps the correct column as primaryString.');
    }

    public function testIsCrossRef()
    {
        $bookTable = $this->databaseMap->getTableByPhpName('Book');
        $this->assertFalse($bookTable->isCrossRef(), 'The map builder add isCrossRef information "false"');
        $BookListRelTable = $this->databaseMap->getTableByPhpName('BookListRel');
        $this->assertTrue($BookListRelTable->isCrossRef(), 'The map builder add isCrossRef information "true"');
    }
}
