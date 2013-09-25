<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * This class extends the Criteria by adding runtime introspection abilities
 * in order to ease the building of queries.
 *
 * A ModelCriteria requires additional information to be initialized.
 * Using a model name and tablemaps, a ModelCriteria can do more powerful things than a simple Criteria
 *
 * magic methods:
 *
 * @method     ModelCriteria leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method     ModelCriteria rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method     ModelCriteria innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    propel.runtime.query
 */
class ModelCriteria extends Criteria
{
    const MODEL_CLAUSE = "MODEL CLAUSE";
    const MODEL_CLAUSE_ARRAY = "MODEL CLAUSE ARRAY";
    const MODEL_CLAUSE_LIKE = "MODEL CLAUSE LIKE";
    const MODEL_CLAUSE_SEVERAL = "MODEL CLAUSE SEVERAL";
    const MODEL_CLAUSE_RAW = "MODEL CLAUSE RAW";

    const FORMAT_STATEMENT = 'PropelStatementFormatter';
    const FORMAT_ARRAY = 'PropelArrayFormatter';
    const FORMAT_OBJECT = 'PropelObjectFormatter';
    const FORMAT_ON_DEMAND = 'PropelOnDemandFormatter';

    protected $modelName;
    protected $modelPeerName;
    protected $modelAlias;
    protected $useAliasInSQL = false;
    protected $tableMap;
    protected $primaryCriteria;
    protected $formatter;
    protected $defaultFormatterClass = ModelCriteria::FORMAT_OBJECT;
    protected $with = array();
    protected $isWithOneToMany = false;
    protected $previousJoin = null; // this is introduced to prevent useQuery->join from going wrong
    protected $isKeepQuery = true; // whether to clone the current object before termination methods
    protected $select = null;  // this is for the select method

    /**
     * Creates a new instance with the default capacity which corresponds to
     * the specified database.
     *
     * @param string $dbName     The dabase name
     * @param string $modelName  The phpName of a model, e.g. 'Book'
     * @param string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = null, $modelName, $modelAlias = null)
    {
        $this->setDbName($dbName);
        $this->originalDbName = $dbName;
        $this->modelName = $modelName;
        $this->modelPeerName = constant($this->modelName . '::PEER');
        $this->modelAlias = $modelAlias;
        $this->tableMap = Propel::getDatabaseMap($this->getDbName())->getTableByPhpName($this->modelName);
    }

    /**
     * Returns the name of the class for this model criteria
     *
     * @return string
     */
    public function getModelName()
    {
        return $this->modelName;
    }

    /**
     * Sets the alias for the model in this query
     *
     * @param string  $modelAlias    The model alias
     * @param boolean $useAliasInSQL Whether to use the alias in the SQL code (false by default)
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function setModelAlias($modelAlias, $useAliasInSQL = false)
    {
        if ($useAliasInSQL) {
            $this->addAlias($modelAlias, $this->tableMap->getName());
            $this->useAliasInSQL = true;
        }
        $this->modelAlias = $modelAlias;

        return $this;
    }

    /**
     * Returns the alias of the main class for this model criteria
     *
     * @return string The model alias
     */
    public function getModelAlias()
    {
        return $this->modelAlias;
    }

    /**
     * Return the string to use in a clause as a model prefix for the main model
     *
     * @return string The model alias if it exists, the model name if not
     */
    public function getModelAliasOrName()
    {
        return $this->modelAlias ? $this->modelAlias : $this->modelName;
    }

    /**
     * Returns the name of the Peer class for this model criteria
     *
     * @return string
     */
    public function getModelPeerName()
    {
        return $this->modelPeerName;
    }

    /**
     * Returns the TabkleMap object for this Criteria
     *
     * @return TableMap
     */
    public function getTableMap()
    {
        return $this->tableMap;
    }

    /**
     * Sets the formatter to use for the find() output
     * Formatters must extend PropelFormatter
     * Use the ModelCriteria constants for class names:
     * <code>
     * $c->setFormatter(ModelCriteria::FORMAT_ARRAY);
     * </code>
     *
     * @param  string|PropelFormatter $formatter a formatter class name, or a formatter instance
     * @return ModelCriteria          The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function setFormatter($formatter)
    {
        if (is_string($formatter)) {
            $formatter = new $formatter();
        }
        if (!$formatter instanceof PropelFormatter) {
            throw new PropelException('setFormatter() only accepts classes extending PropelFormatter');
        }
        $this->formatter = $formatter;

        return $this;
    }

    /**
     * Gets the formatter to use for the find() output
     * Defaults to an instance of ModelCriteria::$defaultFormatterClass, i.e. PropelObjectsFormatter
     *
     * @return PropelFormatter
     */
    public function getFormatter()
    {
        if (null === $this->formatter) {
            $formatterClass = $this->defaultFormatterClass;
            $this->formatter = new $formatterClass();
        }

        return $this->formatter;
    }

