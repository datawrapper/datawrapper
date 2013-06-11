<?php

class DatawrapperPlugin_VisualizationRaphaelChart extends DatawrapperPlugin_Visualization {

    public function getMeta() {
        return array(
            "id" => "raphael-chart",
            "libraries" => array(
                "vendor/d3-light.min.js",
                "vendor/chroma.min.js",
                "vendor/raphael-2.1.0.min.js"
            )
        );
    }
}