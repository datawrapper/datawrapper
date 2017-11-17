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
        $invalidateAll = function() {
            UserPluginCacheQuery::create()
            ->find()
            ->delete();
        };
        DatawrapperHooks::register(DatawrapperHooks::PLUGIN_INSTALLED, $invalidateAll);
        DatawrapperHooks::register(DatawrapperHooks::PLUGIN_UNINSTALLED, $invalidateAll);
        DatawrapperHooks::register(DatawrapperHooks::PLUGIN_SET_PRIVATE, $invalidateAll);

        $invalidateUser = function($org, $user) {
            UserPluginCacheQuery::create()
                ->findByUserId($user->getId())
                ->delete();
        };
        DatawrapperHooks::register(DatawrapperHooks::USER_ORGANIZATION_ADD, $invalidateUser);
        DatawrapperHooks::register(DatawrapperHooks::USER_ORGANIZATION_REMOVE, $invalidateUser);
    }

    public static function invalidateUser($userOrId) {
        if (!is_int($userOrId)) $userOrId = $userOrId->getId();
        UserPluginCacheQuery::create()
            ->findByUserId($userOrId)
            ->delete();
    }

    public static function invalidateOrganization($org) {
        UserPluginCacheQuery::create()
            ->filterByUser($org->getActiveUsers())
            ->delete();
    }
}
