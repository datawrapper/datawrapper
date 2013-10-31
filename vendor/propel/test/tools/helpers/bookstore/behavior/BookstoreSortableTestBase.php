<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../BookstoreTestBase.php';

abstract class BookstoreSortableTestBase extends BookstoreTestBase
{
    protected function populateTable11()
    {
        Table11Peer::doDeleteAll();
        $t1 = new Table11();
        $t1->setRank(1);
        $t1->setTitle('row1');
        $t1->save();
        $t2 = new Table11();
        $t2->setRank(4);
        $t2->setTitle('row4');
        $t2->save();
        $t3 = new Table11();
        $t3->setRank(2);
        $t3->setTitle('row2');
        $t3->save();
        $t4 = new Table11();
        $t4->setRank(3);
        $t4->setTitle('row3');
        $t4->save();
    }

    protected function populateTable12()
    {
        /* List used for tests
         scope=1   scope=2   scope=null
         row1      row5      row7
         row2      row6      row8
         row3                row9
         row4                row10
        */
        Table12Peer::doDeleteAll();
        $t1 = new Table12();
        $t1->setRank(1);
        $t1->setScopeValue(1);
        $t1->setTitle('row1');
        $t1->save();
        $t2 = new Table12();
        $t2->setRank(4);
        $t2->setScopeValue(1);
        $t2->setTitle('row4');
        $t2->save();
        $t3 = new Table12();
        $t3->setRank(2);
        $t3->setScopeValue(1);
        $t3->setTitle('row2');
        $t3->save();
        $t4 = new Table12();
        $t4->setRank(1);
        $t4->setScopeValue(2);
        $t4->setTitle('row5');
        $t4->save();
        $t5 = new Table12();
        $t5->setRank(3);
        $t5->setScopeValue(1);
        $t5->setTitle('row3');
        $t5->save();
        $t6 = new Table12();
        $t6->setRank(2);
        $t6->setScopeValue(2);
        $t6->setTitle('row6');
        $t6->save();
        $t7 = new Table12();
        $t7->setRank(1);
        $t7->setTitle('row7');
        $t7->save();
        $t8 = new Table12();
        $t8->setRank(2);
        $t8->setTitle('row8');
        $t8->save();
        $t9 = new Table12();
        $t9->setRank(3);
        $t9->setTitle('row9');
        $t9->save();
        $t10 = new Table12();
        $t10->setRank(4);
        $t10->setTitle('row10');
        $t10->save();
    }

    protected function populateFkScopeTable()
    {
        /* List used for tests
         scope=1   scope=2   scope=null
         row1      row4      row7
         row2      row5      row8
         row3      row6      row9
        */
        $this->populateTable11();

        $s1 = Table11Peer::retrieveByRank(1)->getId();
        $s2 = Table11Peer::retrieveByRank(2)->getId();

        FkScopeTablePeer::doDeleteAll();
        $t1 = new FkScopeTable();
        $t1->setRank(1);
        $t1->setScopeValue($s1);
        $t1->setTitle('row1');
        $t1->save();
        $t2 = new FkScopeTable();
        $t2->setRank(2);
        $t2->setScopeValue($s1);
        $t2->setTitle('row2');
        $t2->save();
        $t3 = new FkScopeTable();
        $t3->setRank(3);
        $t3->setScopeValue($s1);
        $t3->setTitle('row3');
        $t3->save();
        $t4 = new FkScopeTable();
        $t4->setRank(1);
        $t4->setScopeValue($s2);
        $t4->setTitle('row4');
        $t4->save();
        $t5 = new FkScopeTable();
        $t5->setRank(2);
        $t5->setScopeValue($s2);
        $t5->setTitle('row5');
        $t5->save();
        $t6 = new FkScopeTable();
        $t6->setRank(3);
        $t6->setScopeValue($s2);
        $t6->setTitle('row6');
        $t6->save();
        $t7 = new FkScopeTable();
        $t7->setRank(1);
        $t7->setTitle('row7');
        $t7->save();
        $t8 = new FkScopeTable();
        $t8->setRank(2);
        $t8->setTitle('row8');
        $t8->save();
        $t9 = new FkScopeTable();
        $t9->setRank(3);
        $t9->setTitle('row9');
        $t9->save();
    }

    protected function getFixturesArray()
    {
        $c = new Criteria();
        $c->addAscendingOrderByColumn(Table11Peer::RANK_COL);
        $ts = Table11Peer::doSelect($c);
        $ret = array();
        foreach ($ts as $t) {
            $ret[$t->getRank()] = $t->getTitle();
        }

        return $ret;
    }

    protected function getFixturesArrayWithScope($scope = null)
    {
        $c = new Criteria();
        $c->add(Table12Peer::SCOPE_COL, $scope);
        $c->addAscendingOrderByColumn(Table12Peer::RANK_COL);
        $ts = Table12Peer::doSelect($c);
        $ret = array();
        foreach ($ts as $t) {
            $ret[$t->getRank()] = $t->getTitle();
        }

        return $ret;
    }

    protected function getFixturesArrayWithFkScope($scope = null)
    {
        $c = new Criteria();
        $c->add(FkScopeTablePeer::SCOPE_COL, $scope);
        $c->addAscendingOrderByColumn(FkScopeTablePeer::RANK_COL);
        $ts = FkScopeTablePeer::doSelect($c);
        $ret = array();
        foreach ($ts as $t) {
            $ret[$t->getRank()] = $t->getTitle();
        }

        return $ret;
    }
}
