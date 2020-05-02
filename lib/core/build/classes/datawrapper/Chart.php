<?php

require_once ROOT_PATH . 'lib/utils/str_to_unicode.php';
require_once ROOT_PATH . 'lib/utils/json_encode_safe.php';

/**
 * Skeleton subclass for representing a row from the 'chart' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Chart extends BaseChart {

    public function toArray($keyType = BasePeer::TYPE_PHPNAME, $includeLazyLoadColumns = true, $alreadyDumpedObjects = array(), $includeForeignObjects = false) {
        $arr = parent::toArray($keyType, $includeLazyLoadColumns, $alreadyDumpedObjects, $includeForeignObjects);
        // unset($arr['Deleted']);  // we don't use this, since we never transmit deleted charts
        //unset($arr['DeletedAt']);
        return $arr;
    }

    public function shortArray() {
        $arr = $this->toArray();
        unset($arr['Metadata']);
        unset($arr['CreatedAt']);
        unset($arr['LastModifiedAt']);
        unset($arr['AuthorId']);
        unset($arr['ShowInGallery']);
        return $this->lowercaseKeys($arr);
    }

    /**
     * this function converts the chart
     */
    public function serialize() {
        $json = $this->toArray();
        unset($json['Deleted']);
        unset($json['DeletedAt']);
        // at first we lowercase the keys
        $json = $this->lowercaseKeys($json);

        $json['metadata'] = $this->getMetadata();

        if ($this->getUser()) $json['author'] = $this->getUser()->serialize();
        return $json;
    }

    public function toStruct($public = false) {
        $chart = $this->serialize();
        if ($public) {
            // remove any sensitive user data
            // unset($chart['author']);
        }
        return $chart;
    }

    public function toJSON($public = false) {
        return trim(addslashes(json_encode($this->toStruct($public), JSON_UNESCAPED_UNICODE)));
    }

    public function unserialize($json) {
        // bad payload?
        if (!is_array($json)) return false;


        if (array_key_exists('metadata', $json)) {
            // encode metadata as json string … if there IS metadata
            $m = $this->getMetadata();
            $json['metadata'] = json_encode($json['metadata'], JSON_UNESCAPED_UNICODE);
        }

        // then we upperkeys the keys
        $json = $this->uppercaseKeys($json);
        // finally we ignore changes to some protected fields
        $json['CreatedAt'] = $this->getCreatedAt();
        $json['AuthorId'] = $this->getAuthorId();
        $json['Deleted'] = $this->getDeleted();
        $json['DeletedAt'] = $this->getDeletedAt();
        $json['InFolder'] = $this->getInFolder();
        $json['OrganizationId'] = $this->getOrganizationId();
        // and update the chart
        $this->fromArray($json);
        $this->save();
        return true;
    }

    public function preSave(PropelPDO $con = null) {
        if ($this->isModified()) {
            $this->setLastModifiedAt(time());

            $user = Session::getUser();
            if ($user->getRole() != UserPeer::ROLE_GUEST) {
                Action::logAction(Session::getUser(), 'chart/edit', $this->getId());
            }
        }
        return true;
    }

    protected function lowercaseKeys($arr, $lower=true) {
        foreach ($arr as $key => $value) {
            $lkey = $key;
            $lkey[0] = $lower ? strtolower($key[0]) : strtoupper($key[0]);
            $arr[$lkey] = $value;
            unset($arr[$key]);
        }
        return $arr;
    }

    /**
     *
     */
    protected function uppercaseKeys($arr) {
        return $this->lowercaseKeys($arr, false);
    }

    /**
     * get the path where this charts data file is stored
     */
    public function getDataPath() {
        $path = chart_publish_directory() . 'data/' . $this->getCreatedAt('Ym');
        return $path;
    }

    public function getStaticPath() {
        $path = chart_publish_directory() . 'static/' . $this->getPublicId();
        return $path;
    }

    public function getRelativeDataPath() {
        $path = 'data/' . $this->getCreatedAt('Ym');
        return $path;
    }

    /**
     * get the filename of this charts data file, which is usually
     * just the chart id + csv extension
     */
    protected function getDataFilename() {
        return $this->getId() . '.csv';
    }

    /**
     * writes any asset to the file system store
     */
    public function writeAsset($filename, $data) {
        $cfg = $GLOBALS['dw_config'];

        if (isset($cfg['charts-s3'])
          && isset($cfg['charts-s3']['write'])
          && $cfg['charts-s3']['write'] == true) {

            $config = $cfg['charts-s3'];

            $filenamePath = 's3://' . $cfg['charts-s3']['bucket'] . '/' .
                $this->getRelativeDataPath() . '/' . $filename;

            file_put_contents($filenamePath, $data);
        } else {
            $path = $this->getDataPath();

            if (!file_exists($path)) {
                mkdir($path, 0775);
            }

            $filenamePath = $path . '/' . $filename;

            file_put_contents($filenamePath, $data);
        }
        $this->setLastModifiedAt(time());
        return $filenamePath;
    }

    /**
     * writes raw csv data to the file system store
     *
     * @param csvdata  raw csv data string
     */
    public function writeData($csvdata) {
        return $this->writeAsset($this->getDataFilename(), $csvdata);
    }

    /**
     * load any asset from file system
     */
    public function loadAsset($filename) {
        $config = $GLOBALS['dw_config'];

        if (isset($config['charts-s3']) &&
            $config['charts-s3']['read']) {

            $s3url = 's3://' . $config['charts-s3']['bucket'] . '/' .
              $this->getRelativeDataPath() . '/' . $filename;

            try {
                return file_get_contents($s3url);
            } catch (Exception $ex) {
                return '';
            }
        } else {
            $filenamePath = $this->getDataPath() . '/' . $filename;
            if (!file_exists($filenamePath)) {
                return '';
            } else {
                return file_get_contents($filenamePath);
            }
        }
    }

    /**
     * load data from file system
     */
    public function loadData() {
        return $this->loadAsset($this->getDataFilename());
    }

    public function refreshExternalData() {
        $url = $this->getExternalData();
        if (!empty($url)) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS |  CURLPROTO_FTP
            ]);
            $new_data = curl_exec($ch);
            // check status code to ignore error responses
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if ($statusCode < 400) {
                // check encoding of data
                $new_data = str_to_unicode($new_data);
                if (!empty($new_data)) $this->writeData($new_data);
            }
        }
        Hooks::execute(Hooks::CUSTOM_EXTERNAL_DATA, $this);
    }

    /*
     * checks if a user has the privilege to access the chart
     */
    public function isReadable($user) {
        if ($this->getDeleted()) return false;
        if ($user->isLoggedIn()) {
            if (Hooks::hookRegistered(Hooks::IS_CHART_READABLE)) {
                $readables = Hooks::execute(Hooks::IS_CHART_READABLE, $this, $user);
                foreach ($readables as $readable) {
                    if ($readable === true) {
                        return true;
                    }
                }
            }

            $org = $this->getOrganization();
            if ($this->getAuthorId() == $user->getId() ||
                $user->isAdmin() ||
                (!empty($org) && $org->hasUser($user))) {
                return true;
            }
        } else if ($this->getGuestSession() == session_id()) {
            return true;
        }
        return $this->isPublic();
    }

    /*
     * checks if a user has the privilege to change the data in a chart
     */
    public function isDataWritable($user) {
        return $this->isWritable($user)
            && !$this->getIsFork()
            && $this->getMetadata('custom.webToPrint.mode') != 'print';
    }

    /*
     * checks if a chart is forkable
     */
    public function isForkable() {
        return $this->isPublic() && $this->getForkable() && !$this->getIsFork();
    }

    /**
     * checks if a chart is writeable by a user
     *
     * @param user
     */
    public function isWritable($user) {
        if ($user->isLoggedIn()) {
            if (Hooks::hookRegistered(Hooks::IS_CHART_WRITABLE)) {
                $writables = Hooks::execute(Hooks::IS_CHART_WRITABLE, $this, $user);
                foreach ($writables as $writable) {
                    if ($writable === true) {
                        return true;
                    }
                }
            }

            $org = $this->getOrganization();
            // chart is writable if...
                // this user is the chart author
            if ($this->getAuthorId() == $user->getId()
                // the user is a graphics editor and in the same organization
                || (!empty($org) && $org->hasUser($user))
                // or the user is an admin
                || $user->isAdmin()) {
                return true;
            } else {
                return false;
            }
        } else {
            // check if the session matches
            if ($this->getGuestSession() == session_id()) {
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * returns the chart meta data
     */
    public function getMetadata($key = null) {
        $default = Chart::defaultMetaData();

        $raw_meta = parent::getMetadata();
        // try normal decoding first
        $meta = json_decode($raw_meta, true);
        $utf8 = false;
        if (empty($meta)) {
            $json_err = json_last_error_msg();
            $utf8 = true;
            // now try utf8_encode
            $meta = json_decode(utf8_encode($raw_meta), true);
        }
        if (!is_array($meta)) $meta = array();
        $meta['json_error'] = isset($json_err) ? $json_err : null;
        $meta = array_merge_recursive_simple($default, $meta);
        if (empty($key)) return $meta;
        $keys = explode('.', $key);
        $p = $meta;
        foreach ($keys as $key) {
            if (isset($p[$key])) $p = $p[$key];
            else return null;
        }
        return $p;
    }

    public function getRawMetadata() {
        return parent::getMetadata();
    }

    public function setRawMetadata($meta) {
        parent::setMetadata($meta);
    }

    /*
     * update a part of the metadata
     */
    public function updateMetadata($key, $value) {
        $meta = $this->getMetadata();
        $keys = explode('.', $key);
        $p = &$meta;
        foreach ($keys as $key) {
            if (!isset($p[$key])) {
                $p[$key] = array();
            }
            $p = &$p[$key];
        }
        $p = $value;
        $this->setMetadata(json_encode($meta, JSON_UNESCAPED_UNICODE));
    }

    public function isPublic() {
        // 1 = upload, 2 = describe, 3 = visualize, 4 = publish, 5 = published
        return !$this->getDeleted() && $this->getLastEditStep() >= 4;
    }

    public function _isDeleted() {
        return $this->getDeleted();
    }

    public function getLocale() {
        return $this->getLanguage();
    }

    public function setLocale($locale) {
        $this->setLanguage($locale);
    }

    public static function defaultMetaData() {
        return array(
            'data' => [
                'transpose' => false,
                'vertical-header' => true,
                'horizontal-header' => true,
            ],
            'visualize' => [
                'highlighted-series' => [],
                'highlighted-values' => []
            ],
            'describe' => [
                'source-name' => '',
                'source-url' => '',
                'number-format' => '-',
                'number-divisor' => 0,
                'number-append' => '',
                'number-prepend' => '',
                'intro' => '',
                'byline' => ''
            ],
            'publish' => [
                'embed-width' => 600,
                'embed-height' => 400
            ],
            'annotate' => [
                'notes' => ''
            ]
        );
    }

    public function getPublicId() {
        if (!empty($GLOBALS['dw_config']['chart_id_salt'])) {
            return md5(
                $this->getID() .
                "--" .
                strtotime($this->getCreatedAt()) .
                "--" .
                $GLOBALS['dw_config']['chart_id_salt']
            );
        } else {
            return $this->getID();
        }
    }

    public function thumbUrl($forceLocal = false) {
        global $dw_config;

        $path = $dw_config["screenshot_path"] ?? $this->getHash();

        return get_current_protocol() . "://" . $dw_config["img_domain"] . "/"
            . $this->getID() . "/" . $path . "/plain.png";
    }

    public function getTitle() {
        return parent::getTitle();
    }

    public function getTheme() {
        return parent::getTheme();
    }

    public function getType() {
        $type = parent::getType();

        if (!DatawrapperVisualization::has($type)) {
            // fall back to default chart type
            return isset($GLOBALS['dw_config']['defaults']) &&
                isset($GLOBALS['dw_config']['defaults']['vis']) ?
                $GLOBALS['dw_config']['defaults']['vis'] : 'table';
        }


        return $type;
    }

    /*
     * return URL of this chart on Datawrapper
     */
    public function getLocalUrl() {
        return get_current_protocol() . '://' . $GLOBALS['dw_config']['chart_domain'] . '/' . $this->getPublicId() . '/index.html';
    }

    public function getNamespace() {
        if (!DatawrapperVisualization::has($this->getType())) return 'chart';
        $vis = DatawrapperVisualization::get($this->getType());
        return $vis['namespace'] ?? 'chart';
    }

    public function getDefaultStep() {
        if (!DatawrapperVisualization::has($this->getType())) return 'visualize';
        $vis = DatawrapperVisualization::get($this->getType());
        if (empty($vis['svelte-workflow'])) return 'visualize';
        $workflows = [];
        $res = Hooks::execute(Hooks::ADD_WORKFLOW);
        foreach ($res as $wf) {
            if ($wf['id'] == $vis['svelte-workflow']) {
                return $wf['default_step'] ?? 'visualize';
            }
        }
        return 'visualize';
    }

    public function isFork() {
        return $this->getIsFork();
    }

} // Chart

function chart_publish_directory() {
    $dir = ROOT_PATH.'charts';

    if (isset($GLOBALS['dw_config']['publish_directory'])) {
        $dir = $GLOBALS['dw_config']['publish_directory'];
    }

    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true)) {
            throw new RuntimeException('Could not create chart publish directory "'.$dir.'". Please create it manually and make sure PHP can write to it.');
        }
    }

    return rtrim(realpath($dir), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
}
