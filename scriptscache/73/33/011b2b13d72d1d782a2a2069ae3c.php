<?php

/* terms.twig */
class __TwigTemplate_7333011b2b13d72d1d782a2a2069ae3c extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = $this->env->loadTemplate("docs.twig");

        $this->blocks = array(
            'docscontent' => array($this, 'block_docscontent'),
        );
    }

    protected function doGetParent(array $context)
    {
        return "docs.twig";
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $this->parent->display($context, array_merge($this->blocks, $blocks));
    }

    // line 2
    public function block_docscontent($context, array $blocks = array())
    {
        // line 3
        echo "

<h2>Fair usage policy</h2>

<p>Datawrapper is licensed to visualize data that comes from public, legal sources or your own research. Should we detect uses that might violate rights of organizations or single persons we reserve the right to block an account, notify the owner and ask them to stop using Datawrapper.</p>

<h2>Limited responsibility</h2>

<p>This service is provided as is. DataStory will certainly not be held accountable if your data is damaged by a server failure or any other cause.</p>

<h2>Privacy</h2>

<p>Datawrapper will not use your private data in any way not necessary for the provision of the Service. However, you have the right to ask for the modification or removal of any personal data in accordance with the laws of Germany.</p>

<p>Note that for installation on your own server a license fee for Highcharts is mandatory.</p>

";
    }

    public function getTemplateName()
    {
        return "terms.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  132 => 105,  211 => 94,  165 => 50,  149 => 48,  136 => 41,  107 => 32,  91 => 30,  40 => 9,  35 => 8,  21 => 3,  96 => 31,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  37 => 6,  30 => 4,  27 => 6,  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 26,  77 => 22,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 39,  115 => 38,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 24,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 9,  41 => 4,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 47,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 11,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 23,  75 => 21,  66 => 18,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 30,  110 => 61,  105 => 36,  99 => 24,  86 => 29,  79 => 22,  72 => 24,  63 => 9,  53 => 16,  38 => 3,  33 => 6,  163 => 139,  47 => 14,  32 => 5,  29 => 3,  26 => 2,);
    }
}
