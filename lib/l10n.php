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
    global $memcache;
    $locale = str_replace('-', '_', $locale);
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
            $msg = json_decode(file_get_contents($fn), true);
            $msgids = array_keys($msg);
            foreach ($msgids as $msgid) {
                $cleaned = _l10n_clean_msgid($msgid);
                if ($cleaned != $msgid) {
                    $msg[$cleaned] = $msg[$msgid];
                }
            }
            return $msg;
        }
        return array();
    }
    $messages['core'] = parse(ROOT_PATH . 'locale/' . $locale . '.json');
    $plugins = PluginQuery::create()->filterByEnabled(true)->find();
    foreach ($plugins as $plugin) {
        $messages[$plugin->getName()] = parse($plugin->getPath() . 'locale/' . $locale . '.json');
    }
    if (isset($_GLOBALS['dw-config']['memcache'])) {
        // store translation in memcache for one minute to prevent
        // us from loading the JSON for every request
        $memcache->set($mkey, $messages, 60);
    }
    return $messages;
}


/*
 * this function tries to automatically detect the localization domain
 * by looking at the current backtrace. This way we can automatically
 * detect the right domain in templates
 */
function __get_domain() {
    $domain = false;
    $backtrace = debug_backtrace();
    foreach ($backtrace as $b) {
        // if called within a template, the __ function has a call
        // to TwigTemplate::doDisplay() in its backtrace
        // from there we get the var l10n__domain
        if (isset($b['function']) && $b['function'] == 'doDisplay') {
            if (isset($b['args'][0]['l10n__domain'])) {
                $domain = $b['args'][0]['l10n__domain'];
                break;
            }
        }
    }
    // if called in plain PHP code we take the filename
    // of the calling file as domain
    if (!$domain && isset($backtrace[1]['file'])) {
        $domain = $backtrace[1]['file'];
    }
    if ($domain) {
        // finally we check if the domain matches the format
        // /plugins/$1/, and take the plugin id as domain
        if (preg_match('#/plugins/([^/]+)/#', $domain, $m)) {
            return $m[1];
        }
    }
    // fallback is core
    return 'core';
}

/*
 * translate function
 */
function __($text, $domain = false, $fallback = '') {
    global $__messages;

    if (!$domain) $domain = __get_domain();

    $text_cleaned = _l10n_clean_msgid($text);
    if (!isset($__messages[$domain]) || !isset($__messages[$domain][$text_cleaned])) {
        // no translation found
        return !empty($fallback) ? $fallback : $text;
    }
    return $__messages[$domain][$text_cleaned];
}

function _l10n_clean_msgid($msgid) {
    return trim(str_replace("\n", "", $msgid));
}

$__messages = load_messages($locale);
