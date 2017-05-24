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
        // compile: theme-variables, chart.base.less, visulization.less

        $less = new lessc;

        $less->setVariables($this->getThemeDataAsFlatArray());
        $base = file_get_contents(ROOT_PATH . 'assets/styles/chart.base/main.less');

        $allVisLess = "";

        foreach ($visLess as $vis) {
            $allVisLess .= "\n\n\n" . file_get_contents($vis);
        }

        return $less->compile($base . "\n" . $allVisLess);
    }

    public function getThemeData() {
        $theme = $this;
        $themeData = [$theme->getData()];

        while ($theme->getExtend() != null) {
            $theme = ThemeQuery::create()->findPk($theme->getExtend());
            $themeData[] = $theme->getData();
        }

        $themeList = array_reverse($themeData);

        $data = array();

        foreach ($themeList as $theme) {
            $data = array_merge($data, $theme);
        }

        return $data;
    }

    public function getThemeDataAsFlatArray($data = null, $prefix = "") {
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
                $f = array_merge($f, $this->getThemeDataAsFlatArray($d, $px));
            } else {
                $f[$px] = $d;
            }
        }

        return $f;
    }

    /**
     * returns the theme data
     */
    public function getData($key = null) {
        $meta = json_decode(parent::getData(), true);
        if (!is_array($meta)) $meta = array();
        if (empty($key)) return $meta;
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
}
