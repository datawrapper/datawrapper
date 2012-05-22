<?php

/*
 *	$Id: VersionableBehaviorTest.php 1460 2010-01-17 22:36:48Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/util/PropelQuickBuilder.php';
require_once dirname(__FILE__) . '/../../../../../generator/lib/behavior/i18n/I18nBehavior.php';
require_once dirname(__FILE__) . '/../../../../../runtime/lib/Propel.php';

/**
 * Tests for I18nBehavior class peer modifier
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    generator.behavior.i18n
 */
class I18nBehaviorPeerBuilderModifierTest extends PHPUnit_Framework_TestCase
{
	public function testDefaultLocaleConstant()
	{
		$schema = <<<EOF
<database name="i18n_behavior_test_0">
	<table name="i18n_behavior_test_01">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<behavior name="i18n" />
	</table>
	<table name="i18n_behavior_test_02">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<behavior name="i18n">
			<parameter name="default_locale" value="fr_FR" />
		</behavior>
	</table>
</database>
EOF;
		PropelQuickBuilder::buildSchema($schema);
		$this->assertEquals('en_EN', I18nBehaviorTest01Peer::DEFAULT_LOCALE);
		$this->assertEquals('fr_FR', I18nBehaviorTest02Peer::DEFAULT_LOCALE);
	}

	public function testFieldKeys()
	{
		$schema = <<<EOF
<database name="i18n_behavior_test_0">
	<table name="i18n_behavior_test_03">
		<column name="id" primaryKey="true" type="INTEGER" autoIncrement="true" />
		<column name="foo1" type="VARCHAR" />
		<column name="foo2" type="VARCHAR" />
		<column name="foo3" type="VARCHAR" />
		<behavior name="i18n">
			<parameter name="i18n_columns" value="foo2" />
		</behavior>
	</table>
</database>
EOF;
		PropelQuickBuilder::buildSchema($schema);
		$this->assertEquals(array(0, 1, 2), I18nBehaviorTest03Peer::getFieldNames(BasePeer::TYPE_NUM));
	}

}
