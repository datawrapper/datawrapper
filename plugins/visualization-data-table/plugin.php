<?php

class DatawrapperPlugin_VisualizationDataTable extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $id = $this->getName();

        $translated = json_decode(file_get_contents(dirname(__FILE__) . '/chart-translations.json'), 1);

        $meta = array(
            "title"      => __("Data Table", $this->getName()),
            "id"         => "data-table",
            "dimensions" => 2,
            "order"      => 71,
            "less" => dirname(__FILE__ ) . "/static/data-table.less",
            "height"     => "fixed",
            "libraries"  => array(array(
                "local" => "vendor/jquery.dataTables.min.js",
                "cdn" => "//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js"
            )),
            "options"    => $this->getOptions(),
            "locale"    => $translated,
        );
        return $meta;
    }

    public function getOptions(){
        $id = $this->getName();
        $options = array(
            "sort-by" => array(
                "type" => "column-select",
                "label" => __("Sort table by"),
                "optional" => true
            ),
            "sort-asc" => array(
                "type" => "checkbox",
                "label" => __("Sort ascending"),
                "default" => true,
                "depends-on" => array(
                    "isnull(sort-by)" => false
                )
            ),
            "sortable" => array(
                "type" => "checkbox",
                "label" => __("Make column sortable", $id),
                "default" => true
            ),
            "paginate" => array(
                "type" => "checkbox",
                "label" => __("Display content over multiple pages", $id)
            ),
            "filter" => array(
                "type" => "checkbox",
                "label" =>  __("Show filter", $id)
            ),
            "hide-header" => array(
                "type" => "checkbox",
                "label" =>  __("Hide header", $id),
                "default" => false
            ),
            "header-color" => array(
                "type" => "base-color",
                "hideCustomColorSelector" => true,
                "label" => __("Header color")
            ),
            'table-responsive' => [
                'type' => 'checkbox',
                'label' => __('table / responsive'),
                'default' => true,
                'help' => __('table / responsive / help')
            ],
            "replace-flag-icons" => [
                "type" => "checkbox",
                "label" => __("display / replace-flags", 'visualization-table'),
                "default" => false,
                // "help" => __('table / flags / help', 'visualization-table')
            ],
            "flag-icon-type" => [
                "type" => "radio",
                "default" => "4x3",
                "options" => [
                    ["value" => "4x3", "label" => __("display / flag-aspect / 4x3", 'visualization-table')],
                    ["value" => "1x1", "label" => __("display / flag-aspect / square", 'visualization-table')],
                ],
                "label" => __("display / flag-aspect", 'visualization-table'),
                "depends-on" => [
                    "replace-flag-icons" => true
                ]
            ]
        );
        return $options;
    }
}
