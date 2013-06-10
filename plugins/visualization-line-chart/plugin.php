<?php 

class DatawrapperPlugin_VisualizationLineChart extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $meta = array(
            "title" => __("Line Chart", $this->getName()),
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
        $id = $this->getName();
        $options = array(
            "direct-labeling" => array(
                "type" => "checkbox",
                "label" => __("Direct labeling", $id),
                "default" => false,
                "depends-on" => array(
                    "chart.min_series_num" => 2
                )
            ),
            "legend-position" => array(
                "type" => "radio",
                "label" => __("Legend position", $id),
                "default" => "right",
                "depends-on" => array(
                    "direct-labeling" => false,
                    "chart.min_series_num" => 2
                ),
                "options" => array(
                    array(
                        "value" => "right",
                        "label" => __("right", $id)
                    ),
                    array(
                        "value" => "top",
                        "label" => __("top", $id),
                    ),
                    array(
                        "value" => "inside",
                        "label" => __("inside", $id),
                    )
                )
            ),
            "fill-between" => array(
                "type" => "checkbox",
                "label" => __("Fill between lines", $id),
                "default" => false,
                "depends-on" => array(
                    "chart.min_series_num" => 2,
                    "chart.max_series_num" => 2
                )
            ),
            "smooth-lines" => array(
                "type" => "checkbox",
                "label" => __("Smooth lines", $id),
                "default" => false,
                "expert" => false
            ),
            "rotate-x-labels" => array(
                "type" => "checkbox",
                "label" => __("Rotate labels 45 degrees", $id),
                "default" => false
            ),
            "baseline-zero" => array(
                "type" => "checkbox",
                "label" => __("Force a baseline at zero", $id),
            ),
            "connect-missing-values" => array(
                "type" => "checkbox",
                "label" => __("Connect lines between missing values", $id),
                "label" => _("Force a baseline at zero"),
            ),
            "extend-range" => array(
                "type" => "checkbox",
                "label" => __("Extend y-range to nice axis ticks", $id)
            ),
            "force-banking" => array(
                "type" => "checkbox",
                "hidden" => true,
                "label" => __("Bank the lines to 45 degrees", $id)
            ),
            "show-grid" => array(
                "type" => "checkbox",
                "hidden" => true,
                "label" => __("Show grid", $id),
                "default" => false
            )
        );
        return $options;
    }
}
