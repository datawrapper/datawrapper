<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/builder/om/PHP5ObjectBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/platform/MysqlPlatform.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/Table.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/Column.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/model/ColumnDefaultValue.php';

/**
 * Test class for PHP5ObjectBuilder.
 *
 * @author     François Zaninotto
 * @version    $Id$
 * @package    generator.builder.om
 */
class PHP5ObjectBuilderTest extends PHPUnit_Framework_TestCase
{
    protected $builder;

    public function setUp()
    {
        $builder = new TestablePHP5ObjectBuilder(new Table('Foo'));
        $builder->setPlatform(new MysqlPlatform());
        $this->builder = $builder;
    }

    public static function getDefaultValueStringProvider()
    {
        $col1 = new Column('Bar');
        $col1->setDomain(new Domain('VARCHAR'));
        $col1->setDefaultValue(new ColumnDefaultValue('abc', ColumnDefaultValue::TYPE_VALUE));
        $val1 = "'abc'";
        $col2 = new Column('Bar');
        $col2->setDomain(new Domain('INTEGER'));
        $col2->setDefaultValue(new ColumnDefaultValue(1234, ColumnDefaultValue::TYPE_VALUE));
        $val2 = "1234";
        $col3 = new Column('Bar');
        $col3->setDomain(new Domain('DATE'));
        $col3->setDefaultValue(new ColumnDefaultValue('0000-00-00', ColumnDefaultValue::TYPE_VALUE));
        $val3 = "NULL";

        return array(
            array($col1, $val1),
            array($col2, $val2),
            array($col3, $val3),
        );
    }

    /**
     * @dataProvider getDefaultValueStringProvider
     */
    public function testGetDefaultValueString($column, $value)
    {
        $this->assertEquals($value, $this->builder->getDefaultValueString($column));
    }

    public function testGetDefaultKeyType()
    {
        $this->assertEquals('TYPE_PHPNAME', $this->builder->getDefaultKeyType());
    }
}

class TestablePHP5ObjectBuilder extends PHP5ObjectBuilder
{
    public function getDefaultValueString(Column $col)
    {
        return parent::getDefaultValueString($col);
    }
}
