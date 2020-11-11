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

    public function isGuest() {
        return $this->getRole() == UserPeer::ROLE_GUEST;
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

        DatawrapperHooks::execute(DatawrapperHooks::USER_DELETED, $u);
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
            ->withColumn('MD5(CONCAT(id, "--",UNIX_TIMESTAMP(created_at)))', 'hash')
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
        $organizations = $this->getActiveOrganizations();
        $userData = $this->getUserData();
        if (count($organizations) < 1) return null;
        $value = $userData['active_team'] ?? $_SESSION['dw-user-organization'] ?? false;
        if (!empty($value)) {
            if ($value === '%none%') return null;
            foreach ($organizations as $org) {
                if ($org->getId() == $value) {
                    return $org;
                }
            }
        }
        return $organizations[0];
    }

    public function getCurrentOrganizationRole() {
        $org = $this->getCurrentOrganization();

        if (!$org) return null;

        $userOrganization = UserOrganizationQuery::create()
                            ->filterByUserId($this->getId())
                            ->filterByOrganizationId($this->getCurrentOrganization()->getId())
                            ->findOne();

        return $userOrganization->getOrganizationRole();
    }

    /*
     * returns an array! of all organization ids this user
     * is a member of
     */
    public function getOrganizationIds() {
        $ids = [];
        foreach ($this->getOrganizations() as $org) {
            $ids[] = $org->getId();
        }
        return $ids;
    }


    /*
     * returns an Array serialization with less
     * sensitive information than $user->toArray()
     */
    public function serialize() {
        $res = [
            'id' => $this->getId(),
            'email' => $this->getEmail(),
            'name' => $this->getName(),
            'website' => $this->getWebsite(),
            'socialmedia' => $this->getSmProfile(),
            'isLoggedIn' => $this->isLoggedIn(),
            'isGuest' => !$this->isLoggedIn(),
            'isActivated' => $this->isActivated(),
            'isAdmin' => $this->isAdmin()
        ];

        if ($this->getCurrentOrganization() != null) {
            $res['organization'] = $this->getCurrentOrganization()->serialize();
        }

        return $res;
    }

	public function hasProduct(Product $product) {
		return UserProductQuery::create()
			->filterByProduct($product)
			->filterByUser($this)
			->count() > 0;
    }

    public function isActivated() {
        return $this->getRole() != UserPeer::ROLE_PENDING && $this->getRole() != UserPeer::ROLE_GUEST;
    }

    /*
     *  check if a user is allowed to view an organizations data / charts
     */

    public function isMemberOf($org_id) {
        $org = OrganizationQuery::create()
            ->filterByDisabled(0)
            ->findOneById($org_id);

        if (empty($org)) return false;
        if ($org->hasUser($this)) return true;
        return false;
    }

    /*
     *  check if a user may administrate a team
     */
    public function canAdministrateTeam($org) {
        if ($this->isAdmin()) {
            return true;
        }

        if (!$org->hasUser($this)) {
            return false;
        }

        $ui = UserOrganizationQuery::create()
              ->filterByUserId($this->getId())
              ->filterByOrganizationId($org->getId())
              ->findOne();

        return (($ui->getOrganizationRole() ==
                UserOrganizationPeer::ORGANIZATION_ROLE_ADMIN)
                ||
                ($ui->getOrganizationRole() ==
                UserOrganizationPeer::ORGANIZATION_ROLE_OWNER));
    }

    public function canCreateVisualization($visId, $chart = null) {
        if (is_null($chart)) {
            $org = $this->getCurrentOrganization();
        } else {
            $org = $chart->getOrganization();
        }

        if (!$org) return true;
        if ($org->getSettings("disableVisualizations.enabled") !== true) return true;
        if ($org->getSettings("disableVisualizations.visualizations." . $visId) !== true) return true;
        if ($org->getSettings("disableVisualizations.allowAdmins") && $this->canAdministrateTeam($org)) return true;

        return false;
    }

    /*
     * get a list of all enabled organiztions in which the membership
     * has been activated
     */
    public function getActiveOrganizations() {
        $crit = OrganizationQuery::create()
            ->orderByName()
            ->filterByDisabled(0)
            ->useUserOrganizationQuery()
            ->filterByInviteToken('')
            ->endUse();
        return $this->getOrganizations($crit);
    }

    /*
     * get a list of all disabled organiztions in which the membership
     * has been activated
     */
    public function getDisabledOrganizations() {
        $crit = OrganizationQuery::create()
            ->filterByDisabled(1)
            ->useUserOrganizationQuery()
            ->filterByInviteToken('')
            ->endUse();
        return $this->getOrganizations($crit);
    }


    /*
     * get a list of organization in which the invitation
     * is still pending
     */
    public function getPendingOrganizations() {
        return OrganizationQuery::create()
            ->filterByDisabled(0)
            ->leftJoin('UserOrganization')
            ->where('UserOrganization.InviteToken <> ""')
            ->withColumn('UserOrganization.OrganizationId', 'OrganizationId')
            ->withColumn('UserOrganization.InviteToken', 'InviteToken')
            ->where('UserOrganization.UserId = ?', $this->getId())
            ->find();
    }

    protected $userData = null;

    public function setUserData($data) {
        $values = [];
        $pdo = Propel::getConnection();
        foreach ($data as $key => $value) {
            $values[] = '('.implode(',', [$this->getId(), $pdo->quote($key), $pdo->quote($value)]).')';
        }
        $sql = 'INSERT INTO user_data (user_id, `key`, `value`) VALUES '.implode(', ', $values).
            ' ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), stored_at =  CURRENT_TIMESTAMP';
        $pdo->query($sql);
        $this->userData = $data;
    }

    public function getUserData() {
        if (!empty($this->userData)) return $this->userData;
        $userData = [];
        $res = UserDataQuery::create()->filterByUser($this)->find();
        foreach ($res as $row) {
            $userData[$row->getKey()] = $row->getValue();
        }
        $this->userData = $userData;
        return $userData;
    }

    /*
     * returns true|false
     */
    public function mayPublish($chart) {
        if (!$this->isLoggedIn() || !$this->isActivated()) return false;
        if (DatawrapperHooks::hookRegistered(DatawrapperHooks::USER_MAY_PUBLISH)) {
            $user = DatawrapperSession::getUser(0);
            foreach (DatawrapperHooks::execute(DatawrapperHooks::USER_MAY_PUBLISH, $user, $chart) as $value) {
                if ($value === false) return false;
            }
        }
        return true;
    }

    /*
     * returns the highest-priority product that is enabled for this user
     */
    public function getActiveProduct() {
        $user = $this;
        $product = null;

        $ups = UserProductQuery::create()
            ->filterByUserId($user->getId())
            ->find();

        foreach ($ups as $up) {
            $prod = $up->getProduct();

            if ($product == null || $product->getPriority() < $prod->getPriority()) {
                $product = $prod;
            }
        }

        $organizations = $user->getActiveOrganizations();

        foreach ($organizations as $org) {
            $ops = OrganizationProductQuery::create()
                    ->filterByOrganization($org)
                    ->find();

            foreach ($ops as $op) {
                $prod = $op->getProduct();

                if ($product == null || $product->getPriority() < $prod->getPriority()) {
                    $product = $prod;
                }
            }
        }

        if ($product == null) {
            // get lowest prio product as default
            $product = ProductQuery::create()->orderByPriority("asc")->limit(1)->findOne();
        }

        return $product;
    }

    public function getActiveUserProduct() {
        $user = $this;
        $userProduct = null;

        $ups = UserProductQuery::create()
            ->filterByUserId($user->getId())
            ->find();

        foreach ($ups as $up) {
            $prod = $up->getProduct();

            if ($userProduct == null || $userProduct->getProduct()->getPriority() < $prod->getPriority()) {
                $userProduct = $up;
            }
        }

        return $userProduct;
    }

} // User
