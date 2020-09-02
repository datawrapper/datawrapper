<?php

/*
 * list all organizations in which the current user is a member
 */
$apiTeamsGetUserTeams = function() use ($app) {
    if (!check_scopes(['team:read'])) return;
    $user = DatawrapperSession::getUser();

    if (!$user->isLoggedIn()) {
        error('access-denied', 'User is not logged in.');
        return;
    }

    $user_id = $user->getId();
    $organizations = UserOrganizationQuery::create()->findByUserId($user_id);
    $res = array();
    foreach ($organizations as $org) {
        if (!$org->getOrganization()->getDisabled())
            $res[] = $org->getOrganizationId();
    }

    ok($res);
};

$app->get('/(organizations|teams)/user', $apiTeamsGetUserTeams);

/*
 * get charts of an organization
 */
$app->get('/(organizations|teams)/:id/charts', function($org_id) use ($app) {
    if (!check_scopes(['team:read', 'chart:read'])) return;
    disable_cache($app);
    $user = DatawrapperSession::getUser();
    $org = OrganizationQuery::create()->findPk($org_id);
    if ($org) {
        if ($org->hasUser($user) || $user->isAdmin()) {
            $query = ChartQuery::create()
                ->filterByDeleted(false)
                ->orderByLastModifiedAt(Criteria::DESC)
                ->filterByOrganization($org);
            // filter by visualization
            $vis = $app->request()->get('vis');
            if (isset($vis)) {
                $vis = explode(',', $vis);
                $conds = array();
                foreach ($vis as $v) {
                    $query->condition($conds[] = 'c'.count($conds), 'Chart.Type = ?', $v);
                }
                $query->where($conds, 'or');
            }
            // filter by month
            $months = $app->request()->get('months');
            if (isset($months)) {
                $months = explode(',', $months);
                $conds = array();
                foreach ($months as $m) {
                    $query->condition($conds[] = 'c'.count($conds), 'DATE_FORMAT(Chart.CreatedAt, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")', $m.'-01');
                }
                $query->where($conds, 'or');
            }
            // filter by status
            $status = $app->request()->get('status');
            if (isset($status)) {
                $status = explode(',', $status);
                $conds = array();
                foreach ($status as $s) {
                    $query->condition($conds[] = 'c'.count($conds), 'Chart.LastEditStep ' .
                        ($s == 'published' ? ' >= 4' :
                         $s == 'visualized' ? ' = 3' : '< 3'));
                }
                $query->where($conds, 'or');
            }
            // generally ignore charts that have no data
            $query->where('Chart.LastEditStep > 0');
            // filter by search query
            $q = $app->request()->get('search');
            if (!empty($q)) {
                $query->join('Chart.User')
                    ->condition('c1', 'Chart.Title LIKE ?', '%'.$q.'%')
                    ->condition('c2', 'Chart.Metadata LIKE ?', '%"intro":"%'.$q.'%"%')
                    ->condition('c3', 'Chart.Metadata LIKE ?', '%"source-name":"%'.$q.'%"%')
                    ->condition('c4', 'Chart.Metadata LIKE ?', '%"source-url":"%'.$q.'%"%')
                    ->condition('c5', 'Chart.Id LIKE ?', '%'.$q.'%')
                    ->condition('c6', 'User.Email LIKE ?', '%'.$q.'%')
                    ->condition('c7', 'User.Name LIKE ?', '%'.$q.'%')
                    ->where(array('c1','c2','c3','c4','c5','c6','c7'), 'or');
            }

            $total = $query->count();
            // pagination
            $pagesize = 48;
            $page = $app->request()->get('page');
            if (!isset($page)) $page = 0;
            $query->limit($pagesize)->offset($page * $pagesize);
            // query result
            $charts = $query->find();
            // return as json
            $res = array();
            foreach ($charts as $chart) {
                $res[] = $app->request()->get('expand') ? $chart->serialize() : $chart->shortArray();
            }
            ok(array(
                'total' => $total,
                'charts' => $res,
                'page' => $page,
                'numPages' => ceil($total / $pagesize)));
        } else {
            return error('access-denied', 'You are not allowed to do this..');
        }
    } else {
        return error('unknown-organization', 'Organization not found');
    }
});
