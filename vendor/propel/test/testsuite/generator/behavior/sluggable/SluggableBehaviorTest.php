<?php

/*
 *	$Id: TimestampableBehaviorTest.php 1460 2010-01-17 22:36:48Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Tests for SluggableBehavior class
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior.sluggable
 */
class SluggableBehaviorTest extends BookstoreTestBase
{
	public function testParameters()
	{
		$table13 = Table13Peer::getTableMap();
		$this->assertEquals(count($table13->getColumns()), 3, 'Sluggable adds one columns by default');
		$this->assertTrue(method_exists('Table13', 'getSlug'), 'Sluggable adds a slug column by default');
		$table14 = Table14Peer::getTableMap();
		$this->assertEquals(count($table14->getColumns()), 3, 'Sluggable does not add a column when it already exists');
		$this->assertTrue(method_exists('Table14', 'getUrl'), 'Sluggable allows customization of slug_column name');
		$this->assertTrue(method_exists('Table14', 'getSlug'), 'Sluggable adds a standard getter for the slug column');
	}

	public function testObjectGetter()
	{
		$this->assertTrue(method_exists('Table13', 'getSlug'), 'Sluggable adds a getter for the slug column');
		$t = new Table13();
		$t->setSlug('foo');
		$this->assertEquals('foo', $t->getSlug(), 'getSlug() returns the object slug');
		$this->assertTrue(method_exists('Table14', 'getSlug'), 'Sluggable adds a getter for the slug column, even if the column does not have the default name');
		$t = new Table14();
		$t->setUrl('foo');
		$this->assertEquals('foo', $t->getSlug(), 'getSlug() returns the object slug');
	}

	public function testObjectSetter()
	{
		$this->assertTrue(method_exists('Table13', 'setSlug'), 'Sluggable adds a setter for the slug column');
		$t = new Table13();
		$t->setSlug('foo');
		$this->assertEquals('foo', $t->getSlug(), 'setSlug() sets the object slug');
		$this->assertTrue(method_exists('Table14', 'setSlug'), 'Sluggable adds a setter for the slug column, even if the column does not have the default name');
		$t = new Table14();
		$t->setSlug('foo');
		$this->assertEquals('foo', $t->getUrl(), 'setSlug() sets the object slug');
	}

	public function testObjectCreateRawSlug()
	{
		$t = new TestableTable13();
		$this->assertEquals('n-a', $t->createRawSlug(), 'createRawSlug() returns an empty string for an empty object with no pattern');
		$t->setTitle('Hello, World');
		$this->assertEquals('hello-world', $t->createRawSlug(), 'createRawSlug() returns the cleaned up object string representation by default');

		$t = new TestableTable14();
		$this->assertEquals('/foo/n-a/bar', $t->createRawSlug(), 'createRawSlug() returns a slug for an empty object with a pattern');
		$t->setTitle('Hello, World');
		$this->assertEquals('/foo/hello-world/bar', $t->createRawSlug(), 'createRawSlug() returns a slug based on a pattern');
	}

	public static function cleanupSlugProvider()
	{
		return array(
			array('', 'n-a'),
			array('foo', 'foo'),
			array('foo bar', 'foo-bar'),
			array('foo  bar', 'foo-bar'),
			array('FoO', 'foo'),
			array('fôo', 'foo'),
			array(' foo ', 'foo'),
			array('f/o:o', 'f-o-o'),
			array('foo1', 'foo1'),
		);
	}

	/**
	 * @dataProvider cleanupSlugProvider
	 */
	public function testObjectCleanupSlugPart($in, $out)
	{
		$t = new TestableTable13();
		$this->assertEquals($out, $t->cleanupSlugPart($in), 'cleanupSlugPart() cleans up the slug part');
	}

	public static function limitSlugSizeProvider()
	{
		return array(
			array('123', '123'),
			array(str_repeat('*', 80), str_repeat('*', 80)),
			array(str_repeat('*', 97), str_repeat('*', 97)),
			array(str_repeat('*', 98), str_repeat('*', 97)),
			array(str_repeat('*', 99), str_repeat('*', 97)),
			array(str_repeat('*', 100), str_repeat('*', 97)),
			array(str_repeat('*', 150), str_repeat('*', 97)),
		);
	}

