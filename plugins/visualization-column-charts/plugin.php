<?php

class DatawrapperPlugin_VisualizationColumnCharts extends DatawrapperPlugin_Visualization{

    public function init() {
        DatawrapperVisualization::register($this, $this->getMeta_Simple());
        DatawrapperVisualization::register($this, $this->getMeta_Grouped());
        DatawrapperVisualization::register($this, $this->getMeta_Stacked());
    }

    public function getMeta_Simple(){
        $id = $this->getName();

        $meta = array(
            "id" => "column-chart",
            "title" => __("Column Chart", $id),
            "version" => $this->getVersion(),
            "dimensions" => 1,
            "extends" => "raphael-chart",
            "order" => 0,
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "columns" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
            "options" => array(
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => __("Automatically sort bars")
                ),
                "reverse-order" => array(
                    "type" => "checkbox",
                    "label" => __("Reverse order")
                ),
                "negative-color" => array(
                    "type" => "checkbox",
                    "label" => __("Use different color for negative values")
                ),
                "absolute-scale" => array(
                    "type" => "checkbox",
                    "label" => __("Use the same scale for all columns")
                ),
                "grid-lines" => array(
                    "type" => "radio",
                    "label" => __("Grid lines"),
                    "options" => array(
                        array("value" => "auto", "label" => __("Automatic")),
                        array("value" => "show", "label" => __("Show")),
                        array("value" => "hide", "label" => __("Hide"))
                    ),
                    "default" => false
                )
            )
        );
        return $meta;
    }

    public function getMeta_Grouped(){
        $id = $this->getName();

        $meta = array(
            "id" => "grouped-column-chart",
            "title" => __("Grouped Column Chart", $id),
            "version" => $this->getVersion(),
            "dimensions" => 2,
            "extends" => "raphael-chart",
            "color-by" => "row",
            "order" => 10,
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "columns" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
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

    public function getMeta_Stacked(){
        $id = $this->getName();

        $meta = array(
            "id" => "stacked-column-chart",
            "title" => __("Stacked Column Chart", $id),
            "version" => $this->getVersion(),
            "dimensions" => 2,
            "extends" => "grouped-column-chart",
            "color-by" => "row",
            "order" => 10,
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "columns" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
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
                ),
                "normalize" => array(
                    "type" => "checkbox",
                    "label" => __("Stack percentages", $id),
                    "default" => false
                ),
                "normalize-user" => array(
                    "type" => "checkbox",
                    "label" => __("Let user switch mode"),
                    "depends-on" => array(
                        "normalize" => true
                    )
                )
            ),
            "locale" => array(
                "stack percentages" => __("stack percentages", $id)
            )
        );
        return $meta;
    }
}
