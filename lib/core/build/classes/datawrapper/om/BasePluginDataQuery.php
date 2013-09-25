<?php


/**
 * Base class that represents a query for the 'plugin_data' table.
 *
 *
 *
 * @method PluginDataQuery orderById($order = Criteria::ASC) Order by the id column
 * @method PluginDataQuery orderByPluginId($order = Criteria::ASC) Order by the plugin_id column
 * @method PluginDataQuery orderByStoredAt($order = Criteria::ASC) Order by the stored_at column
 * @method PluginDataQuery orderByKey($order = Criteria::ASC) Order by the key column
 * @method PluginDataQuery orderByData($order = Criteria::ASC) Order by the data column
 *
 * @method PluginDataQuery groupById() Group by the id column
 * @method PluginDataQuery groupByPluginId() Group by the plugin_id column
 * @method PluginDataQuery groupByStoredAt() Group by the stored_at column
 * @method PluginDataQuery groupByKey() Group by the key column
 * @method PluginDataQuery groupByData() Group by the data column
 *
 * @method PluginDataQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method PluginDataQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method PluginDataQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method PluginDataQuery leftJoinPlugin($relationAlias = null) Adds a LEFT JOIN clause to the query using the Plugin relation
 * @method PluginDataQuery rightJoinPlugin($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Plugin relation
 * @method PluginDataQuery innerJoinPlugin($relationAlias = null) Adds a INNER JOIN clause to the query using the Plugin relation
 *
 * @method PluginData findOne(PropelPDO $con = null) Return the first PluginData matching the query
 * @method PluginData findOneOrCreate(PropelPDO $con = null) Return the first PluginData matching the query, or a new PluginData object populated from the query conditions when no match is found
 *
 * @method PluginData findOneByPluginId(string $plugin_id) Return the first PluginData filtered by the plugin_id column
 * @method PluginData findOneByStoredAt(string $stored_at) Return the first PluginData filtered by the stored_at column
 * @method PluginData findOneByKey(string $key) Return the first PluginData filtered by the key column
 * @method PluginData findOneByData(string $data) Return the first PluginData filtered by the data column
 *
 * @method array findById(int $id) Return PluginData objects filtered by the id column
 * @method array findByPluginId(string $plugin_id) Return PluginData objects filtered by the plugin_id column
 * @method array findByStoredAt(string $stored_at) Return PluginData objects filtered by the stored_at column
 * @method array findByKey(string $key) Return PluginData objects filtered by the key column
 * @method array findByData(string $data) Return PluginData objects filtered by the data column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BasePluginDataQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BasePluginDataQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'PluginData', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new PluginDataQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   PluginDataQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return PluginDataQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof PluginDataQuery) {
            return $criteria;
        }
        $query = new PluginDataQuery();
        if (null !== $modelAlias) {
            $query->setModelAlias($modelAlias);
        }
        if ($criteria instanceof Criteria) {
            $query->mergeWith($criteria);
        }

        return $query;
    }

    /**
     * Find object by primary key.
     * Propel uses the instance pool to skip the database if the object exists.
     * Go fast if the query is untouched.
     *
     * <code>
     * $obj  = $c->findPk(12, $con);
     * </code>
     *
     * @param mixed $key Primary key to use for the query
     * @param     PropelPDO $con an optional connection object
     *
     * @return   PluginData|PluginData[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = PluginDataPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(PluginDataPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }
        $this->basePreSelect($con);
        if ($this->formatter || $this->modelAlias || $this->with || $this->select
         || $this->selectColumns || $this->asColumns || $this->selectModifiers
         || $this->map || $this->having || $this->joins) {
            return $this->findPkComplex($key, $con);
        } else {
            return $this->findPkSimple($key, $con);
        }
    }

    /**
     * Alias of findPk to use instance pooling
     *
     * @param     mixed $key Primary key to use for the query
     * @param     PropelPDO $con A connection object
     *
     * @return                 PluginData A model object, or null if the key is not found
     * @throws PropelException
     */
     public function findOneById($key, $con = null)
     {
        return $this->findPk($key, $con);
     }

    /**
     * Find object by primary key using raw SQL to go fast.
     * Bypass doSelect() and the object formatter by using generated code.
     *
     * @param     mixed $key Primary key to use for the query
     * @param     PropelPDO $con A connection object
     *
     * @return                 PluginData A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `id`, `plugin_id`, `stored_at`, `key`, `data` FROM `plugin_data` WHERE `id` = :p0';
        try {
            $stmt = $con->prepare($sql);
            $stmt->bindValue(':p0', $key, PDO::PARAM_INT);
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute SELECT statement [%s]', $sql), $e);
        }
        $obj = null;
        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $obj = new PluginData();
            $obj->hydrate($row);
            PluginDataPeer::addInstanceToPool($obj, (string) $key);
        }
        $stmt->closeCursor();

        return $obj;
    }

    /**
     * Find object by primary key.
     *
     * @param     mixed $key Primary key to use for the query
     * @param     PropelPDO $con A connection object
     *
     * @return PluginData|PluginData[]|mixed the result, formatted by the current formatter
     */
    protected function findPkComplex($key, $con)
    {
        // As the query uses a PK condition, no limit(1) is necessary.
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $stmt = $criteria
            ->filterByPrimaryKey($key)
            ->doSelect($con);

        return $criteria->getFormatter()->init($criteria)->formatOne($stmt);
    }

    /**
     * Find objects by primary key
     * <code>
     * $objs = $c->findPks(array(12, 56, 832), $con);
     * </code>
     * @param     array $keys Primary keys to use for the query
     * @param     PropelPDO $con an optional connection object
     *
     * @return PropelObjectCollection|PluginData[]|mixed the list of results, formatted by the current formatter
     */
    public function findPks($keys, $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection($this->getDbName(), Propel::CONNECTION_READ);
        }
        $this->basePreSelect($con);
        $criteria = $this->isKeepQuery() ? clone $this : $this;
        $stmt = $criteria
            ->filterByPrimaryKeys($keys)
            ->doSelect($con);

        return $criteria->getFormatter()->init($criteria)->format($stmt);
    }

    /**
     * Filter the query by primary key
     *
     * @param     mixed $key Primary key to use for the query
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(PluginDataPeer::ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(PluginDataPeer::ID, $keys, Criteria::IN);
    }

    /**
     * Filter the query on the id column
     *
     * Example usage:
     * <code>
     * $query->filterById(1234); // WHERE id = 1234
     * $query->filterById(array(12, 34)); // WHERE id IN (12, 34)
     * $query->filterById(array('min' => 12)); // WHERE id >= 12
     * $query->filterById(array('max' => 12)); // WHERE id <= 12
     * </code>
     *
     * @param     mixed $id The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function filterById($id = null, $comparison = null)
    {
        if (is_array($id)) {
            $useMinMax = false;
            if (isset($id['min'])) {
                $this->addUsingAlias(PluginDataPeer::ID, $id['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($id['max'])) {
                $this->addUsingAlias(PluginDataPeer::ID, $id['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(PluginDataPeer::ID, $id, $comparison);
    }

    /**
     * Filter the query on the plugin_id column
     *
     * Example usage:
     * <code>
     * $query->filterByPluginId('fooValue');   // WHERE plugin_id = 'fooValue'
     * $query->filterByPluginId('%fooValue%'); // WHERE plugin_id LIKE '%fooValue%'
     * </code>
     *
     * @param     string $pluginId The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function filterByPluginId($pluginId = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($pluginId)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $pluginId)) {
                $pluginId = str_replace('*', '%', $pluginId);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(PluginDataPeer::PLUGIN_ID, $pluginId, $comparison);
    }

    /**
     * Filter the query on the stored_at column
     *
     * Example usage:
     * <code>
     * $query->filterByStoredAt('2011-03-14'); // WHERE stored_at = '2011-03-14'
     * $query->filterByStoredAt('now'); // WHERE stored_at = '2011-03-14'
     * $query->filterByStoredAt(array('max' => 'yesterday')); // WHERE stored_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $storedAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function filterByStoredAt($storedAt = null, $comparison = null)
    {
        if (is_array($storedAt)) {
            $useMinMax = false;
            if (isset($storedAt['min'])) {
                $this->addUsingAlias(PluginDataPeer::STORED_AT, $storedAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($storedAt['max'])) {
                $this->addUsingAlias(PluginDataPeer::STORED_AT, $storedAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(PluginDataPeer::STORED_AT, $storedAt, $comparison);
    }

    /**
     * Filter the query on the key column
     *
     * Example usage:
     * <code>
     * $query->filterByKey('fooValue');   // WHERE key = 'fooValue'
     * $query->filterByKey('%fooValue%'); // WHERE key LIKE '%fooValue%'
     * </code>
     *
     * @param     string $key The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function filterByKey($key = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($key)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $key)) {
                $key = str_replace('*', '%', $key);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(PluginDataPeer::KEY, $key, $comparison);
    }

    /**
     * Filter the query on the data column
     *
     * Example usage:
     * <code>
     * $query->filterByData('fooValue');   // WHERE data = 'fooValue'
     * $query->filterByData('%fooValue%'); // WHERE data LIKE '%fooValue%'
     * </code>
     *
     * @param     string $data The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function filterByData($data = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($data)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $data)) {
                $data = str_replace('*', '%', $data);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(PluginDataPeer::DATA, $data, $comparison);
    }

    /**
     * Filter the query by a related Plugin object
     *
     * @param   Plugin|PropelObjectCollection $plugin The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 PluginDataQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByPlugin($plugin, $comparison = null)
    {
        if ($plugin instanceof Plugin) {
            return $this
                ->addUsingAlias(PluginDataPeer::PLUGIN_ID, $plugin->getId(), $comparison);
        } elseif ($plugin instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(PluginDataPeer::PLUGIN_ID, $plugin->toKeyValue('PrimaryKey', 'Id'), $comparison);
        } else {
            throw new PropelException('filterByPlugin() only accepts arguments of type Plugin or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the Plugin relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function joinPlugin($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('Plugin');

        // create a ModelJoin object for this join
        $join = new ModelJoin();
        $join->setJoinType($joinType);
        $join->setRelationMap($relationMap, $this->useAliasInSQL ? $this->getModelAlias() : null, $relationAlias);
        if ($previousJoin = $this->getPreviousJoin()) {
            $join->setPreviousJoin($previousJoin);
        }

        // add the ModelJoin to the current object
        if ($relationAlias) {
            $this->addAlias($relationAlias, $relationMap->getRightTable()->getName());
            $this->addJoinObject($join, $relationAlias);
        } else {
            $this->addJoinObject($join, 'Plugin');
        }

        return $this;
    }

    /**
     * Use the Plugin relation Plugin object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   PluginQuery A secondary query class using the current class as primary query
     */
    public function usePluginQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinPlugin($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'Plugin', 'PluginQuery');
    }

    /**
     * Exclude object from result
     *
     * @param   PluginData $pluginData Object to remove from the list of results
     *
     * @return PluginDataQuery The current query, for fluid interface
     */
    public function prune($pluginData = null)
    {
        if ($pluginData) {
            $this->addUsingAlias(PluginDataPeer::ID, $pluginData->getId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
