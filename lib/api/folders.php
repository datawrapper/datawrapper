<?php

// NEW API
(function() use ($app) {

    /*
     * get list of folders for current user
     */
    $app->get('/folders', function() {
        $user = DatawrapperSession::getUser();
        $user = UserQuery::create()->findPk(29);
        $folders = FolderQuery::create()->getUserFolders($user);
        foreach ($folders as $i => $group) {
            if ($group['type'] == 'organization') {
                $folders[$i]['organization'] = $group['organization']->serialize();
            }
            $folders[$i]['folders'] = [];
            foreach ($group['folders'] as $j => $fold) {
                $folders[$i]['folders'][] = $fold->serialize();
            }
        }
        ok($folders);
    });


    /*
     * get single folder
     */
    $app->get('/folders/:folder_id', function($folder_id) {
        $user = DatawrapperSession::getUser();
        $user = UserQuery::create()->findPk(29);
        $folder = FolderQuery::create()->findPk($folder_id);

        if (empty($folder)) return error('not-found', 'folder not found');

        if (!$folder->isAccessibleBy($user)) {
            return error('access-denied', 'you dont have access to this folder');
        }
        ok($folder->serialize());
    });


    /*
     * handles insert and update operations on folders
     */
    $upsertFolder = function($folder, $user, $payload) {
        if (empty($folder) && empty($payload['name']))
            return error('need-name', 'you must specify a name');

        $owner_changed = false;
        // create folder if empty
        if (empty($folder)) $folder = new Folder();
        // update name
        if (!empty($payload['name'])) $folder->setFolderName($payload['name']);

        if (!isset($payload['organization'])) $payload['organization'] = null;
        if (!isset($payload['parent'])) $payload['parent'] = null;

        // verify (new?) parent folder
        if (!empty($payload['parent'])) {
            // check if parent folder exists and user has access
            $parentFolder = FolderQuery::create()->findPk($payload['parent']);
            if (!$parentFolder->isValidParent($user, $payload['organization'])) {
                return error('parent-invalid', 'parent folder is invalid');
            }
            $folder->setParentId($parentFolder->getId());
            // use owner from parent folder
            if ($parentFolder->getType() == 'user') $payload['organization'] == false;
            else $payload['organization'] == $parentFolder->getOrgId();

        } else if ($payload['parent'] === false) {
            // we want to move the folder to the current root, w/o changing owner
            $folder->setParentId(null);
        }

        // verify organization
        if (!empty($payload['organization'])) {
            // load and verify organization
            $organization = OrganizationQuery::create()->findPk($payload['organization']);
            if (empty($organization) || !$organization->hasUser($user)) {
                return error('org-invalid', 'you dont have access to this organization');
            }
            // check if user has access to organization
            $folder->setOrgId($organization->getId());
            $folder->setUserId(null);
            $owner_changed = true;

        } else if ($folder->isNew() || $payload['organization'] === false) {
            $folder->setUserId($user->getId());
            $folder->setOrgId(null);
            $owner_changed = true;
        }

        if (!$folder->isNew() && $owner_changed) {
            $new_type = $folder->getType();
            $new_id = $new_type == 'organization' ? $payload['organization'] : $user->getId();
            $folder->changeOwner($new_type, $new_id);
        }
        return $folder;
    };


    /*
     * create a new folder
     */
    $app->post('/folders', function() use ($app, $upsertFolder) {
        $user = DatawrapperSession::getUser();
        $user = UserQuery::create()->findPk(29);
        if (!$user->isLoggedIn())
            return error('access-denied', 'you must be logged in to create a folder');

        $payload = json_decode($app->request()->getBody(), true);

        $folder = $upsertFolder(null, $user, $payload);
        $folder->save();
        ok($folder->serialize());
    });


    /*
     * update a folder name or change parent folder
     */
    $app->put('/folders/:folder_id', function($folder_id) use ($app, $upsertFolder) {
        $user = DatawrapperSession::getUser();
        $user = UserQuery::create()->findPk(29);
        if (!$user->isLoggedIn())
            return error('access-denied', 'you must be logged in to update a folder');
        $folder = FolderQuery::create()->findPk($folder_id);

        if (empty($folder)) return error('not-found', 'folder not found');

        if (!$folder->isAccessibleBy($user))
            return error('access-denied', 'you dont have access to this folder');

        $payload = json_decode($app->request()->getBody(), true);
        $folder = $upsertFolder($folder, $user, $payload);
        $folder->save();
        ok($folder->serialize());
    });


    /*
     * remove a folder, but move charts to parent folder first
     */
    $app->delete('/folders/:folder_id', function($folder_id) {
        $user = DatawrapperSession::getUser();
        $user = UserQuery::create()->findPk(29);
        if (!$user->isLoggedIn())
            return error('access-denied', 'you must be logged in to delete a folder');
        $folder = FolderQuery::create()->findPk($folder_id);
        if (empty($folder)) return error('not-found', 'folder not found');

        // check access
        if (!$folder->isAccessibleBy($user))
            return error('access-denied', 'you dont have access to this folder');

        // check if empty
        if ($folder->hasSubFolders())
            return error('has-subfolders', 'delete subfolders first');

        // move charts to parent folder
        $folder->moveChartsToParent();

        // delete folder
        $folder->delete();
    });

})();






// OLD API BELOW

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

function check_access($org_id) {
    $user = DatawrapperSession::getUser();
    if (!$user->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return false;
    }

    if ($org_id && !$user->isMemberOf($org_id)) {
        error('not-a-member', 'The current user is not a member of the specified organization.');
        return false;
    }

    return true;
}


