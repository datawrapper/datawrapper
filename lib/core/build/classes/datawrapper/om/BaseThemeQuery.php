<?php


/**
 * Base class that represents a query for the 'theme' table.
 *
 *
 *
 * @method ThemeQuery orderById($order = Criteria::ASC) Order by the id column
 * @method ThemeQuery orderByCreatedAt($order = Criteria::ASC) Order by the created_at column
 * @method ThemeQuery orderByExtend($order = Criteria::ASC) Order by the extend column
 * @method ThemeQuery orderByTitle($order = Criteria::ASC) Order by the title column
 * @method ThemeQuery orderByData($order = Criteria::ASC) Order by the data column
 * @method ThemeQuery orderByLess($order = Criteria::ASC) Order by the less column
 * @method ThemeQuery orderByAssets($order = Criteria::ASC) Order by the assets column
 *
 * @method ThemeQuery groupById() Group by the id column
 * @method ThemeQuery groupByCreatedAt() Group by the created_at column
 * @method ThemeQuery groupByExtend() Group by the extend column
 * @method ThemeQuery groupByTitle() Group by the title column
 * @method ThemeQuery groupByData() Group by the data column
 * @method ThemeQuery groupByLess() Group by the less column
 * @method ThemeQuery groupByAssets() Group by the assets column
 *
 * @method ThemeQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method ThemeQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method ThemeQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method ThemeQuery leftJoinOrganizationTheme($relationAlias = null) Adds a LEFT JOIN clause to the query using the OrganizationTheme relation
 * @method ThemeQuery rightJoinOrganizationTheme($relationAlias = null) Adds a RIGHT JOIN clause to the query using the OrganizationTheme relation
 * @method ThemeQuery innerJoinOrganizationTheme($relationAlias = null) Adds a INNER JOIN clause to the query using the OrganizationTheme relation
 *
 * @method ThemeQuery leftJoinUserTheme($relationAlias = null) Adds a LEFT JOIN clause to the query using the UserTheme relation
 * @method ThemeQuery rightJoinUserTheme($relationAlias = null) Adds a RIGHT JOIN clause to the query using the UserTheme relation
 * @method ThemeQuery innerJoinUserTheme($relationAlias = null) Adds a INNER JOIN clause to the query using the UserTheme relation
 *
 * @method Theme findOne(PropelPDO $con = null) Return the first Theme matching the query
 * @method Theme findOneOrCreate(PropelPDO $con = null) Return the first Theme matching the query, or a new Theme object populated from the query conditions when no match is found
 *
 * @method Theme findOneByCreatedAt(string $created_at) Return the first Theme filtered by the created_at column
 * @method Theme findOneByExtend(string $extend) Return the first Theme filtered by the extend column
 * @method Theme findOneByTitle(string $title) Return the first Theme filtered by the title column
 * @method Theme findOneByData(string $data) Return the first Theme filtered by the data column
 * @method Theme findOneByLess(string $less) Return the first Theme filtered by the less column
 * @method Theme findOneByAssets(string $assets) Return the first Theme filtered by the assets column
 *
 * @method array findById(string $id) Return Theme objects filtered by the id column
 * @method array findByCreatedAt(string $created_at) Return Theme objects filtered by the created_at column
 * @method array findByExtend(string $extend) Return Theme objects filtered by the extend column
 * @method array findByTitle(string $title) Return Theme objects filtered by the title column
 * @method array findByData(string $data) Return Theme objects filtered by the data column
 * @method array findByLess(string $less) Return Theme objects filtered by the less column
 * @method array findByAssets(string $assets) Return Theme objects filtered by the assets column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseThemeQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseThemeQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'Theme', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new ThemeQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   ThemeQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return ThemeQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof ThemeQuery) {
            return $criteria;
        }
        $query = new ThemeQuery();
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
     * @return   Theme|Theme[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = ThemePeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(ThemePeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 Theme A model object, or null if the key is not found
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
     * @return                 Theme A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `id`, `created_at`, `extend`, `title`, `data`, `less`, `assets` FROM `theme` WHERE `id` = :p0';
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
            $obj = new Theme();
            $obj->hydrate($row);
            ThemePeer::addInstanceToPool($obj, (string) $key);
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
     * @return Theme|Theme[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|Theme[]|mixed the list of results, formatted by the current formatter
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
     * @return ThemeQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(ThemePeer::ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(ThemePeer::ID, $keys, Criteria::IN);
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
     * @return ThemeQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ThemePeer::ID, $id, $comparison);
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
     * @return ThemeQuery The current query, for fluid interface
     */
    public function filterByCreatedAt($createdAt = null, $comparison = null)
    {
        if (is_array($createdAt)) {
            $useMinMax = false;
            if (isset($createdAt['min'])) {
                $this->addUsingAlias(ThemePeer::CREATED_AT, $createdAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($createdAt['max'])) {
                $this->addUsingAlias(ThemePeer::CREATED_AT, $createdAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ThemePeer::CREATED_AT, $createdAt, $comparison);
    }

    /**
     * Filter the query on the extend column
     *
     * Example usage:
     * <code>
     * $query->filterByExtend('fooValue');   // WHERE extend = 'fooValue'
     * $query->filterByExtend('%fooValue%'); // WHERE extend LIKE '%fooValue%'
     * </code>
     *
     * @param     string $extend The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function filterByExtend($extend = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($extend)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $extend)) {
                $extend = str_replace('*', '%', $extend);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ThemePeer::EXTEND, $extend, $comparison);
    }

    /**
     * Filter the query on the title column
     *
     * Example usage:
     * <code>
     * $query->filterByTitle('fooValue');   // WHERE title = 'fooValue'
     * $query->filterByTitle('%fooValue%'); // WHERE title LIKE '%fooValue%'
     * </code>
     *
     * @param     string $title The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function filterByTitle($title = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($title)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $title)) {
                $title = str_replace('*', '%', $title);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ThemePeer::TITLE, $title, $comparison);
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
     * @return ThemeQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ThemePeer::DATA, $data, $comparison);
    }

    /**
     * Filter the query on the less column
     *
     * Example usage:
     * <code>
     * $query->filterByLess('fooValue');   // WHERE less = 'fooValue'
     * $query->filterByLess('%fooValue%'); // WHERE less LIKE '%fooValue%'
     * </code>
     *
     * @param     string $less The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function filterByLess($less = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($less)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $less)) {
                $less = str_replace('*', '%', $less);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ThemePeer::LESS, $less, $comparison);
    }

    /**
     * Filter the query on the assets column
     *
     * Example usage:
     * <code>
     * $query->filterByAssets('fooValue');   // WHERE assets = 'fooValue'
     * $query->filterByAssets('%fooValue%'); // WHERE assets LIKE '%fooValue%'
     * </code>
     *
     * @param     string $assets The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function filterByAssets($assets = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($assets)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $assets)) {
                $assets = str_replace('*', '%', $assets);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ThemePeer::ASSETS, $assets, $comparison);
    }

    /**
     * Filter the query by a related OrganizationTheme object
     *
     * @param   OrganizationTheme|PropelObjectCollection $organizationTheme  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ThemeQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganizationTheme($organizationTheme, $comparison = null)
    {
        if ($organizationTheme instanceof OrganizationTheme) {
            return $this
                ->addUsingAlias(ThemePeer::ID, $organizationTheme->getThemeId(), $comparison);
        } elseif ($organizationTheme instanceof PropelObjectCollection) {
            return $this
                ->useOrganizationThemeQuery()
                ->filterByPrimaryKeys($organizationTheme->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByOrganizationTheme() only accepts arguments of type OrganizationTheme or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the OrganizationTheme relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function joinOrganizationTheme($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('OrganizationTheme');

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
            $this->addJoinObject($join, 'OrganizationTheme');
        }

        return $this;
    }

    /**
     * Use the OrganizationTheme relation OrganizationTheme object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   OrganizationThemeQuery A secondary query class using the current class as primary query
     */
    public function useOrganizationThemeQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinOrganizationTheme($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'OrganizationTheme', 'OrganizationThemeQuery');
    }

    /**
     * Filter the query by a related UserTheme object
     *
     * @param   UserTheme|PropelObjectCollection $userTheme  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ThemeQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUserTheme($userTheme, $comparison = null)
    {
        if ($userTheme instanceof UserTheme) {
            return $this
                ->addUsingAlias(ThemePeer::ID, $userTheme->getThemeId(), $comparison);
        } elseif ($userTheme instanceof PropelObjectCollection) {
            return $this
                ->useUserThemeQuery()
                ->filterByPrimaryKeys($userTheme->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByUserTheme() only accepts arguments of type UserTheme or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the UserTheme relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function joinUserTheme($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('UserTheme');

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
            $this->addJoinObject($join, 'UserTheme');
        }

        return $this;
    }

    /**
     * Use the UserTheme relation UserTheme object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   UserThemeQuery A secondary query class using the current class as primary query
     */
    public function useUserThemeQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinUserTheme($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'UserTheme', 'UserThemeQuery');
    }

    /**
     * Filter the query by a related Organization object
     * using the organization_theme table as cross reference
     *
     * @param   Organization $organization the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   ThemeQuery The current query, for fluid interface
     */
    public function filterByOrganization($organization, $comparison = Criteria::EQUAL)
    {
        return $this
            ->useOrganizationThemeQuery()
            ->filterByOrganization($organization, $comparison)
            ->endUse();
    }

    /**
     * Filter the query by a related User object
     * using the user_theme table as cross reference
     *
     * @param   User $user the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   ThemeQuery The current query, for fluid interface
     */
    public function filterByUser($user, $comparison = Criteria::EQUAL)
    {
        return $this
            ->useUserThemeQuery()
            ->filterByUser($user, $comparison)
            ->endUse();
    }

    /**
     * Exclude object from result
     *
     * @param   Theme $theme Object to remove from the list of results
     *
     * @return ThemeQuery The current query, for fluid interface
     */
    public function prune($theme = null)
    {
        if ($theme) {
            $this->addUsingAlias(ThemePeer::ID, $theme->getId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
