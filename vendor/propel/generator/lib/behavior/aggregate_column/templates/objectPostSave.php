if (null !== $this-><?php echo $columnRefk ?>) {
    $this->set<?php echo $column->getPhpName() ?>($this->compute<?php echo $column->getPhpName() ?>($con));
    if ($this->isModified()) {
        $this->save($con);
    }
}