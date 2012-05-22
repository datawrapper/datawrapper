<?php

/*
 *	$Id: SoftDeleteBehaviorTest.php 1612 2010-03-16 22:56:21Z francois $
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../../../tools/helpers/bookstore/BookstoreTestBase.php';

/**
 * Tests for AggregateColumnBehavior class
 *
 * @author		 François Zaninotto
 * @version		$Revision$
 * @package		generator.behavior.aggregate_column
 */
class AggregateColumnBehaviorTest extends BookstoreTestBase
{

	public function testParameters()
	{
		$postTable = AggregatePostPeer::getTableMap();
		$this->assertEquals(count($postTable->getColumns()), 2, 'AggregateColumn adds one column by default');
		$this->assertTrue(method_exists('AggregatePost', 'getNbComments'));
	}

	public function testCompute()
	{
		AggregateCommentQuery::create()->deleteAll($this->con);
		AggregatePostQuery::create()->deleteAll($this->con);
		$post = new AggregatePost();
		$post->save($this->con);
		$this->assertEquals(0, $post->computeNbComments($this->con), 'The compute method returns 0 for objects with no related objects');
		$comment1 = new AggregateComment();
		$comment1->setAggregatePost($post);
		$comment1->save($this->con);
		$this->assertEquals(1, $post->computeNbComments($this->con), 'The compute method computes the aggregate function on related objects');
		$comment2 = new AggregateComment();
		$comment2->setAggregatePost($post);
		$comment2->save($this->con);
		$this->assertEquals(2, $post->computeNbComments($this->con), 'The compute method computes the aggregate function on related objects');
		$comment1->delete($this->con);
		$this->assertEquals(1, $post->computeNbComments($this->con), 'The compute method computes the aggregate function on related objects');
	}

	public function testUpdate()
	{
		AggregateCommentQuery::create()->deleteAll($this->con);
		AggregatePostQuery::create()->deleteAll($this->con);
		$post = new AggregatePost();
		$post->save($this->con);
		$comment = new TestableComment();
		$comment->setAggregatePost($post);
		$comment->save($this->con);
		$this->assertNull($post->getNbComments());
		$post->updateNbComments($this->con);
		$this->assertEquals(1, $post->getNbComments(), 'The update method updates the aggregate column');
		$comment->delete($this->con);
		$this->assertEquals(1, $post->getNbComments());
		$post->updateNbComments($this->con);
		$this->assertEquals(0, $post->getNbComments(), 'The update method updates the aggregate column');
	}

	public function testCreateRelated()
	{
		AggregateCommentQuery::create()->deleteAll($this->con);
		AggregatePostQuery::create()->deleteAll($this->con);
		$post = new AggregatePost();
		$post->save($this->con);
		$comment1 = new AggregateComment();
		$comment1->save($this->con);
		$this->assertNull($post->getNbComments(), 'Adding a new foreign object does not update the aggregate column');
		$comment2 = new AggregateComment();
		$comment2->setAggregatePost($post);
		$comment2->save($this->con);
		$this->assertEquals(1, $post->getNbComments(), 'Adding a new related object updates the aggregate column');
		$comment3 = new AggregateComment();
		$comment3->setAggregatePost($post);
		$comment3->save($this->con);
		$this->assertEquals(2, $post->getNbComments(), 'Adding a new related object updates the aggregate column');
	}

	public function testUpdateRelated()
	{
		list($poll, $item1, $item2) = $this->populatePoll();
		$this->assertEquals(19, $poll->getTotalScore());
		$item1->setScore(10);
		$item1->save($this->con);
		$this->assertEquals(17, $poll->getTotalScore(), 'Updating a related object updates the aggregate column');
	}

	public function testDeleteRelated()
	{
		list($poll, $item1, $item2) = $this->populatePoll();
		$this->assertEquals(19, $poll->getTotalScore());
		$item1->delete($this->con);
		$this->assertEquals(7, $poll->getTotalScore(), 'Deleting a related object updates the aggregate column');
		$item2->delete($this->con);
		$this->assertNull($poll->getTotalScore(), 'Deleting a related object updates the aggregate column');
	}

	public function testUpdateRelatedWithQuery()
	{
		list($poll, $item1, $item2) = $this->populatePoll();
		$this->assertEquals(19, $poll->getTotalScore());
		AggregateItemQuery::create()
			->update(array('Score' => 4), $this->con);
		$this->assertEquals(8, $poll->getTotalScore(), 'Updating related objects with a query updates the aggregate column');
	}

