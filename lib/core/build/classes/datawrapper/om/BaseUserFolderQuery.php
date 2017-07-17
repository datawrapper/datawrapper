<?php


/**
 * Base class that represents a query for the 'user_folder' table.
 *
 *
 *
 * @method UserFolderQuery orderByUfId($order = Criteria::ASC) Order by the uf_id column
 * @method UserFolderQuery orderByUserId($order = Criteria::ASC) Order by the user_id column
 * @method UserFolderQuery orderByFolderName($order = Criteria::ASC) Order by the folder_name column
 * @method UserFolderQuery orderByParentId($order = Criteria::ASC) Order by the parent_id column
 *
 * @method UserFolderQuery groupByUfId() Group by the uf_id column
 * @method UserFolderQuery groupByUserId() Group by the user_id column
 * @method UserFolderQuery groupByFolderName() Group by the folder_name column
 * @method UserFolderQuery groupByParentId() Group by the parent_id column
 *
 * @method UserFolderQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method UserFolderQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method UserFolderQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method UserFolderQuery leftJoinUser($relationAlias = null) Adds a LEFT JOIN clause to the query using the User relation
 * @method UserFolderQuery rightJoinUser($relationAlias = null) Adds a RIGHT JOIN clause to the query using the User relation
 * @method UserFolderQuery innerJoinUser($relationAlias = null) Adds a INNER JOIN clause to the query using the User relation
 *
 * @method UserFolderQuery leftJoinChartFolder($relationAlias = null) Adds a LEFT JOIN clause to the query using the ChartFolder relation
 * @method UserFolderQuery rightJoinChartFolder($relationAlias = null) Adds a RIGHT JOIN clause to the query using the ChartFolder relation
 * @method UserFolderQuery innerJoinChartFolder($relationAlias = null) Adds a INNER JOIN clause to the query using the ChartFolder relation
 *
 * @method UserFolder findOne(PropelPDO $con = null) Return the first UserFolder matching the query
 * @method UserFolder findOneOrCreate(PropelPDO $con = null) Return the first UserFolder matching the query, or a new UserFolder object populated from the query conditions when no match is found
 *
 * @method UserFolder findOneByUfId(int $uf_id) Return the first UserFolder filtered by the uf_id column
 * @method UserFolder findOneByUserId(int $user_id) Return the first UserFolder filtered by the user_id column
 * @method UserFolder findOneByFolderName(string $folder_name) Return the first UserFolder filtered by the folder_name column
 * @method UserFolder findOneByParentId(int $parent_id) Return the first UserFolder filtered by the parent_id column
 *
 * @method array findByUfId(int $uf_id) Return UserFolder objects filtered by the uf_id column
 * @method array findByUserId(int $user_id) Return UserFolder objects filtered by the user_id column
 * @method array findByFolderName(string $folder_name) Return UserFolder objects filtered by the folder_name column
 * @method array findByParentId(int $parent_id) Return UserFolder objects filtered by the parent_id column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseUserFolderQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseUserFolderQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'UserFolder', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new UserFolderQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   UserFolderQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return UserFolderQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof UserFolderQuery) {
            return $criteria;
        }
        $query = new UserFolderQuery();
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
                         A Primary key composition: [$uf_id, $parent_id]
     * @param     PropelPDO $con an optional connection object
     *
     * @return   UserFolder|UserFolder[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = UserFolderPeer::getInstanceFromPool(serialize(array((string) $key[0], (string) $key[1]))))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(UserFolderPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 UserFolder A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `uf_id`, `user_id`, `folder_name`, `parent_id` FROM `user_folder` WHERE `uf_id` = :p0 AND `parent_id` = :p1';
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
            $obj = new UserFolder();
            $obj->hydrate($row);
            UserFolderPeer::addInstanceToPool($obj, serialize(array((string) $key[0], (string) $key[1])));
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
     * @return UserFolder|UserFolder[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|UserFolder[]|mixed the list of results, formatted by the current formatter
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
     * @return UserFolderQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {
        $this->addUsingAlias(UserFolderPeer::UF_ID, $key[0], Criteria::EQUAL);
        $this->addUsingAlias(UserFolderPeer::PARENT_ID, $key[1], Criteria::EQUAL);

        return $this;
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return UserFolderQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {
        if (empty($keys)) {
            return $this->add(null, '1<>1', Criteria::CUSTOM);
        }
        foreach ($keys as $key) {
            $cton0 = $this->getNewCriterion(UserFolderPeer::UF_ID, $key[0], Criteria::EQUAL);
            $cton1 = $this->getNewCriterion(UserFolderPeer::PARENT_ID, $key[1], Criteria::EQUAL);
            $cton0->addAnd($cton1);
            $this->addOr($cton0);
        }

        return $this;
    }

    /**
     * Filter the query on the uf_id column
     *
     * Example usage:
     * <code>
     * $query->filterByUfId(1234); // WHERE uf_id = 1234
     * $query->filterByUfId(array(12, 34)); // WHERE uf_id IN (12, 34)
     * $query->filterByUfId(array('min' => 12)); // WHERE uf_id >= 12
     * $query->filterByUfId(array('max' => 12)); // WHERE uf_id <= 12
     * </code>
     *
     * @param     mixed $ufId The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return UserFolderQuery The current query, for fluid interface
     */
    public function filterByUfId($ufId = null, $comparison = null)
    {
        if (is_array($ufId)) {
            $useMinMax = false;
            if (isset($ufId['min'])) {
                $this->addUsingAlias(UserFolderPeer::UF_ID, $ufId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($ufId['max'])) {
                $this->addUsingAlias(UserFolderPeer::UF_ID, $ufId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(UserFolderPeer::UF_ID, $ufId, $comparison);
    }

    /**
     * Filter the query on the user_id column
     *
     * Example usage:
     * <code>
     * $query->filterByUserId(1234); // WHERE user_id = 1234
     * $query->filterByUserId(array(12, 34)); // WHERE user_id IN (12, 34)
     * $query->filterByUserId(array('min' => 12)); // WHERE user_id >= 12
     * $query->filterByUserId(array('max' => 12)); // WHERE user_id <= 12
     * </code>
     *
     * @see       filterByUser()
     *
     * @param     mixed $userId The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return UserFolderQuery The current query, for fluid interface
     */
    public function filterByUserId($userId = null, $comparison = null)
    {
        if (is_array($userId)) {
            $useMinMax = false;
            if (isset($userId['min'])) {
                $this->addUsingAlias(UserFolderPeer::USER_ID, $userId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($userId['max'])) {
                $this->addUsingAlias(UserFolderPeer::USER_ID, $userId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(UserFolderPeer::USER_ID, $userId, $comparison);
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
     * @return UserFolderQuery The current query, for fluid interface
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

        return $this->addUsingAlias(UserFolderPeer::FOLDER_NAME, $folderName, $comparison);
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
     * @return UserFolderQuery The current query, for fluid interface
     */
    public function filterByParentId($parentId = null, $comparison = null)
    {
        if (is_array($parentId)) {
            $useMinMax = false;
            if (isset($parentId['min'])) {
                $this->addUsingAlias(UserFolderPeer::PARENT_ID, $parentId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($parentId['max'])) {
                $this->addUsingAlias(UserFolderPeer::PARENT_ID, $parentId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(UserFolderPeer::PARENT_ID, $parentId, $comparison);
    }

    /**
     * Filter the query by a related User object
     *
     * @param   User|PropelObjectCollection $user The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 UserFolderQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUser($user, $comparison = null)
    {
        if ($user instanceof User) {
            return $this
                ->addUsingAlias(UserFolderPeer::USER_ID, $user->getId(), $comparison);
        } elseif ($user instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(UserFolderPeer::USER_ID, $user->toKeyValue('PrimaryKey', 'Id'), $comparison);
        } else {
            throw new PropelException('filterByUser() only accepts arguments of type User or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the User relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return UserFolderQuery The current query, for fluid interface
     */
    public function joinUser($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('User');

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
            $this->addJoinObject($join, 'User');
        }

        return $this;
    }

    /**
     * Use the User relation User object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   UserQuery A secondary query class using the current class as primary query
     */
    public function useUserQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinUser($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'User', 'UserQuery');
    }

    /**
     * Filter the query by a related ChartFolder object
     *
     * @param   ChartFolder|PropelObjectCollection $chartFolder  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 UserFolderQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChartFolder($chartFolder, $comparison = null)
    {
        if ($chartFolder instanceof ChartFolder) {
            return $this
                ->addUsingAlias(UserFolderPeer::UF_ID, $chartFolder->getUsrFolder(), $comparison);
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
     * @return UserFolderQuery The current query, for fluid interface
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
     * @return   UserFolderQuery The current query, for fluid interface
     */
    public function filterByChart($chart, $comparison = Criteria::EQUAL)
    {
        return $this
            ->useChartFolderQuery()
            ->filterByChart($chart, $comparison)
            ->endUse();
    }

    /**
     * Filter the query by a related OrganizationFolder object
     * using the chart_folder table as cross reference
     *
     * @param   OrganizationFolder $organizationFolder the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return   UserFolderQuery The current query, for fluid interface
     */
    public function filterByOrganizationFolder($organizationFolder, $comparison = Criteria::EQUAL)
    {
        return $this
            ->useChartFolderQuery()
            ->filterByOrganizationFolder($organizationFolder, $comparison)
            ->endUse();
    }

    /**
     * Exclude object from result
     *
     * @param   UserFolder $userFolder Object to remove from the list of results
     *
     * @return UserFolderQuery The current query, for fluid interface
     */
    public function prune($userFolder = null)
    {
        if ($userFolder) {
            $this->addCond('pruneCond0', $this->getAliasedColName(UserFolderPeer::UF_ID), $userFolder->getUfId(), Criteria::NOT_EQUAL);
            $this->addCond('pruneCond1', $this->getAliasedColName(UserFolderPeer::PARENT_ID), $userFolder->getParentId(), Criteria::NOT_EQUAL);
            $this->combine(array('pruneCond0', 'pruneCond1'), Criteria::LOGICAL_OR);
        }

        return $this;
    }

}
