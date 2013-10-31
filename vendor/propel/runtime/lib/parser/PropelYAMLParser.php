<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

if (!class_exists('sfYaml')) {
    require_once dirname(__FILE__) . '/yaml/sfYaml.php';
}

/**
 * YAML parser. Converts data between associative array and YAML formats
 *
 * @author     Francois Zaninotto
 * @package    propel.runtime.parser
 */
class PropelYAMLParser extends PropelParser
{

    /**
     * Converts data from an associative array to YAML.
     *
     * @param  array  $array Source data to convert
     * @return string Converted data, as a YAML string
     */
    public function fromArray($array)
    {
        return sfYaml::dump($array, 3);
    }

    /**
     * Alias for PropelYAMLParser::fromArray()
     *
     * @param  array  $array Source data to convert
     * @return string Converted data, as a YAML string
     */
    public function toYAML($array)
    {
        return $this->fromArray($array);
    }

    /**
     * Converts data from YAML to an associative array.
     *
     * @param  string $data Source data to convert, as a YAML string
     * @return array  Converted data
     */
    public function toArray($data)
    {
        return sfYaml::load($data);
    }

    /**
     * Alias for PropelYAMLParser::toArray()
     *
     * @param  string $data Source data to convert, as a YAML string
     * @return array  Converted data
     */
    public function fromYAML($data)
    {
        return $this->toArray($data);
    }

}
