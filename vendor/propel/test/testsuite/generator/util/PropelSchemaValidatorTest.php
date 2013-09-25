<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/util/PropelSchemaValidator.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/AppData.php';

/**
 *
 * @package    generator.util
 */
class SchemaValidatorTest extends PHPUnit_Framework_TestCase
{

    private $xsdFile = 'generator/resources/xsd/database.xsd';

    protected function getAppDataForTable($table)
    {
        $database = new Database();
        $database->addTable($table);
        $appData = new AppData();
        $appData->addDatabase($database);

        return $appData;
    }

    public function testValidateReturnsTrueForEmptySchema()
    {
        $schema = new AppData();
        $validator = new PropelSchemaValidator($schema);
        $this->assertTrue($validator->validate());
    }

    public function testValidateReturnsTrueForValidSchema()
    {
        $schema = <<<EOF
<database name="bookstore">
    <table name="book">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $database = $builder->getDatabase();
        $appData = new AppData();
        $appData->addDatabase($database);
        $validator = new PropelSchemaValidator($appData);
        $this->assertTrue($validator->validate());
    }

    public function testDatabasePackageName()
    {

        $schema = <<<EOF
<database name="bookstore" package="my.sub-directory">
    <table name="book">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
    </table>
</database>
EOF;
        $dom = new DomDocument('1.0', 'UTF-8');
        $dom->loadXML($schema);

        $this->assertTrue($dom->schemaValidate($this->xsdFile));
    }

    public function testValidateReturnsFalseWhenTwoTablesHaveSamePhpName()
    {
        $table1 = new Table('foo');
        $table2 = new Table('bar');
        $table2->setPhpName('Foo');
        $database = new Database();
        $database->addTable($table1);
        $database->addTable($table2);
        $appData = new AppData();
        $appData->addDatabase($database);
        $validator = new PropelSchemaValidator($appData);
        $this->assertFalse($validator->validate());
        $this->assertContains('Table "bar" declares a phpName already used in another table', $validator->getErrors());
    }

    public function testValidateReturnsTrueWhenTwoTablesHaveSamePhpNameInDifferentNamespaces()
    {
        $column1 = new Column('id');
        $column1->setPrimaryKey(true);
        $table1 = new Table('foo');
        $table1->addColumn($column1);
        $table1->setNamespace('Foo');

        $column2 = new Column('id');
        $column2->setPrimaryKey(true);
        $table2 = new Table('bar');
        $table2->addColumn($column2);
        $table2->setPhpName('Foo');
        $table2->setNamespace('Bar');

        $database = new Database();
        $database->addTable($table1);
        $database->addTable($table2);
        $appData = new AppData();
        $appData->addDatabase($database);
        $validator = new PropelSchemaValidator($appData);
        $this->assertTrue($validator->validate());
    }

    public function testValidateReturnsFalseWhenTableHasNoPk()
    {
        $appData = $this->getAppDataForTable(new Table('foo'));
        $validator = new PropelSchemaValidator($appData);
        $this->assertFalse($validator->validate());
        $this->assertContains('Table "foo" does not have a primary key defined. Propel requires all tables to have a primary key.', $validator->getErrors());
    }

    public function testValidateReturnsTrueWhenTableHasNoPkButIsAView()
    {
        $table = new Table('foo');
        $table->setSkipSql(true);
        $appData = $this->getAppDataForTable($table);
        $validator = new PropelSchemaValidator($appData);
        $this->assertTrue($validator->validate());
    }

    public function testValidateReturnsFalseWhenTableHasAReservedName()
    {
        $appData = $this->getAppDataForTable(new Table('TABLE_NAME'));
        $validator = new PropelSchemaValidator($appData);
        $this->assertFalse($validator->validate());
        $this->assertContains('Table "TABLE_NAME" uses a reserved keyword as name', $validator->getErrors());
    }

    public function testValidateReturnsFalseWhenCrossRefTableHasTwoFksToTheSameTable()
    {
        $schema = <<<EOF
<database name="bookstore">
    <table name="book">
        <column name="id" required="true" primaryKey="true" autoIncrement="true" type="INTEGER" />
        <column name="title" type="VARCHAR" size="100" primaryString="true" />
    </table>
    <table name="book_book" isCrossRef="true">
        <column name="parent_id" type="INTEGER" primaryKey="true" required="true"/>
        <column name="child_id" type="INTEGER" primaryKey="true" required="true"/>
        <foreign-key foreignTable="book">
            <reference local="child_id" foreign="id"/>
        </foreign-key>
        <foreign-key foreignTable="book">
            <reference local="parent_id" foreign="id"/>
        </foreign-key>
    </table>
</database>
EOF;
        $builder = new PropelQuickBuilder();
        $builder->setSchema($schema);
        $database = $builder->getDatabase();
        $appData = new AppData();
        $appData->addDatabase($database);
        $validator = new PropelSchemaValidator($appData);
        $this->assertFalse($validator->validate());
        $this->assertContains('Table "book_book" implements an equal nest relationship for table "book". This feature is not supported', $validator->getErrors());
    }

    public function testValidateReturnsFalseWhenTwoColumnssHaveSamePhpName()
    {
        $column1 = new Column('foo');
        $column2 = new Column('bar');
        $column2->setPhpName('Foo');
        $table = new Table('foo_table');
        $table->addColumn($column1);
        $table->addColumn($column2);
        $appData = $this->getAppDataForTable($table);
        $validator = new PropelSchemaValidator($appData);
        $this->assertFalse($validator->validate());
        $this->assertContains('Column "bar" declares a phpName already used in table "foo_table"', $validator->getErrors());
    }

}
