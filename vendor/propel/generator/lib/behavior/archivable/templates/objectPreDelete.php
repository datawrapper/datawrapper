<?php if ($isAddHooks) : ?>
if ($ret) {
    if ($this->archiveOnDelete) {
        // do nothing yet. The object will be archived later when calling <?php echo $queryClassname ?>::delete().
    } else {
        $deleteQuery->setArchiveOnDelete(false);
        $this->archiveOnDelete = true;
    }
}
<?php else: ?>
if ($this->archiveOnDelete) {
    // do nothing yet. The object will be archived later when calling <?php echo $queryClassname ?>::delete().
} else {
    $deleteQuery->setArchiveOnDelete(false);
    $this->archiveOnDelete = true;
}
<?php endif;
