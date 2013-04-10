<?php


/**
 * Base class that represents a row from the 'chart' table.
 *
 * 
 *
 * @package    propel.generator.datawrapper.om
 */
abstract class BaseChart extends BaseObject  implements Persistent
{

	/**
	 * Peer class name
	 */
	const PEER = 'ChartPeer';

	/**
	 * The Peer class.
	 * Instance provides a convenient way of calling static methods on a class
	 * that calling code may not be able to identify.
	 * @var        ChartPeer
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
	 * The value for the title field.
	 * @var        string
	 */
	protected $title;

	/**
	 * The value for the theme field.
	 * @var        string
	 */
	protected $theme;

	/**
	 * The value for the created_at field.
	 * @var        string
	 */
	protected $created_at;

	/**
	 * The value for the last_modified_at field.
	 * @var        string
	 */
	protected $last_modified_at;

	/**
	 * The value for the type field.
	 * @var        string
	 */
	protected $type;

	/**
	 * The value for the metadata field.
	 * @var        string
	 */
	protected $metadata;

	/**
	 * The value for the deleted field.
	 * Note: this column has a database default value of: false
	 * @var        boolean
	 */
	protected $deleted;

	/**
	 * The value for the deleted_at field.
	 * @var        string
	 */
	protected $deleted_at;

	/**
	 * The value for the author_id field.
	 * @var        int
	 */
	protected $author_id;

	/**
	 * The value for the show_in_gallery field.
	 * Note: this column has a database default value of: false
	 * @var        boolean
	 */
	protected $show_in_gallery;

	/**
	 * The value for the language field.
	 * Note: this column has a database default value of: ''
	 * @var        string
	 */
	protected $language;

	/**
	 * The value for the guest_session field.
	 * @var        string
	 */
	protected $guest_session;

	/**
	 * The value for the last_edit_step field.
	 * Note: this column has a database default value of: 0
	 * @var        int
	 */
	protected $last_edit_step;

	/**
	 * The value for the published_at field.
	 * @var        string
	 */
	protected $published_at;

	/**
	 * The value for the public_url field.
	 * @var        string
	 */
	protected $public_url;

	/**
	 * @var        User
	 */
	protected $aUser;

