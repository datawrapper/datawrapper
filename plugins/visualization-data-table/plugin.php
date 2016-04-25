<?php 

class DatawrapperPlugin_VisualizationDataTable extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $id = $this->getName();

        $cfg = $GLOBALS['dw_config'];

        $to_translate = array(
            "sEmptyTable"           => "No data available in table", 
            "sInfo"                 => "Showing _START_ to _END_ of _TOTAL_ entries",
            "sInfoEmpty"            => "Showing 0 to 0 of 0 entries", 
            "sInfoFiltered"         => "(filtered from _MAX_ total entries)", 
            "sInfoThousands"        => ",", 
            "sLengthMenu"           => "Show _MENU_ entries",
            "sLoadingRecords"       => "Loading...",
            "sProcessing"           => "Processing...",
            "sSearch"               => "Search:",
            "sZeroRecords"          => "No matching records found",
            "oPaginate_sFirst"      => "First",
            "oPaginate_sLast"       => "Last",
            "oPaginate_sNext"       => "Next",
            "oPaginate_sPrevious"   => "Previous",
            "oAria_sSortAscending"  => ": activate to sort column ascending",
            "oAria_sSortDescending" => ": activate to sort column descending");


        $translated = array();

        if (isset($cfg['plugins']['chart-locale-select']))  {
            $available_locales = $cfg['plugins']['chart-locale-select']['locales'];
        } else {
            $available_locales = array("en-US|en_US");
        }

        $locales = explode(",", $available_locales);

        foreach ($locales as $locale) {
            $key = str_replace("-", "_", explode("|", $locale)[0]);

            $l10n = new Datawrapper_L10N();
            $l10n->loadMessages($key);

            foreach ($to_translate as $skey => $lkey) {
                if (!isset($translated[$skey])) $translated[$skey] = array();

                if (strpos($key, "-") !== false) {
                    $short_key = explode("-", $key)[0];
                } else if (strpos($key, "_") !== false) {
                    $short_key = explode("_", $key)[0];
                }

                $translated[$skey][$short_key] = $l10n->translate($lkey, false, "");
            }
        }

        $meta = array(
            "title"      => __("Data Table", $this->getName()),
            "id"         => "data-table",
            "dimensions" => 2,
            "order"      => 71,
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
            )
        );
        return $options;
    }
}
