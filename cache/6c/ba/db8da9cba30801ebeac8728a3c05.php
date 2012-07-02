<?php

/* chart-editor.twig */
class __TwigTemplate_6cbadb8da9cba30801ebeac8728a3c05 extends Twig_Template
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
<div class=\"row create-nav\">
    ";
        // line 6
        if (isset($context["steps"])) { $_steps_ = $context["steps"]; } else { $_steps_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_steps_);
        foreach ($context['_seq'] as $context["_key"] => $context["step"]) {
            // line 7
            echo "        <div class=\"span3";
            if (isset($context["createstep"])) { $_createstep_ = $context["createstep"]; } else { $_createstep_ = null; }
            if (isset($context["step"])) { $_step_ = $context["step"]; } else { $_step_ = null; }
            if (($_createstep_ == $this->getAttribute($_step_, "index"))) {
                echo " active";
            } else {
                if (isset($context["createstep"])) { $_createstep_ = $context["createstep"]; } else { $_createstep_ = null; }
                if (isset($context["step"])) { $_step_ = $context["step"]; } else { $_step_ = null; }
                if (($_createstep_ > $this->getAttribute($_step_, "index"))) {
                    echo " passed";
                }
            }
            echo "\">
            ";
            // line 8
            if (isset($context["createstep"])) { $_createstep_ = $context["createstep"]; } else { $_createstep_ = null; }
            if (isset($context["step"])) { $_step_ = $context["step"]; } else { $_step_ = null; }
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            if ((($_createstep_ > $this->getAttribute($_step_, "index")) || (($_createstep_ != $this->getAttribute($_step_, "index")) && ($this->getAttribute($_chart_, "lastEditStep") >= $this->getAttribute($_step_, "index"))))) {
                echo "<a href=\"";
                if (isset($context["step"])) { $_step_ = $context["step"]; } else { $_step_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_step_, "id"), "html", null, true);
                echo "\">";
            }
            // line 9
            echo "            ";
            if (isset($context["step"])) { $_step_ = $context["step"]; } else { $_step_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_step_, "index"), "html", null, true);
            echo " ";
            if (isset($context["step"])) { $_step_ = $context["step"]; } else { $_step_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_step_, "title"), "html", null, true);
            echo "
            ";
            // line 10
            if (isset($context["createstep"])) { $_createstep_ = $context["createstep"]; } else { $_createstep_ = null; }
            if (isset($context["step"])) { $_step_ = $context["step"]; } else { $_step_ = null; }
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            if ((($_createstep_ > $this->getAttribute($_step_, "index")) || (($_createstep_ != $this->getAttribute($_step_, "index")) && ($this->getAttribute($_chart_, "lastEditStep") >= $this->getAttribute($_step_, "index"))))) {
                echo "</a><i class=\"icon-ok\"></i>";
            }
            // line 11
            echo "        </div>
    ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['step'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 13
        echo "</div>

<script type=\"text/javascript\">

(function(\$) {

    _.templateSettings = {
        interpolate : /\\{\\{(.+?)\\}\\}/g
    };

    \$(function() {
        DW.currentChart = new Datawrapper.EditableChart(JSON.parse('";
        // line 24
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        echo $this->getAttribute($_chart_, "toJSON");
        echo "'));

        if (DW.currentChart.get('lastEditStep') < ";
        // line 26
        if (isset($context["createstep"])) { $_createstep_ = $context["createstep"]; } else { $_createstep_ = null; }
        echo twig_escape_filter($this->env, $_createstep_, "html", null, true);
        echo ") {
            DW.currentChart.set('lastEditStep', ";
        // line 27
        if (isset($context["createstep"])) { $_createstep_ = $context["createstep"]; } else { $_createstep_ = null; }
        echo twig_escape_filter($this->env, $_createstep_, "html", null, true);
        echo ");
        }
    });

})(jQuery);


</script>


";
    }

    public function getTemplateName()
    {
        return "chart-editor.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  110 => 27,  105 => 26,  99 => 24,  86 => 13,  79 => 11,  72 => 10,  63 => 9,  53 => 8,  38 => 7,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
