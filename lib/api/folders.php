<?php

function get_folder_base_query($type, $user_id, $org_id = false) {
    switch ($type) {
    case 'user':
        return FolderQuery::create()->filterByUserId($user_id);
    case 'organization':
        // unimplmented
        return false;
    default:
        error('no-such-folder-type', "We don't have that type of folder(, yet?)");
        return false;
    }
}

// you should have verified $type is usable before calling this!
function verify_path($type, $path, $parent_id, $user_id, $org_id = false) {
    $base_query = get_folder_base_query($type, $user_id);
    $segment = array_shift($path);
    if (empty($segment)) {
        return array(
            'verified' => true,
            'pid' => $parent_id
        );
    }

    $db_seg = $base_query->filterByParentId($parent_id)->findOneByFolderName($segment);
    if (empty($db_seg)) {
        return array('verified' => false);
    }

    return verify_path($type, $path, $db_seg->getFolderId(), $user_id);
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

        $user_id = $user->getId();
        $base_query = get_folder_base_query($type, $user_id);
        if (!$base_query) {
            return;
        }

        $folders = $base_query->find();
        if ($folders->count() == 0) {
            error('no-folders', "This user hasn't got any folders of the requested type.");
        }

        // this should be save, because noone can delete his root folder manually (without DB access)
        $root_id = $base_query->findOneByParentId(null)->getFolderId();
        $pv = verify_path($type, $path, $root_id, $user_id);

        if ($pv['verified']) {
            $chart = ChartQuery::create()->findPK($chart_id);
            $chart->setInFolder($pv['pid'])->save();
            ok();
        } else {
            error('no-such-path', 'Path does not exist.');
        }
    } else {
        error('access-denied', 'User is not logged in.');
    }
});


/**
 * remove a chart from a folder
 * when a chart is removed, its in_folder field will be set to NULL making it go back to all charts
 * bacause the chart can only be located in one folder it is not necessary to specify the path
 *
 * @param type the type of folder
 * @param chart_id the charts id?
 */
$app->delete('/folders/chart/:type/:chart_id', function($type, $chart_id) use ($app) {
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

        $chart = ChartQuery::create()->findPK($chart_id);
        $chart->setInFolder(null)->save();

        ok();
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
        $user_id = $user->getId();
        $base_query = get_folder_base_query($type, $user_id);
        if (!$base_query) return;

        if (!$path) {
            error('no-path', 'Will not list charts in root - use /api/charts.');
            return;
        }

        $root_id = $base_query->findOneByParentId(null)->getFolderId();
        if (empty($root_id)) {
            error('no-folders', 'This user hasn\'t got any folders');
            return;
        }

        $pv = verify_path($type, $path, $root_id, $user_id);

        if ($pv['verified']) {
            $res = ChartQuery::create()->findByInFolder($pv['pid']);

            $mapped = array_map(function($entry) {
                return $entry->getId();
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
        $user_id = $user->getId();
        $base_query = get_folder_base_query($type, $user_id);
        if (!$base_query) return;

        $folders = $base_query->find();
        // Does the user have a root folder?
        if ($folders->count() == 0) {
            $rootfolder = new Folder();
            $rootfolder->setUserId($user_id)->setFolderName('ROOT')->save();
        }
        // find root
        $root_id = $base_query->findOneByParentId(null)->getFolderId();

        // does path exists? ("" is ok, too)
        $pv = verify_path($type, $path, $root_id, $user_id);
        if ($pv['verified']) {
            // We need a fresh base_query here! Don't ask me why, but we do. (tested)
            $base_query = get_folder_base_query($type, $user_id);
            $parent_id = $pv['pid'];
            if (empty($base_query->filterByParentId($parent_id)->findOneByFolderName($dirname))) {
                // Does not exist → create it!
                $new_folder = new Folder();
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

function list_subdirs($type, $parent_id, $user_id, $org_id = false) {
    $base_query = get_folder_base_query($type, $user_id);
    $subdirs = $base_query->findByParentId($parent_id);

    $node = new stdClass();

    if ($subdirs->count() == 0) {
        return false;
    }

    foreach ($subdirs as $dir) {
        $name = $dir->getFolderName();
        $dir_id = $dir->getFolderId();
        $data = new stdClass();
        $data->id = $dir_id;
        $data->charts = ChartQuery::create()->findByInFolder($dir_id)->count();
        $data->sub = list_subdirs($type, $dir_id, $user_id);
        $node->$name = $data;
    }

    return $node;
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
        $user_id = $user->getId();
        $base_query = get_folder_base_query($type, $user_id);
        if (!$base_query) return;

        // find root
        $root_id = $base_query->findOneByParentId(null)->getFolderId();
        if (empty($root_id)) {
            error('no-folders', 'This user hasn\'t got any folders');
            return;
        }

        // does path exists? ("" is ok, too)
        $pv = verify_path($type, $path, $root_id, $user_id);
        if ($pv['verified']) {
            ok(list_subdirs($type, $pv['pid'], $user_id));
            return;
        }
        error('no-such-path', 'Path does not exist.');
    } else {
        error('access-denied', 'User is not logged in.');
    }
});


/**
 * delete a subfolder
 * root can not be removed
 * folders which still contain other subfolders can not be removed
 * if a folder contains charts, all of those will be moved to the parent folder
 *
 * @param type the type of folder which should be deleted
 * @param path the folder to be deleted
 */
$app->delete('/folders/dir/:type/:path+/?', function($type, $path) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
        $user_id = $user->getId();
        $base_query = get_folder_base_query($type, $user_id);
        if (!$base_query) return;

        // find root
        $root_id = $base_query->findOneByParentId(null)->getFolderId();
        if (empty($root_id)) {
            error('no-folders', 'This user hasn\'t got any folders');
            return;
        }

        // does path exists? ("" can not happen!)
        $pv = verify_path($type, $path, $root_id, $user_id);
        if ($pv['verified']) {
            $parent_id = $pv['pid'];
            $tree = list_subdirs($type, $parent_id, $user_id);
            if (!$tree) {
                $current_id = $parent_id;
                $current_folder = FolderQuery::create()->findOneByFolderId($current_id);
                $parent_id = $current_folder->getParentId();
                if ($parent_id == $root_id) {
                    // prevent charts to go back to the virtual root folder
                    $parent_id = null;
                }
                $charts = ChartQuery::create()->findByInFolder($current_id);
                foreach ($charts as $chart) {
                    $chart->setInFolder($parent_id)->save();
                }
                //finally delete folder
                $current_folder->delete();
                ok();
            } else {
                error('remaining-subfolders', 'You have to remove all subdfolders, before you can delete a folder');
            }
        } else {
            error('no-such-path', 'Path does not exist.');
        }
    } else {
        error('access-denied', 'User is not logged in.');
    }
});
