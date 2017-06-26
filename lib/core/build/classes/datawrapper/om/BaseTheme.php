<?php


/**
 * Base class that represents a row from the 'theme' table.
 *
 *
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseTheme extends BaseObject implements Persistent
{
    /**
     * Peer class name
     */
    const PEER = 'ThemePeer';

    /**
     * The Peer class.
     * Instance provides a convenient way of calling static methods on a class
     * that calling code may not be able to identify.
     * @var        ThemePeer
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
     * The value for the created_at field.
     * @var        string
     */
    protected $created_at;

    /**
     * The value for the extend field.
     * @var        string
     */
    protected $extend;

    /**
     * The value for the title field.
     * @var        string
     */
    protected $title;

    /**
     * The value for the data field.
     * @var        string
     */
    protected $data;

    /**
     * The value for the less field.
     * @var        string
     */
    protected $less;

    /**
     * The value for the assets field.
     * @var        string
     */
    protected $assets;

    /**
     * @var        PropelObjectCollection|OrganizationTheme[] Collection to store aggregation of OrganizationTheme objects.
     */
    protected $collOrganizationThemes;
    protected $collOrganizationThemesPartial;

    /**
     * @var        PropelObjectCollection|UserTheme[] Collection to store aggregation of UserTheme objects.
     */
    protected $collUserThemes;
    protected $collUserThemesPartial;

    /**
     * @var        PropelObjectCollection|Organization[] Collection to store aggregation of Organization objects.
     */
    protected $collOrganizations;

    /**
     * @var        PropelObjectCollection|User[] Collection to store aggregation of User objects.
     */
    protected $collUsers;

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
    protected $usersScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $organizationThemesScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $userThemesScheduledForDeletion = null;

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
     * Get the [extend] column value.
     *
     * @return string
     */
    public function getExtend()
    {
        return $this->extend;
    }

    /**
     * Get the [title] column value.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
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
     * Get the [less] column value.
     *
     * @return string
     */
    public function getLess()
    {
        return $this->less;
    }

    /**
     * Get the [assets] column value.
     *
     * @return string
     */
    public function getAssets()
    {
        return $this->assets;
    }

    /**
     * Set the value of [id] column.
     *
     * @param string $v new value
     * @return Theme The current object (for fluent API support)
     */
    public function setId($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->id !== $v) {
            $this->id = $v;
            $this->modifiedColumns[] = ThemePeer::ID;
        }


        return $this;
    } // setId()

    /**
     * Sets the value of [created_at] column to a normalized version of the date/time value specified.
     *
     * @param mixed $v string, integer (timestamp), or DateTime value.
     *               Empty strings are treated as null.
     * @return Theme The current object (for fluent API support)
     */
    public function setCreatedAt($v)
    {
        $dt = PropelDateTime::newInstance($v, null, 'DateTime');
        if ($this->created_at !== null || $dt !== null) {
            $currentDateAsString = ($this->created_at !== null && $tmpDt = new DateTime($this->created_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
            $newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
            if ($currentDateAsString !== $newDateAsString) {
                $this->created_at = $newDateAsString;
                $this->modifiedColumns[] = ThemePeer::CREATED_AT;
            }
        } // if either are not null


        return $this;
    } // setCreatedAt()

    /**
     * Set the value of [extend] column.
     *
     * @param string $v new value
     * @return Theme The current object (for fluent API support)
     */
    public function setExtend($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->extend !== $v) {
            $this->extend = $v;
            $this->modifiedColumns[] = ThemePeer::EXTEND;
        }


        return $this;
    } // setExtend()

    /**
     * Set the value of [title] column.
     *
     * @param string $v new value
     * @return Theme The current object (for fluent API support)
     */
    public function setTitle($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->title !== $v) {
            $this->title = $v;
            $this->modifiedColumns[] = ThemePeer::TITLE;
        }


        return $this;
    } // setTitle()

    /**
     * Set the value of [data] column.
     *
     * @param string $v new value
     * @return Theme The current object (for fluent API support)
     */
    public function setData($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->data !== $v) {
            $this->data = $v;
            $this->modifiedColumns[] = ThemePeer::DATA;
        }


        return $this;
    } // setData()

    /**
     * Set the value of [less] column.
     *
     * @param string $v new value
     * @return Theme The current object (for fluent API support)
     */
    public function setLess($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->less !== $v) {
            $this->less = $v;
            $this->modifiedColumns[] = ThemePeer::LESS;
        }


        return $this;
    } // setLess()

    /**
     * Set the value of [assets] column.
     *
     * @param string $v new value
     * @return Theme The current object (for fluent API support)
     */
    public function setAssets($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->assets !== $v) {
            $this->assets = $v;
            $this->modifiedColumns[] = ThemePeer::ASSETS;
        }


        return $this;
    } // setAssets()

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
            $this->created_at = ($row[$startcol + 1] !== null) ? (string) $row[$startcol + 1] : null;
            $this->extend = ($row[$startcol + 2] !== null) ? (string) $row[$startcol + 2] : null;
            $this->title = ($row[$startcol + 3] !== null) ? (string) $row[$startcol + 3] : null;
            $this->data = ($row[$startcol + 4] !== null) ? (string) $row[$startcol + 4] : null;
            $this->less = ($row[$startcol + 5] !== null) ? (string) $row[$startcol + 5] : null;
            $this->assets = ($row[$startcol + 6] !== null) ? (string) $row[$startcol + 6] : null;
            $this->resetModified();

            $this->setNew(false);

            if ($rehydrate) {
                $this->ensureConsistency();
            }
            $this->postHydrate($row, $startcol, $rehydrate);
            return $startcol + 7; // 7 = ThemePeer::NUM_HYDRATE_COLUMNS.

        } catch (Exception $e) {
            throw new PropelException("Error populating Theme object", $e);
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
            $con = Propel::getConnection(ThemePeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        // We don't need to alter the object instance pool; we're just modifying this instance
        // already in the pool.

        $stmt = ThemePeer::doSelectStmt($this->buildPkeyCriteria(), $con);
        $row = $stmt->fetch(PDO::FETCH_NUM);
        $stmt->closeCursor();
        if (!$row) {
            throw new PropelException('Cannot find matching row in the database to reload object values.');
        }
        $this->hydrate($row, 0, true); // rehydrate

        if ($deep) {  // also de-associate any related objects?

            $this->collOrganizationThemes = null;

            $this->collUserThemes = null;

            $this->collOrganizations = null;
            $this->collUsers = null;
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
            $con = Propel::getConnection(ThemePeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $con->beginTransaction();
        try {
            $deleteQuery = ThemeQuery::create()
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
            $con = Propel::getConnection(ThemePeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
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
                ThemePeer::addInstanceToPool($this);
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
                        $pks[] = array($remotePk, $pk);
                    }
                    OrganizationThemeQuery::create()
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

            if ($this->usersScheduledForDeletion !== null) {
                if (!$this->usersScheduledForDeletion->isEmpty()) {
                    $pks = array();
                    $pk = $this->getPrimaryKey();
                    foreach ($this->usersScheduledForDeletion->getPrimaryKeys(false) as $remotePk) {
                        $pks[] = array($remotePk, $pk);
                    }
                    UserThemeQuery::create()
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

            if ($this->organizationThemesScheduledForDeletion !== null) {
                if (!$this->organizationThemesScheduledForDeletion->isEmpty()) {
                    OrganizationThemeQuery::create()
                        ->filterByPrimaryKeys($this->organizationThemesScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->organizationThemesScheduledForDeletion = null;
                }
            }

            if ($this->collOrganizationThemes !== null) {
                foreach ($this->collOrganizationThemes as $referrerFK) {
                    if (!$referrerFK->isDeleted() && ($referrerFK->isNew() || $referrerFK->isModified())) {
                        $affectedRows += $referrerFK->save($con);
                    }
                }
            }

            if ($this->userThemesScheduledForDeletion !== null) {
                if (!$this->userThemesScheduledForDeletion->isEmpty()) {
                    UserThemeQuery::create()
                        ->filterByPrimaryKeys($this->userThemesScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->userThemesScheduledForDeletion = null;
                }
            }

            if ($this->collUserThemes !== null) {
                foreach ($this->collUserThemes as $referrerFK) {
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
        if ($this->isColumnModified(ThemePeer::ID)) {
            $modifiedColumns[':p' . $index++]  = '`id`';
        }
        if ($this->isColumnModified(ThemePeer::CREATED_AT)) {
            $modifiedColumns[':p' . $index++]  = '`created_at`';
        }
        if ($this->isColumnModified(ThemePeer::EXTEND)) {
            $modifiedColumns[':p' . $index++]  = '`extend`';
        }
        if ($this->isColumnModified(ThemePeer::TITLE)) {
            $modifiedColumns[':p' . $index++]  = '`title`';
        }
        if ($this->isColumnModified(ThemePeer::DATA)) {
            $modifiedColumns[':p' . $index++]  = '`data`';
        }
        if ($this->isColumnModified(ThemePeer::LESS)) {
            $modifiedColumns[':p' . $index++]  = '`less`';
        }
        if ($this->isColumnModified(ThemePeer::ASSETS)) {
            $modifiedColumns[':p' . $index++]  = '`assets`';
        }

        $sql = sprintf(
            'INSERT INTO `theme` (%s) VALUES (%s)',
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
                    case '`created_at`':
                        $stmt->bindValue($identifier, $this->created_at, PDO::PARAM_STR);
                        break;
                    case '`extend`':
                        $stmt->bindValue($identifier, $this->extend, PDO::PARAM_STR);
                        break;
                    case '`title`':
                        $stmt->bindValue($identifier, $this->title, PDO::PARAM_STR);
                        break;
                    case '`data`':
                        $stmt->bindValue($identifier, $this->data, PDO::PARAM_STR);
                        break;
                    case '`less`':
                        $stmt->bindValue($identifier, $this->less, PDO::PARAM_STR);
                        break;
                    case '`assets`':
                        $stmt->bindValue($identifier, $this->assets, PDO::PARAM_STR);
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


            if (($retval = ThemePeer::doValidate($this, $columns)) !== true) {
                $failureMap = array_merge($failureMap, $retval);
            }


                if ($this->collOrganizationThemes !== null) {
                    foreach ($this->collOrganizationThemes as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }

                if ($this->collUserThemes !== null) {
                    foreach ($this->collUserThemes as $referrerFK) {
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
        $pos = ThemePeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
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
                return $this->getCreatedAt();
                break;
            case 2:
                return $this->getExtend();
                break;
            case 3:
                return $this->getTitle();
                break;
            case 4:
                return $this->getData();
                break;
            case 5:
                return $this->getLess();
                break;
            case 6:
                return $this->getAssets();
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
        if (isset($alreadyDumpedObjects['Theme'][$this->getPrimaryKey()])) {
            return '*RECURSION*';
        }
        $alreadyDumpedObjects['Theme'][$this->getPrimaryKey()] = true;
        $keys = ThemePeer::getFieldNames($keyType);
        $result = array(
            $keys[0] => $this->getId(),
            $keys[1] => $this->getCreatedAt(),
            $keys[2] => $this->getExtend(),
            $keys[3] => $this->getTitle(),
            $keys[4] => $this->getData(),
            $keys[5] => $this->getLess(),
            $keys[6] => $this->getAssets(),
        );
        if ($includeForeignObjects) {
            if (null !== $this->collOrganizationThemes) {
                $result['OrganizationThemes'] = $this->collOrganizationThemes->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collUserThemes) {
                $result['UserThemes'] = $this->collUserThemes->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
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
        $pos = ThemePeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);

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
                $this->setCreatedAt($value);
                break;
            case 2:
                $this->setExtend($value);
                break;
            case 3:
                $this->setTitle($value);
                break;
            case 4:
                $this->setData($value);
                break;
            case 5:
                $this->setLess($value);
                break;
            case 6:
                $this->setAssets($value);
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
        $keys = ThemePeer::getFieldNames($keyType);

        if (array_key_exists($keys[0], $arr)) $this->setId($arr[$keys[0]]);
        if (array_key_exists($keys[1], $arr)) $this->setCreatedAt($arr[$keys[1]]);
        if (array_key_exists($keys[2], $arr)) $this->setExtend($arr[$keys[2]]);
        if (array_key_exists($keys[3], $arr)) $this->setTitle($arr[$keys[3]]);
        if (array_key_exists($keys[4], $arr)) $this->setData($arr[$keys[4]]);
        if (array_key_exists($keys[5], $arr)) $this->setLess($arr[$keys[5]]);
        if (array_key_exists($keys[6], $arr)) $this->setAssets($arr[$keys[6]]);
    }

    /**
     * Build a Criteria object containing the values of all modified columns in this object.
     *
     * @return Criteria The Criteria object containing all modified values.
     */
    public function buildCriteria()
    {
        $criteria = new Criteria(ThemePeer::DATABASE_NAME);

        if ($this->isColumnModified(ThemePeer::ID)) $criteria->add(ThemePeer::ID, $this->id);
        if ($this->isColumnModified(ThemePeer::CREATED_AT)) $criteria->add(ThemePeer::CREATED_AT, $this->created_at);
        if ($this->isColumnModified(ThemePeer::EXTEND)) $criteria->add(ThemePeer::EXTEND, $this->extend);
        if ($this->isColumnModified(ThemePeer::TITLE)) $criteria->add(ThemePeer::TITLE, $this->title);
        if ($this->isColumnModified(ThemePeer::DATA)) $criteria->add(ThemePeer::DATA, $this->data);
        if ($this->isColumnModified(ThemePeer::LESS)) $criteria->add(ThemePeer::LESS, $this->less);
        if ($this->isColumnModified(ThemePeer::ASSETS)) $criteria->add(ThemePeer::ASSETS, $this->assets);

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
        $criteria = new Criteria(ThemePeer::DATABASE_NAME);
        $criteria->add(ThemePeer::ID, $this->id);

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
     * @param object $copyObj An object of Theme (or compatible) type.
     * @param boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
     * @param boolean $makeNew Whether to reset autoincrement PKs and make the object new.
     * @throws PropelException
     */
    public function copyInto($copyObj, $deepCopy = false, $makeNew = true)
    {
        $copyObj->setCreatedAt($this->getCreatedAt());
        $copyObj->setExtend($this->getExtend());
        $copyObj->setTitle($this->getTitle());
        $copyObj->setData($this->getData());
        $copyObj->setLess($this->getLess());
        $copyObj->setAssets($this->getAssets());

        if ($deepCopy && !$this->startCopy) {
            // important: temporarily setNew(false) because this affects the behavior of
            // the getter/setter methods for fkey referrer objects.
            $copyObj->setNew(false);
            // store object hash to prevent cycle
            $this->startCopy = true;

            foreach ($this->getOrganizationThemes() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addOrganizationTheme($relObj->copy($deepCopy));
                }
            }

            foreach ($this->getUserThemes() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addUserTheme($relObj->copy($deepCopy));
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
     * @return Theme Clone of current object.
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
     * @return ThemePeer
     */
    public function getPeer()
    {
        if (self::$peer === null) {
            self::$peer = new ThemePeer();
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
        if ('OrganizationTheme' == $relationName) {
            $this->initOrganizationThemes();
        }
        if ('UserTheme' == $relationName) {
            $this->initUserThemes();
        }
    }

    /**
     * Clears out the collOrganizationThemes collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Theme The current object (for fluent API support)
     * @see        addOrganizationThemes()
     */
    public function clearOrganizationThemes()
    {
        $this->collOrganizationThemes = null; // important to set this to null since that means it is uninitialized
        $this->collOrganizationThemesPartial = null;

        return $this;
    }

    /**
     * reset is the collOrganizationThemes collection loaded partially
     *
     * @return void
     */
    public function resetPartialOrganizationThemes($v = true)
    {
        $this->collOrganizationThemesPartial = $v;
    }

    /**
     * Initializes the collOrganizationThemes collection.
     *
     * By default this just sets the collOrganizationThemes collection to an empty array (like clearcollOrganizationThemes());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initOrganizationThemes($overrideExisting = true)
    {
        if (null !== $this->collOrganizationThemes && !$overrideExisting) {
            return;
        }
        $this->collOrganizationThemes = new PropelObjectCollection();
        $this->collOrganizationThemes->setModel('OrganizationTheme');
    }

    /**
     * Gets an array of OrganizationTheme objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Theme is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|OrganizationTheme[] List of OrganizationTheme objects
     * @throws PropelException
     */
    public function getOrganizationThemes($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collOrganizationThemesPartial && !$this->isNew();
        if (null === $this->collOrganizationThemes || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collOrganizationThemes) {
                // return empty collection
                $this->initOrganizationThemes();
            } else {
                $collOrganizationThemes = OrganizationThemeQuery::create(null, $criteria)
                    ->filterByTheme($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collOrganizationThemesPartial && count($collOrganizationThemes)) {
                      $this->initOrganizationThemes(false);

                      foreach($collOrganizationThemes as $obj) {
                        if (false == $this->collOrganizationThemes->contains($obj)) {
                          $this->collOrganizationThemes->append($obj);
                        }
                      }

                      $this->collOrganizationThemesPartial = true;
                    }

                    $collOrganizationThemes->getInternalIterator()->rewind();
                    return $collOrganizationThemes;
                }

                if($partial && $this->collOrganizationThemes) {
                    foreach($this->collOrganizationThemes as $obj) {
                        if($obj->isNew()) {
                            $collOrganizationThemes[] = $obj;
                        }
                    }
                }

                $this->collOrganizationThemes = $collOrganizationThemes;
                $this->collOrganizationThemesPartial = false;
            }
        }

        return $this->collOrganizationThemes;
    }

    /**
     * Sets a collection of OrganizationTheme objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $organizationThemes A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Theme The current object (for fluent API support)
     */
    public function setOrganizationThemes(PropelCollection $organizationThemes, PropelPDO $con = null)
    {
        $organizationThemesToDelete = $this->getOrganizationThemes(new Criteria(), $con)->diff($organizationThemes);

        $this->organizationThemesScheduledForDeletion = unserialize(serialize($organizationThemesToDelete));

        foreach ($organizationThemesToDelete as $organizationThemeRemoved) {
            $organizationThemeRemoved->setTheme(null);
        }

        $this->collOrganizationThemes = null;
        foreach ($organizationThemes as $organizationTheme) {
            $this->addOrganizationTheme($organizationTheme);
        }

        $this->collOrganizationThemes = $organizationThemes;
        $this->collOrganizationThemesPartial = false;

        return $this;
    }

    /**
     * Returns the number of related OrganizationTheme objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related OrganizationTheme objects.
     * @throws PropelException
     */
    public function countOrganizationThemes(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collOrganizationThemesPartial && !$this->isNew();
        if (null === $this->collOrganizationThemes || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collOrganizationThemes) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getOrganizationThemes());
            }
            $query = OrganizationThemeQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByTheme($this)
                ->count($con);
        }

        return count($this->collOrganizationThemes);
    }

    /**
     * Method called to associate a OrganizationTheme object to this object
     * through the OrganizationTheme foreign key attribute.
     *
     * @param    OrganizationTheme $l OrganizationTheme
     * @return Theme The current object (for fluent API support)
     */
    public function addOrganizationTheme(OrganizationTheme $l)
    {
        if ($this->collOrganizationThemes === null) {
            $this->initOrganizationThemes();
            $this->collOrganizationThemesPartial = true;
        }
        if (!in_array($l, $this->collOrganizationThemes->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddOrganizationTheme($l);
        }

        return $this;
    }

    /**
     * @param	OrganizationTheme $organizationTheme The organizationTheme object to add.
     */
    protected function doAddOrganizationTheme($organizationTheme)
    {
        $this->collOrganizationThemes[]= $organizationTheme;
        $organizationTheme->setTheme($this);
    }

    /**
     * @param	OrganizationTheme $organizationTheme The organizationTheme object to remove.
     * @return Theme The current object (for fluent API support)
     */
    public function removeOrganizationTheme($organizationTheme)
    {
        if ($this->getOrganizationThemes()->contains($organizationTheme)) {
            $this->collOrganizationThemes->remove($this->collOrganizationThemes->search($organizationTheme));
            if (null === $this->organizationThemesScheduledForDeletion) {
                $this->organizationThemesScheduledForDeletion = clone $this->collOrganizationThemes;
                $this->organizationThemesScheduledForDeletion->clear();
            }
            $this->organizationThemesScheduledForDeletion[]= clone $organizationTheme;
            $organizationTheme->setTheme(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Theme is new, it will return
     * an empty collection; or if this Theme has previously
     * been saved, it will retrieve related OrganizationThemes from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Theme.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|OrganizationTheme[] List of OrganizationTheme objects
     */
    public function getOrganizationThemesJoinOrganization($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = OrganizationThemeQuery::create(null, $criteria);
        $query->joinWith('Organization', $join_behavior);

        return $this->getOrganizationThemes($query, $con);
    }

    /**
     * Clears out the collUserThemes collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Theme The current object (for fluent API support)
     * @see        addUserThemes()
     */
    public function clearUserThemes()
    {
        $this->collUserThemes = null; // important to set this to null since that means it is uninitialized
        $this->collUserThemesPartial = null;

        return $this;
    }

    /**
     * reset is the collUserThemes collection loaded partially
     *
     * @return void
     */
    public function resetPartialUserThemes($v = true)
    {
        $this->collUserThemesPartial = $v;
    }

    /**
     * Initializes the collUserThemes collection.
     *
     * By default this just sets the collUserThemes collection to an empty array (like clearcollUserThemes());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initUserThemes($overrideExisting = true)
    {
        if (null !== $this->collUserThemes && !$overrideExisting) {
            return;
        }
        $this->collUserThemes = new PropelObjectCollection();
        $this->collUserThemes->setModel('UserTheme');
    }

    /**
     * Gets an array of UserTheme objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Theme is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|UserTheme[] List of UserTheme objects
     * @throws PropelException
     */
    public function getUserThemes($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collUserThemesPartial && !$this->isNew();
        if (null === $this->collUserThemes || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collUserThemes) {
                // return empty collection
                $this->initUserThemes();
            } else {
                $collUserThemes = UserThemeQuery::create(null, $criteria)
                    ->filterByTheme($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collUserThemesPartial && count($collUserThemes)) {
                      $this->initUserThemes(false);

                      foreach($collUserThemes as $obj) {
                        if (false == $this->collUserThemes->contains($obj)) {
                          $this->collUserThemes->append($obj);
                        }
                      }

                      $this->collUserThemesPartial = true;
                    }

                    $collUserThemes->getInternalIterator()->rewind();
                    return $collUserThemes;
                }

                if($partial && $this->collUserThemes) {
                    foreach($this->collUserThemes as $obj) {
                        if($obj->isNew()) {
                            $collUserThemes[] = $obj;
                        }
                    }
                }

                $this->collUserThemes = $collUserThemes;
                $this->collUserThemesPartial = false;
            }
        }

        return $this->collUserThemes;
    }

    /**
     * Sets a collection of UserTheme objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $userThemes A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Theme The current object (for fluent API support)
     */
    public function setUserThemes(PropelCollection $userThemes, PropelPDO $con = null)
    {
        $userThemesToDelete = $this->getUserThemes(new Criteria(), $con)->diff($userThemes);

        $this->userThemesScheduledForDeletion = unserialize(serialize($userThemesToDelete));

        foreach ($userThemesToDelete as $userThemeRemoved) {
            $userThemeRemoved->setTheme(null);
        }

        $this->collUserThemes = null;
        foreach ($userThemes as $userTheme) {
            $this->addUserTheme($userTheme);
        }

        $this->collUserThemes = $userThemes;
        $this->collUserThemesPartial = false;

        return $this;
    }

    /**
     * Returns the number of related UserTheme objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related UserTheme objects.
     * @throws PropelException
     */
    public function countUserThemes(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collUserThemesPartial && !$this->isNew();
        if (null === $this->collUserThemes || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collUserThemes) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getUserThemes());
            }
            $query = UserThemeQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByTheme($this)
                ->count($con);
        }

        return count($this->collUserThemes);
    }

    /**
     * Method called to associate a UserTheme object to this object
     * through the UserTheme foreign key attribute.
     *
     * @param    UserTheme $l UserTheme
     * @return Theme The current object (for fluent API support)
     */
    public function addUserTheme(UserTheme $l)
    {
        if ($this->collUserThemes === null) {
            $this->initUserThemes();
            $this->collUserThemesPartial = true;
        }
        if (!in_array($l, $this->collUserThemes->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddUserTheme($l);
        }

        return $this;
    }

    /**
     * @param	UserTheme $userTheme The userTheme object to add.
     */
    protected function doAddUserTheme($userTheme)
    {
        $this->collUserThemes[]= $userTheme;
        $userTheme->setTheme($this);
    }

    /**
     * @param	UserTheme $userTheme The userTheme object to remove.
     * @return Theme The current object (for fluent API support)
     */
    public function removeUserTheme($userTheme)
    {
        if ($this->getUserThemes()->contains($userTheme)) {
            $this->collUserThemes->remove($this->collUserThemes->search($userTheme));
            if (null === $this->userThemesScheduledForDeletion) {
                $this->userThemesScheduledForDeletion = clone $this->collUserThemes;
                $this->userThemesScheduledForDeletion->clear();
            }
            $this->userThemesScheduledForDeletion[]= clone $userTheme;
            $userTheme->setTheme(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this Theme is new, it will return
     * an empty collection; or if this Theme has previously
     * been saved, it will retrieve related UserThemes from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in Theme.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|UserTheme[] List of UserTheme objects
     */
    public function getUserThemesJoinUser($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = UserThemeQuery::create(null, $criteria);
        $query->joinWith('User', $join_behavior);

        return $this->getUserThemes($query, $con);
    }

    /**
     * Clears out the collOrganizations collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Theme The current object (for fluent API support)
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
     * to the current object by way of the organization_theme cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Theme is new, it will return
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
                    ->filterByTheme($this)
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
     * to the current object by way of the organization_theme cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $organizations A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Theme The current object (for fluent API support)
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
     * to the current object by way of the organization_theme cross-reference table.
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
                    ->filterByTheme($this)
                    ->count($con);
            }
        } else {
            return count($this->collOrganizations);
        }
    }

    /**
     * Associate a Organization object to this object
     * through the organization_theme cross reference table.
     *
     * @param  Organization $organization The OrganizationTheme object to relate
     * @return Theme The current object (for fluent API support)
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
        $organizationTheme = new OrganizationTheme();
        $organizationTheme->setOrganization($organization);
        $this->addOrganizationTheme($organizationTheme);
    }

    /**
     * Remove a Organization object to this object
     * through the organization_theme cross reference table.
     *
     * @param Organization $organization The OrganizationTheme object to relate
     * @return Theme The current object (for fluent API support)
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
     * Clears out the collUsers collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return Theme The current object (for fluent API support)
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
     * to the current object by way of the user_theme cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this Theme is new, it will return
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
                    ->filterByTheme($this)
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
     * to the current object by way of the user_theme cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $users A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return Theme The current object (for fluent API support)
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
     * to the current object by way of the user_theme cross-reference table.
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
                    ->filterByTheme($this)
                    ->count($con);
            }
        } else {
            return count($this->collUsers);
        }
    }

    /**
     * Associate a User object to this object
     * through the user_theme cross reference table.
     *
     * @param  User $user The UserTheme object to relate
     * @return Theme The current object (for fluent API support)
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
        $userTheme = new UserTheme();
        $userTheme->setUser($user);
        $this->addUserTheme($userTheme);
    }

    /**
     * Remove a User object to this object
     * through the user_theme cross reference table.
     *
     * @param User $user The UserTheme object to relate
     * @return Theme The current object (for fluent API support)
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
     * Clears the current object and sets all attributes to their default values
     */
    public function clear()
    {
        $this->id = null;
        $this->created_at = null;
        $this->extend = null;
        $this->title = null;
        $this->data = null;
        $this->less = null;
        $this->assets = null;
        $this->alreadyInSave = false;
        $this->alreadyInValidation = false;
        $this->alreadyInClearAllReferencesDeep = false;
        $this->clearAllReferences();
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
            if ($this->collOrganizationThemes) {
                foreach ($this->collOrganizationThemes as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collUserThemes) {
                foreach ($this->collUserThemes as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collOrganizations) {
                foreach ($this->collOrganizations as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collUsers) {
                foreach ($this->collUsers as $o) {
                    $o->clearAllReferences($deep);
                }
            }

            $this->alreadyInClearAllReferencesDeep = false;
        } // if ($deep)

        if ($this->collOrganizationThemes instanceof PropelCollection) {
            $this->collOrganizationThemes->clearIterator();
        }
        $this->collOrganizationThemes = null;
        if ($this->collUserThemes instanceof PropelCollection) {
            $this->collUserThemes->clearIterator();
        }
        $this->collUserThemes = null;
        if ($this->collOrganizations instanceof PropelCollection) {
            $this->collOrganizations->clearIterator();
        }
        $this->collOrganizations = null;
        if ($this->collUsers instanceof PropelCollection) {
            $this->collUsers->clearIterator();
        }
        $this->collUsers = null;
    }

    /**
     * return the string representation of this object
     *
     * @return string
     */
    public function __toString()
    {
        return (string) $this->exportTo(ThemePeer::DEFAULT_STRING_FORMAT);
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
