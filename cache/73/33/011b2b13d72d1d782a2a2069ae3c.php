<?php

/* terms.twig */
class __TwigTemplate_7333011b2b13d72d1d782a2a2069ae3c extends Twig_Template
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

<h2>Fair usage policy</h2>

<p>Datawrapper is licensed to visualize data that comes from public, legal sources or your own research. Should we detect uses that might violate rights of organizations or single persons we reserve the right to block an account, notify the owner and ask them to stop using Datawrapper.</p>

<h2>Limited responsibility</h2>

<p>This service is provided as is. DataStory will certainly not be held accountable if your data is damaged by a server failure or any other cause.</p>

<h2>Privacy</h2>

<p>Datawrapper will not use your private data in any way not necessary for the provision of the Service. However, you have the right to ask for the modification or removal of any personal data in accordance with the laws of Germany.</p>

<p>Note that for installation on your own server a license fee for Highcharts is mandatory.</p>

";
    }

    public function getTemplateName()
    {
        return "terms.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  132 => 105,  211 => 94,  165 => 50,  149 => 48,  144 => 47,  136 => 41,  120 => 39,  115 => 38,  107 => 32,  91 => 30,  86 => 29,  77 => 22,  66 => 18,  53 => 16,  40 => 9,  35 => 8,  29 => 3,  26 => 2,  27 => 6,  21 => 3,  17 => 1,  105 => 36,  96 => 31,  89 => 26,  83 => 23,  79 => 22,  75 => 21,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  47 => 14,  41 => 4,  38 => 3,  12 => 30,);
    }
}
