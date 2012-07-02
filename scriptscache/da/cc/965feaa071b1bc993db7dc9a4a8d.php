<?php

/* chart-visualize.twig */
class __TwigTemplate_dacc965feaa071b1bc993db7dc9a4a8d extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = $this->env->loadTemplate("chart-editor.twig");

        $_trait_0 = $this->env->loadTemplate("vis-options.twig");
        // line 179
        if (!$_trait_0->isTraitable()) {
            throw new Twig_Error_Runtime('Template "'."vis-options.twig".'" cannot be used as a trait.');
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
        return "chart-editor.twig";
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $this->parent->display($context, array_merge($this->blocks, $blocks));
    }

    // line 2
    public function block_content($context, array $blocks = array())
    {
        // line 3
        echo "
";
        // line 4
        $this->displayParentBlock("content", $context, $blocks);
        echo "

<script type=\"text/javascript\">
\$(function() {

    var _typeHasChanged = false;

    DW.currentChart.onSave(function(chart) {
        \$('#iframe-vis').attr('src', '/chart/";
        // line 12
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
        echo "/preview')
        if (_typeHasChanged) {
            \$('#vis-options').load('/xhr/'+chart.get('id')+'/vis-options');
            syncVisOptions();
            _typeHasChanged = false;
        }
    });

    DW.currentChart.sync('#select-vis', 'type');
    DW.currentChart.sync('#select-theme', 'theme');
    DW.currentChart.sync('#text-title', 'title');
    DW.currentChart.sync('#text-intro', 'metadata.describe.intro');

    function syncVisOptions() {
        var vis = JSON.parse('";
        // line 26
        if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
        echo toJSON($_vis_);
        echo "');
        _.each(vis.options, function(opt, key) {
            if (opt.type == 'radio') {
                DW.currentChart.sync('input[name='+key+']', 'metadata.visualize.'+key);
            } else {
                DW.currentChart.sync('#'+key, 'metadata.visualize.'+key);
            }
        });
    };

    DW.currentChart.onChange(function(chart, key) {
        if (key == 'type') {
            _typeHasChanged = true;
        }
    });

    syncVisOptions();

    // load dataset
    function _getHighlights() {
        var sel = DW.currentChart.get('metadata.visualize.highlighted');
        return _.isArray(sel) ? sel.slice() : [];
    }

    function highlightSeriesClick(e) {
        var badge = \$(e.target).parents('.badge'),
            series = badge.data('series'),
            li = badge;
            selected = _getHighlights();
        selected = _.without(selected, series);
        DW.currentChart.set('metadata.visualize.highlighted', selected);
        li.remove();
    }
    \$('.highlighted-series .badge').click(highlightSeriesClick);

    DW.currentChart.dataset(function(ds) {
        var s = \$('#highlight-series'), s2 = \$('.highlighted-series');
        _.each(DW.currentChart.dataSeries(), function(col) {
            s.append('<option>'+col.name+'</option>');
        });
        s.change(function() {
            if (s.val() != \"---\") {
                var selected = _getHighlights();
                if (_.indexOf(selected, s.val()) >= 0) {
                    s.val('---');
                    return;
                }

                var li = \$('<span data-series=\"'+s.val()+'\" class=\"badge badge-info\"><i class=\"icon-remove icon-white\"></i>'+s.val()+'</span>');

                selected.push(s.val());

                DW.currentChart.set('metadata.visualize.highlighted', selected);

                \$('.badge', li).click(highlightSeriesClick);
                s2.append(li);
                s.val('---');
            }
        })
    });

    \$('.collapse').on('shown', function(e) {
        var tgl = \$('[data-toggle=collapse][data-target=#'+e.target.id+']');
        tgl.addClass('collapse-shown');
        tgl.removeClass('collapse-hidden');
    });

    \$('.collapse').on('hidden', function(e) {
        var tgl = \$('[data-toggle=collapse][data-target=#'+e.target.id+']');
        tgl.addClass('collapse-hidden');
        tgl.removeClass('collapse-shown');
    });
});

</script>

<div class=\"dw-create-visualize\">

    <div class=\"row\">
        <div class=\"span4 visconfig\">

            <div class=\"row\">
                <div class=\"span2\">
                    <label for=\"select-vis\">Visualization:</label>
                    <select id=\"select-vis\" class=\"span2\">
                        ";
        // line 111
        if (isset($context["visualizations"])) { $_visualizations_ = $context["visualizations"]; } else { $_visualizations_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_visualizations_);
        foreach ($context['_seq'] as $context["_key"] => $context["vis"]) {
            if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
            if ($this->getAttribute($_vis_, "title")) {
                // line 112
                echo "                        <option value=\"";
                if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($_vis_, "id"), "html", null, true);
                echo "\">";
                if (isset($context["vis"])) { $_vis_ = $context["vis"]; } else { $_vis_ = null; }
                echo twig_escape_filter($this->env, $this->getAttribute($this->getAttribute($_vis_, "title"), "en"), "html", null, true);
                echo "</option>
                        ";
            }
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['vis'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 114
        echo "                    </select>
                </div>

                <div class=\"span2\">
                    <label for=\"select-theme\">Layout:</label>
                    <select id=\"select-theme\" class=\"span2\">
                        ";
        // line 120
        if (isset($context["themes"])) { $_themes_ = $context["themes"]; } else { $_themes_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_themes_);
        foreach ($context['_seq'] as $context["_key"] => $context["theme"]) {
            // line 121
            echo "                        <option value=\"";
            if (isset($context["theme"])) { $_theme_ = $context["theme"]; } else { $_theme_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_theme_, "id"), "html", null, true);
            echo "\">";
            if (isset($context["theme"])) { $_theme_ = $context["theme"]; } else { $_theme_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_theme_, "title"), "html", null, true);
            echo "</option>
                        ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['theme'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 123
        echo "                    </select>
                </div>

            </div>

            <label for=\"text-title\">Title</label>
            <input type=\"text\" id=\"text-title\" class=\"input-xlarge span4\" />

            ";
        // line 132
        echo "
            <label for=\"text-intro\"><a data-toggle=\"collapse\" data-target=\"#c-intro\" class=\"collapse-";
        // line 133
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if ($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "describe"), "intro")) {
            echo "shown";
        } else {
            echo "hidden";
        }
        echo "\">Introduction</a></label>
            <div id=\"c-intro\" class=\"collapse";
        // line 134
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if ($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "describe"), "intro")) {
            echo " in";
        }
        echo "\">
                    <textarea type=\"text\" id=\"text-intro\" class=\"input-xlarge span4\"></textarea>
            </div>

            ";
        // line 139
        echo "
            <label>
                <a data-toggle=\"collapse\" data-target=\"#c-highlight\" class=\"collapse-";
        // line 141
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if (isset($context["series"])) { $_series_ = $context["series"]; } else { $_series_ = null; }
        if (($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "visualize"), "highlighted") - $_series_)) {
            echo "shown";
        } else {
            echo "hidden";
        }
        echo "\">Highlight series</a>
            </label>
            <div class=\"collapse";
        // line 143
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if (isset($context["series"])) { $_series_ = $context["series"]; } else { $_series_ = null; }
        if (($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "visualize"), "highlighted") - $_series_)) {
            echo " in";
        }
        echo "\" id=\"c-highlight\">
                <div>
                    <select id=\"highlight-series\" class=\"span2\">
                        <option value=\"---\">- select a data series -</option>
                    </select>
                </div>
                <p class=\"highlighted-series\">
                    ";
        // line 150
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if (isset($context["series"])) { $_series_ = $context["series"]; } else { $_series_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable(($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "visualize"), "highlighted") - $_series_));
        foreach ($context['_seq'] as $context["_key"] => $context["series"]) {
            // line 151
            echo "                    <span data-series=\"";
            if (isset($context["series"])) { $_series_ = $context["series"]; } else { $_series_ = null; }
            echo twig_escape_filter($this->env, $_series_, "html", null, true);
            echo "\" class=\"badge badge-info\"><i class=\"icon-remove icon-white\"></i>";
            if (isset($context["series"])) { $_series_ = $context["series"]; } else { $_series_ = null; }
            echo twig_escape_filter($this->env, $_series_, "html", null, true);
            echo "</span>
                    ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['series'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 153
        echo "                </p>
            </div>

            ";
        // line 157
        echo "
            <label>
                <a data-toggle=\"collapse\" data-target=\"#c-highlight-values\" class=\"collapse-";
        // line 159
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if (isset($context["values"])) { $_values_ = $context["values"]; } else { $_values_ = null; }
        if (($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "visualize"), "highlighted") - $_values_)) {
            echo "shown";
        } else {
            echo "hidden";
        }
        echo "\">Highlight values</a>
            </label>
            <div class=\"collapse";
        // line 161
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        if (isset($context["values"])) { $_values_ = $context["values"]; } else { $_values_ = null; }
        if (($this->getAttribute($this->getAttribute($this->getAttribute($_chart_, "metadata"), "visualize"), "highlighted") - $_values_)) {
            echo " in";
        }
        echo "\" id=\"c-highlight-values\">
                <div class=\"form-horizontal\">
                    <label>Value: <input type=\"text\" class=\"span1\" /> <input type=\"text\" class=\"span2\" placeholder=\"comment\" /></label>
                </div>
                    
            </div>

            ";
        // line 169
        echo "
            <label><a data-toggle=\"collapse\" data-target=\"#c-tooltips\">Customize Tooltips</a></label>
            <div class=\"collapse\" id=\"c-tooltips\">
                <label class=\"control-label\">Tooltip content</label>
                <div class=\"controls\">
                    <textarea style=\"width:100%\" placeholder=\"not implemented yet\"></textarea>
                </div>
            </div>

            <div id=\"vis-options\" class=\"form-horizontal\">
                ";
        // line 180
        echo "                ";
        $this->displayBlock("visoptions", $context, $blocks);
        echo "
            </div>
        </div>

        <div class=\"span8\">
            <iframe src=\"/chart/";
        // line 185
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
        echo "/preview\" id=\"iframe-vis\" style=\"width:100%; height: 500px\">
            </iframe>

        </div>

    </div>

    <div class=\"form-actions\">
        <a href=\"publish\" class=\"pull-right btn btn-primary\" id=\"visualize-proceed\">Publish <i class=\"icon-chevron-right icon-white\"></i></a>
        <a class=\"btn\" href=\"describe\"><i class=\"icon-chevron-left\"></i> Back</a>
    </div>

</div>


";
    }

    public function getTemplateName()
    {
        return "chart-visualize.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 4,  41 => 3,  142 => 120,  121 => 69,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 61,  74 => 32,  59 => 24,  50 => 19,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 21,  75 => 17,  66 => 16,  58 => 15,  48 => 14,  42 => 12,  34 => 10,  24 => 2,  18 => 1,  101 => 56,  95 => 53,  45 => 13,  39 => 11,  19 => 55,  12 => 179,  110 => 61,  105 => 67,  99 => 24,  86 => 40,  79 => 49,  72 => 10,  63 => 9,  53 => 20,  38 => 2,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
