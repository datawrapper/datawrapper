<?php



/**
 * Skeleton subclass for performing query and update operations on the 'user_plugin_cache' table.
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class UserPluginCacheQuery extends BaseUserPluginCacheQuery
{
    public static function initInvalidateHooks() {
        // just clear the entire cache
        $invalidateAll = function() {
            UserPluginCacheQuery::create()
            ->find()
            ->delete();
        };
        DatawrapperHooks::register(DatawrapperHooks::PLUGIN_INSTALLED, $invalidateAll);
        DatawrapperHooks::register(DatawrapperHooks::PLUGIN_UNINSTALLED, $invalidateAll);
        DatawrapperHooks::register(DatawrapperHooks::PLUGIN_SET_PRIVATE, $invalidateAll);

        // clear cache for single user
        $invalidateUser = function($orgOrProduct, User $user) {
            UserPluginCacheQuery::create()
                ->findByUserId($user->getId())
                ->delete();
        };
        DatawrapperHooks::register(DatawrapperHooks::USER_ORGANIZATION_ADD, $invalidateUser);
        DatawrapperHooks::register(DatawrapperHooks::USER_ORGANIZATION_REMOVE, $invalidateUser);
        DatawrapperHooks::register(DatawrapperHooks::PRODUCT_USER_ADD, $invalidateUser);
        DatawrapperHooks::register(DatawrapperHooks::PRODUCT_USER_REMOVE, $invalidateUser);

        // clear cache for all users in an organization
        $invalidateOrg = function(Product $product, Organization $org) {
            UserPluginCacheQuery::create()
                ->filterByUser($org->getActiveUsers())
                ->delete();
        };
        DatawrapperHooks::register(DatawrapperHooks::PRODUCT_ORGANIZATION_ADD, $invalidateOrg);
        DatawrapperHooks::register(DatawrapperHooks::PRODUCT_ORGANIZATION_REMOVE, $invalidateOrg);

        // clear cache for all users with access to a product
        $invalidateProduct = function(Product $product, Plugin $plugin) {
            $query = UserPluginCacheQuery::create();
            foreach ($product->getOrganizations() as $org) {
                $query = $query->filterByUser($org->getActiveUsers())->_or();
            }
            $query->filterByUser($product->getUsers())->delete();
        };
        DatawrapperHooks::register(DatawrapperHooks::PRODUCT_PLUGIN_ADD, $invalidateProduct);
        DatawrapperHooks::register(DatawrapperHooks::PRODUCT_PLUGIN_REMOVE, $invalidateProduct);

    }

}
