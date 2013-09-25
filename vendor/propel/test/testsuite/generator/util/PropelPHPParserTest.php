<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../generator/lib/util/PropelPHPParser.php';

/**
 *
 * @package    generator.util
 */
class PropelPHPParserTest extends PHPUnit_Framework_TestCase
{
    public function basicClassCodeProvider()
    {
        $code = <<<EOF
<?php
class Foo
{
    public function bar1()
    {
        // this is bar1
    }

    protected \$bar2;

    public function bar2()
    {
        // this is bar2
    }

    /**
     * This is the bar3 method
     */
    public function bar3()
    {
        // this is bar3
    }

    public function bar4()
    {
        // this is bar4 with a curly brace }
        echo '}';
    }
}
EOF;

        return array(array($code));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testFindMethodNotExistsReturnsFalse($code)
    {
        $parser = new PropelPHPParser($code);
        $this->assertFalse($parser->findMethod('foo'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testFindMethodNReturnsMethod($code)
    {
        $parser = new PropelPHPParser($code);
        $expected = <<<EOF

    public function bar1()
    {
        // this is bar1
    }
EOF;
        $this->assertEquals($expected, $parser->findMethod('bar1'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testFindMethodPrecededByAttribute($code)
    {
        $parser = new PropelPHPParser($code);
        $expected = <<<EOF


    public function bar2()
    {
        // this is bar2
    }
EOF;
        $this->assertEquals($expected, $parser->findMethod('bar2'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testFindMethodPrecededByComment($code)
    {
        $parser = new PropelPHPParser($code);
        $expected = <<<EOF


    /**
     * This is the bar3 method
     */
    public function bar3()
    {
        // this is bar3
    }
EOF;
        $this->assertEquals($expected, $parser->findMethod('bar3'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testFindMethodWithWrongCurlyBraces($code)
    {
        $parser = new PropelPHPParser($code);
        $expected = <<<EOF


    public function bar4()
    {
        // this is bar4 with a curly brace }
        echo '}';
    }
EOF;
        $this->assertEquals($expected, $parser->findMethod('bar4'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testRemoveMethodNotExistsReturnsFalse($code)
    {
        $parser = new PropelPHPParser($code);
        $this->assertFalse($parser->removeMethod('foo'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testRemoveMethodReturnsMethod($code)
    {
        $parser = new PropelPHPParser($code);
        $expected = <<<EOF

    public function bar1()
    {
        // this is bar1
    }
EOF;
        $this->assertEquals($expected, $parser->removeMethod('bar1'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testRemoveMethodRemovesMethod($code)
    {
        $parser = new PropelPHPParser($code);
        $parser->removeMethod('bar1');
        $expected = <<<EOF
<?php
class Foo
{

    protected \$bar2;

    public function bar2()
    {
        // this is bar2
    }

    /**
     * This is the bar3 method
     */
    public function bar3()
    {
        // this is bar3
    }

    public function bar4()
    {
        // this is bar4 with a curly brace }
        echo '}';
    }
}
EOF;
        $this->assertEquals($expected, $parser->getCode());
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testReplaceMethodNotExistsReturnsFalse($code)
    {
        $parser = new PropelPHPParser($code);
        $this->assertFalse($parser->replaceMethod('foo', '// foo'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testReplaceMethodReturnsMethod($code)
    {
        $parser = new PropelPHPParser($code);
        $expected = <<<EOF

    public function bar1()
    {
        // this is bar1
    }
EOF;
        $this->assertEquals($expected, $parser->replaceMethod('bar1', '// foo'));
    }

    /**
     * @dataProvider basicClassCodeProvider
     */
    public function testReplaceMethodReplacesMethod($code)
    {
        $parser = new PropelPHPParser($code);
        $newCode = <<<EOF

    public function bar1prime()
    {
        // yep, I've been replaced
        echo 'bar';
    }
EOF;
        $parser->replaceMethod('bar1', $newCode);
        $expected = <<<EOF
<?php
class Foo
{
    public function bar1prime()
    {
        // yep, I've been replaced
        echo 'bar';
    }

    protected \$bar2;

    public function bar2()
    {
        // this is bar2
    }

    /**
     * This is the bar3 method
     */
    public function bar3()
    {
        // this is bar3
    }

    public function bar4()
    {
        // this is bar4 with a curly brace }
        echo '}';
    }
}
EOF;
        $this->assertEquals($expected, $parser->getCode());
    }
}
