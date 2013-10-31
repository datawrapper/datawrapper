
/**
 * Enable/disable auto-archiving on update for the next query.
 *
 * @param boolean $archiveOnUpdate True if the query must archive updated objects, false otherwise.
 */
public function setArchiveOnUpdate($archiveOnUpdate)
{
    $this->archiveOnUpdate = $archiveOnUpdate;
}
