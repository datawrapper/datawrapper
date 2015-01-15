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
        if(!session_id()) session_regenerate_id();
        session_cache_limiter('private_no_expire');
        session_cache_expire(1440 * 90);  // 90 days

        session_start();

        // Reset the expiration time upon page load
        if (isset($_COOKIE[$ses]))
            setcookie($ses, $_COOKIE[$ses], time() + $lifetime, "/");
    }

    /**
     * initializes a new user or creates a guest user if not logged in
     */
    protected function initUser() {
        if (isset($_SESSION['dw-user-id']) &&
            (isset($_SESSION['persistent']) ||
             isset($_SESSION['last_action_time']))) {
            if ((isset($_SESSION['persistent']) && $_SESSION['persistent']) ||
                (isset($_SESSION['last_action_time']) && time() - $_SESSION['last_action_time'] < 1800)) {
                $this->user = UserQuery::create()->limit(1)->findPK($_SESSION['dw-user-id']);
                $_SESSION['last_action_time'] = time();
            }
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

    private static function getDefaultLanguage() {
        if (!empty($GLOBALS['dw_config']['languages'])) {
            return substr($GLOBALS['dw_config']['languages'][0]['id'], 0, 2);
        }
        return 'en';
    }

    private static function checkLanguageInConfig($locale) {
        if (!empty($GLOBALS['dw_config']['languages'])) {
            $configured_languages = array();
            foreach ($GLOBALS['dw_config']['languages'] as $loc) {
                $configured_languages[] = substr($loc['id'], 0, 2);
            }
        } else {
            $configured_languages = array('en');
        }
        return in_array(substr($locale, 0, 2), $configured_languages);
    }

    public static function getBrowserLocale() {
        // get list of available locales
        $available_locales = array('en_US');
        foreach (glob(ROOT_PATH . 'locale/*_*.json') as $l) {
            $available_locales[] = substr($l, 10, 5);
        }
        // filter out locales that are not defined in
        // config.languages

        $locales = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']) : array();
        foreach ($locales as $loc) {
            $parts = explode(';', $loc);
            $pp = explode('-', $parts[0]);
            if (count($pp) > 1) $pp[1] = strtoupper($pp[1]);
            $locale = implode('_', $pp);
            if (in_array($locale, $available_locales)
                && self::checkLanguageInConfig($locale)) return $locale;  // match!
        }
        return self::getDefaultLanguage();
    }

    /**
     * retreive the currently used frontend language
     */
    public static function getLanguage() {
        // use language set via ?lang=, if set
        if (!empty($_GET['lang'])) return substr($_GET['lang'],0,2);
        // otherwise use user preference, or browser language
        if (self::getUser()->isLoggedIn()) {
            return self::getUser()->getLanguage();
        } else {
            return isset($_SESSION['dw-lang']) ? $_SESSION['dw-lang'] : self::getBrowserLocale();
        }
        return self::getDefaultLanguage();
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

    public static function login($user, $keepLoggedIn = true, $dontLog = false) {
        $_SESSION['dw-user-id'] = $user->getId();
        self::getInstance()->user = $user;
        if (!$dontLog) Action::logAction($user, 'login');

        // reload plugins since there might be new plugins
        // becoming available after logins
        DatawrapperPluginManager::load();

        $_SESSION['persistent'] = $keepLoggedIn;
        $_SESSION['last_action_time'] = time();

        // make sure that the charts of the guest now belong to
        // the logged or newly created user
        $charts = ChartQuery::create()->findByGuestSession(session_id());
        foreach ($charts as $chart) {
            $chart->setAuthorId($user->getId());
            $chart->setGuestSession('');
            $chart->save();
        }

        // restore user organization
        if (empty($_SESSION['dw-user-organization'])) {
            // let's check the last chart
            $lastChart = ChartQuery::create()
                ->filterByUser($user)
                ->filterByOrganizationId(null, Criteria::ISNOTNULL)
                ->orderByLastModifiedAt(Criteria::DESC)
                ->findOne();
            if (!empty($lastChart)) {
                $_SESSION['dw-user-organization'] = $lastChart->getOrganization()->getId();
            }
        }
    }

    public static function logout() {
        Action::logAction(self::getInstance()->user, 'logout');
        $_SESSION['dw-user-id'] = null;
        $_SESSION['dw-user-organization'] = null;
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


