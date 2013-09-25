<?php

/*
 * $Id: ConcreteInheritanceBehaviorNamespacedTest.php 1458 2010-01-13 16:09:51Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/namespaces/NamespacesTestBase.php';

/**
 * Tests for ConcreteInheritanceBehaviorNamespacedTest class
 *
 * @author    François Zaniontto
 * @version   $Revision$
 * @package   generator.behavior.concrete_inheritance
 */
class ConcreteInheritanceBehaviorNamespacedTest extends NamespacesTestBase
{
    public function testgetParentOrCreateWithPrimaryKeyIsNull()
    {
        $concreteArticle = new \Foo\Bar\NamespacedConcreteArticle();
        $concreteArticle->setTitle('Foo');
        $concreteArticle->setBody('Bar');
        $parent = $concreteArticle->getParentOrCreate();
        $this->assertEquals('Foo\Bar\NamespacedConcreteArticle', $parent->getDescendantClass(), 'getDescendantClass() will return Foo\Bar\NamespacedConcreteArticle');
    }

    public function testgetParentOrCreateWithPrimaryKeyNotNull()
    {
        $concreteArticle = new \Foo\Bar\NamespacedConcreteArticle();
        $concreteArticle->setPrimaryKey(1);
        $concreteArticle->setTitle('Foo');
        $concreteArticle->setBody('Bar');
        $parent = $concreteArticle->getParentOrCreate();
        $this->assertEquals('Foo\Bar\NamespacedConcreteArticle', $parent->getDescendantClass(), 'getDescendantClass() will return Foo\Bar\NamespacedConcreteArticle');
    }
}
