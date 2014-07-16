<?php

/*
 * get list of all products
 */
$app->get('/products', function() use ($app) {
	if_is_admin(function() use ($app) {
		try {
			$products = ProductQuery::create()->filterByDeleted(false)->find();
			$res      = array();
			foreach ($products as $product) {
				$res[] = $product->toArray();
			}
			ok($res);
		} catch (Exception $e) {
			error('io-error', $e->getMessage());
		}
	});
});

/*
 * create new product
 */
$app->post('/products', function() use ($app) {
	disable_cache($app);
	// only admins can create products
	if_is_admin(function() use ($app) {
		try {
			$params  = json_decode($app->request()->getBody(), true);
			$product = new Product();
			$product->setName($params['name']);
			$product->setCreatedAt(time());
			$product->save();
			ok();
		} catch (Exception $e) {
			error('io-error', $e->getMessage());
		}
	});
});

/*
 * create new product
 */
$app->post('/products', function() use ($app) {
	disable_cache($app);
	// only admins can create products
	if_is_admin(function() use ($app) {
		try {
			$params  = json_decode($app->request()->getBody(), true);
			$product = new Product();
			$product->setName($params['name']);
			$product->setCreatedAt(time());
			$product->save();
			ok();
		} catch (Exception $e) {
			error('io-error', $e->getMessage());
		}
	});
});


/*
 * change product
 */
$app->put('/products/:id', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$params = json_decode($app->request()->getBody(), true);
			$product->setName($params['name']);
			$product->save();
			ok();
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});



/*
 * delete product
 */
$app->delete('/products/:id', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$product->setDeleted(true);
			$product->save();
			ok();
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});


/*
 * add plugin to product
 */
$app->post('/products/:id/plugins', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);

		if (!$product) {
			return error('unknown-product', 'Product not found');
		}

		try {
			$data = json_decode($app->request()->getBody(), true);
			foreach ($data as $pid) {
				$plugin = PluginQuery::create()->findPk($pid);
				if ($plugin && $plugin->getEnabled()) {
					$product->addPlugin($plugin);
				}
			}
			$product->save();
			ok();
		} catch (Exception $e) {
			error('io-error', $e->getMessage());
		}
	});
});

/*
 * remove plugin from product
 */
$app->delete('/products/:id/plugins', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);

		if (!$product) {
			return error('unknown-product', 'Product not found');
		}

		try {
			$data = json_decode($app->request()->getBody(), true);
			foreach ($data as $pid) {
				$plugin = PluginQuery::create()->findPk($pid);
				if ($plugin && $product->hasPlugin($plugin)) {
					$product->removePlugin($plugin);
				}
			}
			$product->save();
			ok();
		} catch (Exception $e) {
			error('io-error', $e->getMessage());
		}
	});
});


$app->post('/products/:id/users', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$data = json_decode($app->request()->getBody(), true);
			foreach ($data as $u_id => $expires) {
				$user = UserQuery::create()->findPk($u_id);
				if ($user) {
					$up = new UserProduct();
					$up->setUser($user);

					if ($expires) {
						$up->setExpires($expires);
					}

					$product->addUserProduct($up);
				}
			}
			$product->save();
			ok();
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});