<?php

class DatawrapperPlugin_VisualizationElectionDonut extends DatawrapperPlugin_Visualization {

    public function getMeta() {
        return array(
            "id" => "election-donut-chart",
            "title" => __("Election Donut", $this->getName()),
            "version" => "1.3.0",
            "extends" => "donut-chart",
            "dimensions" => 1,
            "order" => 60,
            "options" => array(
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => __("Sort by size", $this->getName()),
                    "default" => true
                )
            )
        );
    }
}
