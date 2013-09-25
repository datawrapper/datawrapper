<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/reverse/mssql/MssqlSchemaParser.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/PropelTypes.php';

/**
 * Tests for Mssql database schema parser.
 *
 * @author      Pierre Tachoire
 * @version     $Revision$
 * @package     propel.generator.reverse.mssql
 */
class MssqlSchemaParserTest extends PHPUnit_Framework_TestCase
{
  public function testCleanDelimitedIdentifiers()
  {
    $parser = new TestableMssqlSchemaParser(null);

    $expected = 'this is a tablename';

    $tested = $parser->cleanDelimitedIdentifiers('\''.$expected.'\'');
    $this->assertEquals($expected, $tested);

    $tested = $parser->cleanDelimitedIdentifiers('\''.$expected);
    $this->assertEquals('\''.$expected, $tested);

    $tested = $parser->cleanDelimitedIdentifiers($expected.'\'');
    $this->assertEquals($expected.'\'', $tested);

    $expected = 'this is a tabl\'ename';

    $tested = $parser->cleanDelimitedIdentifiers('\''.$expected.'\'');
    $this->assertEquals($expected, $tested);

    $tested = $parser->cleanDelimitedIdentifiers('\''.$expected);
    $this->assertEquals('\''.$expected, $tested);

    $tested = $parser->cleanDelimitedIdentifiers($expected.'\'');
    $this->assertEquals($expected.'\'', $tested);

    $expected = 'this is a\'tabl\'ename';

    $tested = $parser->cleanDelimitedIdentifiers('\''.$expected.'\'');
    $this->assertEquals($expected, $tested);

    $tested = $parser->cleanDelimitedIdentifiers('\''.$expected);
    $this->assertEquals('\''.$expected, $tested);

    $tested = $parser->cleanDelimitedIdentifiers($expected.'\'');
    $this->assertEquals($expected.'\'', $tested);

  }
}

class TestableMssqlSchemaParser extends MssqlSchemaParser
{
  public function cleanDelimitedIdentifiers($identifier)
  {
    return parent::cleanDelimitedIdentifiers($identifier);
  }
}
