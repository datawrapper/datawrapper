<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests the generated objects for temporal column types accessor & mutator.
 * This requires that the model was built with propel.useDateTimeClass=true
 *
 * @author     Francois Zaninotto
 * @package    generator.builder.om
 */
class GeneratedObjectDateTimeColumnTypeTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        if (!class_exists('DateTimeColumnTypeEntity')) {
            $schema = <<<EOF
<database name="generated_object_datetime_type_test">
    <table name="date_time_column_type_entity" idMethod="native">
        <column name="id" primaryKey="true" type="INTEGER" phpName="Id" required="true"/>
        <column name="primary_date" primaryKey="true" type="DATE" phpName="PrimaryDate" required="true"/>
    </table>
</database>
EOF;
            $builder = new PropelQuickBuilder;
            $builder->getConfig()->setBuildProperty('defaultDateFormat',  null);

            $builder->setSchema($schema);

            $builder->build();
        }
    }

    public function testAddInstanceToPoolWithDateTime()
    {
        DateTimeColumnTypeEntityPeer::clearInstancePool();
        $obj = new DateTimeColumnTypeEntity();
        $obj->setId(1);
        $obj->setPrimaryDate(new \DateTime());
        DateTimeColumnTypeEntityPeer::addInstanceToPool($obj);
    }
}
