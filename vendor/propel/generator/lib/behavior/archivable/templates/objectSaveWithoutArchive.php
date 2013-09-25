
/**
 * Persists the object to the database without archiving it.
 *
 * @param PropelPDO $con Optional connection object
 *
 * @return     <?php echo $objectClassname ?> The current object (for fluent API support)
 */
public function saveWithoutArchive(PropelPDO $con = null)
{
<?php if (!$isArchiveOnInsert): ?>
    if (!$this->isNew()) {
        $this->archiveOnUpdate = false;
    }
<?php elseif (!$isArchiveOnUpdate): ?>
    if ($this->isNew()) {
        $this->archiveOnInsert = false;
    }
<?php else: ?>
    if ($this->isNew()) {
        $this->archiveOnInsert = false;
    } else {
        $this->archiveOnUpdate = false;
    }
<?php endif; ?>

    return $this->save($con);
}
