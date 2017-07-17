<?php



/**
 * This class defines the structure of the 'user_folder' table.
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
class UserFolderTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.UserFolderTableMap';

    /**
     * Initialize the table attributes, columns and validators
     * Relations are not initialized by this method since they are lazy loaded
     *
     * @return void
     * @throws PropelException
     */
    public function initialize()
    {
        // attributes
        $this->setName('user_folder');
        $this->setPhpName('UserFolder');
        $this->setClassname('UserFolder');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(true);
        // columns
        $this->addPrimaryKey('uf_id', 'UfId', 'INTEGER', true, null, null);
        $this->addForeignKey('user_id', 'UserId', 'INTEGER', 'user', 'id', false, null, null);
        $this->addColumn('folder_name', 'FolderName', 'VARCHAR', false, 128, null);
        $this->addPrimaryKey('parent_id', 'ParentId', 'INTEGER', true, null, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('User', 'User', RelationMap::MANY_TO_ONE, array('user_id' => 'id', ), null, null);
        $this->addRelation('ChartFolder', 'ChartFolder', RelationMap::ONE_TO_MANY, array('uf_id' => 'usr_folder', ), null, null, 'ChartFolders');
        $this->addRelation('Chart', 'Chart', RelationMap::MANY_TO_MANY, array(), null, null, 'Charts');
        $this->addRelation('OrganizationFolder', 'OrganizationFolder', RelationMap::MANY_TO_MANY, array(), null, null, 'OrganizationFolders');
    } // buildRelations()

} // UserFolderTableMap
