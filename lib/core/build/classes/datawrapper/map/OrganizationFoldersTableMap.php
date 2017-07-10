<?php



/**
 * This class defines the structure of the 'organization_folders' table.
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
class OrganizationFoldersTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.OrganizationFoldersTableMap';

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
        $this->setName('organization_folders');
        $this->setPhpName('OrganizationFolders');
        $this->setClassname('OrganizationFolders');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(true);
        // columns
        $this->addPrimaryKey('of_id', 'OfId', 'INTEGER', true, null, null);
        $this->addForeignKey('org_id', 'OrgId', 'VARCHAR', 'organization', 'id', false, 128, null);
        $this->addColumn('folder_name', 'FolderName', 'VARCHAR', false, 128, null);
        $this->addPrimaryKey('parent_id', 'ParentId', 'INTEGER', true, null, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('Organization', 'Organization', RelationMap::MANY_TO_ONE, array('org_id' => 'id', ), null, null);
        $this->addRelation('ChartFolders', 'ChartFolders', RelationMap::ONE_TO_MANY, array('of_id' => 'org_folder', ), null, null, 'ChartFolderss');
        $this->addRelation('Chart', 'Chart', RelationMap::MANY_TO_MANY, array(), null, null, 'Charts');
        $this->addRelation('UserFolders', 'UserFolders', RelationMap::MANY_TO_MANY, array(), null, null, 'UserFolderss');
    } // buildRelations()

} // OrganizationFoldersTableMap
