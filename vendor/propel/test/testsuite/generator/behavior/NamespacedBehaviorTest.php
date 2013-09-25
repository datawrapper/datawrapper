<?php
require_once __DIR__.'/../../../fixtures/generator/behavior/Foobar.php';

class NamespacedBehaviorTest extends PHPUnit_Framework_TestCase
{
    /**
     * test if issue 425 is resolved
     */
    public function testLoadBehavior()
    {
        $schema = <<< SCHEMA
<database xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="http://xsd.propelorm.org/1.6/database.xsd"
          name="default" defaultIdMethod="native">
    <table name="dummyTable">
        <behavior name="foobar"/>
        <column name="dummyField1" type="char" size="36" required="true" primaryKey="true" />
        <column name="dummyField2" type="integer" required="true" />
    </table>
</database>
SCHEMA;

        $generatorConfig = new \QuickGeneratorConfig();
        $generatorConfig->setBuildProperty('behaviorFoobarClass','Foobar\\Behavior\\Foobar');
        $builder = new \PropelQuickBuilder();
        $builder->setConfig($generatorConfig);
        $builder->setSchema($schema);
        $builder->build();

        $this->assertTrue(class_exists('DummyTable'),'dummy table class is correctly generated');
    }
}
