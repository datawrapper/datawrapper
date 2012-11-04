<?php

/*
 * Datawrapper
 *
 * this singleton object handles all data i/o
 *
 */

class DatawrapperSession {

    protected static $datawrapper;

    public static function getInstance() {
        if (self::$datawrapper === null) self::$datawrapper = new DatawrapperSession();
        return self::$datawrapper;
    }

    /**
     * creates a new instance
     */
    function __construct() {
        $this->initUser();
    }

    public static function initSession() {
        session_cache_limiter(false);
        $ses = 'DW-SESSION';
        $lifetime = 86400 * 90;  // 90 days
        session_set_cookie_params($lifetime);
        session_name($ses);
        //if(!session_id()) session_regenerate_id();
        session_start();

        // Reset the expiration time upon page load
        //if (isset($_COOKIE[$ses]))
        //    setcookie($ses, $_COOKIE[$ses], time() + $lifetime, "/");
    }

    /**
     * initializes a new user or creates a guest user if not logged in
     */
    protected function initUser() {
        if (isset($_SESSION['dw-user-id'])) {
            $this->user = UserQuery::create()->limit(1)->findPK($_SESSION['dw-user-id']);
        }
        if (empty($this->user)) {
            // create temporary guest user for this session
            $user = new User();
            $user->setEmail('guest@datawrapper.de');
            $user->setRole('guest');
            $user->setLanguage(self::getBrowserLocale());
            $this->user = $user;
        }
    }

    public function _toArray() {
        $res = array('user' => $this->user->toArray());
        return $res;
    }

    public static function toArray() {
        return self::getInstance()->_toArray();
    }

    public static function getBrowserLocale() {
        // get list of available locales
        $available_locales = array();
        foreach (glob('../locale/*', GLOB_ONLYDIR) as $l) {
            $available_locales[] = substr($l, 10);
        }
        $locales = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']) : array();
        foreach ($locales as $loc) {
            $parts = explode(';', $loc);
            $pp = explode('-', $parts[0]);
            if (count($pp) > 1) $pp[1] = strtoupper($pp[1]);
            $locale = implode('_', $pp);
            if (in_array($locale, $available_locales)) return $locale;  // match!
        }
        return 'en';
    }

    /**
     * retreive the currently used frontend language
     */
    public static function getLanguage() {
        if (self::getUser()->isLoggedIn()) {
            return self::getUser()->getLanguage();
        } else {
            return isset($_SESSION['dw-lang']) ? $_SESSION['dw-lang'] : self::getBrowserLocale();
        }
        // TODO: load user setting from database for logged users
    }

    /**
     * set a new language for the datawrapper user frontend
     */
    public static function setLanguage($lang) {
        $_SESSION['dw-lang'] = $lang;
        $user = self::getUser();
        $user->setLanguage($lang);
        if ($user->getRole() != 'guest') {
            $user->save(); // remember language setting
        }
    }

    /* checks if a user is logged in */
    public static function isLoggedIn() {
        return self::getInstance()->user->getRole() != 'guest';
    }

    public static function getUser() {
        return self::getInstance()->user;
    }

    public static function login($user) {
        $_SESSION['dw-user-id'] = $user->getId();
        self::getInstance()->user = $user;
        Action::logAction($user, 'login');

        // make sure that the charts of the guest now belong to
        // the logged or newly created user
        $charts = ChartQuery::create()->findByGuestSession(session_id());
        foreach ($charts as $chart) {
            $chart->setAuthorId($user->getId());
            $chart->setGuestSession('');
            $chart->save();
        }
    }

    public static function logout() {
        Action::logAction(self::getInstance()->user, 'logout');
        $_SESSION['dw-user-id'] = null;
        self::getInstance()->initUser();
        setcookie('DW-SESSION', null, 0, '/');
    }


    /*
     * load chart meta data from database
     */
    public static function getChartMetaData($chart_id) {

    }

    public static function setChartMetaData($chart_id, $chart_info) {

    }
}

DatawrapperSession::initSession();

