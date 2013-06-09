<?php 
class DatawrapperPlugin_VisualizationGroupedColumnChart extends DatawrapperPlugin_Visualization{
    public function getMeta(){
        $meta = array( 
            "id" => "grouped-column-chart",
            "title" => _("Grouped Column Chart"),
            "version" => "1.3.2",
            "dimensions" => 2,
            "extends" => "raphael-chart",
            "color-by" => "row",
            "order" => 10,
            "options" => array(
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => _("Automatically sort bars")
                ),
                "reverse-order" => array(
                    "type" => "checkbox",
                    "label" => _("Reverse order")
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
