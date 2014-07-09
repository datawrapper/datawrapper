<?php


/**
 * Base class that represents a row from the 'product' table.
 *
 *
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseProduct extends BaseObject implements Persistent
{
    /**
     * Peer class name
     */
    const PEER = 'ProductPeer';

    /**
     * The Peer class.
     * Instance provides a convenient way of calling static methods on a class
     * that calling code may not be able to identify.
     * @var        ProductPeer
     */
    protected static $peer;

    /**
     * The flag var to prevent infinit loop in deep copy
     * @var       boolean
     */
    protected $startCopy = false;

    /**
     * The value for the id field.
     * @var        int
     */
    protected $id;

    /**
     * The value for the name field.
     * @var        string
     */
    protected $name;

    /**
     * The value for the created_at field.
     * @var        string
     */
    protected $created_at;

    /**
     * The value for the deleted field.
     * Note: this column has a database default value of: false
     * @var        boolean
     */
    protected $deleted;

    /**
     * The value for the data field.
     * @var        string
     */
    protected $data;

    /**
     * @var        PropelObjectCollection|ProductPlugin[] Collection to store aggregation of ProductPlugin objects.
     */
    protected $collProductPlugins;
    protected $collProductPluginsPartial;

    /**
     * @var        PropelObjectCollection|UserProduct[] Collection to store aggregation of UserProduct objects.
     */
    protected $collUserProducts;
    protected $collUserProductsPartial;

    /**
     * @var        PropelObjectCollection|OrganizationProduct[] Collection to store aggregation of OrganizationProduct objects.
     */
    protected $collOrganizationProducts;
    protected $collOrganizationProductsPartial;

    /**
     * @var        PropelObjectCollection|Plugin[] Collection to store aggregation of Plugin objects.
     */
    protected $collPlugins;

    /**
     * @var        PropelObjectCollection|User[] Collection to store aggregation of User objects.
     */
    protected $collUsers;

    /**
     * @var        PropelObjectCollection|Organization[] Collection to store aggregation of Organization objects.
     */
    protected $collOrganizations;

    /**
     * Flag to prevent endless save loop, if this object is referenced
     * by another object which falls in this transaction.
     * @var        boolean
     */
    protected $alreadyInSave = false;

    /**
     * Flag to prevent endless validation loop, if this object is referenced
     * by another object which falls in this transaction.
     * @var        boolean
     */
    protected $alreadyInValidation = false;

    /**
     * Flag to prevent endless clearAllReferences($deep=true) loop, if this object is referenced
     * @var        boolean
     */
    protected $alreadyInClearAllReferencesDeep = false;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $pluginsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $usersScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $organizationsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $productPluginsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $userProductsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $organizationProductsScheduledForDeletion = null;

    /**
     * Applies default values to this object.
     * This method should be called from the object's constructor (or
     * equivalent initialization method).
     * @see        __construct()
     */
    public function applyDefaultValues()
    {
        $this->deleted = false;
    }

    /**
     * Initializes internal state of BaseProduct object.
     * @see        applyDefaults()
     */
    public function __construct()
    {
        parent::__construct();
        $this->applyDefaultValues();
    }

    /**
     * Get the [id] column value.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get the [name] column value.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Get the [optionally formatted] temporal [created_at] column value.
     *
     *
     * @param string $format The date/time format string (either date()-style or strftime()-style).
     *				 If format is null, then the raw DateTime object will be returned.
     * @return mixed Formatted date/time value as string or DateTime object (if format is null), null if column is null, and 0 if column value is 0000-00-00 00:00:00
     * @throws PropelException - if unable to parse/validate the date/time value.
     */
    public function getCreatedAt($format = 'Y-m-d H:i:s')
    {
        if ($this->created_at === null) {
            return null;
        }

        if ($this->created_at === '0000-00-00 00:00:00') {
            // while technically this is not a default value of null,
            // this seems to be closest in meaning.
            return null;
        }

        try {
            $dt = new DateTime($this->created_at);
        } catch (Exception $x) {
            throw new PropelException("Internally stored date/time/timestamp value could not be converted to DateTime: " . var_export($this->created_at, true), $x);
        }

        if ($format === null) {
            // Because propel.useDateTimeClass is true, we return a DateTime object.
            return $dt;
        }

        if (strpos($format, '%') !== false) {
            return strftime($format, $dt->format('U'));
        }

        return $dt->format($format);

    }

    /**
     * Get the [deleted] column value.
     *
     * @return boolean
     */
    public function getDeleted()
    {
        return $this->deleted;
    }

    /**
     * Get the [data] column value.
     *
     * @return string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Set the value of [id] column.
     *
     * @param int $v new value
     * @return Product The current object (for fluent API support)
     */
    public function setId($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (int) $v;
        }

        if ($this->id !== $v) {
            $this->id = $v;
            $this->modifiedColumns[] = ProductPeer::ID;
        }


        return $this;
    } // setId()

    /**
     * Set the value of [name] column.
     *
     * @param string $v new value
     * @return Product The current object (for fluent API support)
     */
    public function setName($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->name !== $v) {
            $this->name = $v;
            $this->modifiedColumns[] = ProductPeer::NAME;
        }


        return $this;
    } // setName()

    /**
     * Sets the value of [created_at] column to a normalized version of the date/time value specified.
     *
     * @param mixed $v string, integer (timestamp), or DateTime value.
     *               Empty strings are treated as null.
     * @return Product The current object (for fluent API support)
     */
    public function setCreatedAt($v)
    {
        $dt = PropelDateTime::newInstance($v, null, 'DateTime');
        if ($this->created_at !== null || $dt !== null) {
            $currentDateAsString = ($this->created_at !== null && $tmpDt = new DateTime($this->created_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
            $newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
            if ($currentDateAsString !== $newDateAsString) {
                $this->created_at = $newDateAsString;
                $this->modifiedColumns[] = ProductPeer::CREATED_AT;
            }
        } // if either are not null


        return $this;
    } // setCreatedAt()

    /**
     * Sets the value of the [deleted] column.
     * Non-boolean arguments are converted using the following rules:
     *   * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *   * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     * Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     *
     * @param boolean|integer|string $v The new value
     * @return Product The current object (for fluent API support)
     */
    public function setDeleted($v)
    {
        if ($v !== null) {
            if (is_string($v)) {
                $v = in_array(strtolower($v), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
            } else {
                $v = (boolean) $v;
            }
        }

        if ($this->deleted !== $v) {
            $this->deleted = $v;
            $this->modifiedColumns[] = ProductPeer::DELETED;
        }


        return $this;
    } // setDeleted()

    /**
     * Set the value of [data] column.
     *
     * @param string $v new value
     * @return Product The current object (for fluent API support)
     */
    public function setData($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->data !== $v) {
            $this->data = $v;
            $this->modifiedColumns[] = ProductPeer::DATA;
        }


        return $this;
    } // setData()

    /**
     * Indicates whether the columns in this object are only set to default values.
     *
     * This method can be used in conjunction with isModified() to indicate whether an object is both
     * modified _and_ has some values set which are non-default.
     *
     * @return boolean Whether the columns in this object are only been set with default values.
     */
    public function hasOnlyDefaultValues()
    {
            if ($this->deleted !== false) {
                return false;
            }

        // otherwise, everything was equal, so return true
        return true;
    } // hasOnlyDefaultValues()

    /**
     * Hydrates (populates) the object variables with values from the database resultset.
     *
     * An offset (0-based "start column") is specified so that objects can be hydrated
     * with a subset of the columns in the resultset rows.  This is needed, for example,
     * for results of JOIN queries where the resultset row includes columns from two or
     * more tables.
     *
     * @param array $row The row returned by PDOStatement->fetch(PDO::FETCH_NUM)
     * @param int $startcol 0-based offset column which indicates which restultset column to start with.
     * @param boolean $rehydrate Whether this object is being re-hydrated from the database.
     * @return int             next starting column
     * @throws PropelException - Any caught Exception will be rewrapped as a PropelException.
     */
    public function hydrate($row, $startcol = 0, $rehydrate = false)
    {
        try {

            $this->id = ($row[$startcol + 0] !== null) ? (int) $row[$startcol + 0] : null;
            $this->name = ($row[$startcol + 1] !== null) ? (string) $row[$startcol + 1] : null;
            $this->created_at = ($row[$startcol + 2] !== null) ? (string) $row[$startcol + 2] : null;
            $this->deleted = ($row[$startcol + 3] !== null) ? (boolean) $row[$startcol + 3] : null;
            $this->data = ($row[$startcol + 4] !== null) ? (string) $row[$startcol + 4] : null;
            $this->resetModified();

            $this->setNew(false);

            if ($rehydrate) {
                $this->ensureConsistency();
            }
            $this->postHydrate($row, $startcol, $rehydrate);
            return $startcol + 5; // 5 = ProductPeer::NUM_HYDRATE_COLUMNS.

        } catch (Exception $e) {
            throw new PropelException("Error populating Product object", $e);
        }
    }

    /**
     * Checks and repairs the internal consistency of the object.
     *
     * This method is executed after an already-instantiated object is re-hydrated
     * from the database.  It exists to check any foreign keys to make sure that
     * the objects related to the current object are correct based on foreign key.
     *
     * You can override this method in the stub class, but you should always invoke
     * the base method from the overridden method (i.e. parent::ensureConsistency()),
     * in case your model changes.
     *
     * @throws PropelException
     */
    public function ensureConsistency()
    {

    } // ensureConsistency

    /**
     * Reloads this object from datastore based on primary key and (optionally) resets all associated objects.
     *
     * This will only work if the object has been saved and has a valid primary key set.
     *
     * @param boolean $deep (optional) Whether to also de-associated any related objects.
     * @param PropelPDO $con (optional) The PropelPDO connection to use.
     * @return void
     * @throws PropelException - if this object is deleted, unsaved or doesn't have pk match in db
     */
    public function reload($deep = false, PropelPDO $con = null)
    {
        if ($this->isDeleted()) {
            throw new PropelException("Cannot reload a deleted object.");
        }

        if ($this->isNew()) {
            throw new PropelException("Cannot reload an unsaved object.");
        }

        if ($con === null) {
            $con = Propel::getConnection(ProductPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        // We don't need to alter the object instance pool; we're just modifying this instance
        // already in the pool.

        $stmt = ProductPeer::doSelectStmt($this->buildPkeyCriteria(), $con);
        $row = $stmt->fetch(PDO::FETCH_NUM);
        $stmt->closeCursor();
        if (!$row) {
            throw new PropelException('Cannot find matching row in the database to reload object values.');
        }
        $this->hydrate($row, 0, true); // rehydrate

        if ($deep) {  // also de-associate any related objects?

            $this->collProductPlugins = null;

            $this->collUserProducts = null;

            $this->collOrganizationProducts = null;

            $this->collPlugins = null;
            $this->collUsers = null;
            $this->collOrganizations = null;
        } // if (deep)
    }

    /**
     * Removes this object from datastore and sets delete attribute.
     *
     * @param PropelPDO $con
     * @return void
     * @throws PropelException
     * @throws Exception
     * @see        BaseObject::setDeleted()
     * @see        BaseObject::isDeleted()
     */
    public function delete(PropelPDO $con = null)
    {
        if ($this->isDeleted()) {
            throw new PropelException("This object has already been deleted.");
        }

        if ($con === null) {
            $con = Propel::getConnection(ProductPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $con->beginTransaction();
        try {
            $deleteQuery = ProductQuery::create()
                ->filterByPrimaryKey($this->getPrimaryKey());
            $ret = $this->preDelete($con);
            if ($ret) {
                $deleteQuery->delete($con);
                $this->postDelete($con);
                $con->commit();
                $this->setDeleted(true);
            } else {
                $con->commit();
            }
        } catch (Exception $e) {
            $con->rollBack();
            throw $e;
        }
    }

    /**
     * Persists this object to the database.
     *
     * If the object is new, it inserts it; otherwise an update is performed.
     * All modified related objects will also be persisted in the doSave()
     * method.  This method wraps all precipitate database operations in a
     * single transaction.
     *
     * @param PropelPDO $con
     * @return int             The number of rows affected by this insert/update and any referring fk objects' save() operations.
     * @throws PropelException
     * @throws Exception
     * @see        doSave()
     */
    public function save(PropelPDO $con = null)
    {
        if ($this->isDeleted()) {
            throw new PropelException("You cannot save an object that has been deleted.");
        }

        if ($con === null) {
            $con = Propel::getConnection(ProductPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $con->beginTransaction();
        $isInsert = $this->isNew();
        try {
            $ret = $this->preSave($con);
            if ($isInsert) {
                $ret = $ret && $this->preInsert($con);
            } else {
                $ret = $ret && $this->preUpdate($con);
            }
            if ($ret) {
                $affectedRows = $this->doSave($con);
                if ($isInsert) {
                    $this->postInsert($con);
                } else {
                    $this->postUpdate($con);
                }
                $this->postSave($con);
                ProductPeer::addInstanceToPool($this);
            } else {
                $affectedRows = 0;
            }
            $con->commit();

            return $affectedRows;
        } catch (Exception $e) {
            $con->rollBack();
            throw $e;
        }
    }

    /**
     * Performs the work of inserting or updating the row in the database.
     *
     * If the object is new, it inserts it; otherwise an update is performed.
     * All related objects are also updated in this method.
     *
     * @param PropelPDO $con
     * @return int             The number of rows affected by this insert/update and any referring fk objects' save() operations.
     * @throws PropelException
     * @see        save()
     */
    protected function doSave(PropelPDO $con)
    {
        $affectedRows = 0; // initialize var to track total num of affected rows
        if (!$this->alreadyInSave) {
            $this->alreadyInSave = true;

            if ($this->isNew() || $this->isModified()) {
                // persist changes
                if ($this->isNew()) {
                    $this->doInsert($con);
                } else {
                    $this->doUpdate($con);
                }
                $affectedRows += 1;
                $this->resetModified();
            }

            if ($this->pluginsScheduledForDeletion !== null) {
                if (!$this->pluginsScheduledForDeletion->isEmpty()) {
                    $pks = array();
                    $pk = $this->getPrimaryKey();
                    foreach ($this->pluginsScheduledForDeletion->getPrimaryKeys(false) as $remotePk) {
                        $pks[] = array($pk, $remotePk);
                    }
                    ProductPluginQuery::create()
                        ->filterByPrimaryKeys($pks)
                        ->delete($con);
                    $this->pluginsScheduledForDeletion = null;
                }

                foreach ($this->getPlugins() as $plugin) {
                    if ($plugin->isModified()) {
                        $plugin->save($con);
                    }
                }
            } elseif ($this->collPlugins) {
                foreach ($this->collPlugins as $plugin) {
                    if ($plugin->isModified()) {
                        $plugin->save($con);
                    }
                }
            }

            if ($this->usersScheduledForDeletion !== null) {
                if (!$this->usersScheduledForDeletion->isEmpty()) {
                    $pks = array();
                    $pk = $this->getPrimaryKey();
                    foreach ($this->usersScheduledForDeletion->getPrimaryKeys(false) as $remotePk) {
                        $pks[] = array($remotePk, $pk);
                    }
                    UserProductQuery::create()
                        ->filterByPrimaryKeys($pks)
                        ->delete($con);
                    $this->usersScheduledForDeletion = null;
                }

                foreach ($this->getUsers() as $user) {
                    if ($user->isModified()) {
                        $user->save($con);
                    }
                }
            } elseif ($this->collUsers) {
                foreach ($this->collUsers as $user) {
                    if ($user->isModified()) {
                        $user->save($con);
                    }
                }
            }

            if ($this->organizationsScheduledForDeletion !== null) {
                if (!$this->organizationsScheduledForDeletion->isEmpty()) {
                    $pks = array();
                    $pk = $this->getPrimaryKey();
                    foreach ($this->organizationsScheduledForDeletion->getPrimaryKeys(false) as $remotePk) {
                        $pks[] = array($remotePk, $pk);
                    }
                    OrganizationProductQuery::create()
                        ->filterByPrimaryKeys($pks)
                        ->delete($con);
                    $this->organizationsScheduledForDeletion = null;
                }

                foreach ($this->getOrganizations() as $organization) {
                    if ($organization->isModified()) {
                        $organization->save($con);
                    }
                }
            } elseif ($this->collOrganizations) {
                foreach ($this->collOrganizations as $organization) {
                    if ($organization->isModified()) {
                        $organization->save($con);
                    }
                }
            }

            if ($this->productPluginsScheduledForDeletion !== null) {
                if (!$this->productPluginsScheduledForDeletion->isEmpty()) {
                    ProductPluginQuery::create()
                        ->filterByPrimaryKeys($this->productPluginsScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->productPluginsScheduledForDeletion = null;
                }
            }

            if ($this->collProductPlugins !== null) {
                foreach ($this->collProductPlugins as $referrerFK) {
                    if (!$referrerFK->isDeleted() && ($referrerFK->isNew() || $referrerFK->isModified())) {
                        $affectedRows += $referrerFK->save($con);
                    }
                }
            }

            if ($this->userProductsScheduledForDeletion !== null) {
                if (!$this->userProductsScheduledForDeletion->isEmpty()) {
                    UserProductQuery::create()
                        ->filterByPrimaryKeys($this->userProductsScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->userProductsScheduledForDeletion = null;
                }
            }

            if ($this->collUserProducts !== null) {
                foreach ($this->collUserProducts as $referrerFK) {
                    if (!$referrerFK->isDeleted() && ($referrerFK->isNew() || $referrerFK->isModified())) {
                        $affectedRows += $referrerFK->save($con);
                    }
                }
            }

            if ($this->organizationProductsScheduledForDeletion !== null) {
                if (!$this->organizationProductsScheduledForDeletion->isEmpty()) {
                    OrganizationProductQuery::create()
                        ->filterByPrimaryKeys($this->organizationProductsScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->organizationProductsScheduledForDeletion = null;
                }
            }

            if ($this->collOrganizationProducts !== null) {
                foreach ($this->collOrganizationProducts as $referrerFK) {
                    if (!$referrerFK->isDeleted() && ($referrerFK->isNew() || $referrerFK->isModified())) {
                        $affectedRows += $referrerFK->save($con);
                    }
                }
            }

            $this->alreadyInSave = false;

        }

        return $affectedRows;
    } // doSave()

    /**
     * Insert the row in the database.
     *
     * @param PropelPDO $con
     *
     * @throws PropelException
     * @see        doSave()
     */
    protected function doInsert(PropelPDO $con)
    {
        $modifiedColumns = array();
        $index = 0;

        $this->modifiedColumns[] = ProductPeer::ID;
        if (null !== $this->id) {
            throw new PropelException('Cannot insert a value for auto-increment primary key (' . ProductPeer::ID . ')');
        }

         // check the columns in natural order for more readable SQL queries
        if ($this->isColumnModified(ProductPeer::ID)) {
            $modifiedColumns[':p' . $index++]  = '`id`';
        }
        if ($this->isColumnModified(ProductPeer::NAME)) {
            $modifiedColumns[':p' . $index++]  = '`name`';
        }
        if ($this->isColumnModified(ProductPeer::CREATED_AT)) {
            $modifiedColumns[':p' . $index++]  = '`created_at`';
        }
        if ($this->isColumnModified(ProductPeer::DELETED)) {
            $modifiedColumns[':p' . $index++]  = '`deleted`';
        }
        if ($this->isColumnModified(ProductPeer::DATA)) {
            $modifiedColumns[':p' . $index++]  = '`data`';
        }

        $sql = sprintf(
            'INSERT INTO `product` (%s) VALUES (%s)',
            implode(', ', $modifiedColumns),
            implode(', ', array_keys($modifiedColumns))
        );

        try {
            $stmt = $con->prepare($sql);
            foreach ($modifiedColumns as $identifier => $columnName) {
                switch ($columnName) {
                    case '`id`':
                        $stmt->bindValue($identifier, $this->id, PDO::PARAM_INT);
                        break;
                    case '`name`':
                        $stmt->bindValue($identifier, $this->name, PDO::PARAM_STR);
                        break;
                    case '`created_at`':
                        $stmt->bindValue($identifier, $this->created_at, PDO::PARAM_STR);
                        break;
                    case '`deleted`':
                        $stmt->bindValue($identifier, (int) $this->deleted, PDO::PARAM_INT);
                        break;
                    case '`data`':
                        $stmt->bindValue($identifier, $this->data, PDO::PARAM_STR);
                        break;
                }
            }
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute INSERT statement [%s]', $sql), $e);
        }

        try {
            $pk = $con->lastInsertId();
        } catch (Exception $e) {
            throw new PropelException('Unable to get autoincrement id.', $e);
        }
        $this->setId($pk);

        $this->setNew(false);
    }

    /**
     * Update the row in the database.
     *
     * @param PropelPDO $con
     *
     * @see        doSave()
     */
    protected function doUpdate(PropelPDO $con)
    {
        $selectCriteria = $this->buildPkeyCriteria();
        $valuesCriteria = $this->buildCriteria();
        BasePeer::doUpdate($selectCriteria, $valuesCriteria, $con);
    }

    /**
     * Array of ValidationFailed objects.
     * @var        array ValidationFailed[]
     */
    protected $validationFailures = array();

    /**
     * Gets any ValidationFailed objects that resulted from last call to validate().
     *
     *
     * @return array ValidationFailed[]
     * @see        validate()
     */
    public function getValidationFailures()
    {
        return $this->validationFailures;
    }

    /**
     * Validates the objects modified field values and all objects related to this table.
     *
     * If $columns is either a column name or an array of column names
     * only those columns are validated.
     *
     * @param mixed $columns Column name or an array of column names.
     * @return boolean Whether all columns pass validation.
     * @see        doValidate()
     * @see        getValidationFailures()
     */
    public function validate($columns = null)
    {
        $res = $this->doValidate($columns);
        if ($res === true) {
            $this->validationFailures = array();

            return true;
        }

        $this->validationFailures = $res;

        return false;
    }

    /**
     * This function performs the validation work for complex object models.
     *
     * In addition to checking the current object, all related objects will
     * also be validated.  If all pass then <code>true</code> is returned; otherwise
     * an aggreagated array of ValidationFailed objects will be returned.
     *
     * @param array $columns Array of column names to validate.
     * @return mixed <code>true</code> if all validations pass; array of <code>ValidationFailed</code> objets otherwise.
     */
    protected function doValidate($columns = null)
    {
        if (!$this->alreadyInValidation) {
            $this->alreadyInValidation = true;
            $retval = null;

            $failureMap = array();


            if (($retval = ProductPeer::doValidate($this, $columns)) !== true) {
                $failureMap = array_merge($failureMap, $retval);
            }


                if ($this->collProductPlugins !== null) {
                    foreach ($this->collProductPlugins as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }

                if ($this->collUserProducts !== null) {
                    foreach ($this->collUserProducts as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }

                if ($this->collOrganizationProducts !== null) {
                    foreach ($this->collOrganizationProducts as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }


            $this->alreadyInValidation = false;
        }

        return (!empty($failureMap) ? $failureMap : true);
    }

    /**
     * Retrieves a field from the object by name passed in as a string.
     *
     * @param string $name name
     * @param string $type The type of fieldname the $name is of:
     *               one of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME
     *               BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM.
     *               Defaults to BasePeer::TYPE_PHPNAME
     * @return mixed Value of field.
     */
    public function getByName($name, $type = BasePeer::TYPE_PHPNAME)
    {
        $pos = ProductPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
        $field = $this->getByPosition($pos);

        return $field;
    }

    /**
     * Retrieves a field from the object by Position as specified in the xml schema.
     * Zero-based.
     *
     * @param int $pos position in xml schema
     * @return mixed Value of field at $pos
     */
    public function getByPosition($pos)
    {
        switch ($pos) {
            case 0:
                return $this->getId();
                break;
            case 1:
                return $this->getName();
                break;
            case 2:
                return $this->getCreatedAt();
                break;
            case 3:
                return $this->getDeleted();
                break;
            case 4:
                return $this->getData();
                break;
            default:
                return null;
                break;
        } // switch()
    }

    /**
     * Exports the object as an array.
     *
     * You can specify the key type of the array by passing one of the class
     * type constants.
     *
     * @param     string  $keyType (optional) One of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME,
     *                    BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM.
     *                    Defaults to BasePeer::TYPE_PHPNAME.
     * @param     boolean $includeLazyLoadColumns (optional) Whether to include lazy loaded columns. Defaults to true.
     * @param     array $alreadyDumpedObjects List of objects to skip to avoid recursion
     * @param     boolean $includeForeignObjects (optional) Whether to include hydrated related objects. Default to FALSE.
     *
     * @return array an associative array containing the field names (as keys) and field values
     */
    public function toArray($keyType = BasePeer::TYPE_PHPNAME, $includeLazyLoadColumns = true, $alreadyDumpedObjects = array(), $includeForeignObjects = false)
    {
        if (isset($alreadyDumpedObjects['Product'][$this->getPrimaryKey()])) {
            return '*RECURSION*';
        }
        $alreadyDumpedObjects['Product'][$this->getPrimaryKey()] = true;
        $keys = ProductPeer::getFieldNames($keyType);
        $result = array(
            $keys[0] => $this->getId(),
            $keys[1] => $this->getName(),
            $keys[2] => $this->getCreatedAt(),
            $keys[3] => $this->getDeleted(),
            $keys[4] => $this->getData(),
        );
        if ($includeForeignObjects) {
            if (null !== $this->collProductPlugins) {
                $result['ProductPlugins'] = $this->collProductPlugins->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collUserProducts) {
                $result['UserProducts'] = $this->collUserProducts->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collOrganizationProducts) {
                $result['OrganizationProducts'] = $this->collOrganizationProducts->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
        }

        return $result;
    }

    /**
     * Sets a field from the object by name passed in as a string.
     *
     * @param string $name peer name
     * @param mixed $value field value
     * @param string $type The type of fieldname the $name is of:
     *                     one of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME
     *                     BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM.
     *                     Defaults to BasePeer::TYPE_PHPNAME
     * @return void
     */
    public function setByName($name, $value, $type = BasePeer::TYPE_PHPNAME)
    {
        $pos = ProductPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);

        $this->setByPosition($pos, $value);
    }

    /**
     * Sets a field from the object by Position as specified in the xml schema.
     * Zero-based.
     *
     * @param int $pos position in xml schema
     * @param mixed $value field value
     * @return void
     */
    public function setByPosition($pos, $value)
    {
        switch ($pos) {
            case 0:
                $this->setId($value);
                break;
            case 1:
                $this->setName($value);
                break;
            case 2:
                $this->setCreatedAt($value);
                break;
            case 3:
                $this->setDeleted($value);
                break;
            case 4:
                $this->setData($value);
                break;
        } // switch()
    }

    /**
     * Populates the object using an array.
     *
     * This is particularly useful when populating an object from one of the
     * request arrays (e.g. $_POST).  This method goes through the column
     * names, checking to see whether a matching key exists in populated
     * array. If so the setByName() method is called for that column.
     *
     * You can specify the key type of the array by additionally passing one
     * of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME,
     * BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM.
     * The default key type is the column's BasePeer::TYPE_PHPNAME
     *
     * @param array  $arr     An array to populate the object from.
     * @param string $keyType The type of keys the array uses.
     * @return void
     */
    public function fromArray($arr, $keyType = BasePeer::TYPE_PHPNAME)
    {
        $keys = ProductPeer::getFieldNames($keyType);

        if (array_key_exists($keys[0], $arr)) $this->setId($arr[$keys[0]]);
        if (array_key_exists($keys[1], $arr)) $this->setName($arr[$keys[1]]);
        if (array_key_exists($keys[2], $arr)) $this->setCreatedAt($arr[$keys[2]]);
        if (array_key_exists($keys[3], $arr)) $this->setDeleted($arr[$keys[3]]);
        if (array_key_exists($keys[4], $arr)) $this->setData($arr[$keys[4]]);
    }

    /**
     * Build a Criteria object containing the values of all modified columns in this object.
     *
     * @return Criteria The Criteria object containing all modified values.
     */
    public function buildCriteria()
    {
        $criteria = new Criteria(ProductPeer::DATABASE_NAME);

        if ($this->isColumnModified(ProductPeer::ID)) $criteria->add(ProductPeer::ID, $this->id);
        if ($this->isColumnModified(ProductPeer::NAME)) $criteria->add(ProductPeer::NAME, $this->name);
        if ($this->isColumnModified(ProductPeer::CREATED_AT)) $criteria->add(ProductPeer::CREATED_AT, $this->created_at);
        if ($this->isColumnModified(ProductPeer::DELETED)) $criteria->add(ProductPeer::DELETED, $this->deleted);
        if ($this->isColumnModified(ProductPeer::DATA)) $criteria->add(ProductPeer::DATA, $this->data);

        return $criteria;
    }

    /**
     * Builds a Criteria object containing the primary key for this object.
     *
     * Unlike buildCriteria() this method includes the primary key values regardless
     * of whether or not they have been modified.
     *
     * @return Criteria The Criteria object containing value(s) for primary key(s).
     */
    public function buildPkeyCriteria()
    {
        $criteria = new Criteria(ProductPeer::DATABASE_NAME);
        $criteria->add(ProductPeer::ID, $this->id);

        return $criteria;
    }

    /**
     * Returns the primary key for this object (row).
     * @return int
     */
    public function getPrimaryKey()
    {
        return $this->getId();
    }

    /**
     * Generic method to set the primary key (id column).
     *
     * @param  int $key Primary key.
     * @return void
     */
    public function setPrimaryKey($key)
    {
        $this->setId($key);
    }

    /**
     * Returns true if the primary key for this object is null.
     * @return boolean
     */
    public function isPrimaryKeyNull()
    {

        return null === $this->getId();
    }

    /**
     * Sets contents of passed object to values from current object.
     *
     * If desired, this method can also make copies of all associated (fkey referrers)
     * objects.
     *
     * @param object $copyObj An object of Product (or compatible) type.
     * @param boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
     * @param boolean $makeNew Whether to reset autoincrement PKs and make the object new.
     * @throws PropelException
     */
    public function copyInto($copyObj, $deepCopy = false, $makeNew = true)
    {
        $copyObj->setName($this->getName());
        $copyObj->setCreatedAt($this->getCreatedAt());
        $copyObj->setDeleted($this->getDeleted());
        $copyObj->setData($this->getData());

        if ($deepCopy && !$this->startCopy) {
            // important: temporarily setNew(false) because this affects the behavior of
            // the getter/setter methods for fkey referrer objects.
            $copyObj->setNew(false);
            // store object hash to prevent cycle
            $this->startCopy = true;

            foreach ($this->getProductPlugins() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addProductPlugin($relObj->copy($deepCopy));
                }
            }

            foreach ($this->getUserProducts() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addUserProduct($relObj->copy($deepCopy));
                }
            }

            foreach ($this->getOrganizationProducts() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addOrganizationProduct($relObj->copy($deepCopy));
                }
            }

            //unflag object copy
            $this->startCopy = false;
        } // if ($deepCopy)

        if ($makeNew) {
            $copyObj->setNew(true);
            $copyObj->setId(NULL); // this is a auto-increment column, so set to default value
        }
    }

    /**
     * Makes a copy of this object that will be inserted as a new row in table when saved.
     * It creates a new object filling in the simple attributes, but skipping any primary
     * keys that are defined for the table.
     *
     * If desired, this method can also make copies of all associated (fkey referrers)
     * objects.
     *
     * @param boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
     * @return Product Clone of current object.
     * @throws PropelException
     */
    public function copy($deepCopy = false)
    {
        // we use get_class(), because this might be a subclass
        $clazz = get_class($this);
        $copyObj = new $clazz();
        $this->copyInto($copyObj, $deepCopy);

        return $copyObj;
    }

    /**
     * Returns a peer instance associated with this om.
     *
     * Since Peer classes are not to have any instance attributes, this method returns the
     * same instance for all member of this class. The method could therefore
     * be static, but this would prevent one from overriding the behavior.
     *
     * @return ProductPeer
     */
    public function getPeer()
    {
        if (self::$peer === null) {
            self::$peer = new ProductPeer();
        }

        return self::$peer;
    }


    /**
     * Initializes a collection based on the name of a relation.
     * Avoids crafting an 'init[$relationName]s' method name
     * that wouldn't work when StandardEnglishPluralizer is used.
     *
     * @param string $relationName The name of the relation to initialize
     * @return void
     */
    public function initRelation($relationName)
    {
        if ('ProductPlugin' == $relationName) {
            $this->initProductPlugins();
        }
        if ('UserProduct' == $relationName) {
            $this->initUserProducts();
        }
        if ('OrganizationProduct' == $relationName) {
            $this->initOrganizationProducts();
        }
    }

    /**
     * Clears out the collProductPlugins collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Product The current object (for fluent API support)
     * @see        addProductPlugins()
     */
    public function clearProductPlugins()
    {
        $this->collProductPlugins = null; // important to set this to null since that means it is uninitialized
        $this->collProductPluginsPartial = null;

        return $this;
    }

    /**
     * reset is the collProductPlugins collection loaded partially
     *
     * @return void
     */
    public function resetPartialProductPlugins($v = true)
    {
        $this->collProductPluginsPartial = $v;
    }

    /**
     * Initializes the collProductPlugins collection.
     *
     * By default this just sets the collProductPlugins collection to an empty array (like clearcollProductPlugins());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initProductPlugins($overrideExisting = true)
    {
        if (null !== $this->collProductPlugins && !$overrideExisting) {
            return;
        }
        $this->collProductPlugins = new PropelObjectCollection();
        $this->collProductPlugins->setModel('ProductPlugin');
    }

    /**
     * Gets an array of ProductPlugin objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Product is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|ProductPlugin[] List of ProductPlugin objects
     * @throws PropelException
     */
    public function getProductPlugins($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collProductPluginsPartial && !$this->isNew();
        if (null === $this->collProductPlugins || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collProductPlugins) {
                // return empty collection
                $this->initProductPlugins();
            } else {
                $collProductPlugins = ProductPluginQuery::create(null, $criteria)
                    ->filterByProduct($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collProductPluginsPartial && count($collProductPlugins)) {
                      $this->initProductPlugins(false);

                      foreach($collProductPlugins as $obj) {
                        if (false == $this->collProductPlugins->contains($obj)) {
                          $this->collProductPlugins->append($obj);
                        }
                      }

                      $this->collProductPluginsPartial = true;
                    }

                    $collProductPlugins->getInternalIterator()->rewind();
                    return $collProductPlugins;
                }

                if($partial && $this->collProductPlugins) {
                    foreach($this->collProductPlugins as $obj) {
                        if($obj->isNew()) {
                            $collProductPlugins[] = $obj;
                        }
                    }
                }

                $this->collProductPlugins = $collProductPlugins;
                $this->collProductPluginsPartial = false;
            }
        }

        return $this->collProductPlugins;
    }

    /**
     * Sets a collection of ProductPlugin objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $productPlugins A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Product The current object (for fluent API support)
     */
    public function setProductPlugins(PropelCollection $productPlugins, PropelPDO $con = null)
    {
        $productPluginsToDelete = $this->getProductPlugins(new Criteria(), $con)->diff($productPlugins);

        $this->productPluginsScheduledForDeletion = unserialize(serialize($productPluginsToDelete));

        foreach ($productPluginsToDelete as $productPluginRemoved) {
            $productPluginRemoved->setProduct(null);
        }

        $this->collProductPlugins = null;
        foreach ($productPlugins as $productPlugin) {
            $this->addProductPlugin($productPlugin);
        }

        $this->collProductPlugins = $productPlugins;
        $this->collProductPluginsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related ProductPlugin objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related ProductPlugin objects.
     * @throws PropelException
     */
    public function countProductPlugins(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collProductPluginsPartial && !$this->isNew();
        if (null === $this->collProductPlugins || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collProductPlugins) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getProductPlugins());
            }
            $query = ProductPluginQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByProduct($this)
                ->count($con);
        }

        return count($this->collProductPlugins);
    }

    /**
     * Method called to associate a ProductPlugin object to this object
     * through the ProductPlugin foreign key attribute.
     *
     * @param    ProductPlugin $l ProductPlugin
     * @return Product The current object (for fluent API support)
     */
    public function addProductPlugin(ProductPlugin $l)
    {
        if ($this->collProductPlugins === null) {
            $this->initProductPlugins();
            $this->collProductPluginsPartial = true;
        }
        if (!in_array($l, $this->collProductPlugins->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddProductPlugin($l);
        }

        return $this;
    }

    /**
     * @param	ProductPlugin $productPlugin The productPlugin object to add.
     */
    protected function doAddProductPlugin($productPlugin)
    {
        $this->collProductPlugins[]= $productPlugin;
        $productPlugin->setProduct($this);
    }

    /**
     * @param	ProductPlugin $productPlugin The productPlugin object to remove.
     * @return Product The current object (for fluent API support)
     */
    public function removeProductPlugin($productPlugin)
    {
        if ($this->getProductPlugins()->contains($productPlugin)) {
            $this->collProductPlugins->remove($this->collProductPlugins->search($productPlugin));
            if (null === $this->productPluginsScheduledForDeletion) {
                $this->productPluginsScheduledForDeletion = clone $this->collProductPlugins;
                $this->productPluginsScheduledForDeletion->clear();
            }
            $this->productPluginsScheduledForDeletion[]= clone $productPlugin;
            $productPlugin->setProduct(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Product is new, it will return
     * an empty collection; or if this Product has previously
     * been saved, it will retrieve related ProductPlugins from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Product.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|ProductPlugin[] List of ProductPlugin objects
     */
    public function getProductPluginsJoinPlugin($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = ProductPluginQuery::create(null, $criteria);
        $query->joinWith('Plugin', $join_behavior);

        return $this->getProductPlugins($query, $con);
    }

    /**
     * Clears out the collUserProducts collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Product The current object (for fluent API support)
     * @see        addUserProducts()
     */
    public function clearUserProducts()
    {
        $this->collUserProducts = null; // important to set this to null since that means it is uninitialized
        $this->collUserProductsPartial = null;

        return $this;
    }

    /**
     * reset is the collUserProducts collection loaded partially
     *
     * @return void
     */
    public function resetPartialUserProducts($v = true)
    {
        $this->collUserProductsPartial = $v;
    }

    /**
     * Initializes the collUserProducts collection.
     *
     * By default this just sets the collUserProducts collection to an empty array (like clearcollUserProducts());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initUserProducts($overrideExisting = true)
    {
        if (null !== $this->collUserProducts && !$overrideExisting) {
            return;
        }
        $this->collUserProducts = new PropelObjectCollection();
        $this->collUserProducts->setModel('UserProduct');
    }

    /**
     * Gets an array of UserProduct objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Product is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|UserProduct[] List of UserProduct objects
     * @throws PropelException
     */
    public function getUserProducts($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collUserProductsPartial && !$this->isNew();
        if (null === $this->collUserProducts || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collUserProducts) {
                // return empty collection
                $this->initUserProducts();
            } else {
                $collUserProducts = UserProductQuery::create(null, $criteria)
                    ->filterByProduct($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collUserProductsPartial && count($collUserProducts)) {
                      $this->initUserProducts(false);

                      foreach($collUserProducts as $obj) {
                        if (false == $this->collUserProducts->contains($obj)) {
                          $this->collUserProducts->append($obj);
                        }
                      }

                      $this->collUserProductsPartial = true;
                    }

                    $collUserProducts->getInternalIterator()->rewind();
                    return $collUserProducts;
                }

                if($partial && $this->collUserProducts) {
                    foreach($this->collUserProducts as $obj) {
                        if($obj->isNew()) {
                            $collUserProducts[] = $obj;
                        }
                    }
                }

                $this->collUserProducts = $collUserProducts;
                $this->collUserProductsPartial = false;
            }
        }

        return $this->collUserProducts;
    }

    /**
     * Sets a collection of UserProduct objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $userProducts A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Product The current object (for fluent API support)
     */
    public function setUserProducts(PropelCollection $userProducts, PropelPDO $con = null)
    {
        $userProductsToDelete = $this->getUserProducts(new Criteria(), $con)->diff($userProducts);

        $this->userProductsScheduledForDeletion = unserialize(serialize($userProductsToDelete));

        foreach ($userProductsToDelete as $userProductRemoved) {
            $userProductRemoved->setProduct(null);
        }

        $this->collUserProducts = null;
        foreach ($userProducts as $userProduct) {
            $this->addUserProduct($userProduct);
        }

        $this->collUserProducts = $userProducts;
        $this->collUserProductsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related UserProduct objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related UserProduct objects.
     * @throws PropelException
     */
    public function countUserProducts(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collUserProductsPartial && !$this->isNew();
        if (null === $this->collUserProducts || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collUserProducts) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getUserProducts());
            }
            $query = UserProductQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByProduct($this)
                ->count($con);
        }

        return count($this->collUserProducts);
    }

    /**
     * Method called to associate a UserProduct object to this object
     * through the UserProduct foreign key attribute.
     *
     * @param    UserProduct $l UserProduct
     * @return Product The current object (for fluent API support)
     */
    public function addUserProduct(UserProduct $l)
    {
        if ($this->collUserProducts === null) {
            $this->initUserProducts();
            $this->collUserProductsPartial = true;
        }
        if (!in_array($l, $this->collUserProducts->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddUserProduct($l);
        }

        return $this;
    }

    /**
     * @param	UserProduct $userProduct The userProduct object to add.
     */
    protected function doAddUserProduct($userProduct)
    {
        $this->collUserProducts[]= $userProduct;
        $userProduct->setProduct($this);
    }

    /**
     * @param	UserProduct $userProduct The userProduct object to remove.
     * @return Product The current object (for fluent API support)
     */
    public function removeUserProduct($userProduct)
    {
        if ($this->getUserProducts()->contains($userProduct)) {
            $this->collUserProducts->remove($this->collUserProducts->search($userProduct));
            if (null === $this->userProductsScheduledForDeletion) {
                $this->userProductsScheduledForDeletion = clone $this->collUserProducts;
                $this->userProductsScheduledForDeletion->clear();
            }
            $this->userProductsScheduledForDeletion[]= clone $userProduct;
            $userProduct->setProduct(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Product is new, it will return
     * an empty collection; or if this Product has previously
     * been saved, it will retrieve related UserProducts from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Product.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|UserProduct[] List of UserProduct objects
     */
    public function getUserProductsJoinUser($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = UserProductQuery::create(null, $criteria);
        $query->joinWith('User', $join_behavior);

        return $this->getUserProducts($query, $con);
    }

    /**
     * Clears out the collOrganizationProducts collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Product The current object (for fluent API support)
     * @see        addOrganizationProducts()
     */
    public function clearOrganizationProducts()
    {
        $this->collOrganizationProducts = null; // important to set this to null since that means it is uninitialized
        $this->collOrganizationProductsPartial = null;

        return $this;
    }

    /**
     * reset is the collOrganizationProducts collection loaded partially
     *
     * @return void
     */
    public function resetPartialOrganizationProducts($v = true)
    {
        $this->collOrganizationProductsPartial = $v;
    }

    /**
     * Initializes the collOrganizationProducts collection.
     *
     * By default this just sets the collOrganizationProducts collection to an empty array (like clearcollOrganizationProducts());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initOrganizationProducts($overrideExisting = true)
    {
        if (null !== $this->collOrganizationProducts && !$overrideExisting) {
            return;
        }
        $this->collOrganizationProducts = new PropelObjectCollection();
        $this->collOrganizationProducts->setModel('OrganizationProduct');
    }

    /**
     * Gets an array of OrganizationProduct objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Product is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|OrganizationProduct[] List of OrganizationProduct objects
     * @throws PropelException
     */
    public function getOrganizationProducts($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collOrganizationProductsPartial && !$this->isNew();
        if (null === $this->collOrganizationProducts || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collOrganizationProducts) {
                // return empty collection
                $this->initOrganizationProducts();
            } else {
                $collOrganizationProducts = OrganizationProductQuery::create(null, $criteria)
                    ->filterByProduct($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collOrganizationProductsPartial && count($collOrganizationProducts)) {
                      $this->initOrganizationProducts(false);

                      foreach($collOrganizationProducts as $obj) {
                        if (false == $this->collOrganizationProducts->contains($obj)) {
                          $this->collOrganizationProducts->append($obj);
                        }
                      }

                      $this->collOrganizationProductsPartial = true;
                    }

                    $collOrganizationProducts->getInternalIterator()->rewind();
                    return $collOrganizationProducts;
                }

                if($partial && $this->collOrganizationProducts) {
                    foreach($this->collOrganizationProducts as $obj) {
                        if($obj->isNew()) {
                            $collOrganizationProducts[] = $obj;
                        }
                    }
                }

                $this->collOrganizationProducts = $collOrganizationProducts;
                $this->collOrganizationProductsPartial = false;
            }
        }

        return $this->collOrganizationProducts;
    }

    /**
     * Sets a collection of OrganizationProduct objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $organizationProducts A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Product The current object (for fluent API support)
     */
    public function setOrganizationProducts(PropelCollection $organizationProducts, PropelPDO $con = null)
    {
        $organizationProductsToDelete = $this->getOrganizationProducts(new Criteria(), $con)->diff($organizationProducts);

        $this->organizationProductsScheduledForDeletion = unserialize(serialize($organizationProductsToDelete));

        foreach ($organizationProductsToDelete as $organizationProductRemoved) {
            $organizationProductRemoved->setProduct(null);
        }

        $this->collOrganizationProducts = null;
        foreach ($organizationProducts as $organizationProduct) {
            $this->addOrganizationProduct($organizationProduct);
        }

        $this->collOrganizationProducts = $organizationProducts;
        $this->collOrganizationProductsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related OrganizationProduct objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related OrganizationProduct objects.
     * @throws PropelException
     */
    public function countOrganizationProducts(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collOrganizationProductsPartial && !$this->isNew();
        if (null === $this->collOrganizationProducts || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collOrganizationProducts) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getOrganizationProducts());
            }
            $query = OrganizationProductQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByProduct($this)
                ->count($con);
        }

        return count($this->collOrganizationProducts);
    }

    /**
     * Method called to associate a OrganizationProduct object to this object
     * through the OrganizationProduct foreign key attribute.
     *
     * @param    OrganizationProduct $l OrganizationProduct
     * @return Product The current object (for fluent API support)
     */
    public function addOrganizationProduct(OrganizationProduct $l)
    {
        if ($this->collOrganizationProducts === null) {
            $this->initOrganizationProducts();
            $this->collOrganizationProductsPartial = true;
        }
        if (!in_array($l, $this->collOrganizationProducts->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddOrganizationProduct($l);
        }

        return $this;
    }

    /**
     * @param	OrganizationProduct $organizationProduct The organizationProduct object to add.
     */
    protected function doAddOrganizationProduct($organizationProduct)
    {
        $this->collOrganizationProducts[]= $organizationProduct;
        $organizationProduct->setProduct($this);
    }

    /**
     * @param	OrganizationProduct $organizationProduct The organizationProduct object to remove.
     * @return Product The current object (for fluent API support)
     */
    public function removeOrganizationProduct($organizationProduct)
    {
        if ($this->getOrganizationProducts()->contains($organizationProduct)) {
            $this->collOrganizationProducts->remove($this->collOrganizationProducts->search($organizationProduct));
            if (null === $this->organizationProductsScheduledForDeletion) {
                $this->organizationProductsScheduledForDeletion = clone $this->collOrganizationProducts;
                $this->organizationProductsScheduledForDeletion->clear();
            }
            $this->organizationProductsScheduledForDeletion[]= clone $organizationProduct;
            $organizationProduct->setProduct(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Product is new, it will return
     * an empty collection; or if this Product has previously
     * been saved, it will retrieve related OrganizationProducts from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Product.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|OrganizationProduct[] List of OrganizationProduct objects
     */
    public function getOrganizationProductsJoinOrganization($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = OrganizationProductQuery::create(null, $criteria);
        $query->joinWith('Organization', $join_behavior);

        return $this->getOrganizationProducts($query, $con);
    }

    /**
     * Clears out the collPlugins collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Product The current object (for fluent API support)
     * @see        addPlugins()
     */
    public function clearPlugins()
    {
        $this->collPlugins = null; // important to set this to null since that means it is uninitialized
        $this->collPluginsPartial = null;

        return $this;
    }

    /**
     * Initializes the collPlugins collection.
     *
     * By default this just sets the collPlugins collection to an empty collection (like clearPlugins());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @return void
     */
    public function initPlugins()
    {
        $this->collPlugins = new PropelObjectCollection();
        $this->collPlugins->setModel('Plugin');
    }

    /**
     * Gets a collection of Plugin objects related by a many-to-many relationship
     * to the current object by way of the product_plugin cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Product is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria Optional query object to filter the query
     * @param PropelPDO $con Optional connection object
     *
     * @return PropelObjectCollection|Plugin[] List of Plugin objects
     */
    public function getPlugins($criteria = null, PropelPDO $con = null)
    {
        if (null === $this->collPlugins || null !== $criteria) {
            if ($this->isNew() && null === $this->collPlugins) {
                // return empty collection
                $this->initPlugins();
            } else {
                $collPlugins = PluginQuery::create(null, $criteria)
                    ->filterByProduct($this)
                    ->find($con);
                if (null !== $criteria) {
                    return $collPlugins;
                }
                $this->collPlugins = $collPlugins;
            }
        }

        return $this->collPlugins;
    }

    /**
     * Sets a collection of Plugin objects related by a many-to-many relationship
     * to the current object by way of the product_plugin cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $plugins A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Product The current object (for fluent API support)
     */
    public function setPlugins(PropelCollection $plugins, PropelPDO $con = null)
    {
        $this->clearPlugins();
        $currentPlugins = $this->getPlugins();

        $this->pluginsScheduledForDeletion = $currentPlugins->diff($plugins);

        foreach ($plugins as $plugin) {
            if (!$currentPlugins->contains($plugin)) {
                $this->doAddPlugin($plugin);
            }
        }

        $this->collPlugins = $plugins;

        return $this;
    }

    /**
     * Gets the number of Plugin objects related by a many-to-many relationship
     * to the current object by way of the product_plugin cross-reference table.
     *
     * @param Criteria $criteria Optional query object to filter the query
     * @param boolean $distinct Set to true to force count distinct
     * @param PropelPDO $con Optional connection object
     *
     * @return int the number of related Plugin objects
     */
    public function countPlugins($criteria = null, $distinct = false, PropelPDO $con = null)
    {
        if (null === $this->collPlugins || null !== $criteria) {
            if ($this->isNew() && null === $this->collPlugins) {
                return 0;
            } else {
                $query = PluginQuery::create(null, $criteria);
                if ($distinct) {
                    $query->distinct();
                }

                return $query
                    ->filterByProduct($this)
                    ->count($con);
            }
        } else {
            return count($this->collPlugins);
        }
    }

    /**
     * Associate a Plugin object to this object
     * through the product_plugin cross reference table.
     *
     * @param  Plugin $plugin The ProductPlugin object to relate
     * @return Product The current object (for fluent API support)
     */
    public function addPlugin(Plugin $plugin)
    {
        if ($this->collPlugins === null) {
            $this->initPlugins();
        }
        if (!$this->collPlugins->contains($plugin)) { // only add it if the **same** object is not already associated
            $this->doAddPlugin($plugin);

            $this->collPlugins[]= $plugin;
        }

        return $this;
    }

    /**
     * @param	Plugin $plugin The plugin object to add.
     */
    protected function doAddPlugin($plugin)
    {
        $productPlugin = new ProductPlugin();
        $productPlugin->setPlugin($plugin);
        $this->addProductPlugin($productPlugin);
    }

    /**
     * Remove a Plugin object to this object
     * through the product_plugin cross reference table.
     *
     * @param Plugin $plugin The ProductPlugin object to relate
     * @return Product The current object (for fluent API support)
     */
    public function removePlugin(Plugin $plugin)
    {
        if ($this->getPlugins()->contains($plugin)) {
            $this->collPlugins->remove($this->collPlugins->search($plugin));
            if (null === $this->pluginsScheduledForDeletion) {
                $this->pluginsScheduledForDeletion = clone $this->collPlugins;
                $this->pluginsScheduledForDeletion->clear();
            }
            $this->pluginsScheduledForDeletion[]= $plugin;
        }

        return $this;
    }

    /**
     * Clears out the collUsers collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Product The current object (for fluent API support)
     * @see        addUsers()
     */
    public function clearUsers()
    {
        $this->collUsers = null; // important to set this to null since that means it is uninitialized
        $this->collUsersPartial = null;

        return $this;
    }

    /**
     * Initializes the collUsers collection.
     *
     * By default this just sets the collUsers collection to an empty collection (like clearUsers());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @return void
     */
    public function initUsers()
    {
        $this->collUsers = new PropelObjectCollection();
        $this->collUsers->setModel('User');
    }

    /**
     * Gets a collection of User objects related by a many-to-many relationship
     * to the current object by way of the user_product cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Product is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria Optional query object to filter the query
     * @param PropelPDO $con Optional connection object
     *
     * @return PropelObjectCollection|User[] List of User objects
     */
    public function getUsers($criteria = null, PropelPDO $con = null)
    {
        if (null === $this->collUsers || null !== $criteria) {
            if ($this->isNew() && null === $this->collUsers) {
                // return empty collection
                $this->initUsers();
            } else {
                $collUsers = UserQuery::create(null, $criteria)
                    ->filterByProduct($this)
                    ->find($con);
                if (null !== $criteria) {
                    return $collUsers;
                }
                $this->collUsers = $collUsers;
            }
        }

        return $this->collUsers;
    }

    /**
     * Sets a collection of User objects related by a many-to-many relationship
     * to the current object by way of the user_product cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $users A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Product The current object (for fluent API support)
     */
    public function setUsers(PropelCollection $users, PropelPDO $con = null)
    {
        $this->clearUsers();
        $currentUsers = $this->getUsers();

        $this->usersScheduledForDeletion = $currentUsers->diff($users);

        foreach ($users as $user) {
            if (!$currentUsers->contains($user)) {
                $this->doAddUser($user);
            }
        }

        $this->collUsers = $users;

        return $this;
    }

    /**
     * Gets the number of User objects related by a many-to-many relationship
     * to the current object by way of the user_product cross-reference table.
     *
     * @param Criteria $criteria Optional query object to filter the query
     * @param boolean $distinct Set to true to force count distinct
     * @param PropelPDO $con Optional connection object
     *
     * @return int the number of related User objects
     */
    public function countUsers($criteria = null, $distinct = false, PropelPDO $con = null)
    {
        if (null === $this->collUsers || null !== $criteria) {
            if ($this->isNew() && null === $this->collUsers) {
                return 0;
            } else {
                $query = UserQuery::create(null, $criteria);
                if ($distinct) {
                    $query->distinct();
                }

                return $query
                    ->filterByProduct($this)
                    ->count($con);
            }
        } else {
            return count($this->collUsers);
        }
    }

    /**
     * Associate a User object to this object
     * through the user_product cross reference table.
     *
     * @param  User $user The UserProduct object to relate
     * @return Product The current object (for fluent API support)
     */
    public function addUser(User $user)
    {
        if ($this->collUsers === null) {
            $this->initUsers();
        }
        if (!$this->collUsers->contains($user)) { // only add it if the **same** object is not already associated
            $this->doAddUser($user);

            $this->collUsers[]= $user;
        }

        return $this;
    }

    /**
     * @param	User $user The user object to add.
     */
    protected function doAddUser($user)
    {
        $userProduct = new UserProduct();
        $userProduct->setUser($user);
        $this->addUserProduct($userProduct);
    }

    /**
     * Remove a User object to this object
     * through the user_product cross reference table.
     *
     * @param User $user The UserProduct object to relate
     * @return Product The current object (for fluent API support)
     */
    public function removeUser(User $user)
    {
        if ($this->getUsers()->contains($user)) {
            $this->collUsers->remove($this->collUsers->search($user));
            if (null === $this->usersScheduledForDeletion) {
                $this->usersScheduledForDeletion = clone $this->collUsers;
                $this->usersScheduledForDeletion->clear();
            }
            $this->usersScheduledForDeletion[]= $user;
        }

        return $this;
    }

    /**
     * Clears out the collOrganizations collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Product The current object (for fluent API support)
     * @see        addOrganizations()
     */
    public function clearOrganizations()
    {
        $this->collOrganizations = null; // important to set this to null since that means it is uninitialized
        $this->collOrganizationsPartial = null;

        return $this;
    }

    /**
     * Initializes the collOrganizations collection.
     *
     * By default this just sets the collOrganizations collection to an empty collection (like clearOrganizations());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @return void
     */
    public function initOrganizations()
    {
        $this->collOrganizations = new PropelObjectCollection();
        $this->collOrganizations->setModel('Organization');
    }

    /**
     * Gets a collection of Organization objects related by a many-to-many relationship
     * to the current object by way of the organization_product cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Product is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria Optional query object to filter the query
     * @param PropelPDO $con Optional connection object
     *
     * @return PropelObjectCollection|Organization[] List of Organization objects
     */
    public function getOrganizations($criteria = null, PropelPDO $con = null)
    {
        if (null === $this->collOrganizations || null !== $criteria) {
            if ($this->isNew() && null === $this->collOrganizations) {
                // return empty collection
                $this->initOrganizations();
            } else {
                $collOrganizations = OrganizationQuery::create(null, $criteria)
                    ->filterByProduct($this)
                    ->find($con);
                if (null !== $criteria) {
                    return $collOrganizations;
                }
                $this->collOrganizations = $collOrganizations;
            }
        }

        return $this->collOrganizations;
    }

    /**
     * Sets a collection of Organization objects related by a many-to-many relationship
     * to the current object by way of the organization_product cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $organizations A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Product The current object (for fluent API support)
     */
    public function setOrganizations(PropelCollection $organizations, PropelPDO $con = null)
    {
        $this->clearOrganizations();
        $currentOrganizations = $this->getOrganizations();

        $this->organizationsScheduledForDeletion = $currentOrganizations->diff($organizations);

        foreach ($organizations as $organization) {
            if (!$currentOrganizations->contains($organization)) {
                $this->doAddOrganization($organization);
            }
        }

        $this->collOrganizations = $organizations;

        return $this;
    }

    /**
     * Gets the number of Organization objects related by a many-to-many relationship
     * to the current object by way of the organization_product cross-reference table.
     *
     * @param Criteria $criteria Optional query object to filter the query
     * @param boolean $distinct Set to true to force count distinct
     * @param PropelPDO $con Optional connection object
     *
     * @return int the number of related Organization objects
     */
    public function countOrganizations($criteria = null, $distinct = false, PropelPDO $con = null)
    {
        if (null === $this->collOrganizations || null !== $criteria) {
            if ($this->isNew() && null === $this->collOrganizations) {
                return 0;
            } else {
                $query = OrganizationQuery::create(null, $criteria);
                if ($distinct) {
                    $query->distinct();
                }

                return $query
                    ->filterByProduct($this)
                    ->count($con);
            }
        } else {
            return count($this->collOrganizations);
        }
    }

    /**
     * Associate a Organization object to this object
     * through the organization_product cross reference table.
     *
     * @param  Organization $organization The OrganizationProduct object to relate
     * @return Product The current object (for fluent API support)
     */
    public function addOrganization(Organization $organization)
    {
        if ($this->collOrganizations === null) {
            $this->initOrganizations();
        }
        if (!$this->collOrganizations->contains($organization)) { // only add it if the **same** object is not already associated
            $this->doAddOrganization($organization);

            $this->collOrganizations[]= $organization;
        }

        return $this;
    }

    /**
     * @param	Organization $organization The organization object to add.
     */
    protected function doAddOrganization($organization)
    {
        $organizationProduct = new OrganizationProduct();
        $organizationProduct->setOrganization($organization);
        $this->addOrganizationProduct($organizationProduct);
    }

    /**
     * Remove a Organization object to this object
     * through the organization_product cross reference table.
     *
     * @param Organization $organization The OrganizationProduct object to relate
     * @return Product The current object (for fluent API support)
     */
    public function removeOrganization(Organization $organization)
    {
        if ($this->getOrganizations()->contains($organization)) {
            $this->collOrganizations->remove($this->collOrganizations->search($organization));
            if (null === $this->organizationsScheduledForDeletion) {
                $this->organizationsScheduledForDeletion = clone $this->collOrganizations;
                $this->organizationsScheduledForDeletion->clear();
            }
            $this->organizationsScheduledForDeletion[]= $organization;
        }

        return $this;
    }

    /**
     * Clears the current object and sets all attributes to their default values
     */
    public function clear()
    {
        $this->id = null;
        $this->name = null;
        $this->created_at = null;
        $this->deleted = null;
        $this->data = null;
        $this->alreadyInSave = false;
        $this->alreadyInValidation = false;
        $this->alreadyInClearAllReferencesDeep = false;
        $this->clearAllReferences();
        $this->applyDefaultValues();
        $this->resetModified();
        $this->setNew(true);
        $this->setDeleted(false);
    }

    /**
     * Resets all references to other model objects or collections of model objects.
     *
     * This method is a user-space workaround for PHP's inability to garbage collect
     * objects with circular references (even in PHP 5.3). This is currently necessary
     * when using Propel in certain daemon or large-volumne/high-memory operations.
     *
     * @param boolean $deep Whether to also clear the references on all referrer objects.
     */
    public function clearAllReferences($deep = false)
    {
        if ($deep && !$this->alreadyInClearAllReferencesDeep) {
            $this->alreadyInClearAllReferencesDeep = true;
            if ($this->collProductPlugins) {
                foreach ($this->collProductPlugins as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collUserProducts) {
                foreach ($this->collUserProducts as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collOrganizationProducts) {
                foreach ($this->collOrganizationProducts as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collPlugins) {
                foreach ($this->collPlugins as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collUsers) {
                foreach ($this->collUsers as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collOrganizations) {
                foreach ($this->collOrganizations as $o) {
                    $o->clearAllReferences($deep);
                }
            }

            $this->alreadyInClearAllReferencesDeep = false;
        } // if ($deep)

        if ($this->collProductPlugins instanceof PropelCollection) {
            $this->collProductPlugins->clearIterator();
        }
        $this->collProductPlugins = null;
        if ($this->collUserProducts instanceof PropelCollection) {
            $this->collUserProducts->clearIterator();
        }
        $this->collUserProducts = null;
        if ($this->collOrganizationProducts instanceof PropelCollection) {
            $this->collOrganizationProducts->clearIterator();
        }
        $this->collOrganizationProducts = null;
        if ($this->collPlugins instanceof PropelCollection) {
            $this->collPlugins->clearIterator();
        }
        $this->collPlugins = null;
        if ($this->collUsers instanceof PropelCollection) {
            $this->collUsers->clearIterator();
        }
        $this->collUsers = null;
        if ($this->collOrganizations instanceof PropelCollection) {
            $this->collOrganizations->clearIterator();
        }
        $this->collOrganizations = null;
    }

    /**
     * return the string representation of this object
     *
     * @return string
     */
    public function __toString()
    {
        return (string) $this->exportTo(ProductPeer::DEFAULT_STRING_FORMAT);
    }

    /**
     * return true is the object is in saving state
     *
     * @return boolean
     */
    public function isAlreadyInSave()
    {
        return $this->alreadyInSave;
    }

}
