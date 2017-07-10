<?php


/**
 * Base class that represents a query for the 'chart_folders' table.
 *
 *
 *
 * @method ChartFoldersQuery orderByMapId($order = Criteria::ASC) Order by the map_id column
 * @method ChartFoldersQuery orderByChartId($order = Criteria::ASC) Order by the chart_id column
 * @method ChartFoldersQuery orderByUserFolder($order = Criteria::ASC) Order by the user_folder column
 * @method ChartFoldersQuery orderByOrgFolder($order = Criteria::ASC) Order by the org_folder column
 *
 * @method ChartFoldersQuery groupByMapId() Group by the map_id column
 * @method ChartFoldersQuery groupByChartId() Group by the chart_id column
 * @method ChartFoldersQuery groupByUserFolder() Group by the user_folder column
 * @method ChartFoldersQuery groupByOrgFolder() Group by the org_folder column
 *
 * @method ChartFoldersQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method ChartFoldersQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method ChartFoldersQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method ChartFoldersQuery leftJoinChart($relationAlias = null) Adds a LEFT JOIN clause to the query using the Chart relation
 * @method ChartFoldersQuery rightJoinChart($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Chart relation
 * @method ChartFoldersQuery innerJoinChart($relationAlias = null) Adds a INNER JOIN clause to the query using the Chart relation
 *
 * @method ChartFoldersQuery leftJoinUserFolders($relationAlias = null) Adds a LEFT JOIN clause to the query using the UserFolders relation
 * @method ChartFoldersQuery rightJoinUserFolders($relationAlias = null) Adds a RIGHT JOIN clause to the query using the UserFolders relation
 * @method ChartFoldersQuery innerJoinUserFolders($relationAlias = null) Adds a INNER JOIN clause to the query using the UserFolders relation
 *
 * @method ChartFoldersQuery leftJoinOrganizationFolders($relationAlias = null) Adds a LEFT JOIN clause to the query using the OrganizationFolders relation
 * @method ChartFoldersQuery rightJoinOrganizationFolders($relationAlias = null) Adds a RIGHT JOIN clause to the query using the OrganizationFolders relation
 * @method ChartFoldersQuery innerJoinOrganizationFolders($relationAlias = null) Adds a INNER JOIN clause to the query using the OrganizationFolders relation
 *
 * @method ChartFolders findOne(PropelPDO $con = null) Return the first ChartFolders matching the query
 * @method ChartFolders findOneOrCreate(PropelPDO $con = null) Return the first ChartFolders matching the query, or a new ChartFolders object populated from the query conditions when no match is found
 *
 * @method ChartFolders findOneByChartId(string $chart_id) Return the first ChartFolders filtered by the chart_id column
 * @method ChartFolders findOneByUserFolder(int $user_folder) Return the first ChartFolders filtered by the user_folder column
 * @method ChartFolders findOneByOrgFolder(int $org_folder) Return the first ChartFolders filtered by the org_folder column
 *
 * @method array findByMapId(int $map_id) Return ChartFolders objects filtered by the map_id column
 * @method array findByChartId(string $chart_id) Return ChartFolders objects filtered by the chart_id column
 * @method array findByUserFolder(int $user_folder) Return ChartFolders objects filtered by the user_folder column
 * @method array findByOrgFolder(int $org_folder) Return ChartFolders objects filtered by the org_folder column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseChartFoldersQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseChartFoldersQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'ChartFolders', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new ChartFoldersQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   ChartFoldersQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return ChartFoldersQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof ChartFoldersQuery) {
            return $criteria;
        }
        $query = new ChartFoldersQuery();
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
     * @return   ChartFolders|ChartFolders[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = ChartFoldersPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 ChartFolders A model object, or null if the key is not found
     * @throws PropelException
     */
     public function findOneByMapId($key, $con = null)
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
     * @return                 ChartFolders A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `map_id`, `chart_id`, `user_folder`, `org_folder` FROM `chart_folders` WHERE `map_id` = :p0';
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
            $obj = new ChartFolders();
            $obj->hydrate($row);
            ChartFoldersPeer::addInstanceToPool($obj, (string) $key);
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
     * @return ChartFolders|ChartFolders[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|ChartFolders[]|mixed the list of results, formatted by the current formatter
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
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(ChartFoldersPeer::MAP_ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(ChartFoldersPeer::MAP_ID, $keys, Criteria::IN);
    }

    /**
     * Filter the query on the map_id column
     *
     * Example usage:
     * <code>
     * $query->filterByMapId(1234); // WHERE map_id = 1234
     * $query->filterByMapId(array(12, 34)); // WHERE map_id IN (12, 34)
     * $query->filterByMapId(array('min' => 12)); // WHERE map_id >= 12
     * $query->filterByMapId(array('max' => 12)); // WHERE map_id <= 12
     * </code>
     *
     * @param     mixed $mapId The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function filterByMapId($mapId = null, $comparison = null)
    {
        if (is_array($mapId)) {
            $useMinMax = false;
            if (isset($mapId['min'])) {
                $this->addUsingAlias(ChartFoldersPeer::MAP_ID, $mapId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($mapId['max'])) {
                $this->addUsingAlias(ChartFoldersPeer::MAP_ID, $mapId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartFoldersPeer::MAP_ID, $mapId, $comparison);
    }

    /**
     * Filter the query on the chart_id column
     *
     * Example usage:
     * <code>
     * $query->filterByChartId('fooValue');   // WHERE chart_id = 'fooValue'
     * $query->filterByChartId('%fooValue%'); // WHERE chart_id LIKE '%fooValue%'
     * </code>
     *
     * @param     string $chartId The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function filterByChartId($chartId = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($chartId)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $chartId)) {
                $chartId = str_replace('*', '%', $chartId);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ChartFoldersPeer::CHART_ID, $chartId, $comparison);
    }

    /**
     * Filter the query on the user_folder column
     *
     * Example usage:
     * <code>
     * $query->filterByUserFolder(1234); // WHERE user_folder = 1234
     * $query->filterByUserFolder(array(12, 34)); // WHERE user_folder IN (12, 34)
     * $query->filterByUserFolder(array('min' => 12)); // WHERE user_folder >= 12
     * $query->filterByUserFolder(array('max' => 12)); // WHERE user_folder <= 12
     * </code>
     *
     * @see       filterByUserFolders()
     *
     * @param     mixed $userFolder The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function filterByUserFolder($userFolder = null, $comparison = null)
    {
        if (is_array($userFolder)) {
            $useMinMax = false;
            if (isset($userFolder['min'])) {
                $this->addUsingAlias(ChartFoldersPeer::USER_FOLDER, $userFolder['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($userFolder['max'])) {
                $this->addUsingAlias(ChartFoldersPeer::USER_FOLDER, $userFolder['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartFoldersPeer::USER_FOLDER, $userFolder, $comparison);
    }

    /**
     * Filter the query on the org_folder column
     *
     * Example usage:
     * <code>
     * $query->filterByOrgFolder(1234); // WHERE org_folder = 1234
     * $query->filterByOrgFolder(array(12, 34)); // WHERE org_folder IN (12, 34)
     * $query->filterByOrgFolder(array('min' => 12)); // WHERE org_folder >= 12
     * $query->filterByOrgFolder(array('max' => 12)); // WHERE org_folder <= 12
     * </code>
     *
     * @see       filterByOrganizationFolders()
     *
     * @param     mixed $orgFolder The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function filterByOrgFolder($orgFolder = null, $comparison = null)
    {
        if (is_array($orgFolder)) {
            $useMinMax = false;
            if (isset($orgFolder['min'])) {
                $this->addUsingAlias(ChartFoldersPeer::ORG_FOLDER, $orgFolder['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($orgFolder['max'])) {
                $this->addUsingAlias(ChartFoldersPeer::ORG_FOLDER, $orgFolder['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartFoldersPeer::ORG_FOLDER, $orgFolder, $comparison);
    }

    /**
     * Filter the query by a related Chart object
     *
     * @param   Chart|PropelObjectCollection $chart The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartFoldersQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChart($chart, $comparison = null)
    {
        if ($chart instanceof Chart) {
            return $this
                ->addUsingAlias(ChartFoldersPeer::CHART_ID, $chart->getId(), $comparison);
        } elseif ($chart instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartFoldersPeer::CHART_ID, $chart->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return ChartFoldersQuery The current query, for fluid interface
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
     * Filter the query by a related UserFolders object
     *
     * @param   UserFolders|PropelObjectCollection $userFolders The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartFoldersQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUserFolders($userFolders, $comparison = null)
    {
        if ($userFolders instanceof UserFolders) {
            return $this
                ->addUsingAlias(ChartFoldersPeer::USER_FOLDER, $userFolders->getUfId(), $comparison);
        } elseif ($userFolders instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartFoldersPeer::USER_FOLDER, $userFolders->toKeyValue('UfId', 'UfId'), $comparison);
        } else {
            throw new PropelException('filterByUserFolders() only accepts arguments of type UserFolders or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the UserFolders relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function joinUserFolders($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('UserFolders');

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
            $this->addJoinObject($join, 'UserFolders');
        }

        return $this;
    }

    /**
     * Use the UserFolders relation UserFolders object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   UserFoldersQuery A secondary query class using the current class as primary query
     */
    public function useUserFoldersQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinUserFolders($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'UserFolders', 'UserFoldersQuery');
    }

    /**
     * Filter the query by a related OrganizationFolders object
     *
     * @param   OrganizationFolders|PropelObjectCollection $organizationFolders The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartFoldersQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganizationFolders($organizationFolders, $comparison = null)
    {
        if ($organizationFolders instanceof OrganizationFolders) {
            return $this
                ->addUsingAlias(ChartFoldersPeer::ORG_FOLDER, $organizationFolders->getOfId(), $comparison);
        } elseif ($organizationFolders instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartFoldersPeer::ORG_FOLDER, $organizationFolders->toKeyValue('OfId', 'OfId'), $comparison);
        } else {
            throw new PropelException('filterByOrganizationFolders() only accepts arguments of type OrganizationFolders or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the OrganizationFolders relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function joinOrganizationFolders($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('OrganizationFolders');

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
            $this->addJoinObject($join, 'OrganizationFolders');
        }

        return $this;
    }

    /**
     * Use the OrganizationFolders relation OrganizationFolders object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   OrganizationFoldersQuery A secondary query class using the current class as primary query
     */
    public function useOrganizationFoldersQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinOrganizationFolders($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'OrganizationFolders', 'OrganizationFoldersQuery');
    }

    /**
     * Exclude object from result
     *
     * @param   ChartFolders $chartFolders Object to remove from the list of results
     *
     * @return ChartFoldersQuery The current query, for fluid interface
     */
    public function prune($chartFolders = null)
    {
        if ($chartFolders) {
            $this->addUsingAlias(ChartFoldersPeer::MAP_ID, $chartFolders->getMapId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
