<?php

// TODO: cache file i/o

function get_themes_meta($ignoreRestrictions = false) {
    $res = array();
    $user = DatawrapperSession::getInstance()->getUser();
    $email = $user->getEmail();
    $domain = substr($email, strpos($email, '@'));
    $files = glob(ROOT_PATH . 'www/static/themes/*/meta.json');
    if (count($files) > 0) {
        foreach ($files as $file) {
            $id = substr($file, strlen(ROOT_PATH) + 18, -10);
            $meta = get_theme_meta($id);
            if (!$meta) continue;
            if (!isset($meta['restrict'])  // no restriction at all
                 || $meta['restrict'] == $domain  // check for email domain
                 || $meta['restrict'] == $email  // check for entire email address
                 || $ignoreRestrictions === true // we want to test *all* layouts
                 || $user->isAdmin())  // of course, admins can see all, too
                $res[] = $meta;
        }
    }
    return $res;
}

function get_theme_meta($id) {
    $theme_meta = ROOT_PATH . 'www/static/themes/' . $id . '/meta.json';
    if (file_exists($theme_meta)) {
        $meta = json_decode(file_get_contents($theme_meta), true);
        $meta['id'] = $id;
        $meta['hasStyles'] = file_exists(ROOT_PATH . 'www/static/themes/' . $id . '/theme.css');
        $meta['hasTemplate'] = file_exists(ROOT_PATH . 'templates/themes/' . $id . '.twig');

        if (!empty($meta['locale'])) {
            $localeJS = 'static/vendor/globalize/cultures/globalize.culture.' . str_replace('_', '-', $meta['locale']) . '.js';
            if (file_exists($localeJS)) {
                $meta['localeJS'] = '/'.$localeJS;
                $meta['hasLocaleJS'] = true;
            }
        }
        if (empty($meta['extends'])) $meta['extends'] = null;
        return $meta;
    }
    return false;
}

/*
 * returns a simple array('theme_id' => count, ...)
 */
function count_charts_per_themes() {
    $con = Propel::getConnection();
    $sql = "SELECT theme, COUNT(*) c FROM chart WHERE deleted = 0 GROUP BY theme;";
    $res = $con->query($sql);
    $ret = array();
    foreach ($res as $r) {
        $ret[$r['theme']] = $r['c'];
    }
    return $ret;
}
