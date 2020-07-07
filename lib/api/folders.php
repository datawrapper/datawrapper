<?php

(function() use ($app) {

    /*
     * handles insert and update operations on folders
     */
    $upsertFolder = function($folder, $user, $payload) {
        if (empty($folder) && empty($payload['name']))
            return error('need-name', 'you must specify a name');

        // create folder if empty
        if (empty($folder)) {
            $folder = new Folder();
            $folder->setUserId($user->getId());
        }

        if (!isset($payload['organization'])) $payload['organization'] = null;
        if (!isset($payload['parent'])) $payload['parent'] = null;

        $old_owner = $folder->getOwnerId();

        // verify (new?) parent folder
        if (!empty($payload['parent'])) {
            // check if parent folder exists and user has access
            $parentFolder = FolderQuery::create()->findPk($payload['parent']);
            if (!$parentFolder->isValidParent($user, $payload['organization'])) {
                return error('parent-invalid', 'parent folder is invalid');
            }
            // check if parent == folder
            if ($parentFolder->getId() == $folder->getId()) {
                return error('move-folder-inside-itself', 'you can\'t move a folder inside itself!');
            }
            // check if parent id is a child folder
            $subtree_ids = $folder->getSubtreeFolderIds();
            if (!$folder->isNew() && in_array($parentFolder->getId(), $subtree_ids)) {
                return error('move-folder-inside-substree', 'you can\'t move a folder inside its own subtree!');
            }
            $folder->setParentId($parentFolder->getId());

            // use owner from parent folder
            if ($parentFolder->getType() == 'user') {
                $folder->setOrgId(null);
                $folder->setUserId($parentFolder->getUserId());
            } else {
                $folder->setOrgId($parentFolder->getOrgId());
                $folder->setUserId(null);
            }
            // folder overwrites organization
            unset($payload['organization']);

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

            if (empty($payload['folder'])) {
                // remove parent folder
                $folder->setParentId(null);
            }

        } else if (isset($payload['organization']) && $payload['organization'] === false) {
            $folder->setUserId($user->getId());
            $folder->setOrgId(null);
        }

        if (!$folder->isNew() && $folder->getOwnerId() != $old_owner) {
            $folder->propagateOwner();
        }

        // update name
        if (!empty($payload['name'])) {
            $new_name = trim($payload['name']);
            // but check if another folder
            $c = FolderQuery::create()
                ->filterByFolderName($new_name)
                ->filterByParentId($folder->getParentId())
                ->filterByUserId($folder->getUserId())
                ->filterByOrgId($folder->getOrgId())
                ->count();
            if ($c == 0) {
                $folder->setFolderName($payload['name']);
            } else {
                return error('duplicate-name', 'a folder with that name already exists');
            }
        }

        // move multiple charts into a folder
        if (!empty($payload['add'])) {
            $update = [
                'InFolder' => $folder->getFolderId(),
                'OrganizationId' => $folder->getOrgId()
            ];
            if ($folder->getType() == 'user') {
                $update['AuthorId'] = $folder->getUserId();
            }
            ChartQuery::create()->filterById($payload['add'])
                ->filterByUserAccess($user)
                ->update($update);
            Action::logAction($user, 'chart/move', '['.implode(',', $payload['add']).'] --> '.$folder->getFolderId());
        }

        return $folder;
    };


    /*
     * get list of folders for current user
     */
    $app->get('/folders', function() {
        if (!check_scopes(['folder:read'])) return;
        $user = DatawrapperSession::getUser();
        ok(FolderQuery::create()->getParsableFolders($user));
    });


    /*
     * get single folder
     */
    $app->get('/folders/:folder_id', function($folder_id) {
        if (!check_scopes(['folder:read'])) return;
        $user = DatawrapperSession::getUser();
        $folder = FolderQuery::create()->findPk($folder_id);

        if (empty($folder)) return error('not-found', 'folder not found');

        if (!$folder->isAccessibleBy($user)) {
            return error('access-denied', 'you dont have access to this folder');
        }
        ok($folder->serialize());
    })->conditions(array('folder_id' => '\d+'));


    /*
     * create a new folder
     */
    $app->post('/folders', function() use ($app, $upsertFolder) {
        if (!check_scopes(['folder:write'])) return;
        $user = DatawrapperSession::getUser();
        if (!$user->isLoggedIn())
            return error('access-denied', 'you must be logged in to create a folder');

        $payload = json_decode($app->request()->getBody(), true);

        $folder = $upsertFolder(null, $user, $payload);
        if ($folder instanceof Folder) {
            // not an error
            $folder->save();
            Action::logAction($user, 'folder/create', $folder->getId());
            ok($folder->serialize());
        }
    });


    /*
     * update a folder name or change parent folder
     */
    $app->put('/folders/:folder_id', function($folder_id) use ($app, $upsertFolder) {
        if (!check_scopes(['folder:write'])) return;
        $user = DatawrapperSession::getUser();
        if (!$user->isLoggedIn())
            return error('access-denied', 'you must be logged in to update a folder');
        $folder = FolderQuery::create()->findPk($folder_id);

        if (empty($folder)) return error('not-found', 'folder not found');

        if (!$folder->isAccessibleBy($user))
            return error('access-denied', 'you dont have access to this folder');

        $payload = json_decode($app->request()->getBody(), true);
        $folder = $upsertFolder($folder, $user, $payload);
        if ($folder instanceof Folder) {
            // not an error
            $folder->save();
            ok($folder->serialize());
        }
    })->conditions(array('folder_id' => '\d+'));


    /*
     * remove a folder, but move charts to parent folder first
     */
    $app->delete('/folders/:folder_id', function($folder_id) {
        if (!check_scopes(['folder:write'])) return;
        $user = DatawrapperSession::getUser();
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
        Action::logAction($user, 'folder/delete', $folder->getId());
        ok();
    })->conditions(array('folder_id' => '\d+'));


    /*
     * move charts into root folder
     */
    $app->put('/folders/root(/:org_id)?', function($org_id = false) use ($app){
        if (!check_scopes(['folder:write'])) return;
        $user = DatawrapperSession::getUser();
        if (!$user->isLoggedIn())
            return error('access-denied', 'you must be logged in to create a folder');
        $payload = json_decode($app->request()->getBody(), true);
        // make sure personal root is ok, too
        if ($org_id) {
            $org = OrganizationQuery::create()->findPk($org_id);
            if (!$org) return error('404', 'org not found');
            if (!$org->hasUser($user)) return error('404', 'no access');
        }
        if (empty($payload['add'])) {
            return error('no-charts', 'must provide ids of charts to move');
        }
        $update = [
            'InFolder' => null,
            'OrganizationId' => !empty($org_id) ? $org_id : null
        ];
        ChartQuery::create()->filterById($payload['add'])
            ->filterByUserAccess($user)
            ->update($update);
        Action::logAction($user, 'chart/move',
            '['.implode(',', $payload['add']).'] --> '.(!empty($org_id) ? $org_id : '(my charts)'));
        ok();
    });

})();

