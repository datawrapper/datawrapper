<?php



/**
 * Skeleton subclass for representing a row from the 'action' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Action extends BaseAction {

    public static function logAction($user, $key, $details = null) {
        $action = new Action();
        $action->setUser($user);
        $action->setKey($key);
        if (!empty($details)) {
            if (!is_numeric($details) && !is_string($details)) {
                $details = json_encode($details);
            }
            $action->setDetails($details);
        }
        $action->setActionTime(time());
        $action->save();
    }

} // Action
