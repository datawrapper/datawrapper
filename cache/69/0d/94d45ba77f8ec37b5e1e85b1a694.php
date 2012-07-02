<?php

/* themes/abzv.twig */
class __TwigTemplate_690d94d45ba77f8ec37b5e1e85b1a694 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'body' => array($this, 'block_body'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "    ";
        $this->displayBlock('body', $context, $blocks);
    }

    public function block_body($context, array $blocks = array())
    {
        // line 2
        echo "
        <h1>";
        // line 3
        if (isset($context["title"])) { $_title_ = $context["title"]; } else { $_title_ = null; }
        echo twig_escape_filter($this->env, $_title_, "html", null, true);
        echo "</h1>
        <p>";
        // line 4
        if (isset($context["intro"])) { $_intro_ = $context["intro"]; } else { $_intro_ = null; }
        echo $_intro_;
        echo "</p>

        <div id=\"chart\"></div>

        <div class=\"footer\">

            <div style=\"text-align:right\"><div style=\"float:left\">Quelle: ...</div> &copy; <a href=\"http://abzv.de\">ABZV</a>, 2012</div>

        </div>

    ";
    }

    public function getTemplateName()
    {
        return "themes/abzv.twig";
    }

    public function getDebugInfo()
    {
        return array (  33 => 4,  28 => 3,  25 => 2,  18 => 1,  132 => 105,  211 => 94,  165 => 50,  149 => 48,  144 => 47,  136 => 41,  120 => 39,  115 => 38,  107 => 32,  91 => 30,  86 => 29,  77 => 22,  66 => 18,  53 => 16,  40 => 9,  35 => 8,  29 => 3,  26 => 2,  27 => 6,  21 => 3,  17 => 1,  105 => 36,  96 => 31,  89 => 26,  83 => 23,  79 => 22,  75 => 21,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  47 => 14,  41 => 4,  38 => 3,  12 => 30,);
    }
}
