<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../runtime/lib/parser/PropelParser.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/parser/PropelXMLParser.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/exception/PropelException.php';

/**
 * Test for PropelJSONParser class
 *
 * @author     Francois Zaninotto
 * @package    runtime.parser
 */
class PropelParserTest extends PHPUnit_Framework_TestCase
{
    public function testGetParser()
    {
        $parser = PropelParser::getParser('XML');
        $this->assertTrue($parser instanceof PropelXMLParser);
    }

    /**
     * @expectedException PropelException
     */
    public function testGetParserThrowsExceptionOnWrongParser()
    {
        $parser = PropelParser::getParser('Foo');
    }

    public function testLoad()
    {
        $fixtureFile = dirname(__FILE__) . '/fixtures/test_data.xml';
        $parser = PropelParser::getParser('XML');
        $content = $parser->load($fixtureFile);
        $eol = PHP_EOL;
        $expectedContent = <<<EOF
<?xml version="1.0" encoding="UTF-8"?>{$eol}<foo>
  <bar prop="0"/>
  <bar prop="1"/>
</foo>

EOF;
        $this->assertEquals($expectedContent, $content, 'PropelParser::load() executes PHP code in files');
    }

    public function testDump()
    {
        $testContent = "Foo Content";
        $testFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'propel_test_' . microtime();
        $parser = PropelParser::getParser('XML');
        $parser->dump($testContent, $testFile);
        $content = file_get_contents($testFile);
        $this->assertEquals($testContent, $content);
        unlink($testFile);
    }

}
