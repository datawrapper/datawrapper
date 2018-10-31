<?php



/**
 * Skeleton subclass for representing a row from the 'theme' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Theme extends BaseTheme
{
    public function getCSS($visLess) {
        global $app;
        global $appTwig;
        $theme = $this;

        // compile: theme-variables, chart.base.less, visulization.less
        $data = $this->getThemeDataAsFlatArray();

        $twig = (empty($appTwig) ? $app->view()->getEnvironment() : $appTwig->view()->getEnvironment());
        $twigData = $data;
        $twigData['fonts'] = $this->getAssetFonts();

        $baseLess = $twig->render('chart-styles.less.twig', $twigData);

        $allThemeLess = $this->getLess();

        while (!empty($theme->getExtend())) {
            $theme = ThemeQuery::create()->findPk($theme->getExtend());
            $allThemeLess = $theme->getLess() . "\n\n\n" . $allThemeLess;
        }

        $allVisLess = "";

        foreach ($visLess as $vis) {
            $allVisLess .= "\n\n\n" . file_get_contents($vis);
        }


        $data['colors_perceived_bg'] =
            empty($data['colors_background']) ||
                $data['colors_background'] == '~"transparent"' ? '~"white"' :
                $data['colors_background'];

        $less = new lessc;
        $less->setVariables($data);
        return $less->compile($baseLess . "\n" . $allVisLess . "\n" . $allThemeLess);
    }

    public function getThemeData($key = null) {
        if ($this->getId() == "default" && DatawrapperHooks::hookRegistered("get_default_theme")) {
            $data = DatawrapperHooks::execute("get_default_theme")[0];
        } else {
            $theme = $this;
            $themeData = [$theme->getData()];

            while ($theme->getExtend() != null) {
                $theme = ThemeQuery::create()->findPk($theme->getExtend());
                $themeData[] = $theme->getData();
            }

            $themeList = array_reverse($themeData);

            $data = array();

            foreach ($themeList as $theme) {
                $data = $this->extendArray($data, $theme);
            }
        }

        if (Hooks::hookRegistered('set_theme_data')) {
            $theme_data = Hooks::execute("set_theme_data");

            foreach ($theme_data as $set) {
                $data = $this->extendArray($data, $set);
            }
        }

        if ($key == null) {
            return $data;
        } else {
            return $this->getData($key, $data);
        }
    }


    public function getThemeDataAsFlatArray($data = null, $prefix = "", $format = 'twig') {
        if ($data == null) $data = $this->getThemeData();

        $f = array();

        foreach ($data as $k => $d) {
            $px = $prefix;

            if ($px == "") {
                $px = $k;
            } else {
                $px .= "_" . $k;
            }

            if (is_array($d)) {
                if (sizeof($d) > 0) {
                    $f = array_merge($f, $this->getThemeDataAsFlatArray($d, $px));
                }
            } else {
                if ($format = "less") {
                    if (is_string($d)) {
                        $f[$px] = '~"' . $d . '"';
                    } else {
                        $f[$px] = $d;
                    }
                } else {
                    $f[$px] = $d;
                }

            }
        }

        return $f;
    }

    public function getAssetUrl($name) {
        $assets = json_decode(parent::getAssets(), true);
        if (!is_array($assets)) $assets = array();
        return $assets[$name]['url'];
    }

    public function addAssetFile($name, $url) {
        $assets = json_decode(parent::getAssets(), true);
        if (!is_array($assets)) $assets = array();

        $assets[$name] = array(
            "url" => $url,
            "type" => "file"
        );

        $this->setAssets(json_encode($assets));
        $this->save();
    }

    public function addAssetFont($name, $type, $urls) {
        $assets = json_decode(parent::getAssets(), true);
        if (!is_array($assets)) $assets = array();

        $assets[$name] = [];
        $assets[$name]['method'] = $type;

        if ($type == "import") {
            $assets[$name]['import'] = $urls['import'];
        } else {
            $assets[$name]['files'] = $urls;
        }

        $assets[$name]['type'] = "font";

        $this->setAssets(json_encode($assets));
        $this->save();
    }

    public function getAssetFiles() {
        $assets = $this->getExtendedAssets();
        return array_filter($assets, function($v) { return $v['type'] == "file"; });
    }

    public function getAssetFonts() {
        $assets = $this->getExtendedAssets();
        return array_filter($assets, function($v) { return $v['type'] == "font"; });
    }

    public function removeAsset($name) {
        $assets = json_decode(parent::getAssets(), true);
        if (!is_array($assets)) $assets = array();
        unset($assets[$name]);
        $this->setAssets(json_encode($assets));
        $this->save();
    }

    public function getExtendedAssets() {
        $themeAssets = json_decode($this->getAssets(), 1) ?? [];

        $extend = $this->getExtend();
        if (!empty($extend)) {
            $ex = ThemeQuery::create()->findPk($extend)->getExtendedAssets();
            $themeAssets = array_merge($themeAssets, $ex);
        }

        return $themeAssets ?? [];
    }

    /**
     * returns the theme data
     */
    public function getData($key = null, $meta = null) {
        if (empty($meta)) {
            if ($this->getId() == "default" && DatawrapperHooks::hookRegistered("get_default_theme")) {
                $meta = DatawrapperHooks::execute("get_default_theme")[0];
            } else {
                $meta = json_decode(parent::getData(), true);
            }

            if (!is_array($meta)) $meta = array();
        }

        if (empty($key)) {
            // fall back to default caption if captions are set but empty
            if (isset($meta['options']) && isset($meta['options']['footer'])) {
                if (isset($meta['options']['footer']['sourceCaption']) && empty($meta['options']['footer']['sourceCaption'])) {
                    unset($meta['options']['footer']['sourceCaption']);
                }
                if (isset($meta['options']['footer']['chartCaption']) && empty($meta['options']['footer']['chartCaption'])) {
                    unset($meta['options']['footer']['chartCaption']);
                }
            }
            return $meta;
        }
        $keys = explode('.', $key);
        $p = $meta;
        foreach ($keys as $key) {
            if (isset($p[$key])) $p = $p[$key];
            else return null;
        }
        return $p;
    }

    /*
     * update a part of the data
     */
    public function updateData($key, $value) {
        $meta = $this->getData();
        $keys = explode('.', $key);
        $p = &$meta;
        foreach ($keys as $key) {
            if (!isset($p[$key])) {
                $p[$key] = array();
            }
            $p = &$p[$key];
        }
        $p = $value;
        $this->setData(json_encode($meta));
    }

    public function getRawData($key = null) {
        return parent::getData();
    }

    /*
     * Two helper functions that handle array extensions
     */

    private function isNumericArray($array) {
        foreach ($array as $a => $b) {
            if (!is_int($a)) {
                return false;
            }
        }

        return true;
    }

    private function extendArray($arr, $arr2) {
        foreach ($arr2 as $key => $val) {
            $arr1IsObject = (isset($arr[$key]) && is_array($arr[$key]) && !$this->isNumericArray($arr[$key]));
            $arr2IsObject = (isset($val) && is_array($val) && !$this->isNumericArray($val));

            if ($arr1IsObject && $arr2IsObject) {
                $arr[$key] = $this->extendArray($arr[$key], $val);
            } else {
                if ($val != array()) $arr[$key] = $val;
            }
        }

        return $arr;
    }

    public function serialize() {
        $data = $this->toArray();
        unset($data['Assets']);
        unset($data['Less']);
        return $this->lowercaseKeys($data);
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
}
