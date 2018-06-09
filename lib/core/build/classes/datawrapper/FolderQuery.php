<?php

/**
 * Skeleton subclass for performing query and update operations on the 'folder' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class FolderQuery extends BaseFolderQuery {

    /*
     * returns a list of all folders a user has access to
     *
     * @param include_org_folders set to false if you don't want to
     *                            include the organization folders
     */
    public function getUserFolders($user) {
        $folders = [];
        $folders[] = [
            'type' => 'user',
            'folders' => $user->getFolders()
        ];
        foreach ($user->getOrganizations() as $organization) {
            // var_dump($organization);
            $folders[] = [
                'type' => 'organization',
                'organization' => $organization,
                'folders' => $organization->getFolders()
            ];
        }
        return $folders;
    }

    public function getParsableFolders($user) {
        $folders = $this->getUserFolders($user);
        foreach ($folders as &$group) {
            if ($group['type'] == 'organization') {
                $group['charts'] = ChartQuery::create()
                    ->filterByOrganization($group['organization'])
                    ->filterByInFolder(null)
                    ->filterByDeleted(false)
                    ->filterByLastEditStep(array('min'=>3))
                    ->count();
                $group['organization'] = $group['organization']->serialize();
            } else {
                $group['charts'] = ChartQuery::create()
                    ->filterByOrganizationId(null)
                    ->filterByInFolder(null)
                    ->filterByDeleted(false)
                    ->filterByUser($user)
                    ->filterByLastEditStep(array('min'=>3))
                    ->count();
            }
            $tmpfolders = [];
            foreach ($group['folders'] as $idx => $fold) {
                $tmpfolders[$idx] = $fold->serialize();
                $tmpfolders[$idx]['charts'] = ChartQuery::create()
                    ->filterByInFolder($fold->getFolderId())
                    ->filterByDeleted(false)
                    ->filterByLastEditStep(array('min'=>3))
                    ->count();
            }
            $group['folders'] = $tmpfolders;
        }
        return $folders;
    }
}
