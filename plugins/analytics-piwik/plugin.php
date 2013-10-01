<?php

/**
 * Datawrapper Piwik Analytics Plugin
 *
 */

class DatawrapperPlugin_AnalyticsPiwik extends DatawrapperPlugin {

    public function init() {
        DatawrapperHooks::register(DatawrapperHooks::CHART_AFTER_BODY, array($this, 'getTrackingCode'));
        DatawrapperHooks::register(DatawrapperHooks::CORE_AFTER_BODY, array($this, 'getTrackingCode'));
    }

  	public function getTrackingCode($chart = null) {
        $config = $this->getConfig();
        if (empty($config)) return false;

        $url = $config['url'];
        $idSite = $config['idSite'];

        $user = $chart->getUser();

        print '<!-- Piwik -->
<script type="text/javascript">
  var _paq = _paq || [];
  _paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
  _paq.push(["setCookieDomain", "*.www.datawrapper.de"]);
  '.(is_a($chart, 'Chart') && $user ?
 '_paq.push(["setCustomVariable", 1, "Layout", "'.$chart->getTheme().'", "page"]);
  _paq.push(["setCustomVariable", 2, "Author", "'.$user->getId().'", "page"]);
  _paq.push(["setCustomVariable", 3, "Visualization", "'.$chart->getType().'", "page"]);
  ' : '').'
  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);

  (function() {
    var u=(("https:" == document.location.protocol) ? "https" : "http") + "://' . $url . '/";
    _paq.push(["setTrackerUrl", u+"piwik.php"]);
    _paq.push(["setSiteId", "1"]);
    var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0]; g.type="text/javascript";
    g.defer=true; g.async=true; g.src=u+"piwik.js"; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Piwik Code -->';
    }

}
