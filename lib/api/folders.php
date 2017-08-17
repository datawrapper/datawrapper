<?php

function get_folder_base_query($type, $id) {
    switch ($type) {
    case 'user':
        return FolderQuery::create()->filterByUserId($id);
    case 'organization':
        return FolderQuery::create()->filterByOrgId($id);
    default:
        error('no-such-folder-type', "We don't have that type of folder(, yet?)");
        return false;
    }
}

// you should have verified $type is usable before calling this!
function verify_path($type, $path, $parent_id, $id, $forbidden_id = false) {
    $base_query = get_folder_base_query($type, $id);
    $segment = array_shift($path);
    if (empty($segment))
        return array(
            'verified' => true,
            'pid' => $parent_id
        );

    $db_seg = $base_query->filterByParentId($parent_id)->findOneByFolderName($segment);
    if (empty($db_seg))
        return array('verified' => false);

    $folder_id = $db_seg->getFolderId();
    // This is used to verify that a certain folder is not part of the path.
    // Knowing this is important for "Move".
    if (!empty($forbidden_id) && $folder_id == $forbidden_id)
        return array('verified' => false);

    return verify_path($type, $path, $folder_id, $id);
}

function user_is_member_of($org_id) {
    $the_org = OrganizationQuery::create()->findOneById($org_id);

    if (empty($the_org)) {
        error('no-such-organization', 'The specified organization does not exist.');
        return;
    }

    $user = DatawrapperSession::getUser();
    if (!$user->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return false;
    }

    if ($the_org->hasUser($user))
        return true;

    error('not-a-member', 'The current user is not a member of the specified organization.');
    return false;
}

function add_chart_to_folder($app, $type, $chart_id, $path, $org_id = false) {
    disable_cache($app);

    $accessible = false;
    if_chart_is_writable($chart_id, function($user, $chart) use (&$accessible) {
        $accessible = true;
    });
    if(!$accessible) {
        error('access-denied', 'You may not (re)move this chart.');
        return;
    }

    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    $folders = $base_query->find();
    if ($folders->count() == 0) {
        error('no-folders', "This ".$type." hasn't got any folders of the requested type.");
        return;
    }

    // this should be save, because noone can delete his root folder manually (without DB access)
    $root_id = $base_query->findOneByParentId(null)->getFolderId();
    $pv = verify_path($type, $path, $root_id, $id);

    if (!$pv['verified']) {
        error('no-such-path', 'Path does not exist.');
        return;
    }

    $chart = ChartQuery::create()->findPK($chart_id);
    $chart->setInFolder($pv['pid'])->save();
    ok();
}

/**
 * make a chart available in a certain folder
 *
 * @param type the type of folder
 * @param org_id (if specified) the identifier of the organization
 * @param chart_id the charts id?
 * @param path the destination folder
 */
$app->put('/folders/chart/organization/:org_id/:chart_id/:path+', function($org_id, $chart_id, $path) use ($app) {
    if (!user_is_member_of($org_id)) return;
    add_chart_to_folder($app, 'organization', $chart_id, $path, $org_id);
});
$app->put('/folders/chart/user/:chart_id/:path+', function($chart_id, $path) use ($app) {
    if (!DatawrapperSession::getUser()->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }
    add_chart_to_folder($app, 'user', $chart_id, $path);
});

/**
 * remove a chart from a folder
 * when a chart is removed, its in_folder field will be set to NULL making it go back to all charts
 * bacause the chart can only be located in one folder it is not necessary to specify the path
 *
 * @param chart_id the charts id?
 */
$app->delete('/folders/chart/:chart_id', function($chart_id) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();

    if (!$user->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }

    $accessible = false;
    if_chart_is_writable($chart_id, function($user, $chart) use (&$accessible) {
        $accessible = true;
    });
    if(!$accessible) {
        error('access-denied', 'You may not (re)move this chart.');
        return;
    }

    $chart = ChartQuery::create()->findPK($chart_id);
    $chart->setInFolder(null)->save();

    ok();
});

