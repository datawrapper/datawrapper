<?php

/*
 * cronjob for exporting charts as static images
 * and sending them via email once generated
 */

define('BASEDIR', dirname(dirname(__FILE__)));
define('LOGFILE', BASEDIR . "/logs/export-charts.log");

function execute($cmd, &$error=null) {
    ob_start();  // grab output
    passthru($cmd, $error);
    $output = ob_get_contents();
    ob_end_clean();
    return $output;
}

$flog = fopen(LOGFILE, 'a+');
if (!$flog) {
    die("could not open logfile!\n");
}

function _log($msg = "", $job=null, $type='LOG') {
    global $flog, $cfg;
    if (!VERBOSE && $type == 'DEBUG') return;
    if (!empty($msg)) {
        $prefix = date('Y-m-d H:i:s').",".$type.",";
        if ($job) {
            $prefix .= $job['job_id'].",";
        } else {
            $prefix .= ",";
        }
        fwrite($flog, $prefix . '"' . $msg . "\"\n");
        if ($type == 'ERROR') {
            $url = $job['chart_url'];
            unset($job['chart_url']);
            @mail(
                $cfg['log_email'],
                'export-charts / error / '.substr($msg, 0, 60).'...',
                'Bug found in '.$url."\n\n".$msg."\n\n".print_r($job, true),
                "From: ".$cfg['admin_email']."\r\n"
            );
            if ($job) {
                mysql_query('UPDATE job SET status = 2, done_at = NOW(), fail_reason = "'.addslashes($msg).'" WHERE id = '.$job['job_id']);
            }
        }
    }
}

// load db config
require_once BASEDIR . "/../lib/core/build/conf/datawrapper-conf.php";

// connect to database
$dbconn = $conf['datasources']['datawrapper']['connection'];
preg_match('/mysql\:host=([^;]+);dbname=(.*)/', $dbconn['dsn'], $m);
mysql_connect($m[1], $dbconn['user'], $dbconn['password']);
mysql_select_db($m[2]);

// load dw config
require_once BASEDIR . '/../vendor/spyc/spyc.php';

// set system timezone
date_default_timezone_set('Europe/Berlin');

$cfg = $GLOBALS['dw_config'] = Spyc::YAMLLoad(BASEDIR . '/../config.yaml');

define('VERBOSE', $cfg['debug']);

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


function run($job) {
    global $cfg, $messages;

    $params = json_decode($job['parameter'], true);
    $job['chart_url'] = 'http://' . $cfg['domain'] . '/chart/' . $job['chart_id'] . '/';

    if ($job['type'] == 'export') {

        $url = 'http://' . $cfg['domain'] . '/chart/' . $job['chart_id'] . '/' . ($params['format'] == 'pdf' ? '?fs=1' : '');

        $outfile = BASEDIR . '/../charts/exports/' . $job['chart_id'] . '-' . $params['ratio'] . '.' . $params['format'];

        $out = array();
        $cmd = $cfg['phantomjs']['path'] . ' export_chart.js '. $url.' '.$outfile.' '.$params['ratio'];
        //print "\n".'running '.$cmd;
        $output = execute($cmd, $error);

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
            if (!$mail_sent) _log("ERROR: could not send mail");
            else {
                mysql_query('UPDATE job SET status = 1, done_at = NOW() WHERE id = '.$job['job_id']);
                _log(mysql_error());
                _log("exported static chart", $job, 'LOG');
            }
        } else {
            _log("chart rendering failed", $job, 'ERROR');
        }

    } else if ($job['type'] == 'static') {

        _log("job is about static chart export", $job, 'DEBUG');

        $url = 'http://' . $cfg['domain'] . '/chart/%s/';
        $cmd = $cfg['phantomjs']['path'] . ' make_thumb.js '. $url.' '.$job['chart_id'].' '.$params['width'].' '.$params['height'];
        //print "\n".'running '.$cmd;

        _log("cmd: ".$cmd, $job, 'DEBUG');

        $output = execute($cmd, $error);

        _log("cmd output: ".$output, $job, 'DEBUG');

        if (!empty($output) || $error) {
            _log("static chart export failed (".trim($output).")", $job, "ERROR");

        } else {
            mysql_query('UPDATE job SET status = 1, done_at = NOW() WHERE id = '.$job['job_id']);
            $err = mysql_error();
            if (!empty($err)) {
                _log($err, $job, "ERROR");
            } else {
                // push files to CDN
                publish_file($job['chart_id'] . '/static.html', 'text/html');
                publish_file($job['chart_id'] . '/static.png', 'image/png');
                _log("created static fallback", $job, 'LOG');

            }
        }
    }
}

_log("Starting chart export service.");

$is_sleeping = false;

while (1) {  // run forever
    // get next job in line
    $res = mysql_query('SELECT job.id job_id, user.email email, chart_id, parameter, SUBSTR(language,1,2) lang, type FROM job JOIN user ON (user.id = user_id) WHERE status = 0 and type IN ("export", "static") ORDER BY job.created_at ASC LIMIT 1');
    _log(mysql_error(), "ERROR");
    $job = mysql_fetch_array($res);
    if ($job) {
        $is_sleeping = false;
        _log("yeah! found a new job", $job, 'DEBUG');
        run($job);
    } else {
        if (!$is_sleeping) {
            _log("no new jobs found, going into sleep mode", null, 'DEBUG');
            $is_sleeping = true;
        }
    }
    sleep($is_sleeping ? 10 : 2);
}
