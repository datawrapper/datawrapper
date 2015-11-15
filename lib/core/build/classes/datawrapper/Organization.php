<?php



/**
 * Skeleton subclass for representing a row from the 'organization' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Organization extends BaseOrganization
{

    public function hasPlugin($plugin) {
        return OrganizationQuery::create()
            ->filterById($this->getId())
            ->filterByPlugin($plugin)
            ->count() > 0;
    }

    public function hasUser($user) {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByUser($user)
            ->filterByInviteToken('')
            ->count() > 0;
    }

    public function getAdmins() {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByOrganizationRole(UserOrganizationPeer::ORGANIZATION_ROLE_ADMIN)
            ->filterByInviteToken('')
            ->find();
    }

    public function getRole($user) {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByUser($user)
            ->findOne()
            ->getOrganizationRole();
    }

    public function setRole($user, $role) {
        $uo = UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByUser($user)
            ->findOne();
        if ($uo) {
            $uo->setOrganizationRole($role)->save();
        }
    }

    public function getActiveUsers() {
        return UserQuery::create()
            ->filterByOrganization($this)
            ->leftJoin('UserOrganization')
            ->addJoinCondition('UserOrganization', 'UserOrganization.InviteToken = ?', '')
            ->find();
    }

    public function getPendingUsers() {
        return UserQuery::create()
            ->filterByOrganization($this)
            ->leftJoin('UserOrganization')
            ->addJoinCondition('UserOrganization', 'UserOrganization.InviteToken <> ?', '')
            ->find();
    }

}
