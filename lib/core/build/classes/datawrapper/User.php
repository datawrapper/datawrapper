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
        return $this->getRole() != 'guest';
    }

    public function isAdmin() {
        return $this->getRole() == 'admin';
    }

    public function isAbleToPublish() {
        return $this->getRole() == 'editor' || $this->getRole() == 'admin';
    }

    public function hasCharts() {
        return count(ChartQuery::create()->getPublicChartsByUser($this)) > 0;
    }

} // User
