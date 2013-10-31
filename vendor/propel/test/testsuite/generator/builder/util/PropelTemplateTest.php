<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/builder/util/PropelTemplate.php';

/**
 * Tests for PropelTemplate class
 *
 * @version    $Revision$
 * @package    generator.builder.util
 */
class PropelTemplateTest extends PHPUnit_Framework_TestCase
{
    public function testRenderStringNoParam()
    {
        $t = new PropelTemplate();
        $t->setTemplate('Hello, <?php echo 1 + 2 ?>');
        $res = $t->render();
        $this->assertEquals('Hello, 3', $res);
    }

    public function testRenderStringOneParam()
    {
        $t = new PropelTemplate();
        $t->setTemplate('Hello, <?php echo $name ?>');
        $res = $t->render(array('name' => 'John'));
        $this->assertEquals('Hello, John', $res);
    }

    public function testRenderStringParams()
    {
        $time = time();
        $t = new PropelTemplate();
        $t->setTemplate('Hello, <?php echo $name ?>, it is <?php echo $time ?> to go!');
        $res = $t->render(array('name' => 'John', 'time' => $time));
        $this->assertEquals('Hello, John, it is ' . $time . ' to go!', $res);
    }

    public function testRenderFile()
    {
        $t = new PropelTemplate();
        $t->setTemplateFile(dirname(__FILE__).'/template.php');
        $res = $t->render(array('name' => 'John'));
        $this->assertEquals('Hello, John', $res);
    }
}
