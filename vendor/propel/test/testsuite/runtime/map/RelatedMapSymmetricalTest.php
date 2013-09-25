<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Test class for RelatedMap::getSymmetricalRelation.
 *
 * @author     François Zaninotto
 * @version    $Id: GeneratedRelationMapTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    runtime.map
 */
class RelatedMapSymmetricalTest extends BookstoreTestBase
{
  protected $databaseMap;

  protected function setUp()
  {
      parent::setUp();
    $this->databaseMap = Propel::getDatabaseMap('bookstore');
  }

    public function testOneToMany()
    {
        $bookTable = $this->databaseMap->getTableByPhpName('Book');
        $bookToAuthor = $bookTable->getRelation('Author');
        $authorTable = $this->databaseMap->getTableByPhpName('Author');
        $authorToBook = $authorTable->getRelation('Book');
        $this->assertEquals($authorToBook, $bookToAuthor->getSymmetricalRelation());
        $this->assertEquals($bookToAuthor, $authorToBook->getSymmetricalRelation());
    }

    public function testOneToOne()
    {
        $accountTable = $this->databaseMap->getTableByPhpName('BookstoreEmployeeAccount');
        $accountToEmployee = $accountTable->getRelation('BookstoreEmployee');
        $employeeTable = $this->databaseMap->getTableByPhpName('BookstoreEmployee');
        $employeeToAccount = $employeeTable->getRelation('BookstoreEmployeeAccount');
        $this->assertEquals($accountToEmployee, $employeeToAccount->getSymmetricalRelation());
        $this->assertEquals($employeeToAccount, $accountToEmployee->getSymmetricalRelation());
    }

    public function testSeveralRelationsOnSameTable()
    {
        $authorTable = $this->databaseMap->getTableByPhpName('Author');
        $authorToEssay = $authorTable->getRelation('EssayRelatedByFirstAuthor');
        $essayTable = $this->databaseMap->getTableByPhpName('Essay');
        $essayToAuthor = $essayTable->getRelation('AuthorRelatedByFirstAuthor');
        $this->assertEquals($authorToEssay, $essayToAuthor->getSymmetricalRelation());
        $this->assertEquals($essayToAuthor, $authorToEssay->getSymmetricalRelation());
    }

    public function testCompositeForeignKey()
    {
        $favoriteTable = $this->databaseMap->getTableByPhpName('ReaderFavorite');
        $favoriteToOpinion = $favoriteTable->getRelation('BookOpinion');
        $opinionTable = $this->databaseMap->getTableByPhpName('BookOpinion');
        $opinionToFavorite = $opinionTable->getRelation('ReaderFavorite');
        $this->assertEquals($favoriteToOpinion, $opinionToFavorite->getSymmetricalRelation());
        $this->assertEquals($opinionToFavorite, $favoriteToOpinion->getSymmetricalRelation());
    }

}
