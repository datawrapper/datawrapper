<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../../generator/lib/builder/util/StandardEnglishPluralizer.php';

/**
 * Tests for the StandardEnglishPluralizer class
 *
 * @version    $Revision$
 * @package    generator.builder.util
 */
class StandardEnglishPluralizerTest extends PHPUnit_Framework_TestCase
{
    public function getPluralFormDataProvider()
    {
        return array(
            array('', 's'),
            array('user', 'users'),
            array('users', 'userss'),
            array('User', 'Users'),
            array('sheep', 'sheep'),
            array('Sheep', 'Sheep'),
            array('wife', 'wives'),
            array('Wife', 'Wives'),
            array('country', 'countries'),
            array('Country', 'Countries'),
            array('Video', 'Videos'),
            array('video', 'videos'),
            array('Photo', 'Photos'),
            array('photo', 'photos'),
            array('Tomato', 'Tomatoes'),
            array('tomato', 'tomatoes'),
            array('Buffalo', 'Buffaloes'),
            array('buffalo', 'buffaloes'),
            array('typo', 'typos'),
            array('Typo', 'Typos'),
            array('apple', 'apples'),
            array('Apple', 'Apples'),
            array('Man', 'Men'),
            array('man', 'men'),
            array('numen', 'numina'),
            array('Numen', 'Numina'),
            array('bus', 'buses'),
            array('Bus', 'Buses'),
            array('news', 'news'),
            array('News', 'News'),
            array('food_menu', 'food_menus'),
            array('Food_menu', 'Food_menus'),
            array('quiz', 'quizzes'),
            array('Quiz', 'Quizzes'),
            array('alumnus', 'alumni'),
            array('Alumnus', 'Alumni'),
            array('vertex', 'vertices'),
            array('Vertex', 'Vertices'),
            array('matrix', 'matrices'),
            array('Matrix', 'Matrices'),
            array('index', 'indices'),
            array('Index', 'Indices'),
            array('alias', 'aliases'),
            array('Alias', 'Aliases'),
            array('bacillus', 'bacilli'),
            array('Bacillus', 'Bacilli'),
            array('cactus', 'cacti'),
            array('Cactus', 'Cacti'),
            array('focus', 'foci'),
            array('Focus', 'Foci'),
            array('fungus', 'fungi'),
            array('Fungus', 'Fungi'),
            array('nucleus', 'nuclei'),
            array('Nucleus', 'Nuclei'),
            array('radius', 'radii'),
            array('Radius', 'Radii'),
            array('people', 'people'),
            array('People', 'People'),
            array('glove', 'gloves'),
            array('Glove', 'Gloves'),
            array('crisis', 'crises'),
            array('Crisis', 'Crises'),
            array('tax', 'taxes'),
            array('Tax', 'Taxes'),
            array('Tooth', 'Teeth'),
            array('tooth', 'teeth'),
            array('Foot', 'Feet'),
        );
    }

    /**
     * @dataProvider getPluralFormDataProvider
     */
    public function testgetPluralForm($input, $output)
    {
        $pluralizer = new StandardEnglishPluralizer();
        $this->assertEquals($output, $pluralizer->getPluralForm($input));
    }
}
