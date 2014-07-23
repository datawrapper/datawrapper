<?php

class DatawrapperPlugin_Oembed extends DatawrapperPlugin {
    // oembed of urls
    const HOOK_GET_OEMBED = 'get_oembed';

    public function init() {
        $plugin = $this;

        // Register the API endpoint
        DatawrapperHooks::register(
            DatawrapperHooks::PROVIDE_API,
            function() use ($plugin) {
                return array(
                    'url' => 'oembed',
                    'method' => 'GET',
                    'action' => function() use ($plugin) {
                        global $app;
                        return $plugin->oEmbedEndpoint($app);
                    }
                );
            }
        );

        // Register the oEmbed-link handler for the chart-head
        DatawrapperHooks::register(
            DatawrapperHooks::CHART_HTML_HEAD,
            function($chart) use ($plugin) {
                $plugin->oembedLink($chart);
            }
        );

        // Register the oEmbed handler for the standard chart-path
        DatawrapperHooks::register(
            DatawrapperPlugin_Oembed::HOOK_GET_OEMBED,
            function($app, $url) use ($plugin) {
                return $plugin->oembedUrl($app, $url);
            }
        );
    }

    /*
     * Handle requests to /api/oembed
     */
    protected function oEmbedEndpoint($app) {
        // Get the URL from the query-parameters
        $url = urldecode($app->request()->get('url'));

        // Call the GET_OEMBED-hook
        $results = DatawrapperHooks::execute(
            DatawrapperPlugin_Oembed::HOOK_GET_OEMBED,
            $app,
            $url
        );

        // See if any of the hooks returned something
        $success = (bool) array_filter($results);
        if (!$success) {
            // No hook returned something, so return a 404!
            $app->response()->status(404);
        }
    }

    /*
     * HOOK_GET_OEMBED-callback. Responsible for handling charts located
     * on the chart-domain
     */
    protected function oembedUrl($app, $url) {
        require_once dirname(__FILE__) . '/chart_oembed.php';

        $url_pattern = 'http[s]?:\/\/' . $GLOBALS['dw_config']['chart_domain'] . '\/(.+?)([\/](index\.html)?)?';
        if (preg_match('/^' . $url_pattern . '$/', $url, $matches)) {
            // The URL provided matched the URL of a published chart, so embed
            // the chart with the found id.
            chart_oembed($app, $matches[1], $app->request()->get('format'));
            return true;
        }
    }

    protected function oembedLink($chart) {
        $content = get_chart_content($chart, $chart->getUser(), false, '../');

        $title = strip_tags(str_replace('<br />', ' - ', $chart->getTitle()));          $url = urlencode($content['chartUrl']);

        echo '<link rel="alternate" type="application/json+oembed" href="' . $content['DW_DOMAIN'] . 'api/plugin/oembed?url=' . $url . '&format=json" title="' . $title . '" />' . "\n";
    }
}
