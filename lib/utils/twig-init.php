<?php

/*
 * init Twig extensions and hooks
 */

function dwGetHTMLPurifier() {
    static $instance = null;

    if (!$instance) {
        // Twig Extension to clean HTML from malicious code
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'a[href|class|target],p,b,div,span[class],strong,u,i,em,q,blockquote,*[style],br,small');
        $config->set('Attr.AllowedFrameTargets', ['_blank', '_self']);
        $config->set('Cache.SerializerPath', ROOT_PATH.'/tmp/');

        $instance = new HTMLPurifier($config);
    }

    return $instance;
}

function dwInitTwigEnvironment(Twig_Environment $twig) {
    $twig->setCache(ROOT_PATH.'/tmp/twig');
    $twig->enableAutoReload();
    $twig->addExtension(new Twig_I18n_Extension());

    $twig->addFilter(new Twig_SimpleFilter('purify', function($dirty) {
        return dwGetHTMLPurifier()->purify($dirty);
    }));

    $twig->addFilter(new Twig_SimpleFilter('json', function($arr) {
        $mask = 0;
        // PHP's json_encode has this *very* annoying behavior of failing
        // quietly on non-unicode input. to fix this we're running
        // through the entire array and checking for the correct
        // encoding, and trying to fix it if needed.
        if (is_array($arr)) {
            array_walk_recursive ($arr, function (&$a) {
                if (is_string($a) && !mb_check_encoding($a, 'UTF-8')) {
                    $a = utf8_encode($a);
                }
            });
        }
        return json_encode($arr, $mask);
    }));

    $twig->addFilter(new Twig_SimpleFilter('prettyjson', function($arr) {
        $mask = JSON_PRETTY_PRINT;
        // PHP's json_encode has this *very* annoying behavior of failing
        // quietly on non-unicode input. to fix this we're running
        // through the entire array and checking for the correct
        // encoding, and trying to fix it if needed.
        if (is_array($arr)) {
            array_walk_recursive ($arr, function (&$a) {
                if (is_string($a) && !mb_check_encoding($a, 'UTF-8')) {
                    $a = utf8_encode($a);
                }
            });
        }
        return json_encode($arr, $mask);
    }));

    $twig->addFilter(new Twig_SimpleFilter('css', function($arr) {
        $css = '';
        foreach ($arr as $prop => $val) {
            $css .= $prop . ':' . $val . ';';
        }
        return $css;
    }));

    $twig->addFunction(new Twig_SimpleFunction('hook', function() {
        call_user_func_array(array(DatawrapperHooks::getInstance(), 'execute'), func_get_args());
    }));

    $twig->addFunction(new Twig_SimpleFunction('hook_return', function() {
        return call_user_func_array(array(DatawrapperHooks::getInstance(), 'execute'), func_get_args());
    }));

    $twig->addFunction(new Twig_SimpleFunction('has_hook', function($hook) {
        return DatawrapperHooks::getInstance()->hookRegistered($hook);
    }));

    $twig->addFunction(new Twig_SimpleFunction('has_plugin', function($plugin) {
        return DatawrapperPluginManager::loaded($plugin);
    }));

    $twig->addFilter(new Twig_SimpleFilter('lettering', function($text) {
        $out = '';
        foreach (str_split($text) as $i => $char) {
            $out .= '<span class="char'.$i.'">'.$char.'</span>';
        }
        return $out;
    }, array('is_safe' => array('html')) ));

    $loc = DatawrapperSession::getLanguage();
    if ($loc == 'en') $loc = 'en-US';
    \Moment\Moment::setLocale(str_replace('-', '_', $loc));

    $twig->addFilter(new Twig_SimpleFilter('reltime', function($time) {
        // return $time;
        return (new \Moment\Moment($time))->fromNow()->getRelative();
    }));

    // adding new svelte() twig function
    $twig->addFunction(new Twig_SimpleFunction('svelte', function($app_id, $data = null) {
        $locale = DatawrapperSession::getLanguage();
        $is_plugin = substr($app_id, 0, 7) === 'plugin/';



        if ($is_plugin) {
            $path = explode("/", $app_id);
            $pl = array_shift($path);
            $plugin = array_shift($path);
            $filepath = implode("/", $path);
            $local_app_js = get_plugin_path() . $plugin . '/static/' . $filepath . '.js';

            $app_js = '/static/plugins/'.substr($app_id, 7).'.js';
            $app_css = '/static/plugins/'.substr($app_id, 7).'.css';
        } else {
            $app_js = '/static/js/svelte/'.$app_id.'.js';
            $app_css = '/static/css/svelte/'.$app_id.'.css';
            $local_app_js = ROOT_PATH . "www" . $app_js;
        }
        // compute a sha for cache busting
        $context = [
            'sha' => substr(md5(file_get_contents($local_app_js)), 0, 8),
            'locale' => $locale,
            'app_id' => $app_id,
            'app_js' => $app_js,
            'app_css' => $app_css,
            'config' => $GLOBALS['dw_config'],
            'twig_data' => $data ?? false
        ];

        global $app;
        $app->render('svelte.twig', $context);
    }));

    if (!empty($GLOBALS['dw_config']['debug'])) {
        $twig->addFilter('var_dump', new Twig_Filter_Function('var_dump'));
    }

    return $twig;
}
