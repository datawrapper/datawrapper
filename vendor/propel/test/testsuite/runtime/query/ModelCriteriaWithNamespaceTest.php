<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/namespaces/NamespacesTestBase.php';

/**
 * Test class for ModelCriteria with namespaces.
 *
 * @author     Pierre-Yves LEBECQ <py.lebecq@gmail.com>
 * @package    runtime.query
 */
class ModelCriteriaWithNamespaceTest extends NamespacesTestBase
{
    public static function conditionsForTestReplaceNamesWithNamespaces()
    {
        return array(
            array('Foo\\Bar\\NamespacedBook.Title = ?', 'Title', 'book.title = ?'), // basic case
            array('Foo\\Bar\\NamespacedBook.Title=?', 'Title', 'book.title=?'), // without spaces
            array('Foo\\Bar\\NamespacedBook.Id<= ?', 'Id', 'book.id<= ?'), // with non-equal comparator
            array('Foo\\Bar\\NamespacedBook.AuthorId LIKE ?', 'AuthorId', 'book.author_id LIKE ?'), // with SQL keyword separator
            array('(Foo\\Bar\\NamespacedBook.AuthorId) LIKE ?', 'AuthorId', '(book.author_id) LIKE ?'), // with parenthesis
            array('(Foo\\Bar\\NamespacedBook.Id*1.5)=1', 'Id', '(book.id*1.5)=1'), // ignore numbers
            // dealing with quotes
            array("Foo\\Bar\\NamespacedBook.Id + ' ' + Foo\\Bar\\NamespacedBook.AuthorId", null, "book.id + ' ' + book.author_id"),
            array("'Foo\\Bar\\NamespacedBook.Id' + Foo\\Bar\\NamespacedBook.AuthorId", null, "'Foo\\Bar\\NamespacedBook.Id' + book.author_id"),
            array("Foo\\Bar\\NamespacedBook.Id + 'Foo\\Bar\\NamespacedBook.AuthorId'", null, "book.id + 'Foo\\Bar\\NamespacedBook.AuthorId'"),
        );
    }

    /**
     * @dataProvider conditionsForTestReplaceNamesWithNamespaces
     */
    public function testReplaceNamesWithNamespaces($origClause, $columnPhpName = false, $modifiedClause)
    {
        $c = new TestableModelCriteriaWithNamespace('bookstore_namespaced', 'Foo\\Bar\\NamespacedBook');
        $this->doTestReplaceNames($c, Foo\Bar\NamespacedBookPeer::getTableMap(),  $origClause, $columnPhpName = false, $modifiedClause);
    }

    public function doTestReplaceNames($c, $tableMap, $origClause, $columnPhpName = false, $modifiedClause)
    {
        $c->replaceNames($origClause);
        $columns = $c->replacedColumns;
        if ($columnPhpName) {
            $this->assertEquals(array($tableMap->getColumnByPhpName($columnPhpName)), $columns);
        }
        $this->assertEquals($modifiedClause, $origClause);
    }

}

class TestableModelCriteriaWithNamespace extends ModelCriteria
{
    public $joins = array();

    public function replaceNames(&$clause)
    {
        return parent::replaceNames($clause);
    }
}
