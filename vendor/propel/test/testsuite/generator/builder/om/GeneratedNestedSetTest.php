<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/cms/CmsTestBase.php';

/**
 * Tests the generated nested-set Object classes.
 *
 * This test uses generated Bookstore-Cms classes to test the behavior of various
 * object operations.  The _idea_ here is to test every possible generated method
 * from Object.tpl; if necessary, bookstore will be expanded to accommodate this.
 *
 * The database is relaoded before every test and flushed after every test.  This
 * means that you can always rely on the contents of the databases being the same
 * for each test method in this class.  See the CmsDataPopulator::populate()
 * method for the exact contents of the database.
 *
 * @see        CmsDataPopulator
 * @package    generator.builder.om
 */
class GeneratedNestedSetTest extends CmsTestBase
{
    /**
     * A convenience method to dump the page rows.
     */
    private function showPageItems()
    {
        $tree = PagePeer::retrieveTree();
        $iterator = new RecursiveIteratorIterator($tree, RecursiveIteratorIterator::SELF_FIRST);

        foreach ($iterator as $item) { /* @var        $item Page */
            echo str_repeat('- ', $iterator->getDepth())
            , $item->getId() , ': '
            , $item->getTitle()
            , ' [', $item->getLeftValue(), ':', $item->getRightValue() , ']'
            . "\n";
        }
    }

    /**
     * Adds a new Page row with specified parent Id.
     *
     * @param int $parentId
     */
    protected function addNewChildPage($parentId)
    {
        $db = Propel::getConnection(PagePeer::DATABASE_NAME);

        //$db->beginTransaction();

        $parent = PagePeer::retrieveByPK($parentId);
        $page = new Page();
        $page->setTitle('new page '.time());
        $page->insertAsLastChildOf($parent);
        $page->save();

        //$db->commit();
    }

    /**
     * Asserts that the Page table tree integrity is intact.
     */
    protected function assertPageTreeIntegrity()
    {
        $db = Propel::getConnection(PagePeer::DATABASE_NAME);

        $values = array();
        $log = '';

        foreach ($db->query('SELECT Id, LeftChild, RightChild, Title FROM Page', PDO::FETCH_NUM) as $row) {

            list($id, $leftChild, $rightChild, $title) = $row;

            if (!in_array($leftChild, $values)) {
                $values[] = (int) $leftChild;
            } else {
                $this->fail('Duplicate LeftChild value '.$leftChild);
            }

            if (!in_array($rightChild, $values)) {
                $values[] = (int) $rightChild;
            } else {
                $this->fail('Duplicate RightChild value '.$rightChild);
            }

            $log .= "[$id($leftChild:$rightChild)]";
        }

        sort($values);

        if ($values[count($values)-1] != count($values)) {
            $message = sprintf("Tree integrity NOT ok (%s)\n", $log);
            $message .= sprintf('Integrity error: value count: %d, high value: %d', count($values), $values[count($values)-1]);
            $this->fail($message);
        }

    }

    /**
     * Tests adding a node to the Page tree.
     */
    public function testAdd()
    {
        $db = Propel::getConnection(PagePeer::DATABASE_NAME);

        // I'm not sure if the specific ID matters, but this should match original
        // code.  The ID will change with subsequent runs (e.g. the first time it will be 11)
        $startId = $db->query('SELECT MIN(Id) FROM Page')->fetchColumn();
        $this->addNewChildPage($startId + 10);
        $this->assertPageTreeIntegrity();
    }

}
