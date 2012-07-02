<?php

/* docs-about.twig */
class __TwigTemplate_966d645500a83ef1e47ad1f5feeaa8f1 extends Twig_Template
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
    <h2>What is Datawrapper?</h2>

    <p class=\"well\">In short: This is a little tool for journalists. It reduces the time to create and embed a simple chart from hours to seconds.</p>

    <h2>Motivation</h2>
    There are many uses of data in journalism. The first step though is to use data more and often as a basis for reporting. Doing this has become easier, because of the large amounts of data becoming available, thanks to the OpenData movement and other initiatives.<p></p>

    <p>But there are bottlenecks.</p>

    <p>One is that creating even a simple visual chart and embedding it into a story is still too complex and time consuming. Yes, there are extensive other offerings, like IBM ManyEyes or the growing Google Chart API. They are great. But they have downsides, if used by journalists. For example you often have to store your trials data in public, can't get it out again. Plus, control over the look and feel of your charts is limited or complex to change if you are not a coder.</p>

    <h2>Create simple, embeddable charts in seconds, not hours</h2>
    <p>This is what Datawrapper does: This little tool reduces the time needed to create a correct chart and embed it into any CMS from hours to seconds.</p>

    <p>Furthermore, Datawrapper is not a honey-trap. The data you work with or store is yours and yours alone. Trials are not openly published.</p> 

    <p>On top of that, we encourage news organizations to fork Datawrapper via Github and install it on one of your own servers.</p>
    <p>The CSS is accessible, meaning that in one day you can make sure that the charts generated with Datawrapper have your logo, your visual styles and colours.</p> 

    <p>A short tutorial on <a href=\"#tutorial\" class=\"fancybox\">how to use Datawrapper is here</a>.</p>

    <h2>Background</h2>

    <p>Datawrapper was developed for ABZV, a journalism training organization affiliated to BDVZ (German Association of Newspaper Publishers). It is part of our efforts to develop a comprehensive curriculum for data-driven journalism.</p>

    <h2>Features</h2>

    <p>Use of this tool is free.</p>

    <p>Datawrapper 0.1 is a non-commercial, open source software, licensed under the MIT License.</p>

    <p>Datawrapper uses HTML5 Javascript libraries, namely Highcharts and D3.js, with more to come.</p>

    <p>Datawrapper can be forked on GitHub and installed on your own server.</p>

";
    }

    public function getTemplateName()
    {
        return "docs-about.twig";
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
