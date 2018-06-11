<?php



/**
 * Skeleton subclass for performing query and update operations on the 'job' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class JobQuery extends BaseJobQuery {


    /*
     * DEPRECATED
     * returns the estimated time to complete a new job
     */
    public function estimatedTime($type) {
        return 0;
    }

    public function createJob($type, $chart, $user, $params) {
        $job = new Job();
        $job->setUserId($user->getId());
        $job->setChartId($chart->getId());
        $job->setCreatedAt(time());
        $job->setDoneAt('3000-01-01 00:00:00');
        $job->setType($type);
        $job->setParameter(json_encode($params, JSON_UNESCAPED_SLASHES));
        $job->setFailReason('');
        $job->save();

        return $job;
    }

} // JobQuery