	/**
	 * @dataProvider limitSlugSizeProvider
	 */
	public function testObjectLimitSlugSize($in, $out)
	{
		$t = new TestableTable14();
		$this->assertEquals($out, $t->limitSlugSize($in), 'limitSlugsize() limits the slug size');
	}

	public function testObjectMakeSlugUnique()
	{
		Table13Query::create()->deleteAll();
		$t = new TestableTable13();
		$this->assertEquals('', $t->makeSlugUnique(''), 'makeSlugUnique() returns the input slug when the input is empty');
		$this->assertEquals('foo', $t->makeSlugUnique('foo'), 'makeSlugUnique() returns the input slug when the table is empty');
		$t->setSlug('foo');
		$t->save();
		$t = new TestableTable13();
		$this->assertEquals('bar', $t->makeSlugUnique('bar'), 'makeSlugUnique() returns the input slug when the table does not contain a similar slug');
		$t->save();
		$t = new TestableTable13();
		$this->assertEquals('foo-1', $t->makeSlugUnique('foo'), 'makeSlugUnique() returns an incremented input when it already exists');
		$t->setSlug('foo-1');
		$t->save();
		$t = new TestableTable13();
		$this->assertEquals('foo-2', $t->makeSlugUnique('foo'), 'makeSlugUnique() returns an incremented input when it already exists');
	}

	public function testObjectCreateSlug()
	{
		Table13Query::create()->deleteAll();
		$t = new TestableTable13();
		$this->assertEquals('n-a', $t->createSlug(), 'createSlug() returns n-a for an empty object');
		$t->setTitle('Hello, World!');
		$this->assertEquals('hello-world', $t->createSlug(), 'createSlug() returns a cleaned up slug');
		$t->setSlug('hello-world');
		$t->save();
		$t = new TestableTable13();
		$t->setTitle('Hello; wOrld');
		$this->assertEquals('hello-world-1', $t->createSlug(), 'createSlug() returns a unique slug');

		Table14Query::create()->deleteAll();
		$t = new TestableTable14();
		$this->assertEquals('/foo/n-a/bar', $t->createSlug(), 'createSlug() returns a slug for an empty object with a pattern');
		$t->setTitle('Hello, World!');
		$this->assertEquals('/foo/hello-world/bar', $t->createSlug(), 'createSlug() returns a cleaned up slug');
		$t->setSlug('/foo/hello-world/bar');
		$t->save();
		$t = new TestableTable14();
		$t->setTitle('Hello; wOrld:');
		$this->assertEquals('/foo/hello-world/bar/1', $t->createSlug(), 'createSlug() returns a unique slug');
	}

	public function testObjectPreSave()
	{
		Table14Query::create()->deleteAll();
		$t = new Table14();
		$t->save();
		$this->assertEquals('/foo/n-a/bar', $t->getSlug(), 'preSave() sets a default slug for empty objects');
		$t = new Table14();
		$t->setTitle('Hello, World');
		$t->save();
		$this->assertEquals('/foo/hello-world/bar', $t->getSlug(), 'preSave() sets a cleanued up slug for objects');
		$t = new Table14();
		$t->setTitle('Hello, World');
		$t->save();
		$this->assertEquals('/foo/hello-world/bar/1', $t->getSlug(), 'preSave() sets a unique slug for objects');
		$t = new Table14();
		$t->setTitle('Hello, World');
		$t->setSlug('/foo/custom/bar');
		$t->save();
		$this->assertEquals('/foo/custom/bar', $t->getSlug(), 'preSave() uses the given slug if it exists');
		$t = new Table14();
		$t->setTitle('Hello, World');
		$t->setSlug('/foo/custom/bar');
		$t->save();
		$this->assertEquals('/foo/custom/bar/1', $t->getSlug(), 'preSave() uses the given slug if it exists and makes it unique');
	}

