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

    public function getCSS($vis) {
        // compile: theme-variables, chart.base.less, visulization.less

        $less = new lessc;

        $less->setVariables(array(
            "chart_background" => "transparent",
            "chart_padding" => "10px",
            "chart_fontFamily" => "Roboto, sans-serif",
            "headline_fontSize" => "26px",
            "headline_fontWeight" => 700,
            "intro_fontSize" => "16px",
            "intro_fontWeight" => 500,
        ));

        $base = file_get_contents(ROOT_PATH . 'assets/styles/chart.base/main.less');
        $vis = file_get_contents($vis["less"]);

        return $less->compile($base . "\n" . $vis);
    }

    public function getThemeData() {
        // extend all the things
        return $this->getData();
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

}