/**
 * make a chart available in a certain folder
 *
 * @param type the type of folder
 * @param org_id (if specified) the identifier of the organization
 * @param chart_id the charts id?
 * @param path the destination folder
 */
$app->put('/folders/chart/(user|organization/:org_id)/:chart_id/(:path+)?', function($org_id = false, $chart_id, $path = false) use ($app) {
    if (!check_access($org_id)) return;

    disable_cache($app);

    $accessible = false;
    if_chart_is_writable($chart_id, function($user, $chart) use (&$accessible) {
        $accessible = true;
    });
    if(!$accessible) {
        error('access-denied', 'You may not (re)move this chart.');
        return;
    }

    $type = $org_id ? 'organization' : 'user';
    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    $folders = $base_query->find();
    if ($folders->count() == 0) {
        error('no-folders', "This ".$type." hasn't got any folders of the requested type.");
        return;
    }

    // this replaces the former DELETE operation
    if (!$path) {
        $chart = ChartQuery::create()->findPK($chart_id);
        $chart
            ->setInFolder(null)
            ->setOrganizationId(($org_id) ? $org_id : null)
            ->save();
        ok();
        return;
    }

    $root_folder = $base_query->findOneByParentId(null);
    if (empty($root_folder)) {
        error('no-folders', "This ".$type." hasn't got any folders");
        return;
    }
    $root_id = $root_folder->getFolderId();
    $pv = verify_path($type, $path, $root_id, $id);

    if (!$pv['verified']) {
        error('no-such-path', 'Path does not exist.');
        return;
    }

    $chart = ChartQuery::create()->findPK($chart_id);
    $chart
        ->setInFolder($pv['pid'])
        ->setOrganizationId(($org_id) ? $org_id : null)
        ->save();
    ok();
});


/**
 * get an array of all chart ids in a folder
 *
 * @param type the type of folder
 * @param org_id (if specified) the identifier of the organization
 * @param path the destination folder
 */
$app->get('/folders/chart/(user|organization/:org_id)/(:path+|)/?', function($org_id = false, $path = false) use ($app) {
    if (!check_access($org_id)) return;

    disable_cache($app);

    $type = $org_id ? 'organization' : 'user';
    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    if (!$path) {
        error('no-path', 'Will not list charts in root - use /api/charts.');
        return;
    }

    $root_folder = $base_query->findOneByParentId(null);
    if (empty($root_folder)) {
        error('no-folders', "This ".$type." hasn't got any folders");
        return;
    }
    $root_id = $root_folder->getFolderId();

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
});


/**
 * create a new folder
 *
 * @param path the absolue path where the directory should be created
 * @param dirname the name of the directory to be created
 * @param org_id (if specified) the identifier of the organization
 */
$app->post('/folders/dir/(user|organization/:org_id)/(:path+/|):dirname/?', function($org_id = false, $path, $dirname) use ($app) {
    if (!check_access($org_id)) return;

    disable_cache($app);

    $type = $org_id ? 'organization' : 'user';
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
});


function list_subdirs($type, $parent_id, $id) {
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;
    $subdirs = $base_query->orderByFolderName()->findByParentId($parent_id);

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

/**
 * list all subdirectorys
 *
 * @param type the type of folder which should be listed
 * @param path the startding point in the dir tree
 * @param org_id (if specified) the identifier of the organization
 */
$app->get('/folders/dir/(user|organization/:org_id)/(:path+|)/?', function($org_id = false, $path = []) use ($app) {
    if (!check_access($org_id)) return;

    disable_cache($app);

    $type = $org_id ? 'organization' : 'user';
    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();

    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    // find root

    $root_folder = $base_query->findOneByParentId(null);
    if (empty($root_folder)) {
        // this might actually be queried by mycharts, so just return empty object
        ok(new stdClass());
        return;
    }
    $root_id = $root_folder->getFolderId();;

    // does path exists? ("" is ok, too)
    $pv = verify_path($type, $path, $root_id, $id);
    if (!$pv['verified']) {
        error('no-such-path', 'Path does not exist.');
        return;
    }

    ok(list_subdirs($type, $pv['pid'], $id));
});


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
$app->delete('/folders/dir/(user|organization/:org_id)/:path+/?', function($org_id = false, $path) use ($app) {
    if (!check_access($org_id)) return;

    disable_cache($app);

    $type = $org_id ? 'organization' : 'user';
    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    // find root
    $root_folder = $base_query->findOneByParentId(null);
    if (empty($root_folder)) {
        error('no-folders', "This ".$type." hasn't got any folders");
        return;
    }
    $root_id = $root_folder->getFolderId();

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
});


/**
 * move a folder to another folder
 * basically this means just to change the parent id of the folder
 *
 * @param type the type of folder which should be moved
 * @param path the folder to be moved
 * @param org_id (if specified) the identifier of the organization
 * @param dst (query string!) the destination folder
 */
$app->put('/folders/dir/(user|organization/:org_id)/:path+/?', function($org_id = false, $path) use ($app) {
if (!check_access($org_id)) return;

    disable_cache($app);

    $type = $org_id ? 'organization' : 'user';
    $id = $org_id ? $org_id : DatawrapperSession::getUser()->getId();
    $base_query = get_folder_base_query($type, $id);
    if (!$base_query) return;

    $dst = $app->request()->get('dst');
    if (empty($dst)) {
        error('no-destination', 'The destination to move this dir to was not set.');
        return;
    }

    $dst_path = explode('/', trim($dst,'/'));

    $root_folder = $base_query->findOneByParentId(null);
    if (empty($root_folder)) {
        error('no-folders', "This ".$type." hasn't got any folders");
        return;
    }
    $root_id = $root_folder->getFolderId();

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
});
