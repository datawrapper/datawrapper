<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/PlatformTestProvider.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/platform/OraclePlatform.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/Column.php';
require_once dirname(__FILE__) . '/../../../../generator/lib/model/VendorInfo.php';

/**
 *
 * @package    generator.platform
 */
class OraclePlatformTest extends PlatformTestProvider
{
    /**
     * Get the Platform object for this class
     *
     * @return Platform
     */
    protected function getPlatform()
    {
        return new OraclePlatform();
    }

    public function testGetSequenceNameDefault()
    {
        $table = new Table('foo');
        $table->setIdMethod(IDMethod::NATIVE);
        $expected = 'foo_SEQ';
        $this->assertEquals($expected, $this->getPlatform()->getSequenceName($table));
    }

    public function testGetSequenceNameCustom()
    {
        $table = new Table('foo');
        $table->setIdMethod(IDMethod::NATIVE);
        $idMethodParameter = new IdMethodParameter();
        $idMethodParameter->setValue('foo_sequence');
        $table->addIdMethodParameter($idMethodParameter);
        $table->setIdMethod(IDMethod::NATIVE);
        $expected = 'foo_sequence';
        $this->assertEquals($expected, $this->getPlatform()->getSequenceName($table));
    }

    /**
     * @dataProvider providerForTestGetAddTablesDDL
     */
    public function testGetAddTablesDDL($schema)
    {
        $database = $this->getDatabaseFromSchema($schema);
        $expected = <<<EOF

ALTER SESSION SET NLS_DATE_FORMAT='YYYY-MM-DD';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT='YYYY-MM-DD HH24:MI:SS';

-----------------------------------------------------------------------
-- book
-----------------------------------------------------------------------

DROP TABLE book CASCADE CONSTRAINTS;

DROP SEQUENCE book_SEQ;

CREATE TABLE book
(
    id NUMBER NOT NULL,
    title NVARCHAR2(255) NOT NULL,
    author_id NUMBER
);

ALTER TABLE book ADD CONSTRAINT book_PK PRIMARY KEY (id);

CREATE SEQUENCE book_SEQ
    INCREMENT BY 1 START WITH 1 NOMAXVALUE NOCYCLE NOCACHE ORDER;

CREATE INDEX book_I_1 ON book (title);

-----------------------------------------------------------------------
-- author
-----------------------------------------------------------------------

DROP TABLE author CASCADE CONSTRAINTS;

DROP SEQUENCE author_SEQ;

CREATE TABLE author
(
    id NUMBER NOT NULL,
    first_name NVARCHAR2(100),
    last_name NVARCHAR2(100)
);

ALTER TABLE author ADD CONSTRAINT author_PK PRIMARY KEY (id);

CREATE SEQUENCE author_SEQ
    INCREMENT BY 1 START WITH 1 NOMAXVALUE NOCYCLE NOCACHE ORDER;

-----------------------------------------------------------------------
-- Foreign Keys
-----------------------------------------------------------------------

ALTER TABLE book ADD CONSTRAINT book_FK_1
    FOREIGN KEY (author_id) REFERENCES author (id);

EOF;
        $this->assertEquals($expected, $this->getPlatform()->getAddTablesDDL($database));
    }

    /**
     * @dataProvider providerForTestGetAddTablesSkipSQLDDL
     */
    public function testGetAddTablesSkipSQLDDL($schema)
    {
        $database = $this->getDatabaseFromSchema($schema);
        $expected = "
ALTER SESSION SET NLS_DATE_FORMAT='YYYY-MM-DD';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT='YYYY-MM-DD HH24:MI:SS';
";
        $this->assertEquals($expected, $this->getPlatform()->getAddTablesDDL($database));
    }

    /**
     * @dataProvider providerForTestGetAddTableDDLSimplePK
     */
    public function testGetAddTableDDLSimplePK($schema)
    {
        $table = $this->getTableFromSchema($schema);
        $expected = "
-- This is foo table
CREATE TABLE foo
(
    id NUMBER NOT NULL,
    bar NVARCHAR2(255) NOT NULL
);

ALTER TABLE foo ADD CONSTRAINT foo_PK PRIMARY KEY (id);

CREATE SEQUENCE foo_SEQ
    INCREMENT BY 1 START WITH 1 NOMAXVALUE NOCYCLE NOCACHE ORDER;
";
        $this->assertEquals($expected, $this->getPlatform()->getAddTableDDL($table));
    }

    /**
     * @dataProvider providerForTestGetAddTableDDLCompositePK
     */
    public function testGetAddTableDDLCompositePK($schema)
    {
        $table = $this->getTableFromSchema($schema);
        $expected = "
CREATE TABLE foo
(
    foo NUMBER NOT NULL,
    bar NUMBER NOT NULL,
    baz NVARCHAR2(255) NOT NULL
);

ALTER TABLE foo ADD CONSTRAINT foo_PK PRIMARY KEY (foo,bar);
";
        $this->assertEquals($expected, $this->getPlatform()->getAddTableDDL($table));
    }

