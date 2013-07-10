<?php



/**
 * Skeleton subclass for representing a row from the 'plugin_data' table.
 *
 * 
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class PluginData extends BasePluginData {

    public function getData() {
        $data = parent::getData();
        return json_decode($data, true);
    }

    public function setData($data) {
        parent::setData(json_encode($data));
    }

} // PluginData
