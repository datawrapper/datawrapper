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

    public function usePrint() {
        $this->usePrintVersion = true;

        $meta = $this->getMetadata();

        if (!isset($meta['print'])) {
            // copy web chart for print
            $meta['print'] = $meta;
            $meta['print']['describe']['title'] = parent::getTitle();
            $meta['print']['visualize']['type'] = parent::getType();

            $themeId = parent::getTheme();
            $theme = ThemeQuery::create()->findPk($themeId);

            if (!empty($theme->getThemeData("printVersion"))) {
                $meta['print']['visualize']['theme'] = $theme->getThemeData("printTheme");
            } else {
                $meta['print']['visualize']['theme'] = $theme->getId();
            }

            $this->setMetadata(json_encode($meta, JSON_UNESCAPED_UNICODE));
            $this->save();
        }
    }

    public function deletePrintVersion() {
        $meta = $this->getMetadata();
        if (isset($meta['print'])) unset($meta['print']);
        $this->setMetadata(json_encode($meta, JSON_UNESCAPED_UNICODE));
        $this->save();
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

        if (isset($this->usePrintVersion) && $this->usePrintVersion) {
            $json['metadata'] = $json['metadata']['print'];
        }

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

        if (isset($this->usePrintVersion) && $this->usePrintVersion) {
            if (isset($json['metadata'])) {
                $json['metadata']['describe']['title'] = $json['title'];
                $json['metadata']['visualize']['theme'] = $json['theme'];
                $json['metadata']['visualize']['type'] = $json['type'];
            }

            $json['title'] = parent::getTitle();
            $json['theme'] = parent::getTheme();
            $json['type'] = parent::getType();
        }

        if (array_key_exists('metadata', $json)) {
            if (isset($this->usePrintVersion) && $this->usePrintVersion) {
                $m = $this->getMetadata();
                $m['print'] = $json['metadata'];
                $json['metadata'] = json_encode($m, JSON_UNESCAPED_UNICODE);
            } else {
                // encode metadata as json string … if there IS metadata
                $m = $this->getMetadata();
                if (isset($m['print'])) { $json['metadata']['print'] = $m['print']; }
                $json['metadata'] = json_encode($json['metadata'], JSON_UNESCAPED_UNICODE);
            }
        }

        // then we upperkeys the keys
        $json = $this->uppercaseKeys($json);
        // finally we ignore changes to some protected fields
        $json['CreatedAt'] = $this->getCreatedAt();
        $json['AuthorId'] = $this->getAuthorId();
        $json['Deleted'] = $this->getDeleted();
        $json['DeletedAt'] = $this->getDeletedAt();
        $json['InFolder'] = $this->getInFolder();
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
        $path = chart_publish_directory() . 'static/' . $this->getID();
        return $path;
    }

    public function getRelativeDataPath() {
        $path = 'data/' . $this->getCreatedAt('Ym');
        return $path;
    }

    public function getRelativeStaticPath() {
        $path = 'static/' . $this->getID();
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
                CURLOPT_CONNECTTIMEOUT => 5,
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
        return $this->isWritable($user) && !$this->getIsFork();
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
        if (isset($this->usePrintVersion) && $this->usePrintVersion && $key) {
            $key = "print." . $key;
        }

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

    /*
     * increment the public version of a chart, which is used
     * in chart public urls to deal with cdn caches
     */
    public function publish() {
        // increment public version
        $this->setPublicVersion($this->getPublicVersion() + 1);
        // generate public url
        $published_urls = Hooks::execute(Hooks::GET_PUBLISHED_URL, $this);
        if (!empty($published_urls)) {
            // store public url from first publish module
            $this->setPublicUrl($published_urls[0]);
        } else {
            // fallback to local url
            $this->setPublicUrl($this->getLocalUrl());
        }
        $this->generateEmbedCodes();
        $this->save();
        // copy data to public
        if (empty($this->getPublicChart())) {
            // create new public chart
            $publicChart = new PublicChart();
            $publicChart->setFirstPublishedAt(time());
            $this->setPublicChart($publicChart);
        }
        $this->getPublicChart()->update();
        // log chart publish action
        Action::logAction(Session::getUser(), 'chart/publish', $this->getId());
    }

    /*
     * redirect previous chart versions to the most current one
     */
    public function redirectPreviousVersions($justLast20=true) {
        $current_target = $this->getCDNPath();
        $redirect_html = '<html><head><meta http-equiv="REFRESH" content="0; url=/'.$current_target.'"></head></html>';
        $redirect_file = chart_publish_directory() . 'static/' . $this->getID() . '/redirect.html';
        file_put_contents($redirect_file, $redirect_html);
        $files = array();
        for ($v=0; $v < $this->getPublicVersion(); $v++) {
            if (!$justLast20 || $this->getPublicVersion() - $v < 20) {
                $files[] = [
                    $redirect_file,
                    $this->getCDNPath($v) . 'index.html', 'text/html'
                ];
            }
        }
        Hooks::execute(Hooks::PUBLISH_FILES, $files);
    }

    public function generateEmbedCodes() {
        // generate embed codes
        $embedcodes = [];
        $theme = ThemeQuery::create()->findPk($this->getTheme());

        // hack: temporarily set UI language to chart language
        // so we get the correct translation of "Chart:" and "Map:"
        if ($this->getLanguage() != '') {
            global $__l10n;
            $__l10n->loadMessages($this->getLanguage());
        }

        $search = [
            '%chart_id%',
            '%chart_url%',
            '%chart_title%',
            '%chart_type%',
            '%chart_intro%',
            '%chart_width%',
            '%chart_height%',
            '%embed_heights%',
            '%embed_heights_escaped%',
        ];
        $replace = [
            $this->getID(),
            $this->getPublicUrl(),
            htmlentities(strip_tags($this->getTitle())),
            $this->getAriaLabel($theme),
            htmlentities(strip_tags($this->getMetadata('describe.intro'))),
            $this->getMetadata('publish.embed-width'),
            $this->getMetadata('publish.embed-height'),
            json_encode($this->getMetadata('publish.embed-heights')),
            str_replace('"', '&quot;', json_encode($this->getMetadata('publish.embed-heights')))
        ];

        // hack: revert the UI language
        if ($this->getLanguage() != '') {
            $__l10n->loadMessages(DatawrapperSession::getLanguage());
        }

        foreach (publish_get_embed_templates() as $template) {
            $code = str_replace($search, $replace, $template['template']);
            $embedcodes['embed-method-'.$template['id']] = $code;
        }
        $this->updateMetadata('publish.embed-codes', $embedcodes);
    }

    public function unpublish() {
        $path = $this->getStaticPath();
        if (file_exists($path)) {
            $dirIterator = new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS);
            $itIterator  = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::CHILD_FIRST);

            foreach ($itIterator as $entry) {
                $file = realpath((string) $entry);

                if (is_dir($file)) {
                    rmdir($file);
                }
                else {
                    unlink($file);
                }
            }

            rmdir($path);
        }

        // Load CDN publishing class
        $config = $GLOBALS['dw_config'];
        if (!empty($config['publish'])) {

            // remove files from CDN
            $pub = get_module('publish', dirname(__FILE__) . '/../../../../');

            $id = $this->getID();

            $chart_files = array();
            $chart_files[] = "$id/index.html";
            $chart_files[] = "$id/data";
            $chart_files[] = "$id/$id.min.js";

            $pub->unpublish($chart_files);
        }

        // remove all jobs related to this chart
        JobQuery::create()
            ->filterByChart($this)
            ->delete();
    }

    public function hasPreview() {
        $cfg = $GLOBALS['dw_config'];

        if (isset($cfg['charts-s3'])
          && isset($cfg['charts-s3']['read'])
          && $cfg['charts-s3']['read'] == true) {

            $path = 's3://' . $cfg['charts-s3']['bucket'] . '/' .
                $this->getRelativeStaticPath() . '/m.png';
        } else {
            $path = $this->getStaticPath() . '/m.png';
        }

        try {
            return file_exists($path);
        } catch (Exception $ex) {
            return false;
        }
    }

    public function thumbUrl($forceLocal = false) {
        global $dw_config;

        $path = $dw_config["screenshot_path"] ?? $this->getHash();

        return get_current_protocol() . "://" . $dw_config["img_domain"] . "/"
            . $this->getID() . "/" . $path . "/plain.png";
    }

    public function getThumbFilename($thumb) {
        $cfg = $GLOBALS['dw_config'];
        if (isset($cfg['charts-s3']) && isset($cfg['charts-s3']['write'])
            && $cfg['charts-s3']['write'] == true) {
            // use S3 file url
            return 's3://' . $cfg['charts-s3']['bucket'] . '/'
                . get_relative_static_path($this) . '/' . $thumb . '.png';
        } else {
            // use local file url
            return get_static_path($this) . "/" . $thumb . '.png';
        }
    }

    public function plainUrl() {
        return $this->assetUrl('plain.html');
    }

    public function assetUrl($file) {
        return dirname($this->getPublicUrl() . '_') . '/' . $file;
    }

    public function getTitle() {
        if (isset($this->usePrintVersion) && $this->usePrintVersion) {
            return $this->getMetadata('describe.title');
        } else {
            return parent::getTitle();
        }
    }

    public function getTheme() {
        if (isset($this->usePrintVersion) && $this->usePrintVersion) {
            return $this->getMetadata('visualize.theme');
        } else {
            return parent::getTheme();
        }
    }

    public function getType() {
        if (isset($this->usePrintVersion) && $this->usePrintVersion) {
            $type = $this->getMetadata('visualize.type');
        } else {
            $type = parent::getType();
        }

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
        return get_current_protocol() . '://' . $GLOBALS['dw_config']['chart_domain'] . '/' . $this->getID() . '/index.html';
    }

    public function getCDNPath($version = null) {
        if ($version === null) $version = $this->getPublicVersion();
        return $this->getID() . '/' . ($version > 0 ? $version . '/' : '');
    }

    public function getNamespace() {
        if (!DatawrapperVisualization::has($this->getType())) return 'chart';
        $vis = DatawrapperVisualization::get($this->getType());
        return $vis['namespace'] ?? 'chart';
    }

    /**
     * the caption decides what goes in front of the byline in the
     * chart footer. can be either "chart:", "map:", or "table:"
     */
    public function getCaption() {
        if (!DatawrapperVisualization::has($this->getType())) return 'chart';
        $vis = DatawrapperVisualization::get($this->getType());
        return $vis['caption'] ?? $vis['namespace'] ?? 'chart';
    }

    /**
     * returns the text to be used in `aria-label` meta attribute
     * in iframe embed codes. visualizations may define a custom
     * aria label, otherwise we fall back to just "chart" or "map"
     */
    public function getAriaLabel($theme) {
        $vis = DatawrapperVisualization::get($this->getType());
        if ($vis !== false && !empty($vis['aria-label'])) {
            return $vis['aria-label'];
        }
        // fall back to chart type title
        if ($vis !== false && !empty($vis['title'])) {
            return $vis['title'];
        }
        // fall back to namespace caption
        return str_replace(':', '', $this->getNamespace() == 'map' ?
            $theme->getThemeData('options.footer.mapCaption') :
            $this->getNamespace() == 'table' ?
            $theme->getThemeData('options.footer.tableCaption') :
            $theme->getThemeData('options.footer.chartCaption'));
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
