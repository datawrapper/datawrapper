<?php

// load interface
require_once "interface.php";


/**
 * Datawrapper S3 publication module
 *
 */

class Datawrapper_Publish_S3 implements IDatawrapper_Publish {

    /**
     * pushs a list of files to S3
     *
     * @param files: list of file descriptions in the format [localFile, remoteFile, contentType]
     * e.g.
     *
     * array(
     *     array('path/to/local/file', 'remote/file', 'text/plain')
     * )
     */
    function publish($files) {
        $cfg = $GLOBALS['dw_config']['publish']['config'];
        $s3 = new S3($cfg['accesskey'], $cfg['secretkey']);
        foreach ($files as $info) {
            $s3->putObject($s3->inputFile($info[0], false), $cfg['bucket'], $info[1], S3::ACL_PUBLIC_READ, array(), array('Content-Type' => $info[2]));
        }
    }

    function unpublish($files) {
        // not implemented yet
    }

    function getUrl($chart) {
        $cfg = $GLOBALS['dw_config']['publish']['config'];
        return 'http://' . $cfg['bucket'] . '.s3.amazonaws.com/' . $chart->getID() . '/index.html';
    }

}