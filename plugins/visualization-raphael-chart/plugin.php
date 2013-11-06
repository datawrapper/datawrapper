<?php

class DatawrapperPlugin_VisualizationRaphaelChart extends DatawrapperPlugin_Visualization {

    public function getMeta() {
        return array(
            "id" => "raphael-chart",
            "libraries" => array(
                array(
                    "local" => "vendor/d3-light.min.js",
                    "cdn" => "//assets-datawrapper.s3.amazonaws.com/vendor/d3-light/3.1.7/d3-light.min.js"
                ),
                array(
                    "local" => "vendor/chroma.min.js",
                    "cdn" => "//assets-datawrapper.s3.amazonaws.com/vendor/chroma-js/0.5.4/chroma.min.js"
                ),
                array(
                    "local" => "vendor/raphael-2.1.2.min.js",
                    "cdn" => "//assets-datawrapper.s3.amazonaws.com/vendor/raphael-js/2.1.2/raphael-min.js"
                )
            )
        );
    }
}