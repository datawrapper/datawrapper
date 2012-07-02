<?php

/* login.twig */
class __TwigTemplate_024e73a840f3f2616622bd28101de0e2 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'login' => array($this, 'block_login'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        $this->displayBlock('login', $context, $blocks);
    }

    public function block_login($context, array $blocks = array())
    {
        // line 2
        echo "
    <div class=\"modal hide\" id=\"dwLoginForm\">
        <!--<div class=\"modal-header\">
            <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>
            <h2>&nbsp;</h2>
        </div>-->
        <div class=\"modal-body\">
            <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>
            <div class=\"row\">
                <div class=\"span3\">
                    <h3>Login</h3>

                    <p>We're glad to see you again. Login to access your charts, and create new ones.</p>

                    <div class=\"login-form form-vertical\">
                        <input class=\"login-email\" type=\"text\" class=\"input-xxlarge span3\" value=\"\" placeholder=\"email\" />
                        <input class=\"login-pwd\" type=\"password\" class=\"input-xxlarge span3\" value=\"\" placeholder=\"password\" /><br />
                        <a class=\"btn btn-login btn-primary btn-large\"><i class=\"icon-user icon-white\"></i> Login</a>
                    </div>
                     <hr />
                     <a id=\"forgot-password\">Can't recall your Password?</a>

                </div>
                <div class=\"span3\">
                    <h3>Create a new account</h3>
                    <p>Datawrapper is 100% free and creating an account takes less than a minute. Just enter your email and pick a password, and you're done!</p>
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

                </div>
            </div>
        </div>
        <!--<div class=\"modal-footer\">
            <a href=\"#\" class=\"btn\" data-dismiss=\"modal\">Close</a>
            <a href=\"#\" class=\"btn btn-primary\">Save changes</a>
        </div>-->
    </div>

";
    }

    public function getTemplateName()
    {
        return "login.twig";
    }

    public function getDebugInfo()
    {
        return array (  24 => 2,  18 => 1,  101 => 56,  95 => 53,  45 => 5,  39 => 1,  19 => 55,  12 => 52,  110 => 61,  105 => 26,  99 => 24,  86 => 13,  79 => 11,  72 => 10,  63 => 9,  53 => 8,  38 => 7,  33 => 6,  163 => 139,  47 => 18,  32 => 5,  29 => 4,  26 => 3,);
    }
}