    /**
     * Adds a condition on a column based on a pseudo SQL clause
     * but keeps it for later use with combine()
     * Until combine() is called, the condition is not added to the query
     * Uses introspection to translate the column phpName into a fully qualified name
     * <code>
     * $c->condition('cond1', 'b.Title = ?', 'foo');
     * </code>
     *
     * @see        Criteria::add()
     *
     * @param string $conditionName A name to store the condition for a later combination with combine()
     * @param string $clause        The pseudo SQL clause, e.g. 'AuthorId = ?'
     * @param mixed  $value         A value for the condition
     * @param mixed  $bindingType   A value for the condition
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function condition($conditionName, $clause, $value = null, $bindingType = null)
    {
        $this->addCond($conditionName, $this->getCriterionForClause($clause, $value, $bindingType), null, $bindingType);

        return $this;
    }

    /**
     * Adds a condition on a column based on a column phpName and a value
     * Uses introspection to translate the column phpName into a fully qualified name
     * Warning: recognizes only the phpNames of the main Model (not joined tables)
     * <code>
     * $c->filterBy('Title', 'foo');
     * </code>
     *
     * @see        Criteria::add()
     *
     * @param string $column     A string representing thecolumn phpName, e.g. 'AuthorId'
     * @param mixed  $value      A value for the condition
     * @param string $comparison What to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function filterBy($column, $value, $comparison = Criteria::EQUAL)
    {
        return $this->add($this->getRealColumnName($column), $value, $comparison);
    }

    /**
     * Adds a list of conditions on the columns of the current model
     * Uses introspection to translate the column phpName into a fully qualified name
     * Warning: recognizes only the phpNames of the main Model (not joined tables)
     * <code>
     * $c->filterByArray(array(
     *  'Title'     => 'War And Peace',
     *  'Publisher' => $publisher
     * ));
     * </code>
     *
     * @see        filterBy()
     *
     * @param mixed $conditions An array of conditions, using column phpNames as key
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function filterByArray($conditions)
    {
        foreach ($conditions as $column => $args) {
            call_user_func_array(array($this, 'filterBy' . $column), is_array($args) ? $args : array($args));
        }

        return $this;
    }

    /**
     * Adds a condition on a column based on a pseudo SQL clause
     * Uses introspection to translate the column phpName into a fully qualified name
     * <code>
     * // simple clause
     * $c->where('b.Title = ?', 'foo');
     * // named conditions
     * $c->condition('cond1', 'b.Title = ?', 'foo');
     * $c->condition('cond2', 'b.ISBN = ?', 12345);
     * $c->where(array('cond1', 'cond2'), Criteria::LOGICAL_OR);
     * </code>
     *
     * @see Criteria::add()
     *
     * @param mixed $clause A string representing the pseudo SQL clause, e.g. 'Book.AuthorId = ?'
     *                           Or an array of condition names
     * @param mixed $value A value for the condition
     * @param string $bindingType
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function where($clause, $value = null, $bindingType = null)
    {
        if (is_array($clause)) {
            // where(array('cond1', 'cond2'), Criteria::LOGICAL_OR)
            $criterion = $this->getCriterionForConditions($clause, $value);
        } else {
            // where('Book.AuthorId = ?', 12)
            $criterion = $this->getCriterionForClause($clause, $value, $bindingType);
        }
        $this->addUsingOperator($criterion, null, null);

        return $this;
    }

    /**
     * Adds a condition on a column based on a pseudo SQL clause
     * Uses introspection to translate the column phpName into a fully qualified name
     * <code>
     * // simple clause
     * $c->orWhere('b.Title = ?', 'foo');
     * // named conditions
     * $c->condition('cond1', 'b.Title = ?', 'foo');
     * $c->condition('cond2', 'b.ISBN = ?', 12345);
     * $c->orWhere(array('cond1', 'cond2'), Criteria::LOGICAL_OR);
     * </code>
     *
     * @see Criteria::addOr()
     * @deprecated Use _or()->where() instead
     *
     * @param string $clause The pseudo SQL clause, e.g. 'AuthorId = ?'
     * @param mixed  $value  A value for the condition
     * @param string $bindingType
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function orWhere($clause, $value = null, $bindingType = null)
    {
        return $this
            ->_or()
            ->where($clause, $value, $bindingType);
    }

    /**
     * Adds a having condition on a column based on a pseudo SQL clause
     * Uses introspection to translate the column phpName into a fully qualified name
     * <code>
     * // simple clause
     * $c->having('b.Title = ?', 'foo');
     * // named conditions
     * $c->condition('cond1', 'b.Title = ?', 'foo');
     * $c->condition('cond2', 'b.ISBN = ?', 12345);
     * $c->having(array('cond1', 'cond2'), Criteria::LOGICAL_OR);
     * </code>
     *
     * @see Criteria::addHaving()
     *
     * @param mixed $clause A string representing the pseudo SQL clause, e.g. 'Book.AuthorId = ?'
     *                           Or an array of condition names
     * @param mixed $value A value for the condition
     * @param string $bindingType
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function having($clause, $value = null, $bindingType = null)
    {
        if (is_array($clause)) {
            // having(array('cond1', 'cond2'), Criteria::LOGICAL_OR)
            $criterion = $this->getCriterionForConditions($clause, $value);
        } else {
            // having('Book.AuthorId = ?', 12)
            $criterion = $this->getCriterionForClause($clause, $value, $bindingType);
        }
        $this->addHaving($criterion);

        return $this;
    }

    /**
     * Adds an ORDER BY clause to the query
     * Usability layer on top of Criteria::addAscendingOrderByColumn() and Criteria::addDescendingOrderByColumn()
     * Infers $column and $order from $columnName and some optional arguments
     * Examples:
     *   $c->orderBy('Book.CreatedAt')
     *    => $c->addAscendingOrderByColumn(BookPeer::CREATED_AT)
     *   $c->orderBy('Book.CategoryId', 'desc')
     *    => $c->addDescendingOrderByColumn(BookPeer::CATEGORY_ID)
     *
     * @param string $columnName The column to order by
     * @param string $order      The sorting order. Criteria::ASC by default, also accepts Criteria::DESC
     *
     * @return ModelCriteria The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function orderBy($columnName, $order = Criteria::ASC)
    {
        list($column, $realColumnName) = $this->getColumnFromName($columnName, false);
        $order = strtoupper($order);
        switch ($order) {
            case Criteria::ASC:
                $this->addAscendingOrderByColumn($realColumnName);
                break;
            case Criteria::DESC:
                $this->addDescendingOrderByColumn($realColumnName);
                break;
            default:
                throw new PropelException('ModelCriteria::orderBy() only accepts Criteria::ASC or Criteria::DESC as argument');
        }

        return $this;
    }

    /**
     * Adds a GROUB BY clause to the query
     * Usability layer on top of Criteria::addGroupByColumn()
     * Infers $column $columnName
     * Examples:
     *   $c->groupBy('Book.AuthorId')
     *    => $c->addGroupByColumn(BookPeer::AUTHOR_ID)
     *
     * @param string $columnName The column to group by
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function groupBy($columnName)
    {
        list($column, $realColumnName) = $this->getColumnFromName($columnName, false);
        $this->addGroupByColumn($realColumnName);

        return $this;
    }

    /**
     * Adds a GROUB BY clause for all columns of a model to the query
     * Examples:
     *   $c->groupBy('Book');
     *    => $c->addGroupByColumn(BookPeer::ID);
     *    => $c->addGroupByColumn(BookPeer::TITLE);
     *    => $c->addGroupByColumn(BookPeer::AUTHOR_ID);
     *    => $c->addGroupByColumn(BookPeer::PUBLISHER_ID);
     *
     * @param string $class The class name or alias
     *
     * @return ModelCriteria The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function groupByClass($class)
    {
        if ($class == $this->getModelAliasOrName()) {
            // column of the Criteria's model
            $tableMap = $this->getTableMap();
        } elseif (isset($this->joins[$class])) {
            // column of a relations's model
            $tableMap = $this->joins[$class]->getTableMap();
        } else {
            throw new PropelException('Unknown model or alias ' . $class);
        }
        foreach ($tableMap->getColumns() as $column) {
            if (isset($this->aliases[$class])) {
                $this->addGroupByColumn($class . '.' . $column->getName());
            } else {
                $this->addGroupByColumn($column->getFullyQualifiedName());
            }
        }

        return $this;
    }

    /**
     * Adds a DISTINCT clause to the query
     * Alias for Criteria::setDistinct()
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function distinct()
    {
        $this->setDistinct();

        return $this;
    }

    /**
     * Adds a LIMIT clause (or its subselect equivalent) to the query
     * Alias for Criteria:::setLimit()
     *
     * @param int $limit Maximum number of results to return by the query
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function limit($limit)
    {
        $this->setLimit($limit);

        return $this;
    }

    /**
     * Adds an OFFSET clause (or its subselect equivalent) to the query
     * Alias for of Criteria::setOffset()
     *
     * @param int $offset Offset of the first result to return
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function offset($offset)
    {
        $this->setOffset($offset);

        return $this;
    }

    /**
     * Makes the ModelCriteria return a string, array, or PropelArrayCollection
     * Examples:
     *   ArticleQuery::create()->select('Name')->find();
     *   => PropelArrayCollection Object ('Foo', 'Bar')
     *
     *   ArticleQuery::create()->select('Name')->findOne();
     *   => string 'Foo'
     *
     *   ArticleQuery::create()->select(array('Id', 'Name'))->find();
     *   => PropelArrayCollection Object (
     *        array('Id' => 1, 'Name' => 'Foo'),
     *        array('Id' => 2, 'Name' => 'Bar')
     *      )
     *
     *   ArticleQuery::create()->select(array('Id', 'Name'))->findOne();
     *   => array('Id' => 1, 'Name' => 'Foo')
     *
     * @param mixed $columnArray A list of column names (e.g. array('Title', 'Category.Name', 'c.Content')) or a single column name (e.g. 'Name')
     *
     * @return ModelCriteria The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function select($columnArray)
    {
        if (!count($columnArray) || $columnArray == '') {
            throw new PropelException('You must ask for at least one column');
        }

        if ($columnArray == '*') {
            $columnArray = array();
            foreach (call_user_func(array($this->modelPeerName, 'getFieldNames'), BasePeer::TYPE_PHPNAME) as $column) {
                $columnArray []= $this->modelName . '.' . $column;
            }
        }

        $this->select = $columnArray;

        return $this;
    }

    /**
     * Retrieves the columns defined by a previous call to select().
     * @see       select()
     *
     * @return array|string A list of column names (e.g. array('Title', 'Category.Name', 'c.Content')) or a single column name (e.g. 'Name')
     */
    public function getSelect()
    {
        return $this->select;
    }

    protected function configureSelectColumns()
    {
        if (is_null($this->select)) {
            // leave early
            return;
        }

        // select() needs the PropelSimpleArrayFormatter if no formatter given
        if (is_null($this->formatter)) {
                $this->setFormatter('PropelSimpleArrayFormatter');
        }

        // clear only the selectColumns, clearSelectColumns() clears asColumns too
        $this->selectColumns = array();

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        if (!$this->selectQueries) {
            $this->setPrimaryTableName(constant($this->modelPeerName . '::TABLE_NAME'));
        }

        // Add requested columns which are not withColumns
        $columnNames = is_array($this->select) ? $this->select : array($this->select);
        // temporary store columns Alias or withColumn
        $asColumns = $this->getAsColumns();
        $this->asColumns = array();
        foreach ($columnNames as $columnName) {
            // check if the column was added by a withColumn, if not add it
            if (!array_key_exists($columnName, $asColumns)) {
                $column = $this->getColumnFromName($columnName);
                // always put quotes around the columnName to be safe, we strip them in the formatter
                $this->addAsColumn('"' . $columnName . '"', $column[1]);
            } else {
                $this->addAsColumn($columnName, $asColumns[$columnName]);
            }
        }
    }

    /**
     * This method returns the previousJoin for this ModelCriteria,
     * by default this is null, but after useQuery this is set the to the join of that use
     *
     * @return Join the previousJoin for this ModelCriteria
     */
    public function getPreviousJoin()
    {
        return $this->previousJoin;
    }

