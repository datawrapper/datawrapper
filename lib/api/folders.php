<?php

function get_folder_base_query($type) {
    switch ($type) {
    case 'user':
        return UserFolderQuery::create();
    case 'organization':
        return OrganizationFolderQuery::create();
    default:
        return false;
    }
}

function verify_path($type, $path, $user_id, &$parent_id) {
    $traversed = true;
    foreach ($path as $segment) {
        if (empty($segment)) {
            // an empty segment at the end may be produced by slim
            break;
        }

        $base_query = get_folder_base_query($type);
        if (!$base_query) {
            return false;
        }

        $db_seg = $base_query->filterByUserId($user_id)->filterByParentId($parent_id)->findOneByFolderName($segment);
        if (empty($db_seg)) {
            $traversed = false;
            break;
        }
        $parent_id = $db_seg->getUfId();
    }

    return $traversed;
}


/**
 * make a chart available in a certain folder
 *
 * @param type the type of folder
 * @param chart the chart_id
 * @param folder the destination folder
 */
$app->put('/folders/chart/:type/:chart_id/:path+', function($type, $chart_id, $path) use ($app) {
    disable_cache($app);
    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
        $user_id = $user->getId();
        ok(json_encode(array(
            'chart_id' => $chart_id,
            'path' => $path
        )));
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
        if (!$base_query) {
            error('no-such-folder-type', "We don't have that type of folder(, yet?)");
            return;
        }

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
        if (verify_path($type, $path, $user_id, $root_id)) {
            if (empty($base_query->filterByUserId($user_id)->findOneByFolderName($dirname))) {
                // Does not exist → create it!
                $new_folder = new UserFolder();
                // behold: $root_id was overwritten by verify_path()
                $new_folder->setUserId($user_id)->setFolderName($dirname)->setParentId($root_id)->save();
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