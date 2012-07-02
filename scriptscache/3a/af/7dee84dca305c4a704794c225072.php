<?php

/* header.twig */
class __TwigTemplate_3aaf7dee84dca305c4a704794c225072 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'header' => array($this, 'block_header'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        $this->displayBlock('header', $context, $blocks);
    }

    public function block_header($context, array $blocks = array())
    {
        // line 2
        echo "

        
        <div class=\"span9 toplinks\">

            <div class=\"pull-right\">
                <ul class=\"nav nav-pills dw-header-nav\">

                ";
        // line 10
        if (isset($context["headlinks"])) { $_headlinks_ = $context["headlinks"]; } else { $_headlinks_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_headlinks_);
        foreach ($context['_seq'] as $context["_key"] => $context["link"]) {
            // line 11
            echo "
                    ";
            // line 12
            if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
            if ($this->getAttribute($_link_, "dropdown")) {
                // line 13
                echo "
                        <li class=\"";
                // line 14
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "id"), "html", null, true);
                echo " dropdown";
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                if ($this->getAttribute($_link_, "active")) {
                    echo " active";
                }
                echo "\">
                            <a id=\"dw-header-link-";
                // line 15
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "id"), "html", null, true);
                echo "\" href=\"";
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "url"), "html", null, true);
                echo "\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">
                                <i class=\"icon-";
                // line 16
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "icon"), "html", null, true);
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                if ($this->getAttribute($_link_, "active")) {
                    echo " icon-white";
                }
                echo "\"></i>
                                ";
                // line 17
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "title"), "html", null, true);
                echo "
                                <b class=\"caret\"></b>
                            </a>
                            <ul class=\"dropdown-menu\">
                                ";
                // line 21
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                $context['_parent'] = (array) $context;
                $context['_seq'] = twig_ensure_traversable($this->getAttribute($_link_, "dropdown"));
                foreach ($context['_seq'] as $context["_key"] => $context["slink"]) {
                    // line 22
                    echo "                                <li><a href=\"";
                    if (isset($context["slink"])) { $_slink_ = $context["slink"]; } else { $_slink_ = null; }
                    echo twig_escape_filter($this->env, $this->getAttribute($_slink_, "url"), "html", null, true);
                    echo "\">";
                    if (isset($context["slink"])) { $_slink_ = $context["slink"]; } else { $_slink_ = null; }
                    if ($this->getAttribute($_slink_, "icon")) {
                        echo "<i class=\"icon-";
                        if (isset($context["slink"])) { $_slink_ = $context["slink"]; } else { $_slink_ = null; }
                        echo twig_escape_filter($this->env, $this->getAttribute($_slink_, "icon"), "html", null, true);
                        echo "\"></i> ";
                    }
                    if (isset($context["slink"])) { $_slink_ = $context["slink"]; } else { $_slink_ = null; }
                    echo twig_escape_filter($this->env, $this->getAttribute($_slink_, "title"), "html", null, true);
                    echo "</a></li>
                                ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['slink'], $context['_parent'], $context['loop']);
                $context = array_merge($_parent, array_intersect_key($context, $_parent));
                // line 24
                echo "                            </ul>
                        </li>

                    ";
            } else {
                // line 28
                echo "
                        <li class=\"";
                // line 29
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "id"), "html", null, true);
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                if ($this->getAttribute($_link_, "active")) {
                    echo " active";
                }
                echo "\">
                            <a id=\"dw-header-link-";
                // line 30
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "id"), "html", null, true);
                echo "\" href=\"";
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "url"), "html", null, true);
                echo "\"";
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                if ($this->getAttribute($_link_, "modal")) {
                    echo " data-toggle=\"modal\"";
                }
                echo ">
                               <i class=\"icon-";
                // line 31
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "icon"), "html", null, true);
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                if ($this->getAttribute($_link_, "active")) {
                    echo " icon-white";
                }
                echo "\"></i>
                               ";
                // line 32
                if (isset($context["link"])) { $_link_ = $context["link"]; } else { $_link_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_link_, "title"), "html", null, true);
                echo "
                            </a>
                        </li>

                    ";
            }
            // line 37
            echo "
                ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['link'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 39
        echo "                </ul>
            </div>

        </div>


";
    }

    public function getTemplateName()
    {
        return "header.twig";
    }

    public function getDebugInfo()
    {
        return array (  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 28,  108 => 24,  88 => 22,  83 => 21,  75 => 17,  66 => 16,  58 => 15,  48 => 14,  42 => 12,  34 => 10,  24 => 2,  18 => 1,  101 => 56,  95 => 53,  45 => 13,  39 => 11,  19 => 55,  12 => 52,  110 => 61,  105 => 26,  99 => 24,  86 => 13,  79 => 11,  72 => 10,  63 => 9,  53 => 8,  38 => 7,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
