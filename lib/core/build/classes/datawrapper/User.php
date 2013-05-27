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
        unset($arr['Pwd']);  // never transmit passwords
        unset($arr['Token']);  // never transmit passwords
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
        return count(ChartQuery::create()->getPublicChartsByUser($this));
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

} // User
