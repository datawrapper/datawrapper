<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

class TestAuthor extends Author
{
    public function preInsert(PropelPDO $con = null)
    {
        parent::preInsert($con);
        $this->setFirstName('PreInsertedFirstname');

        return true;
    }

    public function postInsert(PropelPDO $con = null)
    {
        parent::postInsert($con);
        $this->setLastName('PostInsertedLastName');
    }

    public function preUpdate(PropelPDO $con = null)
    {
        parent::preUpdate($con);
        $this->setFirstName('PreUpdatedFirstname');

        return true;
    }

    public function postUpdate(PropelPDO $con = null)
    {
        parent::postUpdate($con);
        $this->setLastName('PostUpdatedLastName');
    }

    public function preSave(PropelPDO $con = null)
    {
        parent::preSave($con);
        $this->setEmail("pre@save.com");

        return true;
    }

    public function postSave(PropelPDO $con = null)
    {
        parent::postSave($con);
        $this->setAge(115);
    }

    public function preDelete(PropelPDO $con = null)
    {
        parent::preDelete($con);
        $this->setFirstName("Pre-Deleted");

        return true;
    }

    public function postDelete(PropelPDO $con = null)
    {
        parent::postDelete($con);
        $this->setLastName("Post-Deleted");
    }

    public function postHydrate($row, $startcol = 0, $rehydrate = false)
    {
        parent::postHydrate($row, $startcol, $rehydrate);
        $this->setLastName("Post-Hydrated");
    }
}

class TestAuthorDeleteFalse extends TestAuthor
{
    public function preDelete(PropelPDO $con = null)
    {
        parent::preDelete($con);
        $this->setFirstName("Pre-Deleted");

        return false;
    }
}
class TestAuthorSaveFalse extends TestAuthor
{
    public function preSave(PropelPDO $con = null)
    {
        parent::preSave($con);
        $this->setEmail("pre@save.com");

        return false;
    }

}
