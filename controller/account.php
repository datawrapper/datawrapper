<?php

require_once ROOT_PATH . 'controller/account/activate.php';
require_once ROOT_PATH . 'controller/account/set-password.php';
require_once ROOT_PATH . 'controller/account/reset-password.php';

require_once ROOT_PATH . 'controller/team/invites.php';
require_once ROOT_PATH . 'controller/team/activate.php';
require_once ROOT_PATH . 'controller/team/settings.php';

call_user_func(function() {
    global $app;

    // redirect to settings
    $app->get('/settings/?', function() use ($app) {
        $app->redirect('/account');
    });

    $app->get('/account(/:tab)?', function($tab = null) use ($app) {
        disable_cache($app);

        if (Session::isLoggedIn()) {
            $user = Session::getUser();

            $pages = [];
            $pluginPages = Hooks::execute(Hooks::GET_ACCOUNT_PAGES, $user);
            if (is_array($pluginPages)) {
                foreach ($pluginPages as &$page) {
                    if ($page === null) continue;
                    if (!isset($page['order'])) $page['order'] = 999;
                    if (isset($page['data']) && is_callable($page['data'])) {
                        $page['data'] = $page['data']();
                    }
                    $pages[] = $page;
                }
            }

            usort($pages, function($a, $b) { return $a['order'] - $b['order']; });

            $teams = [];
            $adminTeams = [];
            foreach ($user->getActiveOrganizations() as $team) {
                $teams[] = [
                    'id' => $team->getId(),
                    'name' => $team->getName(),
                    'role' => $team->getRole($user),
                    'charts' => $team->getChartCount(),
                    'members' => $team->getActiveUserCount(),
                    'invites' => $team->getPendingUserCount()
                ];
                if ($user->canAdministrateTeam($team)) {
                    $adminTeams[] = $team->toArray();
                }
            }
            $current = $user->getCurrentOrganization();
            $invitations = [];
            foreach ($user->getPendingOrganizations() as $team) {
                $invite = $team->serialize();
                $invite['token'] = UserOrganizationQuery::create()->filterByUser($user)->filterByOrganization($team)->findOne()->getInviteToken();
                $invitations[] = $invite;
            }
            $context = [
                'svelte_data' => [
                    "user" => $user->serialize(),
                    "email" => $user->getEmail(),
                    "userId" => $user->getId(),
                    'currentTeam' => $current ? $current->getId() : null,
                    'teams' => $teams,
                    'adminTeams' => $adminTeams,
                    'pages' => $pages,
                    'invitations' => $invitations
                ]
            ];

            add_header_vars($context, 'account');
            $app->render('account.twig', $context);
        }
    });

});

