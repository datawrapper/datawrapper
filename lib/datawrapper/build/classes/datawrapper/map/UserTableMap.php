<?php



/**
 * This class defines the structure of the 'user' table.
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
class UserTableMap extends TableMap
{

	/**
	 * The (dot-path) name of this class
	 */
	const CLASS_NAME = 'datawrapper.map.UserTableMap';

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
		$this->setName('user');
		$this->setPhpName('User');
		$this->setClassname('User');
		$this->setPackage('datawrapper');
		$this->setUseIdGenerator(true);
		// columns
		$this->addPrimaryKey('ID', 'Id', 'INTEGER', true, null, null);
		$this->addColumn('EMAIL', 'Email', 'VARCHAR', true, 255, null);
		$this->addColumn('PWD', 'Pwd', 'VARCHAR', true, 255, null);
		$this->addColumn('TOKEN', 'Token', 'VARCHAR', true, 255, null);
		$this->addColumn('ROLE', 'Role', 'ENUM', true, null, 'editor');
		$this->getColumn('ROLE', false)->setValueSet(array (
  0 => 'admin',
  1 => 'editor',
));
		$this->addColumn('LANGUAGE', 'Language', 'VARCHAR', false, 5, 'en');
		$this->addColumn('CREATED_AT', 'CreatedAt', 'TIMESTAMP', true, null, null);
		// validators
	} // initialize()

	/**
	 * Build the RelationMap objects for this table relationships
	 */
	public function buildRelations()
	{
		$this->addRelation('Chart', 'Chart', RelationMap::ONE_TO_MANY, array('id' => 'author_id', ), null, null, 'Charts');
	} // buildRelations()

} // UserTableMap
