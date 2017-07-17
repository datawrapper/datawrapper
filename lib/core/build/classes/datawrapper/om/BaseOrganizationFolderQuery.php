<?php


/**
 * Base class that represents a query for the 'organization_folder' table.
 *
 *
 *
 * @method OrganizationFolderQuery orderByOfId($order = Criteria::ASC) Order by the of_id column
 * @method OrganizationFolderQuery orderByOrgId($order = Criteria::ASC) Order by the org_id column
 * @method OrganizationFolderQuery orderByFolderName($order = Criteria::ASC) Order by the folder_name column
 * @method OrganizationFolderQuery orderByParentId($order = Criteria::ASC) Order by the parent_id column
 *
 * @method OrganizationFolderQuery groupByOfId() Group by the of_id column
 * @method OrganizationFolderQuery groupByOrgId() Group by the org_id column
 * @method OrganizationFolderQuery groupByFolderName() Group by the folder_name column
 * @method OrganizationFolderQuery groupByParentId() Group by the parent_id column
 *
 * @method OrganizationFolderQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method OrganizationFolderQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method OrganizationFolderQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method OrganizationFolderQuery leftJoinOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the Organization relation
 * @method OrganizationFolderQuery rightJoinOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Organization relation
 * @method OrganizationFolderQuery innerJoinOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the Organization relation
 *
 * @method OrganizationFolderQuery leftJoinChartFolder($relationAlias = null) Adds a LEFT JOIN clause to the query using the ChartFolder relation
 * @method OrganizationFolderQuery rightJoinChartFolder($relationAlias = null) Adds a RIGHT JOIN clause to the query using the ChartFolder relation
 * @method OrganizationFolderQuery innerJoinChartFolder($relationAlias = null) Adds a INNER JOIN clause to the query using the ChartFolder relation
 *
 * @method OrganizationFolder findOne(PropelPDO $con = null) Return the first OrganizationFolder matching the query
 * @method OrganizationFolder findOneOrCreate(PropelPDO $con = null) Return the first OrganizationFolder matching the query, or a new OrganizationFolder object populated from the query conditions when no match is found
 *
 * @method OrganizationFolder findOneByOfId(int $of_id) Return the first OrganizationFolder filtered by the of_id column
 * @method OrganizationFolder findOneByOrgId(string $org_id) Return the first OrganizationFolder filtered by the org_id column
 * @method OrganizationFolder findOneByFolderName(string $folder_name) Return the first OrganizationFolder filtered by the folder_name column
 * @method OrganizationFolder findOneByParentId(int $parent_id) Return the first OrganizationFolder filtered by the parent_id column
 *
 * @method array findByOfId(int $of_id) Return OrganizationFolder objects filtered by the of_id column
 * @method array findByOrgId(string $org_id) Return OrganizationFolder objects filtered by the org_id column
 * @method array findByFolderName(string $folder_name) Return OrganizationFolder objects filtered by the folder_name column
 * @method array findByParentId(int $parent_id) Return OrganizationFolder objects filtered by the parent_id column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseOrganizationFolderQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseOrganizationFolderQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'OrganizationFolder', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new OrganizationFolderQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   OrganizationFolderQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return OrganizationFolderQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof OrganizationFolderQuery) {
            return $criteria;
        }
        $query = new OrganizationFolderQuery();
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
                         A Primary key composition: [$of_id, $parent_id]
     * @param     PropelPDO $con an optional connection object
     *
     * @return   OrganizationFolder|OrganizationFolder[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = OrganizationFolderPeer::getInstanceFromPool(serialize(array((string) $key[0], (string) $key[1]))))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(OrganizationFolderPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 OrganizationFolder A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `of_id`, `org_id`, `folder_name`, `parent_id` FROM `organization_folder` WHERE `of_id` = :p0 AND `parent_id` = :p1';
        try {
            $stmt = $con->prepare($sql);
            $stmt->bindValue(':p0', $key[0], PDO::PARAM_INT);
            $stmt->bindValue(':p1', $key[1], PDO::PARAM_INT);
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute SELECT statement [%s]', $sql), $e);
        }
        $obj = null;
        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $obj = new OrganizationFolder();
            $obj->hydrate($row);
            OrganizationFolderPeer::addInstanceToPool($obj, serialize(array((string) $key[0], (string) $key[1])));
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
     * @return OrganizationFolder|OrganizationFolder[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|OrganizationFolder[]|mixed the list of results, formatted by the current formatter
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
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {
        $this->addUsingAlias(OrganizationFolderPeer::OF_ID, $key[0], Criteria::EQUAL);
        $this->addUsingAlias(OrganizationFolderPeer::PARENT_ID, $key[1], Criteria::EQUAL);

        return $this;
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {
        if (empty($keys)) {
            return $this->add(null, '1<>1', Criteria::CUSTOM);
        }
        foreach ($keys as $key) {
            $cton0 = $this->getNewCriterion(OrganizationFolderPeer::OF_ID, $key[0], Criteria::EQUAL);
            $cton1 = $this->getNewCriterion(OrganizationFolderPeer::PARENT_ID, $key[1], Criteria::EQUAL);
            $cton0->addAnd($cton1);
            $this->addOr($cton0);
        }

        return $this;
    }

    /**
     * Filter the query on the of_id column
     *
     * Example usage:
     * <code>
     * $query->filterByOfId(1234); // WHERE of_id = 1234
     * $query->filterByOfId(array(12, 34)); // WHERE of_id IN (12, 34)
     * $query->filterByOfId(array('min' => 12)); // WHERE of_id >= 12
     * $query->filterByOfId(array('max' => 12)); // WHERE of_id <= 12
     * </code>
     *
     * @param     mixed $ofId The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByOfId($ofId = null, $comparison = null)
    {
        if (is_array($ofId)) {
            $useMinMax = false;
            if (isset($ofId['min'])) {
                $this->addUsingAlias(OrganizationFolderPeer::OF_ID, $ofId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($ofId['max'])) {
                $this->addUsingAlias(OrganizationFolderPeer::OF_ID, $ofId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(OrganizationFolderPeer::OF_ID, $ofId, $comparison);
    }

    /**
     * Filter the query on the org_id column
     *
     * Example usage:
     * <code>
     * $query->filterByOrgId('fooValue');   // WHERE org_id = 'fooValue'
     * $query->filterByOrgId('%fooValue%'); // WHERE org_id LIKE '%fooValue%'
     * </code>
     *
     * @param     string $orgId The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByOrgId($orgId = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($orgId)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $orgId)) {
                $orgId = str_replace('*', '%', $orgId);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(OrganizationFolderPeer::ORG_ID, $orgId, $comparison);
    }

    /**
     * Filter the query on the folder_name column
     *
     * Example usage:
     * <code>
     * $query->filterByFolderName('fooValue');   // WHERE folder_name = 'fooValue'
     * $query->filterByFolderName('%fooValue%'); // WHERE folder_name LIKE '%fooValue%'
     * </code>
     *
     * @param     string $folderName The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByFolderName($folderName = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($folderName)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $folderName)) {
                $folderName = str_replace('*', '%', $folderName);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(OrganizationFolderPeer::FOLDER_NAME, $folderName, $comparison);
    }

    /**
     * Filter the query on the parent_id column
     *
     * Example usage:
     * <code>
     * $query->filterByParentId(1234); // WHERE parent_id = 1234
     * $query->filterByParentId(array(12, 34)); // WHERE parent_id IN (12, 34)
     * $query->filterByParentId(array('min' => 12)); // WHERE parent_id >= 12
     * $query->filterByParentId(array('max' => 12)); // WHERE parent_id <= 12
     * </code>
     *
     * @param     mixed $parentId The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByParentId($parentId = null, $comparison = null)
    {
        if (is_array($parentId)) {
            $useMinMax = false;
            if (isset($parentId['min'])) {
                $this->addUsingAlias(OrganizationFolderPeer::PARENT_ID, $parentId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($parentId['max'])) {
                $this->addUsingAlias(OrganizationFolderPeer::PARENT_ID, $parentId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(OrganizationFolderPeer::PARENT_ID, $parentId, $comparison);
    }

    /**
     * Filter the query by a related Organization object
     *
     * @param   Organization|PropelObjectCollection $organization The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationFolderQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganization($organization, $comparison = null)
    {
        if ($organization instanceof Organization) {
            return $this
                ->addUsingAlias(OrganizationFolderPeer::ORG_ID, $organization->getId(), $comparison);
        } elseif ($organization instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(OrganizationFolderPeer::ORG_ID, $organization->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function joinOrganization($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
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
    public function useOrganizationQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinOrganization($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'Organization', 'OrganizationQuery');
    }

    /**
     * Filter the query by a related ChartFolder object
     *
     * @param   ChartFolder|PropelObjectCollection $chartFolder  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationFolderQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChartFolder($chartFolder, $comparison = null)
    {
        if ($chartFolder instanceof ChartFolder) {
            return $this
                ->addUsingAlias(OrganizationFolderPeer::OF_ID, $chartFolder->getOrgFolder(), $comparison);
        } elseif ($chartFolder instanceof PropelObjectCollection) {
            return $this
                ->useChartFolderQuery()
                ->filterByPrimaryKeys($chartFolder->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByChartFolder() only accepts arguments of type ChartFolder or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the ChartFolder relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function joinChartFolder($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('ChartFolder');

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
            $this->addJoinObject($join, 'ChartFolder');
        }

        return $this;
    }

    /**
     * Use the ChartFolder relation ChartFolder object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   ChartFolderQuery A secondary query class using the current class as primary query
     */
    public function useChartFolderQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinChartFolder($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'ChartFolder', 'ChartFolderQuery');
    }

    /**
     * Filter the query by a related Chart object
     * using the chart_folder table as cross reference
     *
     * @param   Chart $chart the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByChart($chart, $comparison = Criteria::EQUAL)
    {
        return $this
            ->useChartFolderQuery()
            ->filterByChart($chart, $comparison)
            ->endUse();
    }

    /**
     * Filter the query by a related UserFolder object
     * using the chart_folder table as cross reference
     *
     * @param   UserFolder $userFolder the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   OrganizationFolderQuery The current query, for fluid interface
     */
    public function filterByUserFolder($userFolder, $comparison = Criteria::EQUAL)
    {
        return $this
            ->useChartFolderQuery()
            ->filterByUserFolder($userFolder, $comparison)
            ->endUse();
    }

    /**
     * Exclude object from result
     *
     * @param   OrganizationFolder $organizationFolder Object to remove from the list of results
     *
     * @return OrganizationFolderQuery The current query, for fluid interface
     */
    public function prune($organizationFolder = null)
    {
        if ($organizationFolder) {
            $this->addCond('pruneCond0', $this->getAliasedColName(OrganizationFolderPeer::OF_ID), $organizationFolder->getOfId(), Criteria::NOT_EQUAL);
            $this->addCond('pruneCond1', $this->getAliasedColName(OrganizationFolderPeer::PARENT_ID), $organizationFolder->getParentId(), Criteria::NOT_EQUAL);
            $this->combine(array('pruneCond0', 'pruneCond1'), Criteria::LOGICAL_OR);
        }

        return $this;
    }

}
