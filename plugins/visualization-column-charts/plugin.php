<?php

class DatawrapperPlugin_VisualizationColumnCharts extends DatawrapperPlugin_Visualization{

    public function init() {
        $groupXAxis = [
            "type" => "group",
            "label" => __("settings / x-axis"),
            "options" => [
                "rotate-labels" => array(                            
                    "label" => __("settings / rotate"),                            
                    "type" => "radio",                            
                    "options" => [
                        "auto" => __("settings / auto"),
                        "on" => __("settings / always"),
                        "off" => __("settings / never")
                    ],
                    "default" => 'auto'
                )
            ]
        ];

        $groupYAxis = [
            "type" => "group",
            "label" => __("settings / y-axis"),
            "options" => [
                'custom-range' => [
                    'type' => 'custom-range',
                    'label' => __('settings / extend-range')
                ],
                "grid-lines" => array(
                    "type" => "radio",
                    "label" => __("Grid lines"),
                    "options" => array(
                        array("value" => "show", "label" => __("Show")),
                        array("value" => "hide", "label" => __("Hide"))
                    ),
                    "default" => 'show'
                ),                        
                "custom-ticks" => array(
                    "type" => "text",
                    "label" => __("settings / custom-ticks"),
                    "depends-on" => array(
                        "grid-lines" => "show"
                    )
                ),
                "grid-label-position" => array(
                    "type" => "radio",
                    "label" => __("settings / grid-position"),
                    "options" => array(
                        "left" => __("settings / left"),
                        "right" => __("settings / right")
                    ),
                    "default" => "left",
                    "depends-on" => array(
                        "grid-lines" => "show"                                
                    )
                ),
                "grid-labels" => array(
                    "type" => "radio",
                    "label" => __("settings / label-position"),
                    "options" => array(
                        array("value" => "outside", "label" => __("settings / outside")),
                        array("value" => "inside", "label" => __("settings / inside")),
                        array("value" => "hidden", "label" => __("settings / hidden")),
                    ),
                    "default" => "outside",
                    "depends-on" => array(
                        "grid-lines" => "show"
                    )
                )
            ]            
        ];

        DatawrapperVisualization::register($this, array(
            "id" => "column-chart",
            "title" => __("Column Chart"),
            "version" => $this->getVersion(),
            "dimensions" => 1,
            "extends" => "raphael-chart",
            "order" => 9,
            "less" => dirname(__FILE__ ) . "/static/column-chart.less",
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "columns" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
            "options" => array(
                "g-sorting" => [
                    "type" => "group",
                    "label" => "Sorting",
                    "options" => [
                        "sort-values" => [
                            "type" => "checkbox",
                            "label" => __("Automatically sort bars")
                        ],
                        "reverse-order" => array(
                            "type" => "checkbox",
                            "label" => __("Reverse order")
                        ),
                    ]
                ],
                "g-x-axis" => $groupXAxis,
                "g-y-axis" => [
                    "type" => "group",
                    "label" => __("settings / y-axis"),
                    "options" => array_merge([
                        "absolute-scale" => array(
                            "type" => "checkbox",
                            "label" => __("Use the same scale for all columns"),
                            "depends-on" => array(
                                "chart.min_columns[columns]" => 2
                            )
                        )
                    ], $groupYAxis["options"])
                ],
                "g-display" => [
                    "type" => "group",
                    "label" => "Display",
                    "options" => [
                        "base-color" => [
                            "type" => "base-color",
                            "label" => __("Base color")
                        ],
                        "negative-color" => array(
                            "type" => "checkbox",
                            "label" => __("Use different color for negative values"),
                            "depends-on" => array(
                                "chart.min_value[columns]" => '<0'
                            )
                        ),
                        "bar-padding" => array(
                            "type" => "slider",
                            "label" => __("Space between bars (%)"),
                            "default" => 30,
                            "min" => 0,
                            "max" => 100
                        ),
                        "value-labels" => array(
                            "type" => "radio",
                            "label" => __("Value labels"),
                            "options" => array(
                                array("value" => "show", "label" => __("Show")),
                                array("value" => "hide", "label" => __("Hide")),
                                array("value" => "auto", "label" => __("Automatic")),
                                array("value" => "hover", "label" => __("Hover"))
                            ),
                            "default" => 'auto'
                        ),
                        "ignore-missing-values" => array(
                            "type" => "checkbox",
                            "label" => __("Ignore missing values"),
                            "default" => false
                        )
                    ]
                ]
            )
        ));        

        DatawrapperVisualization::register($this, array(
            "id" => "grouped-column-chart",
            "title" => __("Grouped Column Chart"),
            "version" => $this->getVersion(),
            "dimensions" => 2,
            "extends" => "column-chart",
            "color-by" => "row",
            "order" => 10,
            "less" => dirname(__FILE__ ) . "/static/grouped-column-chart.less",
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "columns" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
            "options" => array(
                "g-sorting" => [
                    "type" => "group",
                    "label" => "Sorting",
                    "options" => [
                        "sort-values" => [
                            "type" => "checkbox",
                            "label" => __("Automatically sort bars")
                        ],
                        "reverse-order" => array(
                            "type" => "checkbox",
                            "label" => __("Reverse order")
                        ),
                    ]
                ],
                "g-x-axis" => $groupXAxis,
                "g-y-axis" => $groupYAxis,
                "g-display" => [
                    "type" => "group",
                    "label" => "Display",
                    "options" => [
                        "base-color" => [
                            "type" => "base-color",
                            "label" => __("Base color")
                        ],
                        "value-labels" => array(
                            "type" => "radio",
                            "label" => __("Value labels"),
                            "options" => array(
                                array("value" => "show", "label" => __("Show")),
                                array("value" => "hide", "label" => __("Hide")),
                                array("value" => "hover", "label" => __("Hover"))
                            ),
                            "default" => 'hover'
                        )
                    ]
                ]
            ),
            "libraries" => array()
        ));

        DatawrapperVisualization::register($this, array(
            "id" => "stacked-column-chart",
            "title" => __("Stacked Column Chart"),
            "version" => $this->getVersion(),
            "dimensions" => 2,
            "extends" => "grouped-column-chart",
            "color-by" => "row",
            "order" => 11,
            "less" => dirname(__FILE__ ) . "/static/stacked-column-chart.less",
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "columns" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                )
            ),
            "options" => [
                "g-sorting" => [
                    "type" => "group",
                    "label" => "Sorting",
                    "options" => [
                        "sort-values" => array(
                            "type" => "checkbox",
                            "label" => __("Automatically sort bars")
                        ),
                        "sort-by" => array(
                            'type' => 'radio',
                            'label' => __('Sort by'),
                            'default' => 'first',
                            "depends-on" => [
                                "sort-values" => true
                            ],
                            'options' => [
                                [
                                    'value' => 'first',
                                    'label' => __('first')
                                ],
                                [
                                    'value' => 'last',
                                    'label' => __('last'),
                                ],
                            ]
                        ),
                        "reverse-order" => array(
                            "type" => "checkbox",
                            "depends-on" => [
                                "sort-values" => true
                            ],
                            "label" => __("Reverse order")
                        ),
                        "normalize" => array(
                            "type" => "checkbox",
                            "label" => __("Stack percentages"),
                            "default" => false
                        ),
                    ]
                ],
                "g-x-axis" => $groupXAxis,
                "g-y-axis" => $groupYAxis,
                "g-display" => [
                    "type" => "group",
                    "label" => __("settings / display"),
                    "options" => [
                        "base-color" => [
                            "type" => "base-color",
                            "label" => __("Base color")
                        ],
                        'direct-labeling' => [
                            'type' => 'radio',
                            'label' => __('Direct labeling'),
                            'default' => 'always',
                            'options' => [
                                [
                                    'value' => 'no',
                                    'label' => __('no')
                                ],
                                [
                                    'value' => 'always',
                                    'label' => __('yes'),
                                ],
                            ]
                        ],
                        'label-space' => [
                            'type' => 'slider',
                            'depends-on' => [
                                'direct-labeling' => 'always'
                            ],
                            'label' => __('Direct label space (%)'),
                            'default' => 30,
                            'min' => 10,
                            'max' => 50,
                            'step' => 1
                        ],
                        'connect-bars' => [
                            'type' => 'checkbox',
                            'label' => __('stacked / connect-bars'),
                            'default' => false,
                        ],
                        "value-labels" => array(
                            "type" => "radio",
                            "label" => __("Value labels"),
                            "options" => array(
                                array("value" => "show", "label" => __("Show")),
                                array("value" => "hide", "label" => __("Hide")),
                                array("value" => "hover", "label" => __("Hover"))
                            ),
                            "default" => 'hover'
                        )
                    ]
                ]
            ],
            "locale" => array(
                "stack percentages" => __("stack percentages"),
                "cannotShowNegativeValues" => __("negative-values")
            )
        ));

    }
}
