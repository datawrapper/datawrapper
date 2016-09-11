<?php


class DatawrapperPlugin_AdminUsers extends DatawrapperPlugin {

    public function init() {
        $plugin = $this;
        // register plugin controller
        $this->registerAdminPage(function() use ($plugin) {
            return array(
                'url' => '/users',
                'title' => __('Users', $plugin->getName()),
                'controller' => array($plugin, 'users'),
                'group' => __('Users'),
                'icon' => 'fa-users',
                'order' => 1
            );
        });

        $this->declareAssets(
            array(
                'vendor/serious-toolkit/serious-widget.js',
                'dw.admin.users.js',
                'users.css'
            ),
            "|/admin/users|"
        );

        $user = DatawrapperSession::getUser();
        if ($user->isAdmin()) {
            $this->registerController(function($app) use ($plugin) {
                $app->get('/admin/users/:user_id', function($uid) use ($app, $plugin) {
                    $theUser = UserQuery::create()->findPk($uid);
                    $page = array(
                        'title' => 'Users » '.$theUser->guessName()
                    );

                    global $__dw_admin_pages;
                    // add admin pages to menu
                    foreach ($__dw_admin_pages as $adm_pg) {
                        if (empty($adm_pg['hide'])) {
                            $group = __('Other');

                            if (isset($adm_pg['group'])) $group = $adm_pg['group'];

                            if (!isset($page['adminmenu'][$group])) {
                                $page['adminmenu'][$group] = array();
                            }

                            $icon = "";

                            if (isset($adm_pg['icon'])) {
                                $icon = $adm_pg['icon'];
                            }

                            $page['adminmenu'][$group][] = array(
                                "title" => $adm_pg['title'],
                                "url" => $adm_pg['url'],
                                "icon" => $icon
                            );

                        }
                    }

                    add_header_vars($page, 'admin');
                    $page['the_user'] = $theUser;
                    $page['userPlugins'] = DatawrapperPluginManager::getUserPlugins($theUser->getId(), false);

                    $app->render('plugins/admin-users/admin-user-detail.twig', $page);
                });
            });
        }
    }

    /*
     * controller for admin users
     */
    public function users($app, $page) {
        $page = array_merge($page, array(
            'title' => __('Users'),
            'q' => $app->request()->params('q', '')
        ));

        $sort = $app->request()->params('sort', '');
        $user = DatawrapperSession::getUser();

        function getQuery($user) {
            global $app;
            $sort = $app->request()->params('sort', '');
            $query = UserQuery::create()
                ->filterByDeleted(false);
            $q = $app->request()->params('q');
            if ($q) {
                $query->where('email LIKE "%' . $q . '%" OR name LIKE "%' . $q . '%"');
            }
            if (!$user->isSysAdmin()) {
                $query->filterByRole('sysadmin', Criteria::NOT_EQUAL);
            }
            switch ($sort) {
                case 'name': $query->orderByName('asc'); break;
                case 'email': $query->orderByEmail('asc'); break;
                case 'created_at':
                default:
                    $query->orderBy('createdAt', 'desc'); break;
            }
            return $query;
        }

        $curPage = $app->request()->params('page', 0);
        $total   = getQuery($user)->count();
        $perPage = 50;
        $append  = '';

        if ($page['q']) {
            $append = '&q='.$page['q'];
        }

        if (!empty($sort)) {
            $append .= '&sort='.$sort;
        }

        add_pagination_vars($page, $total, $curPage, $perPage, $append);
        $page['users'] = getQuery($user)->limit($perPage)->offset($curPage * $perPage)->find();

        $app->render('plugins/admin-users/admin-users.twig', $page);
    }

}
