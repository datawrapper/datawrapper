<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../exception/EngineException.php';
require_once dirname(__FILE__) . '/Database.php';

/**
 * A class for holding application data structures.
 *
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Leon Messerschmidt <leon@opticode.co.za> (Torque)
 * @author     John McNally <jmcnally@collab.net> (Torque)
 * @author     Daniel Rall <dlr@finemaltcoding.com> (Torque)
 * @version    $Revision$
 * @package    propel.generator.model
 */
class AppData
{

    /**
     * The list of databases for this application.
     * @var        array Database[]
     */
    private $dbList = array();

    /**
     * The platform class for our database(s).
     * @var        string
     */
    private $platform;

    /**
     * The generator configuration
     * @var        GeneratorConfig
     */
    protected $generatorConfig;

    /**
     * Name of the database. Only one database definition
     * is allowed in one XML descriptor.
     */
    private $name;

    /**
     * Flag to ensure that initialization is performed only once.
     * @var        boolean
     */
    private $isInitialized = false;

    /**
     * Creates a new instance for the specified database type.
     *
     * @param PropelPlatformInterface $platform The default platform object to use for any databases added to this application model.
     */
    public function __construct(PropelPlatformInterface $defaultPlatform = null)
    {
        if (null !== $defaultPlatform) {
            $this->platform = $defaultPlatform;
        }
    }

    /**
     * Sets the platform object to use for any databases added to this application model.
     *
     * @param PropelPlatformInterface $defaultPlatform
     */
    public function setPlatform(PropelPlatformInterface $defaultPlatform)
    {
        $this->platform = $defaultPlatform;
    }

    /**
     * Gets the platform object to use for any databases added to this application model.
     *
     * @return Platform
     */
    public function getPlatform()
    {
        return $this->platform;
    }

    /**
     * Set the generator configuration
     *
     * @param GeneratorConfigInterface $generatorConfig
     */
    public function setGeneratorConfig(GeneratorConfigInterface $generatorConfig)
    {
        $this->generatorConfig = $generatorConfig;
    }

    /**
     * Get the generator configuration
     *
     * @return GeneratorConfig
     */
    public function getGeneratorConfig()
    {
        return $this->generatorConfig;
    }

    /**
     * Set the name of the database.
     *
     * @param      name of the database.
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * Get the name of the database.
     *
     * @return String name
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Get the short name of the database (without the '-schema' postfix).
     *
     * @return String name
     */
    public function getShortName()
    {
        return str_replace("-schema", "", $this->name);
    }

    /**
     * Return an array of all databases
     *
     * @return Array of Database objects
     */
    public function getDatabases($doFinalInit = true)
    {
        // this is temporary until we'll have a clean solution
        // for packaging datamodels/requiring schemas
        if ($doFinalInit) {
            $this->doFinalInitialization();
        }

        return $this->dbList;
    }

    /**
     * Returns whether this application has multiple databases.
     *
     * @return boolean True if the application has multiple databases
     */
    public function hasMultipleDatabases()
    {
        return (count($this->dbList) > 1);
    }

    /**
     * Return the database with the specified name.
     *
     * @param      name database name
     * @return A Database object.  If it does not exist it returns null
     */
    public function getDatabase($name = null, $doFinalInit = true)
    {
        // this is temporary until we'll have a clean solution
        // for packaging datamodels/requiring schemas
        if ($doFinalInit) {
            $this->doFinalInitialization();
        }

        if ($name === null) {
            return $this->dbList[0];
        }

        for ($i=0,$size=count($this->dbList); $i < $size; $i++) {
            $db = $this->dbList[$i];
            if ($db->getName() === $name) {
                return $db;
            }
        }

        return null;
    }

    /**
     * Checks whether a database with the specified nam exists in this AppData
     *
     * @param      name database name
     * @return boolean
     */
    public function hasDatabase($name)
    {
        foreach ($this->dbList as $db) {
            if ($db->getName() === $name) {
                return true;
            }
        }

        return false;
    }

    /**
     * Add a database to the list and sets the AppData property to this
     * AppData
     *
     * @param Datebase|string $db the database to add
     *
     * @return Database
     */
    public function addDatabase($db)
    {
        if ($db instanceof Database) {
            $db->setAppData($this);
            if ($db->getPlatform() === null) {
                if ($config = $this->getGeneratorConfig()) {
                    $pf = $config->getConfiguredPlatform(null, $db->getName());
                    $db->setPlatform($pf ? $pf : $this->platform);
                } else {
                    $db->setPlatform($this->platform);
                }
            }
            $this->dbList[] = $db;

            return $db;
        } else {
            // XML attributes array / hash
            $d = new Database();
            $d->setAppData($this);
            $d->loadFromXML($db);

            return $this->addDatabase($d); // calls self w/ different param type
        }

    }

    public function doFinalInitialization()
    {
        if (!$this->isInitialized) {
            for ($i=0, $size=count($this->dbList); $i < $size; $i++) {
                $this->dbList[$i]->doFinalInitialization();
            }
            $this->isInitialized = true;
        }
    }

    /**
     * Merge other appData objects into this object
     *
     * @param array[AppData] $ads
     *
     * @throws Exception
     */
    public function joinAppDatas($ads)
    {
        foreach ($ads as $appData) {
            foreach ($appData->getDatabases(false) as $addDb) {
                $addDbName = $addDb->getName();
                if ($this->hasDatabase($addDbName)) {
                    $db = $this->getDatabase($addDbName, false);
                    // temporarily reset database namespace to avoid double namespace decoration (see ticket #1355)
                    $namespace = $db->getNamespace();
                    $db->setNamespace(null);
                    // join tables
                    foreach ($addDb->getTables() as $addTable) {
                        if ($db->getTable($addTable->getName())) {
                            throw new Exception(sprintf('Duplicate table found: %s.', $addTable->getName()));
                        }
                        $db->addTable($addTable);
                    }
                    // join database behaviors
                    foreach ($addDb->getBehaviors() as $addBehavior) {
                        if (!$db->hasBehavior($addBehavior->getName())) {
                            $db->addBehavior($addBehavior);
                        }
                    }
                    // restore the database namespace
                    $db->setNamespace($namespace);
                } else {
                    $this->addDatabase($addDb);
                }
            }
        }
    }

    /**
     * Returns the number of tables in all the databases of this AppData object
     *
     * @return integer
     */
    public function countTables()
    {
        $nb = 0;
        foreach ($this->getDatabases() as $database) {
            $nb += $database->countTables();
        }

        return $nb;
    }

    /**
     * Creates a string representation of this AppData.
     * The representation is given in xml format.
     *
     * @return string Representation in xml format
     */
    public function toString()
    {
        $result = "<app-data>\n";
        foreach ($this->dbList as $dbList) {
            $result .= $dbList->toString();
        }
        if ($this->dbList) {
            $result .= "\n";
        }
        $result .= "</app-data>";

        return $result;
    }

    /**
     * Magic string method
     * @see toString()
     */
    public function __toString()
    {
        return $this->toString();
    }
}
