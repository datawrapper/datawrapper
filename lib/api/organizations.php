<?php


/*
 * creates new organization
 */
$app->post('/organizations', function() use ($app) {
    disable_cache($app);
    // only admins can create orgs
    if_is_admin(function() use ($app) {
        try {
            $params = json_decode($app->request()->getBody(), true);
            // check if organization id already exists
            if (OrganizationQuery::create()->findPk($params['id'])) {
                error('id-already-exists', 'Sorry, there is already an organization with that id.');
                return;
            }
            $org = new Organization();
            $org->setId($params['id']);
            $org->setName($params['name']);
            $org->setCreatedAt(time());
            $org->save();
            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});


/*
 * change organization
 */
$app->put('/organizations/:id', function($org_id) use ($app) {
    if_is_admin(function() use ($app, $org_id) {
        $org = OrganizationQuery::create()->findPk($org_id);
        if ($org) {
            $params = json_decode($app->request()->getBody(), true);
            $org->setName($params['name']);
            $org->save();
            ok();
        } else {
            return error('unknown-organization', 'Organization not found');
        }
    });
});



/*
 * delete organization
 */
$app->delete('/organizations/:id', function($org_id) use ($app) {
    if_is_admin(function() use ($app, $org_id) {
        $org = OrganizationQuery::create()->findPk($org_id);
        if ($org) {
            $org->setDeleted(true);
        } else {
            return error('unknown-organization', 'Organization not found');
        }
    });
});


/*
 * add user to organization
 */
$app->post('/organizations/:id/users', function($org_id) use ($app) {
    if_is_admin(function() use ($app, $org_id) {
        $org = OrganizationQuery::create()->findPk($org_id);
        if ($org) {
            $data = json_decode($app->request()->getBody(), true);
            foreach ($data as $u_id) {
                $u = UserQuery::create()->findPk($u_id);
                if ($u) {
                    $org->addUser($u);
                }
            }
            $org->save();
            ok();
        } else {
            return error('unknown-organization', 'Organization not found');
        }
    });
});

/*
 * remove user from organization
 */
$app->delete('/organizations/:id/users/:uid', function($org_id, $user_id) use ($app) {
    if_is_admin(function() use ($app, $org_id, $user_id) {
        $org = OrganizationQuery::create()->findPk($org_id);
        $user = UserQuery::create()->findPk($user_id);
        if ($org && $user) {
            $org->removeUser($user);
            $org->save();
            ok();
        } else {
            return error('unknown-organization-or-user', 'Organization or user not found');
        }
    });
});

/*
 * toggle plugin permissions of organization
 */
$app->put('/organizations/:id/plugins/:op/:plugin_id', function($org_id, $op, $plugin_id) use ($app) {
    if_is_admin(function() use ($app, $org_id, $op, $plugin_id) {
        $org = OrganizationQuery::create()->findPk($org_id);
        $plugin = PluginQuery::create()->findPk($plugin_id);
        if (!$org) return error('unknown-organization', 'Organization not found');
        if (!$plugin) return error('unknown-plugin', 'Plugin not found');
        if ($op == 'config') {
            $data = json_decode($app->request()->getBody(), true);
            // store custom config value
            $key = 'custom_config/' . $org->getId() . '/' . $data['key'];
            $q = PluginDataQuery::create()
                  ->filterByPlugin($plugin)
                  ->filterByKey($key)
                  ->findOne();
            if (is_null($data['value'])) {
                // remove value
                if ($q) $q->delete();
                ok();
            } else {
                // udpate value
                if (!$q) {
                    $q = new PluginData();
                    $q->setPlugin($plugin);
                    $q->setKey($key);
                }
                $q->setData($data['value']);
                $q->setStoredAt(time());
                $q->save();
                ok($q->toArray());
            }
        } else {
            // change plugin permission
            if ($org->hasPlugin($plugin)) {
                if ($op == 'remove' || $op == 'toggle') $org->removePlugin($plugin);
            } else {
                if ($op == '' || $op == 'toggle') $org->addPlugin($plugin);
            }
            $org->save();
            ok(array('active' => $org->hasPlugin($plugin)));
        }
    });
})->conditions(array('op' => '(remove|add|toggle|config)'));
