<?php

function verify_path($path, $user_id, &$parent_id) {
    $traversed = true;
    foreach ($path as $segment) {
        if (empty($segment)) {
            // an empty segment at the end may be produced by slim
            break;
        }
        $db_seg = UserFolderQuery::create()->filterByUserId($user_id)->filterByParentId($parent_id)->findOneByFolderName($segment);
        if (empty($db_seg)) {
            $traversed = false;
            break;
        }
        $parent_id = $db_seg->getUfId();
    }

    return $traversed;
}

// $app->get('/mycharts/add2dir/:chart_id/:path+', function($chart_id, $path) use ($app) {
//     disable_cache($app);
//     $user = DatawrapperSession::getUser();

//     if ($user->isLoggedIn()) {
//         $user_id = $user->getId();
//         echo(json_encode(array(
//             'chart_id' => $chart_id,
//             'path' => $path
//         )));
//     } else {
//         json_reply(false, $app, 'User is not logged in.');
//     }
// });

$app->get('/mycharts/mkdir/(:path+/|):dirname/?', function($path = false, $dirname) use ($app){
    disable_cache($app);
    $user = DatawrapperSession::getUser();

    if ($user->isLoggedIn()) {
        $user_id = $user->getId();
        $folders = UserFolderQuery::create()->findByUserId($user_id);
        // Does the user have a root folder?
        if ($folders->count() == 0) {
            $rootfolder = new UserFolder();
            $rootfolder->setUserId($user_id)->setFolderName('ROOT')->setParentId(0)->save();
        }
        // find root
        $root_id = UserFolderQuery::create()->filterByUserId($user_id)->findOneByParentId(0)->getUfId();

        // does path exists? ("" is ok, too)
        if (verify_path($path, $user_id, $root_id)) {
            if (empty(UserFolderQuery::create()->filterByUserId($user_id)->findOneByFolderName($dirname))) {
                // Does not exist → create it!
                $new_folder = new UserFolder();
                // behold: $root_id was overwritten by verify_path()
                $new_folder->setUserId($user_id)->setFolderName($dirname)->setParentId($root_id)->save();
            }
            // does exists → that's ok, too
            ok();
            return;
        }
        error(409, 'Path does not exist.');
    } else {
        error(403, 'User is not logged in.');
    }
});