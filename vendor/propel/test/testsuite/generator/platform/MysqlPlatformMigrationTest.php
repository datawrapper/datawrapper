<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/PlatformMigrationTestProvider.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/platform/MysqlPlatform.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/Column.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/VendorInfo.php';

/**
 *
 * @package    generator.platform
 */
class MysqlPlatformMigrationTest extends PlatformMigrationTestProvider
{
	/**
	 * Get the Platform object for this class
	 *
	 * @return     Platform
	 */
	protected function getPlatform()
	{
		return new MysqlPlatform();
	}

	/**
	 * @dataProvider providerForTestGetModifyDatabaseDDL
	 */
	public function testGetModifyDatabaseDDL($databaseDiff)
	{
		$expected = "
# This is a fix for InnoDB in MySQL >= 4.1.x
# It \"suspends judgement\" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `foo1`;

RENAME TABLE `foo3` TO `foo4`;

ALTER TABLE `foo2` CHANGE `bar` `bar1` INTEGER;

ALTER TABLE `foo2` CHANGE `baz` `baz` VARCHAR(12);

ALTER TABLE `foo2` ADD
(
	`baz3` TEXT
);

CREATE TABLE `foo5`
(
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`lkdjfsh` INTEGER,
	`dfgdsgf` TEXT,
	PRIMARY KEY (`id`)
) ENGINE=MyISAM;

# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyDatabaseDDL($databaseDiff));
	}

	/**
	 * @dataProvider providerForTestGetRenameTableDDL
	 */
	public function testGetRenameTableDDL($fromName, $toName)
	{
		$expected = "
RENAME TABLE `foo1` TO `foo2`;
";
		$this->assertEquals($expected, $this->getPlatform()->getRenameTableDDL($fromName, $toName));
	}

	/**
	 * @dataProvider providerForTestGetModifyTableDDL
	 */
	public function testGetModifyTableDDL($tableDiff)
	{
		$expected = "
ALTER TABLE `foo` DROP FOREIGN KEY `foo1_FK_2`;

ALTER TABLE `foo` DROP FOREIGN KEY `foo1_FK_1`;

DROP INDEX `bar_baz_FK` ON `foo`;

DROP INDEX `foo1_FI_2` ON `foo`;

DROP INDEX `bar_FK` ON `foo`;

ALTER TABLE `foo` CHANGE `bar` `bar1` INTEGER;

ALTER TABLE `foo` CHANGE `baz` `baz` VARCHAR(12);

ALTER TABLE `foo` ADD
(
	`baz3` TEXT
);

CREATE INDEX `bar_FK` ON `foo` (`bar1`);

CREATE INDEX `baz_FK` ON `foo` (`baz3`);

ALTER TABLE `foo` ADD CONSTRAINT `foo1_FK_1`
	FOREIGN KEY (`bar1`)
	REFERENCES `foo2` (`bar`);
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableDDL($tableDiff));
	}

	/**
	 * @dataProvider providerForTestGetModifyTableColumnsDDL
	 */
	public function testGetModifyTableColumnsDDL($tableDiff)
	{
		$expected = "
ALTER TABLE `foo` CHANGE `bar` `bar1` INTEGER;

ALTER TABLE `foo` CHANGE `baz` `baz` VARCHAR(12);

ALTER TABLE `foo` ADD
(
	`baz3` TEXT
);
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableColumnsDDL($tableDiff));
	}

	/**
	 * @dataProvider providerForTestGetModifyTablePrimaryKeysDDL
	 */
	public function testGetModifyTablePrimaryKeysDDL($tableDiff)
	{
		$expected = "
ALTER TABLE `foo` DROP PRIMARY KEY;

ALTER TABLE `foo` ADD PRIMARY KEY (`id`,`bar`);
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyTablePrimaryKeyDDL($tableDiff));
	}

	/**
	 * @dataProvider providerForTestGetModifyTableIndicesDDL
	 */
	public function testGetModifyTableIndicesDDL($tableDiff)
	{
		$expected = "
DROP INDEX `bar_FK` ON `foo`;

CREATE INDEX `baz_FK` ON `foo` (`baz`);

DROP INDEX `bar_baz_FK` ON `foo`;

CREATE INDEX `bar_baz_FK` ON `foo` (`id`,`bar`,`baz`);
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableIndicesDDL($tableDiff));
	}

	/**
	 * @dataProvider providerForTestGetModifyTableForeignKeysDDL
	 */
	public function testGetModifyTableForeignKeysDDL($tableDiff)
	{
		$expected = "
ALTER TABLE `foo1` DROP FOREIGN KEY `foo1_FK_1`;

ALTER TABLE `foo1` ADD CONSTRAINT `foo1_FK_3`
	FOREIGN KEY (`baz`)
	REFERENCES `foo2` (`baz`);

ALTER TABLE `foo1` DROP FOREIGN KEY `foo1_FK_2`;

ALTER TABLE `foo1` ADD CONSTRAINT `foo1_FK_2`
	FOREIGN KEY (`bar`,`id`)
	REFERENCES `foo2` (`bar`,`id`);
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableForeignKeysDDL($tableDiff));
	}

	/**
	 * @dataProvider providerForTestGetModifyTableForeignKeysSkipSqlDDL
	 */
	public function testGetModifyTableForeignKeysSkipSqlDDL($tableDiff)
	{
		$expected = "
ALTER TABLE `foo1` DROP FOREIGN KEY `foo1_FK_1`;
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableForeignKeysDDL($tableDiff));
		$expected = "
