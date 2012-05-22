<?php

/**
 * $Id$
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/BookstoreEmptyTestBase.php';

/**
 * Tests the validator classes.
 *
 * This test uses generated Bookstore classes to test the behavior of various
 * validator operations.
 *
 * The database is relaoded before every test and flushed after every test.	This
 * means that you can always rely on the contents of the databases being the same
 * for each test method in this class.	See the BookstoreDataPopulator::populate()
 * method for the exact contents of the database.
 *
 * @see        BookstoreDataPopulator
 * @author     Michael Aichler <aichler@mediacluster.de>
 * @package    runtime.validator
 */
class ValidatorTest extends BookstoreEmptyTestBase
{

	protected function setUp()
	{
		parent::setUp();
		BookstoreDataPopulator::populate();
		require_once dirname(__FILE__) . '/../../../tools/helpers/bookstore/validator/ISBNValidator.php';
	}

	/**
	 * Test minLength validator.
	 * This also tests the ${value} substitution.
	 */
	public function testDoValidate_MinLength()
	{
		$book = new Book();
		$book->setTitle("12345"); // min length is 10

		$res = $book->validate();
		$this->assertFalse($res, "Expected validation to fail.");

		$failures = $book->getValidationFailures();
		$this->assertSingleValidation($failures, "Book title must be more than 10 characters long.");
	}

	/**
	 * Test unique validator.
	 */
	public function testDoValidate_Unique()
	{
		$book = new Book();
		$book->setTitle("Don Juan");

		$ret = $book->validate();
		$failures = $book->getValidationFailures();
		$this->assertSingleValidation($failures, "Book title already in database.");
	}

	/**
	 * Test recursive validaton.
	 */
	public function testDoValidate_Complex()
	{
		$book = new Book();
		$book->setTitle("12345"); // min length is 10

		$author = new Author();
		$author->setFirstName("Hans"); // last name required, valid email format, age > 0

		$review = new Review();
		$review->setReviewDate("08/09/2001"); // reviewed_by column required, invalid status (new, reviewed, archived)

		$book->setAuthor($author);
		$book->addReview($review);

		$res = $book->validate();

		$this->assertFalse($res, "Expected validation to fail.");

		$failures = $book->getValidationFailures();

		/* Make sure 3 validation messages were returned; NOT 6, because the others were NULL */
		$this->assertEquals(3, count($failures), "");

		/* Make sure correct columns failed */
		$expectedCols = array(
		AuthorPeer::LAST_NAME,
		BookPeer::TITLE,
		ReviewPeer::REVIEWED_BY
		);
		$returnedCols = array_keys($failures);

		/* implode for readability */
		$this->assertEquals(implode(',', $expectedCols), implode(',', $returnedCols));
	}

	/**
	 * Test recursive validaton with specified columns.
	 */
	public function testDoValidate_ComplexSpecifiedCols()
	{
		$book = new Book();
		$book->setTitle("12345"); // min length is 10

		$author = new Author();
		$author->setFirstName("Hans"); // last name required, valid email format, age > 0

		$review = new Review();
		$review->setReviewDate("08/09/2001"); // reviewed_by column required, invalid status (new, reviewed, archived)

		$book->setAuthor($author);
		$book->addReview($review);

		$cols = array(AuthorPeer::LAST_NAME, ReviewPeer::REVIEWED_BY);

		$res = $book->validate($cols);

		$this->assertFalse($res, "Expected validation to fail.");

		$failures = $book->getValidationFailures();

		/* Make sure 3 validation messages were returned; NOT 6, because the others were NULL */
		$this->assertEquals(2, count($failures), "");

		/* Make sure correct columns failed */
		$expectedCols = array(
		AuthorPeer::LAST_NAME,
		ReviewPeer::REVIEWED_BY
		);

		$returnedCols = array_keys($failures);

		/* implode for readability */
		$this->assertEquals(implode(',', $expectedCols), implode(',', $returnedCols));
	}

	/**
	 * Test the fact that validators should not complain NULL values for non-required columns.
	 */
	public function testDoValidate_Nulls()
	{
		$author = new Author();
		$author->setFirstName("Malcolm"); // last name required, valid email format, age > 0
		$author->setLastName("X");

		$author->setEmail(null); // just to be explicit, of course these are the defaults anyway
		$author->setAge(null);

		$res = $author->validate();


		$this->assertTrue($res, "Expected validation to pass with NULL columns");

		$author->setEmail('malcolm@'); // fail
		$res = $author->validate();

		$this->assertFalse($res, "Expected validation to fail.");

		$failures = $author->getValidationFailures();
		$this->assertEquals(1, count($failures), "Expected 1 column to fail validation.");
		$this->assertEquals(array(AuthorPeer::EMAIL), array_keys($failures), "Expected EMAIL to fail validation.");

	}

	public function testDoValidate_BasicValidatorObj()
	{
		$author = new Author();
		$author->setFirstName("Malcolm"); // last name required, valid email format, age > 0
		$author->setLastName("X");
		$author->setEmail('malcolm@'); // fail

		$res = $author->validate();

		$this->assertFalse($res, "Expected validation to fail.");

		$failures = $author->getValidationFailures();

		$this->assertEquals(1, count($failures), "Expected 1 column to fail validation.");
		$this->assertEquals(array(AuthorPeer::EMAIL), array_keys($failures), "Expected EMAIL to fail validation.");

		$validator = $failures[AuthorPeer::EMAIL]->getValidator();
		$this->assertTrue($validator instanceof MatchValidator, "Expected validator that failed to be MatchValidator");

	}

	public function testDoValidate_CustomValidator()
	{
		$book = new Book();
		$book->setTitle("testDoValidate_CustomValidator"); // (valid)
		$book->setISBN("Foo.Bar.Baz"); // (invalid)

		$res = $book->validate();

		$this->assertFalse($res, "Expected validation to fail.");

		$failures = $book->getValidationFailures();

		$this->assertEquals(1, count($failures), "Expected 1 column to fail validation.");
		$this->assertEquals(array(BookPeer::ISBN), array_keys($failures), "Expected EMAIL to fail validation.");

		$validator = $failures[BookPeer::ISBN]->getValidator();
		$this->assertInstanceOf('ISBNValidator', $validator, "Expected validator that failed to be ISBNValidator");
	}

	protected function assertSingleValidation($ret, $expectedMsg)
	{
		/* Make sure validation failed */
		$this->assertTrue($ret !== true, "Expected validation to fail !");

		/* Make sure 1 validation message was returned */
		$count = count($ret);
		$this->assertTrue($count === 1, "Expected that exactly one validation failed ($count) !");

		/* Make sure expected validation message was returned */
		$el = array_shift($ret);
		$this->assertEquals($el->getMessage(), $expectedMsg, "Got unexpected validation failed message: " . $el->getMessage());
	}

}