	public function testObjectSlugLifecycle()
	{
		Table13Query::create()->deleteAll();
		$t = new Table13();
		$t->setTitle('Hello, World');
		$t->save();
		$this->assertEquals('hello-world', $t->getSlug(), 'preSave() creates a slug for new objects');
		$t->setSlug('hello-bar');
		$t->save();
		$this->assertEquals('hello-bar', $t->getSlug(), 'setSlug() allows to override default slug');
		$t->setSlug('');
		$t->save();
		$this->assertEquals('hello-world', $t->getSlug(), 'setSlug(null) relaunches the slug generation');

		Table14Query::create()->deleteAll();
		$t = new Table14();
		$t->setTitle('Hello, World2');
		$t->setSlug('hello-bar2');
		$t->save();
		$this->assertEquals('hello-bar2', $t->getSlug(), 'setSlug() allows to override default slug, even before save');
		$t->setSlug('');
		$t->save();
		$this->assertEquals('/foo/hello-world2/bar', $t->getSlug(), 'setSlug(null) relaunches the slug generation');
	}

	public function testObjectSlugAutoUpdate()
	{
		Table13Query::create()->deleteAll();
		$t = new Table13();
		$t->setTitle('Hello, World');
		$t->save();
		$this->assertEquals('hello-world', $t->getSlug(), 'preSave() creates a slug for new objects');
		$t->setTitle('Hello, My World');
		$t->save();
		$this->assertEquals('hello-my-world', $t->getSlug(), 'preSave() autoupdates slug on object change');
		$t->setTitle('Hello, My Whole New World');
		$t->setSlug('hello-bar');
		$t->save();
		$this->assertEquals('hello-bar', $t->getSlug(), 'preSave() does not autoupdate slug when it was set by the user');
	}

	public function testObjectSlugAutoUpdatePermanent()
	{
		Table14Query::create()->deleteAll();
		$t = new Table14();
		$t->setTitle('Hello, World');
		$t->save();
		$this->assertEquals('/foo/hello-world/bar', $t->getSlug(), 'preSave() creates a slug for new objects');
		$t->setTitle('Hello, My World');
		$t->save();
		$this->assertEquals('/foo/hello-world/bar', $t->getSlug(), 'preSave() does not autoupdate slug on object change for permanent slugs');
		$t->setSlug('hello-bar');
		$t->save();
		$this->assertEquals('hello-bar', $t->getSlug(), 'setSlug() still works for permanent slugs');
	}

	public function testQueryFindOneBySlug()
	{
		$this->assertTrue(method_exists('Table13Query', 'findOneBySlug'), 'The generated query provides a findOneBySlug() method');
		$this->assertTrue(method_exists('Table14Query', 'findOneBySlug'), 'The generated query provides a findOneBySlug() method even if the slug column doesnt have the default name');

		Table14Query::create()->deleteAll();
		$t1 = new Table14();
		$t1->setTitle('Hello, World');
		$t1->save();
		$t2 = new Table14();
		$t2->setTitle('Hello, Cruel World');
		$t2->save();
		$t = Table14Query::create()->findOneBySlug('/foo/hello-world/bar');
		$this->assertEquals($t1, $t, 'findOneBySlug() returns a single object matching the slug');
	}
}

class TestableTable13 extends Table13
{
	public function createSlug()
	{
		return parent::createSlug();
	}

	public function createRawSlug()
	{
		return parent::createRawSlug();
	}

	public static function cleanupSlugPart($slug, $separator = '-')
	{
		return parent::cleanupSlugPart($slug, $separator);
	}

	public function makeSlugUnique($slug, $separator = '-', $increment = 0)
	{
		return parent::makeSlugUnique($slug, $separator, $increment);
	}
}

class TestableTable14 extends Table14
{
	public function createSlug()
	{
		return parent::createSlug();
	}

	public function createRawSlug()
	{
		return parent::createRawSlug();
	}

	public static function limitSlugSize($slug, $incrementReservedSpace = 3)
	{
		return parent::limitSlugSize($slug, $incrementReservedSpace);
	}
}