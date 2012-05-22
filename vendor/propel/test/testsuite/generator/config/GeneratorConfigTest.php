<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/config/GeneratorConfig.php';

/**
 * @author	William Durand <william.durand1@gmail.com>
 * @package	propel.generator.config
 */
class GeneratorConfigTest extends PHPUnit_Framework_TestCase
{
	protected $pathToFixtureFiles;

	public function setUp()
	{
		$this->pathToFixtureFiles = dirname(__FILE__) . '/../../../fixtures/generator/config';
	}

	public function testGetClassnameWithClass()
	{
		$file = $this->pathToFixtureFiles . '/Foobar.php';

		if (!file_exists($file)) {
			$this->markTestSkipped();
		}

		// Load the file to simulate the autoloading process
		require $file;

		$generator = new GeneratorConfig();
		$generator->setBuildProperty('propel.foo.bar', 'Foobar');

		$this->assertSame('Foobar', $generator->getClassname('propel.foo.bar'));
	}

	public function testGetClassnameWithClassAndNamespace()
	{
		$file = $this->pathToFixtureFiles . '/FoobarWithNS.php';

		if (!file_exists($file)) {
			$this->markTestSkipped();
		}

		// Load the file to simulate the autoloading process
		require $file;

		$generator = new GeneratorConfig();
		$generator->setBuildProperty('propel.foo.bar', '\Foo\Test\FoobarWithNS');

		$this->assertSame('\Foo\Test\FoobarWithNS', $generator->getClassname('propel.foo.bar'));
	}

	/**
 	 * @expectedException BuildException
 	 */
	public function testGetClassnameOnInexistantProperty()
	{
		$generator = new GeneratorConfig();
		$generator->getClassname('propel.foo.bar');
	}
}
