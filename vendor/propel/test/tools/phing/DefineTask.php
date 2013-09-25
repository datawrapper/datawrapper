<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once 'phing/Task.php';

/**
 * Defines a constant using PHP define() method.
 *
 * This is handy if you want to initialize a constant to a value that is available only as build properties.
 */
class DefineTask extends Task
{
    /**
     * @var        string
     */
    private $name;

    /**
     * @var        string
     */
    private $value;

    /**
     * Sets the name for the constant.
     * @param string $v
     */
    public function setName($v)
    {
        $this->name = $v;
    }

    /**
     * Sets the value for the constant.
     * @param string $v
     */
    public function setValue($v)
    {
        $this->value = $v;
    }

    public function main()
    {
        if (!isset($this->name) || !isset($this->value)) {
            throw new BuildException("Both name and value params are required.", $this->getLocation());
        }
        $const = strtoupper($this->name);
        if (defined($const)) {
             $this->log("The constant $const has already been defined!", Project::MSG_ERR);
        } else {
            define($const, $this->value);
            $this->log("Defined $const with value " . var_export($this->value, true), Project::MSG_INFO);
        }
    }
}
