<?php

/**
 * This singleton handle hooks registration for plugins
 *
 * DatawrapperHooks::register('my_hook', 'hookFunction')
 * DatawrapperHooks::register('my_hook', array($this, 'hookFunction'))
 *
 * To execute a hook function:
 * DatawrapperHooks::execute('my_hook', $parameter, ...)
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

    /*
     * Checks whether a hook has been registered or if executing
     * that hook would lead to no action.
     * @param $hookName - the name of hook to register (see Core::Hooks)
     */
    public static function hookRegistered($hookName) {
        $me = self::getInstance();
        return isset($me->hooks[$hookName]);
    }

    // print something below a charts HTML body
    const AFTER_CHART_BODY = 'after_chart_body';

    // print something below the Datawrapper HTML body
    const AFTER_CORE_BODY = 'after_core_body';

    // publishes a set of files to some CDN (args: files)
    const PUBLISH_FILES = 'publish_files';

    // unpublishes (removes) a set of files from some CDN (args: files)
    const UNPUBLISH_FILES = 'unpublish_files';

    // returns the URL of a published chart (args: chart)
    const GET_PUBLISHED_URL = 'get_pulished_url';

    // Send an email (args: to, subject, body, headers)
    const SEND_EMAIL = 'send_email';

    // Runs once a day via cronjob
    const CRON_DAILY = 'cron_daily';

    // Executed after a chart has been published (args: chart, user)
    const POST_CHART_PUBLISH = 'post_chart_publish';

    // returns a list of actions to be displayed in publish step
    const GET_CHART_ACTIONS = 'get_chart_actions';

    // a hook for providing new api actions
    const PROVIDE_API = 'provide_api';

    // a hook for providing new api actions
    const GET_PLUGIN_ASSETS = 'get_plugin_assets';

    // a hook for providing new demo datasets
    const GET_DEMO_DATASETS = 'get_demo_assets';


}


