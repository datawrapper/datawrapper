<?php

/* chart-publish.twig */
class __TwigTemplate_2ba69c3c9908c1143e68adb40de6210d extends Twig_Template
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

    DW.currentChart.sync('#make-public', 'showInGallery');

});

</script>

<div class=\"dw-create-publish\">
    <div class=\"row\">
        <div class=\"span4\">

            ";
        // line 19
        if (isset($context["user"])) { $_user_ = $context["user"]; } else { $_user_ = null; }
        if ($this->getAttribute($_user_, "isAbleToPublish")) {
            // line 20
            echo "
            <p>Congrats, you made it! Now is the time to check back everything. You can return to the previous steps.</p>

            <h3>Link to this visualisation</h3>
            <p><a href=\"http://datawrapper.de/chart/";
            // line 24
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
            echo "\">http://datawrapper.de/chart/";
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
            echo "</a></p>

            <h3>Embed into your website</h3>
            <p>Just copy &amp; paste the following code into your website.</p>
            <form class=\"form-inline\">
                <label>Width: <input type=\"text\" class=\"input-small\" style=\"width:4ex\" value=\"600\" /> px</label>&nbsp;&nbsp;
                <label>Height: <input type=\"text\" class=\"input-small\" style=\"width:4ex\" value=\"400\" /> px</label>

            <textarea id=\"iframe-code\" class=\"span4\" rows=\"5\"><iframe src=\"/chart/";
            // line 32
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
            echo "/preview\" frameborder=\"0\" scrolling=\"no\" allowtransparency=\"true\" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen width=\"600\" height=\"400\"></iframe></textarea>

             <h3>Make it public</h3>
             <p>You can show some love to Datawrapper by agreeing to show your visualisation in our <a href=\"gallery.html\">public gallery</a>. Absolutely optional :)</p>

             <label class=\"checkbox\"><input type=\"checkbox\" id=\"make-public\" /> Yes, make it public!</label>

            ";
        } elseif (($this->getAttribute($_user_, "role") == "guest")) {
            // line 40
            echo "
            <h3>Congrats, you created your first chart!</h3>

            <p>Now, to be able to embed the chart, we ask you to create an account. It's free and all you need is a valid email address. The chart you just created will be transfered to your new account.</p>

            <h3>Sign Up</h3>

            <div class=\"signup-form form-vertcal\">
                <div class=\"control-group\">
                    <input id=\"register-email\" type=\"text\" class=\"input-xlarge span2\" placeholder=\"email\" />
                </div>
                <div class=\"control-group\">
                    <input id=\"register-pwd\" type=\"password\" class=\"input-xlarge span2\" placeholder=\"password\" />
                </div>
                <div class=\"control-group\">
                    <input id=\"register-pwd-2\" type=\"password\" class=\"input-xlarge span2\" placeholder=\"repeat password\" />
                </div>
                <a id=\"btn-register\" class=\"btn btn-large\"><i class=\"icon-pencil\"></i> Sign Up</a>
            </div>

            ";
        } elseif (($this->getAttribute($_user_, "role") == "pending")) {
            // line 61
            echo "
            <h3>Congrats, you created a chart!</h3>

            <p>The chart is accessible under <a href=\"";
            // line 64
            if (isset($context["DW_DOMAIN"])) { $_DW_DOMAIN_ = $context["DW_DOMAIN"]; } else { $_DW_DOMAIN_ = null; }
            echo twig_escape_filter($this->env, $_DW_DOMAIN_, "html", null, true);
            echo "/chart/";
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
            echo "/edit\">";
            if (isset($context["DW_DOMAIN"])) { $_DW_DOMAIN_ = $context["DW_DOMAIN"]; } else { $_DW_DOMAIN_ = null; }
            echo twig_escape_filter($this->env, $_DW_DOMAIN_, "html", null, true);
            echo "/chart/";
            if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
            echo "/edit</a> or via your <a href=\"/mycharts\">My Charts</a> page.

            <p>Now, to be able to publish and embed this chart into other websites, you need to activate the email address you entered during sign up process.</p>

            <p>If you did not get any email within 5 minutes, here's the trouble shooting guide:</p>
            <ol>
                <li>At first, don't worry. Everything you created will wait patiently</li>
                <li>Make sure that your spam filter didn't catch our activation email. They are sent from activate@";
            // line 71
            if (isset($context["DW_DOMAIN"])) { $_DW_DOMAIN_ = $context["DW_DOMAIN"]; } else { $_DW_DOMAIN_ = null; }
            echo twig_escape_filter($this->env, $_DW_DOMAIN_, "html", null, true);
            echo ".</li>
                <li>Of course, you can also let us <a href=\"#resend\">resend the activation email</a>. (TODO)</li>
                <li>If that didn't work either, please contact our support</li>
            </ol>

            ";
        } else {
            // line 77
            echo "
            ";
            // line 78
            if (isset($context["user"])) { $_user_ = $context["user"]; } else { $_user_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_user_, "role"), "html", null, true);
            echo "

            ";
        }
        // line 81
        echo "        </div>
        <div class=\"span8\">
            <iframe src=\"/chart/";
        // line 83
        if (isset($context["chart"])) { $_chart_ = $context["chart"]; } else { $_chart_ = null; }
        echo twig_escape_filter($this->env, $this->getAttribute($_chart_, "id"), "html", null, true);
        echo "/preview\" id=\"iframe-vis\" style=\"width:100%;height:500px\"></iframe>
        </div>
    </div>

    <div class=\"row\">
        <div class=\"span12\">
            <div class=\"form-actions\">
                <a class=\"pull-right btn\" href=\"create.html\"><i class=\"icon-pencil\"></i> Create another graphic</a>
                <a class=\" btn \" href=\"describe.html\"><i class=\"icon-chevron-left\"></i> Return to visualise step</a>
            </div>
        </div>
    </div>
</div>


";
    }

    public function getTemplateName()
    {
        return "chart-publish.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 61,  74 => 32,  59 => 24,  50 => 19,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 21,  75 => 17,  66 => 16,  58 => 15,  48 => 14,  42 => 12,  34 => 10,  24 => 2,  18 => 1,  101 => 56,  95 => 53,  45 => 13,  39 => 11,  19 => 55,  12 => 52,  110 => 61,  105 => 26,  99 => 24,  86 => 40,  79 => 11,  72 => 10,  63 => 9,  53 => 20,  38 => 7,  33 => 6,  163 => 139,  47 => 18,  32 => 4,  29 => 3,  26 => 2,);
    }
}
