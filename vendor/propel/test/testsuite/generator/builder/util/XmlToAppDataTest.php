<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/builder/util/XmlToAppData.php';

/**
 * Tests for XmlToAppData class
 *
 * @version    $Revision$
 * @package    generator.builder.util
 */
class XmlToAppDataTest extends PHPUnit_Framework_TestCase
{

    public function testParseStringEmptySchema()
    {
        $schema = '<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>';
        $xtad = new XmlToAppData();
        $appData = $xtad->parseString($schema);
        $expectedAppData = "<app-data>
</app-data>";
        $this->assertEquals($expectedAppData, $appData->toString());
    }

    public function testParseStringSchemaWithoutXmlDeclaration()
    {
        $schema = '';
        $xtad = new XmlToAppData();
        $appData = $xtad->parseString($schema);
        $expectedAppData = "<app-data>
</app-data>";
        $this->assertEquals($expectedAppData, $appData->toString());
    }

    /**
     * @expectedException SchemaException
     */
    public function testParseStringIncorrectSchema()
    {
        $schema = '<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?><foo/>';
        $xtad = new XmlToAppData();
        $appData = $xtad->parseString($schema);
    }

    public function testParseStringDatabase()
    {
        $schema = '<database name="foo"></database>';
        $xtad = new XmlToAppData();
        $appData = $xtad->parseString($schema);
        $expectedDatabase = '<database name="foo" defaultIdMethod="native" defaultPhpNamingMethod="underscore" defaultTranslateMethod="none"/>';
        $database = $appData->getDatabase();
        $this->assertEquals($expectedDatabase, $database->toString());
        $expectedAppData = "<app-data>\n$expectedDatabase\n</app-data>";
        $this->assertEquals($expectedAppData, $appData->toString());
    }

    public function testParseStringTable()
    {
        $schema = '<database name="foo"><table name="bar"><column name="id" primaryKey="true" type="INTEGER" autoIncrement="true"/></table></database>';
        $xtad = new XmlToAppData();
        $appData = $xtad->parseString($schema);
        $database = $appData->getDatabase();
        $table = $database->getTable('bar');
        $expectedTable = <<<EOF
<table name="bar" phpName="Bar" idMethod="native" skipSql="false" readOnly="false" reloadOnInsert="false" reloadOnUpdate="false" abstract="false">
  <column name="id" phpName="Id" type="INTEGER" primaryKey="true" autoIncrement="true" required="true"/>
</table>
EOF;
        $this->assertEquals($expectedTable, $table->toString());
    }

    public function testParseFile()
    {
        $path = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'testSchema.xml');
        $xtad = new XmlToAppData();
        $appData = $xtad->parseFile($path);
        $expectedAppData = <<<EOF
<app-data>
<database name="foo" defaultIdMethod="native" defaultPhpNamingMethod="underscore" defaultTranslateMethod="none">
  <table name="bar" phpName="Bar" idMethod="native" skipSql="false" readOnly="false" reloadOnInsert="false" reloadOnUpdate="false" abstract="false">
    <column name="id" phpName="Id" type="INTEGER" primaryKey="true" autoIncrement="true" required="true"/>
  </table>
</database>
</app-data>
EOF;
        $this->assertEquals($expectedAppData, $appData->toString());
    }

    public function testParseFileExternalSchema()
    {
        $path = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'outerSchema.xml');
        $xtad = new XmlToAppData();
        $appData = $xtad->parseFile($path);
        $expectedAppData = <<<EOF
<app-data>
<database name="foo" defaultIdMethod="native" defaultPhpNamingMethod="underscore" defaultTranslateMethod="none">
  <table name="bar1" phpName="Bar1" idMethod="native" skipSql="false" readOnly="false" reloadOnInsert="false" reloadOnUpdate="false" abstract="false">
    <column name="id" phpName="Id" type="INTEGER" primaryKey="true" autoIncrement="true" required="true"/>
  </table>
  <table name="bar2" phpName="Bar2" idMethod="native" skipSql="false" readOnly="false" reloadOnInsert="false" reloadOnUpdate="false" forReferenceOnly="true" abstract="false">
    <column name="id" phpName="Id" type="INTEGER" primaryKey="true" autoIncrement="true" required="true"/>
  </table>
</database>
</app-data>
EOF;
        $this->assertEquals($expectedAppData, $appData->toString());
    }

    /**
     * @dataProvider providePathsForIsAbsolutePath
     */
    public function testIsAbsolutePath($path, $expectedResult)
    {
        $xmlToAppData = new OpenedXmlToAppData();
        $result = $xmlToAppData->isAbsolutePath($path);

        $this->assertEquals($expectedResult, $result);
    }

    /**
     * @return array
     */
    public function providePathsForIsAbsolutePath()
    {
        return array(
            array('/var/lib', true),
            array('c:\\\\var\\lib', true),
            array('\\var\\lib', true),
            array('var/lib', false),
            array('../var/lib', false),
            array('', false),
            array(null, false)
        );
    }
}

class OpenedXmlToAppData extends XmlToAppData
{
    public function isAbsolutePath($file)
    {
        return parent::isAbsolutePath($file);
    }
}
