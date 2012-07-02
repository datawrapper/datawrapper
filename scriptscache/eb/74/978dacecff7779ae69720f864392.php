<?php

/* settings.twig */
class __TwigTemplate_eb74978dacecff7779ae69720f864392 extends Twig_Template
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
<span class=\"label\">The settings page is not implemented yet</span>

<div class=\"row\">

    <div class=\"span6\">
        <div class=\"form-horizontal\">
            <fieldset>
                <legend>Account Settings</legend>

                <div class=\"control-group\">
                    <label class=\"control-label\" for=\"input01\">E-Mail</label>
                    <div class=\"controls\">
                        <input type=\"text\" class=\"input-xlarge\" id=\"input01\">
                        <p class=\"help-block\">This is the email address which you used to sign up. If you change your email, you will be asked to verify it again.</p>
                    </div>
                </div>
                <div class=\"control-group\">
                    <label class=\"control-label\" for=\"input01\">Password</label>
                    <div class=\"controls\">
                        <input type=\"text\" class=\"input-xlarge\" id=\"input01\">
                    </div>
                </div>
                <div class=\"control-group\">
                    <label class=\"control-label\" for=\"input01\">Password (repeat)</label>
                    <div class=\"controls\">
                        <input type=\"text\" class=\"input-xlarge\" id=\"input01\">
                        <p class=\"help-block\">Just leave the password fields blank if you don't want to change your password.</p>
                    </div>
                </div>

                <div class=\"form-actions\">
                    <button class=\"btn btn-primary\" type=\"submit\">Save changes</button>
                    <button class=\"btn\">Undo changes</button>
                </div>
            </fieldset>

        </div>

    </div>
    <div class=\"span6\">
        <div class=\"form-horizontal\">
            <fieldset>
                <legend>User Profile</legend>

                <div class=\"control-group\">
                    <label class=\"control-label\" for=\"input01\">Name</label>
                    <div class=\"controls\">
                        <input type=\"text\" class=\"input-xlarge\" id=\"input01\" placeholder=\"\">
                        <p class=\"help-block\">Filling out your profile is optional. If you do, you can display these information below the charts you publish.</p>
                    </div>
                </div>

                <div class=\"control-group\">
                    <label class=\"control-label\" for=\"input01\">Website</label>
                    <div class=\"controls\">
                        <input type=\"text\" class=\"input-xlarge\" id=\"input01\" placeholder=\"http://\">
                        <p class=\"help-block\">Add a website that contains more information about you (e.g. your blog). Optionally you can display these information below you published charts.</p>
                    </div>
                </div>
                <div class=\"control-group\">
                    <label class=\"control-label\" for=\"input01\">Twitter</label>
                    <div class=\"controls\">
                        <input type=\"text\" class=\"input-xlarge\" id=\"input01\">
                        <p class=\"help-block\">Enter your Twitter-Name, if you like.</p>
                    </div>
                </div>
                <div class=\"control-group\">
                    <label class=\"control-label\" for=\"input01\">Password (repeat)</label>
                    <div class=\"controls\">
                        <input type=\"text\" class=\"input-xlarge\" id=\"input01\">
                        <p class=\"help-block\">Just leave the password fields blank if you don't want to change your password.</p>
                    </div>
                </div>

                <div class=\"form-actions\">
                    <button class=\"btn btn-primary\" type=\"submit\">Save changes</button>
                    <button class=\"btn\">Undo changes</button>
                </div>
            </fieldset>

        </div>

    </div>
</div>
<div class=\"row\">
    <div class=\"span6\">
        <div class=\"form-horizontal\" style=\"margin-top:4em\">
             <fieldset>
                <legend>Delete Datawrapper Account</legend>

                        <p>This will remove your Datawrapper account and all the charts you created so far. They won't be visible in places where you embedded them.</p>
                        <button class=\"btn btn-danger\">Yes, delete my account!</button>

             </fieldset>
            
            <p></p>
        </div>
    </div>
</div>

";
        // line 105
        $this->displayParentBlock("content", $context, $blocks);
        echo "
";
    }

    public function getTemplateName()
    {
        return "settings.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  132 => 105,  211 => 94,  165 => 50,  149 => 48,  136 => 41,  107 => 32,  91 => 30,  40 => 9,  35 => 8,  21 => 3,  96 => 31,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  37 => 6,  30 => 4,  27 => 6,  112 => 41,  93 => 31,  70 => 28,  36 => 9,  25 => 5,  125 => 49,  118 => 47,  113 => 46,  89 => 26,  77 => 22,  57 => 21,  54 => 20,  22 => 4,  17 => 1,  160 => 38,  153 => 36,  146 => 34,  141 => 31,  120 => 39,  115 => 38,  106 => 38,  103 => 37,  97 => 21,  84 => 19,  65 => 24,  62 => 22,  28 => 4,  344 => 185,  335 => 180,  323 => 169,  309 => 161,  298 => 159,  294 => 157,  289 => 153,  276 => 151,  270 => 150,  256 => 143,  245 => 141,  241 => 139,  231 => 134,  222 => 133,  219 => 132,  209 => 123,  196 => 121,  191 => 120,  183 => 114,  169 => 112,  162 => 111,  73 => 26,  55 => 12,  44 => 9,  41 => 4,  142 => 120,  121 => 48,  100 => 66,  158 => 83,  154 => 81,  147 => 78,  144 => 47,  134 => 71,  109 => 45,  74 => 17,  59 => 20,  50 => 11,  164 => 39,  157 => 37,  148 => 32,  139 => 31,  126 => 30,  117 => 29,  114 => 64,  108 => 24,  88 => 22,  83 => 23,  75 => 21,  66 => 18,  58 => 15,  48 => 10,  42 => 11,  34 => 6,  24 => 2,  18 => 1,  101 => 36,  95 => 53,  45 => 9,  39 => 7,  19 => 55,  12 => 30,  110 => 61,  105 => 36,  99 => 24,  86 => 29,  79 => 22,  72 => 24,  63 => 9,  53 => 16,  38 => 3,  33 => 6,  163 => 139,  47 => 14,  32 => 5,  29 => 4,  26 => 3,);
    }
}
