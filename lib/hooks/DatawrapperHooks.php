<?php
// class DemoPlugin {
//     function init(){
//         $this->foo = 'bar';
//         DatawrapperHooks::register(Hooks::TEST, array($this, 'test'));
//     }
//     function test(){
//         print "test called\n" . $this->foo;
//     }
// }

// $test = function($params){
//     print "test2 called";
//     print "params: " . var_dump($params);
// };

// // little hooks test
// DatawrapperHooks::register(Hooks::TEST, $test);

// $demo  = new DemoPlugin();
// $demo->init();

// function testHooks(){
//     DatawrapperHooks::execute(Hooks::TEST, array('param1' => 'test'));
// }

/**
 * This singleton handle hooks registration for plugins
 */
class DatawrapperHooks {

    private static $instance;

    public static function getInstance(){
        if(!isset(self::$instance)){
            self::$instance = new DatawrapperHooks();
        }
        return self::$instance;
    }

    public $hooks = array();

    /**
     * Register a plugin hook
     * @param $hookName - the name of hook to register (see Core::Hooks)
     * @param $pluginFunc  - the plugin function that will be called on hook execution (see DatawrapperPlugins::executeHook)
     */
    public static function register($hookName, $pluginFunc){
        $me = self::getInstance();
        if(!isset($me->hooks[$hookName])){
            $me->hooks[$hookName] = array();
        }
        $me->hooks[$hookName][] = $pluginFunc;
    }

    /**
     * Execute a core hook - will call every plugin function registred for a hook
     * @param $hookName - the name of hook to register (see Core::Hooks)
     * @param $params   - parameters that will be passed to plugin functions
     */
    public static function execute($hookName){
        $me = self::getInstance();
        if(!isset($me->hooks[$hookName])){
            return false;
        }
        $results = array();
        foreach ($me->hooks[$hookName] as $key => $func) {
            $results[] = call_user_func_array($func, array_slice(func_get_args(), 1));
        }
        return $results;
    }

    // print something below a charts HTML body
    const AFTER_CHART_BODY = 'after_chart_body';

    // publishes a set of files to some CDN (args: files)
    const PUBLISH_FILES = 'publish_files';

    // unpublishes (removes) a set of files from some CDN (args: files)
    const UNPUBLISH_FILES = 'unpublish_files';

    // returns the URL of a published chart (args: chart)
    const GET_PUBLISHED_URL = 'get_pulished_url';

    // Send an email (args: to, subject, body)
    const SEND_EMAIL = 'send_email';

    // Runs once a day via cronjob
    const CRON_DAILY = 'cron_daily';
}