function get_chart_list($app, $type, $path, $org_id = false) {
    disable_cache($app);

    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    if (!$path) {
        error('no-path', 'Will not list charts in root - use /api/charts.');
        return;
    }

    $root_id = $base_query->findOneByParentId(null)->getFolderId();
    if (empty($root_id)) {
        error('no-folders', "This user hasn't got any folders");
        return;
    }

    $pv = verify_path($type, $path, $root_id, $id);

    if (!$pv['verified']) {
        error('no-such-path', 'Path does not exist.');
        return;
    }

    $res = ChartQuery::create()->findByInFolder($pv['pid']);
    $mapped = array_map(function($entry) {
        return $entry->getId();
    }, (array)$res);
    ok($mapped);
}

/**
 * get an array of all chart ids in a folder
 *
 * @param type the type of folder
 * @param org_id (if specified) the identifier of the organization
 * @param path the destination folder
 */
$app->get('/folders/chart/organization/:org_id/(:path+|)/?', function($org_id, $path = false) use ($app) {
    if (!user_is_member_of($org_id)) return;
    get_chart_list($app, 'organization', $path, $org_id);
});
$app->get('/folders/chart/user/(:path+|)/?', function($path = false) use ($app) {
    if (!DatawrapperSession::getUser()->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }
    get_chart_list($app, 'user', $path);
});

function folder_mkdir($app, $type, $path, $dirname, $org_id = false) {
    disable_cache($app);

    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    $folders = $base_query->find();
    // Does the user have a root folder?
    if ($folders->count() == 0) {
        $rootfolder = new Folder();
        if ($org_id)
            $rootfolder->setOrgId($id)->setFolderName('ROOT')->save();
        else
            $rootfolder->setUserId($id)->setFolderName('ROOT')->save();
    }
    // find root
    $root_id = $base_query->findOneByParentId(null)->getFolderId();

    // does path exists? ("" is ok, too)
    $pv = verify_path($type, $path, $root_id, $id);
    if (!$pv['verified']) {
        error('no-such-path', 'Path does not exist.');
        return;
    }

    // We need a fresh base_query here! Don't ask me why, but we do. (tested)
    $base_query = get_folder_base_query($type, $id);
    $parent_id = $pv['pid'];
    if (empty($base_query->filterByParentId($parent_id)->findOneByFolderName($dirname))) {
        // Does not exist → create it!
        $new_folder = new Folder();
        if ($org_id)
            $new_folder->setOrgId($id)->setFolderName($dirname)->setParentId($parent_id)->save();
        else
            $new_folder->setUserId($id)->setFolderName($dirname)->setParentId($parent_id)->save();
    }
    // does exists → that's ok, too
    ok();
}

/**
 * create a new folder
 *
 * @param path the absolue path where the directory should be created
 * @param dirname the name of the directory to be created
 * @param org_id (if specified) the identifier of the organization
 */
$app->post('/folders/dir/organization/:org_id/(:path+/|):dirname/?', function($org_id, $path, $dirname) use ($app) {
    if (!user_is_member_of($org_id)) return;
    folder_mkdir($app, 'organization', $path, $dirname, $org_id);
});
$app->post('/folders/dir/user/(:path+/|):dirname/?', function($path, $dirname) use ($app) {
    if (!DatawrapperSession::getUser()->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }
    folder_mkdir($app, 'user', $path, $dirname);
});

function list_subdirs($type, $parent_id, $id) {
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;
    $subdirs = $base_query->findByParentId($parent_id);

    if ($subdirs->count() == 0) {
        return false;
    }

    $node = new stdClass();
    foreach ($subdirs as $dir) {
        $name = $dir->getFolderName();
        $dir_id = $dir->getFolderId();
        $data = new stdClass();
        $data->id = $dir_id;
        $data->charts = ChartQuery::create()->findByInFolder($dir_id)->count();
        $data->sub = list_subdirs($type, $dir_id, $id);
        $node->$name = $data;
    }

    return $node;
}

function subdir_wrapper($app, $type, $path, $org_id = false) {
    disable_cache($app);

    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();

    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    // find root
    $root_id = $base_query->findOneByParentId(null)->getFolderId();
    if (empty($root_id)) {
        error('no-folders', "This ".$type." hasn't got any folders");
        return;
    }

    // does path exists? ("" is ok, too)
    $pv = verify_path($type, $path, $root_id, $id);
    if (!$pv['verified']) {
        error('no-such-path', 'Path does not exist.');
        return;
    }

    ok(list_subdirs($type, $pv['pid'], $id));
}

