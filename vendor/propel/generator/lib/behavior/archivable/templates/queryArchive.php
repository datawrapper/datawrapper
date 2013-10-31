
/**
 * Copy the data of the objects satisfying the query into <?php echo $archiveTablePhpName ?> archive objects.
 * The archived objects are then saved.
 * If any of the objects has already been archived, the archived object
 * is updated and not duplicated.
 * Warning: This termination methods issues 2n+1 queries.
 *
 * @param      PropelPDO $con	Connection to use.
 * @param      Boolean $useLittleMemory	Whether or not to use PropelOnDemandFormatter to retrieve objects.
 *               Set to false if the identity map matters.
 *               Set to true (default) to use less memory.
 *
 * @return     int the number of archived objects
 * @throws     PropelException
 */
public function archive($con = null, $useLittleMemory = true)
{
    $totalArchivedObjects = 0;
    $criteria = clone $this;
    // prepare the query
    $criteria->setWith(array());
    if ($useLittleMemory) {
        $criteria->setFormatter(ModelCriteria::FORMAT_ON_DEMAND);
    }
    if ($con === null) {
        $con = Propel::getConnection(<?php echo $modelPeerName ?>::DATABASE_NAME, Propel::CONNECTION_WRITE);
    }
    $con->beginTransaction();
    try {
        // archive all results one by one
        foreach ($criteria->find($con) as $object) {
            $object->archive($con);
            $totalArchivedObjects++;
        }
        $con->commit();
    } catch (PropelException $e) {
        $con->rollBack();
        throw $e;
    }

    return $totalArchivedObjects;
}
