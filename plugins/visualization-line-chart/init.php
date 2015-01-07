<?php

DatawrapperVisualization::register($plugin, array(
    'title' => __('Line Chart'),
    'id' => 'line-chart',
    'extends' => 'raphael-chart',
    'dimensions' => 2,
    'order' => 40,
    'axes' => array(
        'x' => array(
            'accepts' => array('text', 'date'),
        ),
        'y1' => array(
            'accepts' => array('number'),
            'multiple' => true
        ),
        'y2' => array(
            'accepts' => array('number'),
            'multiple' => true,
            'optional' => true
        )
    ),
    'options' => array(
        'base-color' => array(
            'type' => 'base-color',
            'label' => __('Base color')
        ),
        'sep-labeling' => array(
            'type' => 'separator',
            'label' => __('Customize labeling'),
            'depends-on' => array(
                'chart.min_columns[y1]' => 2,
            )
        ),
        'direct-labeling' => array(
            'type' => 'checkbox',
            'label' => __('Direct labeling'),
            'default' => false,
            'depends-on' => array(
                'chart.min_columns[y1]' => 2,
                'chart.max_columns[y2]' => 0  // direct labeling not possible with second axis
            ),
            'help' => __('Show the labels right nearby the line ends instead of a separate legend')
        ),
        'legend-position' => array(
            'type' => 'radio-left',
            'label' => __('Legend position'),
            'default' => 'right',
            'depends-on' => array(
                'direct-labeling' => false,
                'chart.min_columns[y1]' => 2
            ),
            'options' => array(
                array(
                    'value' => 'right',
                    'label' => __('right')
                ),
                array(
                    'value' => 'top',
                    'label' => __('top'),
                ),
                array(
                    'value' => 'inside',
                    'label' => __('inside left'),
                ),
                array(
                    'value' => 'inside-right',
                    'label' => __('inside right'),
                )
            )
        ),

        'sep-lines' => array(
            'type' => 'separator',
            'label' => __('Customize lines')
        ),
        'show-grid' => array(
            'type' => 'checkbox',
            'hidden' => true,
            'label' => __('Show grid'),
            'default' => false
        ),
        'connect-missing-values' => array(
            'type' => 'checkbox',
            'label' => __('Connect lines between missing values'),
        ),
        'fill-between' => array(
            'type' => 'checkbox',
            'label' => __('Fill area between lines'),
            'default' => false,
            'depends-on' => array(
                'chart.min_columns[y1]' => 2,
                'chart.max_columns[y1]' => 2,
                'chart.max_columns[y2]' => 0  // direct labeling not possible with second axis
            )
        ),
        'fill-below' => array(
            'type' => 'checkbox',
            'label' => __('Fill area below line'),
            'defaut' => false,
            'depends-on' => array(
                'chart.min_columns[y1]' => 1,
                'chart.max_columns[y1]' => 1,
                'chart.max_columns[y2]' => 0
            )
        ),
        'banking' => array(
            'type' => 'linechart-banking',
            'label' => __('Suggest aspect ratio that banks average line slopes to 45°'),
            'help' => __('Adjust the chart height so that the lines are banked to 45° (on average). Can help to avoid exaggerating and understating of slopes.')
        ),
        'line-mode' => array(
            'type' => 'radio-left',
            'label' => __('Line interpolation'),
            'options' => array(
                array('label' => __('Straight'), 'value' => 'straight'),
                array('label' => __('Curved'), 'value' => 'curved'),
                array('label' => __('Stepped'), 'value' => 'stepped')
            ),
            'default' => 'straight'
        ),
        'sep-y-axis' => array(
            'type' => 'separator',
            'label' => __('Customize y-axis')
        ),
        'custom-range-y' => array(
            'type' => 'custom-range',
            'label' => __('Custom range'),
            'help' => __('This feature allows you to explicitely extend the y axis to custom values. Swap min/max to invert the axis.')
        ),
        'scale-y1' => array(
            'type' => 'radio-left',
            'label' => __('Scale (y-axis)'),
            'options' => array(
                array('label' => __('linear'), 'value' => 'linear'),
                array('label' => __('logarithmic'), 'value' => 'log')
            ),
            'default' => 'linear',
            'depends-on' => array(
                'chart.min_value[y1]' => '>0',
                'chart.magnitude_range[y1]' => '>3'
            )
        ),
        'user-change-scale' => array(
            'type' => 'checkbox',
            'label' => __('Let user change scale'),
            'default' => false,
            // same dependencies as scale b/c otherwise there is nothing to change
            'depends-on' => array(
                'chart.min_value[y1]' => '>0',
                'chart.magnitude_range[y1]' => '>3'
            )
        ),
        'annotate-time-axis' => array(
            'type' => 'textarea',
            'label' => __('Annotate x axis').':',
            'placeholder' => 'from,to,text',
            'width' => '180px'
        )
    ),
    'locale' => array(
        'tooManyLinesToLabel' => __('Your chart contains <b>more lines than we can label</b>, so automatic labeling is turned off. To fix this <ul><li>filter some columns in the data table in the previous step, or</li><li>use direct labeling and the highlight feature to label the lines that are important to your story.</li></ul>'),
        'useLogarithmicScale' => __('Use logarithmic scale'),
        'couldNotParseAllDates' => str_replace('%s', 'http://blog.datawrapper.de/2013/cleaning-your-data-in-datawrapper/', __('Some of the <b>dates in your x-axis could not be parsed</b>, hence the line chart cannot display a proper date axis. To fix this<ul><li>return to the previous step and clean your date column.</li><li><a href="%s">Read more about how to do this.</a></li></ul>'))
    )
));

global $app;

DatawrapperHooks::register(
    DatawrapperHooks::VIS_OPTION_CONTROLS,
    function($o, $k) use ($app, $plugin) {
        $env = array('option' => $o, 'key' => $k);
        $app->render('plugins/' . $plugin->getName() . '/banking.twig', $env);
    }
);

$plugin->declareAssets(array('banking.js'), "|/chart/[^/]+/visualize|");
