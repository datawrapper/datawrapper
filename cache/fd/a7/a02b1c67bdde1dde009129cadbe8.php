<?php

/* home.twig */
class __TwigTemplate_fda7a02b1c67bdde1dde009129cadbe8 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = $this->env->loadTemplate("core.twig");

        $_trait_0 = $this->env->loadTemplate("home-login.twig");
        // line 30
        if (!$_trait_0->isTraitable()) {
            throw new Twig_Error_Runtime('Template "'."home-login.twig".'" cannot be used as a trait.');
        }
        $_trait_0_blocks = $_trait_0->getBlocks();

        $this->traits = $_trait_0_blocks;

        $this->blocks = array_merge(
            $this->traits,
            array(
                'content' => array($this, 'block_content'),
            )
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
    <div clasS=\"span4\">
        <h2 style=\"font-weight:100;\">
            ";
        // line 8
        echo gettext("<b class='dw-logo'>Datawrapper</b> is an open source tool helping everyone to create simple, correct and embeddable charts in minutes.");
        echo "</h2>

            <p>";
        // line 10
        echo gettext("We are bridging the gap between journalists and the newest Javascript-visualization libraries such as D3.js, Raphael and others. We make it easier to \"wrap\" the data into these libraries without coding. Datawrapper minimizes the time needed to create a chart and thus helps data journalists everywhere in the world.");
        echo "</p>

    </div>
    <div class=\"span4\">
        <img src=\"/static/img/chart.png\" alt=\"\" style=\"margin-bottom:30px;\"/>

        <h3>";
        // line 16
        echo gettext("Main features:");
        echo "</h3>

        <ul>
            <li>";
        // line 19
        echo gettext("Simple: Create and embed charts in minutes");
        echo "</li>
            <li>";
        // line 20
        echo gettext("Open Source: Download and install");
        echo "</li>
            <li>";
        // line 21
        echo gettext("CSS: Change the CSS, add your logo");
        echo "</li>
            <li>";
        // line 22
        echo gettext("Developers: Add new chart types");
        echo "</li>
            <li>";
        // line 23
        echo gettext("Non-proﬁt: This is and will stay free to use");
        echo "</li>
        </ul>

        <p><a href=\"/xhr/docs/motivation\" data-toggle=\"modal\">";
        // line 26
        echo gettext("Why this approach? See our Motivations...");
        echo "</a></p>
    </div>
    <div class=\"span4\" id=\"home-login\">

        ";
        // line 31
        echo "        ";
        $this->displayBlock("homelogin", $context, $blocks);
        echo "

    </div>
</div>

";
        // line 36
        $this->displayParentBlock("content", $context, $blocks);
        echo "
";
    }

    public function getTemplateName()
    {
        return "home.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  105 => 36,  96 => 31,  89 => 26,  83 => 23,  79 => 22,  75 => 21,  71 => 20,  67 => 19,  61 => 16,  52 => 10,  47 => 8,  41 => 4,  38 => 3,  12 => 30,);
    }
}
