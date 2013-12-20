<?php



/**
 * Skeleton subclass for representing a row from the 'user' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class User extends BaseUser {

    public function toArray($keyType = BasePeer::TYPE_PHPNAME, $includeLazyLoadColumns = true, $alreadyDumpedObjects = array(), $includeForeignObjects = false) {
        $arr = parent::toArray($keyType, $includeLazyLoadColumns, $alreadyDumpedObjects, $includeForeignObjects);
        if (isset($arr['Pwd'])) unset($arr['Pwd']);  // never transmit passwords
        if (isset($arr['Token'])) unset($arr['Token']);  // never transmit passwords
        // unset($arr['Role']);  // never transmit passwords
        return $arr;
    }

    public function isLoggedIn() {
        return $this->getRole() != UserPeer::ROLE_GUEST;
    }

    public function isAdmin() {
        return in_array($this->getRole(), array(UserPeer::ROLE_ADMIN, UserPeer::ROLE_SYSADMIN));
    }

    public function isGraphicEditor() {
        return $this->getRole() == UserPeer::ROLE_GRAPHIC_EDITOR;
    }

    public function isSysAdmin() {
        return $this->getRole() == UserPeer::ROLE_SYSADMIN;
    }

    public function isAbleToPublish() {
        return in_array($this->getRole(), array(
            UserPeer::ROLE_EDITOR,
            UserPeer::ROLE_GRAPHIC_EDITOR,
            UserPeer::ROLE_ADMIN,
            UserPeer::ROLE_SYSADMIN
        ));
    }

    public function hasCharts() {
        return $this->chartCount() > 0;
    }

    public function chartCount() {
        return ChartQuery::create()
            ->filterByAuthorId($this->getId())
            ->filterByDeleted(false)
            ->filterByLastEditStep(array('min' => 2))
            ->count();
    }

    public function publicChartCount() {
        return ChartQuery::create()
            ->filterByAuthorId($this->getId())
            ->filterByDeleted(false)
            ->filterByLastEditStep(array('min' => 4))
            ->count();
    }

    public function setPwd($pwd) {
        return parent::setPwd(secure_password($pwd));
    }

    /*
     * this deletes all information stored by the user and
     * makes it impossible to login again
     */
    public function erase() {
        $u = $this;
        $u->setEmail('DELETED');
        $u->setName('');
        $u->setWebsite('');
        $u->setSmProfile('');
        $u->setActivateToken('');
        $u->setResetPasswordToken('');
        $u->setPwd('');
        $u->setDeleted(true);
        $u->save();
    }

    public function guessName() {
        $n = $this->getName();
        if (empty($n)) $n = $this->getEmail();
        if (empty($n)) $n = $this->getOAuthSignIn();
        if (!empty($n) && strpos($n, '::') > 0) $n = substr($n, strpos($n, '::')+2);
        if (empty($n)) $n = __('User').' '.$this->getId();
        return $n;
    }

    public function getRecentCharts($count=10) {
        return ChartQuery::create()
            ->filterByUser($this)
            ->filterByDeleted(false)
            ->filterByLastEditStep(array("min" => 3))
            ->orderByLastModifiedAt('desc')
            ->limit($count)
            ->find();
    }

    /*
     * returns the currently selected organization
     */
    public function getCurrentOrganization() {
        $organizations = $this->getOrganizations();
        if (count($organizations) < 1) return null;
        if (!empty($_SESSION['dw-user-organization'])) {
            foreach ($organizations as $org) {
                if ($org->getId() == $_SESSION['dw-user-organization']) {
                    return $org;
                }
            }
        }
        return $organizations[0];
    }

    /*
     * returns an Array serialization with less
     * sensitive information than $user->toArray()
     */
    public function serialize() {
        return array(
            'id' => $this->getId(),
            'email' => $this->getEmail(),
            'name' => $this->getName(),
            'website' => $this->getWebsite(),
            'socialmedia' => $this->getSmProfile()
        );
    }

} // User
