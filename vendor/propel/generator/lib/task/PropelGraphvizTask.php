<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once 'task/AbstractPropelDataModelTask.php';
require_once 'model/AppData.php';
require_once 'util/PropelDotGenerator.php';

/**
 * A task to generate Graphviz dot files from Propel datamodel.
 *
 * @author     Mark Kimsal
 * @author     Toni Uebernickel <tuebernickel@gmail.com>
 * @version    $Revision$
 * @package    propel.generator.task
 */
class PropelGraphvizTask extends AbstractPropelDataModelTask
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
	 * Name of the output directory.
	 */
	private $outDir;


	/**
	 * Set the sqldbmap.
	 * @param      PhingFile $sqldbmap The db map.
	 */
	public function setOutputDirectory(PhingFile $out)
	{
		if (!$out->exists()) {
			$out->mkdirs();
		}
		$this->outDir = $out;
	}


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


	public function main()
	{
		foreach ($this->getDataModels() as $dataModel) {
            foreach ($dataModel->getDatabases() as $database) {
                 $this->log("db: " . $database->getName());
                 $this->writeDot(PropelDotGenerator::create($database), $this->outDir, $database->getName());
            }
		}
	}


	/**
	 * probably insecure
	 */
	function writeDot($dotSyntax, PhingFile $outputDir, $baseFilename) {
		$file = new PhingFile($outputDir, $baseFilename . '.schema.dot');
		$this->log("Writing dot file to " . $file->getAbsolutePath());
		file_put_contents($file->getAbsolutePath(), $dotSyntax);
	}

}
