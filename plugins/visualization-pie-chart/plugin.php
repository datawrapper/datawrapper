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
            "version" => "1.3.0",
            "extends" => "raphael-chart",
            "author" => array(
                "name" => "gka",
                "email" => "gka@vis4.net"
            ),
            "order" => 50,
            "dimensions" => 1,
            "options" => array(
            ),
            "locale" => array(
                "other" => __("other", $id)
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