<?php

class DatawrapperPlugin_VisualizationPieChart extends DatawrapperPlugin_Visualization {

    function init() {
        DatawrapperVisualization::register($this, $this->getMeta_PieChart());
        DatawrapperVisualization::register($this, $this->getMeta_DonutChart());
    }

    function getMeta_PieChart() {
        $id = $this->getName();
        return array(
            "id" => 'pie-chart',
            "title" => __("Pie chart", $id),
            "extends" => "raphael-chart",
            "author" => array(
                "name" => "gka",
                "email" => "gka@vis4.net"
            ),
            "order" => 50,
            "dimensions" => 1,
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "slices" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
            "color-by" => "row",
            "options" => array(
                "base-color" => array(
                    "type" => "base-color",
                    "label" => __("Base color")
                )
            ),
            "locale" => array(
                "other" => __("other", $id),
                "cannotShowNegativeValues" => __("Pie charts are intended to show part-of-whole relations, and thus they <b>cannot be used to display negative numbers</b>. Please consider using a different chart type instead (eg. a bar chart).", $id),
                "noMoreThanFiveSlices" => __("Your data contains <b>more values than can be shown in a pie chart</b>, so we grouped %count slices into the slice named <i>'others'</i>.<p>Why not use a bar chart to allow better comparison of values?</p>", $id)
            ),
            "libraries" => array()
        );
    }

    function getMeta_DonutChart() {
        $id = $this->getName();
        return array(
            'id' => 'donut-chart',
            "title" => __("Donut chart", $id),
            "version" => "1.3.0",
            "extends" => "pie-chart",
            "author" => array(
                "name" => "gka",
                "email" => "gka@vis4.net"
            ),
            "order" => 60,
            "dimensions" => 1,
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "slices" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
            "options" => array(
                "show-total" => array(
                    "type" => "checkbox",
                    "label" => __("Show total value in center", $id),
                    "default" => true
                ),
                "custom-total" => array(
                    "type" => "checkbox",
                    "label" => __("Use custom total value instead of sum", $id),
                    "default" => false,
                    "depends-on" => array(
                        "show-total" => true,
                        "chart.max_row_num" => 1
                    )
                ),
                "custom-total-value" => array(
                    "type" => "text",
                    "label" => __("Custom total value", $id),
                    "depends-on" => array(
                        "show-total" => true,
                        "custom-total" => true
                    )
                )
            )
        );
    }

}