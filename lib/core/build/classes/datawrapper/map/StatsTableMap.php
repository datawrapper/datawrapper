<?php



/**
 * This class defines the structure of the 'stats' table.
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
class StatsTableMap extends TableMap
{

	/**
	 * The (dot-path) name of this class
	 */
	const CLASS_NAME = 'datawrapper.map.StatsTableMap';

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
		$this->setName('stats');
		$this->setPhpName('Stats');
		$this->setClassname('Stats');
		$this->setPackage('datawrapper');
		$this->setUseIdGenerator(true);
		// columns
		$this->addPrimaryKey('ID', 'Id', 'INTEGER', true, null, null);
		$this->addColumn('TIME', 'Time', 'TIMESTAMP', true, null, null);
		$this->addColumn('METRIC', 'Metric', 'VARCHAR', true, 255, null);
		$this->addColumn('VALUE', 'Value', 'INTEGER', true, null, null);
		// validators
	} // initialize()

	/**
	 * Build the RelationMap objects for this table relationships
	 */
	public function buildRelations()
	{
	} // buildRelations()

} // StatsTableMap
