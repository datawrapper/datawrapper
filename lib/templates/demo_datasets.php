<?php


function getDemoDatasets() {
    $datasets = array();


    $datasets[] = array(
        'id' => 'debt-per-person',
        'title' => _('Fearless Felix: How far did he fall'),
        'type' => _('Bar chart'),
        'presets' => array(
            'type' => 'column-chart',
            'metadata.describe.source-name' => 'DataRemixed',
            'metadata.describe.source-url' => 'http://dataremixed.com/2012/10/a-tribute-to-fearless-felix/',
            'metadata.data.vertical-header' => true,
            'metadata.data.transpose' => true
        ),
        'data' => "	Height
SpaceShipOne	367500
Felix Baumgartner (2012)	128100
Joe Kittinger (1960)	108200
Weather balloons	100000
Commercial airliners	33000
Mt. Everest	29029
Burj Khalifa (tallest building Dubai)	2723
"
    );


    $datasets[] = array(
        'id' => 'marriages',
    	'title' => _('Marriages in Germany'),
        'chartid' => '',
        'type' => _('Line chart'),
        'presets' => array(
            'type' => 'line-chart',
            'metadata.describe.source-name' => 'Statistisches Bundesamt',
            'metadata.describe.source-url' => 'http://destatis.de',
            'metadata.data.vertical-header' => true,
            'metadata.data.transpose' => false
        ),
    	'data' => _('Year').'	'._('Marriages')."\n1946\t8.1\n1947\t9.8\n1948\t10.5\n1949\t10.2\n1950\t11.0\n1951\t10.4\n1952\t9.5\n1953\t8.9\n1954\t8.7\n1955\t8.8\n1956\t8.9\n1957\t8.9\n1958\t9.1\n1959\t9.2\n1960\t9.5\n1961\t9.5\n1962\t9.4\n1963\t8.8\n1964\t8.5\n1965\t8.2\n1966\t8.0\n1967\t7.9\n1968\t7.3\n1969\t7.4\n1970\t7.4\n1971\t7.2\n1972\t7.0\n1973\t6.7\n1974\t6.5\n1975\t6.7\n1976\t6.5\n1977\t6.5\n1978\t6.0\n1979\t6.2\n1980\t6.3\n1981\t6.2\n1982\t6.2\n1983\t6.3\n1984\t6.4\n1985\t6.4\n1986\t6.6\n1987\t6.7\n1988\t6.8\n1989\t6.7\n1990\t6.5\n1991\t5.7\n1992\t5.6\n1993\t5.5\n1994\t5.4\n1995\t5.3\n1996\t5.2\n1997\t5.2\n1998\t5.1\n1999\t5.2\n2000\t5.1\n2001\t4.7\n2002\t4.8\n2003\t4.6\n2004\t4.8\n2005\t4.7\n2006\t4.5\n2007\t4.5\n2008\t4.6\n2009\t4.6\n2010\t4.7\n2011\t4.6
"
    );

    $datasets[] = array(
        'id' => 'new-borrowing',
        'type' => _('Bar chart'),
        'presets' => array(
            'type' => 'column-chart',
            'metadata.describe.source-name' => 'BMF, Haushaltsausschuss',
            'metadata.describe.source-url' => 'http://www.bundesfinanzministerium.de/bundeshaushalt2012/pdf/finanzplan.pdf',
            'metadata.data.transpose' => false
        ),
        'title' => _('Net borrowing of Germany'),
        'data' => '"","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"
"'._('New debt in Bio.').'","14.3","11.5","34.1","44","17.3","34.8","19.6","14.6","10.3","1.1"
'
    );


    $datasets[] = array(
        'id' => 'women-parliament',
        'title' => _('Women in German Parliament'),
        'type' => _('Bar chart (grouped)'),
        'presets' => array(
            'type' => 'column-chart',
            'metadata.describe.source-name' => 'Bundestag',
            'metadata.describe.source-url' => 'http://www.bundestag.de/bundestag/abgeordnete17/mdb_zahlen/frauen_maenner.html',
            'metadata.data.vertical-header' => true,
            'metadata.visualize.sort-values' => true
        ),
        'data' => _('Party')."\t"._('Women')."\t"._('Men').'
CDU/CSU	45	192
SPD	57	89
FDP	24	69
Die Linke	42	34
Bündnis 90/Die Grünen	36	32
'
    );


    $datasets[] = array(
        'id' => 'bundestag-sitze',
        'title' => _('Seats in German Parliament'),
        'type' => _('Donut chart'),
        'presets' => array(
            'type' => 'donut-chart',
            'metadata.describe.source-name' => 'Bundestag',
            'metadata.describe.source-url' => 'http://www.bundestag.de/bundestag/abgeordnete17/mdb_zahlen/',
            'metadata.data.vertical-header' => true,
            'metadata.visualize.sort-values' => true
        ),
        'data' => "Fraktion	Abgeordnete
CDU/CSU	237
SPD	146
FDP	93
DIE LINKE.	76
BÜNDNIS 90/DIE GRÜNEN	68"
    );


    return $datasets;
}
