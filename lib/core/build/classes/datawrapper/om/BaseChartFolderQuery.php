<?php


/**
 * Base class that represents a query for the 'chart_folder' table.
 *
 *
 *
 * @method ChartFolderQuery orderByMapId($order = Criteria::ASC) Order by the map_id column
 * @method ChartFolderQuery orderByChartId($order = Criteria::ASC) Order by the chart_id column
 * @method ChartFolderQuery orderByUsrFolder($order = Criteria::ASC) Order by the usr_folder column
 * @method ChartFolderQuery orderByOrgFolder($order = Criteria::ASC) Order by the org_folder column
 *
 * @method ChartFolderQuery groupByMapId() Group by the map_id column
 * @method ChartFolderQuery groupByChartId() Group by the chart_id column
 * @method ChartFolderQuery groupByUsrFolder() Group by the usr_folder column
 * @method ChartFolderQuery groupByOrgFolder() Group by the org_folder column
 *
 * @method ChartFolderQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method ChartFolderQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method ChartFolderQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method ChartFolderQuery leftJoinChart($relationAlias = null) Adds a LEFT JOIN clause to the query using the Chart relation
 * @method ChartFolderQuery rightJoinChart($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Chart relation
 * @method ChartFolderQuery innerJoinChart($relationAlias = null) Adds a INNER JOIN clause to the query using the Chart relation
 *
 * @method ChartFolderQuery leftJoinUserFolder($relationAlias = null) Adds a LEFT JOIN clause to the query using the UserFolder relation
 * @method ChartFolderQuery rightJoinUserFolder($relationAlias = null) Adds a RIGHT JOIN clause to the query using the UserFolder relation
 * @method ChartFolderQuery innerJoinUserFolder($relationAlias = null) Adds a INNER JOIN clause to the query using the UserFolder relation
 *
 * @method ChartFolderQuery leftJoinOrganizationFolder($relationAlias = null) Adds a LEFT JOIN clause to the query using the OrganizationFolder relation
 * @method ChartFolderQuery rightJoinOrganizationFolder($relationAlias = null) Adds a RIGHT JOIN clause to the query using the OrganizationFolder relation
 * @method ChartFolderQuery innerJoinOrganizationFolder($relationAlias = null) Adds a INNER JOIN clause to the query using the OrganizationFolder relation
 *
 * @method ChartFolder findOne(PropelPDO $con = null) Return the first ChartFolder matching the query
 * @method ChartFolder findOneOrCreate(PropelPDO $con = null) Return the first ChartFolder matching the query, or a new ChartFolder object populated from the query conditions when no match is found
 *
 * @method ChartFolder findOneByChartId(string $chart_id) Return the first ChartFolder filtered by the chart_id column
 * @method ChartFolder findOneByUsrFolder(int $usr_folder) Return the first ChartFolder filtered by the usr_folder column
 * @method ChartFolder findOneByOrgFolder(int $org_folder) Return the first ChartFolder filtered by the org_folder column
 *
 * @method array findByMapId(int $map_id) Return ChartFolder objects filtered by the map_id column
 * @method array findByChartId(string $chart_id) Return ChartFolder objects filtered by the chart_id column
 * @method array findByUsrFolder(int $usr_folder) Return ChartFolder objects filtered by the usr_folder column
 * @method array findByOrgFolder(int $org_folder) Return ChartFolder objects filtered by the org_folder column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseChartFolderQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseChartFolderQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'ChartFolder', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new ChartFolderQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   ChartFolderQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return ChartFolderQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof ChartFolderQuery) {
            return $criteria;
        }
        $query = new ChartFolderQuery();
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
     * @return   ChartFolder|ChartFolder[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = ChartFolderPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(ChartFolderPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 ChartFolder A model object, or null if the key is not found
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
     * @return                 ChartFolder A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `map_id`, `chart_id`, `usr_folder`, `org_folder` FROM `chart_folder` WHERE `map_id` = :p0';
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
            $obj = new ChartFolder();
            $obj->hydrate($row);
            ChartFolderPeer::addInstanceToPool($obj, (string) $key);
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
     * @return ChartFolder|ChartFolder[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|ChartFolder[]|mixed the list of results, formatted by the current formatter
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
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(ChartFolderPeer::MAP_ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(ChartFolderPeer::MAP_ID, $keys, Criteria::IN);
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
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function filterByMapId($mapId = null, $comparison = null)
    {
        if (is_array($mapId)) {
            $useMinMax = false;
            if (isset($mapId['min'])) {
                $this->addUsingAlias(ChartFolderPeer::MAP_ID, $mapId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($mapId['max'])) {
                $this->addUsingAlias(ChartFolderPeer::MAP_ID, $mapId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartFolderPeer::MAP_ID, $mapId, $comparison);
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
     * @return ChartFolderQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ChartFolderPeer::CHART_ID, $chartId, $comparison);
    }

    /**
     * Filter the query on the usr_folder column
     *
     * Example usage:
     * <code>
     * $query->filterByUsrFolder(1234); // WHERE usr_folder = 1234
     * $query->filterByUsrFolder(array(12, 34)); // WHERE usr_folder IN (12, 34)
     * $query->filterByUsrFolder(array('min' => 12)); // WHERE usr_folder >= 12
     * $query->filterByUsrFolder(array('max' => 12)); // WHERE usr_folder <= 12
     * </code>
     *
     * @see       filterByUserFolder()
     *
     * @param     mixed $usrFolder The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function filterByUsrFolder($usrFolder = null, $comparison = null)
    {
        if (is_array($usrFolder)) {
            $useMinMax = false;
            if (isset($usrFolder['min'])) {
                $this->addUsingAlias(ChartFolderPeer::USR_FOLDER, $usrFolder['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($usrFolder['max'])) {
                $this->addUsingAlias(ChartFolderPeer::USR_FOLDER, $usrFolder['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartFolderPeer::USR_FOLDER, $usrFolder, $comparison);
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
     * @see       filterByOrganizationFolder()
     *
     * @param     mixed $orgFolder The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function filterByOrgFolder($orgFolder = null, $comparison = null)
    {
        if (is_array($orgFolder)) {
            $useMinMax = false;
            if (isset($orgFolder['min'])) {
                $this->addUsingAlias(ChartFolderPeer::ORG_FOLDER, $orgFolder['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($orgFolder['max'])) {
                $this->addUsingAlias(ChartFolderPeer::ORG_FOLDER, $orgFolder['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartFolderPeer::ORG_FOLDER, $orgFolder, $comparison);
    }

    /**
     * Filter the query by a related Chart object
     *
     * @param   Chart|PropelObjectCollection $chart The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartFolderQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChart($chart, $comparison = null)
    {
        if ($chart instanceof Chart) {
            return $this
                ->addUsingAlias(ChartFolderPeer::CHART_ID, $chart->getId(), $comparison);
        } elseif ($chart instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartFolderPeer::CHART_ID, $chart->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return ChartFolderQuery The current query, for fluid interface
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
     * Filter the query by a related UserFolder object
     *
     * @param   UserFolder|PropelObjectCollection $userFolder The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartFolderQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUserFolder($userFolder, $comparison = null)
    {
        if ($userFolder instanceof UserFolder) {
            return $this
                ->addUsingAlias(ChartFolderPeer::USR_FOLDER, $userFolder->getUfId(), $comparison);
        } elseif ($userFolder instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartFolderPeer::USR_FOLDER, $userFolder->toKeyValue('UfId', 'UfId'), $comparison);
        } else {
            throw new PropelException('filterByUserFolder() only accepts arguments of type UserFolder or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the UserFolder relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function joinUserFolder($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('UserFolder');

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
            $this->addJoinObject($join, 'UserFolder');
        }

        return $this;
    }

    /**
     * Use the UserFolder relation UserFolder object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   UserFolderQuery A secondary query class using the current class as primary query
     */
    public function useUserFolderQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinUserFolder($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'UserFolder', 'UserFolderQuery');
    }

    /**
     * Filter the query by a related OrganizationFolder object
     *
     * @param   OrganizationFolder|PropelObjectCollection $organizationFolder The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartFolderQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganizationFolder($organizationFolder, $comparison = null)
    {
        if ($organizationFolder instanceof OrganizationFolder) {
            return $this
                ->addUsingAlias(ChartFolderPeer::ORG_FOLDER, $organizationFolder->getOfId(), $comparison);
        } elseif ($organizationFolder instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartFolderPeer::ORG_FOLDER, $organizationFolder->toKeyValue('OfId', 'OfId'), $comparison);
        } else {
            throw new PropelException('filterByOrganizationFolder() only accepts arguments of type OrganizationFolder or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the OrganizationFolder relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function joinOrganizationFolder($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('OrganizationFolder');

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
            $this->addJoinObject($join, 'OrganizationFolder');
        }

        return $this;
    }

    /**
     * Use the OrganizationFolder relation OrganizationFolder object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   OrganizationFolderQuery A secondary query class using the current class as primary query
     */
    public function useOrganizationFolderQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinOrganizationFolder($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'OrganizationFolder', 'OrganizationFolderQuery');
    }

    /**
     * Exclude object from result
     *
     * @param   ChartFolder $chartFolder Object to remove from the list of results
     *
     * @return ChartFolderQuery The current query, for fluid interface
     */
    public function prune($chartFolder = null)
    {
        if ($chartFolder) {
            $this->addUsingAlias(ChartFolderPeer::MAP_ID, $chartFolder->getMapId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
