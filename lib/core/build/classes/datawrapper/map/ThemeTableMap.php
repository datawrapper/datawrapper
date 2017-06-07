<?php



/**
 * This class defines the structure of the 'theme' table.
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
class ThemeTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.ThemeTableMap';

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
        $this->setName('theme');
        $this->setPhpName('Theme');
        $this->setClassname('Theme');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(false);
        $this->setIsCrossRef(true);
        // columns
        $this->addPrimaryKey('id', 'Id', 'VARCHAR', true, 128, null);
        $this->addColumn('created_at', 'CreatedAt', 'TIMESTAMP', true, null, null);
        $this->addColumn('extend', 'Extend', 'VARCHAR', false, 128, null);
        $this->addColumn('title', 'Title', 'VARCHAR', false, 128, null);
        $this->addColumn('data', 'Data', 'CLOB', false, null, null);
        $this->addColumn('less', 'Less', 'CLOB', false, null, null);
        $this->addColumn('assets', 'Assets', 'CLOB', false, null, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('OrganizationTheme', 'OrganizationTheme', RelationMap::ONE_TO_MANY, array('id' => 'theme_id', ), null, null, 'OrganizationThemes');
        $this->addRelation('UserTheme', 'UserTheme', RelationMap::ONE_TO_MANY, array('id' => 'theme_id', ), null, null, 'UserThemes');
        $this->addRelation('Organization', 'Organization', RelationMap::MANY_TO_MANY, array(), null, null, 'Organizations');
        $this->addRelation('User', 'User', RelationMap::MANY_TO_MANY, array(), null, null, 'Users');
    } // buildRelations()

} // ThemeTableMap
