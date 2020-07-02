<?php

/*
 * get list of all currently available chart types
 * watch out: this request involves browsing in the file
 * system and parsing of several JSON files
 *
 * it will be cached once per user session but should be
 * used carefully anyway. never call this in embedded charts
 */


$app->get('/themes', function() {
    if (!check_scopes(['theme:read'])) return;
    $res = ThemeQuery::create()->allThemesForUser();
    $data = [];
    forEach($res as $theme) {
        $data[] = [
            'id' => $theme->getId(),
            'title' => $theme->getTitle(),
            'createdAt' => $theme->getCreatedAt()
        ];
    }
    ok($data);
});

$app->get('/themes/:themeid', function($themeid) {
    if (!check_scopes(['theme:read'])) return;
    global $app;
    $user = DatawrapperSession::getUser();
    $theme = ThemeQuery::create()->findUserTheme($user, $themeid);
    if (!$theme) return error(404, 'there is no theme with that id');
    ok($theme->serialize($app->request()->get('includeAll')));
});
