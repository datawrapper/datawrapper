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

// you should have veryfied $type is usable before calling this!
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
        $access_test = function($user, $chart) use (&$accessible) {
            $accessible = true;
        };
        if_chart_is_writable($chart_id, $access_test);

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
            if (empty($base_query->filterByUserId($user_id)->findOneByFolderName($dirname))) {
                // Does not exist → create it!
                $new_folder = new UserFolder();
                $new_folder->setUserId($user_id)->setFolderName($dirname)->setParentId($pv['pid'])->save();
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
