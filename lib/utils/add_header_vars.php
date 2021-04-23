<?php
@require_once ROOT_PATH.'lib/utils/truncate.php';

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

    $visualizations = DatawrapperVisualization::all();
    $canCreateCharts = false;

    foreach ($visualizations as $vis) {
        if ((!isset($vis['namespace']) || $vis['namespace'] == 'chart')
            && ($user->canCreateVisualization($vis['id']))) {

            if ((!isset($config['vis_archive']) || !in_array($vis['id'], $config['vis_archive'])) && !empty($vis['title'])) {
                $canCreateCharts = true;
                break;
            }
        }
    }

    if ($canCreateCharts) {
        $headlinks[] = array(
            'url' => '/create/chart',
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

        header_nav_hook($headlinks, 'mycharts');

    } else {
        $headlinks[] = array(
            'url' => '#login',
            'id' => 'login',
            'title' => $config['prevent_guest_access'] ? __('Login') : __('Login / Sign Up'),
            'icon' => 'fa fa-sign-in'
        );
        header_nav_hook($headlinks, 'login');
    }


    // language dropdown
    if (!empty($config['languages'])) {
        $langDropdown = array(
            'url' => '',
            'id' => 'lang',
            'icon' => 'im im-globe',
            'dropdown' => array(),
            'title' => __('Language'), //strtoupper(substr(DatawrapperSession::getLanguage(), 0, 2))
        );
        foreach ($config['languages'] as $lang) {
            $langDropdown['dropdown'][] = array(
                'url' => '#lang-'.$lang['id'],
                'title' => $lang['title'],
                'icon' => strtolower(substr(DatawrapperSession::getLanguage(), 0, 2)) == strtolower(substr($lang['id'], 0, 2)) ?
                    'fa fa-fw fa-check' : 'fa fa-fw'
            );
        }

    } else {
        $langDropdown = ['dropdown'=>[]];
    }

    if ($user->isLoggedIn()) {
        $headlinks[] = 'divider';

        $acc = [
            "id" => "account",
            "icon" => "fa fa-bars",
            "dropdown" => [
                [
                    "id" => "my-account",
                    'icon' => 'im im-user-settings',
                    "url" => "/account",
                    "title" => __('account / settings')
                ],[
                    "id" => "my-account",
                    'icon' => 'im im-users',
                    "url" => "/account/teams",
                    "title" => __('account / my-teams')
                ]
            ]
        ];
    }

    if (count($langDropdown['dropdown']) > 1) $acc["dropdown"][] = $langDropdown;

    if ($user->isLoggedIn()) {
        header_nav_hook($headlinks, 'user');
        header_nav_hook($acc["dropdown"], 'hamburger');

        $userOrgs = $user->getActiveOrganizations();

        if (count($userOrgs) > 0) {
            $acc['dropdown'][] = 'divider';
            $acc['dropdown'][] = ['group' => true, 'title' => __('nav / select-active-team')];

            $addToDropdown = function(&$dropdown, $org, $isActive) use ($user) {
                $team = [
                    'url' => '#team-activate',
                    'title' => htmlspecialchars(truncate($org->getName())),
                    'icon' => ($isActive ? 'fa fa-check-circle' : 'no-icon'),
                    'data' => [
                        'id' => $org->getId()
                    ]
                ];
                $dropdown[] = $team;
            };

            $i = 0;
            $maxTeamsInDropdown = 10;
            foreach ($userOrgs as $org) {
                if (++$i > $maxTeamsInDropdown) break;
                $addToDropdown($acc['dropdown'], $org, $org == $user->getCurrentOrganization());
            }
            $acc['dropdown'][] = [
                'url' => '#team-activate',
                'title' => __('nav / no-team'),
                'icon' => (empty($user->getCurrentOrganization()) ? 'fa fa-check-circle' : 'no-icon'),
                'data' => [
                    'id' => '@none'
                ]
            ];

            $acc['dropdown'][] = 'divider';
        }

        header_nav_hook($headlinks, 'languages');

        if ($user->isLoggedIn()) {
            $acc["dropdown"][] = array(
                'url' => '#logout',
                'id' => 'signout',
                'title' => __('Logout'),
                'icon' => 'im im-sign-out',
                'justicon' => true,
                'tooltip' => __('Sign out')
            );
        }

        // admin link
        if ($user->isLoggedIn() && $user->isAdmin()
            && DatawrapperHooks::hookRegistered(DatawrapperHooks::GET_ADMIN_PAGES)) {
            $adminLink = array(
                'url' => '/admin',
                'id' => 'admin',
                'title' => '&nbsp; Admin',
                'icon' => 'fa fa-magic',
                'justicon' => true,
                'tooltip' => __('Admin'),
                'dropdown' => [
                ]
            );
            $adm_pgs = DatawrapperHooks::execute(DatawrapperHooks::GET_ADMIN_PAGES);
            // // order admin pages by index "order"
            usort($adm_pgs, function($a, $b) {
                return (isset($a['order']) ? $a['order'] : 9999) - (isset($b['order']) ? $b['order'] : 9999);
            });
            $adm_groups = [];
            foreach ($adm_pgs as $adm_pg) {
                if (empty($adm_pg['hide'])) {
                    $adm_group = __('Other');
                    if (isset($adm_pg['group'])) $adm_group = $adm_pg['group'];
                    if (!isset($adm_groups[$adm_group])) $adm_groups[$adm_group] = [];
                    $adm_groups[$adm_group][] = [
                        'url' => '/admin'.$adm_pg['url'],
                        'title' => $adm_pg['title'],
                        'icon' => empty($adm_pg['icon']) ? null : 'fa '.$adm_pg['icon']
                    ];
                }
            }
            foreach ($adm_groups as $grp => $items) {
                # code...
                $adminLink['dropdown'][] = [
                    'title' => $grp,
                    'group' => true
                ];
                foreach ($items as $item) $adminLink['dropdown'][] = $item;
            }
            $headlinks[] = $adminLink;
            $headlinks[] = 'divider';
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

    $page['alertMessage'] = '';
    if ($user->isAdmin()) {
        $plugin_status = check_plugins();
        if (!empty($plugin_status)) $page['alertMessage'] .= $plugin_status;
    }
    if (isset($GLOBALS['dw_alert'])) $page['alertMessage'] .= $GLOBALS['dw_alert'];
    if (isset($GLOBALS['dw_alert_class'])) $page['alertClass'] = $GLOBALS['dw_alert_class'];

    if (isset($config['system-notification'])) {
        if (empty($user->getUserData()[$config['system-notification']['key']])) {
            $page['alertMessage'] = $config['system-notification']['message'].' &nbsp; <a href=\'javascript:$(".dw-alert-message").remove();dw.backend.setUserData({"'.$config['system-notification']['key'].'": 1})\'><i class="fa fa-fw fa-check"></i>Got it!</a>';
        }
    }

    foreach ($headlinks as $i => $link) {
        if ($link == 'divider') continue;
        $headlinks[$i]['active'] = $headlinks[$i]['id'] == $active;
    }
    $user = DatawrapperSession::getUser();
    $page['headlinks'] = $headlinks;
    $page['favicon'] = $config['custom_favicon'] ?? (($config['debug'] ?? false) ? 'favicon-dev.png' : 'favicon.png');
    $page['user'] = $user;
    $userData = $user->isLoggedIn() ? $user->getUserData() : false;
    if (is_array($userData)) {
        // remove keys that start with "."
        $f = array_filter(array_keys($userData), function($k) { return $k[0] != '.'; });
        $userData = array_intersect_key($userData, array_flip($f));
    }
    $page['userData'] = $userData;
    $page['language'] = substr(DatawrapperSession::getLanguage(), 0, 2);
    $page['locale'] = DatawrapperSession::getLanguage();
    $page['DW_DOMAIN'] = $config['domain'];
    $page['DW_VERSION'] = DATAWRAPPER_VERSION;
    $page['COMMIT_SHA'] = DATAWRAPPER_VERSION;
    $page['ASSET_DOMAIN'] = $config['asset_domain'];
    $page['APP_DOMAIN'] = defined('APP_DOMAIN') ? APP_DOMAIN : "app";
    $page['API_DOMAIN'] = $config['api_domain'];
    $page['IMG_DOMAIN'] = isset($config['img_domain']) ? $config['img_domain'] : 'img.datawrapper.de';
    $page['DW_CHART_CACHE_DOMAIN'] = $config['chart_domain'];
    $page['SUPPORT_EMAIL'] = $config['email']['support'];
    $page['DW_AUTH_SALT'] = DW_AUTH_SALT;
    $page['config'] = $config;
    $page['page_css'] = $page_css;
    $page['invert_navbar'] = isset($config['invert_header']) && $config['invert_header'] || substr($config['domain'], -4) == '.pro';
    $page['noSignup'] = $config['prevent_guest_access'];
    $page['alternative_signins'] = DatawrapperHooks::execute(DatawrapperHooks::ALTERNATIVE_SIGNIN);
    global $__l10n;
    $page['messages'] = $__l10n->getClientMessages();
    $page['messages_hash'] = $__l10n->getClientMessagesHash();
    if (!empty($_COOKIE['DW-MESSAGES-HASH']) && $_COOKIE['DW-MESSAGES-HASH'] ==  $page['messages_hash']) {
        // the client aleady has a cache of the messages, let's not send them again
        // to save some bandwidth!
        $page['messages'] = new stdClass();
    }
    if (empty($page['dependencies'])) {
        $page['dependencies'] = ['dayjs' => false];
    }

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
                $version = $asset[2] ?? substr(md5($plugin->getLastInstallTime()), 0, 8);
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

    if (file_exists(ROOT_PATH . 'sha')) {
        $commit = file_get_contents(ROOT_PATH . 'sha');
        $page['COMMIT_SHA'] = substr($commit, 0, 8);

        if ($config['debug'] ?? false) {
            try {
                if (file_exists('../.git/HEAD')) {
                    // parse git branch
                    $head = file_get_contents('../.git/HEAD');
                    $parts = explode("/", $head);
                    $branch = trim($parts[count($parts)-1]);
                    $page['COMMIT_SHA'] = substr($commit, 0, 8);
                    if ($config['debug']) {
                        $page['BRANCH'] = ' (<a href="https://github.com/datawrapper/datawrapper/tree/'.$commit.'">'.$branch.'</a>)';
                    }
                }
            } catch (Error $e) {
            }
        }
    }
}
