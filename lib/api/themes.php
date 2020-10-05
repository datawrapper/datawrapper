<?php

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

