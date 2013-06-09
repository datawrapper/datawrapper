<?php

class DatawrapperPlugin_VisualizationBarChart extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $meta = array(
            "id" => "bar-chart",
            "title" =>  _("Bar Chart"),
            "version" => "1.3.2",
            "extends" => "raphael-chart",
            "order" => 30,
            "dimensions" => 1,
            "options" => array(
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => _("Autmatically sort bars")
                ),
                "reverse-order" => array(
                    "type" => "checkbox",
                    "label" => _("Reverse order"),
                ),
                "labels-inside-bars" => array(
                    "type" => "checkbox",
                    "label" => _("Display labels inside bars")
                ),
                "negative-color" => array(
                    "type" => "checkbox",
                    "label" => _("Use different color for negative values")
                )
            ),
            "libraries" => array()
        );
        return $meta;
    } 
}