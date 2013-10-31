<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/archivable/ArchivableBehavior.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/concrete_inheritance/ConcreteInheritanceBehavior.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests for the combination of ArchivableBehavior and ConcreteInheritanceBehavior classes
 */
class ArchivableAndConcreteInheritanceBehaviorTest extends PHPUnit_Framework_TestCase
{
    protected static $generatedSQL;

    public function setUp()
    {
        if (!class_exists('ArchivableConcretePagePeer')) {
            $schema = <<<EOF
<database name="archivable_concrete_behavior_test_0">

  <table name="parent_archivable_concrete_page">
    <column name="id" type="integer" primaryKey="true" autoIncrement="true"/>
    <column name="content" type="longvarchar" required="true" />
    <behavior name="archivable" />
  </table>

  <table name="archivable_concrete_page">
    <column name="paragraph" type="integer" required="true" />
    <behavior name="concrete_inheritance">
      <parameter name="extends" value="parent_archivable_concrete_page" />
    </behavior>
    <behavior name="archivable" />
  </table>
</database>
EOF;
            PropelQuickBuilder::buildSchema($schema);
        }

        ArchivableConcretePagePeer::doDeleteAll();
        ArchivableConcretePageArchivePeer::doDeleteAll();
    }

    public function testPopulateFromArchive()
    {
        $page = new ArchivableConcretePage();
        $page->fromArray(array(
            'Content'   => 'Test content',
            'Paragraph' => 'Test',
        ));
        $page->save();
        $page->archive();

        $archived_page = ArchivableConcretePageArchivePeer::doSelectOne(new Criteria());
        $new_page      = new ArchivableConcretePage();
        $new_page->populateFromArchive($archived_page);
    }
}
