<?php

class DatawrapperPlugin_VisualizationBarChart extends DatawrapperPlugin_Visualization {
    public function getMeta(){
        $id = $this->getName();
        $meta = array(
            "id" => "bar-chart",
            "title" =>  __("Bar Chart", $id),
            "version" => "1.3.2",
            "extends" => "raphael-chart",
            "order" => 30,
            "dimensions" => 1,
            "options" => array(
                "sort-values" => array(
                    "type" => "checkbox",
                    "label" => __("Autmatically sort bars", $id)
                ),
                "reverse-order" => array(
                    "type" => "checkbox",
                    "label" => __("Reverse order", $id),
                ),
                "labels-inside-bars" => array(
                    "type" => "checkbox",
                    "label" => __("Display labels inside bars", $id)
                ),
                "negative-color" => array(
                    "type" => "checkbox",
                    "label" => __("Use different color for negative values", $id)
                )
            ),
            "libraries" => array()
        );
        return $meta;
    }
    public function getDemoDataSets(){
        $datasets = array();
            $datasets[] = array(
        'id' => 'debt-per-person',
        'title' => __('Fearless Felix: How far did he fall'),
        'type' => __('Bar chart'),
        'presets' => array(
            'type' => 'column-chart',
            'metadata.describe.source-name' => 'DataRemixed',
            'metadata.describe.source-url' => 'http://dataremixed.com/2012/10/a-tribute-to-fearless-felix/',
            'metadata.data.vertical-header' => true,
            'metadata.data.transpose' => true
        ),
        'data' => "\tHeight
SpaceShipOne\t367500
Felix Baumgartner (2012)\t128100
Joe Kittinger (1960)\t108200
Weather balloons\t100000
Commercial airliners\t33000
Mt. Everest\t29029
Burj Khalifa (tallest building Dubai)\t2723
"
        );


        $datasets[] = array(
            'id' => 'new-borrowing',
            'type' => __('Bar chart'),
            'presets' => array(
                'type' => 'column-chart',
                'metadata.describe.source-name' => 'BMF, Haushaltsausschuss',
                'metadata.describe.source-url' => 'http://www.bundesfinanzministerium.de/bundeshaushalt2012/pdf/finanzplan.pdf',
                'metadata.data.transpose' => false
            ),
            'title' => __('Net borrowing of Germany'),
            'data' => '"","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"
"'.__('New debt in Bio.').'","14.3","11.5","34.1","44","17.3","34.8","19.6","14.6","10.3","1.1"
'
    );


        $datasets[] = array(
            'id' => 'german-parliament',
            'title' => __('Women in German Parliament'),
            'type' => __('Bar chart (grouped)'),
            'presets' => array(
                'type' => 'column-chart',
                'metadata.describe.source-name' => 'Bundestag',
                'metadata.describe.source-url' => 'http://www.bundestag.de/bundestag/abgeordnete17/mdb_zahlen/frauen_maenner.html',
                'metadata.data.vertical-header' => true,
                'metadata.visualize.sort-values' => true
            ),
            'data' => __('Party')."\t".__('Women')."\t".__('Men')."\t".__('Total')."
CDU/CSU\t45\t192\t237
SPD\t57\t89\t146
FDP\t24\t69\t93
LINKE\t42\t34\t76
GRÜNE\t36\t32\t68
"
        );
        return $datasets;
    }
}