<?php



/**
 * This class defines the structure of the 'plugin' table.
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
class PluginTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.PluginTableMap';

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
        $this->setName('plugin');
        $this->setPhpName('Plugin');
        $this->setClassname('Plugin');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(false);
        // columns
        $this->addPrimaryKey('id', 'Id', 'VARCHAR', true, 128, null);
        $this->addColumn('installed_at', 'InstalledAt', 'TIMESTAMP', true, null, null);
        $this->addColumn('enabled', 'Enabled', 'BOOLEAN', false, 1, false);
        $this->addColumn('is_private', 'IsPrivate', 'BOOLEAN', false, 1, false);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('PluginOrganization', 'PluginOrganization', RelationMap::ONE_TO_MANY, array('id' => 'plugin_id', ), null, null, 'PluginOrganizations');
        $this->addRelation('PluginData', 'PluginData', RelationMap::ONE_TO_MANY, array('id' => 'plugin_id', ), null, null, 'PluginDatas');
        $this->addRelation('Organization', 'Organization', RelationMap::MANY_TO_MANY, array(), null, null, 'Organizations');
    } // buildRelations()

} // PluginTableMap
