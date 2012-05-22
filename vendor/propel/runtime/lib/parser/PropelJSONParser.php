<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * JSON parser. Converts data between associative array and JSON formats
 *
 * @author     Francois Zaninotto
 * @package    propel.runtime.parser
 */
class PropelJSONParser extends PropelParser
{

	/**
	 * Converts data from an associative array to JSON.
	 *
	 * @param  array $array Source data to convert
	 * @return string Converted data, as a JSON string
	 */
	public function fromArray($array)
	{
		return json_encode($array);
	}

	/**
	 * Alias for PropelJSONParser::fromArray()
	 *
	 * @param  array $array Source data to convert
	 * @return string Converted data, as a JSON string
	 */
	public function toJSON($array)
	{
		return $this->fromArray($array);
	}

	/**
	 * Converts data from JSON to an associative array.
	 *
	 * @param  string $data Source data to convert, as a JSON string
	 * @return array Converted data
	 */
	public function toArray($data)
	{
		return json_decode($data, true);
	}

	/**
	 * Alias for PropelJSONParser::toArray()
	 *
	 * @param  string $data Source data to convert, as a JSON string
	 * @return array Converted data
	 */
	public function fromJSON($data)
	{
		return $this->toArray($data);
	}

}
