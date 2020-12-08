
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

    // print something below the Datawrapper HTML body
    const CORE_AFTER_BODY = 'core_after_body';

    // Runs once a day via cronjob
    const CRON_DAILY = 'cron_daily';

    // Runs every hour via cronjob
    const CRON_HOURLY = 'cron_hourly';

    // Runs every half hour via cronjob
    const CRON_HALF_HOURLY = 'cron_half_hourly';

    // Runs every 15 minutes via cronjob
    const CRON_QUARTER_HOURLY = 'cron_quarter_hourly';

    // Runs every 5 minutes via cronjob
    const CRON_FIVE_MINUTELY = 'cron_five_minutely';

    // Runs every minute via cronjob
    const CRON_MINUTELY = 'cron_minutely';

    // returns a list of actions to be displayed in publish step
    const GET_CHART_ACTIONS = 'get_chart_actions';

    // whenever a chart gets duplicated or forked
    const CHART_COPY = 'chart_copy';

    // render something beneath the chart actions
    const PUBLISH_AFTER_CHART_ACTIONS = 'publish_after_chart_actions';

    // render something after sidebar on mycharts page
    const MYCHARTS_AFTER_SIDEBAR = 'mycharts_after_sidebar';

    // for adding new actions in chart modal on mycharts page
    const MYCHARTS_MODAL_ACTIONS = 'mycharts_modal_actions';

    // a hook for providing new api actions
    const PROVIDE_API = 'provide_api';

    // a hook for providing new api actions
    const GET_PLUGIN_ASSETS = 'get_plugin_assets';

    // a hook for providing new demo datasets
    const GET_DEMO_DATASETS = 'get_demo_assets';

    // a hook for providing visualization options
    const VIS_OPTION_CONTROLS = 'vis_option_controls';

    // a hook for defining new controller
    const GET_PLUGIN_CONTROLLER = 'get_plugin_controller';

    // overwrite the default footer
    const GET_FOOTER = 'get_footer';

    // allow plugins to add new admin pages
    const GET_ADMIN_PAGES = 'get_admin_pages';

    // allow plugins to add new admin pages
    const ALTERNATIVE_SIGNIN = 'alternative_signin';

    // allow adding links after 'create new chart'
    const HEADER_NAV = 'header_nav_';

    // add a logo to header navbar
    const CUSTOM_LOGO = 'custom_logo';

    // a new user as bean created
    const USER_SIGNUP = 'user_signup';

    // when a user is added/removed from a team
    const USER_ORGANIZATION_ADD = 'user_organization_add';
    const USER_ORGANIZATION_REMOVE = 'user_organization_remove';

    // when a product is added/removed from a team
    const PRODUCT_ORGANIZATION_ADD = 'product_organization_add';
    const PRODUCT_ORGANIZATION_REMOVE = 'product_organization_remove';

    // when a product is added/removed from a user
    const PRODUCT_USER_ADD = 'product_user_add';
    const PRODUCT_USER_REMOVE = 'product_user_remove';

    // when a plugin is added/removed from a product
    const PRODUCT_PLUGIN_ADD = 'product_plugin_add';
    const PRODUCT_PLUGIN_REMOVE = 'product_plugin_remove';

    const VISUALIZE_BEFORE_THEME_SELECTOR = 'visualize_before_theme_selector';
    const VISUALIZE_AFTER_THEME_SELECTOR = 'visualize_after_theme_selector';
    const CUSTOM_ANNOTATION_CONTROLS = 'custom_annotation_controls';
    const VISUALIZE_BEFORE_SVELTE_SIDEBAR = 'visualize_before_svelte_sidebar';

    // add user account settings pages
    const GET_ACCOUNT_PAGES = 'get_account_pages';

    // add more markup below sidebar in describe step
    const DESCRIBE_AFTER_SIDEBAR = 'describe_after_sidebar';

    // executed whenever a new user is activated or deleted, params: $user
    const USER_ACTIVATED = 'user_activated';
    const USER_DELETED = 'user_deleted';

    // executed once all plugins are loaded
    const ALL_PLUGINS_LOADED = 'all_plugins_loaded';

    // add more markup in sidebar in describe step
    const DESCRIBE_BEFORE_SOURCE = 'describe_before_source';

    // hooks to add markup in chart editor steps below nav
    const BEFORE_EDITOR_NAV = 'before_editor_nav';
    const UPLOAD_BEFORE_CONTENT = 'upload_before_content';
    const UPLOAD_AFTER_CONTENT = 'upload_after_content';
    const DESCRIBE_BEFORE_CONTENT = 'describe_before_content';
    const DESCRIBE_BEFORE_SIDEBAR = 'describe_before_sidebar';
    const DESCRIBE_AFTER_COMPUTED_COLUMNS = 'describe_after_computed_columns';
    const VISUALIZE_BEFORE_CONTENT = 'visualize_before_content';
    const VISUALIZE_BEFORE_SIDEBAR = 'visualize_before_sidebar';
    const PUBLISH_BEFORE_CONTENT = 'publish_before_content';
    const PUBLISH_AFTER_EMBED = 'publish_after_embed';
    const PUBLISH_TEXT_GUEST_ABOVE = 'publish_text_guest_above';
    const PUBLISH_TEXT_GUEST_BELOW = 'publish_text_guest_below';

    // hooks for plugin installation/update
    const PLUGIN_INSTALLED = 'plugin_installed';
    const PLUGIN_UPDATED = 'plugin_updated';
    const PLUGIN_UNINSTALLED = 'plugin_uninstalled';
    const PLUGIN_SET_PRIVATE = 'plugin_set_private';

    const RENDER_RESIZE_CONTROL = 'render_resize_control';

    const CHART_EDITOR_ALERT = 'chart_editor_alert';
    const PAGE_INLINE_CSS = 'page_inline_css';

    // allow plugins to revoke publishing rights
    const USER_MAY_PUBLISH = 'user_may_publish';
    const IS_CHART_WRITABLE = 'is_chart_writable';
    const IS_CHART_READABLE = 'is_chart_readable';

    const CUSTOM_EXTERNAL_DATA = 'CUSTOM_EXTERNAL_DATA';

    const ADD_WORKFLOW = 'ADD_WORKFLOW';

    const CORE_SET_CHART = 'core_set_chart';

    const PLUGIN_ACTION = 'plugin_action';

    const TEAM_SETTINGS_PAGE = 'team_settings_page';
    const TEAM_FLAGS = 'team_flags';

    const SVELTE_PUBLISH_AFTER_EMBED = 'svelte_publish_after_embed';
}

class_alias('DatawrapperHooks', 'Hooks');
