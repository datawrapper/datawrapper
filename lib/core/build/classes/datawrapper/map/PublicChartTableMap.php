<?php



/**
 * This class defines the structure of the 'chart_public' table.
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
class PublicChartTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.PublicChartTableMap';

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
        $this->setName('chart_public');
        $this->setPhpName('PublicChart');
        $this->setClassname('PublicChart');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(false);
        // columns
        $this->addForeignPrimaryKey('id', 'Id', 'VARCHAR' , 'chart', 'id', true, 5, null);
        $this->addColumn('title', 'Title', 'VARCHAR', true, 255, null);
        $this->addColumn('type', 'Type', 'VARCHAR', true, 200, null);
        $this->addColumn('metadata', 'Metadata', 'CLOB', true, null, null);
        $this->addColumn('external_data', 'ExternalData', 'VARCHAR', false, 255, null);
        $this->addColumn('first_published_at', 'FirstPublishedAt', 'TIMESTAMP', false, null, null);
        $this->addColumn('author_id', 'AuthorId', 'INTEGER', false, null, null);
        $this->addColumn('organization_id', 'OrganizationId', 'VARCHAR', false, 128, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('Chart', 'Chart', RelationMap::MANY_TO_ONE, array('id' => 'id', ), null, null);
    } // buildRelations()

} // PublicChartTableMap
