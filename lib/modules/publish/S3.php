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
     * @param files list of file descriptions in the format [localFile, remoteFile, contentType]
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
            $header = array();
            if (count($info) > 2) $header['Content-Type'] = $info[2];
            $s3->putObject($s3->inputFile($info[0], false), $cfg['bucket'], $info[1], S3::ACL_PUBLIC_READ, array(), $header);
        }
    }

    /**
     * Removes a list of files from S3
     *
     * @param files  list of remote file names (removeFile)
     */
    function unpublish($files) {
        $cfg = $GLOBALS['dw_config']['publish']['config'];
        $s3 = new S3($cfg['accesskey'], $cfg['secretkey']);
        $s3->setExceptions(true);
        foreach ($files as $file) {
            $s3->deleteObject($cfg['bucket'], $file);
        }
    }

    /**
     * Returns URL to the chart hosted on S3
     *
     * @param chart Chart class
     */
    function getUrl($chart) {
        $cfg = $GLOBALS['dw_config']['publish']['config'];
        return 'http://' . $cfg['bucket'] . '.s3.amazonaws.com/' . $chart->getID() . '/index.html';
    }

}