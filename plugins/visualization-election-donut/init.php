<?php

DatawrapperVisualization::register($plugin, array(
    'id' => 'election-donut-chart',
    'title' => __('Election Donut'),
    'extends' => 'donut-chart',
    'dimensions' => 1,
    'order' => 60,
    'axes' => array(
        'labels' => array(
            'accepts' => array('text', 'date')
        ),
        'slices' => array(
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
            'label' => __('Sort by size'),
            'default' => true
        )
    )
));
