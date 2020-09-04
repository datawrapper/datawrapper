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
    public function getThemeData($key = null) {
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

    public function getAssetFiles() {
        $assets = $this->getExtendedAssets();
        return array_filter($assets, function($v) { return $v['type'] == "file"; });
    }

    public function getAssetFonts() {
        $assets = $this->getExtendedAssets();
        return array_filter($assets, function($v) { return $v['type'] == "font"; });
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
            $meta = json_decode(parent::getData(), true);
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
                if (isset($meta['options']['footer']['tableCaption']) && empty($meta['options']['footer']['tableCaption'])) {
                    unset($meta['options']['footer']['tableCaption']);
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
                if ($val !== array()) $arr[$key] = $val;
            }
        }

        return $arr;
    }

    public function serialize($includeAll) {
        $data = $this->toArray();

        if (!$includeAll) {
            unset($data['Assets']);
            unset($data['Less']);
        }

        if (empty($data["Data"])) $data["Data"] = new stdClass();

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
