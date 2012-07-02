<?php

/* chart-upload.twig */
class __TwigTemplate_08fd87201ca734ba0df43a52eb29065a extends Twig_Template
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

<div class=\"dw-create-upload\">

    <script type=\"text/javascript\">

        \$(function() {

            function init() {
                \$('#demo-data').append('<li><a href=\"#\">Gini</a></li>');
            }

            function nextPage() {
                location.href = '/chart/'+DW.currentChart.get('id')+'/describe';
            }

            \$('#upload-data').click(function() {
                DW.currentChart.set('metadata.data.source', 'clipboard');
                \$.ajax({
                    url: '/api/charts/' + DW.currentChart.get('id') + '/data',
                    type: 'PUT',
                    data: \$('#upload-data-text').val(),
                    processData: false,
                    dataType: 'json',
                    success: function(result) {
                        if (result.status == \"ok\") {
                            // data is saved correctly, so proceed
                            nextPage();
                        } else {
                            alert(result.message);
                        }
                    }
                });
                return false;
            });

        });
    </script>

    <div class=\"row\">
        <div class=\"span7\">
            <h3>Upload Your Data..</h3>

             <form class=\"well\">
                <textarea id=\"upload-data-text\" placeholder=\"copy &amp; paste your data here\">";
        // line 49
        if (isset($context["chartData"])) { $_chartData_ = $context["chartData"]; } else { $_chartData_ = null; }
        echo twig_escape_filter($this->env, $_chartData_, "html", null, true);
        echo "</textarea>

                <a id=\"upload-data\" class=\"btn btn-primary pull-right\" href=\"#\">Upload and continue <i class=\"icon-chevron-right icon-white\"></i></a>
                <button class=\"btn\"><i class=\"icon-upload\"></i>..or pick a file from your disk</button> <span class=\"label\">Not Implemented</span>
                <br style=\"clear:both;margin:0\" />
            </form>

        </div>

        <div class=\"span5\">
            <h3>Help</h3>
            <p>We want to make getting data into Datawrapper as easy as possible. If you're working in Excel or OpenOffice, just select your data (including header row/column) and paste it in the following text field.</p>

            <p><a href=\"/xhr/docs/upload\" data-toggle=\"modal\">Learn more about how to upload your data</a>.</p>

            <p>If you simply want to play around with Datawrapper, you can use one of the following example datasets:
                <ul id=\"demo-datasets\" class=\"\">
                    ";
        // line 66
        if (isset($context["datasets"])) { $_datasets_ = $context["datasets"]; } else { $_datasets_ = null; }
        $context['_parent'] = (array) $context;
        $context['_seq'] = twig_ensure_traversable($_datasets_);
        foreach ($context['_seq'] as $context["_key"] => $context["dataset"]) {
            // line 67
            echo "                    <li><a href=\"#";
            if (isset($context["dataset"])) { $_dataset_ = $context["dataset"]; } else { $_dataset_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_dataset_, "id"), "html", null, true);
            echo "\" class=\"demo-dataset\" data-data=\"";
            if (isset($context["dataset"])) { $_dataset_ = $context["dataset"]; } else { $_dataset_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_dataset_, "data"), "html", null, true);
            echo "\">";
            if (isset($context["dataset"])) { $_dataset_ = $context["dataset"]; } else { $_dataset_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_dataset_, "title"), "html", null, true);
            echo "</a></li>
                    ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['dataset'], $context['_parent'], $context['loop']);
        $context = array_merge($_parent, array_intersect_key($context, $_parent));
        // line 69
        echo "                </ul>
                <script type=\"text/javascript\">

                \$(function() {

                    \$('.demo-dataset').click(function(evt) {
                        var a = \$(evt.target);
                        \$('#upload-data-text').val(a.data('data'));
                        return false;
                    });
                });

                </script>
            </p>
        </div>

        <div class=\"span4 inactive\">

        </div>
        ";
        // line 120
        echo "
    </div>


</div>

";
    }

    public function getTemplateName()
    {
        return "chart-upload.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  142 => 120,  121 => 69,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 61,  74 => 32,  59 => 24,  50 => 19,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 21,  75 => 17,  66 => 16,  58 => 15,  48 => 14,  42 => 12,  34 => 10,  24 => 2,  18 => 1,  101 => 56,  95 => 53,  45 => 13,  39 => 11,  19 => 55,  12 => 52,  110 => 61,  105 => 67,  99 => 24,  86 => 40,  79 => 49,  72 => 10,  63 => 9,  53 => 20,  38 => 7,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
