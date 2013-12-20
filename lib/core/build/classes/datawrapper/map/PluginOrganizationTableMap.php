<?php



/**
 * This class defines the structure of the 'plugin_organization' table.
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
class PluginOrganizationTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.PluginOrganizationTableMap';

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
        $this->setName('plugin_organization');
        $this->setPhpName('PluginOrganization');
        $this->setClassname('PluginOrganization');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(false);
        $this->setIsCrossRef(true);
        // columns
        $this->addForeignPrimaryKey('plugin_id', 'PluginId', 'VARCHAR' , 'plugin', 'id', true, 128, null);
        $this->addForeignPrimaryKey('organization_id', 'OrganizationId', 'VARCHAR' , 'organization', 'id', true, 128, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('Plugin', 'Plugin', RelationMap::MANY_TO_ONE, array('plugin_id' => 'id', ), null, null);
        $this->addRelation('Organization', 'Organization', RelationMap::MANY_TO_ONE, array('organization_id' => 'id', ), null, null);
    } // buildRelations()

} // PluginOrganizationTableMap
