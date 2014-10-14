<?php

/*
 * get list of all products
 */
$app->get('/products', function() use ($app) {
    disable_cache($app);
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

            if (isset($params['data'])) {
                $product->setData(json_encode($params['data']));
            }

            $product->save();
            ok($product->toArray());
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
            $product->setData(json_encode($params['data']));
			$product->save();
			ok($product->toArray());
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

        if (!$product) {
            return error('unknown-product', 'Product not found');
        }

        if ($product->hasActiveOrganization() || $product->hasActiveUser()) {
            return error('product-in-use', 'Product is still in use');
        }

		$product->setDeleted(true);
		$product->save();
		ok();
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
			foreach ($data as $newRelation) {
				$user = UserQuery::create()->findPk($newRelation['id']);
				if ($user) {
					$up = new UserProduct();
					$up->setUser($user);

					if ($newRelation['expires']) {
						$up->setExpires($newRelation['expires']);
					}

					$product->addUserProduct($up);
				}
			}
			try {
                $product->save();
                ok($up);
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});

$app->put('/products/:id/users', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$data = json_decode($app->request()->getBody(), true);
            $res  = array();

			try {
                foreach ($data as $relation) {
                    $op = UserProductQuery::create()
                            ->filterByProductId($id)
                            ->filterByUserId($relation['id'])
                            ->findOne();
                    $op->setExpires($relation['expires']);
                    $op->save();
                }
                ok($res);
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});

$app->delete('/products/:id/users', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$data = json_decode($app->request()->getBody(), true);
			foreach ($data as $userid) {
				$org = UserQuery::create()->findPk($userid);
				if ($org) {
					$product->removeUser($org);
				}
			}
			try {
                $product->save();
                ok();
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});

$app->post('/products/:id/organizations', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$data = json_decode($app->request()->getBody(), true);
            $res  = array();
			foreach ($data as $newRelation) {
				$org = OrganizationQuery::create()->findPk($newRelation['id']);
				if ($org) {
					$op = new OrganizationProduct();
					$op->setOrganization($org);

					if ($newRelation['expires']) {
						$op->setExpires($newRelation['expires']);
					}

					$product->addOrganizationProduct($op);
				}
                $res[] = $op;
			}
            try {
                $product->save();
                ok($res);
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});

$app->put('/products/:id/organizations', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$data = json_decode($app->request()->getBody(), true);
            $res  = array();

			try {
                foreach ($data as $relation) {
                    $op = OrganizationProductQuery::create()
                            ->filterByProductId($id)
                            ->filterByOrganizationId($relation['id'])
                            ->findOne();
                    $op->setExpires($relation['expires']);
                    $op->save();
                }
                ok($res);
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});

$app->delete('/products/:id/organizations', function($id) use ($app) {
	if_is_admin(function() use ($app, $id) {
		$product = ProductQuery::create()->findPk($id);
		if ($product) {
			$data = json_decode($app->request()->getBody(), true);
			foreach ($data as $orgid) {
				$org = OrganizationQuery::create()->findPk($orgid);
				if ($org) {
					$product->removeOrganization($org);
				}
			}
			try {
                $product->save();
                ok();
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
		} else {
			return error('unknown-product', 'Product not found');
		}
	});
});
