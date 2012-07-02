<?php

/* home-login.twig */
class __TwigTemplate_e5172ae359cfbebbf17a7718f6a93df1 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'homelogin' => array($this, 'block_homelogin'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        $this->displayBlock('homelogin', $context, $blocks);
    }

    public function block_homelogin($context, array $blocks = array())
    {
        // line 2
        echo "
    ";
        // line 3
        if (isset($context["alert"])) { $_alert_ = $context["alert"]; } else { $_alert_ = null; }
        if ($_alert_) {
            // line 4
            echo "        <div class=\"alert alert-";
            if (isset($context["alert"])) { $_alert_ = $context["alert"]; } else { $_alert_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_alert_, "type"), "html", null, true);
            echo "\">
            <a class=\"close\" data-dismiss=\"alert\" href=\"#\">&times;</a>
            <div>";
            // line 6
            if (isset($context["alert"])) { $_alert_ = $context["alert"]; } else { $_alert_ = null; }
            echo twig_escape_filter($this->env, $this->getAttribute($_alert_, "message"), "html", null, true);
            echo "</div>
        </div>
    ";
        }
        // line 9
        echo "
        ";
        // line 10
        if (isset($context["user"])) { $_user_ = $context["user"]; } else { $_user_ = null; }
        if ((!$this->getAttribute($_user_, "isLoggedIn"))) {
            // line 11
            echo "            <div class=\"well clearfix\">
                <h3>Login / Sign Up</h3>
                <div class=\"login-form form-vertical\">
                    <input class=\"login-email input-large\" type=\"text\" value=\"\" placeholder=\"email\" />
                    <input class=\"login-pwd input-large\" type=\"password\" value=\"\" placeholder=\"password\" /><br />
                    <p class=\"pull-right\" style=\"margin-bottom:0\"><a class=\"btn btn-primary btn-large btn-login\"><i class=\"icon-user icon-white\"></i> Login</a>
                    <span style=\"padding:0 1ex\">or</span> <a href=\"#login\" class=\"btn btn-large\"><i class=\"icon-pencil\"></i> Sign Up</a></p>
                </div>
            </div>
            <p>Not convinced, yet?</p>
            <p>
            <a href=\"/chart/create\"><big><i class=\"icon-chevron-right\"></i> Try Datawrapper now!</a></big></p>
        ";
        } else {
            // line 24
            echo "            <div class=\"well\">
                <h3>Welcome, back!</h3>
                <ul class=\"unstyled link-list\">
                    <li><h3><a href=\"/mycharts\"><i class=\"icon-signal\"></i> My Charts</a><br /><small>See what you've wrapped so far..</small></h3></li>
                    <li><h3><a href=\"/chart/create\"><i class=\"icon-pencil\"></i> Create New Chart</a><br /><small>See what you've wrapped so far..</small></h3></li>
                    <li><h3><a href=\"/account/settings\"><i class=\"icon-cog\"></i> Settings</a><br /><small>Change E-Mail, Password, etc.</small></h3></li>
                    <li><h3><a href=\"#logout\"><i class=\"icon-off\"></i> Logout</a></h3></li>
                </ul>
            </div>

            <p></p>
        ";
        }
        // line 36
        echo "
";
    }

    public function getTemplateName()
    {
        return "home-login.twig";
    }

    public function getDebugInfo()
    {
        return array (  37 => 6,  30 => 4,  27 => 3,  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 31,  77 => 27,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 29,  115 => 42,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 24,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 9,  41 => 3,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 77,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 11,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 29,  75 => 29,  66 => 16,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 179,  110 => 61,  105 => 44,  99 => 24,  86 => 40,  79 => 36,  72 => 24,  63 => 9,  53 => 18,  38 => 2,  33 => 6,  163 => 139,  47 => 10,  32 => 5,  29 => 4,  26 => 3,);
    }
}
