<?php

// load interface
require_once "interface.php";


/**
 * Datawrapper Piwik Analytics Module
 *
 */

class Datawrapper_Analytics_Piwik implements IDatawrapper_Analytics {

    function getTrackingCode($chart = null) {
        if ($GLOBALS['dw_config']['analytics']) {
            $cfg = $GLOBALS['dw_config']['analytics']['config'];
            $url = $cfg['url'];
            $idSite = $cfg['idSite'];

            return '<!-- Piwik --> <script type="text/javascript">
var _paq = _paq || [];
(function(){ var u=(("https:" == document.location.protocol) ? "https://' . $url . '/" : "http://' . $url . '/");
_paq.push(["setSiteId", ' . $idSite . ']);
_paq.push(["setTrackerUrl", u+"piwik.php"]);
_paq.push(["trackPageView"]);
_paq.push(["enableLinkTracking"]);
var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0]; g.type="text/javascript"; g.defer=true; g.async=true; g.src=u+"piwik.js";
s.parentNode.insertBefore(g,s); })();
 </script>
<!-- End Piwik Code -->';
        }
        return '';
    }

}