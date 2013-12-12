<?php


/**
 * Base class that represents a query for the 'chart' table.
 *
 *
 *
 * @method ChartQuery orderById($order = Criteria::ASC) Order by the id column
 * @method ChartQuery orderByTitle($order = Criteria::ASC) Order by the title column
 * @method ChartQuery orderByTheme($order = Criteria::ASC) Order by the theme column
 * @method ChartQuery orderByCreatedAt($order = Criteria::ASC) Order by the created_at column
 * @method ChartQuery orderByLastModifiedAt($order = Criteria::ASC) Order by the last_modified_at column
 * @method ChartQuery orderByType($order = Criteria::ASC) Order by the type column
 * @method ChartQuery orderByMetadata($order = Criteria::ASC) Order by the metadata column
 * @method ChartQuery orderByDeleted($order = Criteria::ASC) Order by the deleted column
 * @method ChartQuery orderByDeletedAt($order = Criteria::ASC) Order by the deleted_at column
 * @method ChartQuery orderByAuthorId($order = Criteria::ASC) Order by the author_id column
 * @method ChartQuery orderByShowInGallery($order = Criteria::ASC) Order by the show_in_gallery column
 * @method ChartQuery orderByLanguage($order = Criteria::ASC) Order by the language column
 * @method ChartQuery orderByGuestSession($order = Criteria::ASC) Order by the guest_session column
 * @method ChartQuery orderByLastEditStep($order = Criteria::ASC) Order by the last_edit_step column
 * @method ChartQuery orderByPublishedAt($order = Criteria::ASC) Order by the published_at column
 * @method ChartQuery orderByPublicUrl($order = Criteria::ASC) Order by the public_url column
 * @method ChartQuery orderByPublicVersion($order = Criteria::ASC) Order by the public_version column
 * @method ChartQuery orderByOrganizationId($order = Criteria::ASC) Order by the organization_id column
 * @method ChartQuery orderByForkedFrom($order = Criteria::ASC) Order by the forked_from column
 *
 * @method ChartQuery groupById() Group by the id column
 * @method ChartQuery groupByTitle() Group by the title column
 * @method ChartQuery groupByTheme() Group by the theme column
 * @method ChartQuery groupByCreatedAt() Group by the created_at column
 * @method ChartQuery groupByLastModifiedAt() Group by the last_modified_at column
 * @method ChartQuery groupByType() Group by the type column
 * @method ChartQuery groupByMetadata() Group by the metadata column
 * @method ChartQuery groupByDeleted() Group by the deleted column
 * @method ChartQuery groupByDeletedAt() Group by the deleted_at column
 * @method ChartQuery groupByAuthorId() Group by the author_id column
 * @method ChartQuery groupByShowInGallery() Group by the show_in_gallery column
 * @method ChartQuery groupByLanguage() Group by the language column
 * @method ChartQuery groupByGuestSession() Group by the guest_session column
 * @method ChartQuery groupByLastEditStep() Group by the last_edit_step column
 * @method ChartQuery groupByPublishedAt() Group by the published_at column
 * @method ChartQuery groupByPublicUrl() Group by the public_url column
 * @method ChartQuery groupByPublicVersion() Group by the public_version column
 * @method ChartQuery groupByOrganizationId() Group by the organization_id column
 * @method ChartQuery groupByForkedFrom() Group by the forked_from column
 *
 * @method ChartQuery leftJoin($relation) Adds a LEFT JOIN clause to the query
 * @method ChartQuery rightJoin($relation) Adds a RIGHT JOIN clause to the query
 * @method ChartQuery innerJoin($relation) Adds a INNER JOIN clause to the query
 *
 * @method ChartQuery leftJoinUser($relationAlias = null) Adds a LEFT JOIN clause to the query using the User relation
 * @method ChartQuery rightJoinUser($relationAlias = null) Adds a RIGHT JOIN clause to the query using the User relation
 * @method ChartQuery innerJoinUser($relationAlias = null) Adds a INNER JOIN clause to the query using the User relation
 *
 * @method ChartQuery leftJoinOrganization($relationAlias = null) Adds a LEFT JOIN clause to the query using the Organization relation
 * @method ChartQuery rightJoinOrganization($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Organization relation
 * @method ChartQuery innerJoinOrganization($relationAlias = null) Adds a INNER JOIN clause to the query using the Organization relation
 *
 * @method ChartQuery leftJoinChartRelatedByForkedFrom($relationAlias = null) Adds a LEFT JOIN clause to the query using the ChartRelatedByForkedFrom relation
 * @method ChartQuery rightJoinChartRelatedByForkedFrom($relationAlias = null) Adds a RIGHT JOIN clause to the query using the ChartRelatedByForkedFrom relation
 * @method ChartQuery innerJoinChartRelatedByForkedFrom($relationAlias = null) Adds a INNER JOIN clause to the query using the ChartRelatedByForkedFrom relation
 *
 * @method ChartQuery leftJoinChartRelatedById($relationAlias = null) Adds a LEFT JOIN clause to the query using the ChartRelatedById relation
 * @method ChartQuery rightJoinChartRelatedById($relationAlias = null) Adds a RIGHT JOIN clause to the query using the ChartRelatedById relation
 * @method ChartQuery innerJoinChartRelatedById($relationAlias = null) Adds a INNER JOIN clause to the query using the ChartRelatedById relation
 *
 * @method ChartQuery leftJoinJob($relationAlias = null) Adds a LEFT JOIN clause to the query using the Job relation
 * @method ChartQuery rightJoinJob($relationAlias = null) Adds a RIGHT JOIN clause to the query using the Job relation
 * @method ChartQuery innerJoinJob($relationAlias = null) Adds a INNER JOIN clause to the query using the Job relation
 *
 * @method Chart findOne(PropelPDO $con = null) Return the first Chart matching the query
 * @method Chart findOneOrCreate(PropelPDO $con = null) Return the first Chart matching the query, or a new Chart object populated from the query conditions when no match is found
 *
 * @method Chart findOneByTitle(string $title) Return the first Chart filtered by the title column
 * @method Chart findOneByTheme(string $theme) Return the first Chart filtered by the theme column
 * @method Chart findOneByCreatedAt(string $created_at) Return the first Chart filtered by the created_at column
 * @method Chart findOneByLastModifiedAt(string $last_modified_at) Return the first Chart filtered by the last_modified_at column
 * @method Chart findOneByType(string $type) Return the first Chart filtered by the type column
 * @method Chart findOneByMetadata(string $metadata) Return the first Chart filtered by the metadata column
 * @method Chart findOneByDeleted(boolean $deleted) Return the first Chart filtered by the deleted column
 * @method Chart findOneByDeletedAt(string $deleted_at) Return the first Chart filtered by the deleted_at column
 * @method Chart findOneByAuthorId(int $author_id) Return the first Chart filtered by the author_id column
 * @method Chart findOneByShowInGallery(boolean $show_in_gallery) Return the first Chart filtered by the show_in_gallery column
 * @method Chart findOneByLanguage(string $language) Return the first Chart filtered by the language column
 * @method Chart findOneByGuestSession(string $guest_session) Return the first Chart filtered by the guest_session column
 * @method Chart findOneByLastEditStep(int $last_edit_step) Return the first Chart filtered by the last_edit_step column
 * @method Chart findOneByPublishedAt(string $published_at) Return the first Chart filtered by the published_at column
 * @method Chart findOneByPublicUrl(string $public_url) Return the first Chart filtered by the public_url column
 * @method Chart findOneByPublicVersion(int $public_version) Return the first Chart filtered by the public_version column
 * @method Chart findOneByOrganizationId(string $organization_id) Return the first Chart filtered by the organization_id column
 * @method Chart findOneByForkedFrom(string $forked_from) Return the first Chart filtered by the forked_from column
 *
 * @method array findById(string $id) Return Chart objects filtered by the id column
 * @method array findByTitle(string $title) Return Chart objects filtered by the title column
 * @method array findByTheme(string $theme) Return Chart objects filtered by the theme column
 * @method array findByCreatedAt(string $created_at) Return Chart objects filtered by the created_at column
 * @method array findByLastModifiedAt(string $last_modified_at) Return Chart objects filtered by the last_modified_at column
 * @method array findByType(string $type) Return Chart objects filtered by the type column
 * @method array findByMetadata(string $metadata) Return Chart objects filtered by the metadata column
 * @method array findByDeleted(boolean $deleted) Return Chart objects filtered by the deleted column
 * @method array findByDeletedAt(string $deleted_at) Return Chart objects filtered by the deleted_at column
 * @method array findByAuthorId(int $author_id) Return Chart objects filtered by the author_id column
 * @method array findByShowInGallery(boolean $show_in_gallery) Return Chart objects filtered by the show_in_gallery column
 * @method array findByLanguage(string $language) Return Chart objects filtered by the language column
 * @method array findByGuestSession(string $guest_session) Return Chart objects filtered by the guest_session column
 * @method array findByLastEditStep(int $last_edit_step) Return Chart objects filtered by the last_edit_step column
 * @method array findByPublishedAt(string $published_at) Return Chart objects filtered by the published_at column
 * @method array findByPublicUrl(string $public_url) Return Chart objects filtered by the public_url column
 * @method array findByPublicVersion(int $public_version) Return Chart objects filtered by the public_version column
 * @method array findByOrganizationId(string $organization_id) Return Chart objects filtered by the organization_id column
 * @method array findByForkedFrom(string $forked_from) Return Chart objects filtered by the forked_from column
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseChartQuery extends ModelCriteria
{
    /**
     * Initializes internal state of BaseChartQuery object.
     *
     * @param     string $dbName The dabase name
     * @param     string $modelName The phpName of a model, e.g. 'Book'
     * @param     string $modelAlias The alias for the model in this query, e.g. 'b'
     */
    public function __construct($dbName = 'datawrapper', $modelName = 'Chart', $modelAlias = null)
    {
        parent::__construct($dbName, $modelName, $modelAlias);
    }

    /**
     * Returns a new ChartQuery object.
     *
     * @param     string $modelAlias The alias of a model in the query
     * @param   ChartQuery|Criteria $criteria Optional Criteria to build the query from
     *
     * @return ChartQuery
     */
    public static function create($modelAlias = null, $criteria = null)
    {
        if ($criteria instanceof ChartQuery) {
            return $criteria;
        }
        $query = new ChartQuery();
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
     * @return   Chart|Chart[]|mixed the result, formatted by the current formatter
     */
    public function findPk($key, $con = null)
    {
        if ($key === null) {
            return null;
        }
        if ((null !== ($obj = ChartPeer::getInstanceFromPool((string) $key))) && !$this->formatter) {
            // the object is alredy in the instance pool
            return $obj;
        }
        if ($con === null) {
            $con = Propel::getConnection(ChartPeer::DATABASE_NAME, Propel::CONNECTION_READ);
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
     * @return                 Chart A model object, or null if the key is not found
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
     * @return                 Chart A model object, or null if the key is not found
     * @throws PropelException
     */
    protected function findPkSimple($key, $con)
    {
        $sql = 'SELECT `id`, `title`, `theme`, `created_at`, `last_modified_at`, `type`, `metadata`, `deleted`, `deleted_at`, `author_id`, `show_in_gallery`, `language`, `guest_session`, `last_edit_step`, `published_at`, `public_url`, `public_version`, `organization_id`, `forked_from` FROM `chart` WHERE `id` = :p0';
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
            $obj = new Chart();
            $obj->hydrate($row);
            ChartPeer::addInstanceToPool($obj, (string) $key);
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
     * @return Chart|Chart[]|mixed the result, formatted by the current formatter
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
     * @return PropelObjectCollection|Chart[]|mixed the list of results, formatted by the current formatter
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
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByPrimaryKey($key)
    {

        return $this->addUsingAlias(ChartPeer::ID, $key, Criteria::EQUAL);
    }

    /**
     * Filter the query by a list of primary keys
     *
     * @param     array $keys The list of primary key to use for the query
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByPrimaryKeys($keys)
    {

        return $this->addUsingAlias(ChartPeer::ID, $keys, Criteria::IN);
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
     * @return ChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ChartPeer::ID, $id, $comparison);
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
     * @return ChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ChartPeer::TITLE, $title, $comparison);
    }

    /**
     * Filter the query on the theme column
     *
     * Example usage:
     * <code>
     * $query->filterByTheme('fooValue');   // WHERE theme = 'fooValue'
     * $query->filterByTheme('%fooValue%'); // WHERE theme LIKE '%fooValue%'
     * </code>
     *
     * @param     string $theme The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByTheme($theme = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($theme)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $theme)) {
                $theme = str_replace('*', '%', $theme);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ChartPeer::THEME, $theme, $comparison);
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
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByCreatedAt($createdAt = null, $comparison = null)
    {
        if (is_array($createdAt)) {
            $useMinMax = false;
            if (isset($createdAt['min'])) {
                $this->addUsingAlias(ChartPeer::CREATED_AT, $createdAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($createdAt['max'])) {
                $this->addUsingAlias(ChartPeer::CREATED_AT, $createdAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartPeer::CREATED_AT, $createdAt, $comparison);
    }

    /**
     * Filter the query on the last_modified_at column
     *
     * Example usage:
     * <code>
     * $query->filterByLastModifiedAt('2011-03-14'); // WHERE last_modified_at = '2011-03-14'
     * $query->filterByLastModifiedAt('now'); // WHERE last_modified_at = '2011-03-14'
     * $query->filterByLastModifiedAt(array('max' => 'yesterday')); // WHERE last_modified_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $lastModifiedAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByLastModifiedAt($lastModifiedAt = null, $comparison = null)
    {
        if (is_array($lastModifiedAt)) {
            $useMinMax = false;
            if (isset($lastModifiedAt['min'])) {
                $this->addUsingAlias(ChartPeer::LAST_MODIFIED_AT, $lastModifiedAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($lastModifiedAt['max'])) {
                $this->addUsingAlias(ChartPeer::LAST_MODIFIED_AT, $lastModifiedAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartPeer::LAST_MODIFIED_AT, $lastModifiedAt, $comparison);
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
     * @return ChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ChartPeer::TYPE, $type, $comparison);
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
     * @return ChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ChartPeer::METADATA, $metadata, $comparison);
    }

    /**
     * Filter the query on the deleted column
     *
     * Example usage:
     * <code>
     * $query->filterByDeleted(true); // WHERE deleted = true
     * $query->filterByDeleted('yes'); // WHERE deleted = true
     * </code>
     *
     * @param     boolean|string $deleted The value to use as filter.
     *              Non-boolean arguments are converted using the following rules:
     *                * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *                * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     *              Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByDeleted($deleted = null, $comparison = null)
    {
        if (is_string($deleted)) {
            $deleted = in_array(strtolower($deleted), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
        }

        return $this->addUsingAlias(ChartPeer::DELETED, $deleted, $comparison);
    }

    /**
     * Filter the query on the deleted_at column
     *
     * Example usage:
     * <code>
     * $query->filterByDeletedAt('2011-03-14'); // WHERE deleted_at = '2011-03-14'
     * $query->filterByDeletedAt('now'); // WHERE deleted_at = '2011-03-14'
     * $query->filterByDeletedAt(array('max' => 'yesterday')); // WHERE deleted_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $deletedAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByDeletedAt($deletedAt = null, $comparison = null)
    {
        if (is_array($deletedAt)) {
            $useMinMax = false;
            if (isset($deletedAt['min'])) {
                $this->addUsingAlias(ChartPeer::DELETED_AT, $deletedAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($deletedAt['max'])) {
                $this->addUsingAlias(ChartPeer::DELETED_AT, $deletedAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartPeer::DELETED_AT, $deletedAt, $comparison);
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
     * @see       filterByUser()
     *
     * @param     mixed $authorId The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByAuthorId($authorId = null, $comparison = null)
    {
        if (is_array($authorId)) {
            $useMinMax = false;
            if (isset($authorId['min'])) {
                $this->addUsingAlias(ChartPeer::AUTHOR_ID, $authorId['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($authorId['max'])) {
                $this->addUsingAlias(ChartPeer::AUTHOR_ID, $authorId['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartPeer::AUTHOR_ID, $authorId, $comparison);
    }

    /**
     * Filter the query on the show_in_gallery column
     *
     * Example usage:
     * <code>
     * $query->filterByShowInGallery(true); // WHERE show_in_gallery = true
     * $query->filterByShowInGallery('yes'); // WHERE show_in_gallery = true
     * </code>
     *
     * @param     boolean|string $showInGallery The value to use as filter.
     *              Non-boolean arguments are converted using the following rules:
     *                * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *                * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     *              Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByShowInGallery($showInGallery = null, $comparison = null)
    {
        if (is_string($showInGallery)) {
            $showInGallery = in_array(strtolower($showInGallery), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
        }

        return $this->addUsingAlias(ChartPeer::SHOW_IN_GALLERY, $showInGallery, $comparison);
    }

    /**
     * Filter the query on the language column
     *
     * Example usage:
     * <code>
     * $query->filterByLanguage('fooValue');   // WHERE language = 'fooValue'
     * $query->filterByLanguage('%fooValue%'); // WHERE language LIKE '%fooValue%'
     * </code>
     *
     * @param     string $language The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByLanguage($language = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($language)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $language)) {
                $language = str_replace('*', '%', $language);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ChartPeer::LANGUAGE, $language, $comparison);
    }

    /**
     * Filter the query on the guest_session column
     *
     * Example usage:
     * <code>
     * $query->filterByGuestSession('fooValue');   // WHERE guest_session = 'fooValue'
     * $query->filterByGuestSession('%fooValue%'); // WHERE guest_session LIKE '%fooValue%'
     * </code>
     *
     * @param     string $guestSession The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByGuestSession($guestSession = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($guestSession)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $guestSession)) {
                $guestSession = str_replace('*', '%', $guestSession);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ChartPeer::GUEST_SESSION, $guestSession, $comparison);
    }

    /**
     * Filter the query on the last_edit_step column
     *
     * Example usage:
     * <code>
     * $query->filterByLastEditStep(1234); // WHERE last_edit_step = 1234
     * $query->filterByLastEditStep(array(12, 34)); // WHERE last_edit_step IN (12, 34)
     * $query->filterByLastEditStep(array('min' => 12)); // WHERE last_edit_step >= 12
     * $query->filterByLastEditStep(array('max' => 12)); // WHERE last_edit_step <= 12
     * </code>
     *
     * @param     mixed $lastEditStep The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByLastEditStep($lastEditStep = null, $comparison = null)
    {
        if (is_array($lastEditStep)) {
            $useMinMax = false;
            if (isset($lastEditStep['min'])) {
                $this->addUsingAlias(ChartPeer::LAST_EDIT_STEP, $lastEditStep['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($lastEditStep['max'])) {
                $this->addUsingAlias(ChartPeer::LAST_EDIT_STEP, $lastEditStep['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartPeer::LAST_EDIT_STEP, $lastEditStep, $comparison);
    }

    /**
     * Filter the query on the published_at column
     *
     * Example usage:
     * <code>
     * $query->filterByPublishedAt('2011-03-14'); // WHERE published_at = '2011-03-14'
     * $query->filterByPublishedAt('now'); // WHERE published_at = '2011-03-14'
     * $query->filterByPublishedAt(array('max' => 'yesterday')); // WHERE published_at > '2011-03-13'
     * </code>
     *
     * @param     mixed $publishedAt The value to use as filter.
     *              Values can be integers (unix timestamps), DateTime objects, or strings.
     *              Empty strings are treated as NULL.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByPublishedAt($publishedAt = null, $comparison = null)
    {
        if (is_array($publishedAt)) {
            $useMinMax = false;
            if (isset($publishedAt['min'])) {
                $this->addUsingAlias(ChartPeer::PUBLISHED_AT, $publishedAt['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($publishedAt['max'])) {
                $this->addUsingAlias(ChartPeer::PUBLISHED_AT, $publishedAt['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartPeer::PUBLISHED_AT, $publishedAt, $comparison);
    }

    /**
     * Filter the query on the public_url column
     *
     * Example usage:
     * <code>
     * $query->filterByPublicUrl('fooValue');   // WHERE public_url = 'fooValue'
     * $query->filterByPublicUrl('%fooValue%'); // WHERE public_url LIKE '%fooValue%'
     * </code>
     *
     * @param     string $publicUrl The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByPublicUrl($publicUrl = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($publicUrl)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $publicUrl)) {
                $publicUrl = str_replace('*', '%', $publicUrl);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ChartPeer::PUBLIC_URL, $publicUrl, $comparison);
    }

    /**
     * Filter the query on the public_version column
     *
     * Example usage:
     * <code>
     * $query->filterByPublicVersion(1234); // WHERE public_version = 1234
     * $query->filterByPublicVersion(array(12, 34)); // WHERE public_version IN (12, 34)
     * $query->filterByPublicVersion(array('min' => 12)); // WHERE public_version >= 12
     * $query->filterByPublicVersion(array('max' => 12)); // WHERE public_version <= 12
     * </code>
     *
     * @param     mixed $publicVersion The value to use as filter.
     *              Use scalar values for equality.
     *              Use array values for in_array() equivalent.
     *              Use associative array('min' => $minValue, 'max' => $maxValue) for intervals.
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByPublicVersion($publicVersion = null, $comparison = null)
    {
        if (is_array($publicVersion)) {
            $useMinMax = false;
            if (isset($publicVersion['min'])) {
                $this->addUsingAlias(ChartPeer::PUBLIC_VERSION, $publicVersion['min'], Criteria::GREATER_EQUAL);
                $useMinMax = true;
            }
            if (isset($publicVersion['max'])) {
                $this->addUsingAlias(ChartPeer::PUBLIC_VERSION, $publicVersion['max'], Criteria::LESS_EQUAL);
                $useMinMax = true;
            }
            if ($useMinMax) {
                return $this;
            }
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }
        }

        return $this->addUsingAlias(ChartPeer::PUBLIC_VERSION, $publicVersion, $comparison);
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
     * @return ChartQuery The current query, for fluid interface
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

        return $this->addUsingAlias(ChartPeer::ORGANIZATION_ID, $organizationId, $comparison);
    }

    /**
     * Filter the query on the forked_from column
     *
     * Example usage:
     * <code>
     * $query->filterByForkedFrom('fooValue');   // WHERE forked_from = 'fooValue'
     * $query->filterByForkedFrom('%fooValue%'); // WHERE forked_from LIKE '%fooValue%'
     * </code>
     *
     * @param     string $forkedFrom The value to use as filter.
     *              Accepts wildcards (* and % trigger a LIKE)
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function filterByForkedFrom($forkedFrom = null, $comparison = null)
    {
        if (null === $comparison) {
            if (is_array($forkedFrom)) {
                $comparison = Criteria::IN;
            } elseif (preg_match('/[\%\*]/', $forkedFrom)) {
                $forkedFrom = str_replace('*', '%', $forkedFrom);
                $comparison = Criteria::LIKE;
            }
        }

        return $this->addUsingAlias(ChartPeer::FORKED_FROM, $forkedFrom, $comparison);
    }

    /**
     * Filter the query by a related User object
     *
     * @param   User|PropelObjectCollection $user The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByUser($user, $comparison = null)
    {
        if ($user instanceof User) {
            return $this
                ->addUsingAlias(ChartPeer::AUTHOR_ID, $user->getId(), $comparison);
        } elseif ($user instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartPeer::AUTHOR_ID, $user->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return ChartQuery The current query, for fluid interface
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
     * Filter the query by a related Organization object
     *
     * @param   Organization|PropelObjectCollection $organization The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByOrganization($organization, $comparison = null)
    {
        if ($organization instanceof Organization) {
            return $this
                ->addUsingAlias(ChartPeer::ORGANIZATION_ID, $organization->getId(), $comparison);
        } elseif ($organization instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartPeer::ORGANIZATION_ID, $organization->toKeyValue('PrimaryKey', 'Id'), $comparison);
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
     * @return ChartQuery The current query, for fluid interface
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
     * Filter the query by a related Chart object
     *
     * @param   Chart|PropelObjectCollection $chart The related object(s) to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChartRelatedByForkedFrom($chart, $comparison = null)
    {
        if ($chart instanceof Chart) {
            return $this
                ->addUsingAlias(ChartPeer::FORKED_FROM, $chart->getId(), $comparison);
        } elseif ($chart instanceof PropelObjectCollection) {
            if (null === $comparison) {
                $comparison = Criteria::IN;
            }

            return $this
                ->addUsingAlias(ChartPeer::FORKED_FROM, $chart->toKeyValue('PrimaryKey', 'Id'), $comparison);
        } else {
            throw new PropelException('filterByChartRelatedByForkedFrom() only accepts arguments of type Chart or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the ChartRelatedByForkedFrom relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function joinChartRelatedByForkedFrom($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('ChartRelatedByForkedFrom');

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
            $this->addJoinObject($join, 'ChartRelatedByForkedFrom');
        }

        return $this;
    }

    /**
     * Use the ChartRelatedByForkedFrom relation Chart object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   ChartQuery A secondary query class using the current class as primary query
     */
    public function useChartRelatedByForkedFromQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinChartRelatedByForkedFrom($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'ChartRelatedByForkedFrom', 'ChartQuery');
    }

    /**
     * Filter the query by a related Chart object
     *
     * @param   Chart|PropelObjectCollection $chart  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByChartRelatedById($chart, $comparison = null)
    {
        if ($chart instanceof Chart) {
            return $this
                ->addUsingAlias(ChartPeer::ID, $chart->getForkedFrom(), $comparison);
        } elseif ($chart instanceof PropelObjectCollection) {
            return $this
                ->useChartRelatedByIdQuery()
                ->filterByPrimaryKeys($chart->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByChartRelatedById() only accepts arguments of type Chart or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the ChartRelatedById relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function joinChartRelatedById($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('ChartRelatedById');

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
            $this->addJoinObject($join, 'ChartRelatedById');
        }

        return $this;
    }

    /**
     * Use the ChartRelatedById relation Chart object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   ChartQuery A secondary query class using the current class as primary query
     */
    public function useChartRelatedByIdQuery($relationAlias = null, $joinType = Criteria::LEFT_JOIN)
    {
        return $this
            ->joinChartRelatedById($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'ChartRelatedById', 'ChartQuery');
    }

    /**
     * Filter the query by a related Job object
     *
     * @param   Job|PropelObjectCollection $job  the related object to use as filter
     * @param     string $comparison Operator to use for the column comparison, defaults to Criteria::EQUAL
     *
     * @return                 ChartQuery The current query, for fluid interface
     * @throws PropelException - if the provided filter is invalid.
     */
    public function filterByJob($job, $comparison = null)
    {
        if ($job instanceof Job) {
            return $this
                ->addUsingAlias(ChartPeer::ID, $job->getChartId(), $comparison);
        } elseif ($job instanceof PropelObjectCollection) {
            return $this
                ->useJobQuery()
                ->filterByPrimaryKeys($job->getPrimaryKeys())
                ->endUse();
        } else {
            throw new PropelException('filterByJob() only accepts arguments of type Job or PropelCollection');
        }
    }

    /**
     * Adds a JOIN clause to the query using the Job relation
     *
     * @param     string $relationAlias optional alias for the relation
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function joinJob($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        $tableMap = $this->getTableMap();
        $relationMap = $tableMap->getRelation('Job');

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
            $this->addJoinObject($join, 'Job');
        }

        return $this;
    }

    /**
     * Use the Job relation Job object
     *
     * @see       useQuery()
     *
     * @param     string $relationAlias optional alias for the relation,
     *                                   to be used as main alias in the secondary query
     * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'
     *
     * @return   JobQuery A secondary query class using the current class as primary query
     */
    public function useJobQuery($relationAlias = null, $joinType = Criteria::INNER_JOIN)
    {
        return $this
            ->joinJob($relationAlias, $joinType)
            ->useQuery($relationAlias ? $relationAlias : 'Job', 'JobQuery');
    }

    /**
     * Exclude object from result
     *
     * @param   Chart $chart Object to remove from the list of results
     *
     * @return ChartQuery The current query, for fluid interface
     */
    public function prune($chart = null)
    {
        if ($chart) {
            $this->addUsingAlias(ChartPeer::ID, $chart->getId(), Criteria::NOT_EQUAL);
        }

        return $this;
    }

}
