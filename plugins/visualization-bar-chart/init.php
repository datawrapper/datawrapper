<?php

DatawrapperVisualization::register($plugin, array(
    'id' => 'bar-chart',
    'title' =>  __('Bar Chart'),
    'version' => '1.3.2',
    'extends' => 'raphael-chart',
    'order' => 5,
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
            'label' => __('Base color')
        ),
        'sort-values' => array(
            'type' => 'checkbox',
            'label' => __('Autmatically sort bars')
        ),
        'reverse-order' => array(
            'type' => 'checkbox',
            'label' => __('Reverse order'),
        ),
        'negative-color' => array(
            'type' => 'checkbox',
            'label' => __('Use different color for negative values'),
            'depends-on' => array(
                'chart.min_value[columns]' => '<0'
            )
        ),
        'absolute-scale' => array(
            'type' => 'checkbox',
            'label' => __('Use the same scale for all columns')
        ),
        'filter-missing-values' => array(
            'type' => 'checkbox',
            'default' => true,
            'label' => __('Filter missing values')
        )
    ),
    'libraries' => array()
));
