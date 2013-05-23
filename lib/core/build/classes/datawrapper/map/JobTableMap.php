<?php



/**
 * This class defines the structure of the 'job' table.
 *
 *
 *
 * This map class is used by Propel to do runtime db structure discovery.
 * For example, the createSelectSql() method checks the type of a given column used in an
 * ORDER BY clause to know whether it needs to apply SQL to make the ORDER BY case-insensitive
 * (i.e. if it's a text column type).
 *
 * @package    propel.generator.datawrapper.map
 */
class JobTableMap extends TableMap
{

	/**
	 * The (dot-path) name of this class
	 */
	const CLASS_NAME = 'datawrapper.map.JobTableMap';

	/**
	 * Initialize the table attributes, columns and validators
	 * Relations are not initialized by this method since they are lazy loaded
	 *
	 * @return     void
	 * @throws     PropelException
	 */
	public function initialize()
	{
		// attributes
		$this->setName('job');
		$this->setPhpName('Job');
		$this->setClassname('Job');
		$this->setPackage('datawrapper');
		$this->setUseIdGenerator(true);
		// columns
		$this->addPrimaryKey('ID', 'Id', 'INTEGER', true, null, null);
		$this->addForeignKey('USER_ID', 'UserId', 'INTEGER', 'user', 'ID', true, null, null);
		$this->addForeignKey('CHART_ID', 'ChartId', 'VARCHAR', 'chart', 'ID', true, 5, null);
		$this->addColumn('STATUS', 'Status', 'ENUM', true, null, 'queued');
		$this->getColumn('STATUS', false)->setValueSet(array (
  0 => 'queued',
  1 => 'done',
  2 => 'failed',
  3 => 'canceled',
));
		$this->addColumn('CREATED_AT', 'CreatedAt', 'TIMESTAMP', true, null, null);
		$this->addColumn('DONE_AT', 'DoneAt', 'TIMESTAMP', true, null, null);
		$this->addColumn('TYPE', 'Type', 'VARCHAR', true, 32, null);
		$this->addColumn('PARAMETER', 'Parameter', 'VARCHAR', true, 4096, null);
		$this->addColumn('FAIL_REASON', 'FailReason', 'VARCHAR', true, 4096, null);
		// validators
	} // initialize()

	/**
	 * Build the RelationMap objects for this table relationships
	 */
	public function buildRelations()
	{
		$this->addRelation('User', 'User', RelationMap::MANY_TO_ONE, array('user_id' => 'id', ), null, null);
		$this->addRelation('Chart', 'Chart', RelationMap::MANY_TO_ONE, array('chart_id' => 'id', ), null, null);
	} // buildRelations()

} // JobTableMap
