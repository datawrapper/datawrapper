<?php

class DatawrapperPlugin {

	/**
	* Enable the plugin,
	* Check if there is a static folder,
	* Copy the content to www/static/plugins/<plugin_name>/
	*/
	public function install() {
		$plugin = PluginQuery::create()->findPK($this->getName());
		if (empty($plugin)) {
			$plugin = new Plugin();
			$plugin->setId($this->getName());
		}
		$plugin->setEnabled(true);
		$plugin->setInstalledAt(time());
		$plugin->save();
	}

	/**
	* Publish static files (CDN...)
	*/
	public function publish() {
		throw new Exception("need to be implemented");
	}

	/** register events */
	public function init() {
		throw new Exception("need to be implemented");
	}

	/**
	* Disable the plugin
	*/
	public function uninstall() {
		$plugin = PluginQuery::create()->findPK(getName());
		$plugin->setEnabled(false);
		$plugin->save();
	}

	/*
	 * returns the version of the plugin
	 */
	public function getVersion() {
		$reflector = new ReflectionClass(get_class($this));
		$dirname   = dirname($reflector->getFileName());
		$meta      = json_decode(file_get_contents($dirname . "/package.json"),true);
		return $meta['version'];
	}

	/*
	 * returns the name (id) of this plugin
	 */
	public function getName() {
		$reflector = new ReflectionClass(get_class($this));
		$dirname   = dirname($reflector->getFileName());
		return substr($dirname, strrpos($dirname, DIRECTORY_SEPARATOR)+1);
	}

	/*
	 * returns the plugin specific configuration (from config.yaml)
	 */
	public function getConfig() {
		if (isset($GLOBALS['dw_config']['plugins'][$this->getName()])) {
			return $GLOBALS['dw_config']['plugins'][$this->getName()];
		}
		return array();
	}
}

