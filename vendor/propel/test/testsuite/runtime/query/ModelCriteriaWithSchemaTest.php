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
 * Test class for ModelCriteria withs schemas.
 *
 * @author     Francois Zaninotto
 * @version    $Id: ModelCriteriaTest.php 2090 2010-12-13 22:37:03Z francois $
 * @package    runtime.query
 */
class ModelCriteriaWithSchemaTest extends SchemasTestBase
{

    protected function assertCriteriaTranslation($criteria, $expectedSql, $expectedParams, $message = '')
    {
        $params = array();
        $result = BasePeer::createSelectSql($criteria, $params);

        $this->assertEquals($expectedSql, $result, $message);
        $this->assertEquals($expectedParams, $params, $message);
    }

    public static function conditionsForTestReplaceNamesWithSchemas()
    {
        return array(
            array('ContestBookstoreContest.PrizeBookId = ?', 'PrizeBookId', 'contest.bookstore_contest.prize_book_id = ?'), // basic case
            array('ContestBookstoreContest.PrizeBookId=?', 'PrizeBookId', 'contest.bookstore_contest.prize_book_id=?'), // without spaces
            array('ContestBookstoreContest.Id<= ?', 'Id', 'contest.bookstore_contest.id<= ?'), // with non-equal comparator
            array('ContestBookstoreContest.BookstoreId LIKE ?', 'BookstoreId', 'contest.bookstore_contest.bookstore_id LIKE ?'), // with SQL keyword separator
            array('(ContestBookstoreContest.BookstoreId) LIKE ?', 'BookstoreId', '(contest.bookstore_contest.bookstore_id) LIKE ?'), // with parenthesis
            array('(ContestBookstoreContest.Id*1.5)=1', 'Id', '(contest.bookstore_contest.id*1.5)=1') // ignore numbers
        );
    }

    /**
     * @dataProvider conditionsForTestReplaceNamesWithSchemas
     */
    public function testReplaceNamesWithSchemas($origClause, $columnPhpName = false, $modifiedClause)
    {
        $c = new TestableModelCriteriaWithSchema('bookstore-schemas', 'ContestBookstoreContest');
        $this->doTestReplaceNames($c, ContestBookstoreContestPeer::getTableMap(),  $origClause, $columnPhpName = false, $modifiedClause);
    }

    public function doTestReplaceNames($c, $tableMap, $origClause, $columnPhpName = false, $modifiedClause)
    {
        $c->replaceNames($origClause);
        $columns = $c->replacedColumns;
        if ($columnPhpName) {
            $this->assertEquals(array($tableMap->getColumnByPhpName($columnPhpName)), $columns);
        }
        $this->assertEquals($modifiedClause, $origClause);
    }

}

class TestableModelCriteriaWithSchema extends ModelCriteria
{
    public $joins = array();

    public function replaceNames(&$clause)
    {
        return parent::replaceNames($clause);
    }

}
