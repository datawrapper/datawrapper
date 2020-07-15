<?php

/*
 * get list of all users
 * @needs admin
 */
$app->get('/users', function() use ($app) {
    if (!check_scopes(['user:read'])) return;
    $user = Session::getUser();
    if ($user->isAdmin()) {
        $userQuery = UserQuery::create()->filterByDeleted(false);
        if ($app->request()->get('email')) {
            $userQuery->filterByEmail($app->request()->get('email'));
        }
        $users = $userQuery->limit(100)->find();
        $res = array();
        foreach ($users as $user) {
            $res[] = $user->toArray();
        }
        ok($res);
    } else {
        error(403, 'Permission denied');
    }
});

$app->get('/users/:id', function($id) use ($app) {
    if (!check_scopes(['user:read'])) return;
    $user = Session::getUser();
    if ($user->isAdmin()) {
        ok(UserQuery::create()->findPK($id)->toArray());
    } else {
        error(403, 'Permission denied');
    }
});

define('DW_TOKEN_SALT', 'aVyyrmc2UpoZGJ3SthaKyGrFzaV3Z37iuFU4x5oLb_aKmhopz5md62UHn25Gf4ti');

function email_exists($email) {
    $r = UserQuery::create()->findOneByEmail($email);
    return isset($r);
}

$app->post('/user/:id/products', function($id) use ($app) {
    if (!check_scopes(['user:write'])) return;
	if_is_admin(function() use ($app, $id) {
		$user = UserQuery::create()->findPk($id);
		if ($user) {
			$data = json_decode($app->request()->getBody(), true);
			foreach ($data as $p_id => $expires) {
				$product = ProductQuery::create()->findPk($p_id);
				if ($product) {
					$up = new UserProduct();
					$up->setProduct($product);

					if ($expires) {
						$up->setExpires($expires);
					}

					$user->addUserProduct($up);
				}
			}
			$user->save();
			ok();
		} else {
			 error('user-not-found', 'no user found with that id');
		}
	});
});