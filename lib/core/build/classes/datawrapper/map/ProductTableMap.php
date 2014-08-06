<?php



/**
 * This class defines the structure of the 'product' table.
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
class ProductTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.ProductTableMap';

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
        $this->setName('product');
        $this->setPhpName('Product');
        $this->setClassname('Product');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(true);
        // columns
        $this->addPrimaryKey('id', 'Id', 'INTEGER', true, null, null);
        $this->addColumn('name', 'Name', 'VARCHAR', true, 512, null);
        $this->addColumn('created_at', 'CreatedAt', 'TIMESTAMP', true, null, null);
        $this->addColumn('deleted', 'Deleted', 'BOOLEAN', false, 1, false);
        $this->addColumn('data', 'Data', 'CLOB', false, null, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('ProductPlugin', 'ProductPlugin', RelationMap::ONE_TO_MANY, array('id' => 'product_id', ), null, null, 'ProductPlugins');
        $this->addRelation('UserProduct', 'UserProduct', RelationMap::ONE_TO_MANY, array('id' => 'product_id', ), null, null, 'UserProducts');
        $this->addRelation('OrganizationProduct', 'OrganizationProduct', RelationMap::ONE_TO_MANY, array('id' => 'product_id', ), null, null, 'OrganizationProducts');
        $this->addRelation('Plugin', 'Plugin', RelationMap::MANY_TO_MANY, array(), null, null, 'Plugins');
        $this->addRelation('User', 'User', RelationMap::MANY_TO_MANY, array(), null, null, 'Users');
        $this->addRelation('Organization', 'Organization', RelationMap::MANY_TO_MANY, array(), null, null, 'Organizations');
    } // buildRelations()

} // ProductTableMap
