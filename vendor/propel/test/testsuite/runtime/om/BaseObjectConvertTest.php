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
 * Test class for BaseObject.
 *
 * @author     François Zaninotto
 * @version    $Id: BaseObjectTest.php 1347 2009-12-03 21:06:36Z francois $
 * @package    runtime.om
 */
class BaseObjectConvertTest extends BookstoreTestBase
{
    protected function setUp()
    {
        parent::setUp();
        $publisher = new Publisher();
        $publisher->setId(1234);
        $publisher->setName('Penguin');
        $author = new Author();
        $author->setId(5678);
        $author->setFirstName('George');
        $author->setLastName('Byron');
        $book = new Book();
        $book->setId(9012);
        $book->setTitle('Don Juan');
        $book->setISBN('0140422161');
        $book->setPrice(12.99);
        $book->setAuthor($author);
        $book->setPublisher($publisher);
        $this->book = $book;
    }

    public function toXmlDataProvider()
    {
        $expected = <<<EOF
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <Id>9012</Id>
  <Title><![CDATA[Don Juan]]></Title>
  <ISBN><![CDATA[0140422161]]></ISBN>
  <Price>12.99</Price>
  <PublisherId>1234</PublisherId>
  <AuthorId>5678</AuthorId>
  <Publisher>
    <Id>1234</Id>
    <Name><![CDATA[Penguin]]></Name>
    <Books>
      <Book_0><![CDATA[*RECURSION*]]></Book_0>
    </Books>
  </Publisher>
  <Author>
    <Id>5678</Id>
    <FirstName><![CDATA[George]]></FirstName>
    <LastName><![CDATA[Byron]]></LastName>
    <Email></Email>
    <Age></Age>
    <Books>
      <Book_0><![CDATA[*RECURSION*]]></Book_0>
    </Books>
  </Author>
</data>

EOF;

        return array(array($expected));
    }

    /**
     * @dataProvider toXmlDataProvider
     */
    public function testToXML($expected)
    {
        $this->assertEquals($expected, $this->book->toXML());
    }

    /**
     * @dataProvider toXmlDataProvider
     */
    public function testFromXML($expected)
    {
        $book = new Book();
        $book->fromXML($expected);
        // FIXME: fromArray() doesn't take related objects into account
        $book->resetModified();
        $author = $this->book->getAuthor();
        $this->book->setAuthor(null);
        $this->book->setAuthorId($author->getId());
        $publisher = $this->book->getPublisher();
        $this->book->setPublisher(null);
        $this->book->setPublisherId($publisher->getId());
        $this->book->resetModified();

        $this->assertEquals($this->book, $book);
    }

    public function toYamlDataProvider()
    {
        $expected = <<<EOF
Id: 9012
Title: 'Don Juan'
ISBN: '0140422161'
Price: 12.99
PublisherId: 1234
AuthorId: 5678
Publisher:
  Id: 1234
  Name: Penguin
  Books:
    Book_0: '*RECURSION*'
Author:
  Id: 5678
  FirstName: George
  LastName: Byron
  Email: null
  Age: null
  Books:
    Book_0: '*RECURSION*'

EOF;

        return array(array($expected));
    }

    /**
     * @dataProvider toYamlDataProvider
     */
    public function testToYAML($expected)
    {
        $this->assertEquals($expected, $this->book->toYAML());
    }

    /**
     * @dataProvider toYamlDataProvider
     */
    public function testFromYAML($expected)
    {
        $book = new Book();
        $book->fromYAML($expected);
        // FIXME: fromArray() doesn't take related objects into account
        $book->resetModified();
        $author = $this->book->getAuthor();
        $this->book->setAuthor(null);
        $this->book->setAuthorId($author->getId());
        $publisher = $this->book->getPublisher();
        $this->book->setPublisher(null);
        $this->book->setPublisherId($publisher->getId());
        $this->book->resetModified();

        $this->assertEquals($this->book, $book);
    }

    public function toJsonDataProvider()
    {
        $expected = <<<EOF
{"Id":9012,"Title":"Don Juan","ISBN":"0140422161","Price":12.99,"PublisherId":1234,"AuthorId":5678,"Publisher":{"Id":1234,"Name":"Penguin","Books":{"Book_0":"*RECURSION*"}},"Author":{"Id":5678,"FirstName":"George","LastName":"Byron","Email":null,"Age":null,"Books":{"Book_0":"*RECURSION*"}}}
EOF;

        return array(array($expected));
    }

    /**
     * @dataProvider toJsonDataProvider
     */
    public function testToJSON($expected)
    {
        $this->assertEquals($expected, $this->book->toJSON());
    }

    /**
     * @dataProvider toJsonDataProvider
     */
    public function testfromJSON($expected)
    {
        $book = new Book();
        $book->fromJSON($expected);
        // FIXME: fromArray() doesn't take related objects into account
        $book->resetModified();
        $author = $this->book->getAuthor();
        $this->book->setAuthor(null);
        $this->book->setAuthorId($author->getId());
        $publisher = $this->book->getPublisher();
        $this->book->setPublisher(null);
        $this->book->setPublisherId($publisher->getId());
        $this->book->resetModified();

        $this->assertEquals($this->book, $book);
    }

    public function toCsvDataProvider()
    {
        $expected = "Id,Title,ISBN,Price,PublisherId,AuthorId,Publisher,Author\r\n9012,Don Juan,0140422161,12.99,1234,5678,\"a:3:{s:2:\\\"Id\\\";i:1234;s:4:\\\"Name\\\";s:7:\\\"Penguin\\\";s:5:\\\"Books\\\";a:1:{s:6:\\\"Book_0\\\";s:11:\\\"*RECURSION*\\\";}}\",\"a:6:{s:2:\\\"Id\\\";i:5678;s:9:\\\"FirstName\\\";s:6:\\\"George\\\";s:8:\\\"LastName\\\";s:5:\\\"Byron\\\";s:5:\\\"Email\\\";N;s:3:\\\"Age\\\";N;s:5:\\\"Books\\\";a:1:{s:6:\\\"Book_0\\\";s:11:\\\"*RECURSION*\\\";}}\"\r\n";

        return array(array($expected));
    }

    /**
     * @dataProvider toCsvDataProvider
     */
    public function testToCSV($expected)
    {
        $this->assertEquals($expected, $this->book->toCSV());
    }

    /**
     * @dataProvider toCsvDataProvider
     */
    public function testfromCSV($expected)
    {
        $book = new Book();
        $book->fromCSV($expected);
        // FIXME: fromArray() doesn't take related objects into account
        $book->resetModified();
        $author = $this->book->getAuthor();
        $this->book->setAuthor(null);
        $this->book->setAuthorId($author->getId());
        $publisher = $this->book->getPublisher();
        $this->book->setPublisher(null);
        $this->book->setPublisherId($publisher->getId());
        $this->book->resetModified();

        $this->assertEquals($this->book, $book);
    }

}
