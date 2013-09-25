<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';
require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreDataPopulator.php';

/**
 * Test class for SubQueryTest.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.query
 */
class ExplainPlanTest extends BookstoreTestBase
{
    public function testExplainPlanFromObject()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $db = Propel::getDb(BookPeer::DATABASE_NAME);

        $c = new ModelCriteria('bookstore', 'Book');
        $c->join('Book.Author');
        $c->where('Author.FirstName = ?', 'Neal');
        $c->select('Title');
        $explain = $c->explain($this->con);

        if ($db instanceof DBMySQL) {
            $this->assertEquals(sizeof($explain), 2, 'Explain plan return two lines');

            // explain can change sometime, test can't be strict
            $this->assertArrayHasKey('select_type',$explain[0], 'Line 1, select_type key exist');
            $this->assertArrayHasKey('table',$explain[0], 'Line 1, table key exist');
            $this->assertArrayHasKey('type',$explain[0], 'Line 1, type key exist');
            $this->assertArrayHasKey('possible_keys',$explain[0], 'Line 1, possible_keys key exist');

            $this->assertArrayHasKey('select_type',$explain[1], 'Line 2, select_type key exist');
            $this->assertArrayHasKey('table',$explain[1], 'Line 2, table key exist');
            $this->assertArrayHasKey('type',$explain[1], 'Line 2, type key exist');
            $this->assertArrayHasKey('possible_keys',$explain[1], 'Line 2, possible_keys key exist');
        } elseif ($db instanceof DBOracle) {
            $this->assertTrue(sizeof($explain) > 2, 'Explain plan return more than 2 lines');
        } else {
            $this->markTestSkipped('Cannot test explain plan on adapter ' . get_class($db));
        }
    }

    public function testExplainPlanFromString()
    {
        BookstoreDataPopulator::depopulate($this->con);
        BookstoreDataPopulator::populate($this->con);

        $db = Propel::getDb(BookPeer::DATABASE_NAME);

        $query = 'SELECT book.TITLE AS Title FROM book INNER JOIN author ON (book.AUTHOR_ID=author.ID) WHERE author.FIRST_NAME = \'Neal\'';
        $stmt = $db->doExplainPlan($this->con, $query);
        $explain = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($db instanceof DBMySQL) {
            $this->assertEquals(sizeof($explain), 2, 'Explain plan return two lines');

            // explain can change sometime, test can't be strict
            $this->assertArrayHasKey('select_type',$explain[0], 'Line 1, select_type key exist');
            $this->assertArrayHasKey('table',$explain[0], 'Line 1, table key exist');
            $this->assertArrayHasKey('type',$explain[0], 'Line 1, type key exist');
            $this->assertArrayHasKey('possible_keys',$explain[0], 'Line 1, possible_keys key exist');

            $this->assertArrayHasKey('select_type',$explain[1], 'Line 2, select_type key exist');
            $this->assertArrayHasKey('table',$explain[1], 'Line 2, table key exist');
            $this->assertArrayHasKey('type',$explain[1], 'Line 2, type key exist');
            $this->assertArrayHasKey('possible_keys',$explain[1], 'Line 2, possible_keys key exist');
        } elseif ($db instanceof DBOracle) {
            $this->assertTrue(sizeof($explain) > 2, 'Explain plan return more than 2 lines');
        } else {
            $this->markTestSkipped('Cannot test explain plan on adapter ' . get_class($db));
        }
    }
}
