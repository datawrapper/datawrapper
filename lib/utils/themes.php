<?php

// TODO: cache file i/o

function get_themes_meta($path = '') {
    $res = array();
    $user = DatawrapperSession::getInstance()->getUser();
    $email = $user->getEmail();
    $domain = substr($email, strpos($email, '@'));
    $files = glob($path . 'static/themes/*/meta.json');
    if (count($files) > 0) {
        foreach ($files as $file) {
            $id = substr($file, 14, -10);
            $meta = get_theme_meta($id, $path);
            if (!isset($meta['restrict'])  // no restriction at all
                 || $meta['restrict'] == $domain  // check for email domain
                 || $meta['restrict'] == $email  // check for entire email address
                 || $user->isAdmin())  // of course, admins can see all, too
                $res[] = $meta;
        }
    }
    return $res;
}

function get_theme_meta($id, $path = '') {
    $meta = json_decode(file_get_contents($path . 'static/themes/' . $id . '/meta.json'), true);
    $meta['id'] = $id;
    $meta['hasStyles'] = file_exists($path . 'static/themes/' . $id . '/theme.css');
    $meta['hasTemplate'] = file_exists('../templates/themes/' . $id . '.twig');

    if (!empty($meta['locale'])) {
        $localeJS = 'static/vendor/globalize/cultures/globalize.culture.' . str_replace('_', '-', $meta['locale']) . '.js';
        if (file_exists($path . $localeJS)) {
            $meta['localeJS'] = '/'.$localeJS;
            $meta['hasLocaleJS'] = true;
        }
    }
    if (empty($meta['extends'])) $meta['extends'] = null;
    return $meta;
}