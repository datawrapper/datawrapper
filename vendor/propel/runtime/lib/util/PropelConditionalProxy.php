<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Proxy for conditional statements in a fluid interface.
 * This class replaces another class for wrong statements,
 * and silently catches all calls to non-conditional method calls
 *
 * @example
 * <code>
 * $c->_if(true)        // returns $c
 *     ->doStuff()      // executed
 *   ->_else()          // returns a PropelConditionalProxy instance
 *     ->doOtherStuff() // not executed
 *   ->_endif();        // returns $c
 * $c->_if(false)       // returns a PropelConditionalProxy instance
 *     ->doStuff()      // not executed
 *   ->_else()          // returns $c
 *     ->doOtherStuff() // executed
 *   ->_endif();        // returns $c
 * @see Criteria
 *
 * @author     Francois Zaninotto
 * @version    $Revision$
 * @package    propel.runtime.util
 */
class PropelConditionalProxy
{
	protected $criteria;
	protected $parent;
	protected $state;
	protected $wasTrue;
	protected $parentState;

	public function __construct($criteria, $cond, $proxy = null)
	{
		$this->criteria = $criteria;
		$this->wasTrue = false;
		$this->setConditionalState($cond);
		$this->parent = $proxy;

		if (is_null($proxy)) {
			$this->parentState = true;
		} else {
			$this->parentState = $proxy->getConditionalState();
		}
	}

	/**
	 * Returns a new level PropelConditionalProxy instance.
	 * Allows for conditional statements in a fluid interface.
	 *
	 * @param      bool $cond
	 *
	 * @return     PropelConditionalProxy
	 */
	public function _if($cond)
	{
		return $this->criteria->_if($cond);
	}

	/**
	 * Allows for conditional statements in a fluid interface.
	 *
	 * @param      bool $cond ignored
	 *
	 * @return     PropelConditionalProxy
	 */
	public function _elseif($cond)
	{
		return $this->setConditionalState(!$this->wasTrue && $cond);
	}

	/**
	 * Allows for conditional statements in a fluid interface.
	 *
	 * @return     PropelConditionalProxy
	 */
	public function _else()
	{
		return $this->setConditionalState(!$this->state && !$this->wasTrue);
	}

	/**
	 * Returns the parent object
	 * Allows for conditional statements in a fluid interface.
	 *
	 * @return     PropelConditionalProxy|Criteria
	 */
	public function _endif()
	{
		return $this->criteria->_endif();
	}

	/**
	 * return the current conditionnal status
	 *
	 * @return boolean
	 */
	protected function getConditionalState()
	{
		return $this->state && $this->parentState;
	}

	protected function setConditionalState($cond)
	{
		$this->state = (bool) $cond;
		$this->wasTrue = $this->wasTrue || $this->state;
		return $this->getCriteriaOrProxy();
	}

	public function getParentProxy()
	{
		return $this->parent;
	}

	public function getCriteriaOrProxy()
	{
		if ($this->state && $this->parentState) {
			return $this->criteria;
		}

		return $this;
	}

	public function __call($name, $arguments)
	{
		return $this;
	}
}
