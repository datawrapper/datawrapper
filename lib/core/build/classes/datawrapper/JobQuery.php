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

    public function createExportJob($chart, $user, $params) {
        $this->createJob('export', $chart, $user, $params);
    }

    /*
     * returns the estimated time to complete a new job
     */
    public function estimatedTime($type) {
        return -1;
    }

    private function createJob($type, $chart, $user, $params) {
        $job = new Job();
        $job->setChartId($chart->getId());
        $job->setUserId($user->getId());
        $job->setCreatedAt(time());
        $job->setType($type);
        $job->setParameter(json_encode($params));
        $job->save();

        return $job;
    }

} // JobQuery
