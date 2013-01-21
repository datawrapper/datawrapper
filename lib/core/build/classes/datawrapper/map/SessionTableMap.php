<?php



/**
 * This class defines the structure of the 'session' table.
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
class SessionTableMap extends TableMap
{

	/**
	 * The (dot-path) name of this class
	 */
	const CLASS_NAME = 'datawrapper.map.SessionTableMap';

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
		$this->setName('session');
		$this->setPhpName('Session');
		$this->setClassname('Session');
		$this->setPackage('datawrapper');
		$this->setUseIdGenerator(false);
		// columns
		$this->addPrimaryKey('SESSION_ID', 'SessionId', 'VARCHAR', true, 32, null);
		$this->addColumn('DATE_CREATED', 'DateCreated', 'TIMESTAMP', true, null, null);
		$this->addColumn('LAST_UPDATED', 'LastUpdated', 'TIMESTAMP', true, null, null);
		$this->addColumn('SESSION_DATA', 'SessionData', 'VARCHAR', true, 4096, null);
		// validators
	} // initialize()

	/**
	 * Build the RelationMap objects for this table relationships
	 */
	public function buildRelations()
	{
	} // buildRelations()

} // SessionTableMap
