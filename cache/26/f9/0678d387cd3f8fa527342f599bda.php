<?php

/* chart-describe.twig */
class __TwigTemplate_26f90678d387cd3f8fa527342f599bda extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = $this->env->loadTemplate("chart-editor.twig");

        $this->blocks = array(
            'content' => array($this, 'block_content'),
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

    // line 3
    public function block_content($context, array $blocks = array())
    {
        // line 4
        echo "
";
        // line 5
        $this->displayParentBlock("content", $context, $blocks);
        echo "

<script type=\"text/javascript\">
\$(function() {

    DW.currentChart.onChange(reload);

    DW.currentChart.sync('#has-horizontal-headers', 'metadata.data.horizontal-header');
    DW.currentChart.sync('#has-vertical-headers', 'metadata.data.vertical-header');
    DW.currentChart.sync('#describe-source-name', 'metadata.describe.source-name');
    DW.currentChart.sync('#describe-source-url', 'metadata.describe.source-url');
    DW.currentChart.sync('input:radio[name=transpose]', 'metadata.data.transpose');
    ";
        // line 18
        echo "
    function updateTable(dv, chart) {

        function isNone(val) {
            return val === null || val === undefined || (_.isNumber(val) && isNaN(val));
        }

        var table = \$('#data-preview'),
            horzHeaders = chart.get('metadata.data.horizontal-header'),
            vertHeaders = chart.get('metadata.data.vertical-header'),
            transpose = chart.get('metadata.data.transpose');
        table.html('');  // empty table
        table.append('<thead><tr></tr><thead><tbody></tbody>');

        table.addClass(transpose ? 'row-series' : 'column-series');
        table.removeClass(transpose ? 'column-series' : 'row-series');

        dv.eachColumn(function() {
            table.append('<colgroup style=\"width:'+(100 / dv.columnNames().length)+'%\" />');
        });

        if (horzHeaders) {
            var thead = \$('thead tr', table);
            dv.eachColumn(function(name, o, i) {
                if (vertHeaders && i == 0) name = '';
                else name = '<span>'+name+'</span>';
                thead.append('<th>'+(!isNone(name) ? name : '')+'</th>');
            });
        }

        if (vertHeaders) table.addClass('vert-header'); else table.removeClass('vert-header');

        var tbody = \$('tbody', table);
        dv.each(function(row) {
            var tr = \$('<tr></tr>');
            dv.eachColumn(function(col, o, i) {
                if (i == 0 && vertHeaders) {
                    tr.append('<th><span>'+(!isNone(row[col]) ? row[col] : '')+'</span></th>');
                } else {
                    tr.append('<td>'+(!isNone(row[col]) ? row[col] : '')+'</td>');
                }
            });
            tbody.append(tr);
        });

    }

    function reload() {

        DW.currentChart.dataset(function(ds) {
            DW.dataView = ds;
            updateTable(ds, DW.currentChart);
        }, true);
    }

    reload();

    \$('#describe-proceed').click(function(e) {
        DW.currentChart.save();
    });

});

</script>

<div class=\"dw-create-describe\">

    <div class=\"row\">

        <div class=\"span8\">
            <div class=\"page-header\">
                <h2>Check your data</h2>
            </div>

            <p>Please check if the data format was recognized correctly. If not, please <a data-toggle=\"modal\" href=\"/xhr/docs/describe\">help Datawrapper to understand your data</a>.</p>


            <form class=\"form-inline\">
                <div id=\"csv-parse-options\" class=\"row\">
                    <div class=\"span4\">
                        
                        
                    </div>
                    <div class=\"span4\">
                        
                    </div>
                </div>
            </form>

            <div style=\"overflow-x:scroll; overflow-y: visible; width:100%\">
                <table id=\"data-preview\" class=\"table table-striped\">
                </table>
            </div>
        </div>

        <div class=\"span4\">
            <div class=\"page-header\">
                <h2>Describe your data</h2>
            </div>
            <div class=\"row\" style=\"margin-bottom:15px\">
                <div class=\"span2\">
                    <p>
                        <label class=\"radio\"><input type=\"radio\" name=\"transpose\" value=\"yes\" /> Data series in rows</label>
                        <label class=\"radio\"><input type=\"radio\" name=\"transpose\" value=\"no\" /> Data series in columns</label>
                    </p>

                </div><div class=\"span2\">
                    <p>
                        <label class=\"checkbox\"><input id=\"has-horizontal-headers\" type=\"checkbox\" checked=\"checked\"> First row as label</label>
                        <label class=\"checkbox\"><input id=\"has-vertical-headers\" type=\"checkbox\"> First column as label</label>
                    </p>
                </div>
            </div>

            ";
        // line 139
        echo "
            <h3>Credit the source</h3>
            <p>
                <label>Who published the data in the first place?</label>
                <input id=\"describe-source-name\" type=\"text\" placeholder=\"name of the organisation\">
            </p>
            <p>
                <label>If possible, please provide a link the source data</label>
                <input id=\"describe-source-url\" type=\"text\" placeholder=\"http://\">
            </p>
            <h3>Annotate data</h3>
            <p>To make the data more useful for your readers you can add details to individual data points or an entire series. This information will be displayed in the visualisations. <a href=\"#\">Learn more..</a></p>
            <button class=\"btn\"><i class=\"icon-th-list\"></i> Annotate series</button> <button class=\"btn\"><i class=\"icon-th\"></i> Annotate data point</button>

            <div class=\"form-actions\">
                <a href=\"visualize\" class=\"pull-right btn btn-primary\" id=\"describe-proceed\">Visualize <i class=\"icon-chevron-right icon-white\"></i></a>
                <a class=\"btn\" href=\"upload\"><i class=\"icon-chevron-left\"></i> Back</a>
            </div>
        </div>
    </div>

    <div class=\"row\">
        <div class=\"span12\">


        </div>
    </div>
</div>


";
    }

    public function getTemplateName()
    {
        return "chart-describe.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
