<?php


/**
 * Base static class for performing query and update operations on the 'chart_folders' table.
 *
 *
 *
 * @package propel.generator.datawrapper.om
 */
abstract class BaseChartFoldersPeer
{

    /** the default database name for this class */
    const DATABASE_NAME = 'datawrapper';

    /** the table name for this class */
    const TABLE_NAME = 'chart_folders';

    /** the related Propel class for this table */
    const OM_CLASS = 'ChartFolders';

    /** the related TableMap class for this table */
    const TM_CLASS = 'ChartFoldersTableMap';

    /** The total number of columns. */
    const NUM_COLUMNS = 4;

    /** The number of lazy-loaded columns. */
    const NUM_LAZY_LOAD_COLUMNS = 0;

    /** The number of columns to hydrate (NUM_COLUMNS - NUM_LAZY_LOAD_COLUMNS) */
    const NUM_HYDRATE_COLUMNS = 4;

    /** the column name for the map_id field */
    const MAP_ID = 'chart_folders.map_id';

    /** the column name for the chart_id field */
    const CHART_ID = 'chart_folders.chart_id';

    /** the column name for the user_folder field */
    const USER_FOLDER = 'chart_folders.user_folder';

    /** the column name for the org_folder field */
    const ORG_FOLDER = 'chart_folders.org_folder';

    /** The default string format for model objects of the related table **/
    const DEFAULT_STRING_FORMAT = 'YAML';

    /**
     * An identiy map to hold any loaded instances of ChartFolders objects.
     * This must be public so that other peer classes can access this when hydrating from JOIN
     * queries.
     * @var        array ChartFolders[]
     */
    public static $instances = array();


    /**
     * holds an array of fieldnames
     *
     * first dimension keys are the type constants
     * e.g. ChartFoldersPeer::$fieldNames[ChartFoldersPeer::TYPE_PHPNAME][0] = 'Id'
     */
    protected static $fieldNames = array (
        BasePeer::TYPE_PHPNAME => array ('MapId', 'ChartId', 'UserFolder', 'OrgFolder', ),
        BasePeer::TYPE_STUDLYPHPNAME => array ('mapId', 'chartId', 'userFolder', 'orgFolder', ),
        BasePeer::TYPE_COLNAME => array (ChartFoldersPeer::MAP_ID, ChartFoldersPeer::CHART_ID, ChartFoldersPeer::USER_FOLDER, ChartFoldersPeer::ORG_FOLDER, ),
        BasePeer::TYPE_RAW_COLNAME => array ('MAP_ID', 'CHART_ID', 'USER_FOLDER', 'ORG_FOLDER', ),
        BasePeer::TYPE_FIELDNAME => array ('map_id', 'chart_id', 'user_folder', 'org_folder', ),
        BasePeer::TYPE_NUM => array (0, 1, 2, 3, )
    );

    /**
     * holds an array of keys for quick access to the fieldnames array
     *
     * first dimension keys are the type constants
     * e.g. ChartFoldersPeer::$fieldNames[BasePeer::TYPE_PHPNAME]['Id'] = 0
     */
    protected static $fieldKeys = array (
        BasePeer::TYPE_PHPNAME => array ('MapId' => 0, 'ChartId' => 1, 'UserFolder' => 2, 'OrgFolder' => 3, ),
        BasePeer::TYPE_STUDLYPHPNAME => array ('mapId' => 0, 'chartId' => 1, 'userFolder' => 2, 'orgFolder' => 3, ),
        BasePeer::TYPE_COLNAME => array (ChartFoldersPeer::MAP_ID => 0, ChartFoldersPeer::CHART_ID => 1, ChartFoldersPeer::USER_FOLDER => 2, ChartFoldersPeer::ORG_FOLDER => 3, ),
        BasePeer::TYPE_RAW_COLNAME => array ('MAP_ID' => 0, 'CHART_ID' => 1, 'USER_FOLDER' => 2, 'ORG_FOLDER' => 3, ),
        BasePeer::TYPE_FIELDNAME => array ('map_id' => 0, 'chart_id' => 1, 'user_folder' => 2, 'org_folder' => 3, ),
        BasePeer::TYPE_NUM => array (0, 1, 2, 3, )
    );

    /**
     * Translates a fieldname to another type
     *
     * @param      string $name field name
     * @param      string $fromType One of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME
     *                         BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM
     * @param      string $toType   One of the class type constants
     * @return string          translated name of the field.
     * @throws PropelException - if the specified name could not be found in the fieldname mappings.
     */
    public static function translateFieldName($name, $fromType, $toType)
    {
        $toNames = ChartFoldersPeer::getFieldNames($toType);
        $key = isset(ChartFoldersPeer::$fieldKeys[$fromType][$name]) ? ChartFoldersPeer::$fieldKeys[$fromType][$name] : null;
        if ($key === null) {
            throw new PropelException("'$name' could not be found in the field names of type '$fromType'. These are: " . print_r(ChartFoldersPeer::$fieldKeys[$fromType], true));
        }

        return $toNames[$key];
    }

    /**
     * Returns an array of field names.
     *
     * @param      string $type The type of fieldnames to return:
     *                      One of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME
     *                      BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM
     * @return array           A list of field names
     * @throws PropelException - if the type is not valid.
     */
    public static function getFieldNames($type = BasePeer::TYPE_PHPNAME)
    {
        if (!array_key_exists($type, ChartFoldersPeer::$fieldNames)) {
            throw new PropelException('Method getFieldNames() expects the parameter $type to be one of the class constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME, BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM. ' . $type . ' was given.');
        }

        return ChartFoldersPeer::$fieldNames[$type];
    }

