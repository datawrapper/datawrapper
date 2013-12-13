<?php


/**
 * Base class that represents a query for the 'plugin' table.
 *
 *
 *
 * @method PluginQuery orderById($order = Criteria::ASC) Order by the id column
 * @method PluginQuery orderByInstalledAt($order = Criteria::ASC) Order by the installed_at column
 * @method PluginQuery orderByEnabled($order = Criteria::ASC) Order by the enabled column
 * @method PluginQuery orderByIsPrivate($order = Criteria::ASC) Order by the is_private column
 *
 * @method PluginQuery groupById() Group by the id column
 * @method PluginQuery groupByInstalledAt() Group by the installed_at column
 * @method PluginQuery groupByEnabled() Group by the enabled column
 * @method PluginQuery groupByIsPrivate() Group by the is_private column
 *
 * @method PluginQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method PluginQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method PluginQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method PluginQuery leftJoinPluginOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the PluginOrganization relation
 * @method PluginQuery rightJoinPluginOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the PluginOrganization relation
 * @method PluginQuery innerJoinPluginOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the PluginOrganization relation
 *
 * @method PluginQuery leftJoinPluginData($relationAlias = null) Adds a LEFT JOIN clause to the query using the PluginData relation
 * @method PluginQuery rightJoinPluginData($relationAlias = null) Adds a RIGHT JOIN clause to the query using the PluginData relation
 * @method PluginQuery innerJoinPluginData($relationAlias = null) Adds a INNER JOIN clause to the query using the PluginData relation
 *
 * @method Plugin findOne(PropelPDO $con = null) Return the first Plugin matching the query
 * @method Plugin findOneOrCreate(PropelPDO $con = null) Return the first Plugin matching the query, or a new Plugin object populated from the query conditions when no match is found
 *
 * @method Plugin findOneByInstalledAt(string $installed_at) Return the first Plugin filtered by the installed_at column
 * @method Plugin findOneByEnabled(boolean $enabled) Return the first Plugin filtered by the enabled column
 * @method Plugin findOneByIsPrivate(boolean $is_private) Return the first Plugin filtered by the is_private column
 *
 * @method array findById(string $id) Return Plugin objects filtered by the id column
 * @method array findByInstalledAt(string $installed_at) Return Plugin objects filtered by the installed_at column
 * @method array findByEnabled(boolean $enabled) Return Plugin objects filtered by the enabled column
 * @method array findByIsPrivate(boolean $is_private) Return Plugin objects filtered by the is_private column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BasePluginQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BasePluginQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'Plugin', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new PluginQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   PluginQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return PluginQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof PluginQuery) {
            return $criteria;
        }
        $query = new PluginQuery();
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
     * @return   Plugin|Plugin[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = PluginPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(PluginPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 Plugin A model object, or null if the key is not found
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
     * @return                 Plugin A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `id`, `installed_at`, `enabled`, `is_private` FROM `plugin` WHERE `id` = :p0';
        try {
            $stmt = $con->prepare($sql);
            $stmt->bindValue(':p0', $key, PDO::PARAM_STR);
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute SELECT statement [%s]', $sql), $e);
        }
        $obj = null;
        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $obj = new Plugin();
            $obj->hydrate($row);
            PluginPeer::addInstanceToPool($obj, (string) $key);
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
     * @return Plugin|Plugin[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|Plugin[]|mixed the list of results, formatted by the current formatter
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
     * @return PluginQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(PluginPeer::ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(PluginPeer::ID, $keys, Criteria::IN);
    }

    /**
     * Filter the query on the id column
     *
     * Example usage:
     * <code>
     * $query->filterById('fooValue');   // WHERE id = 'fooValue'
     * $query->filterById('%fooValue%'); // WHERE id LIKE '%fooValue%'
     * </code>
     *
     * @param     string $id The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function filterById($id = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($id)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $id)) {
                $id = str_replace('*', '%', $id);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(PluginPeer::ID, $id, $comparison);
    }

    /**
     * Filter the query on the installed_at column
     *
     * Example usage:
     * <code>
     * $query->filterByInstalledAt('2011-03-14'); // WHERE installed_at = '2011-03-14'
     * $query->filterByInstalledAt('now'); // WHERE installed_at = '2011-03-14'
     * $query->filterByInstalledAt(array('max' => 'yesterday')); // WHERE installed_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $installedAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function filterByInstalledAt($installedAt = null, $comparison = null)
    {
        if (is_array($installedAt)) {
            $useMinMax = false;
            if (isset($installedAt['min'])) {
                $this->addUsingAlias(PluginPeer::INSTALLED_AT, $installedAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($installedAt['max'])) {
                $this->addUsingAlias(PluginPeer::INSTALLED_AT, $installedAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(PluginPeer::INSTALLED_AT, $installedAt, $comparison);
    }

    /**
     * Filter the query on the enabled column
     *
     * Example usage:
     * <code>
     * $query->filterByEnabled(true); // WHERE enabled = true
     * $query->filterByEnabled('yes'); // WHERE enabled = true
     * </code>
     *
     * @param     boolean|string $enabled The value to use as filter.
     *              Non-boolean arguments are converted using the following rules:
     *                * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *                * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     *              Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function filterByEnabled($enabled = null, $comparison = null)
    {
        if (is_string($enabled)) {
            $enabled = in_array(strtolower($enabled), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
        }

        return $this->addUsingAlias(PluginPeer::ENABLED, $enabled, $comparison);
    }

    /**
     * Filter the query on the is_private column
     *
     * Example usage:
     * <code>
     * $query->filterByIsPrivate(true); // WHERE is_private = true
     * $query->filterByIsPrivate('yes'); // WHERE is_private = true
     * </code>
     *
     * @param     boolean|string $isPrivate The value to use as filter.
     *              Non-boolean arguments are converted using the following rules:
     *                * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *                * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     *              Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function filterByIsPrivate($isPrivate = null, $comparison = null)
    {
        if (is_string($isPrivate)) {
            $isPrivate = in_array(strtolower($isPrivate), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
        }

        return $this->addUsingAlias(PluginPeer::IS_PRIVATE, $isPrivate, $comparison);
    }

    /**
     * Filter the query by a related PluginOrganization object
     *
     * @param   PluginOrganization|PropelObjectCollection $pluginOrganization  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 PluginQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByPluginOrganization($pluginOrganization, $comparison = null)
    {
        if ($pluginOrganization instanceof PluginOrganization) {
            return $this
                ->addUsingAlias(PluginPeer::ID, $pluginOrganization->getPluginId(), $comparison);
        } elseif ($pluginOrganization instanceof PropelObjectCollection) {
            return $this
                ->usePluginOrganizationQuery()
                ->filterByPrimaryKeys($pluginOrganization->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByPluginOrganization() only accepts arguments of type PluginOrganization or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the PluginOrganization relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function joinPluginOrganization($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('PluginOrganization');

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
            $this->addJoinObject($join, 'PluginOrganization');
        }

        return $this;
    }

    /**
     * Use the PluginOrganization relation PluginOrganization object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   PluginOrganizationQuery A secondary query class using the current class as primary query
     */
    public function usePluginOrganizationQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinPluginOrganization($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'PluginOrganization', 'PluginOrganizationQuery');
    }

    /**
     * Filter the query by a related PluginData object
     *
     * @param   PluginData|PropelObjectCollection $pluginData  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 PluginQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByPluginData($pluginData, $comparison = null)
    {
        if ($pluginData instanceof PluginData) {
            return $this
                ->addUsingAlias(PluginPeer::ID, $pluginData->getPluginId(), $comparison);
        } elseif ($pluginData instanceof PropelObjectCollection) {
            return $this
                ->usePluginDataQuery()
                ->filterByPrimaryKeys($pluginData->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByPluginData() only accepts arguments of type PluginData or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the PluginData relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function joinPluginData($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('PluginData');

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
            $this->addJoinObject($join, 'PluginData');
        }

        return $this;
    }

    /**
     * Use the PluginData relation PluginData object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   PluginDataQuery A secondary query class using the current class as primary query
     */
    public function usePluginDataQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinPluginData($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'PluginData', 'PluginDataQuery');
    }

    /**
     * Filter the query by a related Organization object
     * using the plugin_organization table as cross reference
     *
     * @param   Organization $organization the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   PluginQuery The current query, for fluid interface
     */
    public function filterByOrganization($organization, $comparison = Criteria::EQUAL)
    {
        return $this
            ->usePluginOrganizationQuery()
            ->filterByOrganization($organization, $comparison)
            ->endUse();
    }

    /**
     * Exclude object from result
     *
     * @param   Plugin $plugin Object to remove from the list of results
     *
     * @return PluginQuery The current query, for fluid interface
     */
    public function prune($plugin = null)
    {
        if ($plugin) {
            $this->addUsingAlias(PluginPeer::ID, $plugin->getId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
