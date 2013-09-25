
/**
 * Populates the the current object based on a $archiveTablePhpName archive object.
 *
 * @param      <?php echo $archiveTablePhpName ?> $archive An archived object based on the same class
 <?php if ($usesAutoIncrement && !$fakeAutoIncrementParameter): ?>
 * @param      Boolean $populateAutoIncrementPrimaryKeys
 *               If true, autoincrement columns are copied from the archive object.
 *               If false, autoincrement columns are left intact.
 <?php elseif ($fakeAutoIncrementParameter): ?>
 * @param      Boolean $populateAutoIncrementPrimaryKeys Not used! Defined to comply with php strict standards
 <?php endif; ?>
 *
 * @return     <?php echo $objectClassname ?> The current object (for fluent API support)
 */
public function populateFromArchive($archive<?php if ($usesAutoIncrement || $fakeAutoIncrementParameter): ?>, $populateAutoIncrementPrimaryKeys = false<?php endif; ?>) {
<?php if ($usesAutoIncrement && !$fakeAutoIncrementParameter): ?>
    if ($populateAutoIncrementPrimaryKeys) {
<?php foreach ($columns as $col): ?>
<?php if ($col->isAutoIncrement()): ?>
        $this->set<?php echo $col->getPhpName() ?>($archive->get<?php echo $col->getPhpName() ?>());
<?php endif; ?>
<?php endforeach; ?>
    }
<?php endif; ?>
<?php foreach ($columns as $col): ?>
<?php if (!$col->isAutoIncrement()): ?>
    $this->set<?php echo $col->getPhpName() ?>($archive->get<?php echo $col->getPhpName() ?>());
<?php endif; ?>
<?php endforeach; ?>

    return $this;
}
