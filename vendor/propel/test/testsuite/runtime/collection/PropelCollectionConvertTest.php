<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Test class for PropelCollection.
 *
 * @author     Francois Zaninotto
 * @version    $Id: PropelCollectionTest.php 1348 2009-12-03 21:49:00Z francois $
 * @package    runtime.collection
 */
class PropelCollectionConvertTest extends BookstoreTestBase
{
    protected function setUp()
    {
        parent::setUp();
        $book1 = new Book();
        $book1->setId(9012);
        $book1->setTitle('Don Juan');
        $book1->setISBN('0140422161');
        $book1->setPrice(12.99);
        $book1->setAuthorId(5678);
        $book1->setPublisherId(1234);
        $book1->resetModified();
        $book2 = new Book();
        $book2->setId(58);
        $book2->setTitle('Harry Potter and the Order of the Phoenix');
        $book2->setISBN('043935806X');
        $book2->setPrice(10.99);
        $book2->resetModified();

        $this->coll = new PropelObjectCollection();
        $this->coll->setModel('Book');
        $this->coll[]= $book1;
        $this->coll[]= $book2;
    }

    public function toXmlDataProvider()
    {
        $expected = <<<EOF
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <Book>
    <Id>9012</Id>
    <Title><![CDATA[Don Juan]]></Title>
    <ISBN><![CDATA[0140422161]]></ISBN>
    <Price>12.99</Price>
    <PublisherId>1234</PublisherId>
    <AuthorId>5678</AuthorId>
  </Book>
  <Book>
    <Id>58</Id>
    <Title><![CDATA[Harry Potter and the Order of the Phoenix]]></Title>
    <ISBN><![CDATA[043935806X]]></ISBN>
    <Price>10.99</Price>
    <PublisherId></PublisherId>
    <AuthorId></AuthorId>
  </Book>
</data>

EOF;

        return array(array($expected));
    }

    /**
     * @dataProvider toXmlDataProvider
     */
    public function testToXML($expected)
    {
        $this->assertEquals($expected, $this->coll->toXML());
    }

    /**
     * @dataProvider toXmlDataProvider
     */
    public function testFromXML($expected)
    {
        $coll = new PropelObjectCollection();
        $coll->setModel('Book');
        $coll->fromXML($expected);
        // fix modified columns order
        foreach ($coll as $book) {
            $book->resetModified();
        }

        $this->assertEquals($this->coll, $coll);
    }

    public function toYamlDataProvider()
    {
        $expected = <<<EOF
Book_0:
  Id: 9012
  Title: 'Don Juan'
  ISBN: '0140422161'
  Price: 12.99
  PublisherId: 1234
  AuthorId: 5678
Book_1:
  Id: 58
  Title: 'Harry Potter and the Order of the Phoenix'
  ISBN: 043935806X
  Price: 10.99
  PublisherId: null
  AuthorId: null

EOF;

        return array(array($expected));
    }

    /**
     * @dataProvider toYamlDataProvider
     */
    public function testToYAML($expected)
    {
        $this->assertEquals($expected, $this->coll->toYAML());
    }

    /**
     * @dataProvider toYamlDataProvider
     */
    public function testFromYAML($expected)
    {
        $coll = new PropelObjectCollection();
        $coll->setModel('Book');
        $coll->fromYAML($expected);
        // fix modified columns order
        foreach ($coll as $book) {
            $book->resetModified();
        }

        $this->assertEquals($this->coll, $coll);
    }

    public function toJsonDataProvider()
    {
        $expected = <<<EOF
{"Book_0":{"Id":9012,"Title":"Don Juan","ISBN":"0140422161","Price":12.99,"PublisherId":1234,"AuthorId":5678},"Book_1":{"Id":58,"Title":"Harry Potter and the Order of the Phoenix","ISBN":"043935806X","Price":10.99,"PublisherId":null,"AuthorId":null}}
EOF;

        return array(array($expected));
    }

    /**
     * @dataProvider toJsonDataProvider
     */
    public function testToJSON($expected)
    {
        $this->assertEquals($expected, $this->coll->toJSON());
    }

    /**
     * @dataProvider toJsonDataProvider
     */
    public function testfromJSON($expected)
    {
        $coll = new PropelObjectCollection();
        $coll->setModel('Book');
        $coll->fromJSON($expected);
        // fix modified columns order
        foreach ($coll as $book) {
            $book->resetModified();
        }

        $this->assertEquals($this->coll, $coll);
    }

    public function toCsvDataProvider()
    {
        $expected = "Id,Title,ISBN,Price,PublisherId,AuthorId\r\n9012,Don Juan,0140422161,12.99,1234,5678\r\n58,Harry Potter and the Order of the Phoenix,043935806X,10.99,N;,N;\r\n";

        return array(array($expected));
    }

    /**
     * @dataProvider toCsvDataProvider
     */
    public function testToCSV($expected)
    {
        $this->assertEquals($expected, $this->coll->toCSV());
    }

    /**
     * @dataProvider toCsvDataProvider
     */
    public function testfromCSV($expected)
    {
        $coll = new PropelObjectCollection();
        $coll->setModel('Book');
        $coll->fromCSV($expected);
        // fix modified columns order
        foreach ($coll as $book) {
            $book->resetModified();
        }

        $this->assertEquals($this->coll, $coll);
    }

    /**
     * @dataProvider toYamlDataProvider
     */
    public function testToStringUsesDefaultStringFormat($expected)
    {
        $this->assertEquals($expected, (string) $this->coll, 'PropelCollection::__toString() uses the YAML representation by default');
    }

    public function testToStringUsesCustomStringFormat()
    {
        $coll = new PropelObjectCollection();
        $coll->setModel('Publisher');
        $publisher = new Publisher();
        $publisher->setId(12345);
        $publisher->setName('Penguinoo');
        $coll[]= $publisher;
        $expected = <<<EOF
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <Publisher>
    <Id>12345</Id>
    <Name><![CDATA[Penguinoo]]></Name>
  </Publisher>
</data>

EOF;
        $this->assertEquals($expected, (string) $coll);
    }

}