    /**
     * @dataProvider providerForTestGetAddTableDDLUniqueIndex
     */
    public function testGetAddTableDDLUniqueIndex($schema)
    {
        $table = $this->getTableFromSchema($schema);
        $expected = "
CREATE TABLE foo
(
    id NUMBER NOT NULL,
    bar NUMBER,
    CONSTRAINT foo_U_1 UNIQUE (bar)
);

ALTER TABLE foo ADD CONSTRAINT foo_PK PRIMARY KEY (id);

CREATE SEQUENCE foo_SEQ
    INCREMENT BY 1 START WITH 1 NOMAXVALUE NOCYCLE NOCACHE ORDER;
";
        $this->assertEquals($expected, $this->getPlatform()->getAddTableDDL($table));
    }

    public function testGetDropTableDDL()
    {
        $table = new Table('foo');
        $expected = "
DROP TABLE foo CASCADE CONSTRAINTS;
";
        $this->assertEquals($expected, $this->getPlatform()->getDropTableDDL($table));
    }

    public function testGetDropTableWithSequenceDDL()
    {
        $table = new Table('foo');
        $idMethodParameter = new IdMethodParameter();
        $idMethodParameter->setValue('foo_sequence');
        $table->addIdMethodParameter($idMethodParameter);
        $table->setIdMethod(IDMethod::NATIVE);
        $expected = "
DROP TABLE foo CASCADE CONSTRAINTS;

DROP SEQUENCE foo_sequence;
";
        $this->assertEquals($expected, $this->getPlatform()->getDropTableDDL($table));
    }

    public function testGetColumnDDLCustomSqlType()
    {
        $column = new Column('foo');
        $column->getDomain()->copy($this->getPlatform()->getDomainForType('DOUBLE'));
        $column->getDomain()->replaceScale(2);
        $column->getDomain()->replaceSize(3);
        $column->setNotNull(true);
        $column->getDomain()->setDefaultValue(new ColumnDefaultValue(123, ColumnDefaultValue::TYPE_VALUE));
        $column->getDomain()->replaceSqlType('DECIMAL(5,6)');
        $expected = 'foo DECIMAL(5,6) DEFAULT 123 NOT NULL';
        $this->assertEquals($expected, $this->getPlatform()->getColumnDDL($column));
    }

    /**
     * @dataProvider providerForTestPrimaryKeyDDL
     */
    public function testGetPrimaryKeyDDLSimpleKey($table)
    {
        $expected ='CONSTRAINT foo_PK PRIMARY KEY (bar)';
        $this->assertEquals($expected, $this->getPlatform()->getPrimaryKeyDDL($table));
    }

    public function testGetPrimaryKeyDDLLongTableName()
    {
        $table = new Table('this_table_has_a_very_long_name');
        $column = new Column('bar');
        $column->setPrimaryKey(true);
        $table->addColumn($column);
        $expected = 'CONSTRAINT this_table_has_a_very_long__PK PRIMARY KEY (bar)';
        $this->assertEquals($expected, $this->getPlatform()->getPrimaryKeyDDL($table));
    }

    public function testGetPrimaryKeyDDLCompositeKey()
    {
        $table = new Table('foo');
        $column1 = new Column('bar1');
        $column1->setPrimaryKey(true);
        $table->addColumn($column1);
        $column2 = new Column('bar2');
        $column2->setPrimaryKey(true);
        $table->addColumn($column2);
        $expected = 'CONSTRAINT foo_PK PRIMARY KEY (bar1,bar2)';
        $this->assertEquals($expected, $this->getPlatform()->getPrimaryKeyDDL($table));
    }

    /**
     * @dataProvider providerForTestPrimaryKeyDDL
     */
    public function testGetDropPrimaryKeyDDL($table)
    {
        $expected = "
ALTER TABLE foo DROP CONSTRAINT foo_PK;
";
        $this->assertEquals($expected, $this->getPlatform()->getDropPrimaryKeyDDL($table));
    }

    /**
     * @dataProvider providerForTestPrimaryKeyDDL
     */
    public function testGetAddPrimaryKeyDDL($table)
    {
        $expected = "
ALTER TABLE foo ADD CONSTRAINT foo_PK PRIMARY KEY (bar);
";
        $this->assertEquals($expected, $this->getPlatform()->getAddPrimaryKeyDDL($table));
    }

    /**
     * @dataProvider providerForTestGetIndicesDDL
     */
    public function testAddIndicesDDL($table)
    {
        $expected = "
CREATE INDEX babar ON foo (bar1,bar2);

CREATE INDEX foo_index ON foo (bar1);
";
        $this->assertEquals($expected, $this->getPLatform()->getAddIndicesDDL($table));
    }

