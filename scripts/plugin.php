<?php

/*
 * Datawrapper Plugin Manager
 * --------------------------
 *
 * Examples:
 *
 * Install all available plugins
 *    php plugin.php install "*"
 *
 * Disable a plugins
 *    php plugin.php diable foo
 *
 * Uninstall a plugin
 *    php plugin.php uninstall foo
 *
 * Batch enable some plugins
 *    php plugin.php enable "visualization-*"
 *
 */


define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');

define('NO_SLIM', 1);

date_default_timezone_set('Europe/Berlin');

require_once ROOT_PATH . 'lib/bootstrap.php';

$cmd = $argv[1];

/*
 * list installed plugins
 */
function list_plugins() {
    $plugins = PluginQuery::create()->find();
    foreach ($plugins as $plugin) {
        print $plugin->getName().":  ";
        print $plugin->getEnabled() ? "ENABLED" : "DISABLED";
        print "\n";
    }
    _apply("*", function($id) {
        $plugin = PluginQuery::create()->findPk($id);
        if (!$plugin) print "$id:  NOT INSTALLED\n";
    });
    exit();
}

/*
 * removes plugins from db that have no files installed anymore
 */
function clean() {
    $plugins = PluginQuery::create()->find();
    foreach ($plugins as $plugin) {
        if (!file_exists($plugin->getPath() . 'package.json')) {
            $plugin->delete();
        }
    }
    exit();
}

/*
 * installs plugins
 */
function install($pattern) {
    _apply($pattern, function($id) {
        $tmp = new Plugin();
        $tmp->setId($id);

        // check if plugin files exist
        if (!file_exists($tmp->getPath())) {
            print "No plugin found with that name. Skipping.\n";
            return false;
        }
        if (!file_exists($tmp->getPath() . 'package.json')) {
            print "Path exists, but no package.json found. Skipping.\n";
            return false;
        }
        // check if plugin is already installed
        $plugin = PluginQuery::create()->findPk($id);
        if ($plugin) {
            _loadPluginClass($plugin)->install();
            print "Re-installed plugin $id.\n";
        } else {
            $plugin = new Plugin();
            $plugin->setId($id);
            $plugin->save();
            _loadPluginClass($plugin)->install();
            print "Installed plugin $id.\n";
        }
    });
    exit();
}

/*
 * uninstalls plugins
 */
function uninstall($pattern) {
    _apply($pattern, function($id) {
        $tmp = new Plugin();
        $tmp->setId($id);

        $plugin = PluginQuery::create()->findPk($id);
        if (!$plugin || $plugin && !file_exists($plugin->getPath())) {
            print "Plugin $id not found. Skipping.\n";
            return false;
        }

        if (!$plugin) {
            $plugin = new Plugin();
            $plugin->setId($id);
        }
        _loadPluginClass($plugin)->uninstall();
        print "Uninstalled plugin $id.\n";
    });
    exit();
}

/*
 * enable plugins
 */
function enable($pattern) {
    _apply($pattern, function($id) {
        $plugin = PluginQuery::create()->findPk($id);
        if (!$plugin) {
            print "Plugin $id is not installed. Skipping.\n";
            return false;
        }
        if (!$plugin->getEnabled()) {
            $plugin->setEnabled(true);
            $plugin->save();
            print "Enabled plugin $id.\n";
        } else {
            print "Plugin $id is already enabled. Skipping.\n";
        }
    });
    exit();
}

/*
 * disable plugins
 */
function disable($pattern) {
    _apply($pattern, function($id) {
        $plugin = PluginQuery::create()->findPk($id);
        if (!$plugin) {
            print "Plugin $id is not installed. Skipping.\n";
            return false;
        }
        if ($plugin->getEnabled()) {
            $plugin->setEnabled(false);
            $plugin->save();
            print "Disabled plugin $id.\n";
        } else {
            print "Plugin $id is already disabled. Skipping.\n";
        }
    });
    exit();
}

/*
 * update plugins from git repository
 */
function update($pattern) {
    _apply($pattern, function($id) {
        $plugin = new Plugin();
        $plugin->setId($id);
        $repo = $plugin->getRepository();
        if ($repo) {
            if ($repo['type'] == 'git') {
                if (file_exists($plugin->getPath() . '.git/config')) {
                    $ret = array();
                    exec('cd '.$plugin->getPath().'; git pull 2>&1', $ret, $err);
                    if ($ret[count($ret)-1] == 'Already up-to-date.') {
                        print "Plugin $id is up-to-date.\n";
                    } else {
                        print "Updated plugin $id.\n";
                    }
                } else {
                    print "Skipping $id: Not a valid Git repository.\n";
                }
            } else {
                print "Skipping $id: Unhandled repository type ".$repo['type'].".\n";
            }
        } else {
            print "Skipping $id: No repository information found in package.json.\n";
        }
    });
    exit();
}


switch ($cmd) {
    case 'list': list_plugins();
    case 'clean': clean();
    case 'install': install($argv[2]);
    case 'uninstall': uninstall($argv[2]);
    case 'enable': enable($argv[2]);
    case 'disable': disable($argv[2]);
    case 'update': update($argv[2]);
    default:
        print 'Unknown command '.$cmd."\n";
        exit();

}


function _apply($pattern, $func) {
    $plugin_ids = array();
    if (strpos($pattern, '*') > -1) {
        foreach (glob(ROOT_PATH . "plugins/" . $pattern . "/package.json") as $filename) {
            $d = dirname($filename);
            $d = substr($d, strrpos($d, DIRECTORY_SEPARATOR)+1);
            $plugin_ids[] = $d;
        }
    } else {
        $plugin_ids[] = $pattern;
    }
    foreach ($plugin_ids as $plugin_id) {
        $func($plugin_id);
    }
}

function _loadPluginClass($plugin) {
    if (file_exists($plugin->getPath() . 'plugin.php')) {
        require_once $plugin->getPath() . 'plugin.php';
        $className = $plugin->getClassName();
        return new $className();
    }
    // no plugin.php
    return new DatawrapperPlugin($plugin->getName());
}
