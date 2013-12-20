<?php


/**
 * Base class that represents a query for the 'plugin_organization' table.
 *
 *
 *
 * @method PluginOrganizationQuery orderByPluginId($order = Criteria::ASC) Order by the plugin_id column
 * @method PluginOrganizationQuery orderByOrganizationId($order = Criteria::ASC) Order by the organization_id column
 *
 * @method PluginOrganizationQuery groupByPluginId() Group by the plugin_id column
 * @method PluginOrganizationQuery groupByOrganizationId() Group by the organization_id column
 *
 * @method PluginOrganizationQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method PluginOrganizationQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method PluginOrganizationQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method PluginOrganizationQuery leftJoinPlugin($relationAlias = null) Adds a LEFT JOIN clause to the query using the Plugin relation
 * @method PluginOrganizationQuery rightJoinPlugin($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Plugin relation
 * @method PluginOrganizationQuery innerJoinPlugin($relationAlias = null) Adds a INNER JOIN clause to the query using the Plugin relation
 *
 * @method PluginOrganizationQuery leftJoinOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the Organization relation
 * @method PluginOrganizationQuery rightJoinOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Organization relation
 * @method PluginOrganizationQuery innerJoinOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the Organization relation
 *
 * @method PluginOrganization findOne(PropelPDO $con = null) Return the first PluginOrganization matching the query
 * @method PluginOrganization findOneOrCreate(PropelPDO $con = null) Return the first PluginOrganization matching the query, or a new PluginOrganization object populated from the query conditions when no match is found
 *
 * @method PluginOrganization findOneByPluginId(string $plugin_id) Return the first PluginOrganization filtered by the plugin_id column
 * @method PluginOrganization findOneByOrganizationId(string $organization_id) Return the first PluginOrganization filtered by the organization_id column
 *
 * @method array findByPluginId(string $plugin_id) Return PluginOrganization objects filtered by the plugin_id column
 * @method array findByOrganizationId(string $organization_id) Return PluginOrganization objects filtered by the organization_id column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BasePluginOrganizationQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BasePluginOrganizationQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'PluginOrganization', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new PluginOrganizationQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   PluginOrganizationQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return PluginOrganizationQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof PluginOrganizationQuery) {
            return $criteria;
        }
        $query = new PluginOrganizationQuery();
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
     * $obj = $c->findPk(array(12, 34), $con);
     * </code>
     *
     * @param array $key Primary key to use for the query
                         A Primary key composition: [$plugin_id, $organization_id]
     * @param     PropelPDO $con an optional connection object
     *
     * @return   PluginOrganization|PluginOrganization[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = PluginOrganizationPeer::getInstanceFromPool(serialize(array((string) $key[0], (string) $key[1]))))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(PluginOrganizationPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * Find object by primary key using raw SQL to go fast.
     * Bypass doSelect() and the object formatter by using generated code.
     *
     * @param     mixed $key Primary key to use for the query
     * @param     PropelPDO $con A connection object
     *
     * @return                 PluginOrganization A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `plugin_id`, `organization_id` FROM `plugin_organization` WHERE `plugin_id` = :p0 AND `organization_id` = :p1';
        try {
            $stmt = $con->prepare($sql);
            $stmt->bindValue(':p0', $key[0], PDO::PARAM_STR);
            $stmt->bindValue(':p1', $key[1], PDO::PARAM_STR);
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute SELECT statement [%s]', $sql), $e);
        }
        $obj = null;
        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $obj = new PluginOrganization();
            $obj->hydrate($row);
            PluginOrganizationPeer::addInstanceToPool($obj, serialize(array((string) $key[0], (string) $key[1])));
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
     * @return PluginOrganization|PluginOrganization[]|mixed the result, formatted by the current formatter
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
     * $objs = $c->findPks(array(array(12, 56), array(832, 123), array(123, 456)), $con);
     * </code>
     * @param     array $keys Primary keys to use for the query
     * @param     PropelPDO $con an optional connection object
     *
     * @return PropelObjectCollection|PluginOrganization[]|mixed the list of results, formatted by the current formatter
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
     * @return PluginOrganizationQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {
        $this->addUsingAlias(PluginOrganizationPeer::PLUGIN_ID, $key[0], Criteria::EQUAL);
        $this->addUsingAlias(PluginOrganizationPeer::ORGANIZATION_ID, $key[1], Criteria::EQUAL);

        return $this;
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return PluginOrganizationQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {
        if (empty($keys)) {
            return $this->add(null, '1<>1', Criteria::CUSTOM);
        }
        foreach ($keys as $key) {
            $cton0 = $this->getNewCriterion(PluginOrganizationPeer::PLUGIN_ID, $key[0], Criteria::EQUAL);
            $cton1 = $this->getNewCriterion(PluginOrganizationPeer::ORGANIZATION_ID, $key[1], Criteria::EQUAL);
            $cton0->addAnd($cton1);
            $this->addOr($cton0);
        }

        return $this;
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
     * @return PluginOrganizationQuery The current query, for fluid interface
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

        return $this->addUsingAlias(PluginOrganizationPeer::PLUGIN_ID, $pluginId, $comparison);
    }

    /**
     * Filter the query on the organization_id column
     *
     * Example usage:
     * <code>
     * $query->filterByOrganizationId('fooValue');   // WHERE organization_id = 'fooValue'
     * $query->filterByOrganizationId('%fooValue%'); // WHERE organization_id LIKE '%fooValue%'
     * </code>
     *
     * @param     string $organizationId The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PluginOrganizationQuery The current query, for fluid interface
     */
    public function filterByOrganizationId($organizationId = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($organizationId)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $organizationId)) {
                $organizationId = str_replace('*', '%', $organizationId);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(PluginOrganizationPeer::ORGANIZATION_ID, $organizationId, $comparison);
    }

    /**
     * Filter the query by a related Plugin object
     *
     * @param   Plugin|PropelObjectCollection $plugin The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 PluginOrganizationQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByPlugin($plugin, $comparison = null)
    {
        if ($plugin instanceof Plugin) {
            return $this
                ->addUsingAlias(PluginOrganizationPeer::PLUGIN_ID, $plugin->getId(), $comparison);
        } elseif ($plugin instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(PluginOrganizationPeer::PLUGIN_ID, $plugin->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return PluginOrganizationQuery The current query, for fluid interface
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
     * Filter the query by a related Organization object
     *
     * @param   Organization|PropelObjectCollection $organization The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 PluginOrganizationQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganization($organization, $comparison = null)
    {
        if ($organization instanceof Organization) {
            return $this
                ->addUsingAlias(PluginOrganizationPeer::ORGANIZATION_ID, $organization->getId(), $comparison);
        } elseif ($organization instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(PluginOrganizationPeer::ORGANIZATION_ID, $organization->toKeyValue('PrimaryKey', 'Id'), $comparison);
        } else {
            throw new PropelException('filterByOrganization() only accepts arguments of type Organization or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the Organization relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return PluginOrganizationQuery The current query, for fluid interface
     */
    public function joinOrganization($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('Organization');

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
            $this->addJoinObject($join, 'Organization');
        }

        return $this;
    }

    /**
     * Use the Organization relation Organization object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   OrganizationQuery A secondary query class using the current class as primary query
     */
    public function useOrganizationQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinOrganization($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'Organization', 'OrganizationQuery');
    }

    /**
     * Exclude object from result
     *
     * @param   PluginOrganization $pluginOrganization Object to remove from the list of results
     *
     * @return PluginOrganizationQuery The current query, for fluid interface
     */
    public function prune($pluginOrganization = null)
    {
        if ($pluginOrganization) {
            $this->addCond('pruneCond0', $this->getAliasedColName(PluginOrganizationPeer::PLUGIN_ID), $pluginOrganization->getPluginId(), Criteria::NOT_EQUAL);
            $this->addCond('pruneCond1', $this->getAliasedColName(PluginOrganizationPeer::ORGANIZATION_ID), $pluginOrganization->getOrganizationId(), Criteria::NOT_EQUAL);
            $this->combine(array('pruneCond0', 'pruneCond1'), Criteria::LOGICAL_OR);
        }

        return $this;
    }

}
