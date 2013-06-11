<?php

class DatawrapperPlugin_VisualizationBarChart extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $id = $this->getName();
        $meta = array(
            "id" => "bar-chart",
            "title" =>  __("Bar Chart", $id),
            "version" => "1.3.2",
            "extends" => "raphael-chart",
            "order" => 30,
            "dimensions" => 1,
            "options" => array(
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => __("Autmatically sort bars", $id)
                ),
                "reverse-order" => array(
                    "type" => "checkbox",
                    "label" => __("Reverse order", $id),
                ),
                "labels-inside-bars" => array(
                    "type" => "checkbox",
                    "label" => __("Display labels inside bars", $id)
                ),
                "negative-color" => array(
                    "type" => "checkbox",
                    "label" => __("Use different color for negative values", $id)
                )
            ),
            "libraries" => array()
        );
        return $meta;
    }
}