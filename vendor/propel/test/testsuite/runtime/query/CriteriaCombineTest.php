<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/BaseTestCase.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/query/Criteria.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/util/BasePeer.php';

Propel::init(dirname(__FILE__) . '/../../../fixtures/bookstore/build/conf/bookstore-conf.php');

/**
 * Test class for Criteria combinations.
 *
 * @author     Francois Zaninotto
 * @version    $Id$
 * @package    runtime.query
 */
class CriteriaCombineTest extends BaseTestCase
{

  /**
   * The criteria to use in the test.
   * @var        Criteria
   */
  private $c;

  /**
   * DB adapter saved for later.
   *
   * @var        DBAdapter
   */
  private $savedAdapter;

  protected function setUp()
  {
    parent::setUp();
    $this->c = new Criteria();
    $this->savedAdapter = Propel::getDB(null);
    Propel::setDB(null, new DBSQLite());
  }

  protected function tearDown()
  {
    Propel::setDB(null, $this->savedAdapter);
    parent::tearDown();
  }

  /**
   * test various properties of Criterion and nested criterion
   */
  public function testNestedCriterion()
  {
    $table2 = "myTable2";
    $column2 = "myColumn2";
    $value2 = "myValue2";
    $key2 = "$table2.$column2";

    $table3 = "myTable3";
    $column3 = "myColumn3";
    $value3 = "myValue3";
    $key3 = "$table3.$column3";

    $table4 = "myTable4";
    $column4 = "myColumn4";
    $value4 = "myValue4";
    $key4 = "$table4.$column4";

    $table5 = "myTable5";
    $column5 = "myColumn5";
    $value5 = "myValue5";
    $key5 = "$table5.$column5";

    $crit2 = $this->c->getNewCriterion($key2, $value2, Criteria::EQUAL);
    $crit3 = $this->c->getNewCriterion($key3, $value3, Criteria::EQUAL);
    $crit4 = $this->c->getNewCriterion($key4, $value4, Criteria::EQUAL);
    $crit5 = $this->c->getNewCriterion($key5, $value5, Criteria::EQUAL);

    $crit2->addAnd($crit3)->addOr($crit4->addAnd($crit5));
    $expect = "((myTable2.myColumn2=:p1 AND myTable3.myColumn3=:p2) "
          . "OR (myTable4.myColumn4=:p3 AND myTable5.myColumn5=:p4))";

    $sb = "";
    $params = array();
    $crit2->appendPsTo($sb, $params);

    $expect_params = array(
      array('table' => 'myTable2', 'column' => 'myColumn2', 'value' => 'myValue2'),
      array('table' => 'myTable3', 'column' => 'myColumn3', 'value' => 'myValue3'),
      array('table' => 'myTable4', 'column' => 'myColumn4', 'value' => 'myValue4'),
      array('table' => 'myTable5', 'column' => 'myColumn5', 'value' => 'myValue5'),
    );

    $this->assertEquals($expect, $sb);
    $this->assertEquals($expect_params, $params);

    $crit6 = $this->c->getNewCriterion($key2, $value2, Criteria::EQUAL);
    $crit7 = $this->c->getNewCriterion($key3, $value3, Criteria::EQUAL);
    $crit8 = $this->c->getNewCriterion($key4, $value4, Criteria::EQUAL);
    $crit9 = $this->c->getNewCriterion($key5, $value5, Criteria::EQUAL);

    $crit6->addAnd($crit7)->addOr($crit8)->addAnd($crit9);
    $expect = "(((myTable2.myColumn2=:p1 AND myTable3.myColumn3=:p2) "
           . "OR myTable4.myColumn4=:p3) AND myTable5.myColumn5=:p4)";

    $sb = "";
    $params = array();
    $crit6->appendPsTo($sb, $params);

    $expect_params = array(
                    array('table' => 'myTable2', 'column' => 'myColumn2', 'value' => 'myValue2'),
                    array('table' => 'myTable3', 'column' => 'myColumn3', 'value' => 'myValue3'),
                    array('table' => 'myTable4', 'column' => 'myColumn4', 'value' => 'myValue4'),
                    array('table' => 'myTable5', 'column' => 'myColumn5', 'value' => 'myValue5'),
                );

    $this->assertEquals($expect, $sb);
    $this->assertEquals($expect_params, $params);

    // should make sure we have tests for all possibilities

    $crita = $crit2->getAttachedCriterion();

    $this->assertEquals($crit2, $crita[0]);
    $this->assertEquals($crit3, $crita[1]);
    $this->assertEquals($crit4, $crita[2]);
    $this->assertEquals($crit5, $crita[3]);

    $tables = $crit2->getAllTables();

    $this->assertEquals($crit2->getTable(), $tables[0]);
    $this->assertEquals($crit3->getTable(), $tables[1]);
    $this->assertEquals($crit4->getTable(), $tables[2]);
    $this->assertEquals($crit5->getTable(), $tables[3]);

    // simple confirmations that equality operations work
    $this->assertTrue($crit2->hashCode() === $crit2->hashCode());
  }

