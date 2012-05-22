<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once 'model/AppData.php';

/**
 * The task for building SQL DDL based on the XML datamodel.
 *
 * This class uses the new DDLBuilder classes instead of the Capsule PHP templates.
 *
 * @author     Hans Lellelid <hans@xmpl.org>
 * @package    propel.generator.task
 */
class PropelSQLTask extends AbstractPropelDataModelTask
{

	/**
	 * The properties file that maps an SQL file to a particular database.
	 * @var        PhingFile
	 */
	private $sqldbmap;

	/**
	 * Name of the database.
	 */
	private $database;

	/**
	 * Set the sqldbmap.
	 * @param      PhingFile $sqldbmap The db map.
	 */
	public function setSqlDbMap(PhingFile $sqldbmap)
	{
		$this->sqldbmap = $sqldbmap;
	}

	/**
	 * Get the sqldbmap.
	 * @return     PhingFile $sqldbmap.
	 */
	public function getSqlDbMap()
	{
		return $this->sqldbmap;
	}

	/**
	 * Set the database name.
	 * @param      string $database
	 */
	public function setDatabase($database)
	{
		$this->database = $database;
	}

	/**
	 * Get the database name.
	 * @return     string
	 */
	public function getDatabase()
	{
		return $this->database;
	}

	/**
	 * Create the sql -> database map.
	 *
	 * @throws     IOException - if unable to store properties
	 */
	protected function createSqlDbMap()
	{
		if ($this->getSqlDbMap() === null) {
			return;
		}

		// Produce the sql -> database map
		$sqldbmap = new Properties();

		// Check to see if the sqldbmap has already been created.
		if ($this->getSqlDbMap()->exists()) {
			$sqldbmap->load($this->getSqlDbMap());
		}

		if ($this->packageObjectModel) {
			// in this case we'll get the sql file name from the package attribute
			$dataModels = $this->packageDataModels();
			foreach ($dataModels as $package => $dataModel) {
				foreach ($dataModel->getDatabases() as $database) {
					$name = ($package ? $package . '.' : '') . 'schema.xml';
					$sqlFile = $this->getMappedFile($name);
					$sqldbmap->setProperty($sqlFile->getName(), $database->getName());
				}
			}
		} else {
			// the traditional way is to map the schema.xml filenames
			$dmMap = $this->getDataModelDbMap();
			foreach (array_keys($dmMap) as $dataModelName) {
				$sqlFile = $this->getMappedFile($dataModelName);
				if ($this->getDatabase() === null) {
					$databaseName = $dmMap[$dataModelName];
				} else {
					$databaseName = $this->getDatabase();
				}
				$sqldbmap->setProperty($sqlFile->getName(), $databaseName);
			}
		}

		try {
			$sqldbmap->store($this->getSqlDbMap(), "Sqlfile -> Database map");
		} catch (IOException $e) {
			throw new IOException("Unable to store properties: ". $e->getMessage());
		}
	}

	public function main() {

		$this->validate();

		if (!$this->mapperElement) {
			throw new BuildException("You must use a <mapper/> element to describe how names should be transformed.");
		}

		if ($this->packageObjectModel) {
			$dataModels = $this->packageDataModels();
		} else {
			$dataModels = $this->getDataModels();
		}

		// 1) first create a map of filenames to databases; this is used by other tasks like
		// the SQLExec task.
		$this->createSqlDbMap();

		// 2) Now actually create the DDL based on the datamodel(s) from XML schema file.
		$targetDatabase = $this->getTargetDatabase();

		$generatorConfig = $this->getGeneratorConfig();

		foreach ($dataModels as $package => $dataModel) {

			foreach ($dataModel->getDatabases() as $database) {

				$platform = $database->getPlatform();
				if (!$this->packageObjectModel) {
					$name = $dataModel->getName();
				} else {
					$name = ($package ? $package . '.' : '') . 'schema.xml';
				}
				$outFile = $this->getMappedFile($name);
				$absPath = $outFile->getAbsolutePath();
				if ($this->getGeneratorConfig()->getBuildProperty('disableIdentifierQuoting')) {
					$platform->setIdentifierQuoting(false);
				}
				$this->log('Using ' . get_class($platform), Project::MSG_VERBOSE);
				$ddl = $platform->getAddTablesDDL($database);
				if (file_exists($absPath) && $ddl == file_get_contents($absPath)) {
					$this->log('[Unchanged] ' . $outFile->getName());
				} else {
					$this->getWarnings($database, $platform);
					$this->log('Writing to SQL file: ' . $outFile->getPath());
					file_put_contents($absPath, $ddl);
				}

			} // foreach database
		} //foreach datamodels

	} // main()

	public function getWarnings(Database $database, PropelPLatformInterface $platform)
	{
		foreach ($database->getTablesForSql() as $table) {
			foreach ($table->getForeignKeys() as $fk) {

				if ($platform instanceof MssqlPlatform && $fk->hasOnUpdate() && $fk->getOnUpdate() == ForeignKey::SETNULL) {
					// there may be others that also won't work
					// we have to skip this because it's unsupported.
						$this->log(sprintf(
							'Ignoring the "ON UPDATE SET NULL" option for "%s" fk on "%s" table (unsupported by MSSQL).',
							$fk->getLocalColumnNames(),
							$table->getName()
						), Project::MSG_WARN);
				}

				if ($platform instanceof MssqlPlatform && $fk->hasOnDelete() && $fk->getOnDelete() == ForeignKey::SETNULL) {
					// there may be others that also won't work
					// we have to skip this because it's unsupported.
					$this->log(sprintf(
						'Ignoring the "ON DELETE SET NULL" option for "%s" fk on "%s" table (unsupported by MSSQL).',
						$fk->getLocalColumnNames(),
						$table->getName()
					), Project::MSG_WARN);
				}

				if ($platform instanceof OraclePlatform && $fk->hasOnUpdate()) {
					// there may be others that also won't work
					// we have to skip this because it's unsupported.
					$this->log(sprintf(
						'Ignoring the "ON UPDATE" option for "%s" fk on "%s" table (unsupported by current Oracle adapter).',
						$fk->getLocalColumnNames(),
						$table->getName()
					), Project::MSG_WARN);
				}
			}
		}
	}

	/**
	 * Packages the datamodels to one datamodel per package
	 *
	 * This applies only when the the packageObjectModel option is set. We need to
	 * re-package the datamodels to allow the database package attribute to control
	 * which tables go into which SQL file.
	 *
	 * @return     array The packaged datamodels
	 */
	protected function packageDataModels() {

		static $packagedDataModels;

		if (is_null($packagedDataModels)) {

			$dataModels = $this->getDataModels();
			$dataModel = array_shift($dataModels);
			$packagedDataModels = array();

			$platform = $this->getGeneratorConfig()->getConfiguredPlatform();

			foreach ($dataModel->getDatabases() as $db) {
				foreach ($db->getTables() as $table) {
					$package = $table->getPackage();
					if (!isset($packagedDataModels[$package])) {
						$dbClone = $this->cloneDatabase($db);
						$dbClone->setPackage($package);
						$ad = new AppData($platform);
						$ad->setGeneratorConfig($this->getGeneratorConfig());
						$ad->setName($dataModel->getName());
						$ad->addDatabase($dbClone);
						$packagedDataModels[$package] = $ad;
					}
					$packagedDataModels[$package]->getDatabase($db->getName())->addTable($table);
				}
			}
		}
		return $packagedDataModels;
	}

	protected function cloneDatabase($db) {

		$attributes = array (
			'name' => $db->getName(),
			'baseClass' => $db->getBaseClass(),
			'basePeer' => $db->getBasePeer(),
			'defaultIdMethod' => $db->getDefaultIdMethod(),
			'defaultPhpNamingMethod' => $db->getDefaultPhpNamingMethod(),
			'defaultTranslateMethod' => $db->getDefaultTranslateMethod(),
			'heavyIndexing' => $db->getHeavyIndexing(),
		);

		$clone = new Database();
		$clone->loadFromXML($attributes);
		return $clone;
	}
}