    /**
     * This method sets the previousJoin for this ModelCriteria,
     * by default this is null, but after useQuery this is set the to the join of that use
     *
     * @param Join $previousJoin The previousJoin for this ModelCriteria
     */
    public function setPreviousJoin(Join $previousJoin)
    {
        $this->previousJoin = $previousJoin;
    }

    /**
     * This method returns an already defined join clause from the query
     *
     * @param string $name The name of the join clause
     *
     * @return Join A join object
     */
    public function getJoin($name)
    {
        return $this->joins[$name];
    }

    /**
     * Adds a JOIN clause to the query
     * Infers the ON clause from a relation name
     * Uses the Propel table maps, based on the schema, to guess the related columns
     * Beware that the default JOIN operator is INNER JOIN, while Criteria defaults to WHERE
     * Examples:
     * <code>
     *   $c->join('Book.Author');
     *    => $c->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::INNER_JOIN);
     *   $c->join('Book.Author', Criteria::RIGHT_JOIN);
     *    => $c->addJoin(BookPeer::AUTHOR_ID, AuthorPeer::ID, Criteria::RIGHT_JOIN);
     *   $c->join('Book.Author a', Criteria::RIGHT_JOIN);
     *    => $c->addAlias('a', AuthorPeer::TABLE_NAME);
     *    => $c->addJoin(BookPeer::AUTHOR_ID, 'a.ID', Criteria::RIGHT_JOIN);
     * </code>
     *
     * @param string $relation Relation to use for the join
     * @param string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ModelCriteria The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function join($relation, $joinType = Criteria::INNER_JOIN)
    {
        // relation looks like '$leftName.$relationName $relationAlias'
        list($fullName, $relationAlias) = self::getClassAndAlias($relation);
        if (strpos($fullName, '.') === false) {
            // simple relation name, refers to the current table
            $leftName = $this->getModelAliasOrName();
            $relationName = $fullName;
            $previousJoin = $this->getPreviousJoin();
            $tableMap = $this->getTableMap();
        } else {
            list($leftName, $relationName) = explode('.', $fullName);
            // find the TableMap for the left table using the $leftName
            if ($leftName == $this->getModelAliasOrName()) {
                $previousJoin = $this->getPreviousJoin();
                $tableMap = $this->getTableMap();
            } elseif (isset($this->joins[$leftName])) {
                $previousJoin = $this->joins[$leftName];
                $tableMap = $previousJoin->getTableMap();
            } else {
                throw new PropelException('Unknown table or alias ' . $leftName);
            }
        }
        $leftTableAlias = isset($this->aliases[$leftName]) ? $leftName : null;

        // find the RelationMap in the TableMap using the $relationName
        if (!$tableMap->hasRelation($relationName)) {
            throw new PropelException('Unknown relation ' . $relationName . ' on the ' . $leftName .' table');
        }
        $relationMap = $tableMap->getRelation($relationName);

        // create a ModelJoin object for this join
        $join = new ModelJoin();
        $join->setJoinType($joinType);
        if (null !== $previousJoin) {
            $join->setPreviousJoin($previousJoin);
        }
        $join->setRelationMap($relationMap, $leftTableAlias, $relationAlias);

        // add the ModelJoin to the current object
        if ($relationAlias !== null) {
            $this->addAlias($relationAlias, $relationMap->getRightTable()->getName());
            $this->addJoinObject($join, $relationAlias);
        } else {
            $this->addJoinObject($join, $relationName);
        }

        return $this;
    }

    /**
     * Add another condition to an already added join
     * @example
     * <code>
     * $query->join('Book.Author');
     * $query->addJoinCondition('Author', 'Book.Title LIKE ?', 'foo%');
     * </code>
     *
     * @param string $name     The relation name or alias on which the join was created
     * @param string $clause   SQL clause, may contain column and table phpNames
     * @param mixed  $value    An optional value to bind to the clause
     * @param string $operator The operator to use to add the condition. Defaults to 'AND'
     * @param string $bindingType
     *
     * @return ModelCriteria The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function addJoinCondition($name, $clause, $value = null, $operator = null, $bindingType = null)
    {
        if (!isset($this->joins[$name])) {
            throw new PropelException(sprintf('Adding a condition to a nonexistent join, %s. Try calling join() first.', $name));
        }
        $join = $this->joins[$name];
        if (!$join->getJoinCondition() instanceof Criterion) {
            $join->buildJoinCondition($this);
        }
        $criterion = $this->getCriterionForClause($clause, $value, $bindingType);
        $method = $operator === Criteria::LOGICAL_OR ? 'addOr' : 'addAnd';
        $join->getJoinCondition()->$method($criterion);

        return $this;
    }

    /**
     * Replace the condition of an already added join
     * @example
     * <code>
     * $query->join('Book.Author');
     * $query->condition('cond1', 'Book.AuthorId = Author.Id')
     * $query->condition('cond2', 'Book.Title LIKE ?', 'War%')
     * $query->combine(array('cond1', 'cond2'), 'and', 'cond3')
     * $query->setJoinCondition('Author', 'cond3');
     * </code>
     *
     * @param string $name      The relation name or alias on which the join was created
     * @param mixed  $condition A Criterion object, or a condition name
     *
     * @return ModelCriteria The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function setJoinCondition($name, $condition)
    {
        if (!isset($this->joins[$name])) {
            throw new PropelException(sprintf('Setting a condition to a nonexistent join, %s. Try calling join() first.', $name));
        }
        if ($condition instanceof Criterion) {
            $this->getJoin($name)->setJoinCondition($condition);
        } elseif (isset($this->namedCriterions[$condition])) {
            $this->getJoin($name)->setJoinCondition($this->namedCriterions[$condition]);
        } else {
            throw new PropelException(sprintf('Cannot add condition %s on join %s. setJoinCondition() expects either a Criterion, or a condition added by way of condition()', $condition, $name));
        }

        return $this;
    }

    /**
     * Add a join object to the Criteria
     * @see   Criteria::addJoinObject()
     * @param Join $join A join object
     * @param string $name
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function addJoinObject(Join $join, $name = null)
    {
        if (!in_array($join, $this->joins)) { // compare equality, NOT identity
            if (null === $name) {
                $this->joins[] = $join;
            } else {
                $this->joins[$name] = $join;
            }
        }

        return $this;
    }

    /**
     * Adds a JOIN clause to the query and hydrates the related objects
     * Shortcut for $c->join()->with()
     * <code>
     *   $c->joinWith('Book.Author');
     *    => $c->join('Book.Author');
     *    => $c->with('Author');
     *   $c->joinWith('Book.Author a', Criteria::RIGHT_JOIN);
     *    => $c->join('Book.Author a', Criteria::RIGHT_JOIN);
     *    => $c->with('a');
     * </code>
     *
     * @param string $relation Relation to use for the join
     * @param string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function joinWith($relation, $joinType = Criteria::INNER_JOIN)
    {
        $this->join($relation, $joinType);
        $this->with(self::getRelationName($relation));

        return $this;
    }

    /**
     * Adds a relation to hydrate together with the main object
     * The relation must be initialized via a join() prior to calling with()
     * Examples:
     * <code>
     *   $c->join('Book.Author');
     *   $c->with('Author');
     *
     *   $c->join('Book.Author a', Criteria::RIGHT_JOIN);
     *   $c->with('a');
     * </code>
     * WARNING: on a one-to-many relationship, the use of with() combined with limit()
     * will return a wrong number of results for the related objects
     *
     * @param string $relation Relation to use for the join
     *
     * @return ModelCriteria The current object, for fluid interface
     *
     * @throws PropelException
     */
    public function with($relation)
    {
        if (!isset($this->joins[$relation])) {
            throw new PropelException('Unknown relation name or alias ' . $relation);
        }
        $join = $this->joins[$relation];
        if ($join->getRelationMap()->getType() == RelationMap::MANY_TO_MANY) {
            throw new PropelException('with() does not allow hydration for many-to-many relationships');
        } elseif ($join->getRelationMap()->getType() == RelationMap::ONE_TO_MANY) {
            // For performance reasons, the formatters will use a special routine in this case
            $this->isWithOneToMany = true;
        }

        // check that the columns of the main class are already added (but only if this isn't a useQuery)
        if (!$this->hasSelectClause() && !$this->getPrimaryCriteria()) {
            $this->addSelfSelectColumns();
        }
        // add the columns of the related class
        $this->addRelationSelectColumns($relation);

        // list the join for later hydration in the formatter
        $this->with[$relation] = new ModelWith($join);

        return $this;
    }

