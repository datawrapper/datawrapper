<?php

/* docs-motivation.twig */
class __TwigTemplate_32fa3a184cd18e502eeb19e4dbe01919 extends Twig_Template
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

    // line 3
    public function block_docscontent($context, array $blocks = array())
    {
        // line 4
        echo "
<h2>Datawrapper: Goals and Features</h2>

        <p>Data Journalism opens new perspectives to do deeper and better reporting. If Journalists do really know the numbers and the data - locally, regionally or worldwide - this could lead to higher trustability and relevancy. The readers want clear signals, not some muddled up guessing. Datawrapper is a tool that makes working from data to story easier. Data should be the foundation when starting a new story, not an afterthought. In many newsrooms this is the other way round so far. „Infographics“ are usually started when the story is already done. That leads to actionism, omissions and mistakes. 
        </p>

        <h2>Open Source</h2>

        <p>The most important feature of Datawrapper is its fully open source character. Journalists, bloggers and any media company can download this little helper and install it on a private server. The design of the charts can be adjusted to your outfit's style - you can change the colors, the visual style and the logos. This is increasingly important, because in too many „free“ platforms someone is somehow lurking over the journalists shoulder. Not here. 
        </p><h2>HTML5 Chart Libraries</h2>

        <p>Datawrapper uses modern Javascript, HTML5 Libraries like Highcharts oder D3.JS. We want to provide an access to these powerful options. This is a step towards the future as the web prepares for a switch to new visualization options in the near future. So far, especially on news websites, some <a href=\"http://de.wikipedia.org/wiki/Canvas_%28HTML-Element%29\" target=\"_blank\">fancy features</a> where not used in order to not loose any users who still have incompatible (read: very old) browsers. But developers are about to change their mind. The message to users is: Get a decent browser. Downloading and installing a modern, HTML5 capable browser takes a few minutes and opens the door to many, many future options.
        </p><h2>Visualize fast, very fast</h2>

        <p>Using Datawrapper you can create a chart in minutes. Interestingly, doing visualization fast is not the goal of Datawrapper. Preparation, thinking, digging into data and make sense of it is still the main work of data journalists. Datawrapper does the visualization job fast, but merely to not stand in the way to publish something cool. Throwing nonsensical data into this will most probably lead to nonsensical results.
        </p><h2>Chart types</h2>

        <p>The development of this (small) tool was more winded than initially thought. No surprise here. The main challenge was to find a way to reduce the number of steps to a minimum and at the same time offer a lot of features and options.
        </p><p>This is why this beta version does only have five basic chart types. But it is a start and shows what is possible. In the future we would like to add more compelling visualizations. To do that we need the support of the data journalism community. If you are a developer who is interested in journalism, please help us.
        </p><h2>Motivation</h2>

        <p>We are data journalists. We believe, that digging into numbers, structures and influence patterns is extremely important. Doing this with a journalist's mind will build trustability in what is reported. And it opens new perspectives, for example to turn media companies into <a href=\"http://www.niemanlab.org/2011/03/voices-news-organizations-must-become-hubs-of-trusted-data-in-an-market-seeking-and-valuing-trust/\" target=\"_blank\"> trusted data hubs </a>. Who wants to join us?
    </p><p>- Mirko Lorenz, Nicolas Kayser-Bril, 2012</p>

";
    }

    public function getTemplateName()
    {
        return "docs-motivation.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  112 => 41,  93 => 31,  70 => 28,  36 => 6,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 31,  77 => 27,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 42,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 15,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 18,  41 => 3,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 17,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 29,  75 => 29,  66 => 16,  58 => 15,  48 => 10,  42 => 8,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 179,  110 => 61,  105 => 44,  99 => 24,  86 => 40,  79 => 18,  72 => 24,  63 => 9,  53 => 18,  38 => 2,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
