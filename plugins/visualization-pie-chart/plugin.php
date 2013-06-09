<?php

class DatawrapperPlugin_VisualizationPieChart extends DatawrapperPlugin_Visualization {

    function getMeta() {
        return array(
            'id' => 'pie-chart',
            "title" => _("Pie chart"),
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
                "other" => _("other")
            ),
            "libraries" => array()
        );
    }

}