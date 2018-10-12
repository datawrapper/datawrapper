<?php


/**
 * Base class that represents a query for the 'chart_public' table.
 *
 *
 *
 * @method PublicChartQuery orderById($order = Criteria::ASC) Order by the id column
 * @method PublicChartQuery orderByTitle($order = Criteria::ASC) Order by the title column
 * @method PublicChartQuery orderByType($order = Criteria::ASC) Order by the type column
 * @method PublicChartQuery orderByMetadata($order = Criteria::ASC) Order by the metadata column
 * @method PublicChartQuery orderByExternalData($order = Criteria::ASC) Order by the external_data column
 * @method PublicChartQuery orderByFirstPublishedAt($order = Criteria::ASC) Order by the first_published_at column
 * @method PublicChartQuery orderByAuthorId($order = Criteria::ASC) Order by the author_id column
 * @method PublicChartQuery orderByOrganizationId($order = Criteria::ASC) Order by the organization_id column
 *
 * @method PublicChartQuery groupById() Group by the id column
 * @method PublicChartQuery groupByTitle() Group by the title column
 * @method PublicChartQuery groupByType() Group by the type column
 * @method PublicChartQuery groupByMetadata() Group by the metadata column
 * @method PublicChartQuery groupByExternalData() Group by the external_data column
 * @method PublicChartQuery groupByFirstPublishedAt() Group by the first_published_at column
 * @method PublicChartQuery groupByAuthorId() Group by the author_id column
 * @method PublicChartQuery groupByOrganizationId() Group by the organization_id column
 *
 * @method PublicChartQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method PublicChartQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method PublicChartQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method PublicChartQuery leftJoinChart($relationAlias = null) Adds a LEFT JOIN clause to the query using the Chart relation
 * @method PublicChartQuery rightJoinChart($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Chart relation
 * @method PublicChartQuery innerJoinChart($relationAlias = null) Adds a INNER JOIN clause to the query using the Chart relation
 *
 * @method PublicChart findOne(PropelPDO $con = null) Return the first PublicChart matching the query
 * @method PublicChart findOneOrCreate(PropelPDO $con = null) Return the first PublicChart matching the query, or a new PublicChart object populated from the query conditions when no match is found
 *
 * @method PublicChart findOneByTitle(string $title) Return the first PublicChart filtered by the title column
 * @method PublicChart findOneByType(string $type) Return the first PublicChart filtered by the type column
 * @method PublicChart findOneByMetadata(string $metadata) Return the first PublicChart filtered by the metadata column
 * @method PublicChart findOneByExternalData(string $external_data) Return the first PublicChart filtered by the external_data column
 * @method PublicChart findOneByFirstPublishedAt(string $first_published_at) Return the first PublicChart filtered by the first_published_at column
 * @method PublicChart findOneByAuthorId(int $author_id) Return the first PublicChart filtered by the author_id column
 * @method PublicChart findOneByOrganizationId(string $organization_id) Return the first PublicChart filtered by the organization_id column
 *
 * @method array findById(string $id) Return PublicChart objects filtered by the id column
 * @method array findByTitle(string $title) Return PublicChart objects filtered by the title column
 * @method array findByType(string $type) Return PublicChart objects filtered by the type column
 * @method array findByMetadata(string $metadata) Return PublicChart objects filtered by the metadata column
 * @method array findByExternalData(string $external_data) Return PublicChart objects filtered by the external_data column
 * @method array findByFirstPublishedAt(string $first_published_at) Return PublicChart objects filtered by the first_published_at column
 * @method array findByAuthorId(int $author_id) Return PublicChart objects filtered by the author_id column
 * @method array findByOrganizationId(string $organization_id) Return PublicChart objects filtered by the organization_id column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BasePublicChartQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BasePublicChartQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'PublicChart', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new PublicChartQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   PublicChartQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return PublicChartQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof PublicChartQuery) {
            return $criteria;
        }
        $query = new PublicChartQuery();
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
     * @return   PublicChart|PublicChart[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = PublicChartPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(PublicChartPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 PublicChart A model object, or null if the key is not found
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
     * @return                 PublicChart A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `id`, `title`, `type`, `metadata`, `external_data`, `first_published_at`, `author_id`, `organization_id` FROM `chart_public` WHERE `id` = :p0';
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
            $obj = new PublicChart();
            $obj->hydrate($row);
            PublicChartPeer::addInstanceToPool($obj, (string) $key);
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
     * @return PublicChart|PublicChart[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|PublicChart[]|mixed the list of results, formatted by the current formatter
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
     * @return PublicChartQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(PublicChartPeer::ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return PublicChartQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(PublicChartPeer::ID, $keys, Criteria::IN);
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
     * @return PublicChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(PublicChartPeer::ID, $id, $comparison);
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
     * @return PublicChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(PublicChartPeer::TITLE, $title, $comparison);
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
     * @return PublicChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(PublicChartPeer::TYPE, $type, $comparison);
    }

    /**
     * Filter the query on the metadata column
     *
     * Example usage:
     * <code>
     * $query->filterByMetadata('fooValue');   // WHERE metadata = 'fooValue'
     * $query->filterByMetadata('%fooValue%'); // WHERE metadata LIKE '%fooValue%'
     * </code>
     *
     * @param     string $metadata The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PublicChartQuery The current query, for fluid interface
     */
    public function filterByMetadata($metadata = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($metadata)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $metadata)) {
                $metadata = str_replace('*', '%', $metadata);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(PublicChartPeer::METADATA, $metadata, $comparison);
    }

    /**
     * Filter the query on the external_data column
     *
     * Example usage:
     * <code>
     * $query->filterByExternalData('fooValue');   // WHERE external_data = 'fooValue'
     * $query->filterByExternalData('%fooValue%'); // WHERE external_data LIKE '%fooValue%'
     * </code>
     *
     * @param     string $externalData The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PublicChartQuery The current query, for fluid interface
     */
    public function filterByExternalData($externalData = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($externalData)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $externalData)) {
                $externalData = str_replace('*', '%', $externalData);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(PublicChartPeer::EXTERNAL_DATA, $externalData, $comparison);
    }

    /**
     * Filter the query on the first_published_at column
     *
     * Example usage:
     * <code>
     * $query->filterByFirstPublishedAt('2011-03-14'); // WHERE first_published_at = '2011-03-14'
     * $query->filterByFirstPublishedAt('now'); // WHERE first_published_at = '2011-03-14'
     * $query->filterByFirstPublishedAt(array('max' => 'yesterday')); // WHERE first_published_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $firstPublishedAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PublicChartQuery The current query, for fluid interface
     */
    public function filterByFirstPublishedAt($firstPublishedAt = null, $comparison = null)
    {
        if (is_array($firstPublishedAt)) {
            $useMinMax = false;
            if (isset($firstPublishedAt['min'])) {
                $this->addUsingAlias(PublicChartPeer::FIRST_PUBLISHED_AT, $firstPublishedAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($firstPublishedAt['max'])) {
                $this->addUsingAlias(PublicChartPeer::FIRST_PUBLISHED_AT, $firstPublishedAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(PublicChartPeer::FIRST_PUBLISHED_AT, $firstPublishedAt, $comparison);
    }

    /**
     * Filter the query on the author_id column
     *
     * Example usage:
     * <code>
     * $query->filterByAuthorId(1234); // WHERE author_id = 1234
     * $query->filterByAuthorId(array(12, 34)); // WHERE author_id IN (12, 34)
     * $query->filterByAuthorId(array('min' => 12)); // WHERE author_id >= 12
     * $query->filterByAuthorId(array('max' => 12)); // WHERE author_id <= 12
     * </code>
     *
     * @param     mixed $authorId The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return PublicChartQuery The current query, for fluid interface
     */
    public function filterByAuthorId($authorId = null, $comparison = null)
    {
        if (is_array($authorId)) {
            $useMinMax = false;
            if (isset($authorId['min'])) {
                $this->addUsingAlias(PublicChartPeer::AUTHOR_ID, $authorId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($authorId['max'])) {
                $this->addUsingAlias(PublicChartPeer::AUTHOR_ID, $authorId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(PublicChartPeer::AUTHOR_ID, $authorId, $comparison);
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
     * @return PublicChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(PublicChartPeer::ORGANIZATION_ID, $organizationId, $comparison);
    }

    /**
     * Filter the query by a related Chart object
     *
     * @param   Chart|PropelObjectCollection $chart The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 PublicChartQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChart($chart, $comparison = null)
    {
        if ($chart instanceof Chart) {
            return $this
                ->addUsingAlias(PublicChartPeer::ID, $chart->getId(), $comparison);
        } elseif ($chart instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(PublicChartPeer::ID, $chart->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return PublicChartQuery The current query, for fluid interface
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
     * @param   PublicChart $publicChart Object to remove from the list of results
     *
     * @return PublicChartQuery The current query, for fluid interface
     */
    public function prune($publicChart = null)
    {
        if ($publicChart) {
            $this->addUsingAlias(PublicChartPeer::ID, $publicChart->getId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
