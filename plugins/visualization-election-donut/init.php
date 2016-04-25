<?php

$cfg = $GLOBALS['dw_config'];

$to_translate = array(
    "other" => "other",
    "Total:" => "Total:",
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
    'locale' => $translated,
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
