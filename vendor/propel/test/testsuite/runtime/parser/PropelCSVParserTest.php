<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../runtime/lib/parser/PropelParser.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/parser/PropelCSVParser.php';


/**
 * Test for PropelCSVParser class
 *
 * @author     Francois Zaninotto
 * @package    runtime.parser
 */
class PropelCSVParserTest extends PHPUnit_Framework_TestCase
{
	public static function arrayCsvConversionDataProvider()
	{
		return array(
			array(array(), "\r\n\r\n", 'empty array'),
			array(array('a' => 0, 'b' => null, 'c' => ''), "a,b,c\r\n0,N;,\r\n", 'associative array with empty values'),
			array(array('a' => 1, 'b' => 'bar'), "a,b\r\n1,bar\r\n", 'associative array with strings'),
			array(array('a' => '<html><body><p style="width:30px;">Hello, World!</p></body></html>'), "a\r\n\"<html><body><p style=\\\"width:30px;\\\">Hello, World!</p></body></html>\"\r\n", 'associative array with code'),
			array(array('a' => 1, 'b' => array('foo' => 2)), "a,b\r\n1,\"a:1:{s:3:\\\"foo\\\";i:2;}\"\r\n", 'nested associative arrays'),
			array(array('Id' => 123, 'Title' => 'Pride and Prejudice', 'AuthorId' => 456, 'ISBN' => '0553213105', 'Author' => array('Id' => 456, 'FirstName' => 'Jane', 'LastName' => 'Austen')), "Id,Title,AuthorId,ISBN,Author\r\n123,Pride and Prejudice,456,0553213105,\"a:3:{s:2:\\\"Id\\\";i:456;s:9:\\\"FirstName\\\";s:4:\\\"Jane\\\";s:8:\\\"LastName\\\";s:6:\\\"Austen\\\";}\"\r\n", 'array resulting from an object conversion'),
			array(array('a1' => 1, 'b2' => 2), "a1,b2\r\n1,2\r\n", 'keys with numbers'),
		);
	}

	/**
	 * @dataProvider arrayCsvConversionDataProvider
	 */
	public function testFromArray($arrayData, $csvData, $type)
	{
		$parser = new PropelCSVParser();
		$this->assertEquals($csvData, $parser->fromArray($arrayData), 'PropelCSVParser::fromArray() converts from ' . $type . ' correctly');
	}

	/**
	 * @dataProvider arrayCsvConversionDataProvider
	 */
	public function testToCSV($arrayData, $csvData, $type)
	{
		$parser = new PropelCSVParser();
		$this->assertEquals($csvData, $parser->toCSV($arrayData), 'PropelCSVParser::toCSV() converts from ' . $type . ' correctly');
	}

	/**
	 * @dataProvider arrayCsvConversionDataProvider
	 */
	public function testToArray($arrayData, $csvData, $type)
	{
		$parser = new PropelCSVParser();
		$this->assertEquals($arrayData, $parser->toArray($csvData), 'PropelCSVParser::toArray() converts to ' . $type . ' correctly');
	}

	/**
	 * @dataProvider arrayCsvConversionDataProvider
	 */
	public function testFromCSV($arrayData, $csvData, $type)
	{
		$parser = new PropelCSVParser();
		$this->assertEquals($arrayData, $parser->fromCSV($csvData), 'PropelCSVParser::fromCSV() converts to ' . $type . ' correctly');
	}

	public static function listToCSVDataProvider()
	{
		$list = array(
			array('Id' => 123, 'Title' => 'Pride and Prejudice', 'AuthorId' => 456, 'ISBN' => '0553213105', 'Author' => array('Id' => 456, 'FirstName' => 'Jane', 'LastName' => 'Austen')),
			array('Id' => 82, 'Title' => 'Anna Karenina', 'AuthorId' => 543, 'ISBN' => '0143035002', 'Author' => array('Id' => 543, 'FirstName' => 'Leo', 'LastName' => 'Tolstoi')),
			array('Id' => 567, 'Title' => 'War and Peace', 'AuthorId' => 543, 'ISBN' => '067003469X', 'Author' => array('Id' => 543, 'FirstName' => 'Leo', 'LastName' => 'Tolstoi')),
		);
		$heading = <<<EOF
Id,Title,AuthorId,ISBN,Author

EOF;
		$csv = <<<EOF
123,Pride and Prejudice,456,0553213105,"a:3:{s:2:\"Id\";i:456;s:9:\"FirstName\";s:4:\"Jane\";s:8:\"LastName\";s:6:\"Austen\";}"
82,Anna Karenina,543,0143035002,"a:3:{s:2:\"Id\";i:543;s:9:\"FirstName\";s:3:\"Leo\";s:8:\"LastName\";s:7:\"Tolstoi\";}"
567,War and Peace,543,067003469X,"a:3:{s:2:\"Id\";i:543;s:9:\"FirstName\";s:3:\"Leo\";s:8:\"LastName\";s:7:\"Tolstoi\";}"

EOF;
		return array(array($list, $heading, $csv));
	}

	/**
	 * @dataProvider listToCSVDataProvider
	 */
	public function testListToCSV($list, $heading, $csv)
	{
		$parser = new PropelCSVParser();
		$parser->lineTerminator = "
";
		$this->assertEquals($csv, $parser->toCSV($list, true, false));
		$this->assertEquals($heading . $csv, $parser->toCSV($list, true, true));
	}

	/**
	 * @dataProvider listToCSVDataProvider
	 */
	public function testCSVToList($list, $heading, $csv)
	{
		$parser = new PropelCSVParser();
		$parser->lineTerminator = "
";
		$this->assertEquals($list, $parser->fromCSV($heading . $csv, true, true));
	}
}
