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
    if ($user->isLoggedIn() || empty($config['prevent_guest_charts'])) {
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

    header_nav_hook($headlinks, 'custom_nav');

    // language dropdown
    if (!empty($config['languages'])) {
        $langDropdown = array(
            'url' => '',
            'id' => 'lang',
            'dropdown' => array(),
            'title' => strtoupper(substr(DatawrapperSession::getLanguage(), 0, 2)),
            'icon' => false,
            'tooltip' => __('Switch language')
        );
        foreach ($config['languages'] as $lang) {
            $langDropdown['dropdown'][] = array(
                'url' => '#lang-'.$lang['id'],
                'title' => $lang['title']
            );
        }
        if (count($langDropdown['dropdown']) > 1) $headlinks[] = $langDropdown;
    }

    header_nav_hook($headlinks, 'languages');


    if ($user->isLoggedIn()) {

        $headlinks[] = 'divider';

        $username = $user->guessName();
        if ($username == $user->getEmail()) {
            $username = strlen($username) > 18 ? substr($username, 0, 9).'…'.substr($username, strlen($username)-9) : $username;
        } else {
            if (strlen($username) > 18) $username = substr($username, 0, 16).'…';
        }
        $headlinks[] = array(
            'url' => '/mycharts/',
            'id' => 'mycharts',
            'title' => '<img style="height:22px;position:relative;top:-2px;border-radius:7px;margin-right:7px" src="//www.gravatar.com/avatar/' . md5(strtolower(trim($user->getEmail()))) . '?s=44&amp;d=mm" /><b>'.htmlspecialchars($username, ENT_QUOTES, 'UTF-8').'</b>'
        );

        if ($user->hasCharts()) {
            // mycharts
            $mycharts = array(
                'url' => '/mycharts/',
                'id' => 'mycharts',
                'title' => __('My Charts'),
                //'justicon' => true,
                'icon' => 'fa fa-bar-chart-o',
                'dropdown' => array()
            );
            foreach ($user->getRecentCharts(9) as $chart) {
                $mycharts['dropdown'][] = array(
                    'url' => '/chart/'.$chart->getId().'/visualize#tell-the-story',
                    'title' => '<img width="30" src="'.($chart->hasPreview() ? $chart->thumbUrl(true) : '').'" class="icon" /> '
                        . '<span>' . strip_tags($chart->getTitle()) . '</span>'
                );
            }
            $mycharts['dropdown'][] = 'divider';
            $mycharts['dropdown'][] = array('url' => '/mycharts/', 'title' => __('All charts'));
            $headlinks[] = $mycharts;
        }

        header_nav_hook($headlinks, 'mycharts');


        $headlinks[] = array(
            'url' => '/account/settings',
            'id' => 'signout',
            'icon' => 'fa fa-wrench',
            'justicon' => true,
            'tooltip' => __('Settings')
        );
    } else {
        $headlinks[] = array(
            'url' => '#login',
            'id' => 'login',
            'title' => $config['prevent_guest_access'] ? __('Login') : __('Login / Sign Up'),
            'icon' => 'fa fa-sign-in'
        );
    }

    if ($user->isLoggedIn()) {
        $headlinks[] = array(
            'url' => '#logout',
            'id' => 'signout',
            'icon' => 'fa fa-sign-out',
            'justicon' => true,
            'tooltip' => __('Sign out')
        );
    }

    header_nav_hook($headlinks, 'user');

    // admin link
    if ($user->isLoggedIn() && $user->isAdmin()
        && DatawrapperHooks::hookRegistered(DatawrapperHooks::GET_ADMIN_PAGES)) {
        $headlinks[] = 'divider';
        $headlinks[] = array(
            'url' => '/admin',
            'id' => 'admin',
            'icon' => 'fa fa-gears',
            'justicon' => true,
            'tooltip' => __('Admin')
        );
    }

    header_nav_hook($headlinks, 'admin');

    if (DatawrapperHooks::hookRegistered(DatawrapperHooks::CUSTOM_LOGO)) {
        $logos = DatawrapperHooks::execute(DatawrapperHooks::CUSTOM_LOGO);
        $page['custom_logo'] = $logos[0];
    }

    foreach ($headlinks as $i => $link) {
        if ($link == 'divider') continue;
        $headlinks[$i]['active'] = $headlinks[$i]['id'] == $active;
    }
    $page['headlinks'] = $headlinks;
    $page['user'] = DatawrapperSession::getUser();
    $page['language'] = substr(DatawrapperSession::getLanguage(), 0, 2);
    $page['locale'] = DatawrapperSession::getLanguage();
    $page['DW_DOMAIN'] = $config['domain'];
    $page['DW_VERSION'] = DATAWRAPPER_VERSION;
    $page['ASSET_DOMAIN'] = $config['asset_domain'];
    $page['DW_CHART_CACHE_DOMAIN'] = $config['chart_domain'];
    $page['SUPPORT_EMAIL'] = $config['email']['support'];
    $page['config'] = $config;
    $page['page_css'] = $page_css;
    $page['invert_navbar'] = isset($config['invert_header']) && $config['invert_header'] || substr($config['domain'], -4) == '.pro';
    $page['noSignup'] = $config['prevent_guest_access'];
    $page['footer'] = DatawrapperHooks::execute(DatawrapperHooks::GET_FOOTER);

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
                if (substr($file, -3) == '.js') $plugin_js_files[] = $file . '?v=' . $plugin->getVersion();
                if (substr($file, -4) == '.css') $plugin_css_files[] = $file . '?v=' . $plugin->getVersion();
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

    if ($config['debug']) {
        if (file_exists('../.git')) {
            // parse git branch
            $head = file_get_contents('../.git/HEAD');
            $parts = explode("/", $head);
            $branch = trim($parts[count($parts)-1]);
            $output = array();
            exec('git rev-parse HEAD', $output);
            $commit = $output[0];
            $page['BRANCH'] = ' (<a href="https://github.com/datawrapper/datawrapper/tree/'.$commit.'">'.$branch.'</a>)';
        }
    }
}

