<?php

class DatawrapperPlugin_VisualizationGroupedColumnChart extends DatawrapperPlugin_Visualization{

    public function getMeta(){
        $id = $this->getName();
        $meta = array(
            "id" => "grouped-column-chart",
            "title" => __("Grouped Column Chart", $id),
            "version" => "1.3.2",
            "dimensions" => 2,
            "extends" => "raphael-chart",
            "color-by" => "row",
            "order" => 10,
            "options" => array(
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => __("Automatically sort bars", $id)
                ),
                "reverse-order" => array(
                    "type" => "checkbox",
                    "label" => __("Reverse order", $id)
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
