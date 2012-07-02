<?php

/* help-interpret-data.twig */
class __TwigTemplate_7401b1b3b66a11ee5b3c854ca8b5222f extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'helpmodal' => array($this, 'block_helpmodal'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        $this->displayBlock('helpmodal', $context, $blocks);
    }

    public function block_helpmodal($context, array $blocks = array())
    {
        // line 2
        echo "    <div class=\"modal hide\" id=\"helpInterpretData\">
        <div class=\"modal-header\">
            <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>
            <h2>Help Datawrapper to Read your Data</h2>
        </div>
        <div class=\"modal-body\">
            <p>
            </p>
            <dl class=\"dl-horizontal\">
                <dt>Horizontal Headers</dt>
                <dd>Check this if the first row of your data table contain the names of the data columns. If not set, Datawrapper will auto-generate column names and will try not to use them in the charts. In general, it is a good advice to provide column names.</dd>
                <dt>Vertical Headers</dt>
                <dd>...</dd>
                <dt>Transpose Data</dt>
                <dd>...</dd>
            </dl>
        </div>
        <div class=\"modal-footer\">
            <a href=\"#\" class=\"btn\" data-dismiss=\"modal\">Close</a>
        </div>
    </div>
";
    }

    public function getTemplateName()
    {
        return "help-interpret-data.twig";
    }

    public function getDebugInfo()
    {
        return array (  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 31,  77 => 27,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 42,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 15,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 18,  41 => 3,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 17,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 29,  75 => 29,  66 => 16,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 179,  110 => 61,  105 => 44,  99 => 24,  86 => 40,  79 => 18,  72 => 24,  63 => 9,  53 => 18,  38 => 2,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
