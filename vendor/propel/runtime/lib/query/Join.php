<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Data object to describe a join between two tables, for example
 * <pre>
 * table_a LEFT JOIN table_b ON table_a.id = table_b.a_id
 * </pre>
 *
 * @author     Francois Zaninotto (Propel)
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Kaspars Jaudzems <kaspars.jaudzems@inbox.lv> (Propel)
 * @author     Frank Y. Kim <frank.kim@clearink.com> (Torque)
 * @author     John D. McNally <jmcnally@collab.net> (Torque)
 * @author     Brett McLaughlin <bmclaugh@algx.net> (Torque)
 * @author     Eric Dobbs <eric@dobbse.net> (Torque)
 * @author     Henning P. Schmiedehausen <hps@intermeta.de> (Torque)
 * @author     Sam Joseph <sam@neurogrid.com> (Torque)
 * @package    propel.runtime.query
 */
class Join
{
  // default comparison type
	const EQUAL = "=";
	const INNER_JOIN = 'INNER JOIN';

	// the left parts of the join condition
	protected $left = array();

	// the right parts of the join condition
	protected $right = array();

	// the comparison operators for each pair of columns in the join condition
	protected $operator = array();

	// the type of the join (LEFT JOIN, ...)
	protected $joinType;

	// the number of conditions in the join
	protected $count = 0;

	// the database adapter
	protected $db;

	protected $leftTableName;
	protected $rightTableName;
	protected $leftTableAlias;
	protected $rightTableAlias;

	protected $joinCondition;

	/**
	 * Constructor
	 * Use it preferably with no arguments, and then use addCondition() and setJoinType()
	 * Syntax with arguments used mainly for backwards compatibility
	 *
	 * @param string $leftColumn  The left column of the join condition
	 *                            (may contain an alias name)
	 * @param string $rightColumn The right column of the join condition
	 *                            (may contain an alias name)
	 * @param string $joinType    The type of the join. Valid join types are null (implicit join),
	 *                            Criteria::LEFT_JOIN, Criteria::RIGHT_JOIN, and Criteria::INNER_JOIN
	 */
	public function __construct($leftColumn = null, $rightColumn = null, $joinType = null)
	{
		if (null !== $leftColumn) {
			if (is_array($leftColumn)) {
				// join with multiple conditions
				$this->addConditions($leftColumn, $rightColumn);
			} else {
				// simple join
				$this->addCondition($leftColumn, $rightColumn);
			}
		}
		if (null !== $joinType) {
			$this->setJoinType($joinType);
		}
	}

	/**
	 * Join condition definition.
	 * Warning: doesn't support table aliases. Use the explicit methods to use aliases.
	 *
	 * @param string $left     The left column of the join condition
	 *                         (may contain an alias name)
	 * @param string $right    The right column of the join condition
	 *                         (may contain an alias name)
	 * @param string $operator The comparison operator of the join condition, default Join::EQUAL
	 */
	public function addCondition($left, $right, $operator = self::EQUAL)
	{
		if ($pos = strrpos($left, '.')) {
			list($this->leftTableName,  $this->left[]) = explode('.', $left);
		} else {
			$this->left[] = $left;
		}
		if ($pos = strrpos($right, '.')) {
			list($this->rightTableName, $this->right[]) = explode('.', $right);
		} else {
			$this->right[] = $right;
		}
		$this->operator[] = $operator;
		$this->count++;
	}

	/**
	 * Join condition definition, for several conditions
	 *
	 * @param array $lefts     The left columns of the join condition
	 * @param array $rights    The right columns of the join condition
	 * @param array $operators The comparison operators of the join condition, default Join::EQUAL
	 */
	public function addConditions($lefts, $rights, $operators = array())
	{
		if (count($lefts) != count($rights) ) {
			throw new PropelException("Unable to create join because the left column count isn't equal to the right column count");
		}
		foreach ($lefts as $key => $left) {
			$this->addCondition($left, $rights[$key], isset($operators[$key]) ? $operators[$key] : self::EQUAL);
		}
	}

	/**
	 * Join condition definition.
	 * @example
	 * <code>
	 * $join = new Join();
	 * $join->setJoinType(Criteria::LEFT_JOIN);
	 * $join->addExplicitCondition('book', 'AUTHOR_ID', null, 'author', 'ID', 'a', Join::EQUAL);
	 * echo $join->getClause();
	 * // LEFT JOIN author a ON (book.AUTHOR_ID=a.ID)
	 * </code>
	 *
	 * @param string $leftTableName
	 * @param string $leftColumnName
	 * @param string $leftTableAlias
	 * @param string $rightTableName
	 * @param string $rightColumnName
	 * @param string $rightTableAlias
	 * @param string $operator The comparison operator of the join condition, default Join::EQUAL
	 */
	public function addExplicitCondition($leftTableName, $leftColumnName, $leftTableAlias = null, $rightTableName, $rightColumnName, $rightTableAlias = null, $operator = self::EQUAL)
	{
		$this->leftTableName   = $leftTableName;
		$this->leftTableAlias  = $leftTableAlias;
		$this->rightTableName  = $rightTableName;
		$this->rightTableAlias = $rightTableAlias;
		$this->left     []= $leftColumnName;
		$this->right    []= $rightColumnName;
		$this->operator []= $operator;
		$this->count++;
	}