  /**
   * Tests <= and >=.
   */
  public function testBetweenCriterion()
  {
    $cn1 = $this->c->getNewCriterion("INVOICE.COST", 1000, Criteria::GREATER_EQUAL);
    $cn2 = $this->c->getNewCriterion("INVOICE.COST", 5000, Criteria::LESS_EQUAL);
    $this->c->add($cn1->addAnd($cn2));

    $expect = "SELECT  FROM INVOICE WHERE (INVOICE.COST>=:p1 AND INVOICE.COST<=:p2)";
    $expect_params = array(
    	array('table' => 'INVOICE', 'column' => 'COST', 'value' => 1000),
      array('table' => 'INVOICE', 'column' => 'COST', 'value' => 5000),
    );

    try {
      $params = array();
      $result = BasePeer::createSelectSql($this->c, $params);
    } catch (PropelException $e) {
      $this->fail("PropelException thrown in BasePeer.createSelectSql(): ".$e->getMessage());
    }

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
  }

  /**
   * Verify that AND and OR criterion are nested correctly.
   */
  public function testPrecedence()
  {
    $cn1 = $this->c->getNewCriterion("INVOICE.COST", "1000", Criteria::GREATER_EQUAL);
    $cn2 = $this->c->getNewCriterion("INVOICE.COST", "2000", Criteria::LESS_EQUAL);
    $cn3 = $this->c->getNewCriterion("INVOICE.COST", "8000", Criteria::GREATER_EQUAL);
    $cn4 = $this->c->getNewCriterion("INVOICE.COST", "9000", Criteria::LESS_EQUAL);
    $this->c->add($cn1->addAnd($cn2));
    $this->c->addOr($cn3->addAnd($cn4));

    $expect =
      "SELECT  FROM INVOICE WHERE ((INVOICE.COST>=:p1 AND INVOICE.COST<=:p2) OR (INVOICE.COST>=:p3 AND INVOICE.COST<=:p4))";

    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '2000'),
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '8000'),
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '9000'),
    );

    try {
      $params=array();
      $result = BasePeer::createSelectSql($this->c, $params);
    } catch (PropelException $e) {
      $this->fail("PropelException thrown in BasePeer::createSelectSql()");
    }

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
  }

	public function testCombineCriterionAndSimple()
	{
    $this->c->addCond('cond1', "INVOICE.COST", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST", "2000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond1', 'cond2'), Criteria::LOGICAL_AND);

    $expect = "SELECT  FROM INVOICE WHERE (INVOICE.COST>=:p1 AND INVOICE.COST<=:p2)";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '2000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

	public function testCombineCriterionAndLessSimple()
	{
    $this->c->addCond('cond1', "INVOICE.COST1", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST2", "2000", Criteria::LESS_EQUAL);
    $this->c->add("INVOICE.COST3", "8000", Criteria::GREATER_EQUAL);
    $this->c->combine(array('cond1', 'cond2'), Criteria::LOGICAL_AND);
    $this->c->add("INVOICE.COST4", "9000", Criteria::LESS_EQUAL);

    $expect = "SELECT  FROM INVOICE WHERE INVOICE.COST3>=:p1 AND (INVOICE.COST1>=:p2 AND INVOICE.COST2<=:p3) AND INVOICE.COST4<=:p4";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST3', 'value' => '8000'),
			array('table' => 'INVOICE', 'column' => 'COST1', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST2', 'value' => '2000'),
			array('table' => 'INVOICE', 'column' => 'COST4', 'value' => '9000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

	public function testCombineCriterionAndMultiple()
	{
    $this->c->addCond('cond1',"INVOICE.COST1", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST2", "2000", Criteria::LESS_EQUAL);
    $this->c->addCond('cond3', "INVOICE.COST3", "8000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond4', "INVOICE.COST4", "9000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond1', 'cond2', 'cond3', 'cond4'), Criteria::LOGICAL_AND);

    $expect = "SELECT  FROM INVOICE WHERE (((INVOICE.COST1>=:p1 AND INVOICE.COST2<=:p2) AND INVOICE.COST3>=:p3) AND INVOICE.COST4<=:p4)";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST1', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST2', 'value' => '2000'),
			array('table' => 'INVOICE', 'column' => 'COST3', 'value' => '8000'),
			array('table' => 'INVOICE', 'column' => 'COST4', 'value' => '9000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

	public function testCombineCriterionOrSimple()
	{
    $this->c->addCond('cond1', "INVOICE.COST", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST", "2000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond1', 'cond2'), Criteria::LOGICAL_OR);

    $expect = "SELECT  FROM INVOICE WHERE (INVOICE.COST>=:p1 OR INVOICE.COST<=:p2)";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST', 'value' => '2000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

	public function testCombineCriterionOrLessSimple()
	{
    $this->c->addCond('cond1', "INVOICE.COST1", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST2", "2000", Criteria::LESS_EQUAL);
    $this->c->add("INVOICE.COST3", "8000", Criteria::GREATER_EQUAL);
    $this->c->combine(array('cond1', 'cond2'), Criteria::LOGICAL_OR);
    $this->c->addOr("INVOICE.COST4", "9000", Criteria::LESS_EQUAL);

    $expect = "SELECT  FROM INVOICE WHERE INVOICE.COST3>=:p1 AND ((INVOICE.COST1>=:p2 OR INVOICE.COST2<=:p3) OR INVOICE.COST4<=:p4)";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST3', 'value' => '8000'),
			array('table' => 'INVOICE', 'column' => 'COST1', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST2', 'value' => '2000'),
			array('table' => 'INVOICE', 'column' => 'COST4', 'value' => '9000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

	public function testCombineCriterionOrMultiple()
	{
    $this->c->addCond('cond1',"INVOICE.COST1", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST2", "2000", Criteria::LESS_EQUAL);
    $this->c->addCond('cond3', "INVOICE.COST3", "8000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond4', "INVOICE.COST4", "9000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond1', 'cond2', 'cond3', 'cond4'), Criteria::LOGICAL_OR);

    $expect = "SELECT  FROM INVOICE WHERE (((INVOICE.COST1>=:p1 OR INVOICE.COST2<=:p2) OR INVOICE.COST3>=:p3) OR INVOICE.COST4<=:p4)";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST1', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST2', 'value' => '2000'),
			array('table' => 'INVOICE', 'column' => 'COST3', 'value' => '8000'),
			array('table' => 'INVOICE', 'column' => 'COST4', 'value' => '9000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

	public function testCombineNamedCriterions()
	{
    $this->c->addCond('cond1', "INVOICE.COST1", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST2", "2000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond1', 'cond2'), Criteria::LOGICAL_AND, 'cond12');
    $this->c->addCond('cond3', "INVOICE.COST3", "8000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond4', "INVOICE.COST4", "9000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond3', 'cond4'), Criteria::LOGICAL_AND, 'cond34');
    $this->c->combine(array('cond12', 'cond34'), Criteria::LOGICAL_OR);

    $expect = "SELECT  FROM INVOICE WHERE ((INVOICE.COST1>=:p1 AND INVOICE.COST2<=:p2) OR (INVOICE.COST3>=:p3 AND INVOICE.COST4<=:p4))";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST1', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST2', 'value' => '2000'),
			array('table' => 'INVOICE', 'column' => 'COST3', 'value' => '8000'),
			array('table' => 'INVOICE', 'column' => 'COST4', 'value' => '9000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

	public function testCombineDirtyOperators()
	{
    $this->c->addCond('cond1', "INVOICE.COST1", "1000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond2', "INVOICE.COST2", "2000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond1', 'cond2'), 'AnD', 'cond12');
    $this->c->addCond('cond3', "INVOICE.COST3", "8000", Criteria::GREATER_EQUAL);
    $this->c->addCond('cond4', "INVOICE.COST4", "9000", Criteria::LESS_EQUAL);
    $this->c->combine(array('cond3', 'cond4'), 'aNd', 'cond34');
    $this->c->combine(array('cond12', 'cond34'), 'oR');

    $expect = "SELECT  FROM INVOICE WHERE ((INVOICE.COST1>=:p1 AND INVOICE.COST2<=:p2) OR (INVOICE.COST3>=:p3 AND INVOICE.COST4<=:p4))";
    $expect_params = array(
			array('table' => 'INVOICE', 'column' => 'COST1', 'value' => '1000'),
			array('table' => 'INVOICE', 'column' => 'COST2', 'value' => '2000'),
			array('table' => 'INVOICE', 'column' => 'COST3', 'value' => '8000'),
			array('table' => 'INVOICE', 'column' => 'COST4', 'value' => '9000'),
    );

    $params = array();
    $result = BasePeer::createSelectSql($this->c, $params);

    $this->assertEquals($expect, $result);
    $this->assertEquals($expect_params, $params);
	}

}
