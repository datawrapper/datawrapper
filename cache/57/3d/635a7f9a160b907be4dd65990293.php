<?php

/* modal.twig */
class __TwigTemplate_573d635a7f9a160b907be4dd65990293 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<div class=\"modal-header\">
    <a class=\"close\" data-dismiss=\"modal\">×</a>
    <h1>";
        // line 3
        $this->displayBlock("title", $context, $blocks);
        echo "</h1>
</div>
<div class=\"modal-body\">
    ";
        // line 6
        $this->displayBlock("content", $context, $blocks);
        echo "
</div>
<div class=\"modal-footer\">
    <a class=\"btn\" data-dismiss=\"modal\">Close</a>
</div>";
    }

    public function getTemplateName()
    {
        return "modal.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  27 => 6,  21 => 3,  17 => 1,  105 => 36,  96 => 31,  89 => 26,  83 => 23,  79 => 22,  75 => 21,  71 => 20,  67 => 19,  61 => 16,  52 => 10,  47 => 8,  41 => 4,  38 => 3,  12 => 30,);
    }
}
