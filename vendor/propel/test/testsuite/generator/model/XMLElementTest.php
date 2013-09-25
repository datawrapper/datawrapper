<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/model/XMLElement.php';

/**
 * @author William Durand <william.durand1@gmail.com>
 */
class XMLElementTest extends PHPUnit_Framework_TestCase
{
    /**
     * @dataProvider providerForGetDefaultValueForArray
     */
    public function testGetDefaultValueForArray($value, $expected)
    {
        $xmlElement = new TestableXmlElement();
        $this->assertEquals($expected, $xmlElement->getDefaultValueForArray($value));
    }

    public static function providerForGetDefaultValueForArray()
    {
        return array(
            array('', null),
            array(null, null),
            array('FOO', '||FOO||'),
            array('FOO, BAR', '||FOO | BAR||'),
            array('FOO , BAR', '||FOO | BAR||'),
            array('FOO,BAR', '||FOO | BAR||'),
            array(' ', null),
            array(', ', null),
        );
    }
}

class TestableXmlElement extends XMLElement
{
    public function getDefaultValueForArray($value)
    {
        return parent::getDefaultValueForArray($value);
    }

    public function appendXml(DOMNode $node)
    {
    }

    protected function setupObject()
    {
    }
}
