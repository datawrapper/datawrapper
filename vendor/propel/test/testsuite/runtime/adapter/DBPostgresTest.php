<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../runtime/lib/adapter/DBAdapter.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/adapter/DBPostgres.php';

/**
 * Tests the DbPostgres adapter
 *
 * @see        BookstoreDataPopulator
 * @author     Kévin Gomez <contact@kevingomez.fr<
 * @package    runtime.adapter
 */
class DBPostgresTest extends PHPUnit_Framework_TestCase
{
  public function testGetExplainPlanQuery()
  {
    $db = new DBPostgres();
    $query = 'SELECT B.* FROM (SELECT A.*, rownum AS PROPEL_ROWNUM FROM (SELECT book.ID AS ORA_COL_ALIAS_0, book.TITLE AS ORA_COL_ALIAS_1, book.ISBN AS ORA_COL_ALIAS_2, book.PRICE AS ORA_COL_ALIAS_3, book.PUBLISHER_ID AS ORA_COL_ALIAS_4, book.AUTHOR_ID AS ORA_COL_ALIAS_5, author.ID AS ORA_COL_ALIAS_6, author.FIRST_NAME AS ORA_COL_ALIAS_7, author.LAST_NAME AS ORA_COL_ALIAS_8, author.EMAIL AS ORA_COL_ALIAS_9, author.AGE AS ORA_COL_ALIAS_10, book.PRICE AS BOOK_PRICE FROM book, author) A ) B WHERE  B.PROPEL_ROWNUM <= 1';

    $this->assertEquals('EXPLAIN SELECT B.* FROM (SELECT A.*, rownum AS PROPEL_ROWNUM FROM (SELECT book.ID AS ORA_COL_ALIAS_0, book.TITLE AS ORA_COL_ALIAS_1, book.ISBN AS ORA_COL_ALIAS_2, book.PRICE AS ORA_COL_ALIAS_3, book.PUBLISHER_ID AS ORA_COL_ALIAS_4, book.AUTHOR_ID AS ORA_COL_ALIAS_5, author.ID AS ORA_COL_ALIAS_6, author.FIRST_NAME AS ORA_COL_ALIAS_7, author.LAST_NAME AS ORA_COL_ALIAS_8, author.EMAIL AS ORA_COL_ALIAS_9, author.AGE AS ORA_COL_ALIAS_10, book.PRICE AS BOOK_PRICE FROM book, author) A ) B WHERE  B.PROPEL_ROWNUM <= 1', $db->getExplainPlanQuery($query), 'getExplainPlanQuery() returns a SQL Explain query');
  }
}
