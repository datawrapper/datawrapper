<?php

/* modal.twig */
class __TwigTemplate_573d635a7f9a160b907be4dd65990293 extends Twig_Template
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
        echo "<div class=\"modal-header\">
    <a class=\"close\" data-dismiss=\"modal\">×</a>
    <h1>";
        // line 3
        $this->displayBlock("title", $context, $blocks);
        echo "</h1>
</div>
<div class=\"modal-body\">
    ";
        // line 6
        $this->displayBlock("content", $context, $blocks);
        echo "
</div>
<div class=\"modal-footer\">
    <a class=\"btn\" data-dismiss=\"modal\">Close</a>
</div>";
    }

    public function getTemplateName()
    {
        return "modal.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  21 => 3,  96 => 31,  71 => 20,  67 => 19,  61 => 16,  52 => 10,  37 => 6,  30 => 4,  27 => 6,  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 26,  77 => 27,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 42,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 24,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 9,  41 => 4,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 11,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 23,  75 => 21,  66 => 16,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 30,  110 => 61,  105 => 36,  99 => 24,  86 => 40,  79 => 22,  72 => 24,  63 => 9,  53 => 18,  38 => 3,  33 => 6,  163 => 139,  47 => 8,  32 => 5,  29 => 4,  26 => 3,);
    }
}
