<?php

/* core.twig */
class __TwigTemplate_326e34b6d01290c2812dfea30b310377 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $_trait_0 = $this->env->loadTemplate("login.twig");
        // line 52
        if (!$_trait_0->isTraitable()) {
            throw new Twig_Error_Runtime('Template "'."login.twig".'" cannot be used as a trait.');
        }
        $_trait_0_blocks = $_trait_0->getBlocks();

        $_trait_1 = $this->env->loadTemplate("header.twig");
        // line 55
        if (!$_trait_1->isTraitable()) {
            throw new Twig_Error_Runtime('Template "'."header.twig".'" cannot be used as a trait.');
        }
        $_trait_1_blocks = $_trait_1->getBlocks();

        $this->traits = array_merge(
            $_trait_0_blocks,
            $_trait_1_blocks
        );

        $this->blocks = array_merge(
            $this->traits,
            array(
            )
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\">
    <title>Datawrapper ";
        // line 5
        $this->displayBlock("title", $context, $blocks);
        echo "</title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <meta name=\"description\" content=\"Datawrapper is an open source tool helping everyone to create simple, correct and embeddable charts in minutes.\">
    <meta name=\"author\" content=\"Mirko Lorenz, Nicolas Kayser-Bril, Gregor Aisch\">
    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=8\" />

    <!-- Le styles -->
    <link href=\"/static/vendor/bootstrap/css/bootstrap.css\" rel=\"stylesheet\">
    <link href=\"/static/vendor/bootstrap/css/bootstrap-datawrapper.css\" rel=\"stylesheet\">
    <!-- <link href=\"/static/vendor/fontawesome/css/font-awesome.css\" rel=\"stylesheet\"> -->
    <style>
      body {
        padding-top: 30px; /* 60px to make the container go all the way to the bottom of the topbar */
      }
    </style>
    <link href=\"/static/vendor/bootstrap/css/bootstrap-responsive.css\" rel=\"stylesheet\">
    <link href=\"/static/css/datawrapper.css\" rel=\"stylesheet\">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src=\"http://html5shim.googlecode.com/svn/trunk/html5.js\"></script>
      <script src=\"/static/vendor/json-js/json2.min.js\"></script>
    <![endif]-->

    <script type=\"text/javascript\" src=\"/static/vendor/jquery/jquery.min.js\"></script>
    <script type=\"text/javascript\" src=\"/static/vendor/miso/miso.ds.deps.0.1.3.js\"></script>
    <script type=\"text/javascript\" src=\"/static/vendor/cryptojs/hmac-sha256.js\"></script>
    <script type=\"text/javascript\" src=\"/static/js/dw.core.js\"></script>
    <script type=\"text/javascript\" src=\"/static/js/dw.ui.js\"></script>
    <script type=\"text/javascript\" src=\"/static/js/dw.chart.js\"></script>
    <script type=\"text/javascript\" src=\"/static/js/dw.chart.editable.js\"></script>
    <script type=\"text/javascript\" src=\"/static/js/dw.theme.js\"></script>
    <script type=\"text/javascript\" src=\"/static/js/ds.parser.delimited.js\"></script>

  </head>

  <body class=\"dw\">

    <div class=\"container\">

      <header class=\"header\">
        <div class=\"row topnav\">
            <div class=\"span3\">
              <div class=\"dw-logo-type dw-logo\"><i class=\"wrap\">[&nbsp;</i><a href=\"/\">Datawrapper</a><i class=\"wrap\">&nbsp;]</i></div>
              <div class=\"dw-logo-sub\">Open Source Data Visualization</div>
            </div>

            ";
        // line 53
        echo "            ";
        $this->displayBlock("login", $context, $blocks);
        echo "

            ";
        // line 56
        echo "            ";
        $this->displayBlock("header", $context, $blocks);
        echo "
        </div>

      </header>

      ";
        // line 61
        $this->displayBlock("content", $context, $blocks);
        echo "

      <footer class=\"footer\">

        <p class=\"pull-right\"><a href=\"#top\">Back to top</a></p>

        <p>Datawrapper is open source and hosted on <a href=\"#\">Github</a>. You can <a href=\"/docs/about\">learn more about Datawrapper</a>, <a href=\"/credits\">who created it</a> and the <a href=\"#\">motivation</a> behind it. If you're completely lost, here is a <a href=\"/docs/quickstart\">quick start guide</a> and the complete <a href=\"/docs\">manual</a>. Also we kindly ask you to check out the <a href=\"/terms\">terms of use</a>.</p>

      </footer>

    </div>

    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->

    <script type=\"text/javascript\" src=\"/static/vendor/bootstrap/js/bootstrap.min.js\"></script>
    <script type=\"text/javascript\" src=\"/static/vendor/bootstrap/js/bootstrap-modal.js\"></script>
    <script type=\"text/javascript\" src=\"/static/vendor/bootstrap/js/bootstrap-modal-xhr.js\"></script>
    <script type=\"text/javascript\" src=\"/static/vendor/bootstrap/js/bootstrap-transition.js\"></script>
    <script type=\"text/javascript\" src=\"/static/vendor/bootstrap/js/bootstrap-collapse.js\"></script>
    <script type=\"text/javascript\">

\$(function() {
  Datawrapper.Core.initialize();
});
    </script>
  </body>
</html>";
    }

    public function getTemplateName()
    {
        return "core.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  101 => 56,  95 => 53,  45 => 5,  39 => 1,  19 => 55,  12 => 52,  110 => 61,  105 => 26,  99 => 24,  86 => 13,  79 => 11,  72 => 10,  63 => 9,  53 => 8,  38 => 7,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
