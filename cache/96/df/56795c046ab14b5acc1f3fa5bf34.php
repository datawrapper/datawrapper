<?php

/* docs-tutorial.twig */
class __TwigTemplate_96df56795c046ab14b5acc1f3fa5bf34 extends Twig_Template
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
<h2>How to get good charts out of Datawrapper</h2>

    <div id=\"1\" class=\"tutorial_class\" style=\"display: block;\">
        <p>Yes, no one reads the manual, but this one is really short. Here we show you how to get the most out of Datawrapper - what data to look for and how to format it to get a correct, good looking chart. Our tool can help you, but if you feed it the wrong data it will fail.</p>
        
        <h2>1. Why only five types of charts?</h2>

        <p>We had to start somewhere and we had to stop somewhere. In the future we would like to add more chart types, to this end we are looking for developers/designers. Contact us at <a href=\"mailto:info@datastory.de\">info@datastory.de</a></p>
        
    </div>

    <div id=\"2\" class=\"tutorial_class\">

        <h2>2. Line chart</h2>
        
        <p>This is easy. You can visualize one or multiple lines. In order to graph them properly here is the best way to prepare your table or spreadsheet.</p>
        
        <p>Your data for a single line should like this:</p>
            <p><img src=\"/static/img/tutorial/line.png\"></p>

        <p><a target=\"_blank\" href=\"https://docs.google.com/spreadsheet/ccc?key=0Ainrk2-JqCiydGpUbkxFM1VObDM4cjZmQ3FjeTQ5OVE&amp;hl=en_US#gid=0\">Sample data for a single line chart.</a></p>
    </div>
    <div id=\"3\" class=\"tutorial_class\">

        <h2>3. Bar chart</h2>
        
        <p>If you have data describing a certain value say month by month or if you want to compare the revenue of company A with the revenue from company B, a bar chart is the way to go.</p>

        <p>Your data for a bar chart should like this:</p>
            <p><img src=\"/static/img/tutorial/bar.png\"></p>

        <p><a target=\"_blank\" href=\"https://docs.google.com/spreadsheet/ccc?key=0Ainrk2-JqCiydEliVjQ1QjhCQWJZVEpEU0EtejE4ZGc&amp;hl=en_US#gid=0\">Sample dataset for a bar chart.</a></p>
    </div>
    <div id=\"4\" class=\"tutorial_class\">

        <h2>4. Pie chart</h2>
        
        <p>Careful, pie charts can be misused and then they distort the message. Use a pie chart if you have data that can be compared proportionally - say, to show how after an election 100 per cent of the vote are spread to the various political parties.</p> 

        <p>Do not use a pie chart if there are to many labels. Often a bar chart is better than a pie chart to show the relation and trend.<a target=\"_blank\" href=\"http://en.wikipedia.org/wiki/Pie_chart\"> Read more about pie charts.</a></p>

        <p>By the way: In a correct pie chart the biggest pie should start at twelve o'clock. And just forget about the shadows and 3D effects of desktop programs. This will get you into a shitstorm.</p>

        <p>Your data for a pie chart should like this:</p>

        <p><img src=\"/static/img/tutorial/pie.png\"></p>

        <p><a target=\"_blank\" href=\"https://docs.google.com/spreadsheet/ccc?key=0Ainrk2-JqCiydEliVjQ1QjhCQWJZVEpEU0EtejE4ZGc&amp;hl=en_US#gid=0\">Sample dataset for a bar chart.</a></p>
    </div>
    <div id=\"5\" class=\"tutorial_class\">

        <h2>5. Streamgraph</h2>
        
        <p>This is our fancy graph. You can use this form to show the pattern of a lot of data over long periods of time. Some people love these, some hate them (because what the chart really says is sometimes a mystery).<a href=\"http://www.leebyron.com/else/streamgraph/\"> Here is a long paper for all of you who want to learn more.</a></p>

        <p>A streamgraph will effectively draw lines and fill the space between these. This is good to display how music preferences have changed over time or how certain topics have been cited more or less often.</p>

        <p>Your data for a streamgraph should like this:</p>
            <p><img src=\"/static/img/tutorial/streamgraph.png\"></p>

        <p><a target=\"_blank\" href=\"https://docs.google.com/spreadsheet/ccc?key=0Aj910EQuus3bdHZVdEhtNVhsMDhFdVNiMDlOVG5BZ3c\">Sample dataset for a streamgraph.</a></p>
        <p>If you have better examples, better datasets or just want to vent off, contact us via <a href=\"mailto:info@datastory.de\">info@datastory.de</a></p>

    </div>

";
    }

    public function getTemplateName()
    {
        return "docs-tutorial.twig";
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
