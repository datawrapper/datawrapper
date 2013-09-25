<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license		 MIT License
 */

require_once dirname(__FILE__) . '/GeneratorConfig.php';
require_once dirname(__FILE__) . '/GeneratorConfigInterface.php';
require_once dirname(__FILE__) . '/../platform/PropelPlatformInterface.php';
require_once dirname(__FILE__) . '/../platform/SqlitePlatform.php';

/**
 * @package propel.generator.config
 */
class QuickGeneratorConfig implements GeneratorConfigInterface
{
    protected $builders = array(
        'peer'					=> 'PHP5PeerBuilder',
        'object'				=> 'PHP5ObjectBuilder',
        'objectstub'		    => 'PHP5ExtensionObjectBuilder',
        'peerstub'			    => 'PHP5ExtensionPeerBuilder',
        'objectmultiextend'     => 'PHP5MultiExtendObjectBuilder',
        'tablemap'			    => 'PHP5TableMapBuilder',
        'query'					=> 'QueryBuilder',
        'querystub'			    => 'ExtensionQueryBuilder',
        'queryinheritance'      => 'QueryInheritanceBuilder',
        'queryinheritancestub'  => 'ExtensionQueryInheritanceBuilder',
        'interface'			    => 'PHP5InterfaceBuilder',
        'node'					=> 'PHP5NodeBuilder',
        'nodepeer'			    => 'PHP5NodePeerBuilder',
        'nodestub'			    => 'PHP5ExtensionNodeBuilder',
        'nodepeerstub'	        => 'PHP5ExtensionNodePeerBuilder',
        'nestedset'			    => 'PHP5NestedSetBuilder',
        'nestedsetpeer'         => 'PHP5NestedSetPeerBuilder',
    );

    protected $buildProperties  = array();

    private $generatorConfig    = null;

    private $configuredPlatform = null;

    public function __construct(PropelPlatformInterface $platform = null)
    {
        $this->configuredPlatform = $platform;
        $this->setBuildProperties($this->parsePseudoIniFile(dirname(__FILE__) . '/../../default.properties'));
    }

    /**
     * Why would Phing use ini while it so fun to invent a new format? (sic)
     * parse_ini_file() doesn't work for Phing property files
     */
    protected function parsePseudoIniFile($filepath)
    {
        $properties = array();
        if (($lines = @file($filepath)) === false) {
            throw new Exception("Unable to parse contents of $filepath");
        }
        foreach ($lines as $line) {
                $line = trim($line);
                if ($line == "" || $line{0} == '#' || $line{0} == ';') continue;
                $pos = strpos($line, '=');
                $property = trim(substr($line, 0, $pos));
                $value = trim(substr($line, $pos + 1));
                if ($value === "true") {
                    $value = true;
                } elseif ($value === "false") {
                    $value = false;
                }
                $properties[$property] = $value;
        }

        return $properties;
    }

    /**
     * Gets a configured data model builder class for specified table and based on type.
     *
     * @param  Table            $table
     * @param  string           $type  The type of builder ('ddl', 'sql', etc.)
     * @return DataModelBuilder
     */
    public function getConfiguredBuilder(Table $table, $type)
    {
        $class = $this->builders[$type];
        require_once dirname(__FILE__) . '/../builder/om/' . $class . '.php';
        $builder = new $class($table);
        $builder->setGeneratorConfig($this);

        return $builder;
    }

    /**
    * Gets a configured Pluralizer class.
    *
    * @return     Pluralizer
    */
    public function getConfiguredPluralizer()
    {
        require_once dirname(__FILE__) . '/../builder/util/DefaultEnglishPluralizer.php';

        return new DefaultEnglishPluralizer();
    }

    /**
     * Parses the passed-in properties, renaming and saving eligible properties in this object.
     *
     * Renames the propel.xxx properties to just xxx and renames any xxx.yyy properties
     * to xxxYyy as PHP doesn't like the xxx.yyy syntax.
     *
     * @param mixed $props Array or Iterator
     */
    public function setBuildProperties($props)
    {
        $this->buildProperties = array();

        $renamedPropelProps = array();
        foreach ($props as $key => $propValue) {
            if (strpos($key, "propel.") === 0) {
                $newKey = substr($key, strlen("propel."));
                $j = strpos($newKey, '.');
                while ($j !== false) {
                    $newKey =	 substr($newKey, 0, $j) . ucfirst(substr($newKey, $j + 1));
                    $j = strpos($newKey, '.');
                }
                $this->setBuildProperty($newKey, $propValue);
            }
        }
    }

    /**
     * Gets a specific propel (renamed) property from the build.
     *
     * @param  string $name
     * @return mixed
     */
    public function getBuildProperty($name)
    {
        return isset($this->buildProperties[$name]) ? $this->buildProperties[$name] : null;
    }

    /**
     * Sets a specific propel (renamed) property from the build.
     *
     * @param string $name
     * @param mixed  $value
     */
    public function setBuildProperty($name, $value)
    {
        $this->buildProperties[$name] = $value;
    }

    /**
     * {@inheritdoc}
     */
    public function getConfiguredPlatform(PDO $con = null, $database = null)
    {
        if (null === $this->configuredPlatform) {
            return new SqlitePlatform($con);
        }

        $this->configuredPlatform->setConnection($con);

        return $this->configuredPlatform;
    }

    /**
     * {@inheritdoc}
     */
    public function getConfiguredBehavior($name)
    {
        $this->initGeneratorConfig();

        return $this->generatorConfig->getConfiguredBehavior($name);
    }

    private function initGeneratorConfig()
    {
        if (null === $this->generatorConfig) {
            $this->generatorConfig = new GeneratorConfig();
            foreach ($this->buildProperties as $key => $value) {
                $this->generatorConfig->setBuildProperty($key, $value);
            }
        }
    }
}
