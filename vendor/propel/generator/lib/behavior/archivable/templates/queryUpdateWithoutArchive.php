
/**
 * Delete records matching the current query without archiving them.
 *
 * @param      array $values Associative array of keys and values to replace
 * @param      PropelPDO $con an optional connection object
 * @param      boolean $forceIndividualSaves If false (default), the resulting call is a BasePeer::doUpdate(), ortherwise it is a series of save() calls on all the found objects
 *
 * @return integer the number of deleted rows
 */
public function updateWithoutArchive($values, $con = null, $forceIndividualSaves = false)
{
    $this->archiveOnUpdate = false;

    return $this->update($values, $con, $forceIndividualSaves);
}
