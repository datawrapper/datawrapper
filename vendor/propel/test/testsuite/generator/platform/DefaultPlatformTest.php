<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/platform/DefaultPlatform.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/Column.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/Propel.php';

/**
 *
 * @package    generator.platform
 */
class DefaultPlatformTest extends PHPUnit_Framework_TestCase
{
	protected $platform;

	/**
	 * Get the Platform object for this class
	 *
	 * @return     Platform
	 */
	protected function getPlatform()
	{
		if (null === $this->platform) {
			$this->platform = new DefaultPlatform();
		}
		return $this->platform;
	}

	protected function tearDown()
	{
		$this->platform = null;
	}

	public function testQuote()
	{
		$p = $this->getPlatform();

		$unquoted = "Nice";
		$quoted = $p->quote($unquoted);

		$this->assertEquals("'$unquoted'", $quoted);


		$unquoted = "Naughty ' string";
		$quoted = $p->quote($unquoted);
		$expected = "'Naughty '' string'";
		$this->assertEquals($expected, $quoted);
	}

	protected function createColumn($type, $defaultValue)
	{
		$column = new Column();
		$column->setType($type);
		$column->setDefaultValue($defaultValue);
		return $column;
	}

	public function createEnumColumn($defaultValues, $defaultValue)
	{
		$column = new Column();
		$column->setType(PropelTypes::ENUM);
		$column->setValueSet($defaultValues);
		$column->setDefaultValue($defaultValue);
		return $column;
	}

	public function getColumnDefaultValueDDLDataProvider()
	{
		return array(
			array($this->createColumn(PropelTypes::INTEGER, 0), "DEFAULT 0"),
			array($this->createColumn(PropelTypes::INTEGER, '0'), "DEFAULT 0"),
			array($this->createColumn(PropelTypes::VARCHAR, 'foo'), "DEFAULT 'foo'"),
			array($this->createColumn(PropelTypes::VARCHAR, 0), "DEFAULT '0'"),
			array($this->createColumn(PropelTypes::BOOLEAN, true), "DEFAULT 1"),
			array($this->createColumn(PropelTypes::BOOLEAN, false), "DEFAULT 0"),
			array($this->createColumn(PropelTypes::BOOLEAN, 'true'), "DEFAULT 1"),
			array($this->createColumn(PropelTypes::BOOLEAN, 'false'), "DEFAULT 0"),
			array($this->createColumn(PropelTypes::BOOLEAN, 'TRUE'), "DEFAULT 1"),
			array($this->createColumn(PropelTypes::BOOLEAN, 'FALSE'), "DEFAULT 0"),
			array($this->createEnumColumn(array('foo', 'bar', 'baz'), 'foo'), "DEFAULT 0"),
			array($this->createEnumColumn(array('foo', 'bar', 'baz'), 'bar'), "DEFAULT 1"),
			array($this->createEnumColumn(array('foo', 'bar', 'baz'), 'baz'), "DEFAULT 2"),
		);
	}

	/**
	 * @dataProvider getColumnDefaultValueDDLDataProvider
	 */
	public function testGetColumnDefaultValueDDL($column, $default)
	{
		$this->assertEquals($default, $this->getPlatform()->getColumnDefaultValueDDL($column));
	}

}
