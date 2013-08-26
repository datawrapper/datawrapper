<?php



/**
 * Skeleton subclass for representing a row from the 'plugin' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Plugin extends BasePlugin {

    public function getName() {
        return $this->getId();
    }

    public function getClassName() {
        return 'DatawrapperPlugin_' . str_replace(' ', '', ucwords(str_replace('-', ' ', $this->getName())));
    }

    public function getPath() {
        return ROOT_PATH . 'plugins/' . $this->getName() . '/';
    }

    private $packageInfo;

    public function getInfo() {
        if (!isset($this->packageInfo)) {
            if (!file_exists($this->getPath() . 'package.json')) {
                return false;
            }
            $this->packageInfo = json_decode(
                file_get_contents($this->getPath() . 'package.json')
            , true);
            if (!isset($this->packageInfo['dependencies'])) $this->packageInfo['dependencies'] = array();
        }
        return $this->packageInfo;
    }

    public function getDependencies() {
        $info = $this->getInfo();
        if (isset($info['dependencies'])) {
            return $info['dependencies'];
        }
        return false;
    }

    /*
     * return plugin repository
     */
    public function getRepository() {
        $meta = $this->getInfo();
        if (isset($meta['repository'])) {
            return $meta['repository'];
        }
        return false;
    }
    
} // Plugin
