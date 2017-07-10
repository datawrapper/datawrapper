<?php


/**
 * Base class that represents a row from the 'chart_folders' table.
 *
 *
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseChartFolders extends BaseObject implements Persistent
{
    /**
     * Peer class name
     */
    const PEER = 'ChartFoldersPeer';

    /**
     * The Peer class.
     * Instance provides a convenient way of calling static methods on a class
     * that calling code may not be able to identify.
     * @var        ChartFoldersPeer
     */
    protected static $peer;

    /**
     * The flag var to prevent infinit loop in deep copy
     * @var       boolean
     */
    protected $startCopy = false;

    /**
     * The value for the map_id field.
     * @var        int
     */
    protected $map_id;

    /**
     * The value for the chart_id field.
     * @var        string
     */
    protected $chart_id;

    /**
     * The value for the user_folder field.
     * @var        int
     */
    protected $user_folder;

    /**
     * The value for the org_folder field.
     * @var        int
     */
    protected $org_folder;

    /**
     * @var        Chart
     */
    protected $aChart;

    /**
     * @var        UserFolders
     */
    protected $aUserFolders;

    /**
     * @var        OrganizationFolders
     */
    protected $aOrganizationFolders;

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
     * Get the [map_id] column value.
     *
     * @return int
     */
    public function getMapId()
    {
        return $this->map_id;
    }

    /**
     * Get the [chart_id] column value.
     *
     * @return string
     */
    public function getChartId()
    {
        return $this->chart_id;
    }

    /**
     * Get the [user_folder] column value.
     *
     * @return int
     */
    public function getUserFolder()
    {
        return $this->user_folder;
    }

    /**
     * Get the [org_folder] column value.
     *
     * @return int
     */
    public function getOrgFolder()
    {
        return $this->org_folder;
    }

    /**
     * Set the value of [map_id] column.
     *
     * @param int $v new value
     * @return ChartFolders The current object (for fluent API support)
     */
    public function setMapId($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (int) $v;
        }

        if ($this->map_id !== $v) {
            $this->map_id = $v;
            $this->modifiedColumns[] = ChartFoldersPeer::MAP_ID;
        }


        return $this;
    } // setMapId()

    /**
     * Set the value of [chart_id] column.
     *
     * @param string $v new value
     * @return ChartFolders The current object (for fluent API support)
     */
    public function setChartId($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->chart_id !== $v) {
            $this->chart_id = $v;
            $this->modifiedColumns[] = ChartFoldersPeer::CHART_ID;
        }

        if ($this->aChart !== null && $this->aChart->getId() !== $v) {
            $this->aChart = null;
        }


        return $this;
    } // setChartId()

    /**
     * Set the value of [user_folder] column.
     *
     * @param int $v new value
     * @return ChartFolders The current object (for fluent API support)
     */
    public function setUserFolder($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (int) $v;
        }

        if ($this->user_folder !== $v) {
            $this->user_folder = $v;
            $this->modifiedColumns[] = ChartFoldersPeer::USER_FOLDER;
        }

        if ($this->aUserFolders !== null && $this->aUserFolders->getUfId() !== $v) {
            $this->aUserFolders = null;
        }


        return $this;
    } // setUserFolder()

    /**
     * Set the value of [org_folder] column.
     *
     * @param int $v new value
     * @return ChartFolders The current object (for fluent API support)
     */
    public function setOrgFolder($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (int) $v;
        }

        if ($this->org_folder !== $v) {
            $this->org_folder = $v;
            $this->modifiedColumns[] = ChartFoldersPeer::ORG_FOLDER;
        }

        if ($this->aOrganizationFolders !== null && $this->aOrganizationFolders->getOfId() !== $v) {
            $this->aOrganizationFolders = null;
        }


        return $this;
    } // setOrgFolder()

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

            $this->map_id = ($row[$startcol + 0] !== null) ? (int) $row[$startcol + 0] : null;
            $this->chart_id = ($row[$startcol + 1] !== null) ? (string) $row[$startcol + 1] : null;
            $this->user_folder = ($row[$startcol + 2] !== null) ? (int) $row[$startcol + 2] : null;
            $this->org_folder = ($row[$startcol + 3] !== null) ? (int) $row[$startcol + 3] : null;
            $this->resetModified();

            $this->setNew(false);

            if ($rehydrate) {
                $this->ensureConsistency();
            }
            $this->postHydrate($row, $startcol, $rehydrate);
            return $startcol + 4; // 4 = ChartFoldersPeer::NUM_HYDRATE_COLUMNS.

        } catch (Exception $e) {
            throw new PropelException("Error populating ChartFolders object", $e);
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

        if ($this->aChart !== null && $this->chart_id !== $this->aChart->getId()) {
            $this->aChart = null;
        }
        if ($this->aUserFolders !== null && $this->user_folder !== $this->aUserFolders->getUfId()) {
            $this->aUserFolders = null;
        }
        if ($this->aOrganizationFolders !== null && $this->org_folder !== $this->aOrganizationFolders->getOfId()) {
            $this->aOrganizationFolders = null;
        }
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
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        // We don't need to alter the object instance pool; we're just modifying this instance
        // already in the pool.

        $stmt = ChartFoldersPeer::doSelectStmt($this->buildPkeyCriteria(), $con);
        $row = $stmt->fetch(PDO::FETCH_NUM);
        $stmt->closeCursor();
        if (!$row) {
            throw new PropelException('Cannot find matching row in the database to reload object values.');
        }
        $this->hydrate($row, 0, true); // rehydrate

        if ($deep) {  // also de-associate any related objects?

            $this->aChart = null;
            $this->aUserFolders = null;
            $this->aOrganizationFolders = null;
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
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $con->beginTransaction();
        try {
            $deleteQuery = ChartFoldersQuery::create()
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
            $con = Propel::getConnection(ChartFoldersPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
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
                ChartFoldersPeer::addInstanceToPool($this);
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

            // We call the save method on the following object(s) if they
            // were passed to this object by their coresponding set
            // method.  This object relates to these object(s) by a
            // foreign key reference.

            if ($this->aChart !== null) {
                if ($this->aChart->isModified() || $this->aChart->isNew()) {
                    $affectedRows += $this->aChart->save($con);
                }
                $this->setChart($this->aChart);
            }

            if ($this->aUserFolders !== null) {
                if ($this->aUserFolders->isModified() || $this->aUserFolders->isNew()) {
                    $affectedRows += $this->aUserFolders->save($con);
                }
                $this->setUserFolders($this->aUserFolders);
            }

            if ($this->aOrganizationFolders !== null) {
                if ($this->aOrganizationFolders->isModified() || $this->aOrganizationFolders->isNew()) {
                    $affectedRows += $this->aOrganizationFolders->save($con);
                }
                $this->setOrganizationFolders($this->aOrganizationFolders);
            }

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

        $this->modifiedColumns[] = ChartFoldersPeer::MAP_ID;
        if (null !== $this->map_id) {
            throw new PropelException('Cannot insert a value for auto-increment primary key (' . ChartFoldersPeer::MAP_ID . ')');
        }

         // check the columns in natural order for more readable SQL queries
        if ($this->isColumnModified(ChartFoldersPeer::MAP_ID)) {
            $modifiedColumns[':p' . $index++]  = '`map_id`';
        }
        if ($this->isColumnModified(ChartFoldersPeer::CHART_ID)) {
            $modifiedColumns[':p' . $index++]  = '`chart_id`';
        }
        if ($this->isColumnModified(ChartFoldersPeer::USER_FOLDER)) {
            $modifiedColumns[':p' . $index++]  = '`user_folder`';
        }
        if ($this->isColumnModified(ChartFoldersPeer::ORG_FOLDER)) {
            $modifiedColumns[':p' . $index++]  = '`org_folder`';
        }

        $sql = sprintf(
            'INSERT INTO `chart_folders` (%s) VALUES (%s)',
            implode(', ', $modifiedColumns),
            implode(', ', array_keys($modifiedColumns))
        );

        try {
            $stmt = $con->prepare($sql);
            foreach ($modifiedColumns as $identifier => $columnName) {
                switch ($columnName) {
                    case '`map_id`':
                        $stmt->bindValue($identifier, $this->map_id, PDO::PARAM_INT);
                        break;
                    case '`chart_id`':
                        $stmt->bindValue($identifier, $this->chart_id, PDO::PARAM_STR);
                        break;
                    case '`user_folder`':
                        $stmt->bindValue($identifier, $this->user_folder, PDO::PARAM_INT);
                        break;
                    case '`org_folder`':
                        $stmt->bindValue($identifier, $this->org_folder, PDO::PARAM_INT);
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
        $this->setMapId($pk);

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


            // We call the validate method on the following object(s) if they
            // were passed to this object by their coresponding set
            // method.  This object relates to these object(s) by a
            // foreign key reference.

            if ($this->aChart !== null) {
                if (!$this->aChart->validate($columns)) {
                    $failureMap = array_merge($failureMap, $this->aChart->getValidationFailures());
                }
            }

            if ($this->aUserFolders !== null) {
                if (!$this->aUserFolders->validate($columns)) {
                    $failureMap = array_merge($failureMap, $this->aUserFolders->getValidationFailures());
                }
            }

            if ($this->aOrganizationFolders !== null) {
                if (!$this->aOrganizationFolders->validate($columns)) {
                    $failureMap = array_merge($failureMap, $this->aOrganizationFolders->getValidationFailures());
                }
            }


            if (($retval = ChartFoldersPeer::doValidate($this, $columns)) !== true) {
                $failureMap = array_merge($failureMap, $retval);
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
        $pos = ChartFoldersPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
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
                return $this->getMapId();
                break;
            case 1:
                return $this->getChartId();
                break;
            case 2:
                return $this->getUserFolder();
                break;
            case 3:
                return $this->getOrgFolder();
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
        if (isset($alreadyDumpedObjects['ChartFolders'][$this->getPrimaryKey()])) {
            return '*RECURSION*';
        }
        $alreadyDumpedObjects['ChartFolders'][$this->getPrimaryKey()] = true;
        $keys = ChartFoldersPeer::getFieldNames($keyType);
        $result = array(
            $keys[0] => $this->getMapId(),
            $keys[1] => $this->getChartId(),
            $keys[2] => $this->getUserFolder(),
            $keys[3] => $this->getOrgFolder(),
        );
        if ($includeForeignObjects) {
            if (null !== $this->aChart) {
                $result['Chart'] = $this->aChart->toArray($keyType, $includeLazyLoadColumns,  $alreadyDumpedObjects, true);
            }
            if (null !== $this->aUserFolders) {
                $result['UserFolders'] = $this->aUserFolders->toArray($keyType, $includeLazyLoadColumns,  $alreadyDumpedObjects, true);
            }
            if (null !== $this->aOrganizationFolders) {
                $result['OrganizationFolders'] = $this->aOrganizationFolders->toArray($keyType, $includeLazyLoadColumns,  $alreadyDumpedObjects, true);
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
        $pos = ChartFoldersPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);

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
                $this->setMapId($value);
                break;
            case 1:
                $this->setChartId($value);
                break;
            case 2:
                $this->setUserFolder($value);
                break;
            case 3:
                $this->setOrgFolder($value);
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
        $keys = ChartFoldersPeer::getFieldNames($keyType);

        if (array_key_exists($keys[0], $arr)) $this->setMapId($arr[$keys[0]]);
        if (array_key_exists($keys[1], $arr)) $this->setChartId($arr[$keys[1]]);
        if (array_key_exists($keys[2], $arr)) $this->setUserFolder($arr[$keys[2]]);
        if (array_key_exists($keys[3], $arr)) $this->setOrgFolder($arr[$keys[3]]);
    }

    /**
     * Build a Criteria object containing the values of all modified columns in this object.
     *
     * @return Criteria The Criteria object containing all modified values.
     */
    public function buildCriteria()
    {
        $criteria = new Criteria(ChartFoldersPeer::DATABASE_NAME);

        if ($this->isColumnModified(ChartFoldersPeer::MAP_ID)) $criteria->add(ChartFoldersPeer::MAP_ID, $this->map_id);
        if ($this->isColumnModified(ChartFoldersPeer::CHART_ID)) $criteria->add(ChartFoldersPeer::CHART_ID, $this->chart_id);
        if ($this->isColumnModified(ChartFoldersPeer::USER_FOLDER)) $criteria->add(ChartFoldersPeer::USER_FOLDER, $this->user_folder);
        if ($this->isColumnModified(ChartFoldersPeer::ORG_FOLDER)) $criteria->add(ChartFoldersPeer::ORG_FOLDER, $this->org_folder);

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
        $criteria = new Criteria(ChartFoldersPeer::DATABASE_NAME);
        $criteria->add(ChartFoldersPeer::MAP_ID, $this->map_id);

        return $criteria;
    }

    /**
     * Returns the primary key for this object (row).
     * @return int
     */
    public function getPrimaryKey()
    {
        return $this->getMapId();
    }

    /**
     * Generic method to set the primary key (map_id column).
     *
     * @param  int $key Primary key.
     * @return void
     */
    public function setPrimaryKey($key)
    {
        $this->setMapId($key);
    }

    /**
     * Returns true if the primary key for this object is null.
     * @return boolean
     */
    public function isPrimaryKeyNull()
    {

        return null === $this->getMapId();
    }

    /**
     * Sets contents of passed object to values from current object.
     *
     * If desired, this method can also make copies of all associated (fkey referrers)
     * objects.
     *
     * @param object $copyObj An object of ChartFolders (or compatible) type.
     * @param boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
     * @param boolean $makeNew Whether to reset autoincrement PKs and make the object new.
     * @throws PropelException
     */
    public function copyInto($copyObj, $deepCopy = false, $makeNew = true)
    {
        $copyObj->setChartId($this->getChartId());
        $copyObj->setUserFolder($this->getUserFolder());
        $copyObj->setOrgFolder($this->getOrgFolder());

        if ($deepCopy && !$this->startCopy) {
            // important: temporarily setNew(false) because this affects the behavior of
            // the getter/setter methods for fkey referrer objects.
            $copyObj->setNew(false);
            // store object hash to prevent cycle
            $this->startCopy = true;

            //unflag object copy
            $this->startCopy = false;
        } // if ($deepCopy)

        if ($makeNew) {
            $copyObj->setNew(true);
            $copyObj->setMapId(NULL); // this is a auto-increment column, so set to default value
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
     * @return ChartFolders Clone of current object.
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
     * @return ChartFoldersPeer
     */
    public function getPeer()
    {
        if (self::$peer === null) {
            self::$peer = new ChartFoldersPeer();
        }

        return self::$peer;
    }

    /**
     * Declares an association between this object and a Chart object.
     *
     * @param             Chart $v
     * @return ChartFolders The current object (for fluent API support)
     * @throws PropelException
     */
    public function setChart(Chart $v = null)
    {
        if ($v === null) {
            $this->setChartId(NULL);
        } else {
            $this->setChartId($v->getId());
        }

        $this->aChart = $v;

        // Add binding for other direction of this n:n relationship.
        // If this object has already been added to the Chart object, it will not be re-added.
        if ($v !== null) {
            $v->addChartFolders($this);
        }


        return $this;
    }


    /**
     * Get the associated Chart object
     *
     * @param PropelPDO $con Optional Connection object.
     * @param $doQuery Executes a query to get the object if required
     * @return Chart The associated Chart object.
     * @throws PropelException
     */
    public function getChart(PropelPDO $con = null, $doQuery = true)
    {
        if ($this->aChart === null && (($this->chart_id !== "" && $this->chart_id !== null)) && $doQuery) {
            $this->aChart = ChartQuery::create()->findPk($this->chart_id, $con);
            /* The following can be used additionally to
                guarantee the related object contains a reference
                to this object.  This level of coupling may, however, be
                undesirable since it could result in an only partially populated collection
                in the referenced object.
                $this->aChart->addChartFolderss($this);
             */
        }

        return $this->aChart;
    }

    /**
     * Declares an association between this object and a UserFolders object.
     *
     * @param             UserFolders $v
     * @return ChartFolders The current object (for fluent API support)
     * @throws PropelException
     */
    public function setUserFolders(UserFolders $v = null)
    {
        if ($v === null) {
            $this->setUserFolder(NULL);
        } else {
            $this->setUserFolder($v->getUfId());
        }

        $this->aUserFolders = $v;

        // Add binding for other direction of this n:n relationship.
        // If this object has already been added to the UserFolders object, it will not be re-added.
        if ($v !== null) {
            $v->addChartFolders($this);
        }


        return $this;
    }


    /**
     * Get the associated UserFolders object
     *
     * @param PropelPDO $con Optional Connection object.
     * @param $doQuery Executes a query to get the object if required
     * @return UserFolders The associated UserFolders object.
     * @throws PropelException
     */
    public function getUserFolders(PropelPDO $con = null, $doQuery = true)
    {
        if ($this->aUserFolders === null && ($this->user_folder !== null) && $doQuery) {
            $this->aUserFolders = UserFoldersQuery::create()
                ->filterByChartFolders($this) // here
                ->findOne($con);
            /* The following can be used additionally to
                guarantee the related object contains a reference
                to this object.  This level of coupling may, however, be
                undesirable since it could result in an only partially populated collection
                in the referenced object.
                $this->aUserFolders->addChartFolderss($this);
             */
        }

        return $this->aUserFolders;
    }

    /**
     * Declares an association between this object and a OrganizationFolders object.
     *
     * @param             OrganizationFolders $v
     * @return ChartFolders The current object (for fluent API support)
     * @throws PropelException
     */
    public function setOrganizationFolders(OrganizationFolders $v = null)
    {
        if ($v === null) {
            $this->setOrgFolder(NULL);
        } else {
            $this->setOrgFolder($v->getOfId());
        }

        $this->aOrganizationFolders = $v;

        // Add binding for other direction of this n:n relationship.
        // If this object has already been added to the OrganizationFolders object, it will not be re-added.
        if ($v !== null) {
            $v->addChartFolders($this);
        }


        return $this;
    }


    /**
     * Get the associated OrganizationFolders object
     *
     * @param PropelPDO $con Optional Connection object.
     * @param $doQuery Executes a query to get the object if required
     * @return OrganizationFolders The associated OrganizationFolders object.
     * @throws PropelException
     */
    public function getOrganizationFolders(PropelPDO $con = null, $doQuery = true)
    {
        if ($this->aOrganizationFolders === null && ($this->org_folder !== null) && $doQuery) {
            $this->aOrganizationFolders = OrganizationFoldersQuery::create()
                ->filterByChartFolders($this) // here
                ->findOne($con);
            /* The following can be used additionally to
                guarantee the related object contains a reference
                to this object.  This level of coupling may, however, be
                undesirable since it could result in an only partially populated collection
                in the referenced object.
                $this->aOrganizationFolders->addChartFolderss($this);
             */
        }

        return $this->aOrganizationFolders;
    }

    /**
     * Clears the current object and sets all attributes to their default values
     */
    public function clear()
    {
        $this->map_id = null;
        $this->chart_id = null;
        $this->user_folder = null;
        $this->org_folder = null;
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
            if ($this->aChart instanceof Persistent) {
              $this->aChart->clearAllReferences($deep);
            }
            if ($this->aUserFolders instanceof Persistent) {
              $this->aUserFolders->clearAllReferences($deep);
            }
            if ($this->aOrganizationFolders instanceof Persistent) {
              $this->aOrganizationFolders->clearAllReferences($deep);
            }

            $this->alreadyInClearAllReferencesDeep = false;
        } // if ($deep)

        $this->aChart = null;
        $this->aUserFolders = null;
        $this->aOrganizationFolders = null;
    }

    /**
     * return the string representation of this object
     *
     * @return string
     */
    public function __toString()
    {
        return (string) $this->exportTo(ChartFoldersPeer::DEFAULT_STRING_FORMAT);
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
