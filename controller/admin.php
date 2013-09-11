<?php


function add_adminpage_vars(&$page, $active) {
    $page['adminmenu'] = array();
    global $__dw_admin_pages;
    foreach ($__dw_admin_pages as $admin_page) {
        $page['adminmenu'][$admin_page['url']] = $admin_page['title'];
    }
    /*$page['adminmenu'] = array(
        '/admin' => 'Dashboard',
        '/admin/users' => 'Users',
        '/admin/themes' => 'Themes',
        '/admin/jobs' => 'Jobs',
    );*/
    /*$q = JobQuery::create()->filterByStatus('queued')->count();
    if ($q > 0) $page['adminmenu']['/admin/jobs'] .= ' <span class="badge badge-info">'.$q.'</span>';
    $f = JobQuery::create()->filterByStatus('failed')->count();
    if ($f > 0) $page['adminmenu']['/admin/jobs'] .= ' <span class="badge badge-important">'.$f.'</span>';*/
    $page['adminactive'] = $active;
}

$__dw_admin_pages = DatawrapperHooks::execute(DatawrapperHooks::GET_ADMIN_PAGES);
  // order by index "order"
usort($__dw_admin_pages, function($a, $b) {
    return (isset($a['order']) ? $a['order'] : 9999) - (isset($b['order']) ? $b['order'] : 9999);
});

foreach ($__dw_admin_pages as $admin_page) {
    $app->get('/admin' . $admin_page['url'], function() use ($app, $admin_page) {
        disable_cache($app);
        $user = DatawrapperSession::getUser();
        if ($user->isAdmin()) {
            $page_vars = array('title' => $admin_page['title']);
            add_header_vars($page_vars, 'admin');
            add_adminpage_vars($page_vars, $admin_page['url']);
            call_user_func_array($admin_page['controller'], array($app, $page_vars));
        } else {
            $app->notFound();
        }
    });
}

