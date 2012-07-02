<?php

/* mycharts.twig */
class __TwigTemplate_c8e60e87e8765817e466d056ba97add7 extends Twig_Template
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
    <div class=\"span9 mycharts\">
        <ul class=\"thumbnails\">
            ";
        // line 8
        if (isset($context["charts"])) { $_charts_ = $context["charts"]; } else { $_charts_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_charts_);
        foreach ($context['_seq'] as $context["_key"] => $context["chart"]) {
            // line 9
            echo "            <li class=\"span3 chart\">
                <div class=\"thumbnail\">
                    <img src=\"http://placehold.it/260x180\" width=\"260\" height=\"180\" alt=\"\">

                    <p class=\"pull-right\">
                        <a href=\"#delete\" class=\"delete\" data-chart=\"";
            // line 14
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
            echo "\"><i class=\"icon-remove\"></i></a>
                    </p>
                     <h3><a href=\"chart/";
            // line 16
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
            echo "/edit\">";
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "title"), "html", null, true);
            echo "</a></h3>
                     <p>Created: ";
            // line 17
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, twig_date_format_filter($this->env, $this->getAttribute($_chart_, "createdAt")), "html", null, true);
            echo "<br/>
                     Layout: ";
            // line 18
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "theme"), "html", null, true);
            echo " </p>
                </div>
            </li>
            ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['chart'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 22
        echo "        </ul>
    </div>
    <div class=\"span3\">
        <h3>By Month</h3>

        <span class=\"label label-info\">Not Implemented</span>
        <ul class=\"unstyled\">
            ";
        // line 29
        if (isset($context["bymonth"])) { $_bymonth_ = $context["bymonth"]; } else { $_bymonth_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_bymonth_);
        foreach ($context['_seq'] as $context["_key"] => $context["month"]) {
            // line 30
            echo "            <li><a href=\"";
            if (isset($context["month"])) { $_month_ = $context["month"]; } else { $_month_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_month_, "url"), "html", null, true);
            echo "\">";
            if (isset($context["month"])) { $_month_ = $context["month"]; } else { $_month_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_month_, "name"), "html", null, true);
            echo "</a> (";
            if (isset($context["month"])) { $_month_ = $context["month"]; } else { $_month_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_month_, "count"), "html", null, true);
            echo ")</li>
            ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['month'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 32
        echo "        </ul>

        <h3>By Visualisation</h3>

        <span class=\"label label-info\">Not Implemented</span>
        <ul class=\"unstyled\">
            ";
        // line 38
        if (isset($context["byvis"])) { $_byvis_ = $context["byvis"]; } else { $_byvis_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_byvis_);
        foreach ($context['_seq'] as $context["_key"] => $context["vis"]) {
            // line 39
            echo "            <li><a href=\"";
            if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_vis_, "url"), "html", null, true);
            echo "\">";
            if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_vis_, "name"), "html", null, true);
            echo "</a> (";
            if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_vis_, "count"), "html", null, true);
            echo ")</li>
            ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['vis'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 41
        echo "        </ul>

        <h3>By Layout</h3>

        <span class=\"label label-info\">Not Implemented</span>
        <ul class=\"unstyled\">
            ";
        // line 47
        if (isset($context["bylayout"])) { $_bylayout_ = $context["bylayout"]; } else { $_bylayout_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_bylayout_);
        foreach ($context['_seq'] as $context["_key"] => $context["layout"]) {
            // line 48
            echo "            <li><a href=\"";
            if (isset($context["layout"])) { $_layout_ = $context["layout"]; } else { $_layout_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_layout_, "url"), "html", null, true);
            echo "\">";
            if (isset($context["layout"])) { $_layout_ = $context["layout"]; } else { $_layout_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_layout_, "name"), "html", null, true);
            echo "</a> (";
            if (isset($context["layout"])) { $_layout_ = $context["layout"]; } else { $_layout_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_layout_, "count"), "html", null, true);
            echo ")</li>
            ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['layout'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 50
        echo "        </ul>
    </div>
</div>
<script type=\"text/javascript\" src=\"/static/vendor/masonry/jquery.masonry.min.js\"></script>
<script type=\"text/javascript\">
\$(function(){
  //*

  function layout() {
      \$('.mycharts .thumbnails').masonry({
        itemSelector : 'li',
        columnWidth : function(w) { return w/3; }
      });
  }

  layout();

  setTimeout(layout, 1000);
   // */


    \$('a.delete').click(function(e) {
        e.preventDefault();
        var a = e.target.tagName.toLowerCase() == 'a' ? \$(e.target) : \$(e.target).parents('a');
        var id = a.data('chart');
        if (window.confirm('Do you really want to delete the chart? Note that this chart won\\'t be embedable any more, after deleting.')) {
             \$.ajax({
                url: '/api/charts/'+id,
                type: 'DELETE',
                success: function(data) {
                    a.parents('.chart').remove();
                    layout();
                }
            });
        };
    });
});

\$('body').load(function() {

});

</script>

";
        // line 94
        $this->displayParentBlock("content", $context, $blocks);
        echo "
";
    }

    public function getTemplateName()
    {
        return "mycharts.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  211 => 94,  165 => 50,  149 => 48,  136 => 41,  107 => 32,  91 => 30,  40 => 9,  35 => 8,  21 => 3,  96 => 31,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  37 => 6,  30 => 4,  27 => 6,  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 26,  77 => 22,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 39,  115 => 38,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 24,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 9,  41 => 4,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 47,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 11,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 23,  75 => 21,  66 => 18,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 30,  110 => 61,  105 => 36,  99 => 24,  86 => 29,  79 => 22,  72 => 24,  63 => 9,  53 => 16,  38 => 3,  33 => 6,  163 => 139,  47 => 14,  32 => 5,  29 => 4,  26 => 3,);
    }
}