/**
 * list all subdirectorys
 *
 * @param type the type of folder which should be listed
 * @param path the startding point in the dir tree
 * @param org_id (if specified) the identifier of the organization
 */
$app->get('/folders/dir/organization/:org_id/(:path+|)/?', function($org_id, $path = []) use ($app) {
    if (!user_is_member_of($org_id)) return;
    subdir_wrapper($app, 'organization', $path, $org_id);
});
$app->get('/folders/dir/user/(:path+|)/?', function($path = []) use ($app) {
    if (!DatawrapperSession::getUser()->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }
    subdir_wrapper($app, 'user', $path);
});

function delete_folder($app, $type, $path, $org_id = null) {
    disable_cache($app);

    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    // find root
    $root_id = $base_query->findOneByParentId(null)->getFolderId();
    if (empty($root_id)) {
        error('no-folders', "This ".$type." hasn't got any folders");
        return;
    }

    // does path exists? ("" can not happen!)
    $pv = verify_path($type, $path, $root_id, $id);
    if (!$pv['verified']) {
        error('no-such-path', 'Path does not exist.');
        return;
    }

    $current_id = $pv['pid'];
    $tree = list_subdirs($type, $current_id, $id);
    if ($tree) {
        error('remaining-subfolders', 'You have to remove all subdfolders, before you can delete a folder.');
        return;
    }

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
}

/**
 * delete a subfolder
 * root can not be removed
 * folders which still contain other subfolders can not be removed
 * if a folder contains charts, all of those will be moved to the parent folder
 *
 * @param type the type of folder which should be deleted
 * @param path the folder to be deleted
 * @param org_id (if specified) the identifier of the organization
 */
$app->delete('/folders/dir/organization/:org_id/:path+/?', function($org_id, $path) use ($app) {
    if (!user_is_member_of($org_id)) return;
    delete_folder($app, 'organization', $path, $org_id);
});
$app->delete('/folders/dir/user/:path+/?', function($path) use ($app) {
    if (!DatawrapperSession::getUser()->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }
    delete_folder($app, 'user', $path);
});

function move_folder($app, $type, $path, $org_id = false) {
    disable_cache($app);

    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    $dst = $app->request()->get('dst');
    if (empty($dst)) {
        error('no-destination', 'The destination to move this dir to was not set.');
        return;
    }

    $dst_path = explode('/', trim($dst,'/'));

    $root_id = $base_query->findOneByParentId(null)->getFolderId();
    if (empty($root_id)) {
        error('no-folders', "This ".$type." hasn't got any folders");
        return;
    }

    // do paths exists? ("" can not happen!)
    $pv = verify_path($type, $path, $root_id, $id);
    if (!$pv['verified']) {
        error('no-source-path', 'Source path does not exist.');
        return;
    }

    $current_id = $pv['pid'];
    // if current folder is part of the path, verification will fail
    $pv = verify_path($type, $dst_path, $root_id, $id, $current_id);
    if (!$pv['verified']) {
        error('no-destination-path', 'Destination path does not exist.');
        return;
    }

    $dst_id = $pv['pid'];
    FolderQuery::create()->findOneByFolderId($current_id)->setParentId($dst_id)->save();
    ok();
}

/**
 * move a folder to another folder
 * basically this means just to change the parent id of the folder
 *
 * @param type the type of folder which should be moved
 * @param path the folder to be moved
 * @param org_id (if specified) the identifier of the organization
 * @param dst (query string!) the destination folder
 */
$app->put('/folders/dir/user/:path+/?', function($path) use ($app) {
    if (!DatawrapperSession::getUser()->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }
    move_folder($app, 'user', $path);
});
$app->put('/folders/dir/organization/:org_id/:path+/?', function($org_id, $path) use ($app) {
    if (!user_is_member_of($org_id)) return;
    move_folder($app, 'organization', $path, $org_id);
});
