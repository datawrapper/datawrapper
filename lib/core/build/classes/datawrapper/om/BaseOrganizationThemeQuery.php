<?php


/**
 * Base class that represents a query for the 'organization_theme' table.
 *
 *
 *
 * @method OrganizationThemeQuery orderByOrganizationId($order = Criteria::ASC) Order by the organization_id column
 * @method OrganizationThemeQuery orderByThemeId($order = Criteria::ASC) Order by the theme_id column
 *
 * @method OrganizationThemeQuery groupByOrganizationId() Group by the organization_id column
 * @method OrganizationThemeQuery groupByThemeId() Group by the theme_id column
 *
 * @method OrganizationThemeQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method OrganizationThemeQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method OrganizationThemeQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method OrganizationThemeQuery leftJoinOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the Organization relation
 * @method OrganizationThemeQuery rightJoinOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Organization relation
 * @method OrganizationThemeQuery innerJoinOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the Organization relation
 *
 * @method OrganizationThemeQuery leftJoinTheme($relationAlias = null) Adds a LEFT JOIN clause to the query using the Theme relation
 * @method OrganizationThemeQuery rightJoinTheme($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Theme relation
 * @method OrganizationThemeQuery innerJoinTheme($relationAlias = null) Adds a INNER JOIN clause to the query using the Theme relation
 *
 * @method OrganizationTheme findOne(PropelPDO $con = null) Return the first OrganizationTheme matching the query
 * @method OrganizationTheme findOneOrCreate(PropelPDO $con = null) Return the first OrganizationTheme matching the query, or a new OrganizationTheme object populated from the query conditions when no match is found
 *
 * @method OrganizationTheme findOneByOrganizationId(string $organization_id) Return the first OrganizationTheme filtered by the organization_id column
 * @method OrganizationTheme findOneByThemeId(string $theme_id) Return the first OrganizationTheme filtered by the theme_id column
 *
 * @method array findByOrganizationId(string $organization_id) Return OrganizationTheme objects filtered by the organization_id column
 * @method array findByThemeId(string $theme_id) Return OrganizationTheme objects filtered by the theme_id column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseOrganizationThemeQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseOrganizationThemeQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'OrganizationTheme', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new OrganizationThemeQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   OrganizationThemeQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return OrganizationThemeQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof OrganizationThemeQuery) {
            return $criteria;
        }
        $query = new OrganizationThemeQuery();
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
                         A Primary key composition: [$organization_id, $theme_id]
     * @param     PropelPDO $con an optional connection object
     *
     * @return   OrganizationTheme|OrganizationTheme[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = OrganizationThemePeer::getInstanceFromPool(serialize(array((string) $key[0], (string) $key[1]))))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(OrganizationThemePeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 OrganizationTheme A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `organization_id`, `theme_id` FROM `organization_theme` WHERE `organization_id` = :p0 AND `theme_id` = :p1';
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
            $obj = new OrganizationTheme();
            $obj->hydrate($row);
            OrganizationThemePeer::addInstanceToPool($obj, serialize(array((string) $key[0], (string) $key[1])));
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
     * @return OrganizationTheme|OrganizationTheme[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|OrganizationTheme[]|mixed the list of results, formatted by the current formatter
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
     * @return OrganizationThemeQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {
        $this->addUsingAlias(OrganizationThemePeer::ORGANIZATION_ID, $key[0], Criteria::EQUAL);
        $this->addUsingAlias(OrganizationThemePeer::THEME_ID, $key[1], Criteria::EQUAL);

        return $this;
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return OrganizationThemeQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {
        if (empty($keys)) {
            return $this->add(null, '1<>1', Criteria::CUSTOM);
        }
        foreach ($keys as $key) {
            $cton0 = $this->getNewCriterion(OrganizationThemePeer::ORGANIZATION_ID, $key[0], Criteria::EQUAL);
            $cton1 = $this->getNewCriterion(OrganizationThemePeer::THEME_ID, $key[1], Criteria::EQUAL);
            $cton0->addAnd($cton1);
            $this->addOr($cton0);
        }

        return $this;
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
     * @return OrganizationThemeQuery The current query, for fluid interface
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

        return $this->addUsingAlias(OrganizationThemePeer::ORGANIZATION_ID, $organizationId, $comparison);
    }

    /**
     * Filter the query on the theme_id column
     *
     * Example usage:
     * <code>
     * $query->filterByThemeId('fooValue');   // WHERE theme_id = 'fooValue'
     * $query->filterByThemeId('%fooValue%'); // WHERE theme_id LIKE '%fooValue%'
     * </code>
     *
     * @param     string $themeId The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationThemeQuery The current query, for fluid interface
     */
    public function filterByThemeId($themeId = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($themeId)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $themeId)) {
                $themeId = str_replace('*', '%', $themeId);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(OrganizationThemePeer::THEME_ID, $themeId, $comparison);
    }

    /**
     * Filter the query by a related Organization object
     *
     * @param   Organization|PropelObjectCollection $organization The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationThemeQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganization($organization, $comparison = null)
    {
        if ($organization instanceof Organization) {
            return $this
                ->addUsingAlias(OrganizationThemePeer::ORGANIZATION_ID, $organization->getId(), $comparison);
        } elseif ($organization instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(OrganizationThemePeer::ORGANIZATION_ID, $organization->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return OrganizationThemeQuery The current query, for fluid interface
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
     * Filter the query by a related Theme object
     *
     * @param   Theme|PropelObjectCollection $theme The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationThemeQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByTheme($theme, $comparison = null)
    {
        if ($theme instanceof Theme) {
            return $this
                ->addUsingAlias(OrganizationThemePeer::THEME_ID, $theme->getId(), $comparison);
        } elseif ($theme instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(OrganizationThemePeer::THEME_ID, $theme->toKeyValue('PrimaryKey', 'Id'), $comparison);
        } else {
            throw new PropelException('filterByTheme() only accepts arguments of type Theme or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the Theme relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return OrganizationThemeQuery The current query, for fluid interface
     */
    public function joinTheme($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('Theme');

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
            $this->addJoinObject($join, 'Theme');
        }

        return $this;
    }

    /**
     * Use the Theme relation Theme object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   ThemeQuery A secondary query class using the current class as primary query
     */
    public function useThemeQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinTheme($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'Theme', 'ThemeQuery');
    }

    /**
     * Exclude object from result
     *
     * @param   OrganizationTheme $organizationTheme Object to remove from the list of results
     *
     * @return OrganizationThemeQuery The current query, for fluid interface
     */
    public function prune($organizationTheme = null)
    {
        if ($organizationTheme) {
            $this->addCond('pruneCond0', $this->getAliasedColName(OrganizationThemePeer::ORGANIZATION_ID), $organizationTheme->getOrganizationId(), Criteria::NOT_EQUAL);
            $this->addCond('pruneCond1', $this->getAliasedColName(OrganizationThemePeer::THEME_ID), $organizationTheme->getThemeId(), Criteria::NOT_EQUAL);
            $this->combine(array('pruneCond0', 'pruneCond1'), Criteria::LOGICAL_OR);
        }

        return $this;
    }

}
