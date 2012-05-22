<?php

/*
 *	$Id$
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/archivable/ArchivableBehavior.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests for ArchivableBehavior class
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior.archivable
 */
class ArchivableBehaviorQueryBuilderModifierTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
		if (!class_exists('ArchivableTest100')) {
			$schema = <<<EOF
<database name="archivable_behavior_test_100">

	<table name="archivable_test_100">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
		<column name="title" type="VARCHAR" size="100" primaryString="true" />
		<column name="age" type="INTEGER" />
		<column name="foo_id" type="INTEGER" />
		<foreign-key foreignTable="archivable_test_200">
			<reference local="foo_id" foreign="id" />
		</foreign-key>
		<index>
			<index-column name="title" />
			<index-column name="age" />
		</index>
		<behavior name="archivable" />
	</table>

	<table name="archivable_test_200">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
		<column name="title" type="VARCHAR" size="100" primaryString="true" />
		<behavior name="archivable" />
	</table>

	<table name="archivable_test_200_archive">
		<column name="id" required="true" primaryKey="true" type="INTEGER" />
		<column name="title" type="VARCHAR" size="100" primaryString="true" />
	</table>

	<table name="archivable_test_300">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
		<column name="title" type="VARCHAR" size="100" primaryString="true" />
		<column name="age" type="INTEGER" />
		<column name="foo_id" type="INTEGER" />
		<behavior name="archivable">
			<parameter name="log_archived_at" value="false" />
			<parameter name="archive_table" value="my_old_archivable_test_300" />
			<parameter name="archive_on_insert" value="true" />
			<parameter name="archive_on_update" value="true" />
			<parameter name="archive_on_delete" value="false" />
		</behavior>
	</table>

	<table name="archivable_test_400">
		<column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
		<column name="title" type="VARCHAR" size="100" primaryString="true" />
		<column name="age" type="INTEGER" />
		<behavior name="archivable">
			<parameter name="archive_class" value="FooArchive" />
		</behavior>
	</table>

</database>
EOF;
			PropelQuickBuilder::buildSchema($schema);
		}
	}

	public function testHasArchiveMethod()
	{
		$this->assertTrue(method_exists('ArchivableTest100Query', 'archive'));
	}

	public function testArchiveCreatesACopyByDefault()
	{
		ArchivableTest100Query::create()->deleteAllWithoutArchive();
		$a = new ArchivableTest100();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		ArchivableTest100Query::create()
			->filterById($a->getId())
			->archive();
		$archive = ArchivableTest100ArchiveQuery::create()
			->filterById($a->getId())
			->findOne();
		$this->assertInstanceOf('ArchivableTest100Archive', $archive);
		$this->assertEquals('foo', $archive->getTitle());
		$this->assertEquals(12, $archive->getAge());
	}

	public function testArchiveUpdatesExistingArchive()
	{
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		$a = new ArchivableTest100();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		$b = new ArchivableTest100Archive();
		$b->setId($a->getId());
		$b->setTitle('bar');
		$b->save();
		ArchivableTest100Query::create()
			->filterById($a->getId())
			->archive(null, false);
		$this->assertEquals(1, ArchivableTest100ArchiveQuery::create()->count());
		$this->assertEquals('foo', $b->getTitle());
	}

	public function testArchiveReturnsNumberOfArchivedObjectsObject()
	{
		ArchivableTest100Query::create()->deleteAllWithoutArchive();
		$this->assertEquals(0, ArchivableTest100Query::create()->archive());
		$a = new ArchivableTest100();
		$a->save();
		$this->assertEquals(1, ArchivableTest100Query::create()->archive());
	}

	public function testUpdateDoesNotCreateArchivesByDefault()
	{
		ArchivableTest100Query::create()->deleteAllWithoutArchive();
		$a = new ArchivableTest100();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		ArchivableTest100Query::create()
			->filterById($a->getId())
			->update(array('Title' => 'bar'));
		$this->assertEquals(1, ArchivableTest100Query::create()->filterByTitle('bar')->count());
		$this->assertEquals(0, ArchivableTest100ArchiveQuery::create()->count());
	}

	public function testUpdateCreatesArchivesIfSpecified()
	{
		ArchivableTest300Query::create()->deleteAll();
		$a = new ArchivableTest300();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		MyOldArchivableTest300Query::create()->deleteAll();
		ArchivableTest300Query::create()
			->filterById($a->getId())
			->update(array('Title' => 'bar'));
		$this->assertEquals(1, ArchivableTest300Query::create()->filterByTitle('bar')->count());
		$this->assertEquals(1, MyOldArchivableTest300Query::create()->count());
	}

	public function testDeleteCreatesArchivesByDefault()
	{
		ArchivableTest100Query::create()->deleteAllWithoutArchive();
		$a = new ArchivableTest100();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		ArchivableTest100Query::create()
			->filterById($a->getId())
			->delete();
		$this->assertEquals(0, ArchivableTest100Query::create()->count());
		$this->assertEquals(1, ArchivableTest100ArchiveQuery::create()->count());
	}

	public function testDeleteAllCreatesArchivesByDefault()
	{
		ArchivableTest100Query::create()->deleteAllWithoutArchive();
		$a = new ArchivableTest100();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		ArchivableTest100Query::create()
			->deleteAll();
		$this->assertEquals(0, ArchivableTest100Query::create()->count());
		$this->assertEquals(1, ArchivableTest100ArchiveQuery::create()->count());
	}

	public function testDeleteDoesNotCreateArchivesIfSpecified()
	{
		ArchivableTest300Query::create()->deleteAll();
		$a = new ArchivableTest300();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		MyOldArchivableTest300Query::create()->deleteAll();
		ArchivableTest300Query::create()
			->filterById($a->getId())
			->delete();
		$this->assertEquals(0, ArchivableTest300Query::create()->count());
		$this->assertEquals(0, MyOldArchivableTest300Query::create()->count());
	}

	public function testDeleteAllDoesNotCreateArchivesIfSpecified()
	{
		ArchivableTest300Query::create()->deleteAll();
		$a = new ArchivableTest300();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		MyOldArchivableTest300Query::create()->deleteAll();
		ArchivableTest300Query::create()
			->deleteAll();
		$this->assertEquals(0, ArchivableTest300Query::create()->count());
		$this->assertEquals(0, MyOldArchivableTest300Query::create()->count());
	}

	public function testHasUpdateWithoutArchiveMethod()
	{
		$this->assertTrue(method_exists('ArchivableTest300Query', 'updateWithoutArchive'));
	}

	public function testUpdateWithoutArchiveDoesNotCreateArchives()
	{
		ArchivableTest300Query::create()->deleteAll();
		$a = new ArchivableTest300();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		MyOldArchivableTest300Query::create()->deleteAll();
		ArchivableTest300Query::create()
			->filterById($a->getId())
			->updateWithoutArchive(array('Title' => 'bar'));
		$this->assertEquals(1, ArchivableTest300Query::create()->filterByTitle('bar')->count());
		$this->assertEquals(0, MyOldArchivableTest300Query::create()->count());
	}

	public function testHasDeleteWithoutArchiveMethods()
	{
		$this->assertTrue(method_exists('ArchivableTest100Query', 'deleteWithoutArchive'));
		$this->assertTrue(method_exists('ArchivableTest100Query', 'deleteAllWithoutArchive'));
	}

	public function testDeleteWithoutArchiveDoesNotCreateArchivesByDefault()
	{
		ArchivableTest100Query::create()->deleteAllWithoutArchive();
		$a = new ArchivableTest100();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		ArchivableTest100Query::create()
			->filterById($a->getId())
			->deleteWithoutArchive();
		$this->assertEquals(0, ArchivableTest100Query::create()->count());
		$this->assertEquals(0, ArchivableTest100ArchiveQuery::create()->count());
	}

	public function testDeleteAllWithoutArchiveDoesNotCreateArchivesByDefault()
	{
		ArchivableTest100Query::create()->deleteAllWithoutArchive();
		$a = new ArchivableTest100();
		$a->setTitle('foo');
		$a->setAge(12);
		$a->save();
		ArchivableTest100ArchiveQuery::create()->deleteAll();
		ArchivableTest100Query::create()
			->deleteAllWithoutArchive();
		$this->assertEquals(0, ArchivableTest100Query::create()->count());
		$this->assertEquals(0, ArchivableTest100ArchiveQuery::create()->count());
	}

}