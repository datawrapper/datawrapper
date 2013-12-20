<?php


/**
 * Base class that represents a row from the 'plugin' table.
 *
 *
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BasePlugin extends BaseObject implements Persistent
{
    /**
     * Peer class name
     */
    const PEER = 'PluginPeer';

    /**
     * The Peer class.
     * Instance provides a convenient way of calling static methods on a class
     * that calling code may not be able to identify.
     * @var        PluginPeer
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
     * The value for the installed_at field.
     * @var        string
     */
    protected $installed_at;

    /**
     * The value for the enabled field.
     * Note: this column has a database default value of: false
     * @var        boolean
     */
    protected $enabled;

    /**
     * The value for the is_private field.
     * Note: this column has a database default value of: false
     * @var        boolean
     */
    protected $is_private;

    /**
     * @var        PropelObjectCollection|PluginOrganization[] Collection to store aggregation of PluginOrganization objects.
     */
    protected $collPluginOrganizations;
    protected $collPluginOrganizationsPartial;

    /**
     * @var        PropelObjectCollection|PluginData[] Collection to store aggregation of PluginData objects.
     */
    protected $collPluginDatas;
    protected $collPluginDatasPartial;

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
    protected $organizationsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $pluginOrganizationsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $pluginDatasScheduledForDeletion = null;

    /**
     * Applies default values to this object.
     * This method should be called from the object's constructor (or
     * equivalent initialization method).
     * @see        __construct()
     */
    public function applyDefaultValues()
    {
        $this->enabled = false;
        $this->is_private = false;
    }

    /**
     * Initializes internal state of BasePlugin object.
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
     * Get the [optionally formatted] temporal [installed_at] column value.
     *
     *
     * @param string $format The date/time format string (either date()-style or strftime()-style).
     *				 If format is null, then the raw DateTime object will be returned.
     * @return mixed Formatted date/time value as string or DateTime object (if format is null), null if column is null, and 0 if column value is 0000-00-00 00:00:00
     * @throws PropelException - if unable to parse/validate the date/time value.
     */
    public function getInstalledAt($format = 'Y-m-d H:i:s')
    {
        if ($this->installed_at === null) {
            return null;
        }

        if ($this->installed_at === '0000-00-00 00:00:00') {
            // while technically this is not a default value of null,
            // this seems to be closest in meaning.
            return null;
        }

        try {
            $dt = new DateTime($this->installed_at);
        } catch (Exception $x) {
            throw new PropelException("Internally stored date/time/timestamp value could not be converted to DateTime: " . var_export($this->installed_at, true), $x);
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
     * Get the [enabled] column value.
     *
     * @return boolean
     */
    public function getEnabled()
    {
        return $this->enabled;
    }

    /**
     * Get the [is_private] column value.
     *
     * @return boolean
     */
    public function getIsPrivate()
    {
        return $this->is_private;
    }

    /**
     * Set the value of [id] column.
     *
     * @param string $v new value
     * @return Plugin The current object (for fluent API support)
     */
    public function setId($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->id !== $v) {
            $this->id = $v;
            $this->modifiedColumns[] = PluginPeer::ID;
        }


        return $this;
    } // setId()

    /**
     * Sets the value of [installed_at] column to a normalized version of the date/time value specified.
     *
     * @param mixed $v string, integer (timestamp), or DateTime value.
     *               Empty strings are treated as null.
     * @return Plugin The current object (for fluent API support)
     */
    public function setInstalledAt($v)
    {
        $dt = PropelDateTime::newInstance($v, null, 'DateTime');
        if ($this->installed_at !== null || $dt !== null) {
            $currentDateAsString = ($this->installed_at !== null && $tmpDt = new DateTime($this->installed_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
            $newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
            if ($currentDateAsString !== $newDateAsString) {
                $this->installed_at = $newDateAsString;
                $this->modifiedColumns[] = PluginPeer::INSTALLED_AT;
            }
        } // if either are not null


        return $this;
    } // setInstalledAt()

    /**
     * Sets the value of the [enabled] column.
     * Non-boolean arguments are converted using the following rules:
     *   * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *   * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     * Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     *
     * @param boolean|integer|string $v The new value
     * @return Plugin The current object (for fluent API support)
     */
    public function setEnabled($v)
    {
        if ($v !== null) {
            if (is_string($v)) {
                $v = in_array(strtolower($v), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
            } else {
                $v = (boolean) $v;
            }
        }

        if ($this->enabled !== $v) {
            $this->enabled = $v;
            $this->modifiedColumns[] = PluginPeer::ENABLED;
        }


        return $this;
    } // setEnabled()

    /**
     * Sets the value of the [is_private] column.
     * Non-boolean arguments are converted using the following rules:
     *   * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *   * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     * Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     *
     * @param boolean|integer|string $v The new value
     * @return Plugin The current object (for fluent API support)
     */
    public function setIsPrivate($v)
    {
        if ($v !== null) {
            if (is_string($v)) {
                $v = in_array(strtolower($v), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
            } else {
                $v = (boolean) $v;
            }
        }

        if ($this->is_private !== $v) {
            $this->is_private = $v;
            $this->modifiedColumns[] = PluginPeer::IS_PRIVATE;
        }


        return $this;
    } // setIsPrivate()

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
            if ($this->enabled !== false) {
                return false;
            }

            if ($this->is_private !== false) {
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
            $this->installed_at = ($row[$startcol + 1] !== null) ? (string) $row[$startcol + 1] : null;
            $this->enabled = ($row[$startcol + 2] !== null) ? (boolean) $row[$startcol + 2] : null;
            $this->is_private = ($row[$startcol + 3] !== null) ? (boolean) $row[$startcol + 3] : null;
            $this->resetModified();

            $this->setNew(false);

            if ($rehydrate) {
                $this->ensureConsistency();
            }
            $this->postHydrate($row, $startcol, $rehydrate);
            return $startcol + 4; // 4 = PluginPeer::NUM_HYDRATE_COLUMNS.

        } catch (Exception $e) {
            throw new PropelException("Error populating Plugin object", $e);
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
            $con = Propel::getConnection(PluginPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        // We don't need to alter the object instance pool; we're just modifying this instance
        // already in the pool.

        $stmt = PluginPeer::doSelectStmt($this->buildPkeyCriteria(), $con);
        $row = $stmt->fetch(PDO::FETCH_NUM);
        $stmt->closeCursor();
        if (!$row) {
            throw new PropelException('Cannot find matching row in the database to reload object values.');
        }
        $this->hydrate($row, 0, true); // rehydrate

        if ($deep) {  // also de-associate any related objects?

            $this->collPluginOrganizations = null;

            $this->collPluginDatas = null;

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
            $con = Propel::getConnection(PluginPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $con->beginTransaction();
        try {
            $deleteQuery = PluginQuery::create()
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
            $con = Propel::getConnection(PluginPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
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
                PluginPeer::addInstanceToPool($this);
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

            if ($this->organizationsScheduledForDeletion !== null) {
                if (!$this->organizationsScheduledForDeletion->isEmpty()) {
                    $pks = array();
                    $pk = $this->getPrimaryKey();
                    foreach ($this->organizationsScheduledForDeletion->getPrimaryKeys(false) as $remotePk) {
                        $pks[] = array($pk, $remotePk);
                    }
                    PluginOrganizationQuery::create()
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

            if ($this->pluginDatasScheduledForDeletion !== null) {
                if (!$this->pluginDatasScheduledForDeletion->isEmpty()) {
                    PluginDataQuery::create()
                        ->filterByPrimaryKeys($this->pluginDatasScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->pluginDatasScheduledForDeletion = null;
                }
            }

            if ($this->collPluginDatas !== null) {
                foreach ($this->collPluginDatas as $referrerFK) {
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
        if ($this->isColumnModified(PluginPeer::ID)) {
            $modifiedColumns[':p' . $index++]  = '`id`';
        }
        if ($this->isColumnModified(PluginPeer::INSTALLED_AT)) {
            $modifiedColumns[':p' . $index++]  = '`installed_at`';
        }
        if ($this->isColumnModified(PluginPeer::ENABLED)) {
            $modifiedColumns[':p' . $index++]  = '`enabled`';
        }
        if ($this->isColumnModified(PluginPeer::IS_PRIVATE)) {
            $modifiedColumns[':p' . $index++]  = '`is_private`';
        }

        $sql = sprintf(
            'INSERT INTO `plugin` (%s) VALUES (%s)',
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
                    case '`installed_at`':
                        $stmt->bindValue($identifier, $this->installed_at, PDO::PARAM_STR);
                        break;
                    case '`enabled`':
                        $stmt->bindValue($identifier, (int) $this->enabled, PDO::PARAM_INT);
                        break;
                    case '`is_private`':
                        $stmt->bindValue($identifier, (int) $this->is_private, PDO::PARAM_INT);
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


            if (($retval = PluginPeer::doValidate($this, $columns)) !== true) {
                $failureMap = array_merge($failureMap, $retval);
            }


                if ($this->collPluginOrganizations !== null) {
                    foreach ($this->collPluginOrganizations as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }

                if ($this->collPluginDatas !== null) {
                    foreach ($this->collPluginDatas as $referrerFK) {
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
        $pos = PluginPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
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
                return $this->getInstalledAt();
                break;
            case 2:
                return $this->getEnabled();
                break;
            case 3:
                return $this->getIsPrivate();
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
        if (isset($alreadyDumpedObjects['Plugin'][$this->getPrimaryKey()])) {
            return '*RECURSION*';
        }
        $alreadyDumpedObjects['Plugin'][$this->getPrimaryKey()] = true;
        $keys = PluginPeer::getFieldNames($keyType);
        $result = array(
            $keys[0] => $this->getId(),
            $keys[1] => $this->getInstalledAt(),
            $keys[2] => $this->getEnabled(),
            $keys[3] => $this->getIsPrivate(),
        );
        if ($includeForeignObjects) {
            if (null !== $this->collPluginOrganizations) {
                $result['PluginOrganizations'] = $this->collPluginOrganizations->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collPluginDatas) {
                $result['PluginDatas'] = $this->collPluginDatas->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
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
        $pos = PluginPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);

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
                $this->setInstalledAt($value);
                break;
            case 2:
                $this->setEnabled($value);
                break;
            case 3:
                $this->setIsPrivate($value);
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
        $keys = PluginPeer::getFieldNames($keyType);

        if (array_key_exists($keys[0], $arr)) $this->setId($arr[$keys[0]]);
        if (array_key_exists($keys[1], $arr)) $this->setInstalledAt($arr[$keys[1]]);
        if (array_key_exists($keys[2], $arr)) $this->setEnabled($arr[$keys[2]]);
        if (array_key_exists($keys[3], $arr)) $this->setIsPrivate($arr[$keys[3]]);
    }

    /**
     * Build a Criteria object containing the values of all modified columns in this object.
     *
     * @return Criteria The Criteria object containing all modified values.
     */
    public function buildCriteria()
    {
        $criteria = new Criteria(PluginPeer::DATABASE_NAME);

        if ($this->isColumnModified(PluginPeer::ID)) $criteria->add(PluginPeer::ID, $this->id);
        if ($this->isColumnModified(PluginPeer::INSTALLED_AT)) $criteria->add(PluginPeer::INSTALLED_AT, $this->installed_at);
        if ($this->isColumnModified(PluginPeer::ENABLED)) $criteria->add(PluginPeer::ENABLED, $this->enabled);
        if ($this->isColumnModified(PluginPeer::IS_PRIVATE)) $criteria->add(PluginPeer::IS_PRIVATE, $this->is_private);

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
        $criteria = new Criteria(PluginPeer::DATABASE_NAME);
        $criteria->add(PluginPeer::ID, $this->id);

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
     * @param object $copyObj An object of Plugin (or compatible) type.
     * @param boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
     * @param boolean $makeNew Whether to reset autoincrement PKs and make the object new.
     * @throws PropelException
     */
    public function copyInto($copyObj, $deepCopy = false, $makeNew = true)
    {
        $copyObj->setInstalledAt($this->getInstalledAt());
        $copyObj->setEnabled($this->getEnabled());
        $copyObj->setIsPrivate($this->getIsPrivate());

        if ($deepCopy && !$this->startCopy) {
            // important: temporarily setNew(false) because this affects the behavior of
            // the getter/setter methods for fkey referrer objects.
            $copyObj->setNew(false);
            // store object hash to prevent cycle
            $this->startCopy = true;

            foreach ($this->getPluginOrganizations() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addPluginOrganization($relObj->copy($deepCopy));
                }
            }

            foreach ($this->getPluginDatas() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addPluginData($relObj->copy($deepCopy));
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
     * @return Plugin Clone of current object.
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
     * @return PluginPeer
     */
    public function getPeer()
    {
        if (self::$peer === null) {
            self::$peer = new PluginPeer();
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
        if ('PluginOrganization' == $relationName) {
            $this->initPluginOrganizations();
        }
        if ('PluginData' == $relationName) {
            $this->initPluginDatas();
        }
    }

    /**
     * Clears out the collPluginOrganizations collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Plugin The current object (for fluent API support)
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
     * If this Plugin is new, it will return
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
                    ->filterByPlugin($this)
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
     * @return Plugin The current object (for fluent API support)
     */
    public function setPluginOrganizations(PropelCollection $pluginOrganizations, PropelPDO $con = null)
    {
        $pluginOrganizationsToDelete = $this->getPluginOrganizations(new Criteria(), $con)->diff($pluginOrganizations);

        $this->pluginOrganizationsScheduledForDeletion = unserialize(serialize($pluginOrganizationsToDelete));

        foreach ($pluginOrganizationsToDelete as $pluginOrganizationRemoved) {
            $pluginOrganizationRemoved->setPlugin(null);
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
                ->filterByPlugin($this)
                ->count($con);
        }

        return count($this->collPluginOrganizations);
    }

    /**
     * Method called to associate a PluginOrganization object to this object
     * through the PluginOrganization foreign key attribute.
     *
     * @param    PluginOrganization $l PluginOrganization
     * @return Plugin The current object (for fluent API support)
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
        $pluginOrganization->setPlugin($this);
    }

    /**
     * @param	PluginOrganization $pluginOrganization The pluginOrganization object to remove.
     * @return Plugin The current object (for fluent API support)
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
            $pluginOrganization->setPlugin(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Plugin is new, it will return
     * an empty collection; or if this Plugin has previously
     * been saved, it will retrieve related PluginOrganizations from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Plugin.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|PluginOrganization[] List of PluginOrganization objects
     */
    public function getPluginOrganizationsJoinOrganization($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = PluginOrganizationQuery::create(null, $criteria);
        $query->joinWith('Organization', $join_behavior);

        return $this->getPluginOrganizations($query, $con);
    }

    /**
     * Clears out the collPluginDatas collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Plugin The current object (for fluent API support)
     * @see        addPluginDatas()
     */
    public function clearPluginDatas()
    {
        $this->collPluginDatas = null; // important to set this to null since that means it is uninitialized
        $this->collPluginDatasPartial = null;

        return $this;
    }

    /**
     * reset is the collPluginDatas collection loaded partially
     *
     * @return void
     */
    public function resetPartialPluginDatas($v = true)
    {
        $this->collPluginDatasPartial = $v;
    }

    /**
     * Initializes the collPluginDatas collection.
     *
     * By default this just sets the collPluginDatas collection to an empty array (like clearcollPluginDatas());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initPluginDatas($overrideExisting = true)
    {
        if (null !== $this->collPluginDatas && !$overrideExisting) {
            return;
        }
        $this->collPluginDatas = new PropelObjectCollection();
        $this->collPluginDatas->setModel('PluginData');
    }

    /**
     * Gets an array of PluginData objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Plugin is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|PluginData[] List of PluginData objects
     * @throws PropelException
     */
    public function getPluginDatas($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collPluginDatasPartial && !$this->isNew();
        if (null === $this->collPluginDatas || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collPluginDatas) {
                // return empty collection
                $this->initPluginDatas();
            } else {
                $collPluginDatas = PluginDataQuery::create(null, $criteria)
                    ->filterByPlugin($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collPluginDatasPartial && count($collPluginDatas)) {
                      $this->initPluginDatas(false);

                      foreach($collPluginDatas as $obj) {
                        if (false == $this->collPluginDatas->contains($obj)) {
                          $this->collPluginDatas->append($obj);
                        }
                      }

                      $this->collPluginDatasPartial = true;
                    }

                    $collPluginDatas->getInternalIterator()->rewind();
                    return $collPluginDatas;
                }

                if($partial && $this->collPluginDatas) {
                    foreach($this->collPluginDatas as $obj) {
                        if($obj->isNew()) {
                            $collPluginDatas[] = $obj;
                        }
                    }
                }

                $this->collPluginDatas = $collPluginDatas;
                $this->collPluginDatasPartial = false;
            }
        }

        return $this->collPluginDatas;
    }

    /**
     * Sets a collection of PluginData objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $pluginDatas A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Plugin The current object (for fluent API support)
     */
    public function setPluginDatas(PropelCollection $pluginDatas, PropelPDO $con = null)
    {
        $pluginDatasToDelete = $this->getPluginDatas(new Criteria(), $con)->diff($pluginDatas);

        $this->pluginDatasScheduledForDeletion = unserialize(serialize($pluginDatasToDelete));

        foreach ($pluginDatasToDelete as $pluginDataRemoved) {
            $pluginDataRemoved->setPlugin(null);
        }

        $this->collPluginDatas = null;
        foreach ($pluginDatas as $pluginData) {
            $this->addPluginData($pluginData);
        }

        $this->collPluginDatas = $pluginDatas;
        $this->collPluginDatasPartial = false;

        return $this;
    }

    /**
     * Returns the number of related PluginData objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related PluginData objects.
     * @throws PropelException
     */
    public function countPluginDatas(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collPluginDatasPartial && !$this->isNew();
        if (null === $this->collPluginDatas || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collPluginDatas) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getPluginDatas());
            }
            $query = PluginDataQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByPlugin($this)
                ->count($con);
        }

        return count($this->collPluginDatas);
    }

    /**
     * Method called to associate a PluginData object to this object
     * through the PluginData foreign key attribute.
     *
     * @param    PluginData $l PluginData
     * @return Plugin The current object (for fluent API support)
     */
    public function addPluginData(PluginData $l)
    {
        if ($this->collPluginDatas === null) {
            $this->initPluginDatas();
            $this->collPluginDatasPartial = true;
        }
        if (!in_array($l, $this->collPluginDatas->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddPluginData($l);
        }

        return $this;
    }

    /**
     * @param	PluginData $pluginData The pluginData object to add.
     */
    protected function doAddPluginData($pluginData)
    {
        $this->collPluginDatas[]= $pluginData;
        $pluginData->setPlugin($this);
    }

    /**
     * @param	PluginData $pluginData The pluginData object to remove.
     * @return Plugin The current object (for fluent API support)
     */
    public function removePluginData($pluginData)
    {
        if ($this->getPluginDatas()->contains($pluginData)) {
            $this->collPluginDatas->remove($this->collPluginDatas->search($pluginData));
            if (null === $this->pluginDatasScheduledForDeletion) {
                $this->pluginDatasScheduledForDeletion = clone $this->collPluginDatas;
                $this->pluginDatasScheduledForDeletion->clear();
            }
            $this->pluginDatasScheduledForDeletion[]= clone $pluginData;
            $pluginData->setPlugin(null);
        }

        return $this;
    }

    /**
     * Clears out the collOrganizations collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Plugin The current object (for fluent API support)
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
     * to the current object by way of the plugin_organization cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Plugin is new, it will return
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
                    ->filterByPlugin($this)
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
     * to the current object by way of the plugin_organization cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $organizations A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Plugin The current object (for fluent API support)
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
     * to the current object by way of the plugin_organization cross-reference table.
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
                    ->filterByPlugin($this)
                    ->count($con);
            }
        } else {
            return count($this->collOrganizations);
        }
    }

    /**
     * Associate a Organization object to this object
     * through the plugin_organization cross reference table.
     *
     * @param  Organization $organization The PluginOrganization object to relate
     * @return Plugin The current object (for fluent API support)
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
        $pluginOrganization = new PluginOrganization();
        $pluginOrganization->setOrganization($organization);
        $this->addPluginOrganization($pluginOrganization);
    }

    /**
     * Remove a Organization object to this object
     * through the plugin_organization cross reference table.
     *
     * @param Organization $organization The PluginOrganization object to relate
     * @return Plugin The current object (for fluent API support)
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
        $this->installed_at = null;
        $this->enabled = null;
        $this->is_private = null;
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
            if ($this->collPluginOrganizations) {
                foreach ($this->collPluginOrganizations as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collPluginDatas) {
                foreach ($this->collPluginDatas as $o) {
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

        if ($this->collPluginOrganizations instanceof PropelCollection) {
            $this->collPluginOrganizations->clearIterator();
        }
        $this->collPluginOrganizations = null;
        if ($this->collPluginDatas instanceof PropelCollection) {
            $this->collPluginDatas->clearIterator();
        }
        $this->collPluginDatas = null;
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
        return (string) $this->exportTo(PluginPeer::DEFAULT_STRING_FORMAT);
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
