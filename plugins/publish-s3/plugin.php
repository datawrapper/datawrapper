<?php

/**
 * Datawrapper Publish S3
 *
 */

class DatawrapperPlugin_PublishS3 extends DatawrapperPlugin {

    public function init() {
        $cfg = $this->getConfig();
        if ($cfg) {
            DatawrapperHooks::register(DatawrapperHooks::PUBLISH_FILES, array($this, 'publish'));
            DatawrapperHooks::register(DatawrapperHooks::UNPUBLISH_FILES, array($this, 'unpublish'));
            DatawrapperHooks::register(DatawrapperHooks::GET_PUBLISHED_URL, array($this, 'getUrl'));
        }
    }

    public function getRequiredLibraries() {
        return array('vendor/S3.php');
    }

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
    public function publish($files) {
        $cfg = $this->getConfig();
        $s3 = $this->_getS3($cfg);
        foreach ($files as $info) {
            $header = array();
            if (count($info) > 2) $header['Content-Type'] = $info[2];
            $s3->putObjectFile($info[0], $cfg['bucket'], $info[1], S3::ACL_PUBLIC_READ, array(), $header);
        }
    }

    /**
     * Removes a list of files from S3
     *
     * @param files  list of remote file names (removeFile)
     */
    public function unpublish($files) {
        $cfg = $this->getConfig();
        $s3 = $this->_getS3($cfg);
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
    public function getUrl($chart) {
        $cfg = $this->getConfig();
        if (!empty($cfg['alias'])) {
            return $cfg['alias'] . '/' . $chart->getID() . '/' . $chart->getPublicVersion() . '/';
        }
        return '//' . $cfg['bucket'] . '.s3.amazonaws.com/' . $chart->getID() . '/' . $chart->getPublicVersion() . '/index.html';
    }

        /**
     * Returns a fresh S3 instance
     */
    private function _getS3($cfg) {
        $s3 = new S3($cfg['accesskey'], $cfg['secretkey']);
        if (!empty($cfg['endpoint'])) {
            $s3->setEndpoint($cfg['endpoint']);
        }
        return $s3;
    }

}
