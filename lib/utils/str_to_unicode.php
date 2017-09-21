<?php

function str_to_unicode($str) {
	$enc = mb_detect_encoding($str, ['UTF-8', 'ASCII',
        'ISO-8859-1', 'ISO-8859-2', 'ISO-8859-3', 'ISO-8859-4',
        'ISO-8859-5', 'ISO-8859-6', 'ISO-8859-7', 'ISO-8859-8',
        'ISO-8859-9', 'ISO-8859-10', 'ISO-8859-13', 'ISO-8859-14',
        'ISO-8859-15', 'ISO-8859-16', 'Windows-1251',
        'Windows-1252', 'Windows-1254']);

	if (strtolower($enc) != 'utf-8') {
        $str = mb_convert_encoding($str, 'utf-8', $enc);
    }
    return $str;
}