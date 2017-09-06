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
        if (!$this->isAccessibleBy($user))
            return false;
        if ($type == 'user') {
            // check if user id matches
            return $user->getId() == $this->getUserId();
        } else {
            // check if it's the same organization
            return $org_id == $this->getOrgId();
        }
    }

    /*
     * move all charts in this folder to it's parent folder
     */
    public function moveChartsToParent() {
        $pdo = Propel::getConnection();
        $sql = 'UPDATE chart SET folder = :new WHERE folder = :old';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':new' => $this->getParentId(),
            ':old' => $this->getId()
        ]);
    }

    /*
     * checks if a folder has subfolders
     */
    public function hasSubFolders() {
        return FolderQuery::create()->filterByParentId($this->getId())->count() > 0;
    }

    /*
     * return a list of direct subfolders in a folder
     */
    public function getSubFolders() {
        return FolderQuery::create()->findByParentId($this->getId());
    }

    /*
     * propagate owner changes through the sub-folders
     * and all charts in them
     */
    public function changeOwner($new_type, $new_id) {
        // first let's get a list of all sub-folders
        $folder_ids = [];
        $traverse = function($folder) use ($folder_ids) {
            $folder_ids[] = $folder->getId();
            $subfolders = $folder->getSubFolders();
            foreach ($subfolders as $sfolder) {
                $traverse($sfolder);
            }
        };
        $traverse($this);

        // update folders
        $folders = FolderQuery::create()
            ->filterByFolderId($folder_ids);
        if ($new_type == 'organization') {
            $folders->update([
                'UserId' => null,
                'OrgId' => $new_id
            ]);
        } else {
            $folders->update([
                'UserId' => $new_id,
                'OrgId' => null
            ]);
        }

        // now get a list of all charts in those folders
        $charts = ChartQuery::create()
            ->filterByFolder($folder_ids);
        // and update their owner
        if ($new_type == 'organization') {
            $charts->update([
                'Organization' => $new_id
            ]);
        } else {
            $charts->update([
                'AuthorId' => $new_id,
                'Organization' => null
            ]);
        }
    }

}
