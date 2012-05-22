<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/BaseTestCase.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/query/Criteria.php';
require_once dirname(__FILE__) . '/../../../../runtime/lib/util/PropelConditionalProxy.php';

/**
 * Test class for Criteria fluid conditions.
 *
 * @author     Francois Zaninotto
 * @version    $Id: CriteriaCombineTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    runtime.query
 */
class CriteriaFluidConditionTest extends BaseTestCase
{
	public function testIf()
	{
		$f = new TestableCriteria();
		$f->
			_if(true)->
				test()->
			_endif();
		$this->assertTrue($f->getTest(), '_if() executes the next method if the test is true');
		$f = new TestableCriteria();
		$f->
		_if(false)->
			foo()->
		_endif();
		$this->assertFalse($f->getTest(), '_if() does not check the existence of the next method if the test is false');
		$f = new TestableCriteria();
		$f->
			_if(true)->
				dummy()->
				test()->
			_endif();
		$this->assertTrue($f->getTest(), '_if() executes the next methods until _endif() if the test is true');
		$f = new TestableCriteria();
		$f->
			_if(false)->
				dummy()->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_if() does not execute the next methods until _endif() if the test is false');
	}

	public function testNestedIf()
	{
		$f = new TestableCriteria();
		$f->
			_if(false)->
        _if(true)->
          test()->
        _endif()->
			_endif();
		$this->assertFalse($f->getTest(), 'nested _if() is not executed if first condition is false');
		$f = new TestableCriteria();
		$f->
			_if(true)->
        _if(true)->
          test()->
        _endif()->
			_endif();
		$this->assertTrue($f->getTest(), 'nested _if() is executed if first condition is true');
		$f = new TestableCriteria();
		$f->
			_if(true)->
        _if(false)->
          test()->
        _endif()->
			_endif();
		$this->assertFalse($f->getTest(), 'nested _if() is not executed if second condition is false');
		$f = new TestableCriteria();
		$f->
			_if(true)->
        _if(false)->
        _else()->
          test()->
        _endif()->
			_endif();
		$this->assertTrue($f->getTest(), 'nested _else() is executed if second condition is false');
		$f = new TestableCriteria();
		$f->
			_if(true)->
        _if(true)->
        _else()->
          test()->
        _endif()->
			_endif();
		$this->assertFalse($f->getTest(), 'nested _else() is not executed if second condition is true');
		$f = new TestableCriteria();
		$f->
			_if(true)->
        _if(false)->
        _endif()->
      _else()->
        test()->
			_endif();
		$this->assertFalse($f->getTest(), 'first level _else() is not executed if first condition is true');
		$f = new TestableCriteria();
		$f->
			_if(false)->
        _if(true)->
        _endif()->
      _else()->
        test()->
			_endif();
		$this->assertTrue($f->getTest(), 'first level _else() is executed if first condition is false');
		$f = new TestableCriteria();
		$f->
			_if(true)->
        _if(true)->
          _if(true)->
            test()->
          _endif()->
        _endif()->
			_endif();
		$this->assertTrue($f->getTest(), '_if() can be nested on 3 levels');
		$f = new TestableCriteria();
		$f->
			_if(true)->
        _if(false)->
          _if(false)->
            test()->
          _endif()->
        _endif()->
			_endif();
		$this->assertFalse($f->getTest(), '_if() can be nested on 3 levels');
	}

	public function testElseIf()
	{
		$f = new TestableCriteria();
		$f->
			_if(true)->
			_elseif(true)->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_elseif() does not execute the next method if the main test is true');
		$f = new TestableCriteria();
		$f->
			_if(true)->
			_elseif(false)->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_elseif() does not execute the next method if the main test is true');
		$f = new TestableCriteria();
		$f->
			_if(true)->
			_elseif(false)->
			_elseif(true)->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_elseif() does not execute the next method if the main test is true');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_elseif(true)->
				test()->
			_endif();
		$this->assertTrue($f->getTest(), '_elseif() executes the next method if the main test is false and the elseif test is true');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_elseif(false)->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_elseif() does not execute the next method if the main test is false and the elseif test is false');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_elseif(true)->
			_elseif(true)->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_elseif() does not executes the next method if the main test is true and the elseif test is true');
	}

	public function testElse()
	{
		$f = new TestableCriteria();
		$f->
			_if(true)->
			_else()->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_else() does not execute the next method if the main test is true');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_else()->
				test()->
			_endif();
		$this->assertTrue($f->getTest(), '_else() executes the next method if the main test is false');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_elseif(true)->
			_else()->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_else() does not execute the next method if the previous test is true');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_elseif(true)->
			_elseif(true)->
			_else()->
				test()->
			_endif();
		$this->assertFalse($f->getTest(), '_else() does not execute the next method if the previous test is true');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_elseif(false)->
			_else()->
				test()->
			_endif();
		$this->assertTrue($f->getTest(), '_else() executes the next method if all the previous tests are false');
	}

	public function testEndif()
	{
		$f = new TestableCriteria();
		$res = $f->
			_if(true)->
				test()->
			_endif();
		$this->assertEquals($res, $f, '_endif() returns the main object if the test is true');
		$f = new TestableCriteria();
		$res = $f->
			_if(false)->
				test()->
			_endif();
		$this->assertEquals($res, $f, '_endif() returns the main object if the test is false');
		$f = new TestableCriteria();
		$f->
			_if(true)->
			_endif()->
			test();
		$this->assertTrue($f->getTest(), '_endif() stops the condition check');
		$f = new TestableCriteria();
		$f->
			_if(false)->
			_endif()->
			test();
		$this->assertTrue($f->getTest(), '_endif() stops the condition check');
	}

  public function testHierarchy()
  {
		$f = new TestableCriteria();
		$f2 = $f->
			_if(true)->
			_else()->
			_endif();
    $this->assertEquals($f2, $f, '_endif returns criteria');
		$f = new TestableCriteria();
		$f2 = $f->
			_if(false)->
			_elseif(false)->
			_elseif(true)->
			_elseif(true)->
			_else()->
			_endif();
    $this->assertEquals($f2, $f, '_endif returns criteria');
		$f = new TestableCriteria();
		$f2 = $f->
			_if(true)->
			_else()->
      _endif()->
			_if(true)->
			_else()->
      _endif()->
			_if(false)->
			_else()->
			_endif();
    $this->assertEquals($f2, $f, '_endif can be chained');
		$f = new TestableCriteria();
		$f2 = $f->
			_if(false)->
			_else()->
			_endif();
    $this->assertEquals($f2, $f, '_endif returns criteria');
		$f = new TestableCriteria();
		$f2 = $f->
			_if(false)->
        _if(false)->
        _endif()->
			_elseif(false)->
        _if(false)->
        _endif()->
			_elseif(true)->
        _if(true)->
          _if(true)->
          _endif()->
        _endif()->
			_elseif(true)->
        _if(false)->
        _endif()->
			_else()->
			_endif();
    $this->assertEquals($f2, $f, '_endif returns criteria when nested');
  }
}

class TestableCriteria extends Criteria
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
