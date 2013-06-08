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
		$plugin->save();
	}

	/**
	* Publish static files (CDN...)
	*/
	public function publish() {
		throw new Exception("need to be implemented");
	}

	/** register events */
	public function bind($params) {
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

	public function getVersion() {
		$reflector = new ReflectionClass(get_class($this));
		$dirname   = dirname($reflector->getFileName());
		$meta      = json_decode(file_get_contents($dirname . "/meta.json"),true);
		return $meta['version'];
	}

	public function getName() {
		$reflector = new ReflectionClass(get_class($this));
		$dirname   = dirname($reflector->getFileName());
		return substr($dirname, strrpos($dirname, DIRECTORY_SEPARATOR)+1);
	}
}

