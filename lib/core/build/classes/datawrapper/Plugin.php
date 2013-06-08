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
        return ROOT_PATH . 'plugins/' . $this->getName() . '/plugin.php';
    }

} // Plugin
