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
        return array (  30 => 6,  33 => 7,  28 => 3,  25 => 2,  18 => 1,  132 => 105,  211 => 94,  165 => 50,  149 => 48,  144 => 47,  136 => 41,  120 => 39,  115 => 38,  107 => 32,  91 => 30,  86 => 29,  77 => 22,  66 => 18,  53 => 16,  40 => 10,  35 => 8,  29 => 3,  26 => 2,  27 => 5,  21 => 3,  17 => 1,  105 => 36,  96 => 31,  89 => 26,  83 => 23,  79 => 22,  75 => 21,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  47 => 14,  41 => 4,  38 => 3,  12 => 30,);
    }
}