	public function testUpdateRelatedWithQueryUsingAlias()
	{
		list($poll, $item1, $item2) = $this->populatePoll();
		$this->assertEquals(19, $poll->getTotalScore());
		AggregateItemQuery::create()
			->setModelAlias('foo', true)
			->update(array('Score' => 4), $this->con);
		$this->assertEquals(8, $poll->getTotalScore(), 'Updating related objects with a query using alias updates the aggregate column');
	}

	public function testDeleteRelatedWithQuery()
	{
		list($poll, $item1, $item2) = $this->populatePoll();
		$this->assertEquals(19, $poll->getTotalScore());
		AggregateItemQuery::create()
			->deleteAll($this->con);
		$this->assertNull($poll->getTotalScore(), 'Deleting related objects with a query updates the aggregate column');
	}

	public function testDeleteRelatedWithQueryUsingAlias()
	{
		list($poll, $item1, $item2) = $this->populatePoll();
		$this->assertEquals(19, $poll->getTotalScore());
		AggregateItemQuery::create()
			->setModelAlias('foo', true)
			->filterById($item1->getId())
			->delete($this->con);
		$this->assertEquals(7, $poll->getTotalScore(), 'Deleting related objects with a query using alias updates the aggregate column');
	}

	public function testRemoveRelation()
	{
		AggregateCommentQuery::create()->deleteAll($this->con);
		AggregatePostQuery::create()->deleteAll($this->con);
		$post = new AggregatePost();
		$post->save($this->con);
		$comment1 = new AggregateComment();
		$comment1->setAggregatePost($post);
		$comment1->save($this->con);
		$comment2 = new AggregateComment();
		$comment2->setAggregatePost($post);
		$comment2->save($this->con);
		$this->assertEquals(2, $post->getNbComments());
		$comment2->setAggregatePost(null);
		$comment2->save($this->con);
		$this->assertEquals(1, $post->getNbComments(), 'Removing a relation changes the related object aggregate column');
	}

	public function testReplaceRelation()
	{
		AggregateCommentQuery::create()->deleteAll($this->con);
		AggregatePostQuery::create()->deleteAll($this->con);
		$post1 = new AggregatePost();
		$post1->save($this->con);
		$post2 = new AggregatePost();
		$post2->save($this->con);
		$comment = new AggregateComment();
		$comment->setAggregatePost($post1);
		$comment->save($this->con);
		$this->assertEquals(1, $post1->getNbComments());
		$this->assertNull($post2->getNbComments());
		$comment->setAggregatePost($post2);
		$comment->save($this->con);
		$this->assertEquals(0, $post1->getNbComments(), 'Replacing a relation changes the related object aggregate column');
		$this->assertEquals(1, $post2->getNbComments(), 'Replacing a relation changes the related object aggregate column');
	}

	protected function populatePoll()
	{
		AggregateItemQuery::create()->deleteAll($this->con);
		AggregatePollQuery::create()->deleteAll($this->con);
		$poll = new AggregatePoll();
		$poll->save($this->con);
		$item1 = new AggregateItem();
		$item1->setScore(12);
		$item1->setAggregatePoll($poll);
		$item1->save($this->con);
		$item2 = new AggregateItem();
		$item2->setScore(7);
		$item2->setAggregatePoll($poll);
		$item2->save($this->con);
		return array($poll, $item1, $item2);
	}

}

class TestableComment extends AggregateComment
{
	// overrides the parent save() to bypass behavior hooks
	public function save(PropelPDO $con = null)
	{
		$con->beginTransaction();
		try {
			$affectedRows = $this->doSave($con);
			AggregateCommentPeer::addInstanceToPool($this);
			$con->commit();
			return $affectedRows;
		} catch (PropelException $e) {
			$con->rollBack();
			throw $e;
		}
	}

	// overrides the parent delete() to bypass behavior hooks
	public function delete(PropelPDO $con = null)
	{
		$con->beginTransaction();
		try {
			TestableAggregateCommentQuery::create()
				->filterByPrimaryKey($this->getPrimaryKey())
				->delete($con);
			$con->commit();
			$this->setDeleted(true);
		} catch (PropelException $e) {
			$con->rollBack();
			throw $e;
		}
	}

}

class TestableAggregateCommentQuery extends AggregateCommentQuery
{
	public static function create($modelAlias = null, $criteria = null)
	{
		return new TestableAggregateCommentQuery();
	}

	// overrides the parent basePreDelete() to bypass behavior hooks
	protected function basePreDelete(PropelPDO $con)
	{
		return $this->preDelete($con);
	}

	// overrides the parent basePostDelete() to bypass behavior hooks
	protected function basePostDelete($affectedRows, PropelPDO $con)
	{
		return $this->postDelete($affectedRows, $con);
	}

}