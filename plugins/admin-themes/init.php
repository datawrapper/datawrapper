<?php


DatawrapperHooks::register(
    DatawrapperHooks::GET_ADMIN_PAGES,
    function() use ($plugin) {

        $relativeTime = function($time) {

            $d = array(array(1,"second"), array(60,"minute"), array(3600,"hour"), array(86400,"day"),
                array(604800,"week"), array(2592000,"month"), array(31104000,"year"));

            $w = array();

            $return = array();
            $now = time();
            $diff = ($now-$time);
            $secondsLeft = $diff;


            for($i=6;$i>-1;$i--)
            {
                 $w[$i] = intval($secondsLeft/ ($d[$i][0]*2) );
                 $secondsLeft -= ($w[$i]*$d[$i][0]);
                 if ($w[$i] != 0) {
                    $return[] = abs($w[$i]*2) . " " . $d[$i][1] . (($w[$i]>1)?'s':'') ." ";
                 }

            }

            $return = implode(' and ', array_slice($return, 0, 1)); //. ($diff>0 ?"ago" : "left");
            return $return;
        };

        return array(
            'url' => '/themes',
            'title' => __('Themes', $plugin->getName()),
            'controller' => function($app, $page) use ($plugin, $relativeTime) {
                $themes = DatawrapperTheme::all();
                foreach ($themes as $i => $theme) {
                    $c = ChartQuery::create()->filterByTheme($theme['id'])
                        ->orderByLastModifiedAt('desc')
                        ->findOne();
                    if ($c) {
                        $themes[$i]['last_used'] = $relativeTime(strtotime($c->getLastModifiedAt()));
                    } else {
                        $themes[$i]['last_used'] = 'never';
                    }

                }
                $page = array_merge($page, array(
                    'title' => 'Themes',
                    'themes' => $themes,
                    'count' => count_charts_per_themes()
                ));
                $app->render('plugins/'.$plugin->getName().'/admin-themes.twig', $page);
            },
            'order' => '3'
        );
    }
);