	/**
	 * Retrieve the number of conditions in the join
	 *
	 * @return integer The number of conditions in the join
	 */
	public function countConditions()
	{
	  return $this->count;
	}

	/**
	 * Return an array of the join conditions
	 *
	 * @return array An array of arrays representing (left, comparison, right) for each condition
	 */
	public function getConditions()
	{
	  $conditions = array();
	  for ($i=0; $i < $this->count; $i++) {
	    $conditions[] = array(
	      'left'     => $this->getLeftColumn($i),
	      'operator' => $this->getOperator($i),
	      'right'    => $this->getRightColumn($i)
	    );
	  }
	  return $conditions;
	}

  /**
   * @param     string $operator the comparison operator for the join condition
   */
  public function addOperator($operator = null)
  {
    $this->operator []= $operator;
  }

  /**
   * @return     the comparison operator for the join condition
   */
  public function getOperator($index = 0)
  {
    return $this->operator[$index];
  }

	public function getOperators()
	{
	  return $this->operator;
	}

	/**
	 * Set the join type
	 *
	 * @param string  $joinType The type of the join. Valid join types are
	 *        null (adding the join condition to the where clause),
	 *        Criteria::LEFT_JOIN(), Criteria::RIGHT_JOIN(), and Criteria::INNER_JOIN()
	 */
	public function setJoinType($joinType = null)
	{
	  $this->joinType = $joinType;
	}

	/**
	 * Get the join type
	 *
	 * @return string The type of the join, i.e. Criteria::LEFT_JOIN(), ...,
	 *         or null for adding the join condition to the where Clause
	 */
	public function getJoinType()
	{
		return null === $this->joinType ? self::INNER_JOIN : $this->joinType;
	}

	/**
	 * Add a left column name to the join condition
	 *
	 * @example
	 * <code>
	 * $join->setLeftTableName('book');
	 * $join->addLeftColumnName('AUTHOR_ID');
	 * </code>
	 * @param      string $left The name of the left column to add
	 */
	public function addLeftColumnName($left)
	{
		$this->left []= $left;
	}

	/**
	 * Get the fully qualified name of the left column of the join condition
	 *
	 * @example
	 * <code>
	 * $join->addCondition('book.AUTHOR_ID', 'author.ID');
	 * echo $join->getLeftColumn(); // 'book.AUTHOR_ID'
	 * </code>
	 * @param      integer $index The number of the condition to use
	 * @return     string
	 */
	public function getLeftColumn($index = 0)
	{
		$tableName = $this->getLeftTableAliasOrName();

		return $tableName ? $tableName . '.' . $this->left[$index] : $this->left[$index];
	}

	/**
	 * Get the left column name of the join condition
	 *
	 * @example
	 * <code>
	 * $join->addCondition('book.AUTHOR_ID', 'author.ID');
	 * echo $join->getLeftColumnName(); // 'AUTHOR_ID'
	 * </code>
	 * @param      integer $index The number of the condition to use
	 * @return     string
	 */
	public function getLeftColumnName($index = 0)
	{
		return $this->left[$index];
	}

	/**
	 * Get the list of all the names of left columns of the join condition
	 * @return     array
	 */
	public function getLeftColumns()
	{
		$columns = array();
		foreach ($this->left as $index => $column) {
			$columns []= $this->getLeftColumn($index);
		}
		return $columns;
	}

	public function setLeftTableName($leftTableName)
	{
		$this->leftTableName = $leftTableName;

		return $this;
	}

	public function getLeftTableName()
	{
		return $this->leftTableName;
	}

	public function setLeftTableAlias($leftTableAlias)
	{
		$this->leftTableAlias = $leftTableAlias;

		return $this;
	}

	public function getLeftTableAlias()
	{
		return $this->leftTableAlias;
	}

	public function hasLeftTableAlias()
	{
		return null !== $this->leftTableAlias;
	}

	public function getLeftTableAliasOrName()
	{
		return $this->leftTableAlias ? $this->leftTableAlias : $this->leftTableName;
	}

	public function getLeftTableWithAlias()
	{
		return $this->leftTableAlias ? $this->leftTableName . ' ' . $this->leftTableAlias : $this->leftTableName;
	}

	/**
	 * Add a right column name to the join condition
	 *
	 * @example
	 * <code>
	 * $join->setRightTableName('author');
	 * $join->addRightColumnName('ID');
	 * </code>
	 * @param      string $right The name of the right column to add
	 */
	public function addRightColumnName($right)
	{
		$this->right []= $right;
	}

	/**
	 * Get the fully qualified name of the right column of the join condition
	 *
	 * @example
	 * <code>
	 * $join->addCondition('book.AUTHOR_ID', 'author.ID');
	 * echo $join->getLeftColumn(); // 'author.ID'
	 * </code>
	 * @param      integer $index The number of the condition to use
	 * @return     string
	 */
	public function getRightColumn($index = 0)
	{
		$tableName = $this->getRightTableAliasOrName();

		return $tableName ? $tableName . '.' . $this->right[$index] : $this->right[$index];
	}

