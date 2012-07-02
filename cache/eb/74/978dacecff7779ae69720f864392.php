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
        return array (  132 => 105,  211 => 94,  165 => 50,  149 => 48,  144 => 47,  136 => 41,  120 => 39,  115 => 38,  107 => 32,  91 => 30,  86 => 29,  77 => 22,  66 => 18,  53 => 16,  40 => 9,  35 => 8,  29 => 4,  26 => 3,  27 => 6,  21 => 3,  17 => 1,  105 => 36,  96 => 31,  89 => 26,  83 => 23,  79 => 22,  75 => 21,  71 => 20,  67 => 19,  61 => 17,  52 => 10,  47 => 14,  41 => 4,  38 => 3,  12 => 30,);
    }
}
