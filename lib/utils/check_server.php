<?php

/* health check */
function chart_publish_directory() {
    $dir = ROOT_PATH.'charts';

    if (isset($GLOBALS['dw_config']['publish_directory'])) {
        $dir = $GLOBALS['dw_config']['publish_directory'];
    }

    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true)) {
            throw new RuntimeException('Could not create chart publish directory "'.$dir.'". Please create it manually and make sure PHP can write to it.');
        }
    }

    return rtrim(realpath($dir), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
}

function check_path_permissions() {
    $paths       = array();
    $rel         = '..';
    $publishRoot = chart_publish_directory();

    $paths[] = $publishRoot.'data';
    $paths[] = $publishRoot.'data/tmp';
    $paths[] = $publishRoot.'exports';
    $paths[] = $publishRoot.'images';
    $paths[] = $publishRoot.'static';
    $paths[] = $publishRoot.'static/lib';
    $paths[] = $publishRoot.'static/lib/theme';
    $paths[] = $publishRoot.'static/lib/vis';
    $paths[] = $publishRoot.'tmp';

    $paths[] = ROOT_PATH.'tmp';

    $err = array();
    foreach ($paths as $path) {
        if (!is_dir($path)) {
            try {
                mkdir($path);

                if (!is_writable($path)) {
                    $err[] = $path;
                }
            } catch (Exception $ex) {
                $err[] = $path;
            }
        } else if (!is_writable($path)) {
            $err[] = $path;
        }

    }

    if (count($err) > 0) {
        $msg = '<h2>The following folders on your server need to be writable:</h2><ul>';

        foreach ($paths as $path) {
            if (!is_writable($path)) {
                $msg .= '<li><code>'.htmlspecialchars($path, ENT_QUOTES, 'UTF-8').'</code></li>';
            }
        }

        $msg .= '</ul>';
        $msg .= 'Read more about <a href="http://codex.wordpress.org/Changing_File_Permissions#Using_an_FTP_Client">how to change file permissions</a>';

        return $msg;
    }

    return '';
}

function check_config() {
    if (!file_exists(ROOT_PATH . 'config.yaml') && !file_exists('/etc/datawrapper/config.yaml')) {
        return '<h2>Could not find <b>config.yaml</b></h2>'
          . '<p>Please copy the template configuration from <code>config.template.yaml</code> to <code>config.yaml</code> and change the configuration according to your server.</p>';
    }
    return '';
}

function connect_database() {
    @include ROOT_PATH . 'lib/core/build/conf/datawrapper-conf.php';
    $dbconn = $conf['datasources']['datawrapper']['connection'];

    return new PDO($dbconn['dsn'], $dbconn['user'], $dbconn['password']);
}


function check_database() {
    if (!file_exists(ROOT_PATH . 'lib/core/build/conf/datawrapper-conf.php')) {
        return '<h2>No database configuration found!</h2>'
            . '<p>Please copy <code>lib/core/build/conf/datawrapper-conf.php.master</code> to <code>'
            . 'lib/core/build/conf/datawrapper-conf.php</code> and update your database settings '
            . 'according to your server configuration</p>';
    }

    try {
        $conn = connect_database();
    }
    catch (Exception $e) {
        return '<h2>Could not access database!</h2><p>'. htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</p>';
    }

    // check if we find the tables
    $res = $conn->query('SHOW TABLES');
    $expectedTables = array('action', 'chart', 'job', 'session', 'stats', 'user');
    $foundTables = array();
    foreach ($res as $row) {
        $foundTables[] = reset($row);
    }

    $missingTables = array_diff($expectedTables, $foundTables);
    if (count($missingTables) > 0) {
        return '<h2>Database is not initialized or corrupt</h2>'
            . '<p>The database could be accessed but seems not be initialized correctly. '
            . 'The following tables are missing:</p>'
            . '<ul><li><code>' . implode('</li></code><li><code>', $missingTables) . '</code></li></ul>'
            . '<p>Have you run the DB initialization in <code>lib/core/build/sql/schema.sql</code>?</p>';
    }
    return '';
}

/*
 * checks that the current plugin setup is correct
 * - all activated plugins need to have a valid plugin.json
 */
