<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license		 MIT License
 */

/**
 * @package      propel.generator.config
 */
interface GeneratorConfigInterface
{
	/**
	 * Gets a configured data model builder class for specified table and based on type.
	 *
	 * @param      Table $table
	 * @param      string $type The type of builder ('ddl', 'sql', etc.)
	 * @return     DataModelBuilder
	 */
	function getConfiguredBuilder(Table $table, $type);

	/**
	* Gets a configured Pluralizer class.
	*
	* @return     Pluralizer
	*/
	function getConfiguredPluralizer();

	/**
	 * Gets a specific propel (renamed) property from the build.
	 *
	 * @param      string $name
	 * @return     mixed
	 */
	function getBuildProperty($name);

	/**
	 * Sets a specific propel (renamed) property from the build.
	 *
	 * @param      string $name
	 * @param      mixed $value
	 */
	function setBuildProperty($name, $value);

	/**
	 * Creates and configures a new Platform class.
	 */
	function getConfiguredPlatform(PDO $con = null, $database = null);

	/**
	 * Gets a configured behavior class
	 */
	function getConfiguredBehavior($name);
}