ALTER TABLE `foo1` ADD CONSTRAINT `foo1_FK_1`
	FOREIGN KEY (`bar`)
	REFERENCES `foo2` (`bar`);
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableForeignKeysDDL($tableDiff->getReverseDiff()));
	}

	/**
	 * @dataProvider providerForTestGetModifyTableForeignKeysSkipSql2DDL
	 */
	public function testGetModifyTableForeignKeysSkipSql2DDL($tableDiff)
	{
		$expected = '';
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableForeignKeysDDL($tableDiff));
		$expected = '';
		$this->assertEquals($expected, $this->getPlatform()->getModifyTableForeignKeysDDL($tableDiff->getReverseDiff()));
	}

	/**
	 * @dataProvider providerForTestGetRemoveColumnDDL
	 */
	public function testGetRemoveColumnDDL($column)
	{
		$expected = "
ALTER TABLE `foo` DROP `bar`;
";
		$this->assertEquals($expected, $this->getPlatform()->getRemoveColumnDDL($column));
	}

	/**
	 * @dataProvider providerForTestGetRenameColumnDDL
	 */
	public function testGetRenameColumnDDL($fromColumn, $toColumn)
	{
		$expected = "
ALTER TABLE `foo` CHANGE `bar1` `bar2` DOUBLE(2);
";
		$this->assertEquals($expected, $this->getPlatform()->getRenameColumnDDL($fromColumn, $toColumn));
	}

	/**
	 * @dataProvider providerForTestGetModifyColumnDDL
	 */
	public function testGetModifyColumnDDL($columnDiff)
	{
		$expected = "
ALTER TABLE `foo` CHANGE `bar` `bar` DOUBLE(3);
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyColumnDDL($columnDiff));
	}

	/**
	 * @dataProvider providerForTestGetModifyColumnsDDL
	 */
	public function testGetModifyColumnsDDL($columnDiffs)
	{
		$expected = "
ALTER TABLE `foo` CHANGE `bar1` `bar1` DOUBLE(3);

ALTER TABLE `foo` CHANGE `bar2` `bar2` INTEGER NOT NULL;
";
		$this->assertEquals($expected, $this->getPlatform()->getModifyColumnsDDL($columnDiffs));
	}

	/**
	 * @dataProvider providerForTestGetAddColumnDDL
	 */
	public function testGetAddColumnDDL($column)
	{
		$expected = "
ALTER TABLE `foo` ADD `bar` INTEGER;
";
		$this->assertEquals($expected, $this->getPlatform()->getAddColumnDDL($column));
	}

	/**
	 * @dataProvider providerForTestGetAddColumnsDDL
	 */
	public function testGetAddColumnsDDL($columns)
	{
		$expected = "
ALTER TABLE `foo` ADD
(
	`bar1` INTEGER,
	`bar2` DOUBLE(3,2) DEFAULT -1 NOT NULL
);
";
		$this->assertEquals($expected, $this->getPlatform()->getAddColumnsDDL($columns));
	}
}
