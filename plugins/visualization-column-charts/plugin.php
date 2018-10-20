<?php

class DatawrapperPlugin_VisualizationColumnCharts extends DatawrapperPlugin_Visualization{

    public function init() {
        DatawrapperVisualization::register($this, $this->getMeta_Simple());
        DatawrapperVisualization::register($this, $this->getMeta_Grouped());
        DatawrapperVisualization::register($this, $this->getMeta_Stacked());
    }

    public function getMeta_Simple(){
        $id = $this->getName();

        $meta = array(
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
                "g-x-axis" => [
                    "type" => "group",
                    "label" => "X-Axis",
                    "options" => [
                        "rotate-labels" => array(                            
                            "label" => __("Rotate labels"),                            
                            "type" => "radio",                            
                            "options" => [
                                "auto" => __("Auto"),
                                "on" => __("Always"),
                                "off" => __("Never")
                            ],
                            "default" => 'auto'
                        )
                    ]
                ],
                "g-y-axis" => [
                    "type" => "group",
                    "label" => "Y-Axis",
                    "options" => [
                        "absolute-scale" => array(
                            "type" => "checkbox",
                            "label" => __("Use the same scale for all columns"),
                            "depends-on" => array(
                                "chart.min_columns[columns]" => 2
                            )
                        ),
                        'custom-range' => [
                            'type' => 'custom-range',
                            'label' => __('extend range'),
                            'help' => __('help / extend range'),
                        ],
                        "custom-ticks" => array(
                            "type" => "text",
                            "label" => __("Custom ticks"),
                            "depends-on" => array(
                                
                            )
                        ),
                        "grid-lines" => array(
                            "type" => "radio",
                            "label" => __("Grid lines"),
                            "options" => array(
                                array("value" => "show", "label" => __("Show")),
                                array("value" => "hide", "label" => __("Hide")),
                                array("value" => "auto", "label" => __("Automatic")),
                            ),
                            "default" => 'auto'
                        ),
                        "grid-label-position" => array(
                            "type" => "radio",
                            "label" => __("Grid position"),
                            "options" => array(
                                "left" => "left",
                                "right" => "right"
                            ),
                            "default" => "left",
                            "depends-on" => array(
                                "grid-lines" => "show"
                            )
                        ),
                        "grid-labels" => array(
                            "type" => "radio",
                            "label" => __("Label position"),
                            "options" => array(
                                array("value" => "outside", "label" => __("Outside")),
                                array("value" => "inside", "label" => __("Inside")),
                            ),
                            "default" => "inside",
                            "depends-on" => array(
                                "grid-lines" => "show"
                            )
                        )
                    ]
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
        );
        return $meta;
    }

    public function getMeta_Grouped(){
        $id = $this->getName();

        $meta = array(
            "id" => "grouped-column-chart",
            "title" => __("Grouped Column Chart"),
            "version" => $this->getVersion(),
            "dimensions" => 2,
            "extends" => "raphael-chart",
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
                "base-color" => array(
                    "type" => "base-color",
                    "label" => __("Base color")
                ),
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => __("Automatically sort bars")
                ),
                "reverse-order" => array(
                    "type" => "checkbox",
                    "label" => __("Reverse order")
                ),
                "value-labels" => array(
                    "type" => "radio-left",
                    "label" => __("Value labels"),
                    "options" => array(
                        array("value" => "auto", "label" => __("On hover")),
                        array("value" => "show", "label" => __("Show")),
                        array("value" => "hide", "label" => __("Hide"))
                    ),
                    "default" => 'auto'
                ),
            ),
            "libraries" => array()
        );
        return $meta;
    }

    public function getMeta_Stacked(){
        $id = $this->getName();

        $meta = array(
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
                "base-color" => array(
                    "type" => "base-color",
                    "label" => __("Base color")
                ),
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
                "labels" => [
                    "type" => "group",
                    "label" => __('Labels'),
                    "options" => [
                        "grid-lines" => [
                            "type" => "checkbox",
                            "label" => __("Show grid lines"),
                            "default" => false
                        ],
                        "value-labels" => array(
                            "type" => "radio-left",
                            "label" => __("Value labels"),
                            "options" => array(
                                array("value" => "auto", "label" => __("On hover")),
                                array("value" => "show", "label" => __("Show")),
                                array("value" => "hide", "label" => __("Hide"))
                            ),
                            "default" => 'auto'
                        ),
                    ],
                ],

                'connect-bars' => [
                    'type' => 'checkbox',
                    'label' => __('stacked / connect-bars'),
                    'default' => false,
                ],
                
                'group-layout' => [
                    'type' => 'group',
                    'label' => __('Layout (desktop)'),
                    'options' => [
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
                        'padding' => [
                            'type' => 'slider',
                            'label' => __('Inner margin (%)'),
                            'default' => 35,
                            'min' => 0,
                            'max' => 150,
                            'step' => 1
                        ],
                        'margin' => [
                            'type' => 'slider',
                            'label' => __('Outer margin (%)'),
                            'default' => 10,
                            'min' => 0,
                            'max' => 30,
                            'step' => 1
                        ],
                    ]
                ],
                'group-layout-mobile' => [
                    'type' => 'group',
                    'label' => __('Layout (mobile)'),
                    'options' => [
                        'same-as-desktop' => [
                            'type' => 'checkbox',
                            'default' => true,
                            'label' => __('same as destkop')
                        ],
                        'direct-labeling-mobile' => [
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
                            ],
                            'depends-on' => [ 'same-as-desktop' => false ]
                        ],
                        'label-space-mobile' => [
                            'type' => 'slider',
                            'depends-on' => [
                                'direct-labeling-mobile' => 'always',
                                'same-as-desktop' => false
                            ],
                            'label' => __('Direct label space (%)'),
                            'default' => 30,
                            'min' => 10,
                            'max' => 50,
                            'step' => 1
                        ],
                        'padding-mobile' => [
                            'type' => 'slider',
                            'label' => __('Inner margin (%)'),
                            'default' => 35,
                            'min' => 0,
                            'max' => 150,
                            'step' => 1,
                            'depends-on' => [ 'same-as-desktop' => false ]
                        ],
                        'margin-mobile' => [
                            'type' => 'slider',
                            'label' => __('Outer margin (%)'),
                            'default' => 10,
                            'min' => 0,
                            'max' => 30,
                            'step' => 1,
                            'depends-on' => [ 'same-as-desktop' => false ]
                        ]
                    ]
                ]
                
            ],
            "locale" => array(
                "stack percentages" => __("stack percentages"),
                "cannotShowNegativeValues" => __("negative-values")
            )
        );
        return $meta;
    }
}
