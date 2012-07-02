<?php

/* vis-options.twig */
class __TwigTemplate_7c8cd9d5a23de53b1b08006c711269d4 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'visoptions' => array($this, 'block_visoptions'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        $this->displayBlock('visoptions', $context, $blocks);
    }

    public function block_visoptions($context, array $blocks = array())
    {
        // line 2
        echo "
<fieldset>
    <legend>";
        // line 4
        if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
        echo twig_escape_filter($this->env, $this->getAttribute($this->getAttribute($_vis_, "title"), "en"), "html", null, true);
        echo " Options</legend>

    ";
        // line 6
        if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($this->getAttribute($_vis_, "options"));
        foreach ($context['_seq'] as $context["key"] => $context["option"]) {
            // line 7
            echo "    <div class=\"control-group\">
        ";
            // line 8
            if (isset($context["option"])) { $_option_ = $context["option"]; } else { $_option_ = null; }
            if (($this->getAttribute($_option_, "type") == "checkbox")) {
                // line 9
                echo "            <div class=\"controls\">
                <label class=\"checkbox\" for=\"";
                // line 10
                if (isset($context["key"])) { $_key_ = $context["key"]; } else { $_key_ = null; }
                echo twig_escape_filter($this->env, $_key_, "html", null, true);
                echo "\"><input type=\"checkbox\" id=\"";
                if (isset($context["key"])) { $_key_ = $context["key"]; } else { $_key_ = null; }
                echo twig_escape_filter($this->env, $_key_, "html", null, true);
                echo "\" /> ";
                if (isset($context["option"])) { $_option_ = $context["option"]; } else { $_option_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($this->getAttribute($_option_, "label"), "en"), "html", null, true);
                echo "</label>
            </div>

        ";
            } elseif (($this->getAttribute($_option_, "type") == "select")) {
                // line 14
                echo "
            <label class=\"control-label\" for=\"";
                // line 15
                if (isset($context["key"])) { $_key_ = $context["key"]; } else { $_key_ = null; }
                echo twig_escape_filter($this->env, $_key_, "html", null, true);
                echo "\">";
                if (isset($context["option"])) { $_option_ = $context["option"]; } else { $_option_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($this->getAttribute($_option_, "label"), "en"), "html", null, true);
                echo "</label>
            <div class=\"controls\">
                <select id=\"";
                // line 17
                if (isset($context["key"])) { $_key_ = $context["key"]; } else { $_key_ = null; }
                echo twig_escape_filter($this->env, $_key_, "html", null, true);
                echo "\">
                    ";
                // line 18
                if (isset($context["option"])) { $_option_ = $context["option"]; } else { $_option_ = null; }
                $context['_parent'] = (array) $context;
                $context['_seq'] = twig_ensure_traversable($this->getAttribute($_option_, "options"));
                foreach ($context['_seq'] as $context["_key"] => $context["opt"]) {
                    // line 19
                    echo "                    <option value=\"";
                    if (isset($context["opt"])) { $_opt_ = $context["opt"]; } else { $_opt_ = null; }
                    echo twig_escape_filter($this->env, $this->getAttribute($_opt_, "value"), "html", null, true);
                    echo "\">";
                    if (isset($context["opt"])) { $_opt_ = $context["opt"]; } else { $_opt_ = null; }
                    echo twig_escape_filter($this->env, $this->getAttribute($this->getAttribute($_opt_, "label"), "en"), "html", null, true);
                    echo "</option>
                    ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['opt'], $context['_parent'], $context['loop']);
                $context = array_merge($_parent, array_intersect_key($context, $_parent));
                // line 21
                echo "                </select>
            </div>

        ";
            } elseif (($this->getAttribute($_option_, "type") == "radio")) {
                // line 25
                echo "
            <label class=\"control-label\" for=\"";
                // line 26
                if (isset($context["key"])) { $_key_ = $context["key"]; } else { $_key_ = null; }
                echo twig_escape_filter($this->env, $_key_, "html", null, true);
                echo "\">";
                if (isset($context["option"])) { $_option_ = $context["option"]; } else { $_option_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($this->getAttribute($_option_, "label"), "en"), "html", null, true);
                echo "</label>
            <div class=\"controls\">
                ";
                // line 28
                if (isset($context["option"])) { $_option_ = $context["option"]; } else { $_option_ = null; }
                $context['_parent'] = (array) $context;
                $context['_seq'] = twig_ensure_traversable($this->getAttribute($_option_, "options"));
                foreach ($context['_seq'] as $context["_key"] => $context["opt"]) {
                    // line 29
                    echo "                <label class=\"radio\"><input type=\"radio\" name=\"";
                    if (isset($context["key"])) { $_key_ = $context["key"]; } else { $_key_ = null; }
                    echo twig_escape_filter($this->env, $_key_, "html", null, true);
                    echo "\" value=\"";
                    if (isset($context["opt"])) { $_opt_ = $context["opt"]; } else { $_opt_ = null; }
                    echo twig_escape_filter($this->env, $this->getAttribute($_opt_, "value"), "html", null, true);
                    echo "\" ";
                    if (isset($context["opt"])) { $_opt_ = $context["opt"]; } else { $_opt_ = null; }
                    if ($this->getAttribute($_opt_, "default")) {
                        echo "checked=\"checked\" ";
                    }
                    echo "/> ";
                    if (isset($context["opt"])) { $_opt_ = $context["opt"]; } else { $_opt_ = null; }
                    echo twig_escape_filter($this->env, $this->getAttribute($this->getAttribute($_opt_, "label"), "en"), "html", null, true);
                    echo "</label>
                ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['opt'], $context['_parent'], $context['loop']);
                $context = array_merge($_parent, array_intersect_key($context, $_parent));
                // line 31
                echo "            </div>

        ";
            } else {
                // line 34
                echo "            <p>Unhandled option type ";
                if (isset($context["option"])) { $_option_ = $context["option"]; } else { $_option_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_option_, "type"), "html", null, true);
                echo "</p>
        ";
            }
            // line 36
            echo "    </div>
    ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['key'], $context['option'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 38
        echo "</fieldset>

";
    }

    public function getTemplateName()
    {
        return "vis-options.twig";
    }

    public function getDebugInfo()
    {
        return array (  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 28,  106 => 26,  103 => 25,  97 => 21,  84 => 19,  65 => 15,  62 => 14,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 4,  41 => 3,  142 => 120,  121 => 69,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 61,  74 => 17,  59 => 24,  50 => 19,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 21,  75 => 17,  66 => 16,  58 => 15,  48 => 10,  42 => 8,  34 => 6,  24 => 2,  18 => 1,  101 => 56,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 179,  110 => 61,  105 => 67,  99 => 24,  86 => 40,  79 => 18,  72 => 10,  63 => 9,  53 => 20,  38 => 2,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
