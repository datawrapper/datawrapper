<?php

$locale = str_replace('-', '_', DatawrapperSession::getLanguage());
$domain = 'messages';
putenv('LANGUAGE=' . $locale);
setlocale(LC_ALL, $locale);

$__messages = array();

/*
 * load messages
 */
function load_messages($locale) {
    $mkey = 'l10n-messages-' . $locale;
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        // pull translation from memcache
        $msg = $memcache->get($mkey);
        if (!empty($msg)) return $msg;
    }
    // core
    $messages = array();
    function parse($fn) {
        if (file_exists($fn)) {
            return json_decode(file_get_contents($fn), true);
        }
        return array();
    }
    $messages['core'] = parse(ROOT_PATH . 'locale/' . $locale . '.json');
    $plugins = PluginQuery::create()->filterByEnabled(true)->find();
    foreach ($plugins as $plugin) {
        $messages[$plugin->getName()] = parse($plugin->getPath() . 'locale/' . $locale . '.json');
    }
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        // store translation in memcache
        $memcache->set($mkey, $messages);
    }
    return $messages;
}

/*
 * translate function
 */
function __($text, $domain = 'core') {
    global $__messages;
    if (!isset($__messages[$domain]) || !isset($__messages[$domain][$text])) {
        // no translation found
        return $text;
    }
    return $__messages[$domain][$text];
}

$__messages = load_messages($locale);
