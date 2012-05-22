<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once 'phing/Task.php';

/**
 * This Task lists the migrations yet to be executed
 *
 * @author     Francois Zaninotto
 * @package    propel.generator.task
 */
abstract class BasePropelMigrationTask extends Task
{
	/**
	 * Destination directory for results of template scripts.
	 * @var        PhingFile
	 */
	protected $outputDirectory;

	/**
	 * An initialized GeneratorConfig object containing the converted Phing props.
	 *
	 * @var        GeneratorConfig
	 */
	protected $generatorConfig;

	/**
	 * The migration table name
	 * @var string
	 */
	protected $migrationTable = 'propel_migration';

	/**
	 * Set the migration Table name
	 *
	 * @param string $migrationTable
	 */
	public function setMigrationTable($migrationTable)
	{
		$this->migrationTable = $migrationTable;
	}

	/**
	 * Get the migration Table name
	 *
	 * @return string
	 */
	public function getMigrationTable()
	{
		return $this->migrationTable;
	}

	/**
	 * [REQUIRED] Set the output directory. It will be
	 * created if it doesn't exist.
	 * @param      PhingFile $outputDirectory
	 * @return     void
	 * @throws     Exception
	 */
	public function setOutputDirectory(PhingFile $outputDirectory) {
		try {
			if (!$outputDirectory->exists()) {
				$this->log("Output directory does not exist, creating: " . $outputDirectory->getPath(),Project::MSG_VERBOSE);
				if (!$outputDirectory->mkdirs()) {
					throw new IOException("Unable to create Ouptut directory: " . $outputDirectory->getAbsolutePath());
				}
			}
			$this->outputDirectory = $outputDirectory->getCanonicalPath();
		} catch (IOException $ioe) {
			throw new BuildException($ioe);
		}
	}

	/**
	 * Get the output directory.
	 * @return     string
	 */
	public function getOutputDirectory() {
		return $this->outputDirectory;
	}

	/**
	 * Gets the GeneratorConfig object for this task or creates it on-demand.
	 * @return     GeneratorConfig
	 */
	protected function getGeneratorConfig()
	{
		if ($this->generatorConfig === null) {
			$this->generatorConfig = new GeneratorConfig();
			$this->generatorConfig->setBuildProperties($this->getProject()->getProperties());
		}
		return $this->generatorConfig;
	}

}