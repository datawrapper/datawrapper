<?php

/*
 * cronjob for exporting charts as static images
 * and sending them via email once generated
 */

// load db config
require_once "../lib/core/build/conf/datawrapper-conf.php";

// connect to database
$dbconn = $conf['datasources']['datawrapper']['connection'];
preg_match('/mysql\:host=([^;]+);dbname=(.*)/', $dbconn['dsn'], $m);
mysql_connect($m[1], $dbconn['user'], $dbconn['password']);
mysql_select_db($m[2]);

// load dw config
require_once '../vendor/spyc/spyc.php';
$cfg = $GLOBALS['dw_config'] = Spyc::YAMLLoad('../config.yaml');

if (empty($cfg['phantomjs']) || empty($cfg['phantomjs']['path'])) {
    die("Err: phantomjs is not configured properly");
}

// load publish module (needed to push files to S3)
if (!empty($cfg['publish'])) {
    foreach ($cfg['publish']['requires'] as $lib) {
        require_once '../'.$lib;
    }
    require_once '../lib/utils/get_module.php';
    $pub = get_module('publish', '../lib/');
}

function publish_file($remote_file, $content_type='text/plain') {
    global $pub;
    $local_file = '../charts/static/' . $remote_file;
    if ($pub) {
        $pub->unpublish(array($remote_file));
        $pub->publish(array(array($local_file, $remote_file, $content_type)));
    }
}

// some messages
$messages = array(
    'subject' => array(
        'de' => 'Dein Diagramm (:id) wurde exportiert',
        'en' => 'Your chart (:id) has been exported',
        'fr' => 'Your chart (:id) has been exported',
        'es' => 'Your chart (:id) has been exported'
    ),
    'body' => array(
        'de' => "Hallo,\n\nhiermit senden wir die statische Grafik zu deinem Diagramm.\n\nMit freundlichen Grüßen,\nDas Datawrapper Team\n",
        'en' => "Hello,\n\nHereby we send you the static version of your chart.\n\nRegards,\nThe Datawrapper Team\n",
        'fr' => "Hello,\n\nHereby we send you the static version of your chart.\n\nRegards,\nThe Datawrapper Team\n",
        'es' => "Hello,\n\nHereby we send you the static version of your chart.\n\nRegards,\nThe Datawrapper Team\n"
    )
);

// get next jobs in line
$res = mysql_query('SELECT job.id job_id, user.email email, chart_id, parameter, SUBSTR(language,1,2) lang, type FROM job JOIN user ON (user.id = user_id) WHERE status = 0 and type IN ("export", "static") ORDER BY job.created_at ASC LIMIT 12');
print mysql_error();
$jobs = array();
while ($job = mysql_fetch_array($res)) {
    $jobs[] = $job;
}

date_default_timezone_set('Europe/Berlin');

foreach ($jobs as $job) {
    $params = json_decode($job['parameter'], true);

    if ($job['type'] == 'export') {

        $url = 'http://' . $cfg['domain'] . '/chart/' . $job['chart_id'] . '/' . ($params['format'] == 'pdf' ? '?fs=1' : '');

        $outfile = '../charts/exports/' . $job['chart_id'] . '-' . $params['ratio'] . '.' . $params['format'];

        $out = array();
        $cmd = $cfg['phantomjs']['path'] . ' export_chart.js '. $url.' '.$outfile.' '.$params['ratio'];
        //print "\n".'running '.$cmd;
        passthru($cmd);

        if (file_exists($outfile)) {
            $to = $job['email'];
            $from = 'export@' . $cfg['domain'];
            $subject = utf8_decode(str_replace(':id', $job['chart_id'], $messages['subject'][$job['lang']]));
            $body = utf8_decode($messages['body'][$job['lang']]);

            $format = $params['format'];
            $fn = basename($outfile);
            $random_hash = md5(date('r', time()));
            $headers = "From: $from";
            $headers .= "\r\nContent-Type: multipart/mixed; boundary=\"PHP-mixed-".$random_hash."\"";
            $attachment = chunk_split(base64_encode(file_get_contents($outfile)));

            $mbody = "\n--PHP-mixed-$random_hash";
            $mbody .= "\r\nContent-Type: multipart/alternative; boundary=\"PHP-alt-$random_hash\"";
            $mbody .= "\r\n\r\n--PHP-alt-$random_hash";
            $mbody .= "\r\nContent-Type: text/plain; charset=\"iso-8859-1\"";
            $mbody .= "\r\nContent-Transfer-Encoding: 7bit";
            $mbody .= "\r\n\r\n" . $body;
            $mbody .= "\r\n\r\n--PHP-alt-$random_hash";
            $mbody .= "\r\n\r\n--PHP-mixed-$random_hash";
            $mbody .= "\r\nContent-Type: image/$format; name=\"$fn\"";
            $mbody .= "\r\nContent-Transfer-Encoding: base64";
            $mbody .= "\r\nContent-Disposition: attachment";
            $mbody .= "\r\n\r\n" . $attachment;
            $mbody .= "\r\n--PHP-mixed-$random_hash\r\n";

            $mail_sent = @mail($to, $subject, $mbody, $headers);
            if (!$mail_sent) print "Err: could not send mail";
            else {
                mysql_query('UPDATE job SET status = 1, done_at = NOW() WHERE id = '.$job['job_id']);
                print mysql_error();
                sleep(1);
            }
        } else {
            print "Err: chart rendering failed\n";
        }
    } else if ($job['type'] == 'static') {

        $url = 'http://' . $cfg['domain'] . '/chart/%s/';
        $cmd = $cfg['phantomjs']['path'] . ' make_thumb.js '. $url.' '.$job['chart_id'].' '.$params['width'].' '.$params['height'];
        //print "\n".'running '.$cmd;
        passthru($cmd);

        mysql_query('UPDATE job SET status = 1, done_at = NOW() WHERE id = '.$job['job_id']);
        print mysql_error();

        // push files to CDN
        publish_file($job['chart_id'] . '/static.html', 'text/html');
        publish_file($job['chart_id'] . '/static.png', 'image/png');
    }

}