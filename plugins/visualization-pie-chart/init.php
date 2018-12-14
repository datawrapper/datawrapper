<?php

$translated = json_decode(file_get_contents(dirname(__FILE__) . '/chart-translations.json'), 1);

DatawrapperVisualization::register($plugin, array(
    'id' => 'pie-chart',
    'title' => __('Pie Chart (old)'),
    'extends' => 'raphael-chart',
    'author' => array(
        'name' => 'gka',
        'email' => 'gka@vis4.net'
    ),
    'order' => 50,
    "less" => dirname(__FILE__ ) . "/static/pie-chart.less",
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
        ),
        'group-slice-after' => array(
            'type' => 'number',
            'label' => __('Maximum amount of slices'),
            'default' => '5',
            'depends-on' => array(
                'chart.min_row_num' => 3,
            ),
            'min' => 2,
            'max' => 100
        ),
        'outside-labels' => [
            'type' => 'checkbox',
            'label' => __('Label smaller slices outside chart'),
            'default' => true
        ]
    ),
    'locale' => $translated,
    'libraries' => array()
));


DatawrapperVisualization::register($plugin, array(
    'id' => 'donut-chart',
    'title' => __('Donut Chart (old)'),
    'version' => '1.3.1',
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
    'locale' => $translated,
    'options' => array(
    'base-color' => array(
            'type' => 'base-color',
            'label' => __('Base color')
        ),
        'show-total' => array(
            'type' => 'checkbox',
            'label' => __('Show total value in center'),
            'default' => true
        ),
        'show-percentages' => array(
            'type' => 'checkbox',
            'label' => __('Show values as percentages'),
            'default' => true,
            'depends-on' => array(
                'show-total' => true
            )
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
        ),
        'group-slice-after' => array(
            'type' => 'number',
            'label' => __('Maximum amount of slices'),
            'default' => '5',
            'depends-on' => array(
                'chart.min_row_num' => 3,
            ),
            'min' => 2,
            'max' => 100
        ),
        'outside-labels' => [
            'type' => 'checkbox',
            'label' => __('Label smaller slices outside chart'),
            'default' => true
        ]
    )
));
