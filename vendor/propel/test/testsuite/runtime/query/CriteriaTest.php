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
 * Test class for Criteria.
 *
 * @author     <a href="mailto:celkins@scardini.com">Christopher Elkins</a>
 * @author     <a href="mailto:sam@neurogrid.com">Sam Joseph</a>
 * @version    $Id$
 * @package    runtime.query
 */
class CriteriaTest extends BookstoreTestBase
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
	 * Test basic adding of strings.
	 */
	public function testAddString()
	{
		$table = "myTable";
		$column = "myColumn";
		$value = "myValue";

		// Add the string
		$this->c->add($table . '.' . $column, $value);

		// Verify that the key exists
		$this->assertTrue($this->c->containsKey($table . '.' . $column));

		// Verify that what we get out is what we put in
		$this->assertTrue($this->c->getValue($table . '.' . $column) === $value);
	}

	/**
	 * Test basic adding of strings for table with explicit schema.
	 */
	public function testAddStringWithSchemas()
	{
		$table = "mySchema.myTable";
		$column = "myColumn";
		$value = "myValue";

		// Add the string
		$this->c->add($table . '.' . $column, $value);

		// Verify that the key exists
		$this->assertTrue($this->c->containsKey($table . '.' . $column));

		// Verify that what we get out is what we put in
		$this->assertTrue($this->c->getValue($table . '.' . $column) === $value);
	}

	public function testAddAndSameColumns()
	{
		$table1 = "myTable1";
		$column1 = "myColumn1";
		$value1 = "myValue1";
		$key1 = "$table1.$column1";

		$table2 = "myTable1";
		$column2 = "myColumn1";
		$value2 = "myValue2";
		$key2 = "$table2.$column2";

		$this->c->add($key1, $value1, Criteria::EQUAL);
		$this->c->addAnd($key2, $value2, Criteria::EQUAL);

		$expect = "SELECT  FROM myTable1 WHERE (myTable1.myColumn1=:p1 AND myTable1.myColumn1=:p2)";

		$params = array();
		$result = BasePeer::createSelectSql($this->c, $params);

		$expect_params = array(
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue1'),
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue2'),
		);

		$this->assertEquals($expect, $result, 'addAnd() called on an existing column creates a combined criterion');
		$this->assertEquals($expect_params, $params, 'addAnd() called on an existing column creates a combined criterion');
	}

	public function testAddAndSameColumnsPropel14Compatibility()
	{
		$table1 = "myTable1";
		$column1 = "myColumn1";
		$value1 = "myValue1";
		$key1 = "$table1.$column1";

		$table2 = "myTable1";
		$column2 = "myColumn1";
		$value2 = "myValue2";
		$key2 = "$table2.$column2";

		$table3 = "myTable3";
		$column3 = "myColumn3";
		$value3 = "myValue3";
		$key3 = "$table3.$column3";

		$this->c->add($key1, $value1, Criteria::EQUAL);
		$this->c->add($key3, $value3, Criteria::EQUAL);
		$this->c->addAnd($key2, $value2, Criteria::EQUAL);

		$expect = "SELECT  FROM myTable1, myTable3 WHERE (myTable1.myColumn1=:p1 AND myTable1.myColumn1=:p2) AND myTable3.myColumn3=:p3";

		$params = array();
		$result = BasePeer::createSelectSql($this->c, $params);

		$expect_params = array(
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue1'),
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue2'),
			array('table' => 'myTable3', 'column' => 'myColumn3', 'value' => 'myValue3'),
		);

		$this->assertEquals($expect, $result, 'addAnd() called on an existing column creates a combined criterion');
		$this->assertEquals($expect_params, $params, 'addAnd() called on an existing column creates a combined criterion');
	}

	public function testAddAndDistinctColumns()
	{
		$table1 = "myTable1";
		$column1 = "myColumn1";
		$value1 = "myValue1";
		$key1 = "$table1.$column1";

		$table2 = "myTable2";
		$column2 = "myColumn2";
		$value2 = "myValue2";
		$key2 = "$table2.$column2";

		$this->c->add($key1, $value1, Criteria::EQUAL);
		$this->c->addAnd($key2, $value2, Criteria::EQUAL);

		$expect = "SELECT  FROM myTable1, myTable2 WHERE myTable1.myColumn1=:p1 AND myTable2.myColumn2=:p2";

		$params = array();
		$result = BasePeer::createSelectSql($this->c, $params);

		$expect_params = array(
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue1'),
			array('table' => 'myTable2', 'column' => 'myColumn2', 'value' => 'myValue2'),
		);

		$this->assertEquals($expect, $result, 'addAnd() called on a distinct column adds a criterion to the criteria');
		$this->assertEquals($expect_params, $params, 'addAnd() called on a distinct column adds a criterion to the criteria');
	}

	public function testAddOrSameColumns()
	{
		$table1 = "myTable1";
		$column1 = "myColumn1";
		$value1 = "myValue1";
		$key1 = "$table1.$column1";

		$table2 = "myTable1";
		$column2 = "myColumn1";
		$value2 = "myValue2";
		$key2 = "$table2.$column2";

		$this->c->add($key1, $value1, Criteria::EQUAL);
		$this->c->addOr($key2, $value2, Criteria::EQUAL);

		$expect = "SELECT  FROM myTable1 WHERE (myTable1.myColumn1=:p1 OR myTable1.myColumn1=:p2)";

		$params = array();
		$result = BasePeer::createSelectSql($this->c, $params);

		$expect_params = array(
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue1'),
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue2'),
		);

		$this->assertEquals($expect, $result, 'addOr() called on an existing column creates a combined criterion');
		$this->assertEquals($expect_params, $params, 'addOr() called on an existing column creates a combined criterion');
	}

	public function testAddAndOrColumnsPropel14Compatibility()
	{
		$table1 = "myTable1";
		$column1 = "myColumn1";
		$value1 = "myValue1";
		$key1 = "$table1.$column1";

		$table2 = "myTable1";
		$column2 = "myColumn1";
		$value2 = "myValue2";
		$key2 = "$table2.$column2";

		$table3 = "myTable3";
		$column3 = "myColumn3";
		$value3 = "myValue3";
		$key3 = "$table3.$column3";

		$this->c->add($key1, $value1, Criteria::EQUAL);
		$this->c->add($key3, $value3, Criteria::EQUAL);
		$this->c->addOr($key2, $value2, Criteria::EQUAL);

		$expect = "SELECT  FROM myTable1, myTable3 WHERE (myTable1.myColumn1=:p1 OR myTable1.myColumn1=:p2) AND myTable3.myColumn3=:p3";

		$params = array();
		$result = BasePeer::createSelectSql($this->c, $params);

		$expect_params = array(
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue1'),
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue2'),
			array('table' => 'myTable3', 'column' => 'myColumn3', 'value' => 'myValue3'),
		);

		$this->assertEquals($expect, $result, 'addOr() called on an existing column creates a combined criterion');
		$this->assertEquals($expect_params, $params, 'addOr() called on an existing column creates a combined criterion');
	}

	public function testAddOrDistinctColumns()
	{
		$table1 = "myTable1";
		$column1 = "myColumn1";
		$value1 = "myValue1";
		$key1 = "$table1.$column1";

		$table2 = "myTable2";
		$column2 = "myColumn2";
		$value2 = "myValue2";
		$key2 = "$table2.$column2";

		$this->c->add($key1, $value1, Criteria::EQUAL);
		$this->c->addOr($key2, $value2, Criteria::EQUAL);

		$expect = "SELECT  FROM myTable1, myTable2 WHERE (myTable1.myColumn1=:p1 OR myTable2.myColumn2=:p2)";

		$params = array();
		$result = BasePeer::createSelectSql($this->c, $params);

		$expect_params = array(
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue1'),
			array('table' => 'myTable2', 'column' => 'myColumn2', 'value' => 'myValue2'),
		);

		$this->assertEquals($expect, $result, 'addOr() called on a distinct column adds a criterion to the latest criterion');
		$this->assertEquals($expect_params, $params, 'addOr() called on a distinct column adds a criterion to the latest criterion');
	}

	public function testAddOrEmptyCriteria()
	{
		$table1 = "myTable1";
		$column1 = "myColumn1";
		$value1 = "myValue1";
		$key1 = "$table1.$column1";

		$this->c->addOr($key1, $value1, Criteria::EQUAL);

		$expect = "SELECT  FROM myTable1 WHERE myTable1.myColumn1=:p1";

		$params = array();
		$result = BasePeer::createSelectSql($this->c, $params);

		$expect_params = array(
			array('table' => 'myTable1', 'column' => 'myColumn1', 'value' => 'myValue1'),
		);

		$this->assertEquals($expect, $result, 'addOr() called on an empty Criteria adds a criterion to the criteria');
		$this->assertEquals($expect_params, $params, 'addOr() called on an empty Criteria adds a criterion to the criteria');
	}

	/**
	 * Test Criterion.setIgnoreCase().
	 * As the output is db specific the test just prints the result to
	 * System.out
	 */
	public function testCriterionIgnoreCase()
	{
		$originalDB = Propel::getDB();
		$adapters = array(new DBMySQL(), new DBPostgres());
		$expectedIgnore = array("UPPER(TABLE.COLUMN) LIKE UPPER(:p1)", "TABLE.COLUMN ILIKE :p1");

		$i =0;
		foreach ($adapters as $adapter) {

			Propel::setDB(null, $adapter);
			$myCriteria = new Criteria();

			$myCriterion = $myCriteria->getNewCriterion(
				"TABLE.COLUMN", "FoObAr", Criteria::LIKE);
			$sb = "";
			$params=array();
			$myCriterion->appendPsTo($sb, $params);
			$expected = "TABLE.COLUMN LIKE :p1";

			$this->assertEquals($expected, $sb);

			$ignoreCriterion = $myCriterion->setIgnoreCase(true);

			$sb = "";
			$params=array();
			$ignoreCriterion->appendPsTo($sb, $params);
			// $expected = "UPPER(TABLE.COLUMN) LIKE UPPER(?)";
			$this->assertEquals($expectedIgnore[$i], $sb);
			$i++;
		}
		Propel::setDB(null, $originalDB);
	}

	public function testOrderByIgnoreCase()
	{
		$originalDB = Propel::getDB();
		Propel::setDB(null, new DBMySQL());

		$criteria = new Criteria();
		$criteria->setIgnoreCase(true);
		$criteria->addAscendingOrderByColumn(BookPeer::TITLE);
		BookPeer::addSelectColumns($criteria);
		$params=array();
		$sql = BasePeer::createSelectSql($criteria, $params);
		$expectedSQL = 'SELECT book.ID, book.TITLE, book.ISBN, book.PRICE, book.PUBLISHER_ID, book.AUTHOR_ID, UPPER(book.TITLE) FROM `book` ORDER BY UPPER(book.TITLE) ASC';
		$this->assertEquals($expectedSQL, $sql);

		Propel::setDB(null, $originalDB);
	}

	/**
	 * Test that true is evaluated correctly.
	 */
	public function testBoolean()
	{
		$this->c = new Criteria();
		$this->c->add("TABLE.COLUMN", true);

		$expect = "SELECT  FROM TABLE WHERE TABLE.COLUMN=:p1";
		$expect_params = array( array('table' => 'TABLE', 'column' => 'COLUMN', 'value' => true),
		);
		try {
			$params = array();
			$result = BasePeer::createSelectSql($this->c, $params);
		} catch (PropelException $e) {
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}

		$this->assertEquals($expect, $result, "Boolean test failed.");
		$this->assertEquals($expect_params, $params);

	}

	public function testCurrentDate()
	{
		$this->c = new Criteria();
		$this->c->add("TABLE.TIME_COLUMN", Criteria::CURRENT_TIME);
		$this->c->add("TABLE.DATE_COLUMN", Criteria::CURRENT_DATE);

		$expect = "SELECT  FROM TABLE WHERE TABLE.TIME_COLUMN=CURRENT_TIME AND TABLE.DATE_COLUMN=CURRENT_DATE";

		$result = null;
		try {
			$params = array();
			$result = BasePeer::createSelectSql($this->c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}

		$this->assertEquals($expect, $result, "Current date test failed!");

	}

	public function testCountAster()
	{
		$this->c = new Criteria();
		$this->c->addSelectColumn("COUNT(*)");
		$this->c->add("TABLE.TIME_COLUMN", Criteria::CURRENT_TIME);
		$this->c->add("TABLE.DATE_COLUMN", Criteria::CURRENT_DATE);

		$expect = "SELECT COUNT(*) FROM TABLE WHERE TABLE.TIME_COLUMN=CURRENT_TIME AND TABLE.DATE_COLUMN=CURRENT_DATE";

		$result = null;
		try {
			$params = array();
			$result = BasePeer::createSelectSql($this->c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}

		$this->assertEquals($expect, $result);

	}

	public function testInOperator()
	{
		$c = new Criteria();
		$c->addSelectColumn("*");
		$c->add("TABLE.SOME_COLUMN", array(), Criteria::IN);
		$c->add("TABLE.OTHER_COLUMN", array(1, 2, 3), Criteria::IN);

		$expect = "SELECT * FROM TABLE WHERE 1<>1 AND TABLE.OTHER_COLUMN IN (:p1,:p2,:p3)";
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testInOperatorEmptyAfterFull()
	{
		$c = new Criteria();
		$c->addSelectColumn("*");
		$c->add("TABLE.OTHER_COLUMN", array(1, 2, 3), Criteria::IN);
		$c->add("TABLE.SOME_COLUMN", array(), Criteria::IN);

		$expect = "SELECT * FROM TABLE WHERE TABLE.OTHER_COLUMN IN (:p1,:p2,:p3) AND 1<>1";
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testInOperatorNested()
	{
		// now do a nested logic test, just for sanity (not that this should be any surprise)

		$c = new Criteria();
		$c->addSelectColumn("*");
		$myCriterion = $c->getNewCriterion("TABLE.COLUMN", array(), Criteria::IN);
		$myCriterion->addOr($c->getNewCriterion("TABLE.COLUMN2", array(1,2), Criteria::IN));
		$c->add($myCriterion);

		$expect = "SELECT * FROM TABLE WHERE (1<>1 OR TABLE.COLUMN2 IN (:p1,:p2))";
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);

	}

	/**
	 * Test the Criteria::CUSTOM behavior.
	 */
	public function testCustomOperator()
	{
		$c = new Criteria();
		$c->addSelectColumn('A.COL');
		$c->add('A.COL', 'date_part(\'YYYY\', A.COL) = \'2007\'', Criteria::CUSTOM);

		$expected = "SELECT A.COL FROM A WHERE date_part('YYYY', A.COL) = '2007'";
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expected, $result);
	}
	
	public function testAddRaw()
	{
		$c = new Criteria();
		$c->addSelectColumn('A.COL');
		$c->addAsColumn('foo', 'B.COL');
		$c->add('foo = ?', 123, PDO::PARAM_STR);
		
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$expected = "SELECT A.COL, B.COL AS foo FROM A WHERE foo = :p1";
		$this->assertEquals($expected, $result);
		$expected = array(
			array('table' => null, 'type' => PDO::PARAM_STR, 'value' => 123)
		);
		$this->assertEquals($expected, $params);
	}

	public function testJoinObject ()
	{
		$j = new Join('TABLE_A.COL_1', 'TABLE_B.COL_2');
		$this->assertEquals('INNER JOIN', $j->getJoinType());
		$this->assertEquals('TABLE_A.COL_1', $j->getLeftColumn());
		$this->assertEquals('TABLE_A', $j->getLeftTableName());
		$this->assertEquals('COL_1', $j->getLeftColumnName());
		$this->assertEquals('TABLE_B.COL_2', $j->getRightColumn());
		$this->assertEquals('TABLE_B', $j->getRightTableName());
		$this->assertEquals('COL_2', $j->getRightColumnName());

		$j = new Join('TABLE_A.COL_1', 'TABLE_B.COL_1', Criteria::LEFT_JOIN);
		$this->assertEquals('LEFT JOIN', $j->getJoinType());
		$this->assertEquals('TABLE_A.COL_1', $j->getLeftColumn());
		$this->assertEquals('TABLE_B.COL_1', $j->getRightColumn());

		$j = new Join('TABLE_A.COL_1', 'TABLE_B.COL_1', Criteria::RIGHT_JOIN);
		$this->assertEquals('RIGHT JOIN', $j->getJoinType());
		$this->assertEquals('TABLE_A.COL_1', $j->getLeftColumn());
		$this->assertEquals('TABLE_B.COL_1', $j->getRightColumn());

		$j = new Join('TABLE_A.COL_1', 'TABLE_B.COL_1', Criteria::INNER_JOIN);
		$this->assertEquals('INNER JOIN', $j->getJoinType());
		$this->assertEquals('TABLE_A.COL_1', $j->getLeftColumn());
		$this->assertEquals('TABLE_B.COL_1', $j->getRightColumn());

		$j = new Join(array('TABLE_A.COL_1', 'TABLE_A.COL_2'), array('TABLE_B.COL_1', 'TABLE_B.COL_2'), Criteria::INNER_JOIN);
		$this->assertEquals('TABLE_A.COL_1', $j->getLeftColumn(0));
		$this->assertEquals('TABLE_A.COL_2', $j->getLeftColumn(1));
		$this->assertEquals('TABLE_B.COL_1', $j->getRightColumn(0));
		$this->assertEquals('TABLE_B.COL_2', $j->getRightColumn(1));
	}

	public function testAddStraightJoin ()
	{
		$c = new Criteria();
		$c->addSelectColumn("*");
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_1'); // straight join

		$expect = "SELECT * FROM TABLE_A INNER JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_1)";
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testAddSeveralJoins ()
	{
		$c = new Criteria();
		$c->addSelectColumn("*");
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_1');
		$c->addJoin('TABLE_B.COL_X', 'TABLE_D.COL_X');

		$expect = 'SELECT * FROM TABLE_A INNER JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_1)'
			. ' INNER JOIN TABLE_D ON (TABLE_B.COL_X=TABLE_D.COL_X)';
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testAddLeftJoin ()
	{
		$c = new Criteria();
		$c->addSelectColumn("TABLE_A.*");
		$c->addSelectColumn("TABLE_B.*");
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_2', Criteria::LEFT_JOIN);

		$expect = "SELECT TABLE_A.*, TABLE_B.* FROM TABLE_A LEFT JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_2)";
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testAddSeveralLeftJoins ()
	{
		// Fails.. Suspect answer in the chunk starting at BasePeer:605
		$c = new Criteria();
		$c->addSelectColumn('*');
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_1', Criteria::LEFT_JOIN);
		$c->addJoin('TABLE_A.COL_2', 'TABLE_C.COL_2', Criteria::LEFT_JOIN);

		$expect = 'SELECT * FROM TABLE_A '
			.'LEFT JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_1) '
			.'LEFT JOIN TABLE_C ON (TABLE_A.COL_2=TABLE_C.COL_2)';
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testAddRightJoin ()
	{
		$c = new Criteria();
		$c->addSelectColumn("*");
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_2', Criteria::RIGHT_JOIN);

		$expect = "SELECT * FROM TABLE_A RIGHT JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_2)";
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testAddSeveralRightJoins ()
	{
		// Fails.. Suspect answer in the chunk starting at BasePeer:605
		$c = new Criteria();
		$c->addSelectColumn('*');
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_1', Criteria::RIGHT_JOIN);
		$c->addJoin('TABLE_A.COL_2', 'TABLE_C.COL_2', Criteria::RIGHT_JOIN);

		$expect = 'SELECT * FROM TABLE_A '
			.'RIGHT JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_1) '
			.'RIGHT JOIN TABLE_C ON (TABLE_A.COL_2=TABLE_C.COL_2)';
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testAddInnerJoin ()
	{
		$c = new Criteria();
		$c->addSelectColumn("*");
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_1', Criteria::INNER_JOIN);

		$expect = "SELECT * FROM TABLE_A INNER JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_1)";
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	public function testAddSeveralInnerJoin ()
	{
		$c = new Criteria();
		$c->addSelectColumn("*");
		$c->addJoin('TABLE_A.COL_1', 'TABLE_B.COL_1', Criteria::INNER_JOIN);
		$c->addJoin('TABLE_B.COL_1', 'TABLE_C.COL_1', Criteria::INNER_JOIN);

		$expect = 'SELECT * FROM TABLE_A '
			.'INNER JOIN TABLE_B ON (TABLE_A.COL_1=TABLE_B.COL_1) '
			.'INNER JOIN TABLE_C ON (TABLE_B.COL_1=TABLE_C.COL_1)';
		try {
			$params = array();
			$result = BasePeer::createSelectSql($c, $params);
		} catch (PropelException $e) {
			print $e->getTraceAsString();
			$this->fail("PropelException thrown in BasePeer.createSelectSql(): ". $e->getMessage());
		}
		$this->assertEquals($expect, $result);
	}

	/**
	 * @link       http://www.propelorm.org/ticket/451
	 * @link       http://www.propelorm.org/ticket/283#comment:8
	 */
	public function testSeveralMixedJoinOrders()
	{
		$c = new Criteria();
		$c->clearSelectColumns()->
			addJoin("TABLE_A.FOO_ID", "TABLE_B.ID", Criteria::LEFT_JOIN)->
			addJoin("TABLE_A.BAR_ID", "TABLE_C.ID")->
			addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A LEFT JOIN TABLE_B ON (TABLE_A.FOO_ID=TABLE_B.ID) INNER JOIN TABLE_C ON (TABLE_A.BAR_ID=TABLE_C.ID)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * @link       http://propel.phpdb.org/trac/ticket/606
	 */
	public function testAddJoinArray()
	{
		$c = new Criteria();
		$c->clearSelectColumns()->
			addJoin(array('TABLE_A.FOO_ID'), array('TABLE_B.ID'), Criteria::LEFT_JOIN)->
			addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A LEFT JOIN TABLE_B ON TABLE_A.FOO_ID=TABLE_B.ID';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * @link       http://propel.phpdb.org/trac/ticket/606
	 */
	public function testAddJoinArrayMultiple()
	{
		$c = new Criteria();
		$c->clearSelectColumns()->
			addJoin(
				array('TABLE_A.FOO_ID', 'TABLE_A.BAR'),
				array('TABLE_B.ID', 'TABLE_B.BAZ'),
				Criteria::LEFT_JOIN)->
				addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A LEFT JOIN TABLE_B ON (TABLE_A.FOO_ID=TABLE_B.ID AND TABLE_A.BAR=TABLE_B.BAZ)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * Test the Criteria::addJoinMultiple() method with an implicit join
	 *
	 * @link       http://propel.phpdb.org/trac/ticket/606
	 */
	public function testAddJoinMultiple()
	{
		$c = new Criteria();
		$c->
			clearSelectColumns()->
			addMultipleJoin(array(
				array('TABLE_A.FOO_ID', 'TABLE_B.ID'),
				array('TABLE_A.BAR', 'TABLE_B.BAZ')))->
				addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A INNER JOIN TABLE_B '
			. 'ON (TABLE_A.FOO_ID=TABLE_B.ID AND TABLE_A.BAR=TABLE_B.BAZ)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * Test the Criteria::addJoinMultiple() method with a value as second argument
	 *
	 * @link       http://propel.phpdb.org/trac/ticket/606
	 */
	public function testAddJoinMultipleValue()
	{
		$c = new Criteria();
		$c->
			clearSelectColumns()->
			addMultipleJoin(array(
				array('TABLE_A.FOO_ID', 'TABLE_B.ID'),
				array('TABLE_A.BAR', 3)))->
				addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A INNER JOIN TABLE_B '
			. 'ON (TABLE_A.FOO_ID=TABLE_B.ID AND TABLE_A.BAR=3)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * Test the Criteria::addJoinMultiple() method with a joinType
	 *
	 * @link       http://propel.phpdb.org/trac/ticket/606
	 */
	public function testAddJoinMultipleWithJoinType()
	{
		$c = new Criteria();
		$c->
			clearSelectColumns()->
			addMultipleJoin(array(
				array('TABLE_A.FOO_ID', 'TABLE_B.ID'),
				array('TABLE_A.BAR', 'TABLE_B.BAZ')),
			Criteria::LEFT_JOIN)->
			addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A '
			. 'LEFT JOIN TABLE_B ON (TABLE_A.FOO_ID=TABLE_B.ID AND TABLE_A.BAR=TABLE_B.BAZ)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * Test the Criteria::addJoinMultiple() method with operator
	 *
	 * @link       http://propel.phpdb.org/trac/ticket/606
	 */
	public function testAddJoinMultipleWithOperator()
	{
		$c = new Criteria();
		$c->
			clearSelectColumns()->
			addMultipleJoin(array(
				array('TABLE_A.FOO_ID', 'TABLE_B.ID', Criteria::GREATER_EQUAL),
				array('TABLE_A.BAR', 'TABLE_B.BAZ', Criteria::LESS_THAN)))->
				addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A INNER JOIN TABLE_B '
			. 'ON (TABLE_A.FOO_ID>=TABLE_B.ID AND TABLE_A.BAR<TABLE_B.BAZ)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * Test the Criteria::addJoinMultiple() method with join type and operator
	 *
	 * @link       http://propel.phpdb.org/trac/ticket/606
	 */
	public function testAddJoinMultipleWithJoinTypeAndOperator()
	{
		$c = new Criteria();
		$c->
			clearSelectColumns()->
			addMultipleJoin(array(
				array('TABLE_A.FOO_ID', 'TABLE_B.ID', Criteria::GREATER_EQUAL),
				array('TABLE_A.BAR', 'TABLE_B.BAZ', Criteria::LESS_THAN)),
			Criteria::LEFT_JOIN)->
			addSelectColumn("TABLE_A.ID");

		$expect = 'SELECT TABLE_A.ID FROM TABLE_A '
			. 'LEFT JOIN TABLE_B ON (TABLE_A.FOO_ID>=TABLE_B.ID AND TABLE_A.BAR<TABLE_B.BAZ)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expect, $result);
	}

	/**
	 * Tests adding duplicate joins.
	 * @link       http://propel.phpdb.org/trac/ticket/613
	 */
	public function testAddJoin_Duplicate()
	{
		$c = new Criteria();

		$c->addJoin("tbl.COL1", "tbl.COL2", Criteria::LEFT_JOIN);
		$c->addJoin("tbl.COL1", "tbl.COL2", Criteria::LEFT_JOIN);
		$this->assertEquals(1, count($c->getJoins()), "Expected not to have duplciate LJOIN added.");

		$c->addJoin("tbl.COL1", "tbl.COL2", Criteria::RIGHT_JOIN);
		$c->addJoin("tbl.COL1", "tbl.COL2", Criteria::RIGHT_JOIN);
		$this->assertEquals(2, count($c->getJoins()), "Expected 1 new right join to be added.");

		$c->addJoin("tbl.COL1", "tbl.COL2");
		$c->addJoin("tbl.COL1", "tbl.COL2");
		$this->assertEquals(3, count($c->getJoins()), "Expected 1 new implicit join to be added.");

		$c->addJoin("tbl.COL3", "tbl.COL4");
		$this->assertEquals(4, count($c->getJoins()), "Expected new col join to be added.");

	}

	/**
	 * @link       http://propel.phpdb.org/trac/ticket/634
	 */
	public function testHasSelectClause()
	{
		$c = new Criteria();
		$c->addSelectColumn("foo");

		$this->assertTrue($c->hasSelectClause());

		$c = new Criteria();
		$c->addAsColumn("foo", "bar");

		$this->assertTrue($c->hasSelectClause());
	}

	/**
	 * Tests including aliases in criterion objects.
	 * @link       http://propel.phpdb.org/trac/ticket/636
	 */
	public function testAliasInCriterion()
	{
		$c = new Criteria();
		$c->addAsColumn("column_alias", "tbl.COL1");
		$crit = $c->getNewCriterion("column_alias", "FOO");
		$this->assertNull($crit->getTable());
		$this->assertEquals("column_alias", $crit->getColumn());
	}
	
	public function testHaving()
	{
		$c = new Criteria();
		$c->addSelectColumn(BookPeer::TITLE);
		$c->addAsColumn('isb_n', BookPeer::ISBN);
		$crit = $c->getNewCriterion('isb_n', '1234567890123');
		$c->addHaving($crit);
		$expected = 'SELECT book.TITLE, book.ISBN AS isb_n FROM book HAVING isb_n=:p1';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expected, $result);
		BasePEer::doSelect($c, $this->con);
		$expected = 'SELECT book.TITLE, book.ISBN AS isb_n FROM book HAVING isb_n=\'1234567890123\'';
		$this->assertEquals($expected, $this->con->getLastExecutedQuery());
	}
	
	public function testMultipleHaving()
	{
		$c = new Criteria();
		$c->addSelectColumn(BookPeer::TITLE);
		$c->addAsColumn('isb_n', BookPeer::ISBN);
		$crit = $c->getNewCriterion('isb_n', '1234567890123');
		$crit->addAnd($c->getNewCriterion(BookPeer::TITLE, 'Foobar'));
		$c->addHaving($crit);
		$expected = 'SELECT book.TITLE, book.ISBN AS isb_n FROM book HAVING (isb_n=:p1 AND book.TITLE=:p2)';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expected, $result);
	}

	public function testHavingRaw()
	{
		$c = new Criteria();
		$c->addSelectColumn(BookPeer::TITLE);
		$c->addAsColumn("isb_n", BookPeer::ISBN);
		$c->addHaving('isb_n = ?', '1234567890123', PDO::PARAM_STR);
		$expected = 'SELECT book.TITLE, book.ISBN AS isb_n FROM book HAVING isb_n = :p1';
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals($expected, $result);
		BasePEer::doSelect($c, $this->con);
		$expected = 'SELECT book.TITLE, book.ISBN AS isb_n FROM book HAVING isb_n = \'1234567890123\'';
		$this->assertEquals($expected, $this->con->getLastExecutedQuery());
	}

	/**
	 * Test whether GROUP BY is being respected in equals() check.
	 * @link       http://propel.phpdb.org/trac/ticket/674
	 */
	public function testEqualsGroupBy()
	{
		$c1 = new Criteria();
		$c1->addGroupByColumn('GBY1');

		$c2 = new Criteria();
		$c2->addGroupByColumn('GBY2');

		$this->assertFalse($c2->equals($c1), "Expected Criteria NOT to be the same with different GROUP BY columns");

		$c3 = new Criteria();
		$c3->addGroupByColumn('GBY1');
		$c4 = new Criteria();
		$c4->addGroupByColumn('GBY1');
		$this->assertTrue($c4->equals($c3), "Expected Criteria objects to match.");
	}

	/**
	 * Test whether calling setDistinct twice puts in two distinct keywords or not.
	 * @link       http://propel.phpdb.org/trac/ticket/716
	 */
	public function testDoubleSelectModifiers()
	{
		$c = new Criteria();
		$c->setDistinct();
		$this->assertEquals(array(Criteria::DISTINCT), $c->getSelectModifiers(), 'Initial setDistinct works');
		$c->setDistinct();
		$this->assertEquals(array(Criteria::DISTINCT), $c->getSelectModifiers(), 'Calling setDistinct again leaves a single distinct');
		$c->setAll();
		$this->assertEquals(array(Criteria::ALL), $c->getSelectModifiers(), 'All keyword is swaps distinct out');
		$c->setAll();
		$this->assertEquals(array(Criteria::ALL), $c->getSelectModifiers(), 'Calling setAll leaves a single all');
		$c->setDistinct();
		$this->assertEquals(array(Criteria::DISTINCT), $c->getSelectModifiers(), 'All back to distinct works');

		$c2 = new Criteria();
		$c2->setAll();
		$this->assertEquals(array(Criteria::ALL), $c2->getSelectModifiers(), 'Initial setAll works');
	}

	public function testAddSelectModifier()
	{
		$c = new Criteria();
		$c->setDistinct();
		$c->addSelectModifier('SQL_CALC_FOUND_ROWS');
		$this->assertEquals(array(Criteria::DISTINCT, 'SQL_CALC_FOUND_ROWS'), $c->getSelectModifiers(), 'addSelectModifier() adds a select modifier to the Criteria');
		$c->addSelectModifier('SQL_CALC_FOUND_ROWS');
		$this->assertEquals(array(Criteria::DISTINCT, 'SQL_CALC_FOUND_ROWS'), $c->getSelectModifiers(), 'addSelectModifier() adds a select modifier only once');
		$params = array();
		$result = BasePeer::createSelectSql($c, $params);
		$this->assertEquals('SELECT DISTINCT SQL_CALC_FOUND_ROWS  FROM ', $result, 'addSelectModifier() adds a modifier to the final query');
	}

	public function testClone()
	{
		$c1 = new Criteria();
		$c1->add('tbl.COL1', 'foo', Criteria::EQUAL);
		$c2 = clone $c1;
		$c2->addAnd('tbl.COL1', 'bar', Criteria::EQUAL);
		$nbCrit = 0;
		foreach ($c1->keys() as $key) {
			foreach ($c1->getCriterion($key)->getAttachedCriterion() as $criterion) {
				$nbCrit++;
			}
		}
		$this->assertEquals(1, $nbCrit, 'cloning a Criteria clones its Criterions');
	}

	public function testComment()
	{
		$c = new Criteria();
		$this->assertNull($c->getComment(), 'Comment is null by default');
		$c2 = $c->setComment('foo');
		$this->assertEquals('foo', $c->getComment(), 'Comment is set by setComment()');
		$this->assertEquals($c, $c2, 'setComment() returns the current Criteria');
		$c->setComment();
		$this->assertNull($c->getComment(), 'Comment is reset by setComment(null)');
	}

	public function testClear()
	{
		$c = new CriteriaForClearTest();
		$c->clear();

		$this->assertTrue(is_array($c->getNamedCriterions()), 'namedCriterions is an array');
		$this->assertEquals(0, count($c->getNamedCriterions()), 'namedCriterions is empty by default');

		$this->assertFalse($c->getIgnoreCase(), 'ignoreCase is false by default');

		$this->assertFalse($c->getSingleRecord(), 'singleRecord is false by default');

		$this->assertTrue(is_array($c->getSelectModifiers()), 'selectModifiers is an array');
		$this->assertEquals(0, count($c->getSelectModifiers()), 'selectModifiers is empty by default');

		$this->assertTrue(is_array($c->getSelectColumns()), 'selectColumns is an array');
		$this->assertEquals(0, count($c->getSelectColumns()), 'selectColumns is empty by default');

		$this->assertTrue(is_array($c->getOrderByColumns()), 'orderByColumns is an array');
		$this->assertEquals(0, count($c->getOrderByColumns()), 'orderByColumns is empty by default');

		$this->assertTrue(is_array($c->getGroupByColumns()), 'groupByColumns is an array');
		$this->assertEquals(0, count($c->getGroupByColumns()), 'groupByColumns is empty by default');

		$this->assertNull($c->getHaving(), 'having is null by default');

		$this->assertTrue(is_array($c->getAsColumns()), 'asColumns is an array');
		$this->assertEquals(0, count($c->getAsColumns()), 'asColumns is empty by default');

		$this->assertTrue(is_array($c->getJoins()), 'joins is an array');
		$this->assertEquals(0, count($c->getJoins()), 'joins is empty by default');

		$this->assertTrue(is_array($c->getSelectQueries()), 'selectQueries is an array');
		$this->assertEquals(0, count($c->getSelectQueries()), 'selectQueries is empty by default');

		$this->assertEquals(0, $c->getOffset(), 'offset is 0 by default');

		$this->assertEquals(0, $c->getLimit(), 'limit is 0 by default');

		$this->assertNull($c->getBlobFlag(), 'blobFlag is null by default');

		$this->assertTrue(is_array($c->getAliases()), 'aliases is an array');
		$this->assertEquals(0, count($c->getAliases()), 'aliases is empty by default');

		$this->assertFalse($c->getUseTransaction(), 'useTransaction is false by default');
	}

	public function testLimit()
	{
		$c = new Criteria();
		$this->assertEquals(0, $c->getLimit(), 'Limit is 0 by default');

		$c2 = $c->setLimit(1);
		$this->assertEquals(1, $c->getLimit(), 'Limit is set by setLimit');
		$this->assertSame($c, $c2, 'setLimit() returns the current Criteria');
	}
}

class CriteriaForClearTest extends Criteria
{
	public function getNamedCriterions()
	{
		return $this->namedCriterions;
	}

	public function getIgnoreCase()
	{
		return $this->ignoreCase;
	}

	public function getSingleRecord()
	{
		return $this->singleRecord;
	}

  public function getUseTransaction()
  {
      return $this->useTransaction;
  }

	public function getBlobFlag()
	{
		return $this->blobFlag;
	}
}
