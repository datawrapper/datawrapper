<?php


/**
 * Base class that represents a row from the 'user' table.
 *
 *
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseUser extends BaseObject implements Persistent
{
    /**
     * Peer class name
     */
    const PEER = 'UserPeer';

    /**
     * The Peer class.
     * Instance provides a convenient way of calling static methods on a class
     * that calling code may not be able to identify.
     * @var        UserPeer
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
     * The value for the email field.
     * @var        string
     */
    protected $email;

    /**
     * The value for the pwd field.
     * @var        string
     */
    protected $pwd;

    /**
     * The value for the activate_token field.
     * @var        string
     */
    protected $activate_token;

    /**
     * The value for the reset_password_token field.
     * @var        string
     */
    protected $reset_password_token;

    /**
     * The value for the role field.
     * Note: this column has a database default value of: 2
     * @var        int
     */
    protected $role;

    /**
     * The value for the deleted field.
     * Note: this column has a database default value of: false
     * @var        boolean
     */
    protected $deleted;

    /**
     * The value for the language field.
     * Note: this column has a database default value of: 'en'
     * @var        string
     */
    protected $language;

    /**
     * The value for the created_at field.
     * @var        string
     */
    protected $created_at;

    /**
     * The value for the name field.
     * @var        string
     */
    protected $name;

    /**
     * The value for the website field.
     * @var        string
     */
    protected $website;

    /**
     * The value for the sm_profile field.
     * @var        string
     */
    protected $sm_profile;

    /**
     * The value for the oauth_signin field.
     * @var        string
     */
    protected $oauth_signin;

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
     * @var        PropelObjectCollection|Action[] Collection to store aggregation of Action objects.
     */
    protected $collActions;
    protected $collActionsPartial;

    /**
     * @var        PropelObjectCollection|Job[] Collection to store aggregation of Job objects.
     */
    protected $collJobs;
    protected $collJobsPartial;

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
    protected $actionsScheduledForDeletion = null;

    /**
     * An array of objects scheduled for deletion.
     * @var		PropelObjectCollection
     */
    protected $jobsScheduledForDeletion = null;

    /**
     * Applies default values to this object.
     * This method should be called from the object's constructor (or
     * equivalent initialization method).
     * @see        __construct()
     */
    public function applyDefaultValues()
    {
        $this->role = 2;
        $this->deleted = false;
        $this->language = 'en';
    }

    /**
     * Initializes internal state of BaseUser object.
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
     * Get the [email] column value.
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Get the [pwd] column value.
     *
     * @return string
     */
    public function getPwd()
    {
        return $this->pwd;
    }

    /**
     * Get the [activate_token] column value.
     *
     * @return string
     */
    public function getActivateToken()
    {
        return $this->activate_token;
    }

    /**
     * Get the [reset_password_token] column value.
     *
     * @return string
     */
    public function getResetPasswordToken()
    {
        return $this->reset_password_token;
    }

    /**
     * Get the [role] column value.
     *
     * @return int
     * @throws PropelException - if the stored enum key is unknown.
     */
    public function getRole()
    {
        if (null === $this->role) {
            return null;
        }
        $valueSet = UserPeer::getValueSet(UserPeer::ROLE);
        if (!isset($valueSet[$this->role])) {
            throw new PropelException('Unknown stored enum key: ' . $this->role);
        }

        return $valueSet[$this->role];
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
     * Get the [language] column value.
     *
     * @return string
     */
    public function getLanguage()
    {
        return $this->language;
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
     * Get the [name] column value.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Get the [website] column value.
     *
     * @return string
     */
    public function getWebsite()
    {
        return $this->website;
    }

    /**
     * Get the [sm_profile] column value.
     *
     * @return string
     */
    public function getSmProfile()
    {
        return $this->sm_profile;
    }

    /**
     * Get the [oauth_signin] column value.
     *
     * @return string
     */
    public function getOAuthSignIn()
    {
        return $this->oauth_signin;
    }

    /**
     * Set the value of [id] column.
     *
     * @param int $v new value
     * @return User The current object (for fluent API support)
     */
    public function setId($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (int) $v;
        }

        if ($this->id !== $v) {
            $this->id = $v;
            $this->modifiedColumns[] = UserPeer::ID;
        }


        return $this;
    } // setId()

    /**
     * Set the value of [email] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setEmail($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->email !== $v) {
            $this->email = $v;
            $this->modifiedColumns[] = UserPeer::EMAIL;
        }


        return $this;
    } // setEmail()

    /**
     * Set the value of [pwd] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setPwd($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->pwd !== $v) {
            $this->pwd = $v;
            $this->modifiedColumns[] = UserPeer::PWD;
        }


        return $this;
    } // setPwd()

    /**
     * Set the value of [activate_token] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setActivateToken($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->activate_token !== $v) {
            $this->activate_token = $v;
            $this->modifiedColumns[] = UserPeer::ACTIVATE_TOKEN;
        }


        return $this;
    } // setActivateToken()

    /**
     * Set the value of [reset_password_token] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setResetPasswordToken($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->reset_password_token !== $v) {
            $this->reset_password_token = $v;
            $this->modifiedColumns[] = UserPeer::RESET_PASSWORD_TOKEN;
        }


        return $this;
    } // setResetPasswordToken()

    /**
     * Set the value of [role] column.
     *
     * @param int $v new value
     * @return User The current object (for fluent API support)
     * @throws PropelException - if the value is not accepted by this enum.
     */
    public function setRole($v)
    {
        if ($v !== null) {
            $valueSet = UserPeer::getValueSet(UserPeer::ROLE);
            if (!in_array($v, $valueSet)) {
                throw new PropelException(sprintf('Value "%s" is not accepted in this enumerated column', $v));
            }
            $v = array_search($v, $valueSet);
        }

        if ($this->role !== $v) {
            $this->role = $v;
            $this->modifiedColumns[] = UserPeer::ROLE;
        }


        return $this;
    } // setRole()

    /**
     * Sets the value of the [deleted] column.
     * Non-boolean arguments are converted using the following rules:
     *   * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
     *   * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
     * Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
     *
     * @param boolean|integer|string $v The new value
     * @return User The current object (for fluent API support)
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
            $this->modifiedColumns[] = UserPeer::DELETED;
        }


        return $this;
    } // setDeleted()

    /**
     * Set the value of [language] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setLanguage($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->language !== $v) {
            $this->language = $v;
            $this->modifiedColumns[] = UserPeer::LANGUAGE;
        }


        return $this;
    } // setLanguage()

    /**
     * Sets the value of [created_at] column to a normalized version of the date/time value specified.
     *
     * @param mixed $v string, integer (timestamp), or DateTime value.
     *               Empty strings are treated as null.
     * @return User The current object (for fluent API support)
     */
    public function setCreatedAt($v)
    {
        $dt = PropelDateTime::newInstance($v, null, 'DateTime');
        if ($this->created_at !== null || $dt !== null) {
            $currentDateAsString = ($this->created_at !== null && $tmpDt = new DateTime($this->created_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
            $newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
            if ($currentDateAsString !== $newDateAsString) {
                $this->created_at = $newDateAsString;
                $this->modifiedColumns[] = UserPeer::CREATED_AT;
            }
        } // if either are not null


        return $this;
    } // setCreatedAt()

    /**
     * Set the value of [name] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setName($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->name !== $v) {
            $this->name = $v;
            $this->modifiedColumns[] = UserPeer::NAME;
        }


        return $this;
    } // setName()

    /**
     * Set the value of [website] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setWebsite($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->website !== $v) {
            $this->website = $v;
            $this->modifiedColumns[] = UserPeer::WEBSITE;
        }


        return $this;
    } // setWebsite()

    /**
     * Set the value of [sm_profile] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setSmProfile($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->sm_profile !== $v) {
            $this->sm_profile = $v;
            $this->modifiedColumns[] = UserPeer::SM_PROFILE;
        }


        return $this;
    } // setSmProfile()

    /**
     * Set the value of [oauth_signin] column.
     *
     * @param string $v new value
     * @return User The current object (for fluent API support)
     */
    public function setOAuthSignIn($v)
    {
        if ($v !== null && is_numeric($v)) {
            $v = (string) $v;
        }

        if ($this->oauth_signin !== $v) {
            $this->oauth_signin = $v;
            $this->modifiedColumns[] = UserPeer::OAUTH_SIGNIN;
        }


        return $this;
    } // setOAuthSignIn()

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
            if ($this->role !== 2) {
                return false;
            }

            if ($this->deleted !== false) {
                return false;
            }

            if ($this->language !== 'en') {
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
            $this->email = ($row[$startcol + 1] !== null) ? (string) $row[$startcol + 1] : null;
            $this->pwd = ($row[$startcol + 2] !== null) ? (string) $row[$startcol + 2] : null;
            $this->activate_token = ($row[$startcol + 3] !== null) ? (string) $row[$startcol + 3] : null;
            $this->reset_password_token = ($row[$startcol + 4] !== null) ? (string) $row[$startcol + 4] : null;
            $this->role = ($row[$startcol + 5] !== null) ? (int) $row[$startcol + 5] : null;
            $this->deleted = ($row[$startcol + 6] !== null) ? (boolean) $row[$startcol + 6] : null;
            $this->language = ($row[$startcol + 7] !== null) ? (string) $row[$startcol + 7] : null;
            $this->created_at = ($row[$startcol + 8] !== null) ? (string) $row[$startcol + 8] : null;
            $this->name = ($row[$startcol + 9] !== null) ? (string) $row[$startcol + 9] : null;
            $this->website = ($row[$startcol + 10] !== null) ? (string) $row[$startcol + 10] : null;
            $this->sm_profile = ($row[$startcol + 11] !== null) ? (string) $row[$startcol + 11] : null;
            $this->oauth_signin = ($row[$startcol + 12] !== null) ? (string) $row[$startcol + 12] : null;
            $this->resetModified();

            $this->setNew(false);

            if ($rehydrate) {
                $this->ensureConsistency();
            }
            $this->postHydrate($row, $startcol, $rehydrate);
            return $startcol + 13; // 13 = UserPeer::NUM_HYDRATE_COLUMNS.

        } catch (Exception $e) {
            throw new PropelException("Error populating User object", $e);
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
            $con = Propel::getConnection(UserPeer::DATABASE_NAME, Propel::CONNECTION_READ);
        }

        // We don't need to alter the object instance pool; we're just modifying this instance
        // already in the pool.

        $stmt = UserPeer::doSelectStmt($this->buildPkeyCriteria(), $con);
        $row = $stmt->fetch(PDO::FETCH_NUM);
        $stmt->closeCursor();
        if (!$row) {
            throw new PropelException('Cannot find matching row in the database to reload object values.');
        }
        $this->hydrate($row, 0, true); // rehydrate

        if ($deep) {  // also de-associate any related objects?

            $this->collCharts = null;

            $this->collUserOrganizations = null;

            $this->collActions = null;

            $this->collJobs = null;

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
            $con = Propel::getConnection(UserPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
        }

        $con->beginTransaction();
        try {
            $deleteQuery = UserQuery::create()
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
            $con = Propel::getConnection(UserPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
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
                UserPeer::addInstanceToPool($this);
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
                    UserOrganizationQuery::create()
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

            if ($this->actionsScheduledForDeletion !== null) {
                if (!$this->actionsScheduledForDeletion->isEmpty()) {
                    ActionQuery::create()
                        ->filterByPrimaryKeys($this->actionsScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->actionsScheduledForDeletion = null;
                }
            }

            if ($this->collActions !== null) {
                foreach ($this->collActions as $referrerFK) {
                    if (!$referrerFK->isDeleted() && ($referrerFK->isNew() || $referrerFK->isModified())) {
                        $affectedRows += $referrerFK->save($con);
                    }
                }
            }

            if ($this->jobsScheduledForDeletion !== null) {
                if (!$this->jobsScheduledForDeletion->isEmpty()) {
                    JobQuery::create()
                        ->filterByPrimaryKeys($this->jobsScheduledForDeletion->getPrimaryKeys(false))
                        ->delete($con);
                    $this->jobsScheduledForDeletion = null;
                }
            }

            if ($this->collJobs !== null) {
                foreach ($this->collJobs as $referrerFK) {
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

        $this->modifiedColumns[] = UserPeer::ID;
        if (null !== $this->id) {
            throw new PropelException('Cannot insert a value for auto-increment primary key (' . UserPeer::ID . ')');
        }

         // check the columns in natural order for more readable SQL queries
        if ($this->isColumnModified(UserPeer::ID)) {
            $modifiedColumns[':p' . $index++]  = '`id`';
        }
        if ($this->isColumnModified(UserPeer::EMAIL)) {
            $modifiedColumns[':p' . $index++]  = '`email`';
        }
        if ($this->isColumnModified(UserPeer::PWD)) {
            $modifiedColumns[':p' . $index++]  = '`pwd`';
        }
        if ($this->isColumnModified(UserPeer::ACTIVATE_TOKEN)) {
            $modifiedColumns[':p' . $index++]  = '`activate_token`';
        }
        if ($this->isColumnModified(UserPeer::RESET_PASSWORD_TOKEN)) {
            $modifiedColumns[':p' . $index++]  = '`reset_password_token`';
        }
        if ($this->isColumnModified(UserPeer::ROLE)) {
            $modifiedColumns[':p' . $index++]  = '`role`';
        }
        if ($this->isColumnModified(UserPeer::DELETED)) {
            $modifiedColumns[':p' . $index++]  = '`deleted`';
        }
        if ($this->isColumnModified(UserPeer::LANGUAGE)) {
            $modifiedColumns[':p' . $index++]  = '`language`';
        }
        if ($this->isColumnModified(UserPeer::CREATED_AT)) {
            $modifiedColumns[':p' . $index++]  = '`created_at`';
        }
        if ($this->isColumnModified(UserPeer::NAME)) {
            $modifiedColumns[':p' . $index++]  = '`name`';
        }
        if ($this->isColumnModified(UserPeer::WEBSITE)) {
            $modifiedColumns[':p' . $index++]  = '`website`';
        }
        if ($this->isColumnModified(UserPeer::SM_PROFILE)) {
            $modifiedColumns[':p' . $index++]  = '`sm_profile`';
        }
        if ($this->isColumnModified(UserPeer::OAUTH_SIGNIN)) {
            $modifiedColumns[':p' . $index++]  = '`oauth_signin`';
        }

        $sql = sprintf(
            'INSERT INTO `user` (%s) VALUES (%s)',
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
                    case '`email`':
                        $stmt->bindValue($identifier, $this->email, PDO::PARAM_STR);
                        break;
                    case '`pwd`':
                        $stmt->bindValue($identifier, $this->pwd, PDO::PARAM_STR);
                        break;
                    case '`activate_token`':
                        $stmt->bindValue($identifier, $this->activate_token, PDO::PARAM_STR);
                        break;
                    case '`reset_password_token`':
                        $stmt->bindValue($identifier, $this->reset_password_token, PDO::PARAM_STR);
                        break;
                    case '`role`':
                        $stmt->bindValue($identifier, $this->role, PDO::PARAM_INT);
                        break;
                    case '`deleted`':
                        $stmt->bindValue($identifier, (int) $this->deleted, PDO::PARAM_INT);
                        break;
                    case '`language`':
                        $stmt->bindValue($identifier, $this->language, PDO::PARAM_STR);
                        break;
                    case '`created_at`':
                        $stmt->bindValue($identifier, $this->created_at, PDO::PARAM_STR);
                        break;
                    case '`name`':
                        $stmt->bindValue($identifier, $this->name, PDO::PARAM_STR);
                        break;
                    case '`website`':
                        $stmt->bindValue($identifier, $this->website, PDO::PARAM_STR);
                        break;
                    case '`sm_profile`':
                        $stmt->bindValue($identifier, $this->sm_profile, PDO::PARAM_STR);
                        break;
                    case '`oauth_signin`':
                        $stmt->bindValue($identifier, $this->oauth_signin, PDO::PARAM_STR);
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


            if (($retval = UserPeer::doValidate($this, $columns)) !== true) {
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

                if ($this->collActions !== null) {
                    foreach ($this->collActions as $referrerFK) {
                        if (!$referrerFK->validate($columns)) {
                            $failureMap = array_merge($failureMap, $referrerFK->getValidationFailures());
                        }
                    }
                }

                if ($this->collJobs !== null) {
                    foreach ($this->collJobs as $referrerFK) {
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
        $pos = UserPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
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
                return $this->getEmail();
                break;
            case 2:
                return $this->getPwd();
                break;
            case 3:
                return $this->getActivateToken();
                break;
            case 4:
                return $this->getResetPasswordToken();
                break;
            case 5:
                return $this->getRole();
                break;
            case 6:
                return $this->getDeleted();
                break;
            case 7:
                return $this->getLanguage();
                break;
            case 8:
                return $this->getCreatedAt();
                break;
            case 9:
                return $this->getName();
                break;
            case 10:
                return $this->getWebsite();
                break;
            case 11:
                return $this->getSmProfile();
                break;
            case 12:
                return $this->getOAuthSignIn();
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
        if (isset($alreadyDumpedObjects['User'][$this->getPrimaryKey()])) {
            return '*RECURSION*';
        }
        $alreadyDumpedObjects['User'][$this->getPrimaryKey()] = true;
        $keys = UserPeer::getFieldNames($keyType);
        $result = array(
            $keys[0] => $this->getId(),
            $keys[1] => $this->getEmail(),
            $keys[2] => $this->getPwd(),
            $keys[3] => $this->getActivateToken(),
            $keys[4] => $this->getResetPasswordToken(),
            $keys[5] => $this->getRole(),
            $keys[6] => $this->getDeleted(),
            $keys[7] => $this->getLanguage(),
            $keys[8] => $this->getCreatedAt(),
            $keys[9] => $this->getName(),
            $keys[10] => $this->getWebsite(),
            $keys[11] => $this->getSmProfile(),
            $keys[12] => $this->getOAuthSignIn(),
        );
        if ($includeForeignObjects) {
            if (null !== $this->collCharts) {
                $result['Charts'] = $this->collCharts->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collUserOrganizations) {
                $result['UserOrganizations'] = $this->collUserOrganizations->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collActions) {
                $result['Actions'] = $this->collActions->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
            }
            if (null !== $this->collJobs) {
                $result['Jobs'] = $this->collJobs->toArray(null, true, $keyType, $includeLazyLoadColumns, $alreadyDumpedObjects);
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
        $pos = UserPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);

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
                $this->setEmail($value);
                break;
            case 2:
                $this->setPwd($value);
                break;
            case 3:
                $this->setActivateToken($value);
                break;
            case 4:
                $this->setResetPasswordToken($value);
                break;
            case 5:
                $valueSet = UserPeer::getValueSet(UserPeer::ROLE);
                if (isset($valueSet[$value])) {
                    $value = $valueSet[$value];
                }
                $this->setRole($value);
                break;
            case 6:
                $this->setDeleted($value);
                break;
            case 7:
                $this->setLanguage($value);
                break;
            case 8:
                $this->setCreatedAt($value);
                break;
            case 9:
                $this->setName($value);
                break;
            case 10:
                $this->setWebsite($value);
                break;
            case 11:
                $this->setSmProfile($value);
                break;
            case 12:
                $this->setOAuthSignIn($value);
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
        $keys = UserPeer::getFieldNames($keyType);

        if (array_key_exists($keys[0], $arr)) $this->setId($arr[$keys[0]]);
        if (array_key_exists($keys[1], $arr)) $this->setEmail($arr[$keys[1]]);
        if (array_key_exists($keys[2], $arr)) $this->setPwd($arr[$keys[2]]);
        if (array_key_exists($keys[3], $arr)) $this->setActivateToken($arr[$keys[3]]);
        if (array_key_exists($keys[4], $arr)) $this->setResetPasswordToken($arr[$keys[4]]);
        if (array_key_exists($keys[5], $arr)) $this->setRole($arr[$keys[5]]);
        if (array_key_exists($keys[6], $arr)) $this->setDeleted($arr[$keys[6]]);
        if (array_key_exists($keys[7], $arr)) $this->setLanguage($arr[$keys[7]]);
        if (array_key_exists($keys[8], $arr)) $this->setCreatedAt($arr[$keys[8]]);
        if (array_key_exists($keys[9], $arr)) $this->setName($arr[$keys[9]]);
        if (array_key_exists($keys[10], $arr)) $this->setWebsite($arr[$keys[10]]);
        if (array_key_exists($keys[11], $arr)) $this->setSmProfile($arr[$keys[11]]);
        if (array_key_exists($keys[12], $arr)) $this->setOAuthSignIn($arr[$keys[12]]);
    }

    /**
     * Build a Criteria object containing the values of all modified columns in this object.
     *
     * @return Criteria The Criteria object containing all modified values.
     */
    public function buildCriteria()
    {
        $criteria = new Criteria(UserPeer::DATABASE_NAME);

        if ($this->isColumnModified(UserPeer::ID)) $criteria->add(UserPeer::ID, $this->id);
        if ($this->isColumnModified(UserPeer::EMAIL)) $criteria->add(UserPeer::EMAIL, $this->email);
        if ($this->isColumnModified(UserPeer::PWD)) $criteria->add(UserPeer::PWD, $this->pwd);
        if ($this->isColumnModified(UserPeer::ACTIVATE_TOKEN)) $criteria->add(UserPeer::ACTIVATE_TOKEN, $this->activate_token);
        if ($this->isColumnModified(UserPeer::RESET_PASSWORD_TOKEN)) $criteria->add(UserPeer::RESET_PASSWORD_TOKEN, $this->reset_password_token);
        if ($this->isColumnModified(UserPeer::ROLE)) $criteria->add(UserPeer::ROLE, $this->role);
        if ($this->isColumnModified(UserPeer::DELETED)) $criteria->add(UserPeer::DELETED, $this->deleted);
        if ($this->isColumnModified(UserPeer::LANGUAGE)) $criteria->add(UserPeer::LANGUAGE, $this->language);
        if ($this->isColumnModified(UserPeer::CREATED_AT)) $criteria->add(UserPeer::CREATED_AT, $this->created_at);
        if ($this->isColumnModified(UserPeer::NAME)) $criteria->add(UserPeer::NAME, $this->name);
        if ($this->isColumnModified(UserPeer::WEBSITE)) $criteria->add(UserPeer::WEBSITE, $this->website);
        if ($this->isColumnModified(UserPeer::SM_PROFILE)) $criteria->add(UserPeer::SM_PROFILE, $this->sm_profile);
        if ($this->isColumnModified(UserPeer::OAUTH_SIGNIN)) $criteria->add(UserPeer::OAUTH_SIGNIN, $this->oauth_signin);

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
        $criteria = new Criteria(UserPeer::DATABASE_NAME);
        $criteria->add(UserPeer::ID, $this->id);

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
     * @param object $copyObj An object of User (or compatible) type.
     * @param boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
     * @param boolean $makeNew Whether to reset autoincrement PKs and make the object new.
     * @throws PropelException
     */
    public function copyInto($copyObj, $deepCopy = false, $makeNew = true)
    {
        $copyObj->setEmail($this->getEmail());
        $copyObj->setPwd($this->getPwd());
        $copyObj->setActivateToken($this->getActivateToken());
        $copyObj->setResetPasswordToken($this->getResetPasswordToken());
        $copyObj->setRole($this->getRole());
        $copyObj->setDeleted($this->getDeleted());
        $copyObj->setLanguage($this->getLanguage());
        $copyObj->setCreatedAt($this->getCreatedAt());
        $copyObj->setName($this->getName());
        $copyObj->setWebsite($this->getWebsite());
        $copyObj->setSmProfile($this->getSmProfile());
        $copyObj->setOAuthSignIn($this->getOAuthSignIn());

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

            foreach ($this->getActions() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addAction($relObj->copy($deepCopy));
                }
            }

            foreach ($this->getJobs() as $relObj) {
                if ($relObj !== $this) {  // ensure that we don't try to copy a reference to ourselves
                    $copyObj->addJob($relObj->copy($deepCopy));
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
     * @return User Clone of current object.
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
     * @return UserPeer
     */
    public function getPeer()
    {
        if (self::$peer === null) {
            self::$peer = new UserPeer();
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
        if ('Action' == $relationName) {
            $this->initActions();
        }
        if ('Job' == $relationName) {
            $this->initJobs();
        }
    }

    /**
     * Clears out the collCharts collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return User The current object (for fluent API support)
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
     * If this User is new, it will return
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
                    ->filterByUser($this)
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
     * @return User The current object (for fluent API support)
     */
    public function setCharts(PropelCollection $charts, PropelPDO $con = null)
    {
        $chartsToDelete = $this->getCharts(new Criteria(), $con)->diff($charts);

        $this->chartsScheduledForDeletion = unserialize(serialize($chartsToDelete));

        foreach ($chartsToDelete as $chartRemoved) {
            $chartRemoved->setUser(null);
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
                ->filterByUser($this)
                ->count($con);
        }

        return count($this->collCharts);
    }

    /**
     * Method called to associate a Chart object to this object
     * through the Chart foreign key attribute.
     *
     * @param    Chart $l Chart
     * @return User The current object (for fluent API support)
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
        $chart->setUser($this);
    }

    /**
     * @param	Chart $chart The chart object to remove.
     * @return User The current object (for fluent API support)
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
            $chart->setUser(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this User is new, it will return
     * an empty collection; or if this User has previously
     * been saved, it will retrieve related Charts from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in User.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|Chart[] List of Chart objects
     */
    public function getChartsJoinOrganization($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = ChartQuery::create(null, $criteria);
        $query->joinWith('Organization', $join_behavior);

        return $this->getCharts($query, $con);
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this User is new, it will return
     * an empty collection; or if this User has previously
     * been saved, it will retrieve related Charts from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in User.
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
     * @return User The current object (for fluent API support)
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
     * If this User is new, it will return
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
                    ->filterByUser($this)
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
     * @return User The current object (for fluent API support)
     */
    public function setUserOrganizations(PropelCollection $userOrganizations, PropelPDO $con = null)
    {
        $userOrganizationsToDelete = $this->getUserOrganizations(new Criteria(), $con)->diff($userOrganizations);

        $this->userOrganizationsScheduledForDeletion = unserialize(serialize($userOrganizationsToDelete));

        foreach ($userOrganizationsToDelete as $userOrganizationRemoved) {
            $userOrganizationRemoved->setUser(null);
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
                ->filterByUser($this)
                ->count($con);
        }

        return count($this->collUserOrganizations);
    }

    /**
     * Method called to associate a UserOrganization object to this object
     * through the UserOrganization foreign key attribute.
     *
     * @param    UserOrganization $l UserOrganization
     * @return User The current object (for fluent API support)
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
        $userOrganization->setUser($this);
    }

    /**
     * @param	UserOrganization $userOrganization The userOrganization object to remove.
     * @return User The current object (for fluent API support)
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
            $userOrganization->setUser(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this User is new, it will return
     * an empty collection; or if this User has previously
     * been saved, it will retrieve related UserOrganizations from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in User.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|UserOrganization[] List of UserOrganization objects
     */
    public function getUserOrganizationsJoinOrganization($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = UserOrganizationQuery::create(null, $criteria);
        $query->joinWith('Organization', $join_behavior);

        return $this->getUserOrganizations($query, $con);
    }

    /**
     * Clears out the collActions collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return User The current object (for fluent API support)
     * @see        addActions()
     */
    public function clearActions()
    {
        $this->collActions = null; // important to set this to null since that means it is uninitialized
        $this->collActionsPartial = null;

        return $this;
    }

    /**
     * reset is the collActions collection loaded partially
     *
     * @return void
     */
    public function resetPartialActions($v = true)
    {
        $this->collActionsPartial = $v;
    }

    /**
     * Initializes the collActions collection.
     *
     * By default this just sets the collActions collection to an empty array (like clearcollActions());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initActions($overrideExisting = true)
    {
        if (null !== $this->collActions && !$overrideExisting) {
            return;
        }
        $this->collActions = new PropelObjectCollection();
        $this->collActions->setModel('Action');
    }

    /**
     * Gets an array of Action objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this User is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|Action[] List of Action objects
     * @throws PropelException
     */
    public function getActions($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collActionsPartial && !$this->isNew();
        if (null === $this->collActions || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collActions) {
                // return empty collection
                $this->initActions();
            } else {
                $collActions = ActionQuery::create(null, $criteria)
                    ->filterByUser($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collActionsPartial && count($collActions)) {
                      $this->initActions(false);

                      foreach($collActions as $obj) {
                        if (false == $this->collActions->contains($obj)) {
                          $this->collActions->append($obj);
                        }
                      }

                      $this->collActionsPartial = true;
                    }

                    $collActions->getInternalIterator()->rewind();
                    return $collActions;
                }

                if($partial && $this->collActions) {
                    foreach($this->collActions as $obj) {
                        if($obj->isNew()) {
                            $collActions[] = $obj;
                        }
                    }
                }

                $this->collActions = $collActions;
                $this->collActionsPartial = false;
            }
        }

        return $this->collActions;
    }

    /**
     * Sets a collection of Action objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $actions A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return User The current object (for fluent API support)
     */
    public function setActions(PropelCollection $actions, PropelPDO $con = null)
    {
        $actionsToDelete = $this->getActions(new Criteria(), $con)->diff($actions);

        $this->actionsScheduledForDeletion = unserialize(serialize($actionsToDelete));

        foreach ($actionsToDelete as $actionRemoved) {
            $actionRemoved->setUser(null);
        }

        $this->collActions = null;
        foreach ($actions as $action) {
            $this->addAction($action);
        }

        $this->collActions = $actions;
        $this->collActionsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related Action objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related Action objects.
     * @throws PropelException
     */
    public function countActions(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collActionsPartial && !$this->isNew();
        if (null === $this->collActions || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collActions) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getActions());
            }
            $query = ActionQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByUser($this)
                ->count($con);
        }

        return count($this->collActions);
    }

    /**
     * Method called to associate a Action object to this object
     * through the Action foreign key attribute.
     *
     * @param    Action $l Action
     * @return User The current object (for fluent API support)
     */
    public function addAction(Action $l)
    {
        if ($this->collActions === null) {
            $this->initActions();
            $this->collActionsPartial = true;
        }
        if (!in_array($l, $this->collActions->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddAction($l);
        }

        return $this;
    }

    /**
     * @param	Action $action The action object to add.
     */
    protected function doAddAction($action)
    {
        $this->collActions[]= $action;
        $action->setUser($this);
    }

    /**
     * @param	Action $action The action object to remove.
     * @return User The current object (for fluent API support)
     */
    public function removeAction($action)
    {
        if ($this->getActions()->contains($action)) {
            $this->collActions->remove($this->collActions->search($action));
            if (null === $this->actionsScheduledForDeletion) {
                $this->actionsScheduledForDeletion = clone $this->collActions;
                $this->actionsScheduledForDeletion->clear();
            }
            $this->actionsScheduledForDeletion[]= clone $action;
            $action->setUser(null);
        }

        return $this;
    }

    /**
     * Clears out the collJobs collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return User The current object (for fluent API support)
     * @see        addJobs()
     */
    public function clearJobs()
    {
        $this->collJobs = null; // important to set this to null since that means it is uninitialized
        $this->collJobsPartial = null;

        return $this;
    }

    /**
     * reset is the collJobs collection loaded partially
     *
     * @return void
     */
    public function resetPartialJobs($v = true)
    {
        $this->collJobsPartial = $v;
    }

    /**
     * Initializes the collJobs collection.
     *
     * By default this just sets the collJobs collection to an empty array (like clearcollJobs());
     * however, you may wish to override this method in your stub class to provide setting appropriate
     * to your application -- for example, setting the initial array to the values stored in database.
     *
     * @param boolean $overrideExisting If set to true, the method call initializes
     *                                        the collection even if it is not empty
     *
     * @return void
     */
    public function initJobs($overrideExisting = true)
    {
        if (null !== $this->collJobs && !$overrideExisting) {
            return;
        }
        $this->collJobs = new PropelObjectCollection();
        $this->collJobs->setModel('Job');
    }

    /**
     * Gets an array of Job objects which contain a foreign key that references this object.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this User is new, it will return
     * an empty collection or the current collection; the criteria is ignored on a new object.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @return PropelObjectCollection|Job[] List of Job objects
     * @throws PropelException
     */
    public function getJobs($criteria = null, PropelPDO $con = null)
    {
        $partial = $this->collJobsPartial && !$this->isNew();
        if (null === $this->collJobs || null !== $criteria  || $partial) {
            if ($this->isNew() && null === $this->collJobs) {
                // return empty collection
                $this->initJobs();
            } else {
                $collJobs = JobQuery::create(null, $criteria)
                    ->filterByUser($this)
                    ->find($con);
                if (null !== $criteria) {
                    if (false !== $this->collJobsPartial && count($collJobs)) {
                      $this->initJobs(false);

                      foreach($collJobs as $obj) {
                        if (false == $this->collJobs->contains($obj)) {
                          $this->collJobs->append($obj);
                        }
                      }

                      $this->collJobsPartial = true;
                    }

                    $collJobs->getInternalIterator()->rewind();
                    return $collJobs;
                }

                if($partial && $this->collJobs) {
                    foreach($this->collJobs as $obj) {
                        if($obj->isNew()) {
                            $collJobs[] = $obj;
                        }
                    }
                }

                $this->collJobs = $collJobs;
                $this->collJobsPartial = false;
            }
        }

        return $this->collJobs;
    }

    /**
     * Sets a collection of Job objects related by a one-to-many relationship
     * to the current object.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $jobs A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return User The current object (for fluent API support)
     */
    public function setJobs(PropelCollection $jobs, PropelPDO $con = null)
    {
        $jobsToDelete = $this->getJobs(new Criteria(), $con)->diff($jobs);

        $this->jobsScheduledForDeletion = unserialize(serialize($jobsToDelete));

        foreach ($jobsToDelete as $jobRemoved) {
            $jobRemoved->setUser(null);
        }

        $this->collJobs = null;
        foreach ($jobs as $job) {
            $this->addJob($job);
        }

        $this->collJobs = $jobs;
        $this->collJobsPartial = false;

        return $this;
    }

    /**
     * Returns the number of related Job objects.
     *
     * @param Criteria $criteria
     * @param boolean $distinct
     * @param PropelPDO $con
     * @return int             Count of related Job objects.
     * @throws PropelException
     */
    public function countJobs(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
    {
        $partial = $this->collJobsPartial && !$this->isNew();
        if (null === $this->collJobs || null !== $criteria || $partial) {
            if ($this->isNew() && null === $this->collJobs) {
                return 0;
            }

            if($partial && !$criteria) {
                return count($this->getJobs());
            }
            $query = JobQuery::create(null, $criteria);
            if ($distinct) {
                $query->distinct();
            }

            return $query
                ->filterByUser($this)
                ->count($con);
        }

        return count($this->collJobs);
    }

    /**
     * Method called to associate a Job object to this object
     * through the Job foreign key attribute.
     *
     * @param    Job $l Job
     * @return User The current object (for fluent API support)
     */
    public function addJob(Job $l)
    {
        if ($this->collJobs === null) {
            $this->initJobs();
            $this->collJobsPartial = true;
        }
        if (!in_array($l, $this->collJobs->getArrayCopy(), true)) { // only add it if the **same** object is not already associated
            $this->doAddJob($l);
        }

        return $this;
    }

    /**
     * @param	Job $job The job object to add.
     */
    protected function doAddJob($job)
    {
        $this->collJobs[]= $job;
        $job->setUser($this);
    }

    /**
     * @param	Job $job The job object to remove.
     * @return User The current object (for fluent API support)
     */
    public function removeJob($job)
    {
        if ($this->getJobs()->contains($job)) {
            $this->collJobs->remove($this->collJobs->search($job));
            if (null === $this->jobsScheduledForDeletion) {
                $this->jobsScheduledForDeletion = clone $this->collJobs;
                $this->jobsScheduledForDeletion->clear();
            }
            $this->jobsScheduledForDeletion[]= clone $job;
            $job->setUser(null);
        }

        return $this;
    }


    /**
     * If this collection has already been initialized with
     * an identical criteria, it returns the collection.
     * Otherwise if this User is new, it will return
     * an empty collection; or if this User has previously
     * been saved, it will retrieve related Jobs from storage.
     *
     * This method is protected by default in order to keep the public
     * api reasonable.  You can provide public methods for those you
     * actually need in User.
     *
     * @param Criteria $criteria optional Criteria object to narrow the query
     * @param PropelPDO $con optional connection object
     * @param string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
     * @return PropelObjectCollection|Job[] List of Job objects
     */
    public function getJobsJoinChart($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
    {
        $query = JobQuery::create(null, $criteria);
        $query->joinWith('Chart', $join_behavior);

        return $this->getJobs($query, $con);
    }

    /**
     * Clears out the collOrganizations collection
     *
     * This does not modify the database; however, it will remove any associated objects, causing
     * them to be refetched by subsequent calls to accessor method.
     *
     * @return User The current object (for fluent API support)
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
     * to the current object by way of the user_organization cross-reference table.
     *
     * If the $criteria is not null, it is used to always fetch the results from the database.
     * Otherwise the results are fetched from the database the first time, then cached.
     * Next time the same method is called without $criteria, the cached collection is returned.
     * If this User is new, it will return
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
                    ->filterByUser($this)
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
     * to the current object by way of the user_organization cross-reference table.
     * It will also schedule objects for deletion based on a diff between old objects (aka persisted)
     * and new objects from the given Propel collection.
     *
     * @param PropelCollection $organizations A Propel collection.
     * @param PropelPDO $con Optional connection object
     * @return User The current object (for fluent API support)
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
     * to the current object by way of the user_organization cross-reference table.
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
                    ->filterByUser($this)
                    ->count($con);
            }
        } else {
            return count($this->collOrganizations);
        }
    }

    /**
     * Associate a Organization object to this object
     * through the user_organization cross reference table.
     *
     * @param  Organization $organization The UserOrganization object to relate
     * @return User The current object (for fluent API support)
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
        $userOrganization = new UserOrganization();
        $userOrganization->setOrganization($organization);
        $this->addUserOrganization($userOrganization);
    }

    /**
     * Remove a Organization object to this object
     * through the user_organization cross reference table.
     *
     * @param Organization $organization The UserOrganization object to relate
     * @return User The current object (for fluent API support)
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
        $this->email = null;
        $this->pwd = null;
        $this->activate_token = null;
        $this->reset_password_token = null;
        $this->role = null;
        $this->deleted = null;
        $this->language = null;
        $this->created_at = null;
        $this->name = null;
        $this->website = null;
        $this->sm_profile = null;
        $this->oauth_signin = null;
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
            if ($this->collActions) {
                foreach ($this->collActions as $o) {
                    $o->clearAllReferences($deep);
                }
            }
            if ($this->collJobs) {
                foreach ($this->collJobs as $o) {
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

        if ($this->collCharts instanceof PropelCollection) {
            $this->collCharts->clearIterator();
        }
        $this->collCharts = null;
        if ($this->collUserOrganizations instanceof PropelCollection) {
            $this->collUserOrganizations->clearIterator();
        }
        $this->collUserOrganizations = null;
        if ($this->collActions instanceof PropelCollection) {
            $this->collActions->clearIterator();
        }
        $this->collActions = null;
        if ($this->collJobs instanceof PropelCollection) {
            $this->collJobs->clearIterator();
        }
        $this->collJobs = null;
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
        return (string) $this->exportTo(UserPeer::DEFAULT_STRING_FORMAT);
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