    /**
     * @dataProvider providerForTestGetIndexDDL
     */
    public function testAddIndexDDL($index)
    {
        $expected = "
CREATE INDEX babar ON foo (bar1,bar2);
";
        $this->assertEquals($expected, $this->getPLatform()->getAddIndexDDL($index));
    }

    /**
     * @dataProvider providerForTestGetIndexDDL
     */
    public function testDropIndexDDL($index)
    {
        $expected = "
DROP INDEX babar;
";
        $this->assertEquals($expected, $this->getPLatform()->getDropIndexDDL($index));
    }

    /**
     * @dataProvider providerForTestGetIndexDDL
     */
    public function testGetIndexDDL($index)
    {
        $expected = 'INDEX babar (bar1,bar2)';
        $this->assertEquals($expected, $this->getPLatform()->getIndexDDL($index));
    }

    /**
     * @dataProvider providerForTestGetUniqueDDL
     */
    public function testGetUniqueDDL($index)
    {
        $expected = 'CONSTRAINT babar UNIQUE (bar1,bar2)';
        $this->assertEquals($expected, $this->getPlatform()->getUniqueDDL($index));
    }

    /**
     * @dataProvider providerForTestGetForeignKeysDDL
     */
    public function testGetAddForeignKeysDDL($table)
    {
        $expected = "
ALTER TABLE foo ADD CONSTRAINT foo_bar_FK
    FOREIGN KEY (bar_id) REFERENCES bar (id)
    ON DELETE CASCADE;

ALTER TABLE foo ADD CONSTRAINT foo_baz_FK
    FOREIGN KEY (baz_id) REFERENCES baz (id)
    ON DELETE SET NULL;
";
        $this->assertEquals($expected, $this->getPLatform()->getAddForeignKeysDDL($table));
    }

    /**
     * @dataProvider providerForTestGetForeignKeyDDL
     */
    public function testGetAddForeignKeyDDL($fk)
    {
        $expected = "
ALTER TABLE foo ADD CONSTRAINT foo_bar_FK
    FOREIGN KEY (bar_id) REFERENCES bar (id)
    ON DELETE CASCADE;
";
        $this->assertEquals($expected, $this->getPLatform()->getAddForeignKeyDDL($fk));
    }

    /**
     * @dataProvider providerForTestGetForeignKeySkipSqlDDL
     */
    public function testGetAddForeignKeySkipSqlDDL($fk)
    {
        $expected = '';
        $this->assertEquals($expected, $this->getPLatform()->getAddForeignKeyDDL($fk));
    }

    /**
     * @dataProvider providerForTestGetForeignKeyDDL
     */
    public function testGetDropForeignKeyDDL($fk)
    {
        $expected = "
ALTER TABLE foo DROP CONSTRAINT foo_bar_FK;
";
        $this->assertEquals($expected, $this->getPLatform()->getDropForeignKeyDDL($fk));
    }

    /**
     * @dataProvider providerForTestGetForeignKeySkipSqlDDL
     */
    public function testGetDropForeignKeySkipSqlDDL($fk)
    {
        $expected = '';
        $this->assertEquals($expected, $this->getPLatform()->getDropForeignKeyDDL($fk));
    }

    /**
     * @dataProvider providerForTestGetForeignKeyDDL
     */
    public function testGetForeignKeyDDL($fk)
    {
        $expected = "CONSTRAINT foo_bar_FK
    FOREIGN KEY (bar_id) REFERENCES bar (id)
    ON DELETE CASCADE";
        $this->assertEquals($expected, $this->getPLatform()->getForeignKeyDDL($fk));
    }

    /**
     * @dataProvider providerForTestGetForeignKeySkipSqlDDL
     */
    public function testGetForeignKeySkipSqlDDL($fk)
    {
        $expected = '';
        $this->assertEquals($expected, $this->getPLatform()->getForeignKeyDDL($fk));
    }

    public function testGetCommentBlockDDL()
    {
        $expected = "
-----------------------------------------------------------------------
-- foo bar
-----------------------------------------------------------------------
";
        $this->assertEquals($expected, $this->getPLatform()->getCommentBlockDDL('foo bar'));
    }

