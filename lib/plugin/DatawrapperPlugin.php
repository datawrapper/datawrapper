<?php

class DatawrapperPlugin {

	private $__name;
	private $__packageJson;

	function __construct($name = null) {
		if (isset($name)) $this->__name = $name;
	}

	/** register events */
	public function init() {
		return true;
	}

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

		$this->copyStaticFiles();
		$this->copyTemplates();
	}

	/*
	 * copys all files from a plugins "static" directory to
	 * the publicly visible /www/static/plugins/%PLUGIN%/
	 */
	private function copyStaticFiles() {
		// check if there's a /static in plugin directory
		$source_path = ROOT_PATH . 'plugins/' . $this->getName() . '/static';
		if (!file_exists($source_path)) return;

		// create directory in www/static/plugins/ if not exists
		$plugin_static_path = ROOT_PATH . 'www/static/plugins/' . $this->getName();
		if (!file_exists($plugin_static_path)) {
			mkdir($plugin_static_path);
		}
		// copy static files to that directory
		$iterator = new RecursiveIteratorIterator(
		 	new RecursiveDirectoryIterator($source_path, RecursiveDirectoryIterator::SKIP_DOTS),
		  	RecursiveIteratorIterator::SELF_FIRST);
		foreach ($iterator as $item) {
			$path = $plugin_static_path . '/' . $iterator->getSubPathName();
			if ($item->isDir()) {
				if (!file_exists($path)) mkdir($path);
			} else {
				copy($item, $path);
			}
		}
	}

	/*
	 * copys all plugin templates to /templates/plugin/%PLUGIN%/
	 */
	private function copyTemplates() {
		// check if there's a /templates in plugin directory
		$source_path = ROOT_PATH . 'plugins/' . $this->getName() . '/templates';
		if (!file_exists($source_path)) return;

		// create directory in /templates/plugins/ if not exists
		$plugin_template_path = ROOT_PATH . 'templates/plugins/' . $this->getName();
		if (!file_exists($plugin_template_path)) {
			mkdir($plugin_template_path);
		}
		// copy static files to that directory
		$iterator = new RecursiveIteratorIterator(
		 	new RecursiveDirectoryIterator($source_path, RecursiveDirectoryIterator::SKIP_DOTS),
		  	RecursiveIteratorIterator::SELF_FIRST);
		foreach ($iterator as $item) {
			$path = $plugin_template_path . '/' . $iterator->getSubPathName();
			if ($item->isDir()) {
				if (!file_exists($path)) mkdir($path);
			} else {
				copy($item, $path);
			}
		}
	}

	/**
	* Disable the plugin
	*/
	public function uninstall() {
		$plugin = PluginQuery::create()->findPK($this->getName());
		if ($plugin) {
			$plugin->delete();
			// TODO:
			// $this->removeStaticFiles();
			// $this->removeTemplates();
		}
	}

	public function disable() {
		$plugin = PluginQuery::create()->findPK($this->getName());
		if ($plugin) {
			$plugin->setEnabled(false);
			$plugin->save();
		}
	}

	/*
	 * loads and caches the plugins package.json
	 */
	private function getPackageJSON() {
		if (!empty($this->__packageJson)) return $this->__packageJson;
		$reflector = new ReflectionClass(get_class($this));
		$dirname   = dirname($reflector->getFileName());
		$meta      = json_decode(file_get_contents($dirname . "/package.json"),true);
		$this->__packageJson = $meta;
		return $meta;
	}

	/*
	 * returns the version of the plugin
	 */
	public function getVersion() {
		$meta = $this->getPackageJSON();
		return $meta['version'];
	}

	/*
	 * returns the name (id) of this plugin
	 */
	public function getName() {
		if (!isset($this->__name)) {
			$reflector = new ReflectionClass(get_class($this));
			$dirname   = dirname($reflector->getFileName());
			$this->__name = substr($dirname, strrpos($dirname, DIRECTORY_SEPARATOR)+1);
		}
		return $this->__name;
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

	/*
	 * returns a list of PHP files that needs to be included
	 */
	public function getRequiredLibraries() {
		return array();
	}
}

