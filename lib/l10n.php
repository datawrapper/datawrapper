<?php

class Datawrapper_L10N {

    private $__messages = array();

    /*
     * load messages
     */
    public function loadMessages($locale) {
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

        $messages['core'] = $this->parse(ROOT_PATH . 'locale/' . $locale . '.json');
        $plugins = PluginQuery::create()->filterByEnabled(true)->find();
        foreach ($plugins as $plugin) {
            $messages[$plugin->getName()] = $this->parse($plugin->getPath() . 'locale/' . $locale . '.json');
        }
        if (isset($_GLOBALS['dw-config']['memcache'])) {
            // store translation in memcache for one minute to prevent
            // us from loading the JSON for every request
            $memcache->set($mkey, $messages, 60);
        }
        $this->__messages = $messages;
    }

    /*
     * translate function
     */
    public function translate($text, $domain = false, $fallback = '') {
        if (!$domain) $domain = $this->__get_domain();

        $text_cleaned = $this->clean_msgid($text);
        if (!isset($this->__messages[$domain]) || !isset($this->__messages[$domain][$text_cleaned])) {
            // no translation found
            if ($domain != 'core') {
                // fallback to core translation if exists
                return $this->translate($text, 'core', $fallback);
            }
            return !empty($fallback) ? $fallback : $text;
        }
        return $this->__messages[$domain][$text_cleaned];
    }

    private function parse($fn) {
        if (file_exists($fn)) {
            $msg = json_decode(file_get_contents($fn), true);
            $msgids = array_keys($msg);
            foreach ($msgids as $msgid) {
                $cleaned = $this->clean_msgid($msgid);
                if ($cleaned != $msgid) {
                    $msg[$cleaned] = $msg[$msgid];
                }
            }
            return $msg;
        }
        return array();
    }

    /*
     * this function tries to automatically detect the localization domain
     * by looking at the current backtrace. This way we can automatically
     * detect the right domain in templates
     */
    private function __get_domain() {
        static $evil = null;

        if ($evil === null) {
            $evil = DIRECTORY_SEPARATOR !== '/';
        }

        $domain = false;
        $backtrace = debug_backtrace();
        // check the entire backtrace for a plugin path
        foreach ($backtrace as $b) {
            if (isset($b['file']) && preg_match('#/plugins/([^/]+)/#', $evil ? str_replace(DIRECTORY_SEPARATOR, '/', $b['file']) : $b['file'], $m)) {
                return $m[1];
            }
            if (isset($b['function']) && $b['function'] == 'doDisplay') {
                if (isset($b['args'][0]['l10n__domain']) &&
                    preg_match('#/plugins/([^/]+)/#', $evil ? str_replace(DIRECTORY_SEPARATOR, '/', $b['args'][0]['l10n__domain']) : $b['args'][0]['l10n__domain'], $m)) {
                    return $m[1];
                }
            }
        }
        // if no plugin is found in backtrace, use core
        return 'core';
    }

    private function clean_msgid($msgid) {
        return trim(str_replace("\n", "", $msgid));
    }

}


/*
 * adding translate function to global scope
 */
function __($text, $domain = false, $fallback = '') {
    global $__l10n;
    return $__l10n->translate($text, $domain, $fallback);
}
