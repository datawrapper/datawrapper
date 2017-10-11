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

    public function getOwnerId() {
        if ($this->getType() == 'user') return $this->getUserId();
        if ($this->getType() == 'organization') return $this->getOrgId();
        return null;
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
        $sql = 'UPDATE chart SET in_Folder = :new WHERE in_Folder = :old';
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
    public function getSubFolders($as_array=false) {
        $folders = FolderQuery::create()->findByParentId($this->getId());
        if (!$as_array) return $folders;
        $out = [];
        foreach ($folders as $folder) {
            $out[] = $folder;
        }
        return $out;
    }

    public function getSubtreeFolderIds() {
        $queue = $this->getSubFolders(true);
        $folder_ids = [];
        $max_iter = 10000;
        while (!empty($queue) && $max_iter-->0) {
            $f = array_shift($queue);
            // append children to array
            $queue = array_merge($queue, $f->getSubFolders(true));
            $folder_ids[] = $f->getId();
        }
        return $folder_ids;
    }

    /*
     * propagate owner changes through the sub-folders
     * and all charts in them
     */
    public function propagateOwner() {
        // first let's get a list of all sub-folders
        $folder_ids = [];
        $user_id = $this->getUserId();
        $org_id = $this->getOrgId();
        $traverse = function($folder) use (&$folder_ids, &$traverse) {
            $folder_ids[] = $folder->getId();
            $subfolders = $folder->getSubFolders();
            foreach ($subfolders as $sfolder) {
                $traverse($sfolder);
            }
        };
        $traverse($this);

        // update folders
        $folders = FolderQuery::create()->filterByFolderId($folder_ids);
        $folders->update([
            'UserId' => $user_id,
            'OrgId' => $org_id
        ]);

        // now get a list of all charts in those folders
        $charts = ChartQuery::create()
            ->filterByInFolder($folder_ids);
        // and update their owner
        if ($this->getType() == 'organization') {
            $charts->update([
                'OrganizationId' => $this->getOrgId()
            ]);
        } else {
            $charts->update([
                'AuthorId' => $this->getUserId(),
                'OrganizationId' => null
            ]);
        }
    }

}