    public function testGetOracleBlockStorageDDL()
    {
        $schema = <<<EOF
<database name="test" schema="x">
    <table name="book">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <column name="title" type="VARCHAR" size="255" required="true" />
        <index>
            <index-column name="title" />
            <vendor type="oracle">
                <parameter name="PCTFree" value="20"/>
                <parameter name="InitTrans" value="4"/>
                <parameter name="MinExtents" value="1"/>
                <parameter name="MaxExtents" value="99"/>
                <parameter name="PCTIncrease" value="0"/>
                <parameter name="Tablespace" value="IL_128K"/>
            </vendor>
        </index>
        <column name="author_id" type="INTEGER"/>
        <foreign-key foreignTable="author" foreignSchema="y">
            <reference local="author_id" foreign="id" />
        </foreign-key>
        <vendor type="oracle">
            <parameter name="PCTFree" value="20"/>
            <parameter name="InitTrans" value="4"/>
            <parameter name="MinExtents" value="1"/>
            <parameter name="MaxExtents" value="99"/>
            <parameter name="PCTIncrease" value="0"/>
            <parameter name="Tablespace" value="L_128K"/>
            <parameter name="PKPCTFree" value="20"/>
            <parameter name="PKInitTrans" value="4"/>
            <parameter name="PKMinExtents" value="1"/>
            <parameter name="PKMaxExtents" value="99"/>
            <parameter name="PKPCTIncrease" value="0"/>
            <parameter name="PKTablespace" value="IL_128K"/>
        </vendor>
    </table>
    <table name="author" schema="y">
        <column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
        <column name="first_name" type="VARCHAR" size="100" />
        <column name="last_name" type="VARCHAR" size="100" />
        <vendor type="oracle">
            <parameter name="PCTFree" value="20"/>
            <parameter name="InitTrans" value="4"/>
            <parameter name="MinExtents" value="1"/>
            <parameter name="MaxExtents" value="99"/>
            <parameter name="PCTIncrease" value="0"/>
            <parameter name="Tablespace" value="L_128K"/>
            <parameter name="PKPCTFree" value="20"/>
            <parameter name="PKInitTrans" value="4"/>
            <parameter name="PKMinExtents" value="1"/>
            <parameter name="PKMaxExtents" value="99"/>
            <parameter name="PKPCTIncrease" value="0"/>
            <parameter name="PKTablespace" value="IL_128K"/>
        </vendor>
    </table>
</database>
EOF;
        $database = $this->getDatabaseFromSchema($schema);
        $expected = <<<EOF

ALTER SESSION SET NLS_DATE_FORMAT='YYYY-MM-DD';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT='YYYY-MM-DD HH24:MI:SS';

-----------------------------------------------------------------------
-- book
-----------------------------------------------------------------------

DROP TABLE book CASCADE CONSTRAINTS;

DROP SEQUENCE book_SEQ;

CREATE TABLE book
(
    id NUMBER NOT NULL,
    title NVARCHAR2(255) NOT NULL,
    author_id NUMBER
)
PCTFREE 20
INITRANS 4
STORAGE
(
    MINEXTENTS 1
    MAXEXTENTS 99
    PCTINCREASE 0
)
TABLESPACE L_128K;

ALTER TABLE book ADD CONSTRAINT book_PK PRIMARY KEY (id)
USING INDEX
PCTFREE 20
INITRANS 4
STORAGE
(
    MINEXTENTS 1
    MAXEXTENTS 99
    PCTINCREASE 0
)
TABLESPACE IL_128K;

CREATE SEQUENCE book_SEQ
    INCREMENT BY 1 START WITH 1 NOMAXVALUE NOCYCLE NOCACHE ORDER;

CREATE INDEX book_I_1 ON book (title)
PCTFREE 20
INITRANS 4
STORAGE
(
    MINEXTENTS 1
    MAXEXTENTS 99
    PCTINCREASE 0
)
TABLESPACE IL_128K;

-----------------------------------------------------------------------
-- author
-----------------------------------------------------------------------

DROP TABLE author CASCADE CONSTRAINTS;

DROP SEQUENCE author_SEQ;

CREATE TABLE author
(
    id NUMBER NOT NULL,
    first_name NVARCHAR2(100),
    last_name NVARCHAR2(100)
)
PCTFREE 20
INITRANS 4
STORAGE
(
    MINEXTENTS 1
    MAXEXTENTS 99
    PCTINCREASE 0
)
TABLESPACE L_128K;

ALTER TABLE author ADD CONSTRAINT author_PK PRIMARY KEY (id)
USING INDEX
PCTFREE 20
INITRANS 4
STORAGE
(
    MINEXTENTS 1
    MAXEXTENTS 99
    PCTINCREASE 0
)
TABLESPACE IL_128K;

CREATE SEQUENCE author_SEQ
    INCREMENT BY 1 START WITH 1 NOMAXVALUE NOCYCLE NOCACHE ORDER;

-----------------------------------------------------------------------
-- Foreign Keys
-----------------------------------------------------------------------

ALTER TABLE book ADD CONSTRAINT book_FK_1
    FOREIGN KEY (author_id) REFERENCES author (id);

EOF;
        // ignore tab/space indentation comparison
        $this->assertEquals($expected, str_replace("\t", '    ', $this->getPlatform()->getAddTablesDDL($database)));
    }
}
