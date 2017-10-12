<?php


function add_header_vars(&$page, $active = null, $page_css = null) {

    if (!function_exists('header_nav_hook')) {
        function header_nav_hook(&$headlinks, $part) {
            $links = DatawrapperHooks::execute('header_nav_' . $part);
            if (!empty($links)) {
                foreach ($links as $link) {
                    $headlinks[] = $link;
                }
            }
        }
    }

    if (!isset($page['page_description'])) {
        $page['page_description'] = __('Datawrapper is an open source tool helping everyone to create simple, correct and embeddable charts in minutes.', 'core');
    }

    // define the header links
    global $app;
    $config = $GLOBALS['dw_config'];
    if (!isset($active)) {
        $active = explode('/', $app->request()->getResourceUri());
        $active = $active[1];
    }

    if (!isset($config['prevent_guest_charts'])) {
        $config['prevent_guest_charts'] = false;
    }
    if (!isset($config['prevent_guest_access'])) {
        $config['prevent_guest_access'] = false;
    }

    $user = DatawrapperSession::getUser();
    $headlinks = array();
    if ($user->isLoggedIn()) {
        $headlinks[] = array(
            'url' => '/chart/create',
            'id' => 'chart',
            'title' => __('New Chart'),
            'icon' => 'fa fa-plus'
        );
    }

    header_nav_hook($headlinks, 'create');

    if (isset($config['navigation'])) foreach ($config['navigation'] as $item) {
        $link = array('url' => str_replace('%lang%', substr(DatawrapperSession::getLanguage(), 0, 2), $item['url']), 'id' => $item['id'], 'title' => __($item['title']));
        if (!empty($item['icon'])) $link['icon'] = $item['icon'];
        $headlinks[] = $link;
    }

    if (!$user->isLoggedIn()) {
        header_nav_hook($headlinks, 'logged_out_nav');
    }

    header_nav_hook($headlinks, 'custom_nav');


    if ($user->isLoggedIn()) {

        $username = $user->guessName();
        if ($username == $user->getEmail()) {
            $username = strlen($username) > 18 ? substr($username, 0, 9).'…'.substr($username, strlen($username)-9) : $username;
        } else {
            if (strlen($username) > 18) $username = substr($username, 0, 16).'…';
        }

        // the place where settings used to be

        header_nav_hook($headlinks, 'settings');

        if ($user->hasCharts()) {
            $headlinks[] = 'divider';

            $org = $user->getCurrentOrganization();
            // mycharts
            $mycharts_link = array(
                'url' => empty($org) ? '/mycharts/' : '/team/'.$org->getId().'/',
                'id' => 'mycharts',
                'title' => empty($org) ? __('My Charts') : __('Team Charts'),
                //'justicon' => true,
                'icon' => 'fa fa-bar-chart-o',
            );
            $mycharts = array(
                'url' => '/mycharts/',
                'id' => 'mycharts_dd',
                'title' => '',
                //'justicon' => true,
                'icon' => 'fa  fa-caret-down',
                'dropdown' => array()
            );
            foreach ($user->getRecentCharts(9) as $chart) {
                $mycharts['dropdown'][] = array(
                    'url' => '/'.$chart->getNamespace().'/'.$chart->getId().'/visualize#tell-the-story',
                    'title' => '<div style="height:20px; width:30px; position:absolute; left:10px;top:4px;'.
				'background-image:url('.$chart->thumbUrl(true).'); background-size:cover;"></div>'
                        . '<span>' . strip_tags($chart->getTitle()) . '</span>'
                );
            }
            $mycharts['dropdown'][] = 'divider';
            $mycharts['dropdown'][] = array('url' => '/mycharts/', 'title' => __('All charts'));
            $headlinks[] = $mycharts_link;
            $headlinks[] = $mycharts;
        }

        header_nav_hook($headlinks, 'mycharts');

    } else {
        $headlinks[] = array(
            'url' => '#login',
            'id' => 'login',
            'title' => $config['prevent_guest_access'] ? __('Login') : __('Login / Sign Up'),
            'icon' => 'fa fa-sign-in'
        );
    }


    // language dropdown
    if (!empty($config['languages'])) {
        $langDropdown = array(
            'url' => '',
            'id' => 'lang',
            'icon' => 'fa fa-globe',
            'dropdown' => array(),
            'title' => strtoupper(substr(DatawrapperSession::getLanguage(), 0, 2)),
            'tooltip' => "&nbsp;" . __('Switch language')
        );
        foreach ($config['languages'] as $lang) {
            $langDropdown['dropdown'][] = array(
                'url' => '#lang-'.$lang['id'],
                'title' => $lang['title']
            );
        }

    }

    if ($user->isLoggedIn()) {
        $headlinks[] = 'divider';

        $acc = array(
            "id" => "account",
            "icon" => "fa fa-bars",
            "dropdown" => [
                [
                    "id" => "my-account",
                    'icon' => 'fa fa-lock',
                    "url" => "/account",
                    "title" => "&nbsp;" . __('My Account')
                ]
            ]
        );

        if (count($langDropdown['dropdown']) > 1) $acc["dropdown"][] = $langDropdown;

        header_nav_hook($headlinks, 'languages');

        if ($user->isLoggedIn()) {
            $acc["dropdown"][] = array(
                'url' => '#logout',
                'id' => 'signout',
                'title' => 'Logout',
                'icon' => 'fa fa-sign-out',
                'justicon' => true,
                'tooltip' => __('Sign out')
            );
        }

        header_nav_hook($headlinks, 'user');
        header_nav_hook($acc["dropdown"], 'hamburger');

        // admin link
        if ($user->isLoggedIn() && $user->isAdmin()
            && DatawrapperHooks::hookRegistered(DatawrapperHooks::GET_ADMIN_PAGES)) {
            $acc["dropdown"][] = 'divider';
            $acc["dropdown"][] = array(
                'url' => '/admin',
                'id' => 'admin',
                'title' => '&nbsp; Admin',
                'icon' => 'fa fa-gears',
                'justicon' => true,
                'tooltip' => __('Admin')
            );
        }

        header_nav_hook($headlinks, 'admin');

        $headlinks[] = $acc;
    } else {
        if (count($langDropdown['dropdown']) > 1) $headlinks[] = $langDropdown;

        header_nav_hook($headlinks, 'languages');
    }

    if (DatawrapperHooks::hookRegistered(DatawrapperHooks::CUSTOM_LOGO)) {
        $logos = DatawrapperHooks::execute(DatawrapperHooks::CUSTOM_LOGO);
        $page['custom_logo'] = $logos[0];
    }

    if ($user->isAdmin()) {
        $plugin_status = check_plugins();
        $page['alertMessage'] = '';
        if (!empty($plugin_status)) $page['alertMessage'] .= $plugin_status;
        if (isset($GLOBALS['dw_alert'])) $page['alertMessage'] .= $GLOBALS['dw_alert'];
    }

    foreach ($headlinks as $i => $link) {
        if ($link == 'divider') continue;
        $headlinks[$i]['active'] = $headlinks[$i]['id'] == $active;
    }
    $user = DatawrapperSession::getUser();
    $page['headlinks'] = $headlinks;
    $page['user'] = $user;
    $page['userData'] = $user->isLoggedIn() ? $user->getUserData() : false;
    $page['language'] = substr(DatawrapperSession::getLanguage(), 0, 2);
    $page['locale'] = DatawrapperSession::getLanguage();
    $page['DW_DOMAIN'] = $config['domain'];
    $page['DW_VERSION'] = DATAWRAPPER_VERSION;
    $page['ASSET_DOMAIN'] = $config['asset_domain'];
    $page['API_DOMAIN'] = $config['api_domain'];
    $page['DW_CHART_CACHE_DOMAIN'] = $config['chart_domain'];
    $page['SUPPORT_EMAIL'] = $config['email']['support'];
    $page['config'] = $config;
    $page['page_css'] = $page_css;
    $page['invert_navbar'] = isset($config['invert_header']) && $config['invert_header'] || substr($config['domain'], -4) == '.pro';
    $page['noSignup'] = $config['prevent_guest_access'];
    $page['alternative_signins'] = DatawrapperHooks::execute(DatawrapperHooks::ALTERNATIVE_SIGNIN);

    if (isset ($config['maintenance']) && $config['maintenance'] == true) {
        $page['maintenance'] = true;
    }

    $uri = $app->request()->getResourceUri();
    $plugin_assets = DatawrapperHooks::execute(DatawrapperHooks::GET_PLUGIN_ASSETS, $uri);
    if (!empty($plugin_assets)) {
        $plugin_js_files = array();
        $plugin_css_files = array();
        foreach ($plugin_assets as $assets) {
            if (!is_array($assets)) $assets = array($assets);
            foreach ($assets as $asset) {
                $file = $asset[0];
                $plugin = $asset[1];
                $version = substr(md5($plugin->getLastInstallTime()),0, 8);
                if (substr($file, -3) == '.js') $plugin_js_files[] = $file . '?v=' . $version;
                if (substr($file, -4) == '.css') $plugin_css_files[] = $file . '?v=' . $version;
            }
        }
        $page['plugin_js'] = $plugin_js_files;
        $page['plugin_css'] = $plugin_css_files;
    }

    if (isset($config['piwik'])) {
        $page['PIWIK_URL'] = $config['piwik']['url'];
        $page['PIWIK_IDSITE'] = $config['piwik']['idSite'];
        if (isset($config['piwik']['idSiteNoCharts'])) {
            $page['PIWIK_IDSITE_NO_CHARTS'] = $config['piwik']['idSiteNoCharts'];
        }
    }

    // if ($config['debug']) {
    try {
        if (file_exists('../.git')) {
            // parse git branch
            $head = file_get_contents('../.git/HEAD');
            $parts = explode("/", $head);
            $branch = trim($parts[count($parts)-1]);
            $output = array();
            exec('git rev-parse HEAD', $output);
            $commit = $output[0];
            $page['COMMIT_SHA'] = substr($commit, 0, 8);
            if ($config['debug']) {
                $page['BRANCH'] = ' (<a href="https://github.com/datawrapper/datawrapper/tree/'.$commit.'">'.$branch.'</a>)';
            }
        }
    } catch (Error $e) {
        // ignore
        $page['COMMIT_SHA'] = 'error';
    }
    // }
}