	/**
	 * Get the right column name of the join condition
	 *
	 * @example
	 * <code>
	 * $join->addCondition('book.AUTHOR_ID', 'author.ID');
	 * echo $join->getLeftColumn(); // 'ID'
	 * </code>
	 * @param      integer $index The number of the condition to use
	 * @return     string
	 */
	public function getRightColumnName($index = 0)
	{
		return $this->right[$index];
	}

	/**
	 * @return     all right columns of the join condition
	 */
	public function getRightColumns()
	{
		$columns = array();
		foreach ($this->right as $index => $column) {
			$columns []= $this->getRightColumn($index);
		}
		return $columns;
	}

	public function setRightTableName($rightTableName)
	{
		$this->rightTableName = $rightTableName;

		return $this;
	}

	public function getRightTableName()
	{
		return $this->rightTableName;
	}

	public function setRightTableAlias($rightTableAlias)
	{
		$this->rightTableAlias = $rightTableAlias;

		return $this;
	}

	public function getRightTableAlias()
	{
		return $this->rightTableAlias;
	}

	public function hasRightTableAlias()
	{
		return null !== $this->rightTableAlias;
	}

	public function getRightTableAliasOrName()
	{
		return $this->rightTableAlias ? $this->rightTableAlias : $this->rightTableName;
	}

	public function getRightTableWithAlias()
	{
		return $this->rightTableAlias ? $this->rightTableName . ' ' . $this->rightTableAlias : $this->rightTableName;
	}

	/**
	 * Get the value of db.
	 * The DBAdapter which might be used to get db specific
	 * variations of sql.
	 * @return     DBAdapter value of db.
	 */
	public function getDB()
	{
		return $this->db;
	}

	/**
	 * Set the value of db.
	 * The DBAdapter might be used to get db specific variations of sql.
	 * @param      DBAdapter $db Value to assign to db.
	 * @return     void
	 */
	public function setDB(DBAdapter $db)
	{
		$this->db = $db;
	}

	/**
	 * Set a custom join condition
	 *
	 * @param Criterion $joinCondition a Join condition
	 */
	public function setJoinCondition(Criterion $joinCondition)
	{
		$this->joinCondition = $joinCondition;
	}

	/**
	 * Get the custom join condition, if previously set
	 *
	 * @return Criterion
	 */
	public function getJoinCondition()
	{
		return $this->joinCondition;
	}

	/**
	 * Set the custom join condition Criterion based on the conditions of this join
	 *
	 * @param Criteria $c A Criteria object to get Criterions from
	 */
	public function buildJoinCondition(Criteria $c)
	{
		$joinCondition = null;
		for ($i=0; $i < $this->count; $i++) {
			$criterion = $c->getNewCriterion($this->getLeftColumn($i), $this->getLeftColumn($i) . $this->getOperator($i) . $this->getRightColumn($i), Criteria::CUSTOM);
			if (null === $joinCondition) {
				$joinCondition = $criterion;
			} else {
				$joinCondition = $joinCondition->addAnd($criterion);
			}
		}
		$this->joinCondition = $joinCondition;
	}

	/**
	 * Get the join clause for this Join.
	 * If the join condition needs binding, uses the passed params array.
	 * @example
	 * <code>
	 * $join = new Join();
	 * $join->addExplicitCondition('book', 'AUTHOR_ID', null, 'author', 'ID');
	 * $params = array();
	 * echo $j->getClause($params);
	 * // 'LEFT JOIN author ON (book.AUTHOR_ID=author.ID)'
	 * </code>
	 *
	 * @param array &$params
	 *
	 * @return string SQL join clause with join condition
	 */
	public function getClause(&$params)
	{
		if (null === $this->joinCondition) {
			$conditions = array();
			for ($i=0; $i < $this->count; $i++) {
				$conditions []= $this->getLeftColumn($i) . $this->getOperator($i) . $this->getRightColumn($i);
			}
			$joinCondition = sprintf('(%s)', implode($conditions, ' AND '));
		} else {
			$joinCondition = '';
			$this->getJoinCondition()->appendPsTo($joinCondition, $params);
		}

		$rightTableName = $this->getRightTableWithAlias();

		if (null !== $this->db && $this->db->useQuoteIdentifier()) {
			$rightTableName = $this->db->quoteIdentifierTable($rightTableName);
		}

		return sprintf('%s %s ON %s',
			$this->getJoinType(),
			$rightTableName,
			$joinCondition
		);
	}

	public function equals($join)
	{
		return $join !== null
				&& $join instanceof Join
				&& $this->joinType == $join->getJoinType()
				&& $this->getConditions() == $join->getConditions();
	}

	/**
	 * Returns a String representation of the class,
	 *
	 * @return string     A String representation of the class
	 */
	public function toString()
	{
		$params = array();
		return $this->getClause($params);
	}

	public function __toString()
	{
		return $this->toString();
	}
}
