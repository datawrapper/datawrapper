<?php

$locale = str_replace('-', '_', DatawrapperSession::getLanguage());
$domain = 'messages';
putenv('LC_ALL=' . $locale);
setlocale(LC_ALL, $locale);


if (function_exists('bindtextdomain')) {
    bindtextdomain($domain, '../locale');
    if (function_exists('bind_textdomain_codeset')) bind_textdomain_codeset($domain, 'UTF-8');
    textdomain($domain);
} else {
    // If no gettext extension is found, we will
    // fake the API to not break the application
    function _($s) { return $s; }
    function gettext($s) { return _($s); }
    function ngettext($s) { return _($s); }
}