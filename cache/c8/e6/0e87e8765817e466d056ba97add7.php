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
        return array (  211 => 94,  165 => 50,  149 => 48,  144 => 47,  136 => 41,  120 => 39,  115 => 38,  107 => 32,  91 => 30,  86 => 29,  77 => 22,  66 => 18,  53 => 16,  40 => 9,  35 => 8,  29 => 4,  26 => 3,  27 => 6,  21 => 3,  17 => 1,  105 => 36,  96 => 31,  89 => 26,  83 => 23,  79 => 22,  75 => 21,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  47 => 14,  41 => 4,  38 => 3,  12 => 30,);
    }
}
