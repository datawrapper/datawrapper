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
        return get_plugin_path() . $this->getName() . '/';
    }

    private $packageInfo;

    public function getInfo() {
        if (!isset($this->packageInfo)) {
            if (!file_exists($this->getPath() . 'plugin.json') &&
                !file_exists($this->getPath() . 'package.json')) {
                return false;
            }
            if (file_exists($this->getPath() . 'plugin.json')) {
                $this->packageInfo = json_decode(
                    file_get_contents($this->getPath() . 'plugin.json')
                , true);
            } else {
                $this->packageInfo = json_decode(
                    file_get_contents($this->getPath() . 'package.json')
                , true);
            }
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

    public function __toString() {
        return $this->getName();
    }

    public function getLastModifiedTime($as_timestamp = false) {
        if (isset($this->__lastModTime)) return $this->__lastModTime;
        $lastm = 0;
        $path = get_plugin_path() . $this->getId() . '/';

        if (defined("GLOB_BRACE")) {
            $files = array_filter(glob('{'.$path.'*,'.$path.'*/*,'.$path.'*/*/*}', GLOB_BRACE));
            foreach ($files as $file) {
                if (strpos($file, '/locale/') > 0) continue; // ignore locales file
                $lm = filemtime($file);
                if ($lm > $lastm) $lastm = $lm;
            }
        } else {
            if (file_exists($path . 'plugin.json')) {
                $lastm = filemtime($path . 'plugin.json');
            } elseif (file_exists($path . 'package.json')) {
                $lastm = filemtime($path . 'package.json');
            } else {
                $lastm = 0;
            }
        }

        $this->__lastModTime = strftime('%F %H:%M:%S', $lastm);
        $this->__lastModTimeTS = $lastm;
        return $as_timestamp ? $this->__lastModTimeTS : $this->__lastModTime;
    }

    public function setIsPrivate($v) {
        if ($v != $this->getIsPrivate()) {
            DatawrapperHooks::execute(DatawrapperHooks::PLUGIN_SET_PRIVATE, $this);
        }
        parent::setIsPrivate($v);
    }

} // Plugin
