<?php

require_once dirname(__FILE__) . '/../../../../utils/array_merge_recursive_simple.php';

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
        unset($arr['Deleted']);  // we don't use this, since we never transmit deleted charts
        unset($arr['DeletedAt']);
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
        // at first we lowercase the keys
        $json = $this->lowercaseKeys($json);
        // then decode metadata from json string
        $json['metadata'] = $this->getMetadata();
        return $json;
    }

    public function toJSON() {
        return trim(addslashes(json_encode($this->serialize())));
    }

    public function unserialize($json) {
        // encode metadata as json string
        $json['metadata'] = json_encode($json['metadata']);
        // then we upperkeys the keys
        $json = $this->uppercaseKeys($json);
        // finally we ignore changes to some protected fields
        $json['CreatedAt'] = $this->getCreatedAt();
        $json['AuthorId'] = $this->getAuthorId();
        $json['Deleted'] = $this->getDeleted();
        $json['DeletedAt'] = $this->getDeletedAt();
        // and update the chart
        $this->fromArray($json);
        $this->save();
    }

    public function preSave(PropelPDO $con = null) {
        if ($this->isModified()) $this->setLastModifiedAt(time());
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
    protected function getDataPath() {
        $path = '../charts/data/' . $this->getCreatedAt('Ym');
        if (substr(dirname($_SERVER['SCRIPT_FILENAME']), -4) == "/api") {
            $path = '../' . $path;
        }
        return $path;
    }

    protected function getStaticPath() {
        $path = '../charts/static/' . $this->getID();
        if (substr(dirname($_SERVER['SCRIPT_FILENAME']), -4) == "/api") {
            $path = '../' . $path;
        }
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
     * writes raw csv data to the file system store
     *
     * @param csvdata  raw csv data string
     */
    public function writeData($csvdata) {
        $path = $this->getDataPath();
        if (!file_exists($path)) {
            mkdir($path);
        }
        $filename = $path . '/' . $this->getDataFilename();
        file_put_contents($filename, $csvdata);
        return $filename;
    }

    /**
     * load data from file sytem
     */
    public function loadData() {
        $filename = $this->getDataPath() . '/' . $this->getDataFilename();
        if (!file_exists($filename)) {
            return '';
        } else {
            return file_get_contents($filename);
        }
    }

    /**
     * checks wether a chart is writeable by a certain user
     *
     * @param user
     */
    public function isWritable($user) {
        if ($user->isLoggedIn()) {
            if ($this->getAuthorId() == $user->getId() || $user->isAdmin()) {
                return true;
            } else {
                return 'this is not your chart.';
            }
        } else {
            // check if the session matches
            if ($this->getGuestSession() == session_id()) {
                return true;
            } else {
                return 'this is not your chart (session doesnt match)';
            }
        }
    }

    /**
     * returns the chart meta data
     */
    public function getMetadata() {
        $default = Chart::defaultMetaData();
        $meta = json_decode(parent::getMetadata(), true);
        $meta = array_merge_recursive_simple($default, $meta);
        return $meta;
    }

    public function isPublic() {
        // 1 = upload, 2 = describe, 3 = visualize, 4 = publish, 5 = published
        return !$this->getDeleted() && $this->getLastEditStep() > 3;
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
            'data' => array(
                'transpose' => true,
                'vertical-header' => true,
                'horizontal-header' => true,
            ),
            'visualize' => array(
                'highlighted-series' => array(),
                'highlighted-values' => array()
            ),
            'describe' => array(
                'source-name' => '',
                'source-url' => '',
                'number-format' => '-',
                'number-divisor' => 0,
                'number-currency' => 'EUR|€',
                'number-unit' => ''
            ),
            'publish' => array(
                'embed-width' => 600,
                'embed-height' => 400
            )
        );
    }

    public function unpublish() {
        $path = $this->getStaticPath();
        if (file_exists($path)) {
            array_map('unlink', glob($path . "/*"));
            rmdir($path);
        }
    }

} // Chart
