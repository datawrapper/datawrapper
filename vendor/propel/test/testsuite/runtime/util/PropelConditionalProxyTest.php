<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/BaseTestCase.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/util/PropelConditionalProxy.php';

/**
 * Test class for PropelConditionalProxy.
 *
 * @author     Julien Muetton <julien_muetton@carpe-hora.com>
 * @version    $Id: CriteriaCombineTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    propel.runtime.util
 */
class PropelConditionalProxyTest extends BaseTestCase
{
  public function testFluidInterface()
  {
    $criteria = new ProxyTestCriteria();
    $p = new TestPropelConditionalProxy($criteria, false);

    $this->assertEquals($p->_elseif(false), $p, '_elseif returns fluid interface');

    $this->assertEquals($p->_elseif(true), $criteria, '_elseif returns fluid interface');

    $this->assertEquals($p->_elseif(false), $p, '_elseif returns fluid interface');

    $this->assertEquals($p->_else(), $p, '_else returns fluid interface');


    $criteria = new ProxyTestCriteria();

    $p = new TestPropelConditionalProxy($criteria, true);

    $this->assertEquals($p->_elseif(true), $p, '_elseif returns fluid interface');

    $this->assertEquals($p->_elseif(false), $p, '_elseif returns fluid interface');

    $this->assertEquals($p->_else(), $p, '_else returns fluid interface');

    $criteria = new ProxyTestCriteria();
    $p = new TestPropelConditionalProxy($criteria, false);

    $this->assertEquals($p->_elseif(false), $p, '_elseif returns fluid interface');

    $this->assertEquals($p->_else(), $criteria, '_else returns fluid interface');

  }

  public function testHierarchy()
  {
    $criteria = new ProxyTestCriteria();
    $p = new TestPropelConditionalProxy($criteria, true);

    $this->assertEquals($p->getCriteria(), $criteria, 'main object is the given one');

    $this->assertInstanceOf('PropelConditionalProxy', $p2 = $p->_if(true), '_if returns fluid interface');

    $this->assertEquals($p2->getCriteria(), $criteria, 'main object is the given one, even with nested proxies');

    $this->assertEquals($p2->getParentProxy(), $p, 'nested proxy is respected');

    $p = new PropelConditionalProxy($criteria, true);

    $this->assertEquals($criteria, $p->_if(true), '_if returns fluid interface');
  }
}

class TestPropelConditionalProxy extends PropelConditionalProxy
{
  function _if($cond)
  {
    return new TestPropelConditionalProxy($this->criteria, $cond, $this);
  }

  public function getParentProxy()
  {
    return $this->parent;
  }

  public function getCriteria()
  {
    return $this->criteria;
  }
}

class ProxyTestCriteria extends Criteria
{
	protected $test = false;

	public function test()
	{
		$this->test = true;

		return $this;
	}

	public function dummy()
	{
		return $this;
	}

	public function getTest()
	{
		return $this->test;
	}
}