	/**
	 * @var        array Job[] Collection to store aggregation of Job objects.
	 */
	protected $collJobs;

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
	 * An array of objects scheduled for deletion.
	 * @var		array
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
		$this->deleted = false;
		$this->show_in_gallery = false;
		$this->language = '';
		$this->last_edit_step = 0;
	}

	/**
	 * Initializes internal state of BaseChart object.
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
	 * @return     string
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Get the [title] column value.
	 * 
	 * @return     string
	 */
	public function getTitle()
	{
		return $this->title;
	}

	/**
	 * Get the [theme] column value.
	 * 
	 * @return     string
	 */
	public function getTheme()
	{
		return $this->theme;
	}

	/**
	 * Get the [optionally formatted] temporal [created_at] column value.
	 * 
	 *
	 * @param      string $format The date/time format string (either date()-style or strftime()-style).
	 *							If format is NULL, then the raw DateTime object will be returned.
	 * @return     mixed Formatted date/time value as string or DateTime object (if format is NULL), NULL if column is NULL, and 0 if column value is 0000-00-00 00:00:00
	 * @throws     PropelException - if unable to parse/validate the date/time value.
	 */
	public function getCreatedAt($format = 'Y-m-d H:i:s')
	{
		if ($this->created_at === null) {
			return null;
		}


		if ($this->created_at === '0000-00-00 00:00:00') {
			// while technically this is not a default value of NULL,
			// this seems to be closest in meaning.
			return null;
		} else {
			try {
				$dt = new DateTime($this->created_at);
			} catch (Exception $x) {
				throw new PropelException("Internally stored date/time/timestamp value could not be converted to DateTime: " . var_export($this->created_at, true), $x);
			}
		}

		if ($format === null) {
			// Because propel.useDateTimeClass is TRUE, we return a DateTime object.
			return $dt;
		} elseif (strpos($format, '%') !== false) {
			return strftime($format, $dt->format('U'));
		} else {
			return $dt->format($format);
		}
	}

	/**
	 * Get the [optionally formatted] temporal [last_modified_at] column value.
	 * 
	 *
	 * @param      string $format The date/time format string (either date()-style or strftime()-style).
	 *							If format is NULL, then the raw DateTime object will be returned.
	 * @return     mixed Formatted date/time value as string or DateTime object (if format is NULL), NULL if column is NULL, and 0 if column value is 0000-00-00 00:00:00
	 * @throws     PropelException - if unable to parse/validate the date/time value.
	 */
	public function getLastModifiedAt($format = 'Y-m-d H:i:s')
	{
		if ($this->last_modified_at === null) {
			return null;
		}


		if ($this->last_modified_at === '0000-00-00 00:00:00') {
			// while technically this is not a default value of NULL,
			// this seems to be closest in meaning.
			return null;
		} else {
			try {
				$dt = new DateTime($this->last_modified_at);
			} catch (Exception $x) {
				throw new PropelException("Internally stored date/time/timestamp value could not be converted to DateTime: " . var_export($this->last_modified_at, true), $x);
			}
		}

		if ($format === null) {
			// Because propel.useDateTimeClass is TRUE, we return a DateTime object.
			return $dt;
		} elseif (strpos($format, '%') !== false) {
			return strftime($format, $dt->format('U'));
		} else {
			return $dt->format($format);
		}
	}

	/**
	 * Get the [type] column value.
	 * 
	 * @return     string
	 */
	public function getType()
	{
		return $this->type;
	}

	/**
	 * Get the [metadata] column value.
	 * 
	 * @return     string
	 */
	public function getMetadata()
	{
		return $this->metadata;
	}

	/**
	 * Get the [deleted] column value.
	 * 
	 * @return     boolean
	 */
	public function getDeleted()
	{
		return $this->deleted;
	}

	/**
	 * Get the [optionally formatted] temporal [deleted_at] column value.
	 * 
	 *
	 * @param      string $format The date/time format string (either date()-style or strftime()-style).
	 *							If format is NULL, then the raw DateTime object will be returned.
	 * @return     mixed Formatted date/time value as string or DateTime object (if format is NULL), NULL if column is NULL, and 0 if column value is 0000-00-00 00:00:00
	 * @throws     PropelException - if unable to parse/validate the date/time value.
	 */
	public function getDeletedAt($format = 'Y-m-d H:i:s')
	{
		if ($this->deleted_at === null) {
			return null;
		}


		if ($this->deleted_at === '0000-00-00 00:00:00') {
			// while technically this is not a default value of NULL,
			// this seems to be closest in meaning.
			return null;
		} else {
			try {
				$dt = new DateTime($this->deleted_at);
			} catch (Exception $x) {
				throw new PropelException("Internally stored date/time/timestamp value could not be converted to DateTime: " . var_export($this->deleted_at, true), $x);
			}
		}

		if ($format === null) {
			// Because propel.useDateTimeClass is TRUE, we return a DateTime object.
			return $dt;
		} elseif (strpos($format, '%') !== false) {
			return strftime($format, $dt->format('U'));
		} else {
			return $dt->format($format);
		}
	}

	/**
	 * Get the [author_id] column value.
	 * 
	 * @return     int
	 */
	public function getAuthorId()
	{
		return $this->author_id;
	}

	/**
	 * Get the [show_in_gallery] column value.
	 * 
	 * @return     boolean
	 */
	public function getShowInGallery()
	{
		return $this->show_in_gallery;
	}

	/**
	 * Get the [language] column value.
	 * 
	 * @return     string
	 */
	public function getLanguage()
	{
		return $this->language;
	}

	/**
	 * Get the [guest_session] column value.
	 * 
	 * @return     string
	 */
	public function getGuestSession()
	{
		return $this->guest_session;
	}

	/**
	 * Get the [last_edit_step] column value.
	 * 
	 * @return     int
	 */
	public function getLastEditStep()
	{
		return $this->last_edit_step;
	}

	/**
	 * Get the [optionally formatted] temporal [published_at] column value.
	 * 
	 *
	 * @param      string $format The date/time format string (either date()-style or strftime()-style).
	 *							If format is NULL, then the raw DateTime object will be returned.
	 * @return     mixed Formatted date/time value as string or DateTime object (if format is NULL), NULL if column is NULL, and 0 if column value is 0000-00-00 00:00:00
	 * @throws     PropelException - if unable to parse/validate the date/time value.
	 */
	public function getPublishedAt($format = 'Y-m-d H:i:s')
	{
		if ($this->published_at === null) {
			return null;
		}


		if ($this->published_at === '0000-00-00 00:00:00') {
			// while technically this is not a default value of NULL,
			// this seems to be closest in meaning.
			return null;
		} else {
			try {
				$dt = new DateTime($this->published_at);
			} catch (Exception $x) {
				throw new PropelException("Internally stored date/time/timestamp value could not be converted to DateTime: " . var_export($this->published_at, true), $x);
			}
		}

		if ($format === null) {
			// Because propel.useDateTimeClass is TRUE, we return a DateTime object.
			return $dt;
		} elseif (strpos($format, '%') !== false) {
			return strftime($format, $dt->format('U'));
		} else {
			return $dt->format($format);
		}
	}

	/**
	 * Get the [public_url] column value.
	 * 
	 * @return     string
	 */
	public function getPublicUrl()
	{
		return $this->public_url;
	}

	/**
	 * Set the value of [id] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setId($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->id !== $v) {
			$this->id = $v;
			$this->modifiedColumns[] = ChartPeer::ID;
		}

		return $this;
	} // setId()

	/**
	 * Set the value of [title] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setTitle($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->title !== $v) {
			$this->title = $v;
			$this->modifiedColumns[] = ChartPeer::TITLE;
		}

		return $this;
	} // setTitle()

	/**
	 * Set the value of [theme] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setTheme($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->theme !== $v) {
			$this->theme = $v;
			$this->modifiedColumns[] = ChartPeer::THEME;
		}

		return $this;
	} // setTheme()

	/**
	 * Sets the value of [created_at] column to a normalized version of the date/time value specified.
	 * 
	 * @param      mixed $v string, integer (timestamp), or DateTime value.
	 *               Empty strings are treated as NULL.
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setCreatedAt($v)
	{
		$dt = PropelDateTime::newInstance($v, null, 'DateTime');
		if ($this->created_at !== null || $dt !== null) {
			$currentDateAsString = ($this->created_at !== null && $tmpDt = new DateTime($this->created_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
			$newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
			if ($currentDateAsString !== $newDateAsString) {
				$this->created_at = $newDateAsString;
				$this->modifiedColumns[] = ChartPeer::CREATED_AT;
			}
		} // if either are not null

		return $this;
	} // setCreatedAt()

	/**
	 * Sets the value of [last_modified_at] column to a normalized version of the date/time value specified.
	 * 
	 * @param      mixed $v string, integer (timestamp), or DateTime value.
	 *               Empty strings are treated as NULL.
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setLastModifiedAt($v)
	{
		$dt = PropelDateTime::newInstance($v, null, 'DateTime');
		if ($this->last_modified_at !== null || $dt !== null) {
			$currentDateAsString = ($this->last_modified_at !== null && $tmpDt = new DateTime($this->last_modified_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
			$newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
			if ($currentDateAsString !== $newDateAsString) {
				$this->last_modified_at = $newDateAsString;
				$this->modifiedColumns[] = ChartPeer::LAST_MODIFIED_AT;
			}
		} // if either are not null

		return $this;
	} // setLastModifiedAt()

	/**
	 * Set the value of [type] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setType($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->type !== $v) {
			$this->type = $v;
			$this->modifiedColumns[] = ChartPeer::TYPE;
		}

		return $this;
	} // setType()

	/**
	 * Set the value of [metadata] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setMetadata($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->metadata !== $v) {
			$this->metadata = $v;
			$this->modifiedColumns[] = ChartPeer::METADATA;
		}

		return $this;
	} // setMetadata()

	/**
	 * Sets the value of the [deleted] column.
	 * Non-boolean arguments are converted using the following rules:
	 *   * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
	 *   * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
	 * Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
	 * 
	 * @param      boolean|integer|string $v The new value
	 * @return     Chart The current object (for fluent API support)
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
			$this->modifiedColumns[] = ChartPeer::DELETED;
		}

		return $this;
	} // setDeleted()

	/**
	 * Sets the value of [deleted_at] column to a normalized version of the date/time value specified.
	 * 
	 * @param      mixed $v string, integer (timestamp), or DateTime value.
	 *               Empty strings are treated as NULL.
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setDeletedAt($v)
	{
		$dt = PropelDateTime::newInstance($v, null, 'DateTime');
		if ($this->deleted_at !== null || $dt !== null) {
			$currentDateAsString = ($this->deleted_at !== null && $tmpDt = new DateTime($this->deleted_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
			$newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
			if ($currentDateAsString !== $newDateAsString) {
				$this->deleted_at = $newDateAsString;
				$this->modifiedColumns[] = ChartPeer::DELETED_AT;
			}
		} // if either are not null

		return $this;
	} // setDeletedAt()

	/**
	 * Set the value of [author_id] column.
	 * 
	 * @param      int $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setAuthorId($v)
	{
		if ($v !== null) {
			$v = (int) $v;
		}

		if ($this->author_id !== $v) {
			$this->author_id = $v;
			$this->modifiedColumns[] = ChartPeer::AUTHOR_ID;
		}

		if ($this->aUser !== null && $this->aUser->getId() !== $v) {
			$this->aUser = null;
		}

		return $this;
	} // setAuthorId()

	/**
	 * Sets the value of the [show_in_gallery] column.
	 * Non-boolean arguments are converted using the following rules:
	 *   * 1, '1', 'true',  'on',  and 'yes' are converted to boolean true
	 *   * 0, '0', 'false', 'off', and 'no'  are converted to boolean false
	 * Check on string values is case insensitive (so 'FaLsE' is seen as 'false').
	 * 
	 * @param      boolean|integer|string $v The new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setShowInGallery($v)
	{
		if ($v !== null) {
			if (is_string($v)) {
				$v = in_array(strtolower($v), array('false', 'off', '-', 'no', 'n', '0', '')) ? false : true;
			} else {
				$v = (boolean) $v;
			}
		}

		if ($this->show_in_gallery !== $v) {
			$this->show_in_gallery = $v;
			$this->modifiedColumns[] = ChartPeer::SHOW_IN_GALLERY;
		}

		return $this;
	} // setShowInGallery()

	/**
	 * Set the value of [language] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setLanguage($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->language !== $v) {
			$this->language = $v;
			$this->modifiedColumns[] = ChartPeer::LANGUAGE;
		}

		return $this;
	} // setLanguage()

	/**
	 * Set the value of [guest_session] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setGuestSession($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->guest_session !== $v) {
			$this->guest_session = $v;
			$this->modifiedColumns[] = ChartPeer::GUEST_SESSION;
		}

		return $this;
	} // setGuestSession()

	/**
	 * Set the value of [last_edit_step] column.
	 * 
	 * @param      int $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setLastEditStep($v)
	{
		if ($v !== null) {
			$v = (int) $v;
		}

		if ($this->last_edit_step !== $v) {
			$this->last_edit_step = $v;
			$this->modifiedColumns[] = ChartPeer::LAST_EDIT_STEP;
		}

		return $this;
	} // setLastEditStep()

	/**
	 * Sets the value of [published_at] column to a normalized version of the date/time value specified.
	 * 
	 * @param      mixed $v string, integer (timestamp), or DateTime value.
	 *               Empty strings are treated as NULL.
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setPublishedAt($v)
	{
		$dt = PropelDateTime::newInstance($v, null, 'DateTime');
		if ($this->published_at !== null || $dt !== null) {
			$currentDateAsString = ($this->published_at !== null && $tmpDt = new DateTime($this->published_at)) ? $tmpDt->format('Y-m-d H:i:s') : null;
			$newDateAsString = $dt ? $dt->format('Y-m-d H:i:s') : null;
			if ($currentDateAsString !== $newDateAsString) {
				$this->published_at = $newDateAsString;
				$this->modifiedColumns[] = ChartPeer::PUBLISHED_AT;
			}
		} // if either are not null

		return $this;
	} // setPublishedAt()

	/**
	 * Set the value of [public_url] column.
	 * 
	 * @param      string $v new value
	 * @return     Chart The current object (for fluent API support)
	 */
	public function setPublicUrl($v)
	{
		if ($v !== null) {
			$v = (string) $v;
		}

		if ($this->public_url !== $v) {
			$this->public_url = $v;
			$this->modifiedColumns[] = ChartPeer::PUBLIC_URL;
		}

		return $this;
	} // setPublicUrl()

	/**
	 * Indicates whether the columns in this object are only set to default values.
	 *
	 * This method can be used in conjunction with isModified() to indicate whether an object is both
	 * modified _and_ has some values set which are non-default.
	 *
	 * @return     boolean Whether the columns in this object are only been set with default values.
	 */
	public function hasOnlyDefaultValues()
	{
			if ($this->deleted !== false) {
				return false;
			}

			if ($this->show_in_gallery !== false) {
				return false;
			}

			if ($this->language !== '') {
				return false;
			}

			if ($this->last_edit_step !== 0) {
				return false;
			}

		// otherwise, everything was equal, so return TRUE
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
	 * @param      array $row The row returned by PDOStatement->fetch(PDO::FETCH_NUM)
	 * @param      int $startcol 0-based offset column which indicates which restultset column to start with.
	 * @param      boolean $rehydrate Whether this object is being re-hydrated from the database.
	 * @return     int next starting column
	 * @throws     PropelException  - Any caught Exception will be rewrapped as a PropelException.
	 */
	public function hydrate($row, $startcol = 0, $rehydrate = false)
	{
		try {

			$this->id = ($row[$startcol + 0] !== null) ? (string) $row[$startcol + 0] : null;
			$this->title = ($row[$startcol + 1] !== null) ? (string) $row[$startcol + 1] : null;
			$this->theme = ($row[$startcol + 2] !== null) ? (string) $row[$startcol + 2] : null;
			$this->created_at = ($row[$startcol + 3] !== null) ? (string) $row[$startcol + 3] : null;
			$this->last_modified_at = ($row[$startcol + 4] !== null) ? (string) $row[$startcol + 4] : null;
			$this->type = ($row[$startcol + 5] !== null) ? (string) $row[$startcol + 5] : null;
			$this->metadata = ($row[$startcol + 6] !== null) ? (string) $row[$startcol + 6] : null;
			$this->deleted = ($row[$startcol + 7] !== null) ? (boolean) $row[$startcol + 7] : null;
			$this->deleted_at = ($row[$startcol + 8] !== null) ? (string) $row[$startcol + 8] : null;
			$this->author_id = ($row[$startcol + 9] !== null) ? (int) $row[$startcol + 9] : null;
			$this->show_in_gallery = ($row[$startcol + 10] !== null) ? (boolean) $row[$startcol + 10] : null;
			$this->language = ($row[$startcol + 11] !== null) ? (string) $row[$startcol + 11] : null;
			$this->guest_session = ($row[$startcol + 12] !== null) ? (string) $row[$startcol + 12] : null;
			$this->last_edit_step = ($row[$startcol + 13] !== null) ? (int) $row[$startcol + 13] : null;
			$this->published_at = ($row[$startcol + 14] !== null) ? (string) $row[$startcol + 14] : null;
			$this->public_url = ($row[$startcol + 15] !== null) ? (string) $row[$startcol + 15] : null;
			$this->resetModified();

			$this->setNew(false);

			if ($rehydrate) {
				$this->ensureConsistency();
			}

			return $startcol + 16; // 16 = ChartPeer::NUM_HYDRATE_COLUMNS.

		} catch (Exception $e) {
			throw new PropelException("Error populating Chart object", $e);
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
	 * @throws     PropelException
	 */
	public function ensureConsistency()
	{

		if ($this->aUser !== null && $this->author_id !== $this->aUser->getId()) {
			$this->aUser = null;
		}
	} // ensureConsistency

	/**
	 * Reloads this object from datastore based on primary key and (optionally) resets all associated objects.
	 *
	 * This will only work if the object has been saved and has a valid primary key set.
	 *
	 * @param      boolean $deep (optional) Whether to also de-associated any related objects.
	 * @param      PropelPDO $con (optional) The PropelPDO connection to use.
	 * @return     void
	 * @throws     PropelException - if this object is deleted, unsaved or doesn't have pk match in db
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
			$con = Propel::getConnection(ChartPeer::DATABASE_NAME, Propel::CONNECTION_READ);
		}

		// We don't need to alter the object instance pool; we're just modifying this instance
		// already in the pool.

		$stmt = ChartPeer::doSelectStmt($this->buildPkeyCriteria(), $con);
		$row = $stmt->fetch(PDO::FETCH_NUM);
		$stmt->closeCursor();
		if (!$row) {
			throw new PropelException('Cannot find matching row in the database to reload object values.');
		}
		$this->hydrate($row, 0, true); // rehydrate

		if ($deep) {  // also de-associate any related objects?

			$this->aUser = null;
			$this->collJobs = null;

		} // if (deep)
	}

	/**
	 * Removes this object from datastore and sets delete attribute.
	 *
	 * @param      PropelPDO $con
	 * @return     void
	 * @throws     PropelException
	 * @see        BaseObject::setDeleted()
	 * @see        BaseObject::isDeleted()
	 */
	public function delete(PropelPDO $con = null)
	{
		if ($this->isDeleted()) {
			throw new PropelException("This object has already been deleted.");
		}

		if ($con === null) {
			$con = Propel::getConnection(ChartPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
		}

		$con->beginTransaction();
		try {
			$deleteQuery = ChartQuery::create()
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
	 * @param      PropelPDO $con
	 * @return     int The number of rows affected by this insert/update and any referring fk objects' save() operations.
	 * @throws     PropelException
	 * @see        doSave()
	 */
	public function save(PropelPDO $con = null)
	{
		if ($this->isDeleted()) {
			throw new PropelException("You cannot save an object that has been deleted.");
		}

		if ($con === null) {
			$con = Propel::getConnection(ChartPeer::DATABASE_NAME, Propel::CONNECTION_WRITE);
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
				ChartPeer::addInstanceToPool($this);
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
	 * @param      PropelPDO $con
	 * @return     int The number of rows affected by this insert/update and any referring fk objects' save() operations.
	 * @throws     PropelException
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

			if ($this->aUser !== null) {
				if ($this->aUser->isModified() || $this->aUser->isNew()) {
					$affectedRows += $this->aUser->save($con);
				}
				$this->setUser($this->aUser);
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
					if (!$referrerFK->isDeleted()) {
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
	 * @param      PropelPDO $con
	 *
	 * @throws     PropelException
	 * @see        doSave()
	 */
	protected function doInsert(PropelPDO $con)
	{
		$modifiedColumns = array();
		$index = 0;


		 // check the columns in natural order for more readable SQL queries
		if ($this->isColumnModified(ChartPeer::ID)) {
			$modifiedColumns[':p' . $index++]  = '`ID`';
		}
		if ($this->isColumnModified(ChartPeer::TITLE)) {
			$modifiedColumns[':p' . $index++]  = '`TITLE`';
		}
		if ($this->isColumnModified(ChartPeer::THEME)) {
			$modifiedColumns[':p' . $index++]  = '`THEME`';
		}
		if ($this->isColumnModified(ChartPeer::CREATED_AT)) {
			$modifiedColumns[':p' . $index++]  = '`CREATED_AT`';
		}
		if ($this->isColumnModified(ChartPeer::LAST_MODIFIED_AT)) {
			$modifiedColumns[':p' . $index++]  = '`LAST_MODIFIED_AT`';
		}
		if ($this->isColumnModified(ChartPeer::TYPE)) {
			$modifiedColumns[':p' . $index++]  = '`TYPE`';
		}
		if ($this->isColumnModified(ChartPeer::METADATA)) {
			$modifiedColumns[':p' . $index++]  = '`METADATA`';
		}
		if ($this->isColumnModified(ChartPeer::DELETED)) {
			$modifiedColumns[':p' . $index++]  = '`DELETED`';
		}
		if ($this->isColumnModified(ChartPeer::DELETED_AT)) {
			$modifiedColumns[':p' . $index++]  = '`DELETED_AT`';
		}
		if ($this->isColumnModified(ChartPeer::AUTHOR_ID)) {
			$modifiedColumns[':p' . $index++]  = '`AUTHOR_ID`';
		}
		if ($this->isColumnModified(ChartPeer::SHOW_IN_GALLERY)) {
			$modifiedColumns[':p' . $index++]  = '`SHOW_IN_GALLERY`';
		}
		if ($this->isColumnModified(ChartPeer::LANGUAGE)) {
			$modifiedColumns[':p' . $index++]  = '`LANGUAGE`';
		}
		if ($this->isColumnModified(ChartPeer::GUEST_SESSION)) {
			$modifiedColumns[':p' . $index++]  = '`GUEST_SESSION`';
		}
		if ($this->isColumnModified(ChartPeer::LAST_EDIT_STEP)) {
			$modifiedColumns[':p' . $index++]  = '`LAST_EDIT_STEP`';
		}
		if ($this->isColumnModified(ChartPeer::PUBLISHED_AT)) {
			$modifiedColumns[':p' . $index++]  = '`PUBLISHED_AT`';
		}
		if ($this->isColumnModified(ChartPeer::PUBLIC_URL)) {
			$modifiedColumns[':p' . $index++]  = '`PUBLIC_URL`';
		}

		$sql = sprintf(
			'INSERT INTO `chart` (%s) VALUES (%s)',
			implode(', ', $modifiedColumns),
			implode(', ', array_keys($modifiedColumns))
		);

		try {
			$stmt = $con->prepare($sql);
			foreach ($modifiedColumns as $identifier => $columnName) {
				switch ($columnName) {
					case '`ID`':
						$stmt->bindValue($identifier, $this->id, PDO::PARAM_STR);
						break;
					case '`TITLE`':
						$stmt->bindValue($identifier, $this->title, PDO::PARAM_STR);
						break;
					case '`THEME`':
						$stmt->bindValue($identifier, $this->theme, PDO::PARAM_STR);
						break;
					case '`CREATED_AT`':
						$stmt->bindValue($identifier, $this->created_at, PDO::PARAM_STR);
						break;
					case '`LAST_MODIFIED_AT`':
						$stmt->bindValue($identifier, $this->last_modified_at, PDO::PARAM_STR);
						break;
					case '`TYPE`':
						$stmt->bindValue($identifier, $this->type, PDO::PARAM_STR);
						break;
					case '`METADATA`':
						$stmt->bindValue($identifier, $this->metadata, PDO::PARAM_STR);
						break;
					case '`DELETED`':
						$stmt->bindValue($identifier, (int) $this->deleted, PDO::PARAM_INT);
						break;
					case '`DELETED_AT`':
						$stmt->bindValue($identifier, $this->deleted_at, PDO::PARAM_STR);
						break;
					case '`AUTHOR_ID`':
						$stmt->bindValue($identifier, $this->author_id, PDO::PARAM_INT);
						break;
					case '`SHOW_IN_GALLERY`':
						$stmt->bindValue($identifier, (int) $this->show_in_gallery, PDO::PARAM_INT);
						break;
					case '`LANGUAGE`':
						$stmt->bindValue($identifier, $this->language, PDO::PARAM_STR);
						break;
					case '`GUEST_SESSION`':
						$stmt->bindValue($identifier, $this->guest_session, PDO::PARAM_STR);
						break;
					case '`LAST_EDIT_STEP`':
						$stmt->bindValue($identifier, $this->last_edit_step, PDO::PARAM_INT);
						break;
					case '`PUBLISHED_AT`':
						$stmt->bindValue($identifier, $this->published_at, PDO::PARAM_STR);
						break;
					case '`PUBLIC_URL`':
						$stmt->bindValue($identifier, $this->public_url, PDO::PARAM_STR);
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
	 * @param      PropelPDO $con
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
	 * @return     array ValidationFailed[]
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
	 * @param      mixed $columns Column name or an array of column names.
	 * @return     boolean Whether all columns pass validation.
	 * @see        doValidate()
	 * @see        getValidationFailures()
	 */
	public function validate($columns = null)
	{
		$res = $this->doValidate($columns);
		if ($res === true) {
			$this->validationFailures = array();
			return true;
		} else {
			$this->validationFailures = $res;
			return false;
		}
	}

	/**
	 * This function performs the validation work for complex object models.
	 *
	 * In addition to checking the current object, all related objects will
	 * also be validated.  If all pass then <code>true</code> is returned; otherwise
	 * an aggreagated array of ValidationFailed objects will be returned.
	 *
	 * @param      array $columns Array of column names to validate.
	 * @return     mixed <code>true</code> if all validations pass; array of <code>ValidationFailed</code> objets otherwise.
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

			if ($this->aUser !== null) {
				if (!$this->aUser->validate($columns)) {
					$failureMap = array_merge($failureMap, $this->aUser->getValidationFailures());
				}
			}


			if (($retval = ChartPeer::doValidate($this, $columns)) !== true) {
				$failureMap = array_merge($failureMap, $retval);
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
	 * @param      string $name name
	 * @param      string $type The type of fieldname the $name is of:
	 *                     one of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME
	 *                     BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM
	 * @return     mixed Value of field.
	 */
	public function getByName($name, $type = BasePeer::TYPE_PHPNAME)
	{
		$pos = ChartPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
		$field = $this->getByPosition($pos);
		return $field;
	}

	/**
	 * Retrieves a field from the object by Position as specified in the xml schema.
	 * Zero-based.
	 *
	 * @param      int $pos position in xml schema
	 * @return     mixed Value of field at $pos
	 */
	public function getByPosition($pos)
	{
		switch($pos) {
			case 0:
				return $this->getId();
				break;
			case 1:
				return $this->getTitle();
				break;
			case 2:
				return $this->getTheme();
				break;
			case 3:
				return $this->getCreatedAt();
				break;
			case 4:
				return $this->getLastModifiedAt();
				break;
			case 5:
				return $this->getType();
				break;
			case 6:
				return $this->getMetadata();
				break;
			case 7:
				return $this->getDeleted();
				break;
			case 8:
				return $this->getDeletedAt();
				break;
			case 9:
				return $this->getAuthorId();
				break;
			case 10:
				return $this->getShowInGallery();
				break;
			case 11:
				return $this->getLanguage();
				break;
			case 12:
				return $this->getGuestSession();
				break;
			case 13:
				return $this->getLastEditStep();
				break;
			case 14:
				return $this->getPublishedAt();
				break;
			case 15:
				return $this->getPublicUrl();
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
	 * @param     boolean $includeLazyLoadColumns (optional) Whether to include lazy loaded columns. Defaults to TRUE.
	 * @param     array $alreadyDumpedObjects List of objects to skip to avoid recursion
	 * @param     boolean $includeForeignObjects (optional) Whether to include hydrated related objects. Default to FALSE.
	 *
	 * @return    array an associative array containing the field names (as keys) and field values
	 */
	public function toArray($keyType = BasePeer::TYPE_PHPNAME, $includeLazyLoadColumns = true, $alreadyDumpedObjects = array(), $includeForeignObjects = false)
	{
		if (isset($alreadyDumpedObjects['Chart'][$this->getPrimaryKey()])) {
			return '*RECURSION*';
		}
		$alreadyDumpedObjects['Chart'][$this->getPrimaryKey()] = true;
		$keys = ChartPeer::getFieldNames($keyType);
		$result = array(
			$keys[0] => $this->getId(),
			$keys[1] => $this->getTitle(),
			$keys[2] => $this->getTheme(),
			$keys[3] => $this->getCreatedAt(),
			$keys[4] => $this->getLastModifiedAt(),
			$keys[5] => $this->getType(),
			$keys[6] => $this->getMetadata(),
			$keys[7] => $this->getDeleted(),
			$keys[8] => $this->getDeletedAt(),
			$keys[9] => $this->getAuthorId(),
			$keys[10] => $this->getShowInGallery(),
			$keys[11] => $this->getLanguage(),
			$keys[12] => $this->getGuestSession(),
			$keys[13] => $this->getLastEditStep(),
			$keys[14] => $this->getPublishedAt(),
			$keys[15] => $this->getPublicUrl(),
		);
		if ($includeForeignObjects) {
			if (null !== $this->aUser) {
				$result['User'] = $this->aUser->toArray($keyType, $includeLazyLoadColumns,  $alreadyDumpedObjects, true);
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
	 * @param      string $name peer name
	 * @param      mixed $value field value
	 * @param      string $type The type of fieldname the $name is of:
	 *                     one of the class type constants BasePeer::TYPE_PHPNAME, BasePeer::TYPE_STUDLYPHPNAME
	 *                     BasePeer::TYPE_COLNAME, BasePeer::TYPE_FIELDNAME, BasePeer::TYPE_NUM
	 * @return     void
	 */
	public function setByName($name, $value, $type = BasePeer::TYPE_PHPNAME)
	{
		$pos = ChartPeer::translateFieldName($name, $type, BasePeer::TYPE_NUM);
		return $this->setByPosition($pos, $value);
	}

	/**
	 * Sets a field from the object by Position as specified in the xml schema.
	 * Zero-based.
	 *
	 * @param      int $pos position in xml schema
	 * @param      mixed $value field value
	 * @return     void
	 */
	public function setByPosition($pos, $value)
	{
		switch($pos) {
			case 0:
				$this->setId($value);
				break;
			case 1:
				$this->setTitle($value);
				break;
			case 2:
				$this->setTheme($value);
				break;
			case 3:
				$this->setCreatedAt($value);
				break;
			case 4:
				$this->setLastModifiedAt($value);
				break;
			case 5:
				$this->setType($value);
				break;
			case 6:
				$this->setMetadata($value);
				break;
			case 7:
				$this->setDeleted($value);
				break;
			case 8:
				$this->setDeletedAt($value);
				break;
			case 9:
				$this->setAuthorId($value);
				break;
			case 10:
				$this->setShowInGallery($value);
				break;
			case 11:
				$this->setLanguage($value);
				break;
			case 12:
				$this->setGuestSession($value);
				break;
			case 13:
				$this->setLastEditStep($value);
				break;
			case 14:
				$this->setPublishedAt($value);
				break;
			case 15:
				$this->setPublicUrl($value);
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
	 * The default key type is the column's phpname (e.g. 'AuthorId')
	 *
	 * @param      array  $arr     An array to populate the object from.
	 * @param      string $keyType The type of keys the array uses.
	 * @return     void
	 */
	public function fromArray($arr, $keyType = BasePeer::TYPE_PHPNAME)
	{
		$keys = ChartPeer::getFieldNames($keyType);

		if (array_key_exists($keys[0], $arr)) $this->setId($arr[$keys[0]]);
		if (array_key_exists($keys[1], $arr)) $this->setTitle($arr[$keys[1]]);
		if (array_key_exists($keys[2], $arr)) $this->setTheme($arr[$keys[2]]);
		if (array_key_exists($keys[3], $arr)) $this->setCreatedAt($arr[$keys[3]]);
		if (array_key_exists($keys[4], $arr)) $this->setLastModifiedAt($arr[$keys[4]]);
		if (array_key_exists($keys[5], $arr)) $this->setType($arr[$keys[5]]);
		if (array_key_exists($keys[6], $arr)) $this->setMetadata($arr[$keys[6]]);
		if (array_key_exists($keys[7], $arr)) $this->setDeleted($arr[$keys[7]]);
		if (array_key_exists($keys[8], $arr)) $this->setDeletedAt($arr[$keys[8]]);
		if (array_key_exists($keys[9], $arr)) $this->setAuthorId($arr[$keys[9]]);
		if (array_key_exists($keys[10], $arr)) $this->setShowInGallery($arr[$keys[10]]);
		if (array_key_exists($keys[11], $arr)) $this->setLanguage($arr[$keys[11]]);
		if (array_key_exists($keys[12], $arr)) $this->setGuestSession($arr[$keys[12]]);
		if (array_key_exists($keys[13], $arr)) $this->setLastEditStep($arr[$keys[13]]);
		if (array_key_exists($keys[14], $arr)) $this->setPublishedAt($arr[$keys[14]]);
		if (array_key_exists($keys[15], $arr)) $this->setPublicUrl($arr[$keys[15]]);
	}

	/**
	 * Build a Criteria object containing the values of all modified columns in this object.
	 *
	 * @return     Criteria The Criteria object containing all modified values.
	 */
	public function buildCriteria()
	{
		$criteria = new Criteria(ChartPeer::DATABASE_NAME);

		if ($this->isColumnModified(ChartPeer::ID)) $criteria->add(ChartPeer::ID, $this->id);
		if ($this->isColumnModified(ChartPeer::TITLE)) $criteria->add(ChartPeer::TITLE, $this->title);
		if ($this->isColumnModified(ChartPeer::THEME)) $criteria->add(ChartPeer::THEME, $this->theme);
		if ($this->isColumnModified(ChartPeer::CREATED_AT)) $criteria->add(ChartPeer::CREATED_AT, $this->created_at);
		if ($this->isColumnModified(ChartPeer::LAST_MODIFIED_AT)) $criteria->add(ChartPeer::LAST_MODIFIED_AT, $this->last_modified_at);
		if ($this->isColumnModified(ChartPeer::TYPE)) $criteria->add(ChartPeer::TYPE, $this->type);
		if ($this->isColumnModified(ChartPeer::METADATA)) $criteria->add(ChartPeer::METADATA, $this->metadata);
		if ($this->isColumnModified(ChartPeer::DELETED)) $criteria->add(ChartPeer::DELETED, $this->deleted);
		if ($this->isColumnModified(ChartPeer::DELETED_AT)) $criteria->add(ChartPeer::DELETED_AT, $this->deleted_at);
		if ($this->isColumnModified(ChartPeer::AUTHOR_ID)) $criteria->add(ChartPeer::AUTHOR_ID, $this->author_id);
		if ($this->isColumnModified(ChartPeer::SHOW_IN_GALLERY)) $criteria->add(ChartPeer::SHOW_IN_GALLERY, $this->show_in_gallery);
		if ($this->isColumnModified(ChartPeer::LANGUAGE)) $criteria->add(ChartPeer::LANGUAGE, $this->language);
		if ($this->isColumnModified(ChartPeer::GUEST_SESSION)) $criteria->add(ChartPeer::GUEST_SESSION, $this->guest_session);
		if ($this->isColumnModified(ChartPeer::LAST_EDIT_STEP)) $criteria->add(ChartPeer::LAST_EDIT_STEP, $this->last_edit_step);
		if ($this->isColumnModified(ChartPeer::PUBLISHED_AT)) $criteria->add(ChartPeer::PUBLISHED_AT, $this->published_at);
		if ($this->isColumnModified(ChartPeer::PUBLIC_URL)) $criteria->add(ChartPeer::PUBLIC_URL, $this->public_url);

		return $criteria;
	}

	/**
	 * Builds a Criteria object containing the primary key for this object.
	 *
	 * Unlike buildCriteria() this method includes the primary key values regardless
	 * of whether or not they have been modified.
	 *
	 * @return     Criteria The Criteria object containing value(s) for primary key(s).
	 */
	public function buildPkeyCriteria()
	{
		$criteria = new Criteria(ChartPeer::DATABASE_NAME);
		$criteria->add(ChartPeer::ID, $this->id);

		return $criteria;
	}

	/**
	 * Returns the primary key for this object (row).
	 * @return     string
	 */
	public function getPrimaryKey()
	{
		return $this->getId();
	}

	/**
	 * Generic method to set the primary key (id column).
	 *
	 * @param      string $key Primary key.
	 * @return     void
	 */
	public function setPrimaryKey($key)
	{
		$this->setId($key);
	}

	/**
	 * Returns true if the primary key for this object is null.
	 * @return     boolean
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
	 * @param      object $copyObj An object of Chart (or compatible) type.
	 * @param      boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
	 * @param      boolean $makeNew Whether to reset autoincrement PKs and make the object new.
	 * @throws     PropelException
	 */
	public function copyInto($copyObj, $deepCopy = false, $makeNew = true)
	{
		$copyObj->setTitle($this->getTitle());
		$copyObj->setTheme($this->getTheme());
		$copyObj->setCreatedAt($this->getCreatedAt());
		$copyObj->setLastModifiedAt($this->getLastModifiedAt());
		$copyObj->setType($this->getType());
		$copyObj->setMetadata($this->getMetadata());
		$copyObj->setDeleted($this->getDeleted());
		$copyObj->setDeletedAt($this->getDeletedAt());
		$copyObj->setAuthorId($this->getAuthorId());
		$copyObj->setShowInGallery($this->getShowInGallery());
		$copyObj->setLanguage($this->getLanguage());
		$copyObj->setGuestSession($this->getGuestSession());
		$copyObj->setLastEditStep($this->getLastEditStep());
		$copyObj->setPublishedAt($this->getPublishedAt());
		$copyObj->setPublicUrl($this->getPublicUrl());

		if ($deepCopy && !$this->startCopy) {
			// important: temporarily setNew(false) because this affects the behavior of
			// the getter/setter methods for fkey referrer objects.
			$copyObj->setNew(false);
			// store object hash to prevent cycle
			$this->startCopy = true;

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
	 * @param      boolean $deepCopy Whether to also copy all rows that refer (by fkey) to the current row.
	 * @return     Chart Clone of current object.
	 * @throws     PropelException
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
	 * @return     ChartPeer
	 */
	public function getPeer()
	{
		if (self::$peer === null) {
			self::$peer = new ChartPeer();
		}
		return self::$peer;
	}

	/**
	 * Declares an association between this object and a User object.
	 *
	 * @param      User $v
	 * @return     Chart The current object (for fluent API support)
	 * @throws     PropelException
	 */
	public function setUser(User $v = null)
	{
		if ($v === null) {
			$this->setAuthorId(NULL);
		} else {
			$this->setAuthorId($v->getId());
		}

		$this->aUser = $v;

		// Add binding for other direction of this n:n relationship.
		// If this object has already been added to the User object, it will not be re-added.
		if ($v !== null) {
			$v->addChart($this);
		}

		return $this;
	}


	/**
	 * Get the associated User object
	 *
	 * @param      PropelPDO Optional Connection object.
	 * @return     User The associated User object.
	 * @throws     PropelException
	 */
	public function getUser(PropelPDO $con = null)
	{
		if ($this->aUser === null && ($this->author_id !== null)) {
			$this->aUser = UserQuery::create()->findPk($this->author_id, $con);
			/* The following can be used additionally to
				guarantee the related object contains a reference
				to this object.  This level of coupling may, however, be
				undesirable since it could result in an only partially populated collection
				in the referenced object.
				$this->aUser->addCharts($this);
			 */
		}
		return $this->aUser;
	}


	/**
	 * Initializes a collection based on the name of a relation.
	 * Avoids crafting an 'init[$relationName]s' method name
	 * that wouldn't work when StandardEnglishPluralizer is used.
	 *
	 * @param      string $relationName The name of the relation to initialize
	 * @return     void
	 */
	public function initRelation($relationName)
	{
		if ('Job' == $relationName) {
			return $this->initJobs();
		}
	}

	/**
	 * Clears out the collJobs collection
	 *
	 * This does not modify the database; however, it will remove any associated objects, causing
	 * them to be refetched by subsequent calls to accessor method.
	 *
	 * @return     void
	 * @see        addJobs()
	 */
	public function clearJobs()
	{
		$this->collJobs = null; // important to set this to NULL since that means it is uninitialized
	}

	/**
	 * Initializes the collJobs collection.
	 *
	 * By default this just sets the collJobs collection to an empty array (like clearcollJobs());
	 * however, you may wish to override this method in your stub class to provide setting appropriate
	 * to your application -- for example, setting the initial array to the values stored in database.
	 *
	 * @param      boolean $overrideExisting If set to true, the method call initializes
	 *                                        the collection even if it is not empty
	 *
	 * @return     void
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
	 * If this Chart is new, it will return
	 * an empty collection or the current collection; the criteria is ignored on a new object.
	 *
	 * @param      Criteria $criteria optional Criteria object to narrow the query
	 * @param      PropelPDO $con optional connection object
	 * @return     PropelCollection|array Job[] List of Job objects
	 * @throws     PropelException
	 */
	public function getJobs($criteria = null, PropelPDO $con = null)
	{
		if(null === $this->collJobs || null !== $criteria) {
			if ($this->isNew() && null === $this->collJobs) {
				// return empty collection
				$this->initJobs();
			} else {
				$collJobs = JobQuery::create(null, $criteria)
					->filterByChart($this)
					->find($con);
				if (null !== $criteria) {
					return $collJobs;
				}
				$this->collJobs = $collJobs;
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
	 * @param      PropelCollection $jobs A Propel collection.
	 * @param      PropelPDO $con Optional connection object
	 */
	public function setJobs(PropelCollection $jobs, PropelPDO $con = null)
	{
		$this->jobsScheduledForDeletion = $this->getJobs(new Criteria(), $con)->diff($jobs);

		foreach ($jobs as $job) {
			// Fix issue with collection modified by reference
			if ($job->isNew()) {
				$job->setChart($this);
			}
			$this->addJob($job);
		}

		$this->collJobs = $jobs;
	}

	/**
	 * Returns the number of related Job objects.
	 *
	 * @param      Criteria $criteria
	 * @param      boolean $distinct
	 * @param      PropelPDO $con
	 * @return     int Count of related Job objects.
	 * @throws     PropelException
	 */
	public function countJobs(Criteria $criteria = null, $distinct = false, PropelPDO $con = null)
	{
		if(null === $this->collJobs || null !== $criteria) {
			if ($this->isNew() && null === $this->collJobs) {
				return 0;
			} else {
				$query = JobQuery::create(null, $criteria);
				if($distinct) {
					$query->distinct();
				}
				return $query
					->filterByChart($this)
					->count($con);
			}
		} else {
			return count($this->collJobs);
		}
	}

	/**
	 * Method called to associate a Job object to this object
	 * through the Job foreign key attribute.
	 *
	 * @param      Job $l Job
	 * @return     Chart The current object (for fluent API support)
	 */
	public function addJob(Job $l)
	{
		if ($this->collJobs === null) {
			$this->initJobs();
		}
		if (!$this->collJobs->contains($l)) { // only add it if the **same** object is not already associated
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
		$job->setChart($this);
	}


	/**
	 * If this collection has already been initialized with
	 * an identical criteria, it returns the collection.
	 * Otherwise if this Chart is new, it will return
	 * an empty collection; or if this Chart has previously
	 * been saved, it will retrieve related Jobs from storage.
	 *
	 * This method is protected by default in order to keep the public
	 * api reasonable.  You can provide public methods for those you
	 * actually need in Chart.
	 *
	 * @param      Criteria $criteria optional Criteria object to narrow the query
	 * @param      PropelPDO $con optional connection object
	 * @param      string $join_behavior optional join type to use (defaults to Criteria::LEFT_JOIN)
	 * @return     PropelCollection|array Job[] List of Job objects
	 */
	public function getJobsJoinUser($criteria = null, $con = null, $join_behavior = Criteria::LEFT_JOIN)
	{
		$query = JobQuery::create(null, $criteria);
		$query->joinWith('User', $join_behavior);

		return $this->getJobs($query, $con);
	}

	/**
	 * Clears the current object and sets all attributes to their default values
	 */
	public function clear()
	{
		$this->id = null;
		$this->title = null;
		$this->theme = null;
		$this->created_at = null;
		$this->last_modified_at = null;
		$this->type = null;
		$this->metadata = null;
		$this->deleted = null;
		$this->deleted_at = null;
		$this->author_id = null;
		$this->show_in_gallery = null;
		$this->language = null;
		$this->guest_session = null;
		$this->last_edit_step = null;
		$this->published_at = null;
		$this->public_url = null;
		$this->alreadyInSave = false;
		$this->alreadyInValidation = false;
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
	 * @param      boolean $deep Whether to also clear the references on all referrer objects.
	 */
	public function clearAllReferences($deep = false)
	{
		if ($deep) {
			if ($this->collJobs) {
				foreach ($this->collJobs as $o) {
					$o->clearAllReferences($deep);
				}
			}
		} // if ($deep)

		if ($this->collJobs instanceof PropelCollection) {
			$this->collJobs->clearIterator();
		}
		$this->collJobs = null;
		$this->aUser = null;
	}

	/**
	 * Return the string representation of this object
	 *
	 * @return string
	 */
	public function __toString()
	{
		return (string) $this->exportTo(ChartPeer::DEFAULT_STRING_FORMAT);
	}

} // BaseChart
