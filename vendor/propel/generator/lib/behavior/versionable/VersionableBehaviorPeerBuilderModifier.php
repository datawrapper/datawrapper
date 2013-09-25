<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Behavior to add versionable columns and abilities
 *
 * @author     François Zaninotto
 * @package    propel.generator.behavior.versionable
 */
class VersionableBehaviorPeerBuilderModifier
{
    public function staticAttributes()
    {
        return "
/**
 * Whether the versioning is enabled
 */
static \$isVersioningEnabled = true;
";
    }

    public function staticMethods()
    {
        $script = '';
        $this->addIsVersioningEnabled($script);
        $this->addEnableVersioning($script);
        $this->addDisableVersioning($script);

        return $script;
    }

    public function addIsVersioningEnabled(&$script)
    {
        $script .= "
/**
 * Checks whether versioning is enabled
 *
 * @return boolean
 */
public static function isVersioningEnabled()
{
    return self::\$isVersioningEnabled;
}
";
    }

    public function addEnableVersioning(&$script)
    {
        $script .= "
/**
 * Enables versioning
 */
public static function enableVersioning()
{
    self::\$isVersioningEnabled = true;
}
";
    }

    public function addDisableVersioning(&$script)
    {
        $script .= "
/**
 * Disables versioning
 */
public static function disableVersioning()
{
    self::\$isVersioningEnabled = false;
}
";
    }
}
