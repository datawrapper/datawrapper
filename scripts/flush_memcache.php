<?php

define('ROOT_PATH', dirname(dirname(__FILE__)) . '/');
define('NO_SLIM', 1);
define('NO_SESSION', 1);

require ROOT_PATH . 'lib/bootstrap.php';

if (isset($dw_config['memcache'])) {
    $memcache->flush();
    print "flushed memcache!\n";
} else {
    print "memcache is not configured.\n";
}

DatawrapperSession::setLanguage("de_DE");
print DatawrapperSession::getLanguage()."\n";
print __("This little tool reduces the time needed to create a correct chart and embed it into any website from hours to seconds. It makes charting easy, and helps you avoiding common pitfalls.");
