<?php

DatawrapperVisualization::register($plugin, array(
    'id' => 'pie-chart',
    'title' => __('Pie chart'),
    'extends' => 'raphael-chart',
    'author' => array(
        'name' => 'gka',
        'email' => 'gka@vis4.net'
    ),
    'order' => 50,
    'dimensions' => 1,
    'axes' => array(
        'labels' => array(
            'accepts' => array('text', 'date')
        ),
        'slices' => array(
            'accepts' => array('number'),
            'multiple' => true
        )
    ),
    'color-by' => 'row',
    'options' => array(
        'base-color' => array(
            'type' => 'base-color',
            'label' => __('Base color')
        )
    ),
    'locale' => array(
        'other' => __('other'),
        'cannotShowNegativeValues' => __('Pie charts are intended to show part-of-whole relations, and thus they <b>cannot be used to display negative numbers</b>. Please consider using a different chart type instead (eg. a bar chart).'),
        'noMoreThanFiveSlices' => __('Your data contains <b>more values than can be shown in a pie chart</b>, so we grouped %count slices into the slice named <i>"others"</i>.<p>Why not use a bar chart to allow better comparison of values?</p>')
    ),
    'libraries' => array()
));


DatawrapperVisualization::register($plugin, array(
    'id' => 'donut-chart',
    'title' => __('Donut chart'),
    'version' => '1.3.0',
    'extends' => 'pie-chart',
    'author' => array(
        'name' => 'gka',
        'email' => 'gka@vis4.net'
    ),
    'order' => 60,
    'dimensions' => 1,
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
        'show-total' => array(
            'type' => 'checkbox',
            'label' => __('Show total value in center'),
            'default' => true
        ),
        'custom-total' => array(
            'type' => 'checkbox',
            'label' => __('Use custom total value instead of sum'),
            'default' => false,
            'depends-on' => array(
                'show-total' => true,
                'chart.max_row_num' => 1
            )
        ),
        'custom-total-value' => array(
            'type' => 'text',
            'label' => __('Custom total value'),
            'depends-on' => array(
                'show-total' => true,
                'custom-total' => true
            )
        )
    )
));
