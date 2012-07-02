<?php

/* error.twig */
class __TwigTemplate_c7373f922f6a92d74775d60600ef6535 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = $this->env->loadTemplate("core.twig");

        $this->blocks = array(
            'content' => array($this, 'block_content'),
        );
    }

    protected function doGetParent(array $context)
    {
        return "core.twig";
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $this->parent->display($context, array_merge($this->blocks, $blocks));
    }

    // line 3
    public function block_content($context, array $blocks = array())
    {
        // line 4
        echo "
    <div class=\"row\">

        <div class=\"span8\">
            <div class=\"page-header\">
                <h2>";
        // line 9
        if (isset($context["title"])) { $_title_ = $context["title"]; } else { $_title_ = null; }
        echo twig_escape_filter($this->env, $_title_, "html", null, true);
        echo "</h2>
            </div>
            <p>";
        // line 11
        if (isset($context["message"])) { $_message_ = $context["message"]; } else { $_message_ = null; }
        echo $_message_;
        echo "</p>

            <h3>What should I do now?</h3>

            <p>Create a new chart or look in your charts</p>

        </div>
    </div>

";
    }

    public function getTemplateName()
    {
        return "error.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 31,  77 => 27,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 42,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 15,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 18,  41 => 3,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 17,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 29,  75 => 29,  66 => 16,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 179,  110 => 61,  105 => 44,  99 => 24,  86 => 40,  79 => 18,  72 => 24,  63 => 9,  53 => 18,  38 => 2,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
