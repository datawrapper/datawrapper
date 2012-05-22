<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once 'phing/Task.php';
require_once dirname(__FILE__) . '/../util/PropelSQLParser.php';

/**
 * Executes all SQL files referenced in the sqldbmap file against their mapped databases.
 *
 * This task uses an SQL -> Database map in the form of a properties
 * file to insert each SQL file listed into its designated database.
 *
 * @author     Hans Lellelid <hans@xmpl.org>
 * @author     Dominik del Bondio
 * @author     Jeff Martin <jeff@custommonkey.org> (Torque)
 * @author     Michael McCallum <gholam@xtra.co.nz> (Torque)
 * @author     Tim Stephenson <tim.stephenson@sybase.com> (Torque)
 * @author     Jason van Zyl <jvanzyl@apache.org> (Torque)
 * @author     Martin Poeschl <mpoeschl@marmot.at> (Torque)
 * @version    $Revision$
 * @package    propel.generator.task
 */
class PropelSQLExec extends Task
{

	private $goodSql = 0;
	private $totalSql = 0;

	//private static $errorActions = array("continue", "stop", "abort");

	/** PDO Database connection */
	private $conn = null;

	/** Autocommit flag. Default value is false */
	private $autocommit = false;

	/** DB url. */
	private $url = null;

	/** User name. */
	private $userId = null;

	/** Password */
	private $password = null;

	/** Action to perform if an error is found */
	private $onError = "abort";

	/** Src directory for the files listed in the sqldbmap. */
	private $srcDir;

	/** Properties file that maps an individual SQL file to a database. */
	private $sqldbmap;

	/**
	 * The buildtime connection settings
	 *
	 * @var        Array
	 */
	protected $buildConnections = array();

	/**
	 * Set the sqldbmap properties file.
	 *
	 * @param      sqldbmap filename for the sqldbmap
	 */
	public function setSqlDbMap($sqldbmap)
	{
		$this->sqldbmap = $this->project->resolveFile($sqldbmap);
	}

	/**
	 * Get the sqldbmap properties file.
	 *
	 * @return     filename for the sqldbmap
	 */
	public function getSqlDbMap()
	{
		return $this->sqldbmap;
	}

	/**
	 * Set the buildtime connection settings.
	 *
	 * @param      array $buildConnections
	 */
	public function setBuildConnections($buildConnections)
	{
		$this->buildConnections = $buildConnections;
	}

	/**
	 * Get the buildtime connection settings.
	 *
	 * @return     array $buildConnections
	 */
	public function getBuildConnections()
	{
		return $this->buildConnections;
	}

	/**
	 * Get the buildtime connection settings for a given database name.
	 *
	 * @param      string $database
	 * @return     array $buildConnections
	 */
	public function getBuildConnection($database)
	{
		if (!isset($this->buildConnections[$database])) {
			// fallback to default connection settings from build.properties
			return array(
				'dsn'      => $this->url,
				'user'     => $this->userId,
				'password' => $this->password,
			);
		}
		return $this->buildConnections[$database];
	}

	/**
	 * Set the src directory for the sql files listed in the sqldbmap file.
	 *
	 * @param      PhingFile $srcDir sql source directory
	 */
	public function setSrcDir(PhingFile $srcDir)
	{
		$this->srcDir = $srcDir;
	}

	/**
	 * Get the src directory for the sql files listed in the sqldbmap file.
	 *
	 * @return     PhingFile SQL Source directory
	 */
	public function getSrcDir()
	{
		return $this->srcDir;
	}

	/**
	 * Set the DB connection url.
	 *
	 * @param      string $url connection url
	 */
	public function setUrl($url)
	{
		$this->url = $url;
	}

	/**
	 * Set the user name for the DB connection.
	 *
	 * @param      string $userId database user
	 * @deprecated Specify userid in the DSN URL.
	 */
	public function setUserid($userId)
	{
		$this->userId = $userId;
	}

	/**
	 * Set the password for the DB connection.
	 *
	 * @param      string $password database password
	 * @deprecated Specify password in the DSN URL.
	 */
	public function setPassword($password)
	{
		$this->password = $password;
	}

	/**
	 * Set the autocommit flag for the DB connection.
	 *
	 * @param      boolean $autocommit the autocommit flag
	 */
	public function setAutoCommit($autocommit)
	{
		$this->autocommit = (boolean) $autocommit;
	}

	/**
	 * Set the action to perform onerror
	 *
	 * @param      string $action
	 */
	public function setOnerror($action)
	{
		$this->onError = $action;
	}

