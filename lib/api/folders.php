<?php

function get_folder_base_query($type) {
    switch ($type) {
    case 'user':
        return UserFolderQuery::create();
    case 'organization':
        return OrganizationFolderQuery::create();
    default:
        error('no-such-folder-type', "We don't have that type of folder(, yet?)");
        return false;
    }
}

// you should have verified $type is usable before calling this!
function verify_path($type, $path, $user_id, $parent_id) {
    $base_query = get_folder_base_query($type);
    $segment = array_shift($path);
    if (empty($segment)) {
        return array(
            'verified' => true,
            'pid' => $parent_id
        );
    }

    $db_seg = $base_query->filterByUserId($user_id)->filterByParentId($parent_id)->findOneByFolderName($segment);
    if (empty($db_seg)) {
        return array('verified' => false);
    }

    return verify_path($type, $path, $user_id, $db_seg->getUfId());
}


/**
 * make a chart available in a certain folder
 *
 * @param type the type of folder
 * @param chart_id the charts id?
 * @param path the destination folder
 */
$app->put('/folders/chart/:type/:chart_id/:path+', function($type, $chart_id, $path) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
        $accessible = false;
        if_chart_is_writable($chart_id, function($user, $chart) use (&$accessible) {
            $accessible = true;
        });
        if(!$accessible) {
            return;
        }

        $base_query = get_folder_base_query($type);
        if (!$base_query) {
            return;
        }

        $user_id = $user->getId();
        $folders = $base_query->findByUserId($user_id);
        if ($folders->count() == 0) {
            error('no-folders', "This user hasn't got any folders of the requested type.");
        }

        // this should be save, because noone can delete his root folder manually (without DB access)
        $root_id = $base_query->filterByUserId($user_id)->findOneByParentId(0)->getUfId();
        $pv = verify_path($type, $path, $user_id, $root_id);

        if ($pv['verified']) {
            $uo_folder = $pv['pid'];
            if ($type == 'user') {
                $old_link = ChartFolderQuery::create()->filterByChartId($chart_id)->findOneByUsrFolder($uo_folder);
                if (!empty($old_link)) {
                    ok();
                    return;
                }
                // this IS new. link it
                $cf = new ChartFolder();
                $cf->setChartId($chart_id)->setUsrFolder($uo_folder)->save();
            } else {
                //everything but organiztion would not have gotten that far
                $old_link = ChartFolderQuery::create()->filterByChartId($chart_id)->findOneByOrgFolder($uo_folder);
                if (!empty($old_link)) {
                    ok();
                    return;
                }
                $cf = new ChartFolder();
                $cf->setChartId($chart_id)->setOrgFolder($uo_folder)->save();
            }
            ok();
        } else {
            error('no-such-path', 'Path does not exist.');
        }
    } else {
        error('access-denied', 'User is not logged in.');
    }
});


/**
 * get an array of all chart ids in a folder
 *
 * @param type the type of folder
 * @param path the destination folder
 */
$app->get('/folders/chart/:type/(:path+|)/?', function($type, $path = false) use ($app) {
    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
        $base_query = get_folder_base_query($type);
        if (!$base_query) return;

        if (!$path) {
            error('no-path', 'Will not list charts in root - use /api/charts.');
            return;
        }

        $user_id = $user->getId();
        $root_id = $base_query->filterByUserId($user_id)->findOneByParentId(0)->getUfId();
        if (empty($root_id)) {
            error('no-folders', 'This user hasn\'t got any folders');
            return;
        }
        $pv = verify_path($type, $path, $user_id, $root_id);

        if ($pv['verified']) {
            $folder_id = $pv['pid'];
            $q = ChartFolderQuery::create();
            if ($type == 'user') {
                $res = $q->findByUsrFolder($folder_id);
            } else {
                $res = $q->findByOrgFolder($folder_id);
            }
            $mapped = array_map(function($entry) {
                return $entry->getChartId();
            }, (array)$res);
            ok($mapped);
        } else {
            error('no-such-path', 'Path does not exist.');
        }
    } else {
        error('access-denied', 'User is not logged in.');
    }
});


/**
 * create a new folder
 *
 * @param type the type of folder which should be created
 * @param path the absolue path where the directory should be created
 * @param dirname the name of the directory to be created
 */
$app->put('/folders/dir/:type/(:path+/|):dirname/?', function($type, $path, $dirname) use ($app){
    disable_cache($app);
    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
        $base_query = get_folder_base_query($type);
        if (!$base_query) return;

        $user_id = $user->getId();
        $folders = $base_query->findByUserId($user_id);
        // Does the user have a root folder?
        if ($folders->count() == 0) {
            $rootfolder = new UserFolder();
            $rootfolder->setUserId($user_id)->setFolderName('ROOT')->setParentId(0)->save();
        }
        // find root
        $root_id = $base_query->filterByUserId($user_id)->findOneByParentId(0)->getUfId();

        // does path exists? ("" is ok, too)
        $pv = verify_path($type, $path, $user_id, $root_id);
        if ($pv['verified']) {
            // We need a fresh base_query here! Don't ask me why, but we do. (tested)
            $base_query = get_folder_base_query($type);
            $parent_id = $pv['pid'];
            if (empty($base_query->filterByUserId($user_id)->filterByParentId($parent_id)->findOneByFolderName($dirname))) {
                // Does not exist → create it!
                $new_folder = new UserFolder();
                $new_folder->setUserId($user_id)->setFolderName($dirname)->setParentId($parent_id)->save();
            }
            // does exists → that's ok, too
            ok();
            return;
        }
        error('no-such-path', 'Path does not exist.');
    } else {
        error('access-denied', 'User is not logged in.');
    }
});

function list_subdirs($type, $user_id, $parent_id) {
    $base_query = get_folder_base_query($type);
    $subdirs = $base_query->filterByUserId($user_id)->findByParentId($parent_id);

    var_export($subdirs);

    // if (empty($subdirs))
        return array();

    $mapped = array_map(function($dir) use ($type, $user_id) {
        $base_query = get_folder_base_query($type);
        if ($type == 'user') {
            $dir_id = $base_query->filterByUserId($user_id)->findByParentId($dir->getUfId());
        } else {
            $dir_id = $base_query->filterByUserId($user_id)->findByParentId($dir->getOfId());
        }
        return list_subdirs($type, $user_id, $dir_id);
    }, (array) $subdirs);

    return $mapped;
}

/**
 * list all subdirectorys
 * 
 * @param type the type of folder which should be listed
 * @param path the startding point in the dir tree
 */ 
$app->get('/folders/dir/:type/(:path+|)/?', function($type, $path = []) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
        $base_query = get_folder_base_query($type);
        if (!$base_query) return;

        $user_id = $user->getId();
        $folders = $base_query->findByUserId($user_id);

        // find root
        $root_id = $base_query->filterByUserId($user_id)->findOneByParentId(0)->getUfId();

        // does path exists? ("" is ok, too)
        $pv = verify_path($type, $path, $user_id, $root_id);
        if ($pv['verified']) {
            ok(list_subdirs($type, $user_id, $pv['pid']));
            return;
        }
        error('no-such-path', 'Path does not exist.');
    } else {
        error('access-denied', 'User is not logged in.');
    }
});
