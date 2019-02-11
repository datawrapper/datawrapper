<?php



/**
 * This class defines the structure of the 'folder' table.
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
class FolderTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.FolderTableMap';

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
        $this->setName('folder');
        $this->setPhpName('Folder');
        $this->setClassname('Folder');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(true);
        // columns
        $this->addPrimaryKey('folder_id', 'FolderId', 'INTEGER', true, null, null);
        $this->addColumn('parent_id', 'ParentId', 'INTEGER', false, null, null);
        $this->addColumn('folder_name', 'FolderName', 'VARCHAR', false, 128, null);
        $this->addForeignKey('user_id', 'UserId', 'INTEGER', 'user', 'id', false, null, null);
        $this->addForeignKey('org_id', 'OrgId', 'VARCHAR', 'organization', 'id', false, 128, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('User', 'User', RelationMap::MANY_TO_ONE, array('user_id' => 'id', ), null, null);
        $this->addRelation('Organization', 'Organization', RelationMap::MANY_TO_ONE, array('org_id' => 'id', ), null, null);
        $this->addRelation('Chart', 'Chart', RelationMap::ONE_TO_MANY, array('folder_id' => 'in_folder', ), null, null, 'Charts');
    } // buildRelations()

} // FolderTableMap