	/**
	 * Load the sql file and then execute it
	 *
	 * @throws     BuildException
	 */
	public function main()
	{
		$conf = new GeneratorConfig();
		$conf->setBuildProperties($this->getProject()->getProperties());
		$this->setBuildConnections($conf->getBuildConnections());

		if ($this->sqldbmap === null || $this->getSqlDbMap()->exists() === false) {
			throw new BuildException("You haven't provided an sqldbmap, or "
					. "the one you specified doesn't exist: " . $this->sqldbmap->getPath());
		}

		if ($this->url === null) {
			throw new BuildException("DSN url attribute must be set!");
		}

		// get an ordered list of SQL files to execute
		$databases = $this->getFilesToExecute();

		$this->log(sprintf('Reading SQL files...'));
		foreach ($databases as $database => $files) {
			$statements[$database] = array();
			foreach ($files as $fileName) {
				$fullFileName = $this->srcDir ? $this->srcDir . DIRECTORY_SEPARATOR . $fileName : $fileName;
				if (file_exists($fullFileName)) {
					$this->log(sprintf('  Loading statements from "%s"', $fullFileName));
					$fileStatements = PropelSQLParser::parseFile($fullFileName);
					$this->log(sprintf('    %d statements to execute', count($fileStatements)), Project::MSG_VERBOSE);
					$statements[$database] = array_merge($statements[$database], $fileStatements);
				} else {
					$this->log(sprintf('File "%s" in sqldbmap does not exist, skipping it.', $fullFileName));
				}
			}
		}

		$successfullStatements = 0;
		$this->log(sprintf('Executing SQL statements...'));
		foreach ($statements as $database => $statementList) {
			$successfullStatements += $this->insertDatabaseSqlFiles($database, $statementList);
		}

		$this->log(sprintf('SQL execution complete. %d statements successfully executed.', $successfullStatements));
	}

	protected function getFilesToExecute()
	{
		$map = new Properties();
		try {
			$map->load($this->getSqlDbMap());
		} catch (IOException $ioe) {
			throw new BuildException("Cannot open and process the sqldbmap!");
		}
		$databases = array();
		foreach ($map->getProperties() as $sqlfile => $database) {

			if (!isset($databases[$database])) {
				$databases[$database] = array();
			}

			// We want to make sure that the base schemas
			// are inserted first.
			if (strpos($sqlfile, "schema.sql") !== false) {
				// add to the beginning of the array
				array_unshift($databases[$database], $sqlfile);
			} else {
				// add to the end of the array
				array_push($databases[$database], $sqlfile);
			}
		}

		return $databases;
	}

	/**
	 * Executes a set of SQL statements into the target database.
	 *
	 * @param      string $database The name of the database, as defined in the build connections
	 * @param      array $statements list of SQL statements (strings) to be executed
	 *
	 * @return integer the number of successful statements
	 */
	protected function insertDatabaseSqlFiles($database, $statements)
	{
		$buildConnection = $this->getBuildConnection($database);
		$dsn = str_replace("@DB@", $database, $buildConnection['dsn']);
		$this->log(sprintf('  Connecting to database "%s" using DSN "%s"', $database, $dsn));

		try {

			// Set user + password to null if they are empty strings or missing
			$username = isset($buildConnection['user']) && $buildConnection['user'] ? $buildConnection['user'] : null;
			$password = isset($buildConnection['password']) && $buildConnection['password'] ? $buildConnection['password'] : null;

			$this->conn = new PDO($dsn, $username, $password);
			$this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			// Process all statements
			foreach ($statements as $statement) {
				$this->execSQL($statement);
				if (!$this->autocommit) {
					$this->log("  Commiting transaction", Project::MSG_VERBOSE);
					$this->conn->commit();
				}
			}

		} catch (IOException $e) {
			if (!$this->autocommit && $this->conn !== null && $this->onError == "abort") {
				try {
					$this->conn->rollBack();
				} catch (PDOException $ex) {
					// do nothing.
					$this->log("  Rollback failed.");
				}
			}
			throw new BuildException($e);
		} catch (PDOException $e) {
			if (!$this->autocommit && $this->conn !== null && $this->onError == "abort") {
				try {
					$this->conn->rollBack();
				} catch (PDOException $ex) {
					// do nothing.
					$this->log("  Rollback failed");
				}
			}
			throw new BuildException($e);
		}

		$this->log(sprintf('  %d of %d SQL statements executed successfully', $this->goodSql, $this->totalSql));

		return $this->goodSql;
	}

	/**
	 * Execute a SQL statement using the current connection property.
	 *
	 * @param      string $sql SQL statement to execute
	 * @throws     PDOException
	 */
	protected function execSQL($sql)
	{
		// Check and ignore empty statements
		if (trim($sql) == "") {
			return;
		}

		try {
			$this->totalSql++;

			if (!$this->autocommit) $this->conn->beginTransaction();

			$stmt = $this->conn->prepare($sql);
			$this->log(sprintf('    Executing statement "%s"',$sql), Project::MSG_VERBOSE);
			$stmt->execute();
			$this->log(sprintf('    %d rows affected', $stmt->rowCount()), Project::MSG_VERBOSE);

			if (!$this->autocommit) $this->conn->commit();

			$this->goodSql++;
		} catch (PDOException $e) {
			$this->log("Failed to execute: " . $sql, Project::MSG_ERR);
			if ($this->onError != "continue") {
				throw $e;
			}
			$this->log($e->getMessage(), Project::MSG_ERR);
		}
	}

}

