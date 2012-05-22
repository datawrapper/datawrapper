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
		 scope=1   scope=2
		 row1      row5
		 row2      row6
		 row3
		 row4
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
		if ($scope !== null) {
			$c->add(Table12Peer::SCOPE_COL, $scope);
		}
		$c->addAscendingOrderByColumn(Table12Peer::RANK_COL);
		$ts = Table12Peer::doSelect($c);
		$ret = array();
		foreach ($ts as $t) {
			$ret[$t->getRank()] = $t->getTitle();
		}
		return $ret;
	}
}