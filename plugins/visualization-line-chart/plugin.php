<?php 

class DatawrapperPlugin_VisualizationLineChart extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $meta = array(
            "title" => _("Line Chart"),
            "id" => "line-chart",
            "version" => "1.3.1",
            "extends" => "raphael-chart",
            "dimensions" => 2,
            "order" => 40,
            "options" => $this->getOptions()
        );
        return $meta;
    }
    public function getOptions(){
        $options = array(
            "direct-labeling" => array(
                "type" => "checkbox",
                "label" => _("Direct labeling"),
                "default" => false,
                "depends-on" => array(
                    "chart.min_series_num" => 2
                )
            ),
            "legend-position" => array(
                "type" => "radio",
                "label" => _("Legend position"),
                "default" => "right",
                "depends-on" => array(
                    "direct-labeling" => false,
                    "chart.min_series_num" => 2
                ),
                "options" => array(
                    array(
                        "value" => "right",
                        "label" => _("right")
                    ),
                    array(
                        "value" => "top",
                        "label" => _("top"),
                    ),
                    array(
                        "value" => "inside",
                        "label" => _("inside"),
                    )
                )
            ),
            "fill-between" => array(
                "type" => "checkbox",
                "label" => _("Fill between lines"),
                "default" => false,
                "depends-on" => array(
                    "chart.min_series_num" => 2,
                    "chart.max_series_num" => 2
                )
            ),
            "smooth-lines" => array(
                "type" => "checkbox",
                "label" => _("Smooth lines"),
                "default" => false,
                "expert" => false
            ),
            "rotate-x-labels" => array(
                "type" => "checkbox",
                "label" => _("Rotate labels 45 degrees"),
                "default" => false
            ),
            "baseline-zero" => array(
                "type" => "checkbox",
                "label" => _("Force a baseline at zero"),
            ),
            "connect-missing-values" => array(
                "type" => "checkbox",
                "label" => _("Connect lines between missing values"),
                "depends-on" => array("chart.missing_values" => true)
            ),
            "extend-range" => array(
                "type" => "checkbox",
                "label" => _("Extend y-range to nice axis ticks")
            ),
            "force-banking" => array(
                "type" => "checkbox",
                "hidden" => true,
                "label" => _("Bank the lines to 45 degrees")
            ),
            "show-grid" => array(
                "type" => "checkbox",
                "hidden" => true,
                "label" => _("Show grid"),
                "default" => false
            )
        );
        return $options;
    }
}    
    
