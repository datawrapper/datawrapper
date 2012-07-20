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
        if (isset($_SESSION['dw-lang'])) {
            $this->lang = $_SESSION['dw-lang'];
        } else {
            // default language is english
            $this->lang = 'en';
        }

        $this->initUser();
    }

    public static function initSession() {
        session_cache_limiter(false);
        $ses = 'dw-session';
        $lifetime = 86400 * 30;  // 30 days
        session_set_cookie_params($lifetime);
        session_name($ses);
        session_start();

        // Reset the expiration time upon page load
        if (isset($_COOKIE[$ses]))
            setcookie($ses, $_COOKIE[$ses], time() + $lifetime, "/");
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
            $user->setLanguage($this->lang);
            $this->user = $user;
        }
    }

    public function _toArray() {
        $res = array('lang' => $this->lang, 'user' => $this->user->toArray());
        return $res;
    }

    public static function toArray() {
        return self::getInstance()->_toArray();
    }

    /**
     * retreive the currently used frontend language
     */
    public static function getLanguage() {
        if (self::getUser()->isLoggedIn()) {
            return self::getUser()->getLanguage();
        } else {
            return isset($_SESSION['dw-lang']) ? $_SESSION['dw-lang'] : 'en';
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
        $_SESSION['dw-user-id'] = null;
        self::getInstance()->initUser();
        setcookie('dw-session');
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
