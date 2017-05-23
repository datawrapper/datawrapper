<?php

DatawrapperVisualization::register($plugin, array(
    'id' => 'bar-chart',
    'title' =>  __('bar chart'),
    'version' => '1.3.2',
    'extends' => 'raphael-chart',
    'order' => 995,
    "less" => dirname(__FILE__ ) . "/static/bar-chart.less",
    'dimensions' => 1,
    'axes' => array(
        'labels' => array(
            'accepts' => array('text', 'date')
        ),
        'bars' => array(
            'accepts' => array('number'),
            'multiple' => true
        )
    ),
    'options' => array(
        'base-color' => array(
            'type' => 'base-color',
            'label' => __('base-color')
        ),
        'sort-values' => array(
            'type' => 'checkbox',
            'label' => __('sort-bars')
        ),
        'reverse-order' => array(
            'type' => 'checkbox',
            'label' => __('reverse-order'),
        ),
        'negative-color' => array(
            'type' => 'checkbox',
            'label' => __('negative-values'),
            'depends-on' => array(
                'chart.min_value[columns]' => '<0'
            )
        ),
        'absolute-scale' => array(
            'type' => 'checkbox',
            'label' => __('same-scale')
        ),
        'filter-missing-values' => array(
            'type' => 'checkbox',
            'default' => true,
            'label' => __('filter-missing')
        )
    ),
    'libraries' => array()
));