    /**
     * Gets the array of ModelWith specifying which objects must be hydrated
     * together with the main object.
     *
     * @see       with()
     * @return array
     */
    public function getWith()
    {
        return $this->with;
    }

    /**
     * Sets the array of ModelWith specifying which objects must be hydrated
     * together with the main object.
     *
     * @param    array
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function setWith($with)
    {
        $this->with = $with;

        return $this;
    }

    public function isWithOneToMany()
    {
        return $this->isWithOneToMany;
    }

    /**
     * Adds a supplementary column to the select clause
     * These columns can later be retrieved from the hydrated objects using getVirtualColumn()
     *
     * @param string $clause The SQL clause with object model column names
     *                           e.g. 'UPPER(Author.FirstName)'
     * @param string $name Optional alias for the added column
     *                           If no alias is provided, the clause is used as a column alias
     *                           This alias is used for retrieving the column via BaseObject::getVirtualColumn($alias)
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function withColumn($clause, $name = null)
    {
        if (null === $name) {
            $name = str_replace(array('.', '(', ')'), '', $clause);
        }
        $clause = trim($clause);
        $this->replaceNames($clause);
        // check that the columns of the main class are already added (if this is the primary ModelCriteria)
        if (!$this->hasSelectClause() && !$this->getPrimaryCriteria()) {
            $this->addSelfSelectColumns();
        }
        $this->addAsColumn($name, $clause);

        return $this;
    }

    /**
     * Initializes a secondary ModelCriteria object, to be later merged with the current object
     *
     * @see       ModelCriteria::endUse()
     * @param string $relationName        Relation name or alias
     * @param string $secondaryCriteriaClass Classname for the ModelCriteria to be used
     *
     * @return ModelCriteria The secondary criteria object
     *
     * @throws PropelException
     */
    public function useQuery($relationName, $secondaryCriteriaClass = null)
    {
        if (!isset($this->joins[$relationName])) {
            throw new PropelException('Unknown class or alias ' . $relationName);
        }
        $className = $this->joins[$relationName]->getTableMap()->getPhpName();
        if (null === $secondaryCriteriaClass) {
            $secondaryCriteria = PropelQuery::from($className);
        } else {
            $secondaryCriteria = new $secondaryCriteriaClass();
        }
        if ($className != $relationName) {
            $secondaryCriteria->setModelAlias($relationName, $relationName == $this->joins[$relationName]->getRelationMap()->getName() ? false : true);
        }
        $secondaryCriteria->setPrimaryCriteria($this, $this->joins[$relationName]);

        return $secondaryCriteria;
    }

    /**
     * Finalizes a secondary criteria and merges it with its primary Criteria
     *
     * @see       Criteria::mergeWith()
     *
     * @return ModelCriteria The primary criteria object
     */
    public function endUse()
    {
        if (isset($this->aliases[$this->modelAlias])) {
            $this->removeAlias($this->modelAlias);
        }
        $primaryCriteria = $this->getPrimaryCriteria();
        $primaryCriteria->mergeWith($this);

        return $primaryCriteria;
    }

    /**
     * Add the content of a Criteria to the current Criteria
     * In case of conflict, the current Criteria keeps its properties
     * @see Criteria::mergeWith()
     *
     * @param Criteria $criteria The criteria to read properties from
     * @param string   $operator The logical operator used to combine conditions
     *              Defaults to Criteria::LOGICAL_AND, also accapts Criteria::LOGICAL_OR
     *
     * @return ModelCriteria The primary criteria object
     */
    public function mergeWith(Criteria $criteria, $operator = null)
    {
        parent::mergeWith($criteria, $operator);

        // merge with
        if ($criteria instanceof ModelCriteria) {
            $this->with = array_merge($this->getWith(), $criteria->getWith());
        }

        return $this;
    }

    /**
     * Clear the conditions to allow the reuse of the query object.
     * The ModelCriteria's Model and alias 'all the properties set by construct) will remain.
     *
     * @return ModelCriteria The primary criteria object
     */
    public function clear()
    {
        parent::clear();

        $this->with = array();
        $this->primaryCriteria = null;
        $this->formatter=null;

        return $this;
    }
    /**
     * Sets the primary Criteria for this secondary Criteria
     *
     * @param ModelCriteria $criteria     The primary criteria
     * @param Join          $previousJoin The previousJoin for this ModelCriteria
     */
    public function setPrimaryCriteria(ModelCriteria $criteria, Join $previousJoin)
    {
        $this->primaryCriteria = $criteria;
        $this->setPreviousJoin($previousJoin);
    }

    /**
     * Gets the primary criteria for this secondary Criteria
     *
     * @return ModelCriteria The primary criteria
     */
    public function getPrimaryCriteria()
    {
        return $this->primaryCriteria;
    }

    /**
     * Adds a Criteria as subQuery in the From Clause.
     *
     * @see Criteria::addSelectQuery()
     *
     * @param Criteria $subQueryCriteria         Criteria to build the subquery from
     * @param string   $alias                    alias for the subQuery
     * @param boolean  $addAliasAndSelectColumns Set to false if you want to manually add the aliased select columns
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function addSelectQuery(Criteria $subQueryCriteria, $alias = null, $addAliasAndSelectColumns = true)
    {
        if (!$subQueryCriteria->hasSelectClause()) {
            $subQueryCriteria->addSelfSelectColumns();
        }
        parent::addSelectQuery($subQueryCriteria, $alias);
        if ($addAliasAndSelectColumns) {
            // give this query-model same alias as subquery
            if (null === $alias) {
                end($this->selectQueries);
                $alias = key($this->selectQueries);
            }
            $this->setModelAlias($alias, true);
            // so we can add selfSelectColumns
            $this->addSelfSelectColumns();
        }

        return $this;
    }

    /**
     * Adds the select columns for a the current table
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function addSelfSelectColumns()
    {
        call_user_func(array($this->modelPeerName, 'addSelectColumns'), $this, $this->useAliasInSQL ? $this->modelAlias : null);

        return $this;
    }

    /**
     * Adds the select columns for a relation
     *
     * @param string $relation The relation name or alias, as defined in join()
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function addRelationSelectColumns($relation)
    {
        $join = $this->joins[$relation];
        call_user_func(array($join->getTableMap()->getPeerClassname(), 'addSelectColumns'), $this, $join->getRelationAlias());

        return $this;
    }

    /**
     * Returns the class and alias of a string representing a model or a relation
     * e.g. 'Book b' => array('Book', 'b')
     * e.g. 'Book'   => array('Book', null)
     *
     * @param string $class The classname to explode
     *
     * @return array list($className, $aliasName)
     */
    public static function getClassAndAlias($class)
    {
        if (strpos($class, ' ') !== false) {
            list($class, $alias) = explode(' ', $class);
        } else {
            $alias = null;
        }

        return array($class, $alias);
    }

    /**
     * Returns the name of a relation from a string.
     * The input looks like '$leftName.$relationName $relationAlias'
     *
     * @param  string $relation Relation to use for the join
     * @return string the relationName used in the join
     */
    public static function getRelationName($relation)
    {
        // get the relationName
        list($fullName, $relationAlias) = self::getClassAndAlias($relation);
        if ($relationAlias) {
            $relationName = $relationAlias;
        } elseif (false === strpos($fullName, '.')) {
            $relationName = $fullName;
        } else {
            list($leftName, $relationName) = explode('.', $fullName);
        }

        return $relationName;
    }

    /**
     * Triggers the automated cloning on termination.
     * By default, temrination methods don't clone the current object,
     * even though they modify it. If the query must be reused after termination,
     * you must call this method prior to temrination.
     *
     * @param boolean $isKeepQuery
     *
     * @return ModelCriteria The current object, for fluid interface
     */
    public function keepQuery($isKeepQuery = true)
    {
        $this->isKeepQuery = (bool) $isKeepQuery;

        return $this;
    }

    /**
     * Checks whether the automated cloning on termination is enabled.
     *
     * @return boolean true if cloning must be done before termination
     */
    public function isKeepQuery()
    {
        return $this->isKeepQuery;
    }

    /**
     * Code to execute before every SELECT statement
     *
     * @param PropelPDO $con The connection object used by the query
     */
    protected function basePreSelect(PropelPDO $con)
    {
        return $this->preSelect($con);
    }

    protected function preSelect(PropelPDO $con)
    {
    }

