<?php



/**
 * This class defines the structure of the 'job' table.
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
class JobTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.JobTableMap';

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
        $this->setName('job');
        $this->setPhpName('Job');
        $this->setClassname('Job');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(true);
        // columns
        $this->addPrimaryKey('id', 'Id', 'INTEGER', true, null, null);
        $this->addForeignKey('user_id', 'UserId', 'INTEGER', 'user', 'id', true, null, null);
        $this->addForeignKey('chart_id', 'ChartId', 'VARCHAR', 'chart', 'id', true, 5, null);
        $this->addColumn('status', 'Status', 'ENUM', true, null, 'queued');
        $this->getColumn('status', false)->setValueSet(array (
  0 => 'queued',
  1 => 'done',
  2 => 'failed',
  3 => 'canceled',
));
        $this->addColumn('created_at', 'CreatedAt', 'TIMESTAMP', true, null, null);
        $this->addColumn('done_at', 'DoneAt', 'TIMESTAMP', true, null, null);
        $this->addColumn('type', 'Type', 'VARCHAR', true, 32, null);
        $this->addColumn('parameter', 'Parameter', 'VARCHAR', true, 4096, null);
        $this->addColumn('fail_reason', 'FailReason', 'VARCHAR', true, 4096, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('User', 'User', RelationMap::MANY_TO_ONE, array('user_id' => 'id', ), null, null);
        $this->addRelation('Chart', 'Chart', RelationMap::MANY_TO_ONE, array('chart_id' => 'id', ), null, null);
    } // buildRelations()

} // JobTableMap
