 <?php

class DatawrapperPlugin_VisualizationLineChart extends DatawrapperPlugin_Visualization {

    public function getMeta(){
        $meta = array(
            "title" => __("Line Chart", $this->getName()),
            "id" => "line-chart",
            "extends" => "raphael-chart",
            "dimensions" => 2,
            "order" => 40,
            "axes" => array(
                "x" => array(
                    "accepts" => array("text", "date"),
                ),
                "y1" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                ),
                "y2" => array(
                    "accepts" => array("number"),
                    "multiple" => true,
                    "optional" => true
                )
            ),
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
                    "chart.min_columns[y1]" => 2,
                    "chart.max_columns[y2]" => 0  // direct labeling not possible with second axis
                )
            ),
            "legend-position" => array(
                "type" => "radio",
                "label" => __("Legend position", $id),
                "default" => "right",
                "depends-on" => array(
                    "direct-labeling" => false,
                    "chart.min_columns[y1]" => 2
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
                        "label" => __("inside left", $id),
                    ),
                    array(
                        "value" => "inside-right",
                        "label" => __("inside right", $id),
                    )
                )
            ),

            "rotate-x-labels" => array(
                "type" => "checkbox",
                "label" => __("Rotate labels 45 degrees", $id),
                "default" => false
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
            ),

            "sep-lines" => array(
                "type" => "separator",
                "label" => __("Customize lines", $id)
            ),
            "connect-missing-values" => array(
                "type" => "checkbox",
                "label" => __("Connect lines between missing values", $id),
            ),
            "smooth-lines" => array(
                "type" => "checkbox",
                "label" => __("Smooth lines", $id),
                "default" => false,
                "expert" => false
            ),
            "fill-between" => array(
                "type" => "checkbox",
                "label" => __("Fill between lines", $id),
                "default" => false,
                "depends-on" => array(
                    "chart.min_columns[y1]" => 2,
                    "chart.max_columns[y1]" => 2,
                    "chart.max_columns[y2]" => 0  // direct labeling not possible with second axis
                )
            ),

            "sep-y-axis" => array(
                "type" => "separator",
                "label" => __("Customize y-Axis", $id)
            ),
            "baseline-zero" => array(
                "type" => "checkbox",
                "label" => __("Extend to zero", $id),
            ),
            "extend-range" => array(
                "type" => "checkbox",
                "label" => __("Extend to nice ticks", $id)
            ),
            "invert-y-axis" => array(
                "type" => "checkbox",
                "label" => __("Invert direction", $id),
                "default" => false
            )
        );
        return $options;
    }

}