    /**
     * Issue a SELECT query based on the current ModelCriteria
     * and format the list of results with the current formatter
     * By default, returns an array of model objects
     *
     * @param PropelPDO $con an optional connection object
     *
     * @return PropelObjectCollection|array|mixed the list of results, formatted by the current formatter
     */
    public function find($con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_READ);
        }
        $this->basePreSelect($con);
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $stmt = $criteria->doSelect($con);

        return $criteria->getFormatter()->init($criteria)->format($stmt);
    }

    /**
     * Issue a SELECT ... LIMIT 1 query based on the current ModelCriteria
     * and format the result with the current formatter
     * By default, returns a model object
     *
     * @param PropelPDO $con an optional connection object
     *
     * @return mixed the result, formatted by the current formatter
     */
    public function findOne($con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_READ);
        }
        $this->basePreSelect($con);
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $criteria->limit(1);
        $stmt = $criteria->doSelect($con);

        return $criteria->getFormatter()->init($criteria)->formatOne($stmt);
    }

    /**
     * Issue a SELECT ... LIMIT 1 query based on the current ModelCriteria
     * and format the result with the current formatter
     * By default, returns a model object
     *
     * @param PropelPDO $con an optional connection object
     *
     * @return mixed the result, formatted by the current formatter
     *
     * @throws PropelException
     */
    public function findOneOrCreate($con = null)
    {
        if ($this->joins) {
            throw new PropelException('findOneOrCreate() cannot be used on a query with a join, because Propel cannot transform a SQL JOIN into a subquery. You should split the query in two queries to avoid joins.');
        }
        if (!$ret = $this->findOne($con)) {
            $class = $this->getModelName();
            $obj = new $class();
            foreach ($this->keys() as $key) {
                $obj->setByName($key, $this->getValue($key), BasePeer::TYPE_COLNAME);
            }
            $ret = $this->getFormatter()->formatRecord($obj);
        }

        return $ret;
    }

    /**
     * Find object by primary key
     * Behaves differently if the model has simple or composite primary key
     * <code>
     * // simple primary key
     * $book  = $c->findPk(12, $con);
     * // composite primary key
     * $bookOpinion = $c->findPk(array(34, 634), $con);
     * </code>
     * @param mixed     $key Primary key to use for the query
     * @param PropelPDO $con an optional connection object
     *
     * @return mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_READ);
        }
        // As the query uses a PK condition, no limit(1) is necessary.
        $this->basePreSelect($con);
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $pkCols = $this->getTableMap()->getPrimaryKeyColumns();
        if (count($pkCols) == 1) {
            // simple primary key
            $pkCol = $pkCols[0];
            $criteria->add($pkCol->getFullyQualifiedName(), $key);
        } else {
            // composite primary key
            foreach ($pkCols as $pkCol) {
                $keyPart = array_shift($key);
                $criteria->add($pkCol->getFullyQualifiedName(), $keyPart);
            }
        }
        $stmt = $criteria->doSelect($con);

        return $criteria->getFormatter()->init($criteria)->formatOne($stmt);
    }

    /**
     * Find objects by primary key
     * Behaves differently if the model has simple or composite primary key
     * <code>
     * // simple primary key
     * $books = $c->findPks(array(12, 56, 832), $con);
     * // composite primary key
     * $bookOpinion = $c->findPks(array(array(34, 634), array(45, 518), array(34, 765)), $con);
     * </code>
     * @param array     $keys Primary keys to use for the query
     * @param PropelPDO $con  an optional connection object
     *
     * @return mixed the list of results, formatted by the current formatter
     *
     * @throws PropelException
     */
    public function findPks($keys, $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_READ);
        }
        // As the query uses a PK condition, no limit(1) is necessary.
        $this->basePreSelect($con);
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $pkCols = $this->getTableMap()->getPrimaryKeyColumns();
        if (count($pkCols) == 1) {
            // simple primary key
            $pkCol = array_shift($pkCols);
            $criteria->add($pkCol->getFullyQualifiedName(), $keys, Criteria::IN);
        } else {
            // composite primary key
            throw new PropelException('Multiple object retrieval is not implemented for composite primary keys');
        }
        $stmt = $criteria->doSelect($con);

        return $criteria->getFormatter()->init($criteria)->format($stmt);
    }

    /**
     * Builds, binds and executes a SELECT query based on the current object.
     *
     * @param PropelPDO $con A connection object
     *
     * @return PDOStatement A PDO statement executed using the connection, ready to be fetched
     *
     * @throws PropelException
     */
    protected function doSelect($con)
    {
        // check that the columns of the main class are already added (if this is the primary ModelCriteria)
        if (!$this->hasSelectClause() && !$this->getPrimaryCriteria()) {
            $this->addSelfSelectColumns();
        }
        $this->configureSelectColumns();

        $dbMap = Propel::getDatabaseMap($this->getDbName());
        $db = Propel::getDB($this->getDbName());

        $params = array();
        $sql = BasePeer::createSelectSql($this, $params);
        try {
            $stmt = $con->prepare($sql);
            $db->bindValues($stmt, $params, $dbMap);
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute SELECT statement [%s]', $sql), $e);
        }

        return $stmt;
    }

    /**
     * Apply a condition on a column and issues the SELECT query
     *
     * @see       filterBy()
     * @see       find()
     *
     * @param string    $column A string representing the column phpName, e.g. 'AuthorId'
     * @param mixed     $value  A value for the condition
     * @param PropelPDO $con    An optional connection object
     *
     * @return mixed the list of results, formatted by the current formatter
     */
    public function findBy($column, $value, $con = null)
    {
        $method = 'filterBy' . $column;
        $this->$method($value);

        return $this->find($con);
    }

    /**
     * Apply a list of conditions on columns and issues the SELECT query
     * <code>
     * $c->findByArray(array(
     *  'Title'     => 'War And Peace',
     *  'Publisher' => $publisher
     * ), $con);
     * </code>
     *
     * @see       filterByArray()
     * @see       find()
     *
     * @param mixed     $conditions An array of conditions, using column phpNames as key
     * @param PropelPDO $con        an optional connection object
     *
     * @return mixed the list of results, formatted by the current formatter
     */
    public function findByArray($conditions, $con = null)
    {
        $this->filterByArray($conditions);

        return $this->find($con);
    }

    /**
     * Apply a condition on a column and issues the SELECT ... LIMIT 1 query
     *
     * @see       filterBy()
     * @see       findOne()
     *
     * @param mixed     $column A string representing thecolumn phpName, e.g. 'AuthorId'
     * @param mixed     $value  A value for the condition
     * @param PropelPDO $con    an optional connection object
     *
     * @return mixed the result, formatted by the current formatter
     */
    public function findOneBy($column, $value, $con = null)
    {
        $method = 'filterBy' . $column;
        $this->$method($value);

        return $this->findOne($con);
    }

    /**
     * Apply a list of conditions on columns and issues the SELECT ... LIMIT 1 query
     * <code>
     * $c->findOneByArray(array(
     *  'Title'     => 'War And Peace',
     *  'Publisher' => $publisher
     * ), $con);
     * </code>
     *
     * @see       filterByArray()
     * @see       findOne()
     *
     * @param mixed     $conditions An array of conditions, using column phpNames as key
     * @param PropelPDO $con        an optional connection object
     *
     * @return mixed the list of results, formatted by the current formatter
     */
    public function findOneByArray($conditions, $con = null)
    {
        $this->filterByArray($conditions);

        return $this->findOne($con);
    }

    /**
     * Issue a SELECT COUNT(*) query based on the current ModelCriteria
     *
     * @param PropelPDO $con an optional connection object
     *
     * @return integer the number of results
     */
    public function count($con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_READ);
        }
        $this->basePreSelect($con);
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $criteria->setDbName($this->getDbName()); // Set the correct dbName
        $criteria->clearOrderByColumns(); // ORDER BY won't ever affect the count

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(constant($this->modelPeerName.'::TABLE_NAME'));

        $stmt = $criteria->doCount($con);
        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }

    protected function doCount($con)
    {
        $dbMap = Propel::getDatabaseMap($this->getDbName());
        $db = Propel::getDB($this->getDbName());

        // check that the columns of the main class are already added (if this is the primary ModelCriteria)
        if (!$this->hasSelectClause() && !$this->getPrimaryCriteria()) {
            $this->addSelfSelectColumns();
        }

        $this->configureSelectColumns();

        $needsComplexCount = $this->getGroupByColumns()
            || $this->getOffset()
            || $this->getLimit()
            || $this->getHaving()
            || in_array(Criteria::DISTINCT, $this->getSelectModifiers())
            || count($this->selectQueries) > 0;

        $params = array();
        if ($needsComplexCount) {
            if (BasePeer::needsSelectAliases($this)) {
                if ($this->getHaving()) {
                    throw new PropelException('Propel cannot create a COUNT query when using HAVING and  duplicate column names in the SELECT part');
                }
                $db->turnSelectColumnsToAliases($this);
            }
            $selectSql = BasePeer::createSelectSql($this, $params);
            $sql = 'SELECT COUNT(*) FROM (' . $selectSql . ') propelmatch4cnt';
        } else {
            // Replace SELECT columns with COUNT(*)
            $this->clearSelectColumns()->addSelectColumn('COUNT(*)');
            $sql = BasePeer::createSelectSql($this, $params);
        }
        try {
            $stmt = $con->prepare($sql);
            $db->bindValues($stmt, $params, $dbMap);
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute COUNT statement [%s]', $sql), $e);
        }

        return $stmt;
    }

    /**
     * Issue a SELECT query based on the current ModelCriteria
     * and uses a page and a maximum number of results per page
     * to compute an offet and a limit.
     *
     * @param int       $page       number of the page to start the pager on. Page 1 means no offset
     * @param int       $maxPerPage maximum number of results per page. Determines the limit
     * @param PropelPDO $con        an optional connection object
     *
     * @return PropelModelPager a pager object, supporting iteration
     */
    public function paginate($page = 1, $maxPerPage = 10, $con = null)
    {
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $pager = new PropelModelPager($criteria, $maxPerPage);
        $pager->setPage($page);
        $pager->init($con);

        return $pager;
    }

    /**
     * Code to execute before every DELETE statement
     *
     * @param PropelPDO $con The connection object used by the query
     */
    protected function basePreDelete(PropelPDO $con)
    {
        return $this->preDelete($con);
    }

    protected function preDelete(PropelPDO $con)
    {
    }

    /**
     * Code to execute after every DELETE statement
     *
     * @param int       $affectedRows the number of deleted rows
     * @param PropelPDO $con          The connection object used by the query
     */
    protected function basePostDelete($affectedRows, PropelPDO $con)
    {
        return $this->postDelete($affectedRows, $con);
    }

    protected function postDelete($affectedRows, PropelPDO $con)
    {
    }

    /**
     * Issue a DELETE query based on the current ModelCriteria
     * An optional hook on basePreDelete() can prevent the actual deletion
     *
     * @param PropelPDO $con an optional connection object
     *
     * @return integer the number of deleted rows
     *
     * @throws PropelException
     */
    public function delete($con = null)
    {
        if (count($this->getMap()) == 0) {
            throw new PropelException('delete() expects a Criteria with at least one condition. Use deleteAll() to delete all the rows of a table');
        }

        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_WRITE);
        }

        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $criteria->setDbName($this->getDbName());

        $con->beginTransaction();
        try {
            if (!$affectedRows = $criteria->basePreDelete($con)) {
                $affectedRows = $criteria->doDelete($con);
            }
            $criteria->basePostDelete($affectedRows, $con);
            $con->commit();
        } catch (PropelException $e) {
            $con->rollback();
            throw $e;
        }

        return $affectedRows;
    }

    /**
     * Issue a DELETE query based on the current ModelCriteria
     * This method is called by ModelCriteria::delete() inside a transaction
     *
     * @param PropelPDO $con a connection object
     *
     * @return integer the number of deleted rows
     */
    public function doDelete($con)
    {
        $affectedRows = call_user_func(array($this->modelPeerName, 'doDelete'), $this, $con);

        return $affectedRows;
    }

    /**
     * Issue a DELETE query based on the current ModelCriteria deleting all rows in the table
     * An optional hook on basePreDelete() can prevent the actual deletion
     *
     * @param PropelPDO $con an optional connection object
     *
     * @return integer the number of deleted rows
     *
     * @throws PropelException
     */
    public function deleteAll($con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_WRITE);
        }
        $con->beginTransaction();
        try {
            if (!$affectedRows = $this->basePreDelete($con)) {
                $affectedRows = $this->doDeleteAll($con);
            }
            $this->basePostDelete($affectedRows, $con);
            $con->commit();

            return $affectedRows;
        } catch (PropelException $e) {
            $con->rollBack();
            throw $e;
        }
    }

    /**
     * Issue a DELETE query based on the current ModelCriteria deleting all rows in the table
     * This method is called by ModelCriteria::deleteAll() inside a transaction
     *
     * @param PropelPDO $con a connection object
     *
     * @return integer the number of deleted rows
     */
    public function doDeleteAll($con)
    {
        $affectedRows = call_user_func(array($this->modelPeerName, 'doDeleteAll'), $con);

        return $affectedRows;
    }

    /**
     * Code to execute before every UPDATE statement
     *
     * @param array     $values               The associatiove array of columns and values for the update
     * @param PropelPDO $con                  The connection object used by the query
     * @param boolean   $forceIndividualSaves If false (default), the resulting call is a BasePeer::doUpdate(), ortherwise it is a series of save() calls on all the found objects
     */
    protected function basePreUpdate(&$values, PropelPDO $con, $forceIndividualSaves = false)
    {
        return $this->preUpdate($values, $con, $forceIndividualSaves);
    }

    protected function preUpdate(&$values, PropelPDO $con, $forceIndividualSaves = false)
    {
    }

    /**
     * Code to execute after every UPDATE statement
     *
     * @param int       $affectedRows the number of updated rows
     * @param PropelPDO $con          The connection object used by the query
     */
    protected function basePostUpdate($affectedRows, PropelPDO $con)
    {
        return $this->postUpdate($affectedRows, $con);
    }

    protected function postUpdate($affectedRows, PropelPDO $con)
    {
    }

    /**
    * Issue an UPDATE query based the current ModelCriteria and a list of changes.
    * An optional hook on basePreUpdate() can prevent the actual update.
    * Beware that behaviors based on hooks in the object's save() method
    * will only be triggered if you force individual saves, i.e. if you pass true as second argument.
    *
    * @param      array $values Associative array of keys and values to replace
    * @param      PropelPDO $con an optional connection object
    * @param      boolean $forceIndividualSaves If false (default), the resulting call is a BasePeer::doUpdate(), ortherwise it is a series of save() calls on all the found objects
    *
    * @return     Integer Number of updated rows
    *
    * @throws PropelException
    */
    public function update($values, $con = null, $forceIndividualSaves = false)
    {
        if (!is_array($values)) {
            throw new PropelException('set() expects an array as first argument');
        }
        if (count($this->getJoins())) {
            throw new PropelException('set() does not support multitable updates, please do not use join()');
        }

        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_WRITE);
        }

        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $criteria->setPrimaryTableName(constant($this->modelPeerName.'::TABLE_NAME'));

        $con->beginTransaction();
        try {

            if (!$affectedRows = $criteria->basePreUpdate($values, $con, $forceIndividualSaves)) {
                $affectedRows = $criteria->doUpdate($values, $con, $forceIndividualSaves);
            }
            $criteria->basePostUpdate($affectedRows, $con);

            $con->commit();
        } catch (PropelException $e) {
            $con->rollBack();
            throw $e;
        }

        return $affectedRows;
    }

    /**
    * Issue an UPDATE query based the current ModelCriteria and a list of changes.
    * This method is called by ModelCriteria::update() inside a transaction.
    *
    * @param      array $values Associative array of keys and values to replace
    * @param      PropelPDO $con a connection object
    * @param      boolean $forceIndividualSaves If false (default), the resulting call is a BasePeer::doUpdate(), ortherwise it is a series of save() calls on all the found objects
    *
    * @return     Integer Number of updated rows
    */
    public function doUpdate($values, $con, $forceIndividualSaves = false)
    {
        if ($forceIndividualSaves) {

            // Update rows one by one
            $objects = $this->setFormatter(ModelCriteria::FORMAT_OBJECT)->find($con);
            foreach ($objects as $object) {
                foreach ($values as $key => $value) {
                    $object->setByName($key, $value);
                }
            }
            $objects->save($con);
            $affectedRows = count($objects);

        } else {

            // update rows in a single query
            $set = new Criteria($this->getDbName());
            foreach ($values as $columnName => $value) {
                $realColumnName = $this->getTableMap()->getColumnByPhpName($columnName)->getFullyQualifiedName();
                $set->add($realColumnName, $value);
            }
            $affectedRows = BasePeer::doUpdate($this, $set, $con);
            call_user_func(array($this->modelPeerName, 'clearInstancePool'));
            call_user_func(array($this->modelPeerName, 'clearRelatedInstancePool'));
        }

        return $affectedRows;
    }

    /**
     * Creates a Criterion object based on a list of existing condition names and a comparator
     *
     * @param array  $conditions The list of condition names, e.g. array('cond1', 'cond2')
     * @param string $operator   An operator, Criteria::LOGICAL_AND (default) or Criteria::LOGICAL_OR
     *
     * @return Criterion a Criterion or ModelCriterion object
     */
    protected function getCriterionForConditions($conditions, $operator = null)
    {
        $operator = (null === $operator) ? Criteria::LOGICAL_AND : $operator;
        $this->combine($conditions, $operator, 'propel_temp_name');
        $criterion = $this->namedCriterions['propel_temp_name'];
        unset($this->namedCriterions['propel_temp_name']);

        return $criterion;
    }

    /**
     * Creates a Criterion object based on a SQL clause and a value
     * Uses introspection to translate the column phpName into a fully qualified name
     *
     * @param string $clause The pseudo SQL clause, e.g. 'AuthorId = ?'
     * @param mixed  $value  A value for the condition
     * @param string $bindingType
     *
     * @return Criterion a Criterion or ModelCriterion object
     *
     * @throws PropelException
     */
    protected function getCriterionForClause($clause, $value, $bindingType = null)
    {
        $clause = trim($clause);
        if ($this->replaceNames($clause)) {
            // at least one column name was found and replaced in the clause
            // this is enough to determine the type to bind the parameter to
            if (null !== $bindingType) {
                $operator = ModelCriteria::MODEL_CLAUSE_RAW;
            } elseif (preg_match('/IN \?$/i', $clause) !== 0) {
                $operator = ModelCriteria::MODEL_CLAUSE_ARRAY;
            } elseif (preg_match('/LIKE \?$/i', $clause) !== 0) {
                $operator = ModelCriteria::MODEL_CLAUSE_LIKE;
            } elseif (substr_count($clause, '?') > 1) {
                $operator = ModelCriteria::MODEL_CLAUSE_SEVERAL;
            } else {
                $operator = ModelCriteria::MODEL_CLAUSE;
            }
            $colMap = $this->replacedColumns[0];
            $value = $this->convertValueForColumn($value, $colMap);
            $criterion = new ModelCriterion($this, $colMap, $value, $operator, $clause, $bindingType);
            if ($this->currentAlias != '') {
                $criterion->setTable($this->currentAlias);
            }
        } else {
            // no column match in clause, must be an expression like '1=1'
            if (strpos($clause, '?') !== false) {
                if (null === $bindingType) {
                    throw new PropelException("Cannot determine the column to bind to the parameter in clause '$clause'");
                }
                $criterion = new Criterion($this, $clause, $value, Criteria::RAW, $bindingType);
            } else {
                $criterion = new Criterion($this, null, $clause, Criteria::CUSTOM);
            }

        }

        return $criterion;
    }

    /**
     * Converts value for some column types
     *
     * @param  mixed     $value  The value to convert
     * @param  ColumnMap $colMap The ColumnMap object
     * @return mixed     The converted value
     */
    protected function convertValueForColumn($value, ColumnMap $colMap)
    {
        if ($colMap->getType() == 'OBJECT' && is_object($value)) {
            if (is_array($value)) {
                $value = array_map('serialize', $value);
            } else {
                $value = serialize($value);
            }
        } elseif ($colMap->getType() == 'ARRAY' && is_array($value)) {
            $value = '| ' . implode(' | ', $value) . ' |';
        } elseif ($colMap->getType() == 'ENUM') {
            if (is_array($value)) {
                $value = array_map(array($colMap, 'getValueSetKey'), $value);
            } else {
                $value = $colMap->getValueSetKey($value);
            }
        }

        return $value;
    }

    /**
     * Replaces complete column names (like Article.AuthorId) in an SQL clause
     * by their exact Propel column fully qualified name (e.g. article.AUTHOR_ID)
     * but ignores the column names inside quotes
     * e.g. 'CONCAT(Book.Title, "Book.Title") = ?'
     *   => 'CONCAT(book.TITLE, "Book.Title") = ?'
     *
     * @param string $clause SQL clause to inspect (modified by the method)
     *
     * @return boolean Whether the method managed to find and replace at least one column name
     */
    protected function replaceNames(&$clause)
    {
        $this->replacedColumns = array();
        $this->currentAlias = '';
        $this->foundMatch = false;
        $isAfterBackslash = false;
        $isInString = false;
        $stringQuotes = '';
        $parsedString = '';
        $stringToTransform = '';
        $len = strlen($clause);
        $pos = 0;
        while ($pos < $len) {
            $char = $clause[$pos];
            // check flags for strings or escaper
            switch ($char) {
                case "\\":
                    $isAfterBackslash = true;
                    break;
                case "'":
                case "\"":
                    if ($isInString && $stringQuotes == $char) {
                        if (!$isAfterBackslash) {
                            $isInString = false;
                        }
                    } elseif (!$isInString) {
                        $parsedString .= preg_replace_callback("/[\w\\\]+\.\w+/", array($this, 'doReplaceNameInExpression'), $stringToTransform);
                        $stringToTransform = '';
                        $stringQuotes = $char;
                        $isInString = true;
                    }
                    break;
            }
            if ($char !== "\\") {
                $isAfterBackslash = false;
            }
            if ($isInString) {
                $parsedString .= $char;
            } else {
                $stringToTransform .= $char;
            }
            $pos++;
        }
        if ($stringToTransform) {
            $parsedString .= preg_replace_callback("/[\w\\\]+\.\w+/", array($this, 'doReplaceNameInExpression'), $stringToTransform);
        }

        $clause = $parsedString;

        return $this->foundMatch;
    }

    /**
     * Callback function to replace column names by their real name in a clause
     * e.g.  'Book.Title IN ?'
     *    => 'book.TITLE IN ?'
     *
     * @param array $matches Matches found by preg_replace_callback
     *
     * @return string the column name replacement
     */
    protected function doReplaceNameInExpression($matches)
    {
        $key = $matches[0];
        list($column, $realColumnName) = $this->getColumnFromName($key);
        if ($column instanceof ColumnMap) {
            $this->replacedColumns[]= $column;
            $this->foundMatch = true;

            return $realColumnName;
        } else {
            return $key;
        }
    }

    /**
     * Finds a column and a SQL translation for a pseudo SQL column name
     * Respects table aliases previously registered in a join() or addAlias()
     * Examples:
     * <code>
     * $c->getColumnFromName('Book.Title');
     *   => array($bookTitleColumnMap, 'book.TITLE')
     * $c->join('Book.Author a')
     *   ->getColumnFromName('a.FirstName');
     *   => array($authorFirstNameColumnMap, 'a.FIRST_NAME')
     * </code>
     *
     * @param string $phpName String representing the column name in a pseudo SQL clause, e.g. 'Book.Title'
     * @param boolean $failSilently
     *
     * @return array List($columnMap, $realColumnName)
     *
     * @throws PropelException
     */
    protected function getColumnFromName($phpName, $failSilently = true)
    {
        if (strpos($phpName, '.') === false) {
            $prefix = $this->getModelAliasOrName();
        } else {
            // $prefix could be either class name or table name
            list($prefix, $phpName) = explode('.', $phpName);
        }

        if ($prefix == $this->getModelAliasOrName() || $prefix == $this->getTableMap()->getName()) {
            // column of the Criteria's model, or column name from Criteria's peer
            $tableMap = $this->getTableMap();
        } elseif (isset($this->joins[$prefix])) {
            // column of a relations's model
            $tableMap = $this->joins[$prefix]->getTableMap();
        } elseif ($this->hasSelectQuery($prefix)) {
            return $this->getColumnFromSubQuery($prefix, $phpName, $failSilently);
        } elseif ($failSilently) {
            return array(null, null);
        } else {
            throw new PropelException(sprintf('Unknown model, alias or table "%s"', $prefix));
        }

        if ($tableMap->hasColumnByPhpName($phpName)) {
            $column = $tableMap->getColumnByPhpName($phpName);
            if (isset($this->aliases[$prefix])) {
                $this->currentAlias = $prefix;
                $realColumnName = $prefix . '.' . $column->getName();
            } else {
                $realColumnName = $column->getFullyQualifiedName();
            }

            return array($column, $realColumnName);
        } elseif ($tableMap->hasColumn($phpName,false)) {
            $column = $tableMap->getColumn($phpName,false);
            $realColumnName = $column->getFullyQualifiedName();

            return array($column, $realColumnName);
        } elseif (isset($this->asColumns[$phpName])) {
            // aliased column
            return array(null, $phpName);
        } elseif ($tableMap->hasColumnByInsensitiveCase($phpName)) {
            $column = $tableMap->getColumnByInsensitiveCase($phpName);
            $realColumnName = $column->getFullyQualifiedName();

            return array($column, $realColumnName);
        } elseif ($failSilently) {
            return array(null, null);
        } else {
            throw new PropelException(sprintf('Unknown column "%s" on model, alias or table "%s"', $phpName, $prefix));
        }
    }

    /**
     * Special case for subquery columns
     *
     * @param string $class
     * @param string $phpName
     * @param boolean $failSilently
     *
     * @return array List($columnMap, $realColumnName)
     *
     * @throws PropelException
     */
    protected function getColumnFromSubQuery($class, $phpName, $failSilently = true)
    {
        $subQueryCriteria = $this->getSelectQuery($class);
        $tableMap = $subQueryCriteria->getTableMap();
        if ($tableMap->hasColumnByPhpName($phpName)) {
            $column = $tableMap->getColumnByPhpName($phpName);
            $realColumnName = $class . '.' . $column->getName();

            return array($column, $realColumnName);
        } elseif (isset($subQueryCriteria->asColumns[$phpName])) {
            // aliased column
            return array(null, $class . '.' . $phpName);
        } elseif ($failSilently) {
            return array(null, null);
        } else {
            throw new PropelException(sprintf('Unknown column "%s" in the subQuery with alias "%s"', $phpName, $class));
        }
    }

    /**
     * Return a fully qualified column name corresponding to a simple column phpName
     * Uses model alias if it exists
     * Warning: restricted to the columns of the main model
     * e.g. => 'Title' => 'book.TITLE'
     *
     * @param string $columnName the Column phpName, without the table name
     *
     * @return string the fully qualified column name
     *
     * @throws PropelException
     */
    protected function getRealColumnName($columnName)
    {
        if (!$this->getTableMap()->hasColumnByPhpName($columnName)) {
            throw new PropelException('Unknown column ' . $columnName . ' in model ' . $this->modelName);
        }
        if ($this->useAliasInSQL) {
            return $this->modelAlias . '.' . $this->getTableMap()->getColumnByPhpName($columnName)->getName();
        } else {
            return $this->getTableMap()->getColumnByPhpName($columnName)->getFullyQualifiedName();
        }
    }

    /**
     * Changes the table part of a a fully qualified column name if a true model alias exists
     * e.g. => 'book.TITLE' => 'b.TITLE'
     * This is for use as first argument of Criteria::add()
     *
     * @param string $colName the fully qualified column name, e.g 'book.TITLE' or BookPeer::TITLE
     *
     * @return string the fully qualified column name, using table alias if applicatble
     */
    public function getAliasedColName($colName)
    {
        if ($this->useAliasInSQL) {
            return $this->modelAlias . substr($colName, strrpos($colName, '.'));
        } else {
            return $colName;
        }
    }

    /**
     * Overrides Criteria::add() to force the use of a true table alias if it exists
     *
     * @see        Criteria::add()
     * @param string $column   The colName of column to run the condition on (e.g. BookPeer::ID)
     * @param mixed  $value
     * @param string $operator A String, like Criteria::EQUAL.
     *
     * @return ModelCriteria A modified Criteria object.
     */
    public function addUsingAlias($column, $value = null, $operator = null)
    {
        return $this->addUsingOperator($this->getAliasedColName($column), $value, $operator);
    }

    /**
     * Get all the parameters to bind to this criteria
     * Does part of the job of BasePeer::createSelectSql() for the cache
     *
     * @return array list of parameters, each parameter being an array like
     *                  array('table' => $realtable, 'column' => $column, 'value' => $value)
     */
    public function getParams()
    {
        $params = array();
        $dbMap = Propel::getDatabaseMap($this->getDbName());

        foreach ($this->getMap() as $criterion) {

            $table = null;
            foreach ($criterion->getAttachedCriterion() as $attachedCriterion) {
                $tableName = $attachedCriterion->getTable();

                $table = $this->getTableForAlias($tableName);
                if (null === $table) {
                    $table = $tableName;
                }

                if (($this->isIgnoreCase() || $attachedCriterion->isIgnoreCase())
                && $dbMap->getTable($table)->getColumn($attachedCriterion->getColumn())->isText()) {
                    $attachedCriterion->setIgnoreCase(true);
                }
            }

            $sb = '';
            $criterion->appendPsTo($sb, $params);
        }

        $having = $this->getHaving();
        if ($having !== null) {
            $sb = '';
            $having->appendPsTo($sb, $params);
        }

        return $params;
    }

    /**
     * Handle the magic
     * Supports findByXXX(), findOneByXXX(), filterByXXX(), orderByXXX(), and groupByXXX() methods,
     * where XXX is a column phpName.
     * Supports XXXJoin(), where XXX is a join direction (in 'left', 'right', 'inner')
     */
    public function __call($name, $arguments)
    {
        // Maybe it's a magic call to one of the methods supporting it, e.g. 'findByTitle'
        static $methods = array('findBy', 'findOneBy', 'filterBy', 'orderBy', 'groupBy');
        foreach ($methods as $method) {
            if (strpos($name, $method) === 0) {
                $columns = substr($name, strlen($method));
                if (in_array($method, array('findBy', 'findOneBy')) && strpos($columns, 'And') !== false) {
                    $method = $method . 'Array';
                    $columns = explode('And', $columns);
                    $conditions = array();
                    foreach ($columns as $column) {
                        $conditions[$column] = array_shift($arguments);
                    }
                    array_unshift($arguments, $conditions);
                } else {
                    array_unshift($arguments, $columns);
                }

                return call_user_func_array(array($this, $method), $arguments);
            }
        }

        // Maybe it's a magic call to a qualified joinWith method, e.g. 'leftJoinWith' or 'joinWithAuthor'
        if (($pos = stripos($name, 'joinWith')) !== false) {
            $type = substr($name, 0, $pos);
            if (in_array($type, array('left', 'right', 'inner'))) {
                $joinType = strtoupper($type) . ' JOIN';
            } else {
                $joinType = Criteria::INNER_JOIN;
            }
            if (!$relation = substr($name, $pos + 8)) {
                $relation = $arguments[0];
            }

            return $this->joinWith($relation, $joinType);
        }

        // Maybe it's a magic call to a qualified join method, e.g. 'leftJoin'
        if (($pos = strpos($name, 'Join')) > 0) {
            $type = substr($name, 0, $pos);
            if (in_array($type, array('left', 'right', 'inner'))) {
                $joinType = strtoupper($type) . ' JOIN';
                // Test if first argument is suplied, else don't provide an alias to joinXXX (default value)
                if (!isset($arguments[0])) {
                    $arguments[0] = null;
                }
                array_push($arguments, $joinType);
                $method = substr($name, $pos);
                // no lcfirst in php<5.3...
                $method[0] = strtolower($method[0]);

                return call_user_func_array(array($this, $method), $arguments);
            }
        }

        throw new PropelException(sprintf('Undefined method %s::%s()', __CLASS__, $name));
    }

    /**
     * Ensures deep cloning of attached objects
     */
    public function __clone()
    {
        parent::__clone();
        foreach ($this->with as $key => $join) {
            $this->with[$key] = clone $join;
        }
        if (null !== $this->formatter) {
            $this->formatter = clone $this->formatter;
        }
    }

    /**
     * Make explain plan of the query
     *
     * @param  PropelPDO       $con propel connection
     * @throws PropelException on error
     * @return array           array of the explain plan
     */
    public function explain($con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName());
        }
        $this->basePreSelect($con);

        // check that the columns of the main class are already added (if this is the primary ModelCriteria)
        if (!$this->hasSelectClause() && !$this->getPrimaryCriteria()) {
            $this->addSelfSelectColumns();
        }
        $this->configureSelectColumns();

        $db = Propel::getDB($this->getDbName());
        try {
            $stmt = $db->doExplainPlan($con, $this);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException('Unable to execute query explain plan', $e);
        }
    }

    /**
     * @param  PropelPDO $con = null
     * @return boolean
     */
    public function exists($con = null)
    {
        return 0 !== $this->count($con);
    }
}