    /**
     * Convenience method which changes table.column to alias.column.
     *
     * Using this method you can maintain SQL abstraction while using column aliases.
     * <code>
     *		$c->addAlias("alias1", TablePeer::TABLE_NAME);
     *		$c->addJoin(TablePeer::alias("alias1", TablePeer::PRIMARY_KEY_COLUMN), TablePeer::PRIMARY_KEY_COLUMN);
     * </code>
     * @param      string $alias The alias for the current table.
     * @param      string $column The column name for current table. (i.e. ChartFoldersPeer::COLUMN_NAME).
     * @return string
     */
    public static function alias($alias, $column)
    {
        return str_replace(ChartFoldersPeer::TABLE_NAME.'.', $alias.'.', $column);
    }

    /**
     * Add all the columns needed to create a new object.
     *
     * Note: any columns that were marked with lazyLoad="true" in the
     * XML schema will not be added to the select list and only loaded
     * on demand.
     *
     * @param      Criteria $criteria object containing the columns to add.
     * @param      string   $alias    optional table alias
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function addSelectColumns(Criteria $criteria, $alias = null)
    {
        if (null === $alias) {
            $criteria->addSelectColumn(ChartFoldersPeer::MAP_ID);
            $criteria->addSelectColumn(ChartFoldersPeer::CHART_ID);
            $criteria->addSelectColumn(ChartFoldersPeer::USER_FOLDER);
            $criteria->addSelectColumn(ChartFoldersPeer::ORG_FOLDER);
        } else {
            $criteria->addSelectColumn($alias . '.map_id');
            $criteria->addSelectColumn($alias . '.chart_id');
            $criteria->addSelectColumn($alias . '.user_folder');
            $criteria->addSelectColumn($alias . '.org_folder');
        }
    }

    /**
     * Returns the number of rows matching criteria.
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @return int Number of matching rows.
     */
    public static function doCount(Criteria $criteria, $distinct = false, PropelPDO $con = null)
    {
        // we may modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY won't ever affect the count
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME); // Set the correct dbName

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }
        // BasePeer returns a PDOStatement
        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }
    /**
     * Selects one object from the DB.
     *
     * @param      Criteria $criteria object used to create the SELECT statement.
     * @param      PropelPDO $con
     * @return                 ChartFolders
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectOne(Criteria $criteria, PropelPDO $con = null)
    {
        $critcopy = clone $criteria;
        $critcopy->setLimit(1);
        $objects = ChartFoldersPeer::doSelect($critcopy, $con);
        if ($objects) {
            return $objects[0];
        }

        return null;
    }
    /**
     * Selects several row from the DB.
     *
     * @param      Criteria $criteria The Criteria object used to build the SELECT statement.
     * @param      PropelPDO $con
     * @return array           Array of selected Objects
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelect(Criteria $criteria, PropelPDO $con = null)
    {
        return ChartFoldersPeer::populateObjects(ChartFoldersPeer::doSelectStmt($criteria, $con));
    }
    /**
     * Prepares the Criteria object and uses the parent doSelect() method to execute a PDOStatement.
     *
     * Use this method directly if you want to work with an executed statement directly (for example
     * to perform your own object hydration).
     *
     * @param      Criteria $criteria The Criteria object used to build the SELECT statement.
     * @param      PropelPDO $con The connection to use
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     * @return PDOStatement The executed PDOStatement object.
     * @see        BasePeer::doSelect()
     */
    public static function doSelectStmt(Criteria $criteria, PropelPDO $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        if (!$criteria->hasSelectClause()) {
            $criteria = clone $criteria;
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        // BasePeer returns a PDOStatement
        return BasePeer::doSelect($criteria, $con);
    }
    /**
     * Adds an object to the instance pool.
     *
     * Propel keeps cached copies of objects in an instance pool when they are retrieved
     * from the database.  In some cases -- especially when you override doSelect*()
     * methods in your stub classes -- you may need to explicitly add objects
     * to the cache in order to ensure that the same objects are always returned by doSelect*()
     * and retrieveByPK*() calls.
     *
     * @param      ChartFolders $obj A ChartFolders object.
     * @param      string $key (optional) key to use for instance map (for performance boost if key was already calculated externally).
     */
    public static function addInstanceToPool($obj, $key = null)
    {
        if (Propel::isInstancePoolingEnabled()) {
            if ($key === null) {
                $key = (string) $obj->getMapId();
            } // if key === null
            ChartFoldersPeer::$instances[$key] = $obj;
        }
    }

    /**
     * Removes an object from the instance pool.
     *
     * Propel keeps cached copies of objects in an instance pool when they are retrieved
     * from the database.  In some cases -- especially when you override doDelete
     * methods in your stub classes -- you may need to explicitly remove objects
     * from the cache in order to prevent returning objects that no longer exist.
     *
     * @param      mixed $value A ChartFolders object or a primary key value.
     *
     * @return void
     * @throws PropelException - if the value is invalid.
     */
    public static function removeInstanceFromPool($value)
    {
        if (Propel::isInstancePoolingEnabled() && $value !== null) {
            if (is_object($value) && $value instanceof ChartFolders) {
                $key = (string) $value->getMapId();
            } elseif (is_scalar($value)) {
                // assume we've been passed a primary key
                $key = (string) $value;
            } else {
                $e = new PropelException("Invalid value passed to removeInstanceFromPool().  Expected primary key or ChartFolders object; got " . (is_object($value) ? get_class($value) . ' object.' : var_export($value,true)));
                throw $e;
            }

            unset(ChartFoldersPeer::$instances[$key]);
        }
    } // removeInstanceFromPool()

    /**
     * Retrieves a string version of the primary key from the DB resultset row that can be used to uniquely identify a row in this table.
     *
     * For tables with a single-column primary key, that simple pkey value will be returned.  For tables with
     * a multi-column primary key, a serialize()d version of the primary key will be returned.
     *
     * @param      string $key The key (@see getPrimaryKeyHash()) for this instance.
     * @return   ChartFolders Found object or null if 1) no instance exists for specified key or 2) instance pooling has been disabled.
     * @see        getPrimaryKeyHash()
     */
    public static function getInstanceFromPool($key)
    {
        if (Propel::isInstancePoolingEnabled()) {
            if (isset(ChartFoldersPeer::$instances[$key])) {
                return ChartFoldersPeer::$instances[$key];
            }
        }

        return null; // just to be explicit
    }

    /**
     * Clear the instance pool.
     *
     * @return void
     */
    public static function clearInstancePool($and_clear_all_references = false)
    {
      if ($and_clear_all_references)
      {
        foreach (ChartFoldersPeer::$instances as $instance)
        {
          $instance->clearAllReferences(true);
        }
      }
        ChartFoldersPeer::$instances = array();
    }

    /**
     * Method to invalidate the instance pool of all tables related to chart_folders
     * by a foreign key with ON DELETE CASCADE
     */
    public static function clearRelatedInstancePool()
    {
    }

    /**
     * Retrieves a string version of the primary key from the DB resultset row that can be used to uniquely identify a row in this table.
     *
     * For tables with a single-column primary key, that simple pkey value will be returned.  For tables with
     * a multi-column primary key, a serialize()d version of the primary key will be returned.
     *
     * @param      array $row PropelPDO resultset row.
     * @param      int $startcol The 0-based offset for reading from the resultset row.
     * @return string A string version of PK or null if the components of primary key in result array are all null.
     */
    public static function getPrimaryKeyHashFromRow($row, $startcol = 0)
    {
        // If the PK cannot be derived from the row, return null.
        if ($row[$startcol] === null) {
            return null;
        }

        return (string) $row[$startcol];
    }

    /**
     * Retrieves the primary key from the DB resultset row
     * For tables with a single-column primary key, that simple pkey value will be returned.  For tables with
     * a multi-column primary key, an array of the primary key columns will be returned.
     *
     * @param      array $row PropelPDO resultset row.
     * @param      int $startcol The 0-based offset for reading from the resultset row.
     * @return mixed The primary key of the row
     */
    public static function getPrimaryKeyFromRow($row, $startcol = 0)
    {

        return (int) $row[$startcol];
    }

    /**
     * The returned array will contain objects of the default type or
     * objects that inherit from the default.
     *
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function populateObjects(PDOStatement $stmt)
    {
        $results = array();

        // set the class once to avoid overhead in the loop
        $cls = ChartFoldersPeer::getOMClass();
        // populate the object(s)
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj = ChartFoldersPeer::getInstanceFromPool($key))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj->hydrate($row, 0, true); // rehydrate
                $results[] = $obj;
            } else {
                $obj = new $cls();
                $obj->hydrate($row);
                $results[] = $obj;
                ChartFoldersPeer::addInstanceToPool($obj, $key);
            } // if key exists
        }
        $stmt->closeCursor();

        return $results;
    }
    /**
     * Populates an object of the default type or an object that inherit from the default.
     *
     * @param      array $row PropelPDO resultset row.
     * @param      int $startcol The 0-based offset for reading from the resultset row.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     * @return array (ChartFolders object, last column rank)
     */
    public static function populateObject($row, $startcol = 0)
    {
        $key = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol);
        if (null !== ($obj = ChartFoldersPeer::getInstanceFromPool($key))) {
            // We no longer rehydrate the object, since this can cause data loss.
            // See http://www.propelorm.org/ticket/509
            // $obj->hydrate($row, $startcol, true); // rehydrate
            $col = $startcol + ChartFoldersPeer::NUM_HYDRATE_COLUMNS;
        } else {
            $cls = ChartFoldersPeer::OM_CLASS;
            $obj = new $cls();
            $col = $obj->hydrate($row, $startcol);
            ChartFoldersPeer::addInstanceToPool($obj, $key);
        }

        return array($obj, $col);
    }


    /**
     * Returns the number of rows matching criteria, joining the related Chart table
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return int Number of matching rows.
     */
    public static function doCountJoinChart(Criteria $criteria, $distinct = false, PropelPDO $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        // we're going to modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY won't ever affect the count

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }


    /**
     * Returns the number of rows matching criteria, joining the related UserFolders table
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return int Number of matching rows.
     */
    public static function doCountJoinUserFolders(Criteria $criteria, $distinct = false, PropelPDO $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        // we're going to modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY won't ever affect the count

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);

        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }


    /**
     * Returns the number of rows matching criteria, joining the related OrganizationFolders table
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return int Number of matching rows.
     */
    public static function doCountJoinOrganizationFolders(Criteria $criteria, $distinct = false, PropelPDO $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        // we're going to modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY won't ever affect the count

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);

        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }


    /**
     * Selects a collection of ChartFolders objects pre-filled with their Chart objects.
     * @param      Criteria  $criteria
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return array           Array of ChartFolders objects.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectJoinChart(Criteria $criteria, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $criteria = clone $criteria;

        // Set the correct dbName if it has not been overridden
        if ($criteria->getDbName() == Propel::getDefaultDB()) {
            $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);
        }

        ChartFoldersPeer::addSelectColumns($criteria);
        $startcol = ChartFoldersPeer::NUM_HYDRATE_COLUMNS;
        ChartPeer::addSelectColumns($criteria);

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $stmt = BasePeer::doSelect($criteria, $con);
        $results = array();

        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key1 = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj1 = ChartFoldersPeer::getInstanceFromPool($key1))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj1->hydrate($row, 0, true); // rehydrate
            } else {

                $cls = ChartFoldersPeer::getOMClass();

                $obj1 = new $cls();
                $obj1->hydrate($row);
                ChartFoldersPeer::addInstanceToPool($obj1, $key1);
            } // if $obj1 already loaded

            $key2 = ChartPeer::getPrimaryKeyHashFromRow($row, $startcol);
            if ($key2 !== null) {
                $obj2 = ChartPeer::getInstanceFromPool($key2);
                if (!$obj2) {

                    $cls = ChartPeer::getOMClass();

                    $obj2 = new $cls();
                    $obj2->hydrate($row, $startcol);
                    ChartPeer::addInstanceToPool($obj2, $key2);
                } // if obj2 already loaded

                // Add the $obj1 (ChartFolders) to $obj2 (Chart)
                $obj2->addChartFolders($obj1);

            } // if joined row was not null

            $results[] = $obj1;
        }
        $stmt->closeCursor();

        return $results;
    }


    /**
     * Selects a collection of ChartFolders objects pre-filled with their UserFolders objects.
     * @param      Criteria  $criteria
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return array           Array of ChartFolders objects.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectJoinUserFolders(Criteria $criteria, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $criteria = clone $criteria;

        // Set the correct dbName if it has not been overridden
        if ($criteria->getDbName() == Propel::getDefaultDB()) {
            $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);
        }

        ChartFoldersPeer::addSelectColumns($criteria);
        $startcol = ChartFoldersPeer::NUM_HYDRATE_COLUMNS;
        UserFoldersPeer::addSelectColumns($criteria);

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);

        $stmt = BasePeer::doSelect($criteria, $con);
        $results = array();

        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key1 = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj1 = ChartFoldersPeer::getInstanceFromPool($key1))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj1->hydrate($row, 0, true); // rehydrate
            } else {

                $cls = ChartFoldersPeer::getOMClass();

                $obj1 = new $cls();
                $obj1->hydrate($row);
                ChartFoldersPeer::addInstanceToPool($obj1, $key1);
            } // if $obj1 already loaded

            $key2 = UserFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol);
            if ($key2 !== null) {
                $obj2 = UserFoldersPeer::getInstanceFromPool($key2);
                if (!$obj2) {

                    $cls = UserFoldersPeer::getOMClass();

                    $obj2 = new $cls();
                    $obj2->hydrate($row, $startcol);
                    UserFoldersPeer::addInstanceToPool($obj2, $key2);
                } // if obj2 already loaded

                // Add the $obj1 (ChartFolders) to $obj2 (UserFolders)
                $obj2->addChartFolders($obj1);

            } // if joined row was not null

            $results[] = $obj1;
        }
        $stmt->closeCursor();

        return $results;
    }


    /**
     * Selects a collection of ChartFolders objects pre-filled with their OrganizationFolders objects.
     * @param      Criteria  $criteria
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return array           Array of ChartFolders objects.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectJoinOrganizationFolders(Criteria $criteria, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $criteria = clone $criteria;

        // Set the correct dbName if it has not been overridden
        if ($criteria->getDbName() == Propel::getDefaultDB()) {
            $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);
        }

        ChartFoldersPeer::addSelectColumns($criteria);
        $startcol = ChartFoldersPeer::NUM_HYDRATE_COLUMNS;
        OrganizationFoldersPeer::addSelectColumns($criteria);

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);

        $stmt = BasePeer::doSelect($criteria, $con);
        $results = array();

        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key1 = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj1 = ChartFoldersPeer::getInstanceFromPool($key1))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj1->hydrate($row, 0, true); // rehydrate
            } else {

                $cls = ChartFoldersPeer::getOMClass();

                $obj1 = new $cls();
                $obj1->hydrate($row);
                ChartFoldersPeer::addInstanceToPool($obj1, $key1);
            } // if $obj1 already loaded

            $key2 = OrganizationFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol);
            if ($key2 !== null) {
                $obj2 = OrganizationFoldersPeer::getInstanceFromPool($key2);
                if (!$obj2) {

                    $cls = OrganizationFoldersPeer::getOMClass();

                    $obj2 = new $cls();
                    $obj2->hydrate($row, $startcol);
                    OrganizationFoldersPeer::addInstanceToPool($obj2, $key2);
                } // if obj2 already loaded

                // Add the $obj1 (ChartFolders) to $obj2 (OrganizationFolders)
                $obj2->addChartFolders($obj1);

            } // if joined row was not null

            $results[] = $obj1;
        }
        $stmt->closeCursor();

        return $results;
    }


    /**
     * Returns the number of rows matching criteria, joining all related tables
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return int Number of matching rows.
     */
    public static function doCountJoinAll(Criteria $criteria, $distinct = false, PropelPDO $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        // we're going to modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY won't ever affect the count

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);

        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }

    /**
     * Selects a collection of ChartFolders objects pre-filled with all related objects.
     *
     * @param      Criteria  $criteria
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return array           Array of ChartFolders objects.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectJoinAll(Criteria $criteria, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $criteria = clone $criteria;

        // Set the correct dbName if it has not been overridden
        if ($criteria->getDbName() == Propel::getDefaultDB()) {
            $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);
        }

        ChartFoldersPeer::addSelectColumns($criteria);
        $startcol2 = ChartFoldersPeer::NUM_HYDRATE_COLUMNS;

        ChartPeer::addSelectColumns($criteria);
        $startcol3 = $startcol2 + ChartPeer::NUM_HYDRATE_COLUMNS;

        UserFoldersPeer::addSelectColumns($criteria);
        $startcol4 = $startcol3 + UserFoldersPeer::NUM_HYDRATE_COLUMNS;

        OrganizationFoldersPeer::addSelectColumns($criteria);
        $startcol5 = $startcol4 + OrganizationFoldersPeer::NUM_HYDRATE_COLUMNS;

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);

        $stmt = BasePeer::doSelect($criteria, $con);
        $results = array();

        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key1 = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj1 = ChartFoldersPeer::getInstanceFromPool($key1))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj1->hydrate($row, 0, true); // rehydrate
            } else {
                $cls = ChartFoldersPeer::getOMClass();

                $obj1 = new $cls();
                $obj1->hydrate($row);
                ChartFoldersPeer::addInstanceToPool($obj1, $key1);
            } // if obj1 already loaded

            // Add objects for joined Chart rows

            $key2 = ChartPeer::getPrimaryKeyHashFromRow($row, $startcol2);
            if ($key2 !== null) {
                $obj2 = ChartPeer::getInstanceFromPool($key2);
                if (!$obj2) {

                    $cls = ChartPeer::getOMClass();

                    $obj2 = new $cls();
                    $obj2->hydrate($row, $startcol2);
                    ChartPeer::addInstanceToPool($obj2, $key2);
                } // if obj2 loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj2 (Chart)
                $obj2->addChartFolders($obj1);
            } // if joined row not null

            // Add objects for joined UserFolders rows

            $key3 = UserFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol3);
            if ($key3 !== null) {
                $obj3 = UserFoldersPeer::getInstanceFromPool($key3);
                if (!$obj3) {

                    $cls = UserFoldersPeer::getOMClass();

                    $obj3 = new $cls();
                    $obj3->hydrate($row, $startcol3);
                    UserFoldersPeer::addInstanceToPool($obj3, $key3);
                } // if obj3 loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj3 (UserFolders)
                $obj3->addChartFolders($obj1);
            } // if joined row not null

            // Add objects for joined OrganizationFolders rows

            $key4 = OrganizationFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol4);
            if ($key4 !== null) {
                $obj4 = OrganizationFoldersPeer::getInstanceFromPool($key4);
                if (!$obj4) {

                    $cls = OrganizationFoldersPeer::getOMClass();

                    $obj4 = new $cls();
                    $obj4->hydrate($row, $startcol4);
                    OrganizationFoldersPeer::addInstanceToPool($obj4, $key4);
                } // if obj4 loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj4 (OrganizationFolders)
                $obj4->addChartFolders($obj1);
            } // if joined row not null

            $results[] = $obj1;
        }
        $stmt->closeCursor();

        return $results;
    }


    /**
     * Returns the number of rows matching criteria, joining the related Chart table
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return int Number of matching rows.
     */
    public static function doCountJoinAllExceptChart(Criteria $criteria, $distinct = false, PropelPDO $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        // we're going to modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY should not affect count

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);

        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }


    /**
     * Returns the number of rows matching criteria, joining the related UserFolders table
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return int Number of matching rows.
     */
    public static function doCountJoinAllExceptUserFolders(Criteria $criteria, $distinct = false, PropelPDO $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        // we're going to modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY should not affect count

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);

        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }


    /**
     * Returns the number of rows matching criteria, joining the related OrganizationFolders table
     *
     * @param      Criteria $criteria
     * @param      boolean $distinct Whether to select only distinct columns; deprecated: use Criteria->setDistinct() instead.
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return int Number of matching rows.
     */
    public static function doCountJoinAllExceptOrganizationFolders(Criteria $criteria, $distinct = false, PropelPDO $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        // we're going to modify criteria, so copy it first
        $criteria = clone $criteria;

        // We need to set the primary table name, since in the case that there are no WHERE columns
        // it will be impossible for the BasePeer::createSelectSql() method to determine which
        // tables go into the FROM clause.
        $criteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);

        if ($distinct && !in_array(Criteria::DISTINCT, $criteria->getSelectModifiers())) {
            $criteria->setDistinct();
        }

        if (!$criteria->hasSelectClause()) {
            ChartFoldersPeer::addSelectColumns($criteria);
        }

        $criteria->clearOrderByColumns(); // ORDER BY should not affect count

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);

        $stmt = BasePeer::doCount($criteria, $con);

        if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $count = (int) $row[0];
        } else {
            $count = 0; // no rows returned; we infer that means 0 matches.
        }
        $stmt->closeCursor();

        return $count;
    }


    /**
     * Selects a collection of ChartFolders objects pre-filled with all related objects except Chart.
     *
     * @param      Criteria  $criteria
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return array           Array of ChartFolders objects.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectJoinAllExceptChart(Criteria $criteria, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $criteria = clone $criteria;

        // Set the correct dbName if it has not been overridden
        // $criteria->getDbName() will return the same object if not set to another value
        // so == check is okay and faster
        if ($criteria->getDbName() == Propel::getDefaultDB()) {
            $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);
        }

        ChartFoldersPeer::addSelectColumns($criteria);
        $startcol2 = ChartFoldersPeer::NUM_HYDRATE_COLUMNS;

        UserFoldersPeer::addSelectColumns($criteria);
        $startcol3 = $startcol2 + UserFoldersPeer::NUM_HYDRATE_COLUMNS;

        OrganizationFoldersPeer::addSelectColumns($criteria);
        $startcol4 = $startcol3 + OrganizationFoldersPeer::NUM_HYDRATE_COLUMNS;

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);


        $stmt = BasePeer::doSelect($criteria, $con);
        $results = array();

        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key1 = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj1 = ChartFoldersPeer::getInstanceFromPool($key1))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj1->hydrate($row, 0, true); // rehydrate
            } else {
                $cls = ChartFoldersPeer::getOMClass();

                $obj1 = new $cls();
                $obj1->hydrate($row);
                ChartFoldersPeer::addInstanceToPool($obj1, $key1);
            } // if obj1 already loaded

                // Add objects for joined UserFolders rows

                $key2 = UserFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol2);
                if ($key2 !== null) {
                    $obj2 = UserFoldersPeer::getInstanceFromPool($key2);
                    if (!$obj2) {

                        $cls = UserFoldersPeer::getOMClass();

                    $obj2 = new $cls();
                    $obj2->hydrate($row, $startcol2);
                    UserFoldersPeer::addInstanceToPool($obj2, $key2);
                } // if $obj2 already loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj2 (UserFolders)
                $obj2->addChartFolders($obj1);

            } // if joined row is not null

                // Add objects for joined OrganizationFolders rows

                $key3 = OrganizationFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol3);
                if ($key3 !== null) {
                    $obj3 = OrganizationFoldersPeer::getInstanceFromPool($key3);
                    if (!$obj3) {

                        $cls = OrganizationFoldersPeer::getOMClass();

                    $obj3 = new $cls();
                    $obj3->hydrate($row, $startcol3);
                    OrganizationFoldersPeer::addInstanceToPool($obj3, $key3);
                } // if $obj3 already loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj3 (OrganizationFolders)
                $obj3->addChartFolders($obj1);

            } // if joined row is not null

            $results[] = $obj1;
        }
        $stmt->closeCursor();

        return $results;
    }


    /**
     * Selects a collection of ChartFolders objects pre-filled with all related objects except UserFolders.
     *
     * @param      Criteria  $criteria
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return array           Array of ChartFolders objects.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectJoinAllExceptUserFolders(Criteria $criteria, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $criteria = clone $criteria;

        // Set the correct dbName if it has not been overridden
        // $criteria->getDbName() will return the same object if not set to another value
        // so == check is okay and faster
        if ($criteria->getDbName() == Propel::getDefaultDB()) {
            $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);
        }

        ChartFoldersPeer::addSelectColumns($criteria);
        $startcol2 = ChartFoldersPeer::NUM_HYDRATE_COLUMNS;

        ChartPeer::addSelectColumns($criteria);
        $startcol3 = $startcol2 + ChartPeer::NUM_HYDRATE_COLUMNS;

        OrganizationFoldersPeer::addSelectColumns($criteria);
        $startcol4 = $startcol3 + OrganizationFoldersPeer::NUM_HYDRATE_COLUMNS;

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::ORG_FOLDER, OrganizationFoldersPeer::OF_ID, $join_behavior);


        $stmt = BasePeer::doSelect($criteria, $con);
        $results = array();

        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key1 = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj1 = ChartFoldersPeer::getInstanceFromPool($key1))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj1->hydrate($row, 0, true); // rehydrate
            } else {
                $cls = ChartFoldersPeer::getOMClass();

                $obj1 = new $cls();
                $obj1->hydrate($row);
                ChartFoldersPeer::addInstanceToPool($obj1, $key1);
            } // if obj1 already loaded

                // Add objects for joined Chart rows

                $key2 = ChartPeer::getPrimaryKeyHashFromRow($row, $startcol2);
                if ($key2 !== null) {
                    $obj2 = ChartPeer::getInstanceFromPool($key2);
                    if (!$obj2) {

                        $cls = ChartPeer::getOMClass();

                    $obj2 = new $cls();
                    $obj2->hydrate($row, $startcol2);
                    ChartPeer::addInstanceToPool($obj2, $key2);
                } // if $obj2 already loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj2 (Chart)
                $obj2->addChartFolders($obj1);

            } // if joined row is not null

                // Add objects for joined OrganizationFolders rows

                $key3 = OrganizationFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol3);
                if ($key3 !== null) {
                    $obj3 = OrganizationFoldersPeer::getInstanceFromPool($key3);
                    if (!$obj3) {

                        $cls = OrganizationFoldersPeer::getOMClass();

                    $obj3 = new $cls();
                    $obj3->hydrate($row, $startcol3);
                    OrganizationFoldersPeer::addInstanceToPool($obj3, $key3);
                } // if $obj3 already loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj3 (OrganizationFolders)
                $obj3->addChartFolders($obj1);

            } // if joined row is not null

            $results[] = $obj1;
        }
        $stmt->closeCursor();

        return $results;
    }


    /**
     * Selects a collection of ChartFolders objects pre-filled with all related objects except OrganizationFolders.
     *
     * @param      Criteria  $criteria
     * @param      PropelPDO $con
     * @param      String    $join_behavior the type of joins to use, defaults to Criteria::LEFT_JOIN
     * @return array           Array of ChartFolders objects.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doSelectJoinAllExceptOrganizationFolders(Criteria $criteria, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $criteria = clone $criteria;

        // Set the correct dbName if it has not been overridden
        // $criteria->getDbName() will return the same object if not set to another value
        // so == check is okay and faster
        if ($criteria->getDbName() == Propel::getDefaultDB()) {
            $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);
        }

        ChartFoldersPeer::addSelectColumns($criteria);
        $startcol2 = ChartFoldersPeer::NUM_HYDRATE_COLUMNS;

        ChartPeer::addSelectColumns($criteria);
        $startcol3 = $startcol2 + ChartPeer::NUM_HYDRATE_COLUMNS;

        UserFoldersPeer::addSelectColumns($criteria);
        $startcol4 = $startcol3 + UserFoldersPeer::NUM_HYDRATE_COLUMNS;

        $criteria->addJoin(ChartFoldersPeer::CHART_ID, ChartPeer::ID, $join_behavior);

        $criteria->addJoin(ChartFoldersPeer::USER_FOLDER, UserFoldersPeer::UF_ID, $join_behavior);


        $stmt = BasePeer::doSelect($criteria, $con);
        $results = array();

        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $key1 = ChartFoldersPeer::getPrimaryKeyHashFromRow($row, 0);
            if (null !== ($obj1 = ChartFoldersPeer::getInstanceFromPool($key1))) {
                // We no longer rehydrate the object, since this can cause data loss.
                // See http://www.propelorm.org/ticket/509
                // $obj1->hydrate($row, 0, true); // rehydrate
            } else {
                $cls = ChartFoldersPeer::getOMClass();

                $obj1 = new $cls();
                $obj1->hydrate($row);
                ChartFoldersPeer::addInstanceToPool($obj1, $key1);
            } // if obj1 already loaded

                // Add objects for joined Chart rows

                $key2 = ChartPeer::getPrimaryKeyHashFromRow($row, $startcol2);
                if ($key2 !== null) {
                    $obj2 = ChartPeer::getInstanceFromPool($key2);
                    if (!$obj2) {

                        $cls = ChartPeer::getOMClass();

                    $obj2 = new $cls();
                    $obj2->hydrate($row, $startcol2);
                    ChartPeer::addInstanceToPool($obj2, $key2);
                } // if $obj2 already loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj2 (Chart)
                $obj2->addChartFolders($obj1);

            } // if joined row is not null

                // Add objects for joined UserFolders rows

                $key3 = UserFoldersPeer::getPrimaryKeyHashFromRow($row, $startcol3);
                if ($key3 !== null) {
                    $obj3 = UserFoldersPeer::getInstanceFromPool($key3);
                    if (!$obj3) {

                        $cls = UserFoldersPeer::getOMClass();

                    $obj3 = new $cls();
                    $obj3->hydrate($row, $startcol3);
                    UserFoldersPeer::addInstanceToPool($obj3, $key3);
                } // if $obj3 already loaded

                // Add the $obj1 (ChartFolders) to the collection in $obj3 (UserFolders)
                $obj3->addChartFolders($obj1);

            } // if joined row is not null

            $results[] = $obj1;
        }
        $stmt->closeCursor();

        return $results;
    }

    /**
     * Returns the TableMap related to this peer.
     * This method is not needed for general use but a specific application could have a need.
     * @return TableMap
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function getTableMap()
    {
        return Propel::getDatabaseMap(ChartFoldersPeer::DATABASE_NAME)->getTable(ChartFoldersPeer::TABLE_NAME);
    }

    /**
     * Add a TableMap instance to the database for this peer class.
     */
    public static function buildTableMap()
    {
      $dbMap = Propel::getDatabaseMap(BaseChartFoldersPeer::DATABASE_NAME);
      if (!$dbMap->hasTable(BaseChartFoldersPeer::TABLE_NAME)) {
        $dbMap->addTableObject(new ChartFoldersTableMap());
      }
    }

    /**
     * The class that the Peer will make instances of.
     *
     *
     * @return string ClassName
     */
    public static function getOMClass($row = 0, $colnum = 0)
    {
        return ChartFoldersPeer::OM_CLASS;
    }

    /**
     * Performs an INSERT on the database, given a ChartFolders or Criteria object.
     *
     * @param      mixed $values Criteria or ChartFolders object containing data that is used to create the INSERT statement.
     * @param      PropelPDO $con the PropelPDO connection to use
     * @return mixed           The new primary key.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doInsert($values, PropelPDO $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        if ($values instanceof Criteria) {
            $criteria = clone $values; // rename for clarity
        } else {
            $criteria = $values->buildCriteria(); // build Criteria from ChartFolders object
        }

        if ($criteria->containsKey(ChartFoldersPeer::MAP_ID) && $criteria->keyContainsValue(ChartFoldersPeer::MAP_ID) ) {
            throw new PropelException('Cannot insert a value for auto-increment primary key ('.ChartFoldersPeer::MAP_ID.')');
        }


        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        try {
            // use transaction because $criteria could contain info
            // for more than one table (I guess, conceivably)
            $con->beginTransaction();
            $pk = BasePeer::doInsert($criteria, $con);
            $con->commit();
        } catch (PropelException $e) {
            $con->rollBack();
            throw $e;
        }

        return $pk;
    }

    /**
     * Performs an UPDATE on the database, given a ChartFolders or Criteria object.
     *
     * @param      mixed $values Criteria or ChartFolders object containing data that is used to create the UPDATE statement.
     * @param      PropelPDO $con The connection to use (specify PropelPDO connection object to exert more control over transactions).
     * @return int             The number of affected rows (if supported by underlying database driver).
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function doUpdate($values, PropelPDO $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $selectCriteria = new Criteria(ChartFoldersPeer::DATABASE_NAME);

        if ($values instanceof Criteria) {
            $criteria = clone $values; // rename for clarity

            $comparison = $criteria->getComparison(ChartFoldersPeer::MAP_ID);
            $value = $criteria->remove(ChartFoldersPeer::MAP_ID);
            if ($value) {
                $selectCriteria->add(ChartFoldersPeer::MAP_ID, $value, $comparison);
            } else {
                $selectCriteria->setPrimaryTableName(ChartFoldersPeer::TABLE_NAME);
            }

        } else { // $values is ChartFolders object
            $criteria = $values->buildCriteria(); // gets full criteria
            $selectCriteria = $values->buildPkeyCriteria(); // gets criteria w/ primary key(s)
        }

        // set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        return BasePeer::doUpdate($selectCriteria, $criteria, $con);
    }

    /**
     * Deletes all rows from the chart_folders table.
     *
     * @param      PropelPDO $con the connection to use
     * @return int             The number of affected rows (if supported by underlying database driver).
     * @throws PropelException
     */
    public static function doDeleteAll(PropelPDO $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }
        $affectedRows = 0; // initialize var to track total num of affected rows
        try {
            // use transaction because $criteria could contain info
            // for more than one table or we could emulating ON DELETE CASCADE, etc.
            $con->beginTransaction();
            $affectedRows += BasePeer::doDeleteAll(ChartFoldersPeer::TABLE_NAME, $con, ChartFoldersPeer::DATABASE_NAME);
            // Because this db requires some delete cascade/set null emulation, we have to
            // clear the cached instance *after* the emulation has happened (since
            // instances get re-added by the select statement contained therein).
            ChartFoldersPeer::clearInstancePool();
            ChartFoldersPeer::clearRelatedInstancePool();
            $con->commit();

            return $affectedRows;
        } catch (PropelException $e) {
            $con->rollBack();
            throw $e;
        }
    }

    /**
     * Performs a DELETE on the database, given a ChartFolders or Criteria object OR a primary key value.
     *
     * @param      mixed $values Criteria or ChartFolders object or primary key or array of primary keys
     *              which is used to create the DELETE statement
     * @param      PropelPDO $con the connection to use
     * @return int The number of affected rows (if supported by underlying database driver).  This includes CASCADE-related rows
     *				if supported by native driver or if emulated using Propel.
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
     public static function doDelete($values, PropelPDO $con = null)
     {
        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        if ($values instanceof Criteria) {
            // invalidate the cache for all objects of this type, since we have no
            // way of knowing (without running a query) what objects should be invalidated
            // from the cache based on this Criteria.
            ChartFoldersPeer::clearInstancePool();
            // rename for clarity
            $criteria = clone $values;
        } elseif ($values instanceof ChartFolders) { // it's a model object
            // invalidate the cache for this single object
            ChartFoldersPeer::removeInstanceFromPool($values);
            // create criteria based on pk values
            $criteria = $values->buildPkeyCriteria();
        } else { // it's a primary key, or an array of pks
            $criteria = new Criteria(ChartFoldersPeer::DATABASE_NAME);
            $criteria->add(ChartFoldersPeer::MAP_ID, (array) $values, Criteria::IN);
            // invalidate the cache for this object(s)
            foreach ((array) $values as $singleval) {
                ChartFoldersPeer::removeInstanceFromPool($singleval);
            }
        }

        // Set the correct dbName
        $criteria->setDbName(ChartFoldersPeer::DATABASE_NAME);

        $affectedRows = 0; // initialize var to track total num of affected rows

        try {
            // use transaction because $criteria could contain info
            // for more than one table or we could emulating ON DELETE CASCADE, etc.
            $con->beginTransaction();

            $affectedRows += BasePeer::doDelete($criteria, $con);
            ChartFoldersPeer::clearRelatedInstancePool();
            $con->commit();

            return $affectedRows;
        } catch (PropelException $e) {
            $con->rollBack();
            throw $e;
        }
    }

    /**
     * Validates all modified columns of given ChartFolders object.
     * If parameter $columns is either a single column name or an array of column names
     * than only those columns are validated.
     *
     * NOTICE: This does not apply to primary or foreign keys for now.
     *
     * @param      ChartFolders $obj The object to validate.
     * @param      mixed $cols Column name or array of column names.
     *
     * @return mixed TRUE if all columns are valid or the error message of the first invalid column.
     */
    public static function doValidate($obj, $cols = null)
    {
        $columns = array();

        if ($cols) {
            $dbMap = Propel::getDatabaseMap(ChartFoldersPeer::DATABASE_NAME);
            $tableMap = $dbMap->getTable(ChartFoldersPeer::TABLE_NAME);

            if (! is_array($cols)) {
                $cols = array($cols);
            }

            foreach ($cols as $colName) {
                if ($tableMap->hasColumn($colName)) {
                    $get = 'get' . $tableMap->getColumn($colName)->getPhpName();
                    $columns[$colName] = $obj->$get();
                }
            }
        } else {

        }

        return BasePeer::doValidate(ChartFoldersPeer::DATABASE_NAME, ChartFoldersPeer::TABLE_NAME, $columns);
    }

    /**
     * Retrieve a single object by pkey.
     *
     * @param      int $pk the primary key.
     * @param      PropelPDO $con the connection to use
     * @return ChartFolders
     */
    public static function retrieveByPK($pk, PropelPDO $con = null)
    {

        if (null !== ($obj = ChartFoldersPeer::getInstanceFromPool((string) $pk))) {
            return $obj;
        }

        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $criteria = new Criteria(ChartFoldersPeer::DATABASE_NAME);
        $criteria->add(ChartFoldersPeer::MAP_ID, $pk);

        $v = ChartFoldersPeer::doSelect($criteria, $con);

        return !empty($v) > 0 ? $v[0] : null;
    }

    /**
     * Retrieve multiple objects by pkey.
     *
     * @param      array $pks List of primary keys
     * @param      PropelPDO $con the connection to use
     * @return ChartFolders[]
     * @throws PropelException Any exceptions caught during processing will be
     *		 rethrown wrapped into a PropelException.
     */
    public static function retrieveByPKs($pks, PropelPDO $con = null)
    {
        if ($con === null) {
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        $objs = null;
        if (empty($pks)) {
            $objs = array();
        } else {
            $criteria = new Criteria(ChartFoldersPeer::DATABASE_NAME);
            $criteria->add(ChartFoldersPeer::MAP_ID, $pks, Criteria::IN);
            $objs = ChartFoldersPeer::doSelect($criteria, $con);
        }

        return $objs;
    }

} // BaseChartFoldersPeer

// This is the static code needed to register the TableMap for this table with the main Propel class.
//
BaseChartFoldersPeer::buildTableMap();

