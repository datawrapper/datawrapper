<?php


/**
 * Base class that represents a row from the 'organization' table.
 *
 *
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseOrganization extends BaseObject implements Persistent
{
    /**
     * Peer class name
     */
    const PEER = 'OrganizationPeer';

    /**
     * The Peer class.
     * Instance provides a convenient way of calling static methods on a class
     * that calling code may not be able to identify.
     * @var        OrganizationPeer
     */
    protected static $peer;

    /**
     * The flag var to prevent infinit loop in deep copy
     * @var       boolean
     */
    protected $startCopy = false;

    /**
     * The value for the id field.
     * @var        string
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
     * @var        PropelObjectCollection|Chart[] Collection to store aggregation of Chart objects.
     */
    protected $collCharts;
    protected $collChartsPartial;

    /**
     * @var        PropelObjectCollection|UserOrganization[] Collection to store aggregation of UserOrganization objects.
     */
    protected $collUserOrganizations;
    protected $collUserOrganizationsPartial;

    /**
     * @var        PropelObjectCollection|PluginOrganization[] Collection to store aggregation of PluginOrganization objects.
     */
    protected $collPluginOrganizations;
    protected $collPluginOrganizationsPartial;

    /**
     * @var        PropelObjectCollection|User[] Collection to store aggregation of User objects.
     */
    protected $collUsers;

    /**
     * @var        PropelObjectCollection|Plugin[] Collection to store aggregation of Plugin objects.
     */
    protected $collPlugins;

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
    protected $usersScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $pluginsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $chartsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $userOrganizationsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $pluginOrganizationsScheduledForDeletion = null;

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
     * Initializes internal state of BaseOrganization object.
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
     * @return string
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
     * Set the value of [id] column.
     *
     * @param string $v new value
     * @return Organization The current object (for fluent API support)
     */
    public function setId($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->id !== $v) {
            $this->id = $v;
            $this->modifiedColumns[] = OrganizationPeer::ID;
        }


        return $this;
    } // setId()

    /**
     * Set the value of [name] column.
     *
     * @param string $v new value
     * @return Organization The current object (for fluent API support)
     */
    public function setName($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->name !== $v) {
            $this->name = $v;
            $this->modifiedColumns[] = OrganizationPeer::NAME;
        }


        return $this;
    } // setName()

    /**
     * Sets the value of [created_at] column to a normalized version of the date/time value specified.
     *
     * @param mixed $v string, integer (timestamp), or DateTime value.
     *               Empty strings are treated as null.
     * @return Organization The current object (for fluent API support)
     */
    public function setCreatedAt($v)
    {
        $dt = PropelDateTime::newInstance($v, null, 'DateTime');
        if ($this->created_at !== null || $dt !== null) {
            $currentDateAsString = ($this->created_at !== null && $tmpDt = new DateTime($this->created_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
            $newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
            if ($currentDateAsString !== $newDateAsString) {
                $this->created_at = $newDateAsString;
                $this->modifiedColumns[] = OrganizationPeer::CREATED_AT;
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
     * @return Organization The current object (for fluent API support)
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
            $this->modifiedColumns[] = OrganizationPeer::DELETED;
        }


        return $this;
    } // setDeleted()

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

            $this->id = ($row[$startcol + 0] !== null) ? (string) $row[$startcol + 0] : null;
            $this->name = ($row[$startcol + 1] !== null) ? (string) $row[$startcol + 1] : null;
            $this->created_at = ($row[$startcol + 2] !== null) ? (string) $row[$startcol + 2] : null;
            $this->deleted = ($row[$startcol + 3] !== null) ? (boolean) $row[$startcol + 3] : null;
            $this->resetModified();

            $this->setNew(false);

            if ($rehydrate) {
                $this->ensureConsistency();
            }
            $this->postHydrate($row, $startcol, $rehydrate);
            return $startcol + 4; // 4 = OrganizationPeer::NUM_HYDRATE_COLUMNS.

        } catch (Exception $e) {
            throw new PropelException("Error populating Organization object", $e);
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
            $con = Propel::getConnection(OrganizationPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        // We don't need to alter the object instance pool; we're just modifying this instance
        // already in the pool.

        $stmt = OrganizationPeer::doSelectStmt($this->buildPkeyCriteria(), $con);
        $row = $stmt->fetch(PDO::FETCH_NUM);
        $stmt->closeCursor();
        if (!$row) {
            throw new PropelException('Cannot find matching row in the database to reload object values.');
        }
        $this->hydrate($row, 0, true); // rehydrate

        if ($deep) {  // also de-associate any related objects?

            $this->collCharts = null;

            $this->collUserOrganizations = null;

            $this->collPluginOrganizations = null;

            $this->collUsers = null;
            $this->collPlugins = null;
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
            $con = Propel::getConnection(OrganizationPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $con->beginTransaction();
        try {
            $deleteQuery = OrganizationQuery::create()
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
            $con = Propel::getConnection(OrganizationPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
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
                OrganizationPeer::addInstanceToPool($this);
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

            if ($this->usersScheduledForDeletion !== null) {
                if (!$this->usersScheduledForDeletion->isEmpty()) {
                    $pks = array();
                    $pk = $this->getPrimaryKey();
                    foreach ($this->usersScheduledForDeletion->getPrimaryKeys(false) as $remotePk) {
                        $pks[] = array($remotePk, $pk);
                    }
                    UserOrganizationQuery::create()
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

            if ($this->pluginsScheduledForDeletion !== null) {
                if (!$this->pluginsScheduledForDeletion->isEmpty()) {
                    $pks = array();
                    $pk = $this->getPrimaryKey();
                    foreach ($this->pluginsScheduledForDeletion->getPrimaryKeys(false) as $remotePk) {
                        $pks[] = array($remotePk, $pk);
                    }
                    PluginOrganizationQuery::create()
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

            if ($this->chartsScheduledForDeletion !== null) {
                if (!$this->chartsScheduledForDeletion->isEmpty()) {
                    foreach ($this->chartsScheduledForDeletion as $chart) {
                        // need to save related object because we set the relation to null
                        $chart->save($con);
                    }
                    $this->chartsScheduledForDeletion = null;
                }
            }

            if ($this->collCharts !== null) {
                foreach ($this->collCharts as $referrerFK) {
                    if (!$referrerFK->isDeleted() && ($referrerFK->isNew() || $referrerFK->isModified())) {
                        $affectedRows += $referrerFK->save($con);
                    }
                }
            }

            if ($this->userOrganizationsScheduledForDeletion !== null) {
                if (!$this->userOrganizationsScheduledForDeletion->isEmpty()) {
                    UserOrganizationQuery::create()
                        ->filterByPrimaryKeys($this->userOrganizationsScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->userOrganizationsScheduledForDeletion = null;
                }
            }

            if ($this->collUserOrganizations !== null) {
                foreach ($this->collUserOrganizations as $referrerFK) {
                    if (!$referrerFK->isDeleted() && ($referrerFK->isNew() || $referrerFK->isModified())) {
                        $affectedRows += $referrerFK->save($con);
                    }
                }
            }

            if ($this->pluginOrganizationsScheduledForDeletion !== null) {
                if (!$this->pluginOrganizationsScheduledForDeletion->isEmpty()) {
                    PluginOrganizationQuery::create()
                        ->filterByPrimaryKeys($this->pluginOrganizationsScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->pluginOrganizationsScheduledForDeletion = null;
                }
            }

            if ($this->collPluginOrganizations !== null) {
                foreach ($this->collPluginOrganizations as $referrerFK) {
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


         // check the columns in natural order for more readable SQL queries
        if ($this->isColumnModified(OrganizationPeer::ID)) {
            $modifiedColumns[':p' . $index++]  = '`id`';
        }
        if ($this->isColumnModified(OrganizationPeer::NAME)) {
            $modifiedColumns[':p' . $index++]  = '`name`';
        }
        if ($this->isColumnModified(OrganizationPeer::CREATED_AT)) {
            $modifiedColumns[':p' . $index++]  = '`created_at`';
        }
        if ($this->isColumnModified(OrganizationPeer::DELETED)) {
            $modifiedColumns[':p' . $index++]  = '`deleted`';
        }

        $sql = sprintf(
            'INSERT INTO `organization` (%s) VALUES (%s)',
            implode(', ', $modifiedColumns),
            implode(', ', array_keys($modifiedColumns))
        );

        try {
            $stmt = $con->prepare($sql);
            foreach ($modifiedColumns as $identifier => $columnName) {
                switch ($columnName) {
                    case '`id`':
                        $stmt->bindValue($identifier, $this->id, PDO::PARAM_STR);
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
                }
            }
            $stmt->execute();
        } catch (Exception $e) {
            Propel::log($e->getMessage(), Propel::LOG_ERR);
            throw new PropelException(sprintf('Unable to execute INSERT statement [%s]', $sql), $e);
        }

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


            if (($retval = OrganizationPeer::doValidate($this, $columns)) !== true) {
                $failureMap = array_merge($failureMap, $retval);
            }


                if ($this->collCharts !== null) {
                    foreach ($this->collCharts as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }

                if ($this->collUserOrganizations !== null) {
                    foreach ($this->collUserOrganizations as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }

                if ($this->collPluginOrganizations !== null) {
                    foreach ($this->collPluginOrganizations as $referrerFK) {
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
        $pos = OrganizationPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
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
        if (isset($alreadyDumpedObjects['Organization'][$this->getPrimaryKey()])) {
            return '*RECURSION*';
        }
        $alreadyDumpedObjects['Organization'][$this->getPrimaryKey()] = true;
        $keys = OrganizationPeer::getFieldNames($keyType);
        $result = array(
            $keys[0] => $this->getId(),
            $keys[1] => $this->getName(),
            $keys[2] => $this->getCreatedAt(),
            $keys[3] => $this->getDeleted(),
        );
        if ($includeForeignObjects) {
            if (null !== $this->collCharts) {
                $result['Charts'] = $this->collCharts->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collUserOrganizations) {
                $result['UserOrganizations'] = $this->collUserOrganizations->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collPluginOrganizations) {
                $result['PluginOrganizations'] = $this->collPluginOrganizations->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
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
        $pos = OrganizationPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);

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
        $keys = OrganizationPeer::getFieldNames($keyType);

        if (array_key_exists($keys[0], $arr)) $this->setId($arr[$keys[0]]);
        if (array_key_exists($keys[1], $arr)) $this->setName($arr[$keys[1]]);
        if (array_key_exists($keys[2], $arr)) $this->setCreatedAt($arr[$keys[2]]);
        if (array_key_exists($keys[3], $arr)) $this->setDeleted($arr[$keys[3]]);
    }

    /**
     * Build a Criteria object containing the values of all modified columns in this object.
     *
     * @return Criteria The Criteria object containing all modified values.
     */
    public function buildCriteria()
    {
        $criteria = new Criteria(OrganizationPeer::DATABASE_NAME);

        if ($this->isColumnModified(OrganizationPeer::ID)) $criteria->add(OrganizationPeer::ID, $this->id);
        if ($this->isColumnModified(OrganizationPeer::NAME)) $criteria->add(OrganizationPeer::NAME, $this->name);
        if ($this->isColumnModified(OrganizationPeer::CREATED_AT)) $criteria->add(OrganizationPeer::CREATED_AT, $this->created_at);
        if ($this->isColumnModified(OrganizationPeer::DELETED)) $criteria->add(OrganizationPeer::DELETED, $this->deleted);

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
        $criteria = new Criteria(OrganizationPeer::DATABASE_NAME);
        $criteria->add(OrganizationPeer::ID, $this->id);

        return $criteria;
    }

    /**
     * Returns the primary key for this object (row).
     * @return string
     */
    public function getPrimaryKey()
    {
        return $this->getId();
    }

    /**
     * Generic method to set the primary key (id column).
     *
     * @param  string $key Primary key.
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
     * @param object $copyObj An object of Organization (or compatible) type.
     * @param boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
     * @param boolean $makeNew Whether to reset autoincrement PKs and make the object new.
     * @throws PropelException
     */
    public function copyInto($copyObj, $deepCopy = false, $makeNew = true)
    {
        $copyObj->setName($this->getName());
        $copyObj->setCreatedAt($this->getCreatedAt());
        $copyObj->setDeleted($this->getDeleted());

        if ($deepCopy && !$this->startCopy) {
            // important: temporarily setNew(false) because this affects the behavior of
            // the getter/setter methods for fkey referrer objects.
            $copyObj->setNew(false);
            // store object hash to prevent cycle
            $this->startCopy = true;

            foreach ($this->getCharts() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addChart($relObj->copy($deepCopy));
                }
            }

            foreach ($this->getUserOrganizations() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addUserOrganization($relObj->copy($deepCopy));
                }
            }

            foreach ($this->getPluginOrganizations() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addPluginOrganization($relObj->copy($deepCopy));
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
     * @return Organization Clone of current object.
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
     * @return OrganizationPeer
     */
    public function getPeer()
    {
        if (self::$peer === null) {
            self::$peer = new OrganizationPeer();
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
        if ('Chart' == $relationName) {
            $this->initCharts();
        }
        if ('UserOrganization' == $relationName) {
            $this->initUserOrganizations();
        }
        if ('PluginOrganization' == $relationName) {
            $this->initPluginOrganizations();
        }
    }

    /**
     * Clears out the collCharts collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Organization The current object (for fluent API support)
     * @see        addCharts()
     */
    public function clearCharts()
    {
        $this->collCharts = null; // important to set this to null since that means it is uninitialized
        $this->collChartsPartial = null;

        return $this;
    }

    /**
     * reset is the collCharts collection loaded partially
     *
     * @return void
     */
    public function resetPartialCharts($v = true)
    {
        $this->collChartsPartial = $v;
    }

    /**
     * Initializes the collCharts collection.
     *
     * By default this just sets the collCharts collection to an empty array (like clearcollCharts());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initCharts($overrideExisting = true)
    {
        if (null !== $this->collCharts && !$overrideExisting) {
            return;
        }
        $this->collCharts = new PropelObjectCollection();
        $this->collCharts->setModel('Chart');
    }

    /**
     * Gets an array of Chart objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Organization is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|Chart[] List of Chart objects
     * @throws PropelException
     */
    public function getCharts($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collChartsPartial && !$this->isNew();
        if (null === $this->collCharts || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collCharts) {
                // return empty collection
                $this->initCharts();
            } else {
                $collCharts = ChartQuery::create(null, $criteria)
                    ->filterByOrganization($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collChartsPartial && count($collCharts)) {
                      $this->initCharts(false);

                      foreach($collCharts as $obj) {
                        if (false == $this->collCharts->contains($obj)) {
                          $this->collCharts->append($obj);
                        }
                      }

                      $this->collChartsPartial = true;
                    }

                    $collCharts->getInternalIterator()->rewind();
                    return $collCharts;
                }

                if($partial && $this->collCharts) {
                    foreach($this->collCharts as $obj) {
                        if($obj->isNew()) {
                            $collCharts[] = $obj;
                        }
                    }
                }

                $this->collCharts = $collCharts;
                $this->collChartsPartial = false;
            }
        }

        return $this->collCharts;
    }

    /**
     * Sets a collection of Chart objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $charts A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Organization The current object (for fluent API support)
     */
    public function setCharts(PropelCollection $charts, PropelPDO $con = null)
    {
        $chartsToDelete = $this->getCharts(new Criteria(), $con)->diff($charts);

        $this->chartsScheduledForDeletion = unserialize(serialize($chartsToDelete));

        foreach ($chartsToDelete as $chartRemoved) {
            $chartRemoved->setOrganization(null);
        }

        $this->collCharts = null;
        foreach ($charts as $chart) {
            $this->addChart($chart);
        }

        $this->collCharts = $charts;
        $this->collChartsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related Chart objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related Chart objects.
     * @throws PropelException
     */
    public function countCharts(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collChartsPartial && !$this->isNew();
        if (null === $this->collCharts || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collCharts) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getCharts());
            }
            $query = ChartQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByOrganization($this)
                ->count($con);
        }

        return count($this->collCharts);
    }

    /**
     * Method called to associate a Chart object to this object
     * through the Chart foreign key attribute.
     *
     * @param    Chart $l Chart
     * @return Organization The current object (for fluent API support)
     */
    public function addChart(Chart $l)
    {
        if ($this->collCharts === null) {
            $this->initCharts();
            $this->collChartsPartial = true;
        }
        if (!in_array($l, $this->collCharts->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddChart($l);
        }

        return $this;
    }

    /**
     * @param	Chart $chart The chart object to add.
     */
    protected function doAddChart($chart)
    {
        $this->collCharts[]= $chart;
        $chart->setOrganization($this);
    }

    /**
     * @param	Chart $chart The chart object to remove.
     * @return Organization The current object (for fluent API support)
     */
    public function removeChart($chart)
    {
        if ($this->getCharts()->contains($chart)) {
            $this->collCharts->remove($this->collCharts->search($chart));
            if (null === $this->chartsScheduledForDeletion) {
                $this->chartsScheduledForDeletion = clone $this->collCharts;
                $this->chartsScheduledForDeletion->clear();
            }
            $this->chartsScheduledForDeletion[]= $chart;
            $chart->setOrganization(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Organization is new, it will return
     * an empty collection; or if this Organization has previously
     * been saved, it will retrieve related Charts from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Organization.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|Chart[] List of Chart objects
     */
    public function getChartsJoinUser($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = ChartQuery::create(null, $criteria);
        $query->joinWith('User', $join_behavior);

        return $this->getCharts($query, $con);
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Organization is new, it will return
     * an empty collection; or if this Organization has previously
     * been saved, it will retrieve related Charts from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Organization.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|Chart[] List of Chart objects
     */
    public function getChartsJoinChartRelatedByForkedFrom($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = ChartQuery::create(null, $criteria);
        $query->joinWith('ChartRelatedByForkedFrom', $join_behavior);

        return $this->getCharts($query, $con);
    }

    /**
     * Clears out the collUserOrganizations collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Organization The current object (for fluent API support)
     * @see        addUserOrganizations()
     */
    public function clearUserOrganizations()
    {
        $this->collUserOrganizations = null; // important to set this to null since that means it is uninitialized
        $this->collUserOrganizationsPartial = null;

        return $this;
    }

    /**
     * reset is the collUserOrganizations collection loaded partially
     *
     * @return void
     */
    public function resetPartialUserOrganizations($v = true)
    {
        $this->collUserOrganizationsPartial = $v;
    }

    /**
     * Initializes the collUserOrganizations collection.
     *
     * By default this just sets the collUserOrganizations collection to an empty array (like clearcollUserOrganizations());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initUserOrganizations($overrideExisting = true)
    {
        if (null !== $this->collUserOrganizations && !$overrideExisting) {
            return;
        }
        $this->collUserOrganizations = new PropelObjectCollection();
        $this->collUserOrganizations->setModel('UserOrganization');
    }

    /**
     * Gets an array of UserOrganization objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Organization is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|UserOrganization[] List of UserOrganization objects
     * @throws PropelException
     */
    public function getUserOrganizations($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collUserOrganizationsPartial && !$this->isNew();
        if (null === $this->collUserOrganizations || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collUserOrganizations) {
                // return empty collection
                $this->initUserOrganizations();
            } else {
                $collUserOrganizations = UserOrganizationQuery::create(null, $criteria)
                    ->filterByOrganization($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collUserOrganizationsPartial && count($collUserOrganizations)) {
                      $this->initUserOrganizations(false);

                      foreach($collUserOrganizations as $obj) {
                        if (false == $this->collUserOrganizations->contains($obj)) {
                          $this->collUserOrganizations->append($obj);
                        }
                      }

                      $this->collUserOrganizationsPartial = true;
                    }

                    $collUserOrganizations->getInternalIterator()->rewind();
                    return $collUserOrganizations;
                }

                if($partial && $this->collUserOrganizations) {
                    foreach($this->collUserOrganizations as $obj) {
                        if($obj->isNew()) {
                            $collUserOrganizations[] = $obj;
                        }
                    }
                }

                $this->collUserOrganizations = $collUserOrganizations;
                $this->collUserOrganizationsPartial = false;
            }
        }

        return $this->collUserOrganizations;
    }

    /**
     * Sets a collection of UserOrganization objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $userOrganizations A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Organization The current object (for fluent API support)
     */
    public function setUserOrganizations(PropelCollection $userOrganizations, PropelPDO $con = null)
    {
        $userOrganizationsToDelete = $this->getUserOrganizations(new Criteria(), $con)->diff($userOrganizations);

        $this->userOrganizationsScheduledForDeletion = unserialize(serialize($userOrganizationsToDelete));

        foreach ($userOrganizationsToDelete as $userOrganizationRemoved) {
            $userOrganizationRemoved->setOrganization(null);
        }

        $this->collUserOrganizations = null;
        foreach ($userOrganizations as $userOrganization) {
            $this->addUserOrganization($userOrganization);
        }

        $this->collUserOrganizations = $userOrganizations;
        $this->collUserOrganizationsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related UserOrganization objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related UserOrganization objects.
     * @throws PropelException
     */
    public function countUserOrganizations(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collUserOrganizationsPartial && !$this->isNew();
        if (null === $this->collUserOrganizations || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collUserOrganizations) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getUserOrganizations());
            }
            $query = UserOrganizationQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByOrganization($this)
                ->count($con);
        }

        return count($this->collUserOrganizations);
    }

    /**
     * Method called to associate a UserOrganization object to this object
     * through the UserOrganization foreign key attribute.
     *
     * @param    UserOrganization $l UserOrganization
     * @return Organization The current object (for fluent API support)
     */
    public function addUserOrganization(UserOrganization $l)
    {
        if ($this->collUserOrganizations === null) {
            $this->initUserOrganizations();
            $this->collUserOrganizationsPartial = true;
        }
        if (!in_array($l, $this->collUserOrganizations->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddUserOrganization($l);
        }

        return $this;
    }

    /**
     * @param	UserOrganization $userOrganization The userOrganization object to add.
     */
    protected function doAddUserOrganization($userOrganization)
    {
        $this->collUserOrganizations[]= $userOrganization;
        $userOrganization->setOrganization($this);
    }

    /**
     * @param	UserOrganization $userOrganization The userOrganization object to remove.
     * @return Organization The current object (for fluent API support)
     */
    public function removeUserOrganization($userOrganization)
    {
        if ($this->getUserOrganizations()->contains($userOrganization)) {
            $this->collUserOrganizations->remove($this->collUserOrganizations->search($userOrganization));
            if (null === $this->userOrganizationsScheduledForDeletion) {
                $this->userOrganizationsScheduledForDeletion = clone $this->collUserOrganizations;
                $this->userOrganizationsScheduledForDeletion->clear();
            }
            $this->userOrganizationsScheduledForDeletion[]= clone $userOrganization;
            $userOrganization->setOrganization(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Organization is new, it will return
     * an empty collection; or if this Organization has previously
     * been saved, it will retrieve related UserOrganizations from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Organization.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|UserOrganization[] List of UserOrganization objects
     */
    public function getUserOrganizationsJoinUser($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = UserOrganizationQuery::create(null, $criteria);
        $query->joinWith('User', $join_behavior);

        return $this->getUserOrganizations($query, $con);
    }

    /**
     * Clears out the collPluginOrganizations collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Organization The current object (for fluent API support)
     * @see        addPluginOrganizations()
     */
    public function clearPluginOrganizations()
    {
        $this->collPluginOrganizations = null; // important to set this to null since that means it is uninitialized
        $this->collPluginOrganizationsPartial = null;

        return $this;
    }

    /**
     * reset is the collPluginOrganizations collection loaded partially
     *
     * @return void
     */
    public function resetPartialPluginOrganizations($v = true)
    {
        $this->collPluginOrganizationsPartial = $v;
    }

    /**
     * Initializes the collPluginOrganizations collection.
     *
     * By default this just sets the collPluginOrganizations collection to an empty array (like clearcollPluginOrganizations());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initPluginOrganizations($overrideExisting = true)
    {
        if (null !== $this->collPluginOrganizations && !$overrideExisting) {
            return;
        }
        $this->collPluginOrganizations = new PropelObjectCollection();
        $this->collPluginOrganizations->setModel('PluginOrganization');
    }

    /**
     * Gets an array of PluginOrganization objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Organization is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|PluginOrganization[] List of PluginOrganization objects
     * @throws PropelException
     */
    public function getPluginOrganizations($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collPluginOrganizationsPartial && !$this->isNew();
        if (null === $this->collPluginOrganizations || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collPluginOrganizations) {
                // return empty collection
                $this->initPluginOrganizations();
            } else {
                $collPluginOrganizations = PluginOrganizationQuery::create(null, $criteria)
                    ->filterByOrganization($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collPluginOrganizationsPartial && count($collPluginOrganizations)) {
                      $this->initPluginOrganizations(false);

                      foreach($collPluginOrganizations as $obj) {
                        if (false == $this->collPluginOrganizations->contains($obj)) {
                          $this->collPluginOrganizations->append($obj);
                        }
                      }

                      $this->collPluginOrganizationsPartial = true;
                    }

                    $collPluginOrganizations->getInternalIterator()->rewind();
                    return $collPluginOrganizations;
                }

                if($partial && $this->collPluginOrganizations) {
                    foreach($this->collPluginOrganizations as $obj) {
                        if($obj->isNew()) {
                            $collPluginOrganizations[] = $obj;
                        }
                    }
                }

                $this->collPluginOrganizations = $collPluginOrganizations;
                $this->collPluginOrganizationsPartial = false;
            }
        }

        return $this->collPluginOrganizations;
    }

    /**
     * Sets a collection of PluginOrganization objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $pluginOrganizations A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Organization The current object (for fluent API support)
     */
    public function setPluginOrganizations(PropelCollection $pluginOrganizations, PropelPDO $con = null)
    {
        $pluginOrganizationsToDelete = $this->getPluginOrganizations(new Criteria(), $con)->diff($pluginOrganizations);

        $this->pluginOrganizationsScheduledForDeletion = unserialize(serialize($pluginOrganizationsToDelete));

        foreach ($pluginOrganizationsToDelete as $pluginOrganizationRemoved) {
            $pluginOrganizationRemoved->setOrganization(null);
        }

        $this->collPluginOrganizations = null;
        foreach ($pluginOrganizations as $pluginOrganization) {
            $this->addPluginOrganization($pluginOrganization);
        }

        $this->collPluginOrganizations = $pluginOrganizations;
        $this->collPluginOrganizationsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related PluginOrganization objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related PluginOrganization objects.
     * @throws PropelException
     */
    public function countPluginOrganizations(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collPluginOrganizationsPartial && !$this->isNew();
        if (null === $this->collPluginOrganizations || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collPluginOrganizations) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getPluginOrganizations());
            }
            $query = PluginOrganizationQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByOrganization($this)
                ->count($con);
        }

        return count($this->collPluginOrganizations);
    }

    /**
     * Method called to associate a PluginOrganization object to this object
     * through the PluginOrganization foreign key attribute.
     *
     * @param    PluginOrganization $l PluginOrganization
     * @return Organization The current object (for fluent API support)
     */
    public function addPluginOrganization(PluginOrganization $l)
    {
        if ($this->collPluginOrganizations === null) {
            $this->initPluginOrganizations();
            $this->collPluginOrganizationsPartial = true;
        }
        if (!in_array($l, $this->collPluginOrganizations->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddPluginOrganization($l);
        }

        return $this;
    }

    /**
     * @param	PluginOrganization $pluginOrganization The pluginOrganization object to add.
     */
    protected function doAddPluginOrganization($pluginOrganization)
    {
        $this->collPluginOrganizations[]= $pluginOrganization;
        $pluginOrganization->setOrganization($this);
    }

    /**
     * @param	PluginOrganization $pluginOrganization The pluginOrganization object to remove.
     * @return Organization The current object (for fluent API support)
     */
    public function removePluginOrganization($pluginOrganization)
    {
        if ($this->getPluginOrganizations()->contains($pluginOrganization)) {
            $this->collPluginOrganizations->remove($this->collPluginOrganizations->search($pluginOrganization));
            if (null === $this->pluginOrganizationsScheduledForDeletion) {
                $this->pluginOrganizationsScheduledForDeletion = clone $this->collPluginOrganizations;
                $this->pluginOrganizationsScheduledForDeletion->clear();
            }
            $this->pluginOrganizationsScheduledForDeletion[]= clone $pluginOrganization;
            $pluginOrganization->setOrganization(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Organization is new, it will return
     * an empty collection; or if this Organization has previously
     * been saved, it will retrieve related PluginOrganizations from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Organization.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|PluginOrganization[] List of PluginOrganization objects
     */
    public function getPluginOrganizationsJoinPlugin($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = PluginOrganizationQuery::create(null, $criteria);
        $query->joinWith('Plugin', $join_behavior);

        return $this->getPluginOrganizations($query, $con);
    }

    /**
     * Clears out the collUsers collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Organization The current object (for fluent API support)
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
     * to the current object by way of the user_organization cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Organization is new, it will return
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
                    ->filterByOrganization($this)
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
     * to the current object by way of the user_organization cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $users A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Organization The current object (for fluent API support)
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
     * to the current object by way of the user_organization cross-reference table.
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
                    ->filterByOrganization($this)
                    ->count($con);
            }
        } else {
            return count($this->collUsers);
        }
    }

    /**
     * Associate a User object to this object
     * through the user_organization cross reference table.
     *
     * @param  User $user The UserOrganization object to relate
     * @return Organization The current object (for fluent API support)
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
        $userOrganization = new UserOrganization();
        $userOrganization->setUser($user);
        $this->addUserOrganization($userOrganization);
    }

    /**
     * Remove a User object to this object
     * through the user_organization cross reference table.
     *
     * @param User $user The UserOrganization object to relate
     * @return Organization The current object (for fluent API support)
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
     * Clears out the collPlugins collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Organization The current object (for fluent API support)
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
     * to the current object by way of the plugin_organization cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Organization is new, it will return
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
                    ->filterByOrganization($this)
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
     * to the current object by way of the plugin_organization cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $plugins A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Organization The current object (for fluent API support)
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
     * to the current object by way of the plugin_organization cross-reference table.
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
                    ->filterByOrganization($this)
                    ->count($con);
            }
        } else {
            return count($this->collPlugins);
        }
    }

    /**
     * Associate a Plugin object to this object
     * through the plugin_organization cross reference table.
     *
     * @param  Plugin $plugin The PluginOrganization object to relate
     * @return Organization The current object (for fluent API support)
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
        $pluginOrganization = new PluginOrganization();
        $pluginOrganization->setPlugin($plugin);
        $this->addPluginOrganization($pluginOrganization);
    }

    /**
     * Remove a Plugin object to this object
     * through the plugin_organization cross reference table.
     *
     * @param Plugin $plugin The PluginOrganization object to relate
     * @return Organization The current object (for fluent API support)
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
     * Clears the current object and sets all attributes to their default values
     */
    public function clear()
    {
        $this->id = null;
        $this->name = null;
        $this->created_at = null;
        $this->deleted = null;
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
            if ($this->collCharts) {
                foreach ($this->collCharts as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collUserOrganizations) {
                foreach ($this->collUserOrganizations as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collPluginOrganizations) {
                foreach ($this->collPluginOrganizations as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collUsers) {
                foreach ($this->collUsers as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collPlugins) {
                foreach ($this->collPlugins as $o) {
                    $o->clearAllReferences($deep);
                }
            }

            $this->alreadyInClearAllReferencesDeep = false;
        } // if ($deep)

        if ($this->collCharts instanceof PropelCollection) {
            $this->collCharts->clearIterator();
        }
        $this->collCharts = null;
        if ($this->collUserOrganizations instanceof PropelCollection) {
            $this->collUserOrganizations->clearIterator();
        }
        $this->collUserOrganizations = null;
        if ($this->collPluginOrganizations instanceof PropelCollection) {
            $this->collPluginOrganizations->clearIterator();
        }
        $this->collPluginOrganizations = null;
        if ($this->collUsers instanceof PropelCollection) {
            $this->collUsers->clearIterator();
        }
        $this->collUsers = null;
        if ($this->collPlugins instanceof PropelCollection) {
            $this->collPlugins->clearIterator();
        }
        $this->collPlugins = null;
    }

    /**
     * return the string representation of this object
     *
     * @return string
     */
    public function __toString()
    {
        return (string) $this->exportTo(OrganizationPeer::DEFAULT_STRING_FORMAT);
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
