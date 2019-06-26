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

    public function getOwner() {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByOrganizationRole(UserOrganizationPeer::ORGANIZATION_ROLE_OWNER)
            ->findOne();
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
        $crit = UserQuery::create()
            ->useUserOrganizationQuery()
            ->filterByInviteToken('')
            ->endUse();
        return $this->getUsers($crit);
    }

    public function getPendingUsers() {
        $crit = UserQuery::create()
            ->useUserOrganizationQuery()
            ->filterByInviteToken('', Criteria::NOT_EQUAL)
            ->endUse();
        return $this->getUsers($crit);
    }

    public function getType() {
        $type = $this->getSettings('type');
        if (empty($type)) return 'dev';
        return $type;
    }

    public function getSettings($key = null) {
        if ($this->settings == null) {
            return array();
        }

        $meta = json_decode($this->settings, true);
        if (!is_array($meta)) $meta = array();

        if (empty($key)) return $meta;
        $keys = explode('.', $key);
        $p = $meta;
        foreach ($keys as $key) {
            if (isset($p[$key])) $p = $p[$key];
            else return null;
        }
        return $p;
    }

    public function updateSettings($key, $value) {
        $meta = $this->getSettings();
        $keys = explode('.', $key);
        $p = &$meta;
        foreach ($keys as $key) {
            if (!isset($p[$key])) {
                $p[$key] = array();
            }
            $p = &$p[$key];
        }
        $p = $value;
        $this->setSettings(json_encode($meta));
    }

    /*
     * returns an Array serialization with less
     * sensitive information than $user->toArray()
     */
    public function serialize() {
        return array(
            'id' => $this->getId(),
            'name' => $this->getName()
        );
    }


}
