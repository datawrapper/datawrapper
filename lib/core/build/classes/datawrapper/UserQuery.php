<?php



/**
 * Skeleton subclass for performing query and update operations on the 'user' table.
 *
 * 
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class UserQuery extends BaseUserQuery {

    public function getUserByPwdResetToken($token) {
        $users = $this->filterByResetPasswordToken($token)->find();
        if (count($users) == 1) return $users[0];
        return false;
    }

    public function orderByChartCount($dir = Criteria::ASC) {
        return $this->orderBy('chartCount', $dir);
    }



} // UserQuery
