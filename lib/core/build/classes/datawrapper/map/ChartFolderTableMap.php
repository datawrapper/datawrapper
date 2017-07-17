<?php



/**
 * This class defines the structure of the 'chart_folder' table.
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
class ChartFolderTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.ChartFolderTableMap';

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
        $this->setName('chart_folder');
        $this->setPhpName('ChartFolder');
        $this->setClassname('ChartFolder');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(true);
        $this->setIsCrossRef(true);
        // columns
        $this->addPrimaryKey('map_id', 'MapId', 'INTEGER', true, null, null);
        $this->addForeignKey('chart_id', 'ChartId', 'VARCHAR', 'chart', 'id', false, 5, null);
        $this->addForeignKey('usr_folder', 'UsrFolder', 'INTEGER', 'user_folder', 'uf_id', false, null, null);
        $this->addForeignKey('org_folder', 'OrgFolder', 'INTEGER', 'organization_folder', 'of_id', false, null, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('Chart', 'Chart', RelationMap::MANY_TO_ONE, array('chart_id' => 'id', ), null, null);
        $this->addRelation('UserFolder', 'UserFolder', RelationMap::MANY_TO_ONE, array('usr_folder' => 'uf_id', ), null, null);
        $this->addRelation('OrganizationFolder', 'OrganizationFolder', RelationMap::MANY_TO_ONE, array('org_folder' => 'of_id', ), null, null);
    } // buildRelations()

} // ChartFolderTableMap
