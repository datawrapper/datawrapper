<?php
/**
 * Like vsprintf, but accepts $args keys instead of order index.
 * Both numeric and strings matching /[a-zA-Z0-9_-]+/ are allowed.
 *
 * Example: vskprintf('y = %y$d, x = %x$1.1f', array('x' => 1, 'y' => 2))
 * Result:  'y = 2, x = 1.0'
 *
 * $args also can be object, then it's properties are retrieved
 * using get_object_vars().
 *
 * '%s' without argument name works fine too. Everything vsprintf() can do
 * is supported.
 *
 * @author Josef Kufner <jkufner(at)gmail.com>
 */

if (!function_exists('vksprintf')) {
    function vksprintf($str, $args)
    {
        if (is_object($args)) {
            $args = get_object_vars($args);
        }
        $map = array_flip(array_keys($args));
        $new_str = preg_replace_callback('/(^|[^%])%([a-zA-Z0-9_-]+)\$/',
                function($m) use ($map) { return $m[1].'%'.($map[$m[2]] + 1).'$'; },
                $str);
        return vsprintf($new_str, $args);
    }
}