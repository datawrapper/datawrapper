<?php

/* docs-quickstart.twig */
class __TwigTemplate_bd36c9da08d128fef5f7edeeb1958863 extends Twig_Template
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

<h2>Using Datawrapper is simple</h2>
        
        <ol>
            <li><!-- 1 -->
                Search for a data set - can be an Excel chart, a Google Table or even a table in any web page. Make sure that the data has no copyright restrictions for further use.           </li>
            <li><!-- 2 -->
                Copy the table          </li>
            <li><!-- 3 -->
                Go to Datawrapper and drop the content into the first screen            </li>
            <li><!-- 4 -->
                Click next and check your data.         </li>
            <li><!-- 5 -->
                Click next and you see the options for visualization            </li>
            <li><!-- 6 -->
                Still on this screen you have options to add a description, a link to the source, etc.          </li>
            <li><!-- 7 -->
                Click next, check the visualization, copy the embed code and off you go.            </li>
        </ol>
        <p>
            Datawrapper has some other interesting functions, which you can experience <a href=\"#tutorial\" class=\"fancybox\">in our tutorial</a>.        </p>

";
    }

    public function getTemplateName()
    {
        return "docs-quickstart.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  112 => 41,  93 => 31,  70 => 28,  36 => 6,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 31,  77 => 27,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 42,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 15,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 18,  41 => 3,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 17,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 29,  75 => 29,  66 => 16,  58 => 15,  48 => 10,  42 => 8,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 179,  110 => 61,  105 => 44,  99 => 24,  86 => 40,  79 => 18,  72 => 24,  63 => 9,  53 => 18,  38 => 2,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 3,  26 => 2,);
    }
}
