<?php

/* docs.twig */
class __TwigTemplate_10e5758cdb30be50a0d7dd534d67bd5e extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->blocks = array(
            'title' => array($this, 'block_title'),
            'content' => array($this, 'block_content'),
        );
    }

    protected function doGetParent(array $context)
    {
        return $this->env->resolveTemplate((($this->getContext($context, "xhr")) ? ("modal.twig") : ("core.twig")));
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $this->getParent($context)->display($context, array_merge($this->blocks, $blocks));
    }

    // line 5
    public function block_title($context, array $blocks = array())
    {
        if (isset($context["xhr"])) { $_xhr_ = $context["xhr"]; } else { $_xhr_ = null; }
        if ((!$_xhr_)) {
            echo "- ";
        }
        if (isset($context["title"])) { $_title_ = $context["title"]; } else { $_title_ = null; }
        echo twig_escape_filter($this->env, $_title_, "html", null, true);
    }

    // line 6
    public function block_content($context, array $blocks = array())
    {
        // line 7
        echo "
";
        // line 8
        if (isset($context["xhr"])) { $_xhr_ = $context["xhr"]; } else { $_xhr_ = null; }
        if ((!$_xhr_)) {
            // line 9
            echo "<div class=\"row docs\">
    <div class=\"span8 content\">

        ";
            // line 17
            echo "
        <h1 class=\"title\">";
            // line 18
            if (isset($context["title"])) { $_title_ = $context["title"]; } else { $_title_ = null; }
            echo twig_escape_filter($this->env, $_title_, "html", null, true);
            echo "</h1>

        ";
            // line 20
            $this->displayBlock("docscontent", $context, $blocks);
            echo "

    </div>
    <div class=\"span4 nav\">

        <h3>Navigation</h3>

        <ul class=\"nav nav-pills nav-stacked\">
            ";
            // line 28
            if (isset($context["navigation"])) { $_navigation_ = $context["navigation"]; } else { $_navigation_ = null; }
            $context['_parent'] = (array) $context;
            $context['_seq'] = twig_ensure_traversable($_navigation_);
            foreach ($context['_seq'] as $context["_key"] => $context["page"]) {
                // line 29
                echo "            <li ";
                if (isset($context["page"])) { $_page_ = $context["page"]; } else { $_page_ = null; }
                if ($this->getAttribute($_page_, "active")) {
                    echo "class=\"active\"";
                }
                echo "><a href=\"";
                if (isset($context["page"])) { $_page_ = $context["page"]; } else { $_page_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_page_, "url"), "html", null, true);
                echo "\">";
                if (isset($context["page"])) { $_page_ = $context["page"]; } else { $_page_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_page_, "title"), "html", null, true);
                echo "</a></li>
            ";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['page'], $context['_parent'], $context['loop']);
            $context = array_merge($_parent, array_intersect_key($context, $_parent));
            // line 31
            echo "        </ul>

    </div>
</div>

";
        } else {
            // line 36
            echo " ";
            // line 37
            echo "
    ";
            // line 38
            $this->displayBlock("docscontent", $context, $blocks);
            echo "

";
        }
        // line 41
        echo "
";
        // line 42
        $this->displayParentBlock("content", $context, $blocks);
        echo "
";
    }

    public function getTemplateName()
    {
        return "docs.twig";
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
