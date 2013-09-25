<?php

/*
 *	$Id: ConcreteInheritanceBehaviorTest.php 1458 2010-01-13 16:09:51Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/schemas/SchemasTestBase.php';

/**
 * Tests for ConcreteInheritanceBehavior class
 *
 * @author    François Zaniontto
 * @version   $Revision$
 * @package   generator.behavior.concrete_inheritance
 */
class ConcreteInheritanceBehaviorWithSchemaTest extends SchemasTestBase
{
    public function testParentBehaviorWithSchemas()
    {
        $behaviors = BookstoreSchemasBookPeer::getTableMap()->getBehaviors();
        $this->assertTrue(array_key_exists('concrete_inheritance_parent', $behaviors), 'modifyTable() gives the parent table the concrete_inheritance_parent behavior');
        $this->assertEquals('descendant_class', $behaviors['concrete_inheritance_parent']['descendant_column'], 'modifyTable() passed the descendent_column parameter to the parent behavior');
    }

    public function testGetParentOrCreateNewWithSchemas()
    {
        $second_hand_book = new SecondHandBooksSecondHandBook();
        $book = $second_hand_book->getParentOrCreate();
        $this->assertTrue($book instanceof BookStoreSchemasBook, 'getParentOrCreate() returns an instance of the parent class');
        $this->assertTrue($book->isNew(), 'getParentOrCreate() returns a new instance of the parent class if the object is new');
        $this->assertEquals('SecondHandBooksSecondHandBook', $book->getDescendantClass(), 'getParentOrCreate() correctly sets the descendant_class of the parent object');
    }

}
