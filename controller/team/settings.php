<?php

(function() {
	global $app;

	$getLocales = function() {
	    $cfg = $GLOBALS['dw_config'];

	    $availableLocales = [];

	    if (isset($cfg['plugins']['chart-locale-select']))  {
	        $availableLocales = explode(",", $cfg['plugins']['chart-locale-select']['locales']);

	        for ($i=0; $i<sizeof($availableLocales); $i++) {
	            $locale = explode("|", $availableLocales[$i]);

	            $availableLocales[$i] = [
	                "value" => $locale[0],
	                "label" => $locale[1] . " (" . $locale[0] . ")"
	            ];
	        }
	    }

	    return $availableLocales;
	};

	$getThemes = function($org) {
	    $cfg = $GLOBALS['dw_config'];
	    $themes = [];

	    $orgThemes = OrganizationThemeQuery::create()->findByOrganization($org);
	    $publicThemes = $cfg['default-themes'] ?? ['default'];

	    foreach ($orgThemes as $t) {
	        $themes[] = [
	            "value" => $t->getThemeId(),
	            "label" => $t->getTheme()->getTitle()
	        ];
	    }

	    foreach ($publicThemes as $tId) {
	        $t = ThemeQuery::create()->findPk($tId);

	        $themes[] = [
	            "value" => $t->getId(),
	            "label" => $t->getTitle()
	        ];
	    }

	    return $themes;
	};

	$getFolders = function($org) {
	    $folders = [[
	        'value' => null,
	        'label' => __('teams / defaults / none', 'organizations')
	    ]];

	    foreach ($org->getFolders() as $folder) {
	        $folders[] = [
	            'value' => $folder->getFolderId(),
	            'label' => $folder->getFolderName()
	        ];
	    }

	    return $folders;
	};

	$getVisArchive = function() {
	    $cfg = $GLOBALS['dw_config'];
	    return $cfg['vis_archive'] ?? [];
	};

	$getSystemDefaultTheme = function() {
	    $cfg = $GLOBALS['dw_config'];

	    return $cfg['defaults']['theme'] ?? "default";
	};

	$getVisualizations = function() {
	    $visualizations = [];
	    $all = DatawrapperVisualization::all();

	    foreach ($all as $vis) {
	        $visualizations[] = [
	            'id' => $vis["id"],
	            'svelte-workflow' => $vis["svelte-workflow"],
	            'namespace' => $vis["namespace"] ?? "",
	            'title' => $vis["title"] ?? ""
	        ];
	    }

	    return $visualizations;
	};

	$app->get('/organization/:org_id/settings', function ($org_id) use ($app) {
	    disable_cache($app);
	    $app->redirect('/team/' . $org_id . '/settings');
	});

	$app->get('/team/:org_id/settings(/:tab)?', function ($org_id, $tab = null)
	    use ($app, $getLocales, $getThemes, $getFolders, $getSystemDefaultTheme, $getVisArchive, $getVisualizations) {

	    disable_cache($app);
	    $org = OrganizationQuery::create()->findPk($org_id);
	    if (empty($org)) return $app->notFound();
	    $user = DatawrapperSession::getUser();
	    if (!$user->canAdministrateTeam($org)) return $app->notFound();

	    $tabs = Hooks::execute(Hooks::TEAM_SETTINGS_PAGE, $org, $user);

	    $teamSettings = $org->getSettings();

	    $page = [
	        'svelte_data' => [
	            'team' => [
	                'id' => $org->getId(),
	                'name' => $org->getName()
	            ],
	            'userId' => $user->getId(),
	            'user' => $user->serialize(),
	            'isAdmin' => $user->isAdmin(),
	            'locales' => $getLocales(),
	            'settings' => $org->getSettings(),
	            'themes' => $getThemes($org),
	            'folders' => $getFolders($org),
	            'visualizations' => $getVisualizations(),
	            'visualizationArchive' => $getVisArchive(),
	            'defaultTheme' => $org->getDefaultTheme() ? $org->getDefaultTheme() : $getSystemDefaultTheme(),
	            'pluginTabs' => $tabs ? $tabs : [],
	            'settings' => $teamSettings,
	            'role' => $org->getRole($user)
	        ]
	    ];

	    // setup global page vars for header and render template
	    add_header_vars($page, 'organization');
	    $app->render('team/settings.twig', $page);
	});
})();