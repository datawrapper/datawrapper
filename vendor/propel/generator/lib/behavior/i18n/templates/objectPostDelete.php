
// emulate delete cascade
<?php echo $i18nQueryName ?>::create()
    ->filterBy<?php echo $objectClassname ?>($this)
    ->delete($con);
