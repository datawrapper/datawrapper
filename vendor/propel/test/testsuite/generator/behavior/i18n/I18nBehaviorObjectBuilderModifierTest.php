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
 * Tests for I18nBehavior class object modifier
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior.i18n
 */
class I18nBehaviorObjectBuilderModifierTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		if (!class_exists('I18nBehaviorTest1')) {
			$schema = <<<EOF
<database name="i18n_behavior_test_1">
	<table name="i18n_behavior_test_1">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="foo" type="INTEGER" />
		<column name="bar" type="VARCHAR" size="100" />
		<behavior name="i18n">
			<parameter name="i18n_columns" value="bar" />
		</behavior>
	</table>
	<table name="i18n_behavior_test_2">
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

	<table name="movie">
		<column name="id" type="integer" required="true" primaryKey="true" autoincrement="true" />
		<column name="director" type="varchar" size="255" />
		<column name="title" type="varchar" primaryString="true" />
		<behavior name="i18n">
			<parameter name="i18n_columns" value="title" />
			<parameter name="locale_alias" value="culture" />
		</behavior>
	</table>
	<table name="toy">
		<column name="id" type="integer" required="true" primaryKey="true" autoincrement="true" />
		<column name="ref" type="varchar" size="255" />
		<column name="name" type="varchar" size="255" />
		<behavior name="i18n">
			<parameter name="i18n_columns" value="name" />
			<parameter name="locale_alias" value="culture" />
		</behavior>
		<column name="movie_id" type="integer" />
		<foreign-key foreignTable="movie">
			<reference local="movie_id" foreign="id" />
		</foreign-key>
	</table>
	<table name="i18n_behavior_test_local_column">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="foo" type="INTEGER" />
		<column name="bar" type="VARCHAR" size="100" />
		<behavior name="i18n">
			<parameter name="i18n_columns" value="bar" />
			<parameter name="locale_column" value="my_lang" />
		</behavior>
	</table>
</database>
EOF;
			PropelQuickBuilder::buildSchema($schema);
		}
	}

	public function testPostDeleteEmulatesOnDeleteCascade()
	{
		I18nBehaviorTest1Query::create()->deleteAll();
		I18nBehaviorTest1I18nQuery::create()->deleteAll();
		$o = new I18nBehaviorTest1();
		$o->setFoo(123);
		$o->setLocale('en_EN');
		$o->setBar('hello');
		$o->setLocale('fr_FR');
		$o->setBar('bonjour');
		$o->save();
		$this->assertEquals(2, I18nBehaviorTest1I18nQuery::create()->count());
		$o->clearI18nBehaviorTest1I18ns();
		$o->delete();
		$this->assertEquals(0, I18nBehaviorTest1I18nQuery::create()->count());
	}

	public function testGetTranslationReturnsTranslationObject()
	{
		$o = new I18nBehaviorTest1();
		$translation = $o->getTranslation();
		$this->assertTrue($translation instanceof I18nBehaviorTest1I18n);
	}

	public function testGetTranslationOnNewObjectReturnsNewTranslation()
	{
		$o = new I18nBehaviorTest1();
		$translation = $o->getTranslation();
		$this->assertTrue($translation->isNew());
	}

	public function testGetTranslationOnPersistedObjectReturnsNewTranslation()
	{
		$o = new I18nBehaviorTest1();
		$o->save();
		$translation = $o->getTranslation();
		$this->assertTrue($translation->isNew());
	}

	public function testGetTranslationOnPersistedObjectWithTranslationReturnsExistingTranslation()
	{
		$o = new I18nBehaviorTest1();
		$translation = new I18nBehaviorTest1I18n();
		$o->addI18nBehaviorTest1I18n($translation);
		$o->save();
		$translation = $o->getTranslation();
		$this->assertFalse($translation->isNew());
	}

	public function testGetTranslationAcceptsALocaleParameter()
	{
		$o = new I18nBehaviorTest1();
		$translation1 = new I18nBehaviorTest1I18n();
		$translation1->setLocale('en_EN');
		$o->addI18nBehaviorTest1I18n($translation1);
		$translation2 = new I18nBehaviorTest1I18n();
		$translation2->setLocale('fr_FR');
		$o->addI18nBehaviorTest1I18n($translation2);
		$o->save();
		$this->assertEquals($translation1, $o->getTranslation('en_EN'));
		$this->assertEquals($translation2, $o->getTranslation('fr_FR'));
	}

	public function testGetTranslationSetsTheLocaleOnTheTranslation()
	{
		$o = new I18nBehaviorTest1();
		$o->save();
		$translation = $o->getTranslation();
		$this->assertEquals('en_EN', $translation->getLocale());
		$o = new I18nBehaviorTest2();
		$o->save();
		$translation = $o->getTranslation();
		$this->assertEquals('fr_FR', $translation->getLocale());
	}

	public function testGetTranslationUsesInternalCollectionIfAvailable()
	{
		$o = new I18nBehaviorTest1();
		$translation1 = new I18nBehaviorTest1I18n();
		$translation1->setLocale('en_EN');
		$o->addI18nBehaviorTest1I18n($translation1);
		$translation2 = new I18nBehaviorTest1I18n();
		$translation2->setLocale('fr_FR');
		$o->addI18nBehaviorTest1I18n($translation2);
		$translation = $o->getTranslation('en_EN');
		$this->assertEquals($translation1, $translation);
	}

	public function testRemoveTranslation()
	{
		$o = new I18nBehaviorTest1();
		$translation1 = new I18nBehaviorTest1I18n();
		$translation1->setLocale('en_EN');
		$o->addI18nBehaviorTest1I18n($translation1);
		$translation2 = new I18nBehaviorTest1I18n();
		$translation2->setLocale('fr_FR');
		$translation2->setBar('bonjour');
		$o->addI18nBehaviorTest1I18n($translation2);
		$o->save();
		$this->assertEquals(2, $o->countI18nBehaviorTest1I18ns());
		$o->removeTranslation('fr_FR');
		$this->assertEquals(1, $o->countI18nBehaviorTest1I18ns());
		$translation = $o->getTranslation('fr_FR');
		$this->assertNotEquals($translation->getBar(), $translation2->getBar());
	}

	public function testLocaleSetterAndGetterExist()
	{
		$this->assertTrue(method_exists('I18nBehaviorTest1', 'setLocale'));
		$this->assertTrue(method_exists('I18nBehaviorTest1', 'getLocale'));
	}

	public function testGetLocaleReturnsDefaultLocale()
	{
		$o = new I18nBehaviorTest1();
		$this->assertEquals('en_EN', $o->getLocale());
		$o = new I18nBehaviorTest2();
		$this->assertEquals('fr_FR', $o->getLocale());
	}

	public function testSetLocale()
	{
		$o = new I18nBehaviorTest1();
		$o->setLocale('fr_FR');
		$this->assertEquals('fr_FR', $o->getLocale());
	}

	public function testSetLocaleUsesDefaultLocale()
	{
		$o = new I18nBehaviorTest1();
		$o->setLocale('fr_FR');
		$o->setLocale();
		$this->assertEquals('en_EN', $o->getLocale());
	}

	public function testLocaleSetterAndGetterAliasesExist()
	{
		$this->assertTrue(method_exists('I18nBehaviorTest2', 'setCulture'));
		$this->assertTrue(method_exists('I18nBehaviorTest2', 'getCulture'));
	}

	public function testGetLocaleAliasReturnsDefaultLocale()
	{
		$o = new I18nBehaviorTest2();
		$this->assertEquals('fr_FR', $o->getCulture());
	}

	public function testSetLocaleAlias()
	{
		$o = new I18nBehaviorTest2();
		$o->setCulture('en_EN');
		$this->assertEquals('en_EN', $o->getCulture());
	}

	public function testGetCurrentTranslationUsesDefaultLocale()
	{
		$o = new I18nBehaviorTest1();
		$t = $o->getCurrentTranslation();
		$this->assertEquals('en_EN', $t->getLocale());
		$o = new I18nBehaviorTest2();
		$t = $o->getCurrentTranslation();
		$this->assertEquals('fr_FR', $t->getLocale());
	}

	public function testGetCurrentTranslationUsesCurrentLocale()
	{
		$o = new I18nBehaviorTest1();
		$o->setLocale('fr_FR');
		$this->assertEquals('fr_FR', $o->getCurrentTranslation()->getLocale());
		$o->setLocale('pt_PT');
		$this->assertEquals('pt_PT', $o->getCurrentTranslation()->getLocale());
	}

	public function testI18nColumnGetterUsesCurrentTranslation()
	{
		$o = new I18nBehaviorTest1();
		$t1 = $o->getCurrentTranslation();
		$t1->setBar('hello');
		$o->setLocale('fr_FR');
		$t2 = $o->getCurrentTranslation();
		$t2->setBar('bonjour');
		//$o->save();
		$o->setLocale('en_EN');
		$this->assertEquals('hello', $o->getBar());
		$o->setLocale('fr_FR');
		$this->assertEquals('bonjour', $o->getBar());
	}

	public function testI18nColumnSetterUsesCurrentTranslation()
	{
		$o = new I18nBehaviorTest1();
		$o->setBar('hello');
		$o->setLocale('fr_FR');
		$o->setBar('bonjour');
		$o->setLocale('en_EN');
		$this->assertEquals('hello', $o->getBar());
		$o->setLocale('fr_FR');
		$this->assertEquals('bonjour', $o->getBar());
	}

	public function testTranslationsArePersisted()
	{
		$o = new I18nBehaviorTest1();
		$o->save();
		$count = I18nBehaviorTest1I18nQuery::create()
			->filterById($o->getId())
			->count();
		$this->assertEquals(0, $count);
		$o->setBar('hello');
		$o->setLocale('fr_FR');
		$o->setBar('bonjour');
		$o->save();
		$count = I18nBehaviorTest1I18nQuery::create()
			->filterById($o->getId())
			->count();
		$this->assertEquals(2, $count);
	}

	public function testClearRemovesExistingTranlsations()
	{
		$o = new I18nBehaviorTest1();
		$translation1 = new I18nBehaviorTest1I18n();
		$translation1->setBar('baz');
		$translation1->setLocale('fr_FR');
		$o->addI18nBehaviorTest1I18n($translation1);
		$o->clear();
		$this->assertEquals('en_EN', $o->getLocale());
		$t1 = $o->getTranslation('fr_FR');
		$this->assertEquals('', $t1->getBar());
	}

	public function testI18nWithRelations()
	{
		MovieQuery::create()->deleteAll();
		$count = MovieQuery::create()->count();
		$this->assertEquals(0, $count, 'No movie before the test');
		ToyQuery::create()->deleteAll();
		$count = ToyQuery::create()->count();
		$this->assertEquals(0, $count, 'No toy before the test');
		MovieI18nQuery::create()->deleteAll();
		$count = MovieI18nQuery::create()->count();
		$this->assertEquals(0, $count, 'No i18n movies before the test');

		$m = new Movie();
		$m->setLocale('en');
		$m->setTitle('V For Vendetta');
		$m->setLocale('fr');
		$m->setTitle('V Pour Vendetta');

		$m->setLocale('en');
		$this->assertEquals('V For Vendetta', $m->getTitle());
		$m->setLocale('fr');
		$this->assertEquals('V Pour Vendetta', $m->getTitle());

		$t = new Toy();
		$t->setMovie($m);
		$t->save();

		$count = MovieQuery::create()->count();
		$this->assertEquals(1, $count, '1 movie');
		$count = ToyQuery::create()->count();
		$this->assertEquals(1, $count, '1 toy');
		$count = MovieI18nQuery::create()->count();
		$this->assertEquals(2, $count, '2 i18n movies');
		$count = ToyI18nQuery::create()->count();
		$this->assertEquals(0, $count, '0 i18n toys');
	}

	public function testI18nWithRelations2()
	{
		MovieQuery::create()->deleteAll();
		$count = MovieQuery::create()->count();
		$this->assertEquals(0, $count, 'No movie before the test');
		ToyQuery::create()->deleteAll();
		$count = ToyQuery::create()->count();
		$this->assertEquals(0, $count, 'No toy before the test');
		ToyI18nQuery::create()->deleteAll();
		$count = ToyI18nQuery::create()->count();
		$this->assertEquals(0, $count, 'No i18n toys before the test');
		MovieI18nQuery::create()->deleteAll();
		$count = MovieI18nQuery::create()->count();
		$this->assertEquals(0, $count, 'No i18n movies before the test');

		$t = new Toy();
		$t->setLocale('en');
		$t->setName('My Name');
		$t->setLocale('fr');
		$t->setName('Mon Nom');

		$t->setLocale('en');
		$this->assertEquals('My Name', $t->getName());
		$t->setLocale('fr');
		$this->assertEquals('Mon Nom', $t->getName());

		$m = new Movie();
		$m->addToy($t);
		$m->save();

		$count = MovieQuery::create()->count();
		$this->assertEquals(1, $count, '1 movie');
		$count = ToyQuery::create()->count();
		$this->assertEquals(1, $count, '1 toy');
		$count = ToyI18nQuery::create()->count();
		$this->assertEquals(2, $count, '2 i18n toys');
		$count = MovieI18nQuery::create()->count();
		$this->assertEquals(0, $count, '0 i18n movies');
	}

	public function testUseLocalColumnParameter()
	{
		$o = new I18nBehaviorTestLocalColumn();
		$translation1 = new I18nBehaviorTestLocalColumnI18n();
		$translation1->setMyLang('en_EN');
		$o->addI18nBehaviorTestLocalColumnI18n($translation1);
		$translation2 = new I18nBehaviorTestLocalColumnI18n();
		$translation2->setMyLang('fr_FR');
		$o->addI18nBehaviorTestLocalColumnI18n($translation2);
		$o->save();
		$this->assertEquals($translation1, $o->getTranslation('en_EN'));
		$this->assertEquals($translation2, $o->getTranslation('fr_FR'));
	}
}
