<?php

require_once '../../lib/utils/check_chart.php';

/*
* Helper function: Can ensure that the dimentions of a chart are bounding
* to fit inside a smaller bounding-box.
* This function is inspired by `image_dimentions_scale` from Drupal 7.x
*/
function _dimention_bounding($dimentions, $bounding) {
    list($height, $width) = $dimentions;
    list($maxheight, $maxwidth) = $bounding;
    $aspect = $height / $width;
  
    // Ensure that both maxheight and maxwidth is set, and their aspect-ratio is
    // the same of that of height and width.
    if (($maxwidth && !$maxheight) || ($maxwidth && $maxheight && $aspect < $maxheight / $maxwidth)) {
        $maxheight = (int) round($maxwidth * $aspect);
    }
    else {
        $maxwidth = (int) round($maxheight / $aspect);
    }
  
    if ($maxheight < $height) {
        // Our bounding box is the smallest, so use that size
        return array($maxheight, $maxwidth);
    } else {
        // The chart is smaller than the bounding box, so use that size
        return array($height, $width);
    }
}

/*
* Error-functions for when the chart wasn't found
*/
function error_chart_not_found() { global $app; $app->response()->status(404); } 
function error_chart_deleted() { global $app; $app->response()->status(404); }
function error_chart_not_published() { global $app; $app->response()->status(404); }
function error_not_allowed_to_publish() { global $app; $app->response()->status(404); }

/*
* API: oEmbed endpoint that knows how to embed published charts.
*/
$app->get('/oembed', function() use ($app) {
    if ($app->request()->get('format') != 'json') {
        // We currently don't support anything but JSON responses, so we return
        // a 501 Not Implemented.
        return $app->response()->status(501);
    }

    // We only care abount Datawrapper/[id](/index.html)?-urls, so construct
    // a pattern that matches those urls
    $url = urldecode($app->request()->get('url'));
    $url_pattern = 'http[s]?:\/\/' . $GLOBALS['dw_config']['chart_domain'] . '\/(.+?)([\/](index\.html)?)?';
    if (preg_match('/^' . $url_pattern . '$/', $url, $matches)) {
        // The URL provided matched the URL of a published chart, so try and 
        // load that chart-id.
        $id = $matches[1];
        check_chart_public($id, function($user, $chart) use ($app) {
            // The chart exists and is public, so generate a oEmbed response
            $metadata = $chart->getMetadata();
            $url = $chart->getPublicUrl();
            $dimentions = array(
                $metadata['publish']['embed-height'],
                $metadata['publish']['embed-width'],
            );

            if ($app->request()->get('maxheight') || $app->request()->get('maxwidth')) {
                // We have a bounding, so figure out how large we should return the
                // chart
                $bounding = array(
                    (int) $app->request()->get('maxheight'),
                    (int) $app->request()->get('maxwidth'),
                );
                $dimentions = _dimention_bounding($dimentions, $bounding);
            }

            // Generate the iframe to embed the chart
            list($height, $width) = $dimentions;
            $html = '<iframe src="' . $url . '" frameborder="0" ' .
                'allowtransparency="true" ' .
                'allowfullscreen="allowfullscreen" ' .
                'webkitallowfullscreen="webkitallowfullscreen" ' .
                'mozallowfullscreen="mozallowfullscreen" ' .
                'oallowfullscreen="oallowfullscreen" ' .
                'msallowfullscreen="msallowfullscreen" ' .
                'width="' . $width . '" height="' . $height . '"></iframe>';

            // Build the oEmbed document
            $response = new stdClass();
            $response->type = 'rich';
            $response->version = 1.0;
            $response->provider_name = 'Datawrapper';
            $response->provider_url = 'http://' . $GLOBALS['dw_config']['chart_domain'];
            $response->title = $chart->getTitle();
            $response->html = $html;
            $response->width = $width;
            $response->height = $height;

            if ($user->getName()) {
                // The author has a name, so report that as well
                $response->author_name = $user->getName();
            }

            if ($chart->hasPreview()) {
                // The chart has a thumbnail, so send that along as well
                $local_path = '../../charts/static/' . $chart->getID() . '/m.png';
                list($thumb_width, $thumb_height) = getimagesize($local_path);
                $response->thumbnail_url = $chart->thumbUrl();
                $response->thumbnail_height = $thumb_height;
                $response->thumbnail_width = $thumb_width;
            }

            // Output the response as a JSON document
            $app->response()->header('Content-Type', 'application/json;charset=utf-8');
            print json_encode($response);
        });
    } else {
        // The URL given was not a chart, so we say we don't know how to embed that
        // url
        $app->response()->status(404);
    }
});
