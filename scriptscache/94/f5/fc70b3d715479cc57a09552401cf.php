<?php

/* chart.twig */
class __TwigTemplate_94f5fc70b3d715479cc57a09552401cf extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<!DOCTYPE html>
<html>
<head>
    <title>";
        // line 4
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "title"), "html", null, true);
        echo "</title>
    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">
    <style type=\"text/css\">
body {
    padding: 0;
}
    </style>
    <!--[if lt IE 9]>
    <script src=\"/static/vendor/json-js/json2.min.js\"></script>
    <script type=\"text/javascript\">
    </script>
    <![endif]-->

";
        // line 17
        if (isset($context["stylesheets"])) { $_stylesheets_ = $context["stylesheets"]; } else { $_stylesheets_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_stylesheets_);
        foreach ($context['_seq'] as $context["_key"] => $context["src"]) {
            // line 18
            echo "    <link rel=\"stylesheet\" type=\"text/css\" href=\"";
            if (isset($context["src"])) { $_src_ = $context["src"]; } else { $_src_ = null; }
            echo twig_escape_filter($this->env, $_src_, "html", null, true);
            echo "\"></link>
";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['src'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 20
        echo "
";
        // line 21
        if (isset($context["scripts"])) { $_scripts_ = $context["scripts"]; } else { $_scripts_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_scripts_);
        foreach ($context['_seq'] as $context["_key"] => $context["src"]) {
            // line 22
            echo "    <script type=\"text/javascript\" src=\"";
            if (isset($context["src"])) { $_src_ = $context["src"]; } else { $_src_ = null; }
            echo twig_escape_filter($this->env, $_src_, "html", null, true);
            echo "\"></script>
";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['src'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 24
        echo "    <script type=\"text/javascript\">
    \$(function() {
        // initialize theme
        var theme = Datawrapper.Themes.";
        // line 27
        if (isset($context["theme"])) { $_theme_ = $context["theme"]; } else { $_theme_ = null; }
        echo twig_escape_filter($this->env, str_classify($this->getAttribute($_theme_, "id")), "html", null, true);
        echo ";
        // initialize chart
        var chart = new Datawrapper.Chart(JSON.parse('";
        // line 29
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        echo $this->getAttribute($_chart_, "toJSON");
        echo "'));
        // initliaze visualization
        var vis = new Datawrapper.Visualizations.";
        // line 31
        if (isset($context["visualization"])) { $_visualization_ = $context["visualization"]; } else { $_visualization_ = null; }
        echo twig_escape_filter($this->env, str_classify($this->getAttribute($_visualization_, "id")), "html", null, true);
        echo "();

        vis.setTheme(theme);

        vis.load(chart, function() {
            vis.render('#chart');
        });
    });
    </script>
</head>
<body>

    ";
        // line 44
        echo "    ";
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        $context["title"] = $this->getAttribute($_chart_, "title");
        // line 45
        echo "    ";
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        $context["intro"] = $this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "describe"), "intro");
        // line 46
        echo "    ";
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if (isset($context["name"])) { $_name_ = $context["name"]; } else { $_name_ = null; }
        $context["source"] = ($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "describe"), "source") - $_name_);
        // line 47
        echo "
    ";
        // line 48
        if (isset($context["theme"])) { $_theme_ = $context["theme"]; } else { $_theme_ = null; }
        $template = $this->env->resolveTemplate((($this->getAttribute($_theme_, "hasTemplate")) ? ((("themes/" . $this->getAttribute($_theme_, "id")) . ".twig")) : ("themes/default.twig")));
        $template->display($context);
        // line 49
        echo "
</body>
</html>";
    }

    public function getTemplateName()
    {
        return "chart.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  125 => 49,  118 => 47,  113 => 46,  89 => 31,  77 => 27,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 28,  106 => 26,  103 => 25,  97 => 21,  84 => 19,  65 => 15,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 18,  41 => 3,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 45,  74 => 17,  59 => 24,  50 => 19,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 29,  75 => 17,  66 => 16,  58 => 15,  48 => 10,  42 => 8,  34 => 6,  24 => 2,  18 => 1,  101 => 56,  95 => 53,  45 => 9,  39 => 17,  19 => 55,  12 => 179,  110 => 61,  105 => 44,  99 => 24,  86 => 40,  79 => 18,  72 => 24,  63 => 9,  53 => 20,  38 => 2,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
