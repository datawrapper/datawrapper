<?php


/**
 * Base class that represents a query for the 'organization_invite' table.
 *
 *
 *
 * @method OrganizationInviteQuery orderByInviteToken($order = Criteria::ASC) Order by the invite_token column
 * @method OrganizationInviteQuery orderByOrganizationId($order = Criteria::ASC) Order by the organization_id column
 * @method OrganizationInviteQuery orderByUserId($order = Criteria::ASC) Order by the user_id column
 *
 * @method OrganizationInviteQuery groupByInviteToken() Group by the invite_token column
 * @method OrganizationInviteQuery groupByOrganizationId() Group by the organization_id column
 * @method OrganizationInviteQuery groupByUserId() Group by the user_id column
 *
 * @method OrganizationInviteQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method OrganizationInviteQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method OrganizationInviteQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method OrganizationInviteQuery leftJoinUser($relationAlias = null) Adds a LEFT JOIN clause to the query using the User relation
 * @method OrganizationInviteQuery rightJoinUser($relationAlias = null) Adds a RIGHT JOIN clause to the query using the User relation
 * @method OrganizationInviteQuery innerJoinUser($relationAlias = null) Adds a INNER JOIN clause to the query using the User relation
 *
 * @method OrganizationInviteQuery leftJoinOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the Organization relation
 * @method OrganizationInviteQuery rightJoinOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Organization relation
 * @method OrganizationInviteQuery innerJoinOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the Organization relation
 *
 * @method OrganizationInvite findOne(PropelPDO $con = null) Return the first OrganizationInvite matching the query
 * @method OrganizationInvite findOneOrCreate(PropelPDO $con = null) Return the first OrganizationInvite matching the query, or a new OrganizationInvite object populated from the query conditions when no match is found
 *
 * @method OrganizationInvite findOneByOrganizationId(string $organization_id) Return the first OrganizationInvite filtered by the organization_id column
 * @method OrganizationInvite findOneByUserId(int $user_id) Return the first OrganizationInvite filtered by the user_id column
 *
 * @method array findByInviteToken(string $invite_token) Return OrganizationInvite objects filtered by the invite_token column
 * @method array findByOrganizationId(string $organization_id) Return OrganizationInvite objects filtered by the organization_id column
 * @method array findByUserId(int $user_id) Return OrganizationInvite objects filtered by the user_id column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseOrganizationInviteQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseOrganizationInviteQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'OrganizationInvite', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new OrganizationInviteQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   OrganizationInviteQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return OrganizationInviteQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof OrganizationInviteQuery) {
            return $criteria;
        }
        $query = new OrganizationInviteQuery();
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
     * @return   OrganizationInvite|OrganizationInvite[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = OrganizationInvitePeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(OrganizationInvitePeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 OrganizationInvite A model object, or null if the key is not found
     * @throws PropelException
     */
     public function findOneByInviteToken($key, $con = null)
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
     * @return                 OrganizationInvite A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `invite_token`, `organization_id`, `user_id` FROM `organization_invite` WHERE `invite_token` = :p0';
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
            $obj = new OrganizationInvite();
            $obj->hydrate($row);
            OrganizationInvitePeer::addInstanceToPool($obj, (string) $key);
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
     * @return OrganizationInvite|OrganizationInvite[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|OrganizationInvite[]|mixed the list of results, formatted by the current formatter
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
     * @return OrganizationInviteQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(OrganizationInvitePeer::INVITE_TOKEN, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return OrganizationInviteQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(OrganizationInvitePeer::INVITE_TOKEN, $keys, Criteria::IN);
    }

    /**
     * Filter the query on the invite_token column
     *
     * Example usage:
     * <code>
     * $query->filterByInviteToken('fooValue');   // WHERE invite_token = 'fooValue'
     * $query->filterByInviteToken('%fooValue%'); // WHERE invite_token LIKE '%fooValue%'
     * </code>
     *
     * @param     string $inviteToken The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return OrganizationInviteQuery The current query, for fluid interface
     */
    public function filterByInviteToken($inviteToken = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($inviteToken)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $inviteToken)) {
                $inviteToken = str_replace('*', '%', $inviteToken);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(OrganizationInvitePeer::INVITE_TOKEN, $inviteToken, $comparison);
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
     * @return OrganizationInviteQuery The current query, for fluid interface
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

        return $this->addUsingAlias(OrganizationInvitePeer::ORGANIZATION_ID, $organizationId, $comparison);
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
     * @return OrganizationInviteQuery The current query, for fluid interface
     */
    public function filterByUserId($userId = null, $comparison = null)
    {
        if (is_array($userId)) {
            $useMinMax = false;
            if (isset($userId['min'])) {
                $this->addUsingAlias(OrganizationInvitePeer::USER_ID, $userId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($userId['max'])) {
                $this->addUsingAlias(OrganizationInvitePeer::USER_ID, $userId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(OrganizationInvitePeer::USER_ID, $userId, $comparison);
    }

    /**
     * Filter the query by a related User object
     *
     * @param   User|PropelObjectCollection $user The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationInviteQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUser($user, $comparison = null)
    {
        if ($user instanceof User) {
            return $this
                ->addUsingAlias(OrganizationInvitePeer::USER_ID, $user->getId(), $comparison);
        } elseif ($user instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(OrganizationInvitePeer::USER_ID, $user->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return OrganizationInviteQuery The current query, for fluid interface
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
     * Filter the query by a related Organization object
     *
     * @param   Organization|PropelObjectCollection $organization The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 OrganizationInviteQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganization($organization, $comparison = null)
    {
        if ($organization instanceof Organization) {
            return $this
                ->addUsingAlias(OrganizationInvitePeer::ORGANIZATION_ID, $organization->getId(), $comparison);
        } elseif ($organization instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(OrganizationInvitePeer::ORGANIZATION_ID, $organization->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return OrganizationInviteQuery The current query, for fluid interface
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
     * @param   OrganizationInvite $organizationInvite Object to remove from the list of results
     *
     * @return OrganizationInviteQuery The current query, for fluid interface
     */
    public function prune($organizationInvite = null)
    {
        if ($organizationInvite) {
            $this->addUsingAlias(OrganizationInvitePeer::INVITE_TOKEN, $organizationInvite->getInviteToken(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
