<?php

/**
 * Skeleton subclass for representing a row from the 'folder' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Folder extends BaseFolder {

    /*
     * to make our life easier
     */
    public function getId() {
        return $this->getFolderId();
    }

    /*
     * check if a given user is allowed access to this folder
     */
    public function isAccessibleBy($user) {
        $type = $this->getType();
        if ($type == 'user') return $this->getUserId() == $user->getId();
        return OrganizationQuery::create()->findPk($this->getOrgId())->hasUser($user);
    }

    /*
     * creates a more JSON friendly representation of this folder
     */
    public function serialize() {
        return [
            'id' => $this->getFolderId(),
            'name' => $this->getFolderName(),
            'parent' => $this->getParentId(),
            'user' => $this->getUserId(),
            'organization' => $this->getOrgId(),
            'type' => $this->getType()
        ];
    }

    /*
     * returns either "user" or "organization"
     */
    public function getType() {
        if (!empty($this->getUserId())) return 'user';
        if (!empty($this->getOrgId())) return 'organization';
        throw new Error('invalid folder type');
    }

    /*
     * test if this folder would be a valid parent for
     * a new folder created by this user in this org
     */
    public function isValidParent($user, $org_id) {
        $type = $this->getType();
        if ($type == 'user') {
            // check if user id matches
            return $user->getId() == $this->getUserId();
        } else {
            // check if it's the same organization
            return $org_id == $this->getOrgId();
        }
    }

    public function moveChartsToParent() {
        $pdo = Propel::getConnection();
        $sql = 'UPDATE chart SET folder = :new WHERE folder = :old';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':new' => $this->getParentId(),
            ':old' => $this->getId()
        ]);
    }

    public function moveFolder() {

    }

}
