<?php 

class DatawrapperPlugin_VisualizationDataTable extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $id = $this->getName();
        $meta = array(
            "title"      => __("Data Table", $this->getName()),
            "id"         => "data-table",
            "dimensions" => 2,
            "order"      => 70,
            "libraries"  => array(array(
                "local" => "vendor/jquery.dataTables.min.js",
                "cdn" => "//ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js"
            )),
            "options"    => $this->getOptions(),
            "locale"     => array(
                // datatable.jquery
                "sEmptyTable"           => __("No data available in table"                 , $id),
                "sInfo"                 => __("Showing _START_ to _END_ of _TOTAL_ entries", $id),
                "sInfoEmpty"            => __("Showing 0 to 0 of 0 entries"                , $id),
                "sInfoFiltered"         => __("(filtered from _MAX_ total entries)"        , $id),
                // "sInfoPostFix"          => __(""                                           , $id),
                "sInfoThousands"        => __(","                                          , $id),
                "sLengthMenu"           => __("Show _MENU_ entries"                        , $id),
                "sLoadingRecords"       => __("Loading..."                                 , $id),
                "sProcessing"           => __("Processing..."                              , $id),
                "sSearch"               => __("Search:"                                    , $id),
                "sZeroRecords"          => __("No matching records found"                  , $id),
                "oPaginate_sFirst"      => __("First"                                      , $id),
                "oPaginate_sLast"       => __("Last"                                       , $id),
                "oPaginate_sNext"       => __("Next"                                       , $id),
                "oPaginate_sPrevious"   => __("Previous"                                   , $id),
                "oAria_sSortAscending"  => __(": activate to sort column ascending"        , $id),
                "oAria_sSortDescending" => __(": activate to sort column descending"       , $id)
                // NOTE: or?
                // "sEmptyTable"           => __("sEmptyTable"          , $id),
                // "sInfo"                 => __("sInfo"                , $id),
                // "sInfoEmpty"            => __("sInfoEmpty"           , $id),
                // "sInfoFiltered"         => __("sInfoFiltered"        , $id),
                // "sInfoPostFix"          => __("sInfoPostFix"         , $id),
                // "sInfoThousands"        => __("sInfoThousands"       , $id),
                // "sLengthMenu"           => __("sLengthMenu"          , $id),
                // "sLoadingRecords"       => __("sLoadingRecords"      , $id),
                // "sProcessing"           => __("sProcessing"          , $id),
                // "sSearch"               => __("sSearch"              , $id),
                // "sZeroRecords"          => __("sZeroRecords"         , $id),
                // "oPaginate_sFirst"      => __("oPaginate_sFirst"     , $id),
                // "oPaginate_sLast"       => __("oPaginate_sLast"      , $id),
                // "oPaginate_sNext"       => __("oPaginate_sNext"      , $id),
                // "oPaginate_sPrevious"   => __("oPaginate_sPrevious"  , $id),
                // "oAria_sSortAscending"  => __("oAria_sSortAscending" , $id),
                // "oAria_sSortDescending" => __("oAria_sSortDescending", $id)
            )
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
            )
        );
        return $options;
    }
}
