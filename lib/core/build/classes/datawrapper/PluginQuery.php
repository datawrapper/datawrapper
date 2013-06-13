<?php



/**
 * Skeleton subclass for performing query and update operations on the 'plugin' table.
 *
 * 
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class PluginQuery extends BasePluginQuery {

    public function isInstalled($plugin_id) {
        return count($this->filterByEnabled(true)->filterById($plugin_id)->find()) > 0;
    }

} // PluginQuery
