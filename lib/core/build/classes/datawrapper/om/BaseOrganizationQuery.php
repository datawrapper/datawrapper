<?php


/**
 * Base class that represents a query for the 'organization' table.
 *
 *
 *
 * @method OrganizationQuery orderById($order = Criteria::ASC) Order by the id column
 * @method OrganizationQuery orderByName($order = Criteria::ASC) Order by the name column
 * @method OrganizationQuery orderByCreatedAt($order = Criteria::ASC) Order by the created_at column
 * @method OrganizationQuery orderByDeleted($order = Criteria::ASC) Order by the deleted column
 *
 * @method OrganizationQuery groupById() Group by the id column
 * @method OrganizationQuery groupByName() Group by the name column
 * @method OrganizationQuery groupByCreatedAt() Group by the created_at column
 * @method OrganizationQuery groupByDeleted() Group by the deleted column
 *
 * @method OrganizationQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method OrganizationQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method OrganizationQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method OrganizationQuery leftJoinChart($relationAlias = null) Adds a LEFT JOIN clause to the query using the Chart relation
 * @method OrganizationQuery rightJoinChart($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Chart relation
 * @method OrganizationQuery innerJoinChart($relationAlias = null) Adds a INNER JOIN clause to the query using the Chart relation
 *
 * @method OrganizationQuery leftJoinUserOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the UserOrganization relation
 * @method OrganizationQuery rightJoinUserOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the UserOrganization relation
 * @method OrganizationQuery innerJoinUserOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the UserOrganization relation
 *
 * @method OrganizationQuery leftJoinPluginOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the PluginOrganization relation
 * @method OrganizationQuery rightJoinPluginOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the PluginOrganization relation
 * @method OrganizationQuery innerJoinPluginOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the PluginOrganization relation
 *
 * @method Organization findOne(PropelPDO $con = null) Return the first Organization matching the query
 * @method Organization findOneOrCreate(PropelPDO $con = null) Return the first Organization matching the query, or a new Organization object populated from the query conditions when no match is found
 *
 * @method Organization findOneByName(string $name) Return the first Organization filtered by the name column
 * @method Organization findOneByCreatedAt(string $created_at) Return the first Organization filtered by the created_at column
 * @method Organization findOneByDeleted(boolean $deleted) Return the first Organization filtered by the deleted column
 *
 * @method array findById(string $id) Return Organization objects filtered by the id column
 * @method array findByName(string $name) Return Organization objects filtered by the name column
 * @method array findByCreatedAt(string $created_at) Return Organization objects filtered by the created_at column
 * @method array findByDeleted(boolean $deleted) Return Organization objects filtered by the deleted column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseOrganizationQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseOrganizationQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'Organization', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new OrganizationQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   OrganizationQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return OrganizationQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof OrganizationQuery) {
            return $criteria;
        }
        $query = new OrganizationQuery();
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
     * @return   Organization|Organization[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = OrganizationPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(OrganizationPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 Organization A model object, or null if the key is not found
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
     * @return                 Organization A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `id`, `name`, `created_at`, `deleted` FROM `organization` WHERE `id` = :p0';
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
            $obj = new Organization();
            $obj->hydrate($row);
            OrganizationPeer::addInstanceToPool($obj, (string) $key);
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
     * @return Organization|Organization[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|Organization[]|mixed the list of results, formatted by the current formatter
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
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(OrganizationPeer::ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(OrganizationPeer::ID, $keys, Criteria::IN);
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
     * @return OrganizationQuery The current query, for fluid interface
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

        return $this->addUsingAlias(OrganizationPeer::ID, $id, $comparison);
    }

    /**
     * Filter the query on the name column
     *
     * Example usage:
     * <code>
     * $query->filterByName('fooValue');   // WHERE name = 'fooValue'
     * $query->filterByName('%fooValue%'); // WHERE name LIKE '%fooValue%'
     * </code>
     *
     * @param     string $name The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function filterByName($name = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($name)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $name)) {
                $name = str_replace('*', '%', $name);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(OrganizationPeer::NAME, $name, $comparison);
    }

    /**
     * Filter the query on the created_at column
     *
     * Example usage:
     * <code>
     * $query->filterByCreatedAt('2011-03-14'); // WHERE created_at = '2011-03-14'
     * $query->filterByCreatedAt('now'); // WHERE created_at = '2011-03-14'
     * $query->filterByCreatedAt(array('max' => 'yesterday')); // WHERE created_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $createdAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function filterByCreatedAt($createdAt = null, $comparison = null)
    {
        if (is_array($createdAt)) {
            $useMinMax = false;
            if (isset($createdAt['min'])) {
                $this->addUsingAlias(OrganizationPeer::CREATED_AT, $createdAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($createdAt['max'])) {
                $this->addUsingAlias(OrganizationPeer::CREATED_AT, $createdAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(OrganizationPeer::CREATED_AT, $createdAt, $comparison);
    }

    /**
     * Filter the query on the deleted column
     *
     * Example usage:
     * <code>
     * $query->filterByDeleted(true); // WHERE deleted = true
     * $query->filterByDeleted('yes'); // WHERE deleted = true
     * </code>
     *
     * @param     boolean|string $deleted The value to use as filter.
     *              Non-boolean arguments are converted using the following rules:
     *                * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *                * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     *              Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function filterByDeleted($deleted = null, $comparison = null)
    {
        if (is_string($deleted)) {
            $deleted = in_array(strtolower($deleted), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
        }

        return $this->addUsingAlias(OrganizationPeer::DELETED, $deleted, $comparison);
    }

    /**
     * Filter the query by a related Chart object
     *
     * @param   Chart|PropelObjectCollection $chart  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChart($chart, $comparison = null)
    {
        if ($chart instanceof Chart) {
            return $this
                ->addUsingAlias(OrganizationPeer::ID, $chart->getOrganizationId(), $comparison);
        } elseif ($chart instanceof PropelObjectCollection) {
            return $this
                ->useChartQuery()
                ->filterByPrimaryKeys($chart->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByChart() only accepts arguments of type Chart or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the Chart relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function joinChart($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('Chart');

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
            $this->addJoinObject($join, 'Chart');
        }

        return $this;
    }

    /**
     * Use the Chart relation Chart object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   ChartQuery A secondary query class using the current class as primary query
     */
    public function useChartQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinChart($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'Chart', 'ChartQuery');
    }

    /**
     * Filter the query by a related UserOrganization object
     *
     * @param   UserOrganization|PropelObjectCollection $userOrganization  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUserOrganization($userOrganization, $comparison = null)
    {
        if ($userOrganization instanceof UserOrganization) {
            return $this
                ->addUsingAlias(OrganizationPeer::ID, $userOrganization->getOrganizationId(), $comparison);
        } elseif ($userOrganization instanceof PropelObjectCollection) {
            return $this
                ->useUserOrganizationQuery()
                ->filterByPrimaryKeys($userOrganization->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByUserOrganization() only accepts arguments of type UserOrganization or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the UserOrganization relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function joinUserOrganization($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('UserOrganization');

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
            $this->addJoinObject($join, 'UserOrganization');
        }

        return $this;
    }

    /**
     * Use the UserOrganization relation UserOrganization object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   UserOrganizationQuery A secondary query class using the current class as primary query
     */
    public function useUserOrganizationQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinUserOrganization($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'UserOrganization', 'UserOrganizationQuery');
    }

    /**
     * Filter the query by a related PluginOrganization object
     *
     * @param   PluginOrganization|PropelObjectCollection $pluginOrganization  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByPluginOrganization($pluginOrganization, $comparison = null)
    {
        if ($pluginOrganization instanceof PluginOrganization) {
            return $this
                ->addUsingAlias(OrganizationPeer::ID, $pluginOrganization->getOrganizationId(), $comparison);
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
     * @return OrganizationQuery The current query, for fluid interface
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
     * Filter the query by a related User object
     * using the user_organization table as cross reference
     *
     * @param   User $user the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   OrganizationQuery The current query, for fluid interface
     */
    public function filterByUser($user, $comparison = Criteria::EQUAL)
    {
        return $this
            ->useUserOrganizationQuery()
            ->filterByUser($user, $comparison)
            ->endUse();
    }

    /**
     * Filter the query by a related Plugin object
     * using the plugin_organization table as cross reference
     *
     * @param   Plugin $plugin the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   OrganizationQuery The current query, for fluid interface
     */
    public function filterByPlugin($plugin, $comparison = Criteria::EQUAL)
    {
        return $this
            ->usePluginOrganizationQuery()
            ->filterByPlugin($plugin, $comparison)
            ->endUse();
    }

    /**
     * Exclude object from result
     *
     * @param   Organization $organization Object to remove from the list of results
     *
     * @return OrganizationQuery The current query, for fluid interface
     */
    public function prune($organization = null)
    {
        if ($organization) {
            $this->addUsingAlias(OrganizationPeer::ID, $organization->getId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
