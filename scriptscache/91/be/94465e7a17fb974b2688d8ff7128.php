<?php

/* themes/default-two-col.twig */
class __TwigTemplate_91be94465e7a17fb974b2688d8ff7128 extends Twig_Template
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
        echo "
<div class=\"sidecol\">
    <h1>";
        // line 3
        if (isset($context["title"])) { $_title_ = $context["title"]; } else { $_title_ = null; }
        echo twig_escape_filter($this->env, $_title_, "html", null, true);
        echo "</h1>

    ";
        // line 5
        if (isset($context["intro"])) { $_intro_ = $context["intro"]; } else { $_intro_ = null; }
        if ($_intro_) {
            // line 6
            echo "
    <p>";
            // line 7
            if (isset($context["intro"])) { $_intro_ = $context["intro"]; } else { $_intro_ = null; }
            echo $_intro_;
            echo "</p>

    ";
        }
        // line 10
        echo "</div>

<div id=\"chart\"></div>

";
    }

    public function getTemplateName()
    {
        return "themes/default-two-col.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  132 => 105,  211 => 94,  165 => 50,  149 => 48,  136 => 41,  107 => 32,  91 => 30,  40 => 10,  35 => 8,  21 => 3,  96 => 31,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  37 => 6,  30 => 6,  27 => 5,  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 2,  125 => 49,  118 => 47,  113 => 46,  89 => 26,  77 => 22,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 39,  115 => 38,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 24,  62 => 22,  28 => 3,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 9,  41 => 4,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 47,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 11,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 23,  75 => 21,  66 => 18,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 30,  110 => 61,  105 => 36,  99 => 24,  86 => 29,  79 => 22,  72 => 24,  63 => 9,  53 => 16,  38 => 3,  33 => 7,  163 => 139,  47 => 14,  32 => 5,  29 => 3,  26 => 2,);
    }
}
