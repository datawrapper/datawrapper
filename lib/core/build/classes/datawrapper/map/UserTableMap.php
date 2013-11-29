<?php



/**
 * This class defines the structure of the 'user' table.
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
class UserTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'datawrapper.map.UserTableMap';

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
        $this->setName('user');
        $this->setPhpName('User');
        $this->setClassname('User');
        $this->setPackage('datawrapper');
        $this->setUseIdGenerator(true);
        // columns
        $this->addPrimaryKey('id', 'Id', 'INTEGER', true, null, null);
        $this->addColumn('email', 'Email', 'VARCHAR', true, 512, null);
        $this->addColumn('pwd', 'Pwd', 'VARCHAR', true, 512, null);
        $this->addColumn('activate_token', 'ActivateToken', 'VARCHAR', false, 512, null);
        $this->addColumn('reset_password_token', 'ResetPasswordToken', 'VARCHAR', false, 512, null);
        $this->addColumn('role', 'Role', 'ENUM', true, null, 'pending');
        $this->getColumn('role', false)->setValueSet(array (
  0 => 'admin',
  1 => 'editor',
  2 => 'pending',
  3 => 'guest',
  4 => 'sysadmin',
  5 => 'graphic-editor',
));
        $this->addColumn('deleted', 'Deleted', 'BOOLEAN', false, 1, false);
        $this->addColumn('language', 'Language', 'VARCHAR', false, 5, 'en');
        $this->addColumn('created_at', 'CreatedAt', 'TIMESTAMP', true, null, null);
        $this->addColumn('name', 'Name', 'VARCHAR', false, 512, null);
        $this->addColumn('website', 'Website', 'VARCHAR', false, 512, null);
        $this->addColumn('sm_profile', 'SmProfile', 'VARCHAR', false, 512, null);
        $this->addColumn('oauth_signin', 'OAuthSignIn', 'VARCHAR', false, 512, null);
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('Chart', 'Chart', RelationMap::ONE_TO_MANY, array('id' => 'author_id', ), null, null, 'Charts');
        $this->addRelation('UserOrganization', 'UserOrganization', RelationMap::ONE_TO_MANY, array('id' => 'user_id', ), null, null, 'UserOrganizations');
        $this->addRelation('Action', 'Action', RelationMap::ONE_TO_MANY, array('id' => 'user_id', ), null, null, 'Actions');
        $this->addRelation('Job', 'Job', RelationMap::ONE_TO_MANY, array('id' => 'user_id', ), null, null, 'Jobs');
        $this->addRelation('Organization', 'Organization', RelationMap::MANY_TO_MANY, array(), null, null, 'Organizations');
    } // buildRelations()

} // UserTableMap