function check_plugins() {
    $db = connect_database();
    $res = $db->query('SELECT id FROM plugin WHERE enabled = 1');
    $missing = array();
    $need_newer_version = array();
    $package_json_parse_error = array();
    $missing_dep = array();
    $cnt = 0;

    $depends = array();
    $installed = array();

    foreach ($res as $row) {
        $plugin_json = get_plugin_path() . $row['id'] . '/plugin.json';
        $package_json = get_plugin_path() . $row['id'] . '/package.json';
        if (!file_exists($package_json) && !file_exists($plugin_json)) {
            $missing[] = $row['id'];
        } else {
            $info = file_exists($plugin_json) ?
                file_get_contents($plugin_json) :
                file_get_contents($package_json);
            $info = json_decode($info, true);
            if (empty($info)) {
                $package_json_parse_error[] = $row['id'];
            } else {
                $installed[$row['id']] = $info['version'];
                if (!empty($info['dependencies'])) {
                    $depends[$row['id']] = $info['dependencies'];
                }
            }
        }
        $cnt++;
    }
    // check dependencies
    foreach ($depends as $id => $deps) {
        foreach ($deps as $dep_id => $dep_ver) {
            if (!isset($installed[$dep_id]) && $dep_id != 'core') {
                $missing_dep[] = [$dep_id, $id];
            } else {
                if ($dep_id != 'core') {
                    if (version_compare($installed[$dep_id], $dep_ver) < 0) {
                        $need_newer_version[] = $dep_id.' (>='.$dep_ver.')';
                    }
                } else {
                    if (version_compare(DATAWRAPPER_VERSION, $dep_ver) < 0) {
                        $need_newer_version[] = $id.' needs Datawrapper >= '.$dep_ver;
                    }
                }
            }
        }
    }
    if (count($package_json_parse_error) > 0) {
        return '<h2>Some plugins have bad package descriptors</h2>'
            . '<p>For the following plugins the descriptor stored in plugin.json could '
            . 'not be parsed correctly. Please make sure that they are valid JSON files.'
            . '<ul><li><code>'. join('</li></code><li><code>', $package_json_parse_error) . '</code></li></ul>';
    }
    if (count($need_newer_version) > 0) {
        return '<h2>Some required plugins need to be updated</h2>'
            . '<p>The following plugins are installed but some plugins need a newer '
            . 'version of them:</p>'
            . '<ul><li><code>'. join('</li></code><li><code>', $need_newer_version) . '</code></li></ul>';
    }
    $missing = array_unique($missing);
    if (count($missing) > 0) {
        return '<h2>Some plugins are missing</h2>'
            . '<p>The following plugins are activated in the database but the corresponding '
            . 'files could not be found:</p>'
            . '<ul><li><code>'. join('</li></code><li><code>', $missing) . '</code></li></ul>';
    }

    if (count($missing_dep) > 0) {
        return '<h2>Some plugins are missing</h2>'
            . '<p>The following plugins are declared as dependencies by other plugins:</p>'
            . '<ul><li><code>'. join('</li></code><li><code>', array_map(function($d) { return $d[0].' (required by '.$d[1].')'; }, $missing_dep)) . '</code></li></ul>';
    }
    if ($cnt == 0) {
        return '<h2>Please install some plugins</h2>'
            . '<p>In order to use Datawrapper you need to install some plugins, such as '
            . 'the default theme and the core visualizations. To do so you need to utilize '
            . 'the plugin install script which can be found in <code>/scripts/plugin.php</code> '
            . 'inside the Datawrapper folder. </p><pre><code>'
            . '$ php scripts/plugin.php install theme-default'. "\n"
            . '$ php scripts/plugin.php install "visualization*"'. "\n"
            . ' </code></pre>';
        }
}

function check_paths() {
    $check = array();
    $check[] = 'check_path_permissions';

    foreach ($check as $func) {
        $msg = call_user_func($func);
        if (!empty($msg)) {
            http_response_code(500);
            print '<html><head><title>Datawrapper</title></head><body>';
            print '<div style="border-radius:20px;background:#ffc; border:1px solid #eea; padding: 30px;width:700px;margin:30px auto;font-size:18px;font-family:Helvetica Neue;font-weight:300">';
            print '<style>h2 { font-weight: 400; font-size: 28px; color: #b20 } ul li { font-size: 18px }</style>';
            print '<h1 style="margin:0 0 30px;font-size:32px;line-height:30px;letter-spacing:-1px;color:#531">Whoops! Something is wrong with your Datawrapper instance!</h1>';

            print $msg;
            print '</div></body></html>';
            exit();
        }
     }
}

function check_server() {
    $check = array();
    $check[] = 'check_config';
    $check[] = 'check_database';

    foreach ($check as $func) {
        $msg = call_user_func($func);
        if (!empty($msg)) {
            http_response_code(500);
            print '<html><head><title>Datawrapper</title></head><body>';
            print '<div style="border-radius:20px;background:#ffc; border:1px solid #eea; padding: 30px;width:700px;margin:30px auto;font-size:18px;font-family:Helvetica Neue;font-weight:300">';
            print '<style>h2 { font-weight: 400; font-size: 28px; color: #b20 } ul li { font-size: 18px }</style>';
            print '<h1 style="margin:0 0 30px;font-size:32px;line-height:30px;letter-spacing:-1px;color:#531">Whoops! Something is wrong with your Datawrapper instance!</h1>';

            print $msg;
            print '</div></body></html>';
            exit();
        }
     }
}
