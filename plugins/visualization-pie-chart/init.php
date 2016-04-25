<?php

$cfg = $GLOBALS['dw_config'];

$to_translate = array(
    "other" => "other",
    "Total:" => "Total:",
    'cannotShowNegativeValues' => 'Pie charts are intended to show part-of-whole relations, and thus they <b>cannot be used to display negative numbers</b>. Please consider using a different chart type instead (eg. a bar chart).',
    'noMoreThanFiveSlices' => 'Your data contains <b>more values than can be shown in a pie chart</b>, so we grouped %count slices into the slice named <i>"others"</i>.<p>Why not use a bar chart to allow better comparison of values?</p>'
);

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
        )
    ),
    'locale' => $translated,
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
        )
    )
));
