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
    public function __construct() {
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

    private static function getDefaultLocale() {
        if (!empty($GLOBALS['dw_config']['languages'])) {
            return $GLOBALS['dw_config']['languages'][0]['id'];
        }

        return 'en_US';
    }

    private static function getConfiguredLocales() {
        $locales = array('en_US');

        if (!empty($GLOBALS['dw_config']['languages'])) {
            foreach ($GLOBALS['dw_config']['languages'] as $loc) {
                $locales[] = str_replace('-', '_', $loc['id']);
            }

            $locales = array_values(array_unique($locales));
        }

        return $locales;
    }

    private static function getAvailableLocales() {
        $locales = array('en_US');

        foreach (glob(ROOT_PATH . 'locale/*_*.json') as $l) {
            $locales[] = substr(basename($l), 0, 5);
        }

        if (count($locales) > 1) {
            $locales = array_values(array_unique($locales));
        }

        return $locales;
    }

    public static function getBrowserLocale() {
        $configured_locales = self::getConfiguredLocales();
        $available_locales  = self::getAvailableLocales();
        $usable_locales     = array_intersect($configured_locales, $available_locales);

        // filter out locales that are not defined in config.languages
        $locales = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']) : array();

        foreach ($locales as $loc) {
            $parts    = explode(';', $loc, 2);
            $pp       = explode('-', $parts[0], 2);
            $language = strtolower($pp[0]);

            if (count($pp) > 1) {
                $locale = $language.'_'.strtoupper($pp[1]);

                if (in_array($locale, $usable_locales)) {
                    return $locale;
                }
            }

            foreach ($usable_locales as $locale) {
                if (substr($locale, 0, 2) === $language) {
                    return $locale;
                }
            }
        }

        return self::getDefaultLocale();
    }

    /**
     * retreive the currently used frontend locale
     *
     * For historical reasons, this is named getLanguage(), even though it always returned the
     * full locale and all places where it's called actually do a substr(_,0,2) themselves.
     */
    public static function getLanguage() {
        // use language set via ?lang=, if set
        if (!empty($_GET['lang'])) return str_replace('-', '_', substr($_GET['lang']));

        // otherwise use user preference, or browser language
        if (self::getUser()->isLoggedIn()) {
            return self::getUser()->getLanguage();
        }
        elseif (isset($_SESSION['dw-lang'])) {
            return $_SESSION['dw-lang'];
        }

        return self::getBrowserLocale();
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

        // In case the user sent herself a password reset link, but remembered the password in the
        // meantime (or someone else triggered the reset link mail), we should reset the password
        // token now.
        $user->setResetPasswordToken('')->save();

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


