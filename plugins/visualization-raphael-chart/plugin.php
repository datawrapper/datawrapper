<?php

class DatawrapperPlugin_VisualizationRaphaelChart extends DatawrapperPlugin_Visualization {

    public function getMeta() {
        return array(
            "id" => "raphael-chart",
            "libraries" => array(
                "d3js/d3-light.min.js",
                "chromajs/chroma.min.js",
                "raphaeljs/raphael-2.1.0.min.js"
            )
        );
    }
}