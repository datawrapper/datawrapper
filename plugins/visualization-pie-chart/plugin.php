<?php

class DatawrapperPlugin_VisualizationPieChart extends DatawrapperPlugin_Visualization {

    function init() {
        DatawrapperVisualization::register($this, $this->getMeta_PieChart());
        DatawrapperVisualization::register($this, $this->getMeta_DonutChart());
    }

    function getMeta_PieChart() {
        return array(
            "id" => 'pie-chart',
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

    function getMeta_DonutChart() {
        return array(
            'id' => 'donut-chart',
            "title" => _("Donut chart"),
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
                    "label" => array(
                        "en" => "Show total value in center",
                        "de" => "Zeige Summe in der Mitte",
                        "fr" => "Afficher la somme au centre"
                    ),
                    "default" => true
                ),
                "custom-total" => array(
                    "type" => "checkbox",
                    "label" => array(
                        "en" => "Use custom total value instead of sum",
                        "de" => "Eigenen Wert anstelle der Summe verwenden",
                        "fr" => "Afficher une autre valeur au centre"
                    ),
                    "default" => false,
                    "depends-on" => array(
                        "show-total" => true,
                        "chart.max_row_num" => 1
                    )
                ),
                "custom-total-value" => array(
                    "type" => "text",
                    "label" => array(
                        "en" => "Custom total value",
                        "de" => "Eigener Wert",
                        "fr" => "Valeur personnalisée"
                    ),
                    "depends-on" => array(
                        "show-total" => true,
                        "custom-total" => true
                    )
                )
            )
        );
    }

}