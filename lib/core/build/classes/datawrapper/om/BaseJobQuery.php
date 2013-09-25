<?php


/**
 * Base class that represents a query for the 'job' table.
 *
 *
 *
 * @method JobQuery orderById($order = Criteria::ASC) Order by the id column
 * @method JobQuery orderByUserId($order = Criteria::ASC) Order by the user_id column
 * @method JobQuery orderByChartId($order = Criteria::ASC) Order by the chart_id column
 * @method JobQuery orderByStatus($order = Criteria::ASC) Order by the status column
 * @method JobQuery orderByCreatedAt($order = Criteria::ASC) Order by the created_at column
 * @method JobQuery orderByDoneAt($order = Criteria::ASC) Order by the done_at column
 * @method JobQuery orderByType($order = Criteria::ASC) Order by the type column
 * @method JobQuery orderByParameter($order = Criteria::ASC) Order by the parameter column
 * @method JobQuery orderByFailReason($order = Criteria::ASC) Order by the fail_reason column
 *
 * @method JobQuery groupById() Group by the id column
 * @method JobQuery groupByUserId() Group by the user_id column
 * @method JobQuery groupByChartId() Group by the chart_id column
 * @method JobQuery groupByStatus() Group by the status column
 * @method JobQuery groupByCreatedAt() Group by the created_at column
 * @method JobQuery groupByDoneAt() Group by the done_at column
 * @method JobQuery groupByType() Group by the type column
 * @method JobQuery groupByParameter() Group by the parameter column
 * @method JobQuery groupByFailReason() Group by the fail_reason column
 *
 * @method JobQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method JobQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method JobQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method JobQuery leftJoinUser($relationAlias = null) Adds a LEFT JOIN clause to the query using the User relation
 * @method JobQuery rightJoinUser($relationAlias = null) Adds a RIGHT JOIN clause to the query using the User relation
 * @method JobQuery innerJoinUser($relationAlias = null) Adds a INNER JOIN clause to the query using the User relation
 *
 * @method JobQuery leftJoinChart($relationAlias = null) Adds a LEFT JOIN clause to the query using the Chart relation
 * @method JobQuery rightJoinChart($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Chart relation
 * @method JobQuery innerJoinChart($relationAlias = null) Adds a INNER JOIN clause to the query using the Chart relation
 *
 * @method Job findOne(PropelPDO $con = null) Return the first Job matching the query
 * @method Job findOneOrCreate(PropelPDO $con = null) Return the first Job matching the query, or a new Job object populated from the query conditions when no match is found
 *
 * @method Job findOneByUserId(int $user_id) Return the first Job filtered by the user_id column
 * @method Job findOneByChartId(string $chart_id) Return the first Job filtered by the chart_id column
 * @method Job findOneByStatus(int $status) Return the first Job filtered by the status column
 * @method Job findOneByCreatedAt(string $created_at) Return the first Job filtered by the created_at column
 * @method Job findOneByDoneAt(string $done_at) Return the first Job filtered by the done_at column
 * @method Job findOneByType(string $type) Return the first Job filtered by the type column
 * @method Job findOneByParameter(string $parameter) Return the first Job filtered by the parameter column
 * @method Job findOneByFailReason(string $fail_reason) Return the first Job filtered by the fail_reason column
 *
 * @method array findById(int $id) Return Job objects filtered by the id column
 * @method array findByUserId(int $user_id) Return Job objects filtered by the user_id column
 * @method array findByChartId(string $chart_id) Return Job objects filtered by the chart_id column
 * @method array findByStatus(int $status) Return Job objects filtered by the status column
 * @method array findByCreatedAt(string $created_at) Return Job objects filtered by the created_at column
 * @method array findByDoneAt(string $done_at) Return Job objects filtered by the done_at column
 * @method array findByType(string $type) Return Job objects filtered by the type column
 * @method array findByParameter(string $parameter) Return Job objects filtered by the parameter column
 * @method array findByFailReason(string $fail_reason) Return Job objects filtered by the fail_reason column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseJobQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseJobQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'Job', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new JobQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   JobQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return JobQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof JobQuery) {
            return $criteria;
        }
        $query = new JobQuery();
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
     * @return   Job|Job[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = JobPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(JobPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 Job A model object, or null if the key is not found
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
     * @return                 Job A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `id`, `user_id`, `chart_id`, `status`, `created_at`, `done_at`, `type`, `parameter`, `fail_reason` FROM `job` WHERE `id` = :p0';
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
            $obj = new Job();
            $obj->hydrate($row);
            JobPeer::addInstanceToPool($obj, (string) $key);
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
     * @return Job|Job[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|Job[]|mixed the list of results, formatted by the current formatter
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
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(JobPeer::ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(JobPeer::ID, $keys, Criteria::IN);
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
     * @return JobQuery The current query, for fluid interface
     */
    public function filterById($id = null, $comparison = null)
    {
        if (is_array($id)) {
            $useMinMax = false;
            if (isset($id['min'])) {
                $this->addUsingAlias(JobPeer::ID, $id['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($id['max'])) {
                $this->addUsingAlias(JobPeer::ID, $id['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(JobPeer::ID, $id, $comparison);
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
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByUserId($userId = null, $comparison = null)
    {
        if (is_array($userId)) {
            $useMinMax = false;
            if (isset($userId['min'])) {
                $this->addUsingAlias(JobPeer::USER_ID, $userId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($userId['max'])) {
                $this->addUsingAlias(JobPeer::USER_ID, $userId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(JobPeer::USER_ID, $userId, $comparison);
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
     * @return JobQuery The current query, for fluid interface
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

        return $this->addUsingAlias(JobPeer::CHART_ID, $chartId, $comparison);
    }

    /**
     * Filter the query on the status column
     *
     * @param     mixed $status The value to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return JobQuery The current query, for fluid interface
     * @throws PropelException - if the value is not accepted by the enum.
     */
    public function filterByStatus($status = null, $comparison = null)
    {
        if (is_scalar($status)) {
            $status = JobPeer::getSqlValueForEnum(JobPeer::STATUS, $status);
        } elseif (is_array($status)) {
            $convertedValues = array();
            foreach ($status as $value) {
                $convertedValues[] = JobPeer::getSqlValueForEnum(JobPeer::STATUS, $value);
            }
            $status = $convertedValues;
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(JobPeer::STATUS, $status, $comparison);
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
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByCreatedAt($createdAt = null, $comparison = null)
    {
        if (is_array($createdAt)) {
            $useMinMax = false;
            if (isset($createdAt['min'])) {
                $this->addUsingAlias(JobPeer::CREATED_AT, $createdAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($createdAt['max'])) {
                $this->addUsingAlias(JobPeer::CREATED_AT, $createdAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(JobPeer::CREATED_AT, $createdAt, $comparison);
    }

    /**
     * Filter the query on the done_at column
     *
     * Example usage:
     * <code>
     * $query->filterByDoneAt('2011-03-14'); // WHERE done_at = '2011-03-14'
     * $query->filterByDoneAt('now'); // WHERE done_at = '2011-03-14'
     * $query->filterByDoneAt(array('max' => 'yesterday')); // WHERE done_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $doneAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByDoneAt($doneAt = null, $comparison = null)
    {
        if (is_array($doneAt)) {
            $useMinMax = false;
            if (isset($doneAt['min'])) {
                $this->addUsingAlias(JobPeer::DONE_AT, $doneAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($doneAt['max'])) {
                $this->addUsingAlias(JobPeer::DONE_AT, $doneAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(JobPeer::DONE_AT, $doneAt, $comparison);
    }

    /**
     * Filter the query on the type column
     *
     * Example usage:
     * <code>
     * $query->filterByType('fooValue');   // WHERE type = 'fooValue'
     * $query->filterByType('%fooValue%'); // WHERE type LIKE '%fooValue%'
     * </code>
     *
     * @param     string $type The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByType($type = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($type)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $type)) {
                $type = str_replace('*', '%', $type);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(JobPeer::TYPE, $type, $comparison);
    }

    /**
     * Filter the query on the parameter column
     *
     * Example usage:
     * <code>
     * $query->filterByParameter('fooValue');   // WHERE parameter = 'fooValue'
     * $query->filterByParameter('%fooValue%'); // WHERE parameter LIKE '%fooValue%'
     * </code>
     *
     * @param     string $parameter The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByParameter($parameter = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($parameter)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $parameter)) {
                $parameter = str_replace('*', '%', $parameter);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(JobPeer::PARAMETER, $parameter, $comparison);
    }

    /**
     * Filter the query on the fail_reason column
     *
     * Example usage:
     * <code>
     * $query->filterByFailReason('fooValue');   // WHERE fail_reason = 'fooValue'
     * $query->filterByFailReason('%fooValue%'); // WHERE fail_reason LIKE '%fooValue%'
     * </code>
     *
     * @param     string $failReason The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return JobQuery The current query, for fluid interface
     */
    public function filterByFailReason($failReason = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($failReason)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $failReason)) {
                $failReason = str_replace('*', '%', $failReason);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(JobPeer::FAIL_REASON, $failReason, $comparison);
    }

    /**
     * Filter the query by a related User object
     *
     * @param   User|PropelObjectCollection $user The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 JobQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUser($user, $comparison = null)
    {
        if ($user instanceof User) {
            return $this
                ->addUsingAlias(JobPeer::USER_ID, $user->getId(), $comparison);
        } elseif ($user instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(JobPeer::USER_ID, $user->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return JobQuery The current query, for fluid interface
     */
    public function joinUser($relationAlias = null, $joinType = Criteria::INNER_JOIN)
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
    public function useUserQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinUser($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'User', 'UserQuery');
    }

    /**
     * Filter the query by a related Chart object
     *
     * @param   Chart|PropelObjectCollection $chart The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 JobQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChart($chart, $comparison = null)
    {
        if ($chart instanceof Chart) {
            return $this
                ->addUsingAlias(JobPeer::CHART_ID, $chart->getId(), $comparison);
        } elseif ($chart instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(JobPeer::CHART_ID, $chart->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return JobQuery The current query, for fluid interface
     */
    public function joinChart($relationAlias = null, $joinType = Criteria::INNER_JOIN)
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
    public function useChartQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinChart($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'Chart', 'ChartQuery');
    }

    /**
     * Exclude object from result
     *
     * @param   Job $job Object to remove from the list of results
     *
     * @return JobQuery The current query, for fluid interface
     */
    public function prune($job = null)
    {
        if ($job) {
            $this->addUsingAlias(JobPeer::ID, $job->getId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
