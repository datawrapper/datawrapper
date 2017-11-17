<?php



/**
 * Skeleton subclass for representing a row from the 'product' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Product extends BaseProduct
{
    public function hasPlugin(Plugin $plugin) {
        return ProductPluginQuery::create()
            ->filterByProduct($this)
            ->filterByPlugin($plugin)
            ->count() > 0;
    }

    public function hasActiveUser() {
        return UserProductQuery::create()
                ->filterByProduct($this)
                ->filterByExpires('now', Criteria::GREATER_EQUAL)
                ->count() > 0;
    }

    public function hasActiveOrganization() {
        return OrganizationProductQuery::create()
                ->filterByProduct($this)
                ->filterByExpires('now', Criteria::GREATER_EQUAL)
                ->count() > 0;
    }

    public function getData() {
        $data = parent::getData();
        if(is_string($data)) {
            $data = json_decode($data, true);
        }

        return $data;
    }

    public function isSubscription() {
        $period = $this->getPeriod();

        return $period !== self::PERIOD_ONCE && $period !== null;
    }

    public function get($key) {
        $d = $this->getData();
        if (isset($d[$key])) return $d[$key];
        return null;
    }

    public function addOrganizationProduct(OrganizationProduct $orgProduct) {
        DatawrapperHooks::execute(DatawrapperHooks::PRODUCT_ORGANIZATION_ADD, $this, $orgProduct->getOrganization());
        parent::addOrganizationProduct($orgProduct);
    }

    public function removeOrganization(Organization $org) {
        DatawrapperHooks::execute(DatawrapperHooks::PRODUCT_ORGANIZATION_REMOVE, $this, $org);
        parent::removeOrganization($org);
    }
}

