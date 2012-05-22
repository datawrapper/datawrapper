<?php

/*
 * Datawrapper
 *
 * this singleton object handles all data i/o
 *
 */

session_start();

class DW {

    protected static $datawrapper;

    public static function getInstance() {
        if (self::$datawrapper === null) self::$datawrapper = new Datawrapper();
        return self::$datawrapper;
    }

    /**
     * creates a new instance
     */
    function __construct() {
        // initialize database

    }


    /*
     * retreive the currently used frontend language
     */
    public static function getLanguage() {
        return isset($_SESSION['dw-lang']) ? $_SESSION['dw-lang'] : 'en';
        // TODO: load user setting from database for logged users
    }

    /*
     * set a new language for the datawrapper user frontend
     */
    public static function setLanguage($lang, $temporarily = false) {
        $_SESSION['dw-lang'] = $lang;
        if (!$temporarily) {
            // TODO: store language as default for logged users
            // $user = Datawrapper::getCurrentUser();
            // if (!$user->isGuest()) {
            //     $user->setDefaultLanguage($lang);
            // }
        }
    }

    /* checks if a user is logged in */
    public static function checkLogin() {
        return true;
    }

    /* checks weather a chart is writeable by current user */
    public static function chartIsWritable($id) {
        return true;
    }

    /*
     * load chart meta data from database
     */
    public static function getChartMetaData($chart_id) {

    }

    public static function setChartMetaData($chart_id, $chart_info) {

    }

}