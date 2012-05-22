<?php

/*
 *	$Id: VersionableBehaviorTest.php 1460 2010-01-17 22:36:48Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/i18n/I18nBehavior.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests for I18nBehavior class query modifier
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior.i18n
 */
class I18nBehaviorQueryBuilderModifierTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		if (!class_exists('I18nBehaviorTest11')) {
			$schema = <<<EOF
<database name="i18n_behavior_test_10">
	<table name="i18n_behavior_test_11">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="foo" type="INTEGER" />
		<column name="bar" type="VARCHAR" size="100" />
		<behavior name="i18n">
			<parameter name="i18n_columns" value="bar" />
		</behavior>
	</table>
	<table name="i18n_behavior_test_12">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="foo" type="INTEGER" />
		<column name="bar1" type="VARCHAR" size="100" />
		<column name="bar2" type="LONGVARCHAR" lazyLoad="true" />
		<column name="bar3" type="TIMESTAMP" />
		<column name="bar4" type="LONGVARCHAR" description="This is the Bar4 column" />
		<behavior name="i18n">
			<parameter name="i18n_columns" value="bar1,bar2,bar3,bar4" />
			<parameter name="default_locale" value="fr_FR" />
			<parameter name="locale_alias" value="culture" />
		</behavior>
	</table>
</database>
EOF;
			//PropelQuickBuilder::debugClassesForTable($schema, 'i18n_behavior_test_11');
			PropelQuickBuilder::buildSchema($schema);
		}
	}

	public function testJoinI18nUsesDefaultLocaleInJoinCondition()
	{
		$q = I18nBehaviorTest11Query::create()
			->joinI18n();
		$params = array();
		$sql = BasePeer::createSelectSQL($q, $params);
		$expectedSQL = 'SELECT  FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n ON (i18n_behavior_test_11.ID=i18n_behavior_test_11_i18n.ID AND i18n_behavior_test_11_i18n.LOCALE = :p1)';
		$this->assertEquals($expectedSQL, $sql);
		$this->assertEquals('en_EN', $params[0]['value']);
	}

	public function testJoinI18nUsesLocaleInJoinCondition()
	{
		$q = I18nBehaviorTest11Query::create()
			->joinI18n('fr_FR');
		$params = array();
		$sql = BasePeer::createSelectSQL($q, $params);
		$expectedSQL = 'SELECT  FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n ON (i18n_behavior_test_11.ID=i18n_behavior_test_11_i18n.ID AND i18n_behavior_test_11_i18n.LOCALE = :p1)';
		$this->assertEquals($expectedSQL, $sql);
		$this->assertEquals('fr_FR', $params[0]['value']);
	}

	public function testJoinI18nAcceptsARelationAlias()
	{
		$q = I18nBehaviorTest11Query::create()
			->joinI18n('en_EN', 'I18n');
		$params = array();
		$sql = BasePeer::createSelectSQL($q, $params);
		$expectedSQL = 'SELECT  FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n I18n ON (i18n_behavior_test_11.ID=I18n.ID AND I18n.LOCALE = :p1)';
		$this->assertEquals($expectedSQL, $sql);
		$this->assertEquals('en_EN', $params[0]['value']);
	}

	public function testJoinI18nAcceptsAJoinType()
	{
		$q = I18nBehaviorTest11Query::create()
			->joinI18n('en_EN', null, Criteria::INNER_JOIN);
		$params = array();
		$sql = BasePeer::createSelectSQL($q, $params);
		$expectedSQL = 'SELECT  FROM i18n_behavior_test_11 INNER JOIN i18n_behavior_test_11_i18n ON (i18n_behavior_test_11.ID=i18n_behavior_test_11_i18n.ID AND i18n_behavior_test_11_i18n.LOCALE = :p1)';
		$this->assertEquals($expectedSQL, $sql);
		$this->assertEquals('en_EN', $params[0]['value']);
	}

	public function testJoinI18nCreatesACorrectQuery()
	{
		$con = Propel::getConnection(I18nBehaviorTest11Peer::DATABASE_NAME);
		$con->useDebug(true);
		I18nBehaviorTest11Query::create()
			->joinI18n('fr_FR')
			->find($con);
		$expected = "SELECT i18n_behavior_test_11.ID, i18n_behavior_test_11.FOO FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n ON (i18n_behavior_test_11.ID=i18n_behavior_test_11_i18n.ID AND i18n_behavior_test_11_i18n.LOCALE = 'fr_FR')";
		$this->assertEquals($expected, $con->getLastExecutedQuery());
		$con->useDebug(false);
	}

	public function testUseI18nQueryAddsTheProperJoin()
	{
		$q = I18nBehaviorTest11Query::create()
			->useI18nQuery('fr_FR')
				->filterByBar('bar')
			->endUse();
		$params = array();
		$sql = BasePeer::createSelectSQL($q, $params);
		$expectedSQL = 'SELECT  FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n ON (i18n_behavior_test_11.ID=i18n_behavior_test_11_i18n.ID AND i18n_behavior_test_11_i18n.LOCALE = :p1) WHERE i18n_behavior_test_11_i18n.BAR=:p2';
		$this->assertEquals($expectedSQL, $sql);
		$this->assertEquals('fr_FR', $params[0]['value']);
		$this->assertEquals('bar', $params[1]['value']);
	}

	public function testUseI18nQueryAcceptsARelationAlias()
	{
		$q = I18nBehaviorTest11Query::create()
			->useI18nQuery('fr_FR', 'I18n')
				->filterByBar('bar')
			->endUse();
		$params = array();
		$sql = BasePeer::createSelectSQL($q, $params);
		$expectedSQL = 'SELECT  FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n I18n ON (i18n_behavior_test_11.ID=I18n.ID AND I18n.LOCALE = :p1) WHERE I18n.BAR=:p2';
		$this->assertEquals($expectedSQL, $sql);
		$this->assertEquals('fr_FR', $params[0]['value']);
		$this->assertEquals('bar', $params[1]['value']);
	}

	public function testUseI18nQueryCreatesACorrectQuery()
	{
		$con = Propel::getConnection(I18nBehaviorTest11Peer::DATABASE_NAME);
		$con->useDebug(true);
		I18nBehaviorTest11Query::create()
			->useI18nQuery('fr_FR')
				->filterByBar('bar')
			->endUse()
			->find($con);
		$expected = "SELECT i18n_behavior_test_11.ID, i18n_behavior_test_11.FOO FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n ON (i18n_behavior_test_11.ID=i18n_behavior_test_11_i18n.ID AND i18n_behavior_test_11_i18n.LOCALE = 'fr_FR') WHERE i18n_behavior_test_11_i18n.BAR='bar'";
		$this->assertEquals($expected, $con->getLastExecutedQuery());
		$con->useDebug(false);
	}

	public function testJoinWithI18nAddsTheI18nColumns()
	{
		$q = I18nBehaviorTest11Query::create()
			->joinWithI18n();
		$params = array();
		$sql = BasePeer::createSelectSQL($q, $params);
		$expectedSQL = 'SELECT i18n_behavior_test_11.ID, i18n_behavior_test_11.FOO, i18n_behavior_test_11_i18n.ID, i18n_behavior_test_11_i18n.LOCALE, i18n_behavior_test_11_i18n.BAR FROM i18n_behavior_test_11 LEFT JOIN i18n_behavior_test_11_i18n ON (i18n_behavior_test_11.ID=i18n_behavior_test_11_i18n.ID AND i18n_behavior_test_11_i18n.LOCALE = :p1)';
		$this->assertEquals($expectedSQL, $sql);
		$this->assertEquals('en_EN', $params[0]['value']);
	}

	public function testJoinWithI18nDoesNotPruneResultsWithoutTranslation()
	{
		I18nBehaviorTest11Query::create()->deleteAll();
		I18nBehaviorTest11I18nQuery::create()->deleteAll();
		$o = new I18nBehaviorTest11();
		$o->setFoo(123);
		$o->save();
		$res = I18nBehaviorTest11Query::create()
			->joinWithI18n('en_EN')
			->findOne();
		$this->assertEquals($o, $res);
	}

	public function testJoinWithI18nPrunesResultsWithoutTranslationWhenUsingInnerJoin()
	{
		I18nBehaviorTest11Query::create()->deleteAll();
		I18nBehaviorTest11I18nQuery::create()->deleteAll();
		$o = new I18nBehaviorTest11();
		$o->setFoo(123);
		$o->save();
		$res = I18nBehaviorTest11Query::create()
			->joinWithI18n('en_EN', Criteria::INNER_JOIN)
			->findOne();
		$this->assertNull($res);
	}

	public function testJoinWithI18nHydratesRelatedObject()
	{
		$con = Propel::getConnection(I18nBehaviorTest11Peer::DATABASE_NAME);
		$con->useDebug(true);
		I18nBehaviorTest11Query::create()->deleteAll();
		I18nBehaviorTest11I18nQuery::create()->deleteAll();
		$o = new I18nBehaviorTest11();
		$o->setFoo(123);
		$o->setLocale('en_EN');
		$o->setBar('hello');
		$o->setLocale('fr_FR');
		$o->setBar('bonjour');
		$o->save();
		I18nBehaviorTest11Peer::clearInstancePool();
		I18nBehaviorTest11I18nPeer::clearInstancePool();
		$o = I18nBehaviorTest11Query::create()
			->joinWithI18n('en_EN')
			->findOne($con);
		$count = $con->getQueryCount();
		$translation = $o->getTranslation('en_EN', $con);
		$this->assertEquals($count, $con->getQueryCount());
		$this->assertEquals('hello', $translation->getBar());
	}

	public function testJoinWithI18nSetsTheLocaleOnResults()
	{
		I18nBehaviorTest11Query::create()->deleteAll();
		I18nBehaviorTest11I18nQuery::create()->deleteAll();
		$o = new I18nBehaviorTest11();
		$o->setFoo(123);
		$o->setLocale('en_EN');
		$o->setBar('hello');
		$o->setLocale('fr_FR');
		$o->setBar('bonjour');
		$o->save();
		$o1 = I18nBehaviorTest11Query::create()
			->joinWithI18n('en_EN')
			->findOne();
		$this->assertEquals('en_EN', $o1->getLocale());
		$o2 = I18nBehaviorTest11Query::create()
			->joinWithI18n('fr_FR')
			->findOne();
		$this->assertEquals('fr_FR', $o2->getLocale());
	}

	public function testJoinWithI18nAndLimitDoesNotThrowException()
	{
		$res = I18nBehaviorTest11Query::create()
			->joinWithI18n('en_EN')
			->limit(2)
			->find();
		$this->assertInstanceOf('PropelObjectCollection', $res);
	}

	// This is not a desired behavior, but there is no way to overcome it
	// because if we don't issue a database query when the collection exists
	// then there is no way to avoid duplicates when adding translations.
	// use case:
	// $o = new Object();
	// $t1 = new Translation();
	// $o->setTranslation($t2, 'en_EN'); // this is what happens during joined hydration
	// now the translation collection exists
	// $t2 = $o->getTranslation('fr_FR'); // we MUST issue a query here
	public function testJoinWithI18nDoesNotExecuteAdditionalQueryWhenNoTranslationIsFound()
	{
		$this->markTestSkipped();
		$con = Propel::getConnection(I18nBehaviorTest11Peer::DATABASE_NAME);
		$con->useDebug(true);
		I18nBehaviorTest11Query::create()->deleteAll();
		I18nBehaviorTest11I18nQuery::create()->deleteAll();
		$o = new I18nBehaviorTest11();
		$o->save();
		$o = I18nBehaviorTest11Query::create()
			->joinWithI18n('en_EN')
			->findOne($con);
		$count = $con->getQueryCount();
		$translation = $o->getTranslation('en_EN', $con);
		$this->assertEquals($count, $con->getQueryCount());
	}

}
