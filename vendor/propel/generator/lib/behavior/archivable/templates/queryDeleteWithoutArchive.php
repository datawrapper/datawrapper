
/**
 * Delete records matching the current query without archiving them.
 *
 * @param      PropelPDO $con	Connection to use.
 *
 * @return integer the number of deleted rows
 */
public function deleteWithoutArchive($con = null)
{
    $this->archiveOnDelete = false;

    return $this->delete($con);
}

/**
 * Delete all records without archiving them.
 *
 * @param      PropelPDO $con	Connection to use.
 *
 * @return integer the number of deleted rows
 */
public function deleteAllWithoutArchive($con = null)
{
    $this->archiveOnDelete = false;

    return $this->deleteAll($con);
}
