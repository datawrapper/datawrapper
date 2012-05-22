<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license     MIT License
 */

require_once dirname(__FILE__) . '/../Column.php';

/**
 * Value object for storing Column object diffs.
 * Heavily inspired by Doctrine2's Migrations
 * (see http://github.com/doctrine/dbal/tree/master/lib/Doctrine/DBAL/Schema/)
 *
 * @package    propel.generator.model.diff
 */
class PropelColumnDiff
{
	protected $changedProperties = array();
	protected $fromColumn;
	protected $toColumn;

	/**
	 * Setter for the changedProperties property
	 *
	 * @param array $changedProperties
	 */
	public function setChangedProperties($changedProperties)
	{
		$this->changedProperties = $changedProperties;
	}

	/**
	 * Getter for the changedProperties property
	 *
	 * @return array
	 */
	public function getChangedProperties()
	{
		return $this->changedProperties;
	}

	/**
	 * Setter for the fromColumn property
	 *
	 * @param Column $fromColumn
	 */
	public function setFromColumn(Column $fromColumn)
	{
		$this->fromColumn = $fromColumn;
	}

	/**
	 * Getter for the fromColumn property
	 *
	 * @return Column
	 */
	public function getFromColumn()
	{
		return $this->fromColumn;
	}

	/**
	 * Setter for the toColumn property
	 *
	 * @param Column $toColumn
	 */
	public function setToColumn(Column $toColumn)
	{
		$this->toColumn = $toColumn;
	}

	/**
	 * Getter for the toColumn property
	 *
	 * @return Column
	 */
	public function getToColumn()
	{
		return $this->toColumn;
	}

	/**
	 * Get the reverse diff for this diff
	 *
	 * @return PropelColumnDiff
	 */
	public function getReverseDiff()
	{
		$diff = new self();

		// columns
		$diff->setFromColumn($this->getToColumn());
		$diff->setToColumn($this->getFromColumn());

		// properties
		$changedProperties = array();
		foreach ($this->getChangedProperties() as $name => $propertyChange) {
			$changedProperties[$name] = array_reverse($propertyChange);
		}
		$diff->setChangedProperties($changedProperties);

		return $diff;
	}

	public function __toString()
	{
		$ret = '';
		$ret .= sprintf("      %s:\n", $this->getFromColumn()->getFullyQualifiedName());
		$ret .= "        modifiedProperties:\n";
		foreach ($this->getChangedProperties() as $key => $value) {
			$ret .= sprintf("          %s: %s\n", $key, json_encode($value));
		}

		return $ret;
	}

}
