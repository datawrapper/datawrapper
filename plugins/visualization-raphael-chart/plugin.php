<?php

class DatawrapperPlugin_VisualizationRaphaelChart extends DatawrapperPlugin_Visualization {

    public function getMeta() {
        $cdn_url = $GLOBALS['dw_config']['cdn_asset_base_url'];
        return array(
            "id" => "raphael-chart",
            "libraries" => array(
                array(
                    "local" => "vendor/d3-light.min.js",
                    "cdn" => !empty($cdn_url)
                        ? $cdn_url . "vendor/d3-light/3.1.7/d3-light.min.js"
                        : null
                ),
                array(
                    "local" => "vendor/chroma.min.js",
                    "cdn" => !empty($cdn_url)
                        ? $cdn_url . "vendor/chroma-js/0.5.4/chroma.min.js"
                        : null
                ),
                array(
                    "local" => "vendor/raphael-2.1.2.min.js",
                    "cdn" => !empty($cdn_url)
                        ? $cdn_url . "vendor/raphael-js/2.1.2/raphael-min.js"
                        : null
                )
            )
        );
    }
}