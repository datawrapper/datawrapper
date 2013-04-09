<?php



/**
 * This class defines the structure of the 'chart' table.
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
class ChartTableMap extends TableMap
{

	/**
	 * The (dot-path) name of this class
	 */
	const CLASS_NAME = 'datawrapper.map.ChartTableMap';

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
		$this->setName('chart');
		$this->setPhpName('Chart');
		$this->setClassname('Chart');
		$this->setPackage('datawrapper');
		$this->setUseIdGenerator(false);
		// columns
		$this->addPrimaryKey('ID', 'Id', 'VARCHAR', true, 5, null);
		$this->addColumn('TITLE', 'Title', 'VARCHAR', true, 255, null);
		$this->addColumn('THEME', 'Theme', 'VARCHAR', true, 255, null);
		$this->addColumn('CREATED_AT', 'CreatedAt', 'TIMESTAMP', true, null, null);
		$this->addColumn('LAST_MODIFIED_AT', 'LastModifiedAt', 'TIMESTAMP', true, null, null);
		$this->addColumn('TYPE', 'Type', 'VARCHAR', true, 200, null);
		$this->addColumn('METADATA', 'Metadata', 'VARCHAR', true, 4096, null);
		$this->addColumn('DELETED', 'Deleted', 'BOOLEAN', false, 1, false);
		$this->addColumn('DELETED_AT', 'DeletedAt', 'TIMESTAMP', false, null, null);
		$this->addForeignKey('AUTHOR_ID', 'AuthorId', 'INTEGER', 'user', 'ID', true, null, null);
		$this->addColumn('SHOW_IN_GALLERY', 'ShowInGallery', 'BOOLEAN', false, 1, false);
		$this->addColumn('LANGUAGE', 'Language', 'VARCHAR', false, 5, '');
		$this->addColumn('GUEST_SESSION', 'GuestSession', 'VARCHAR', false, 255, null);
		$this->addColumn('LAST_EDIT_STEP', 'LastEditStep', 'INTEGER', false, null, 0);
		$this->addColumn('PUBLISHED_AT', 'PublishedAt', 'TIMESTAMP', false, null, null);
		$this->addColumn('PUBLIC_URL', 'PublicUrl', 'VARCHAR', false, 255, null);
		// validators
	} // initialize()

	/**
	 * Build the RelationMap objects for this table relationships
	 */
	public function buildRelations()
	{
		$this->addRelation('User', 'User', RelationMap::MANY_TO_ONE, array('author_id' => 'id', ), null, null);
		$this->addRelation('Job', 'Job', RelationMap::ONE_TO_MANY, array('id' => 'chart_id', ), null, null, 'Jobs');
	} // buildRelations()

} // ChartTableMap
