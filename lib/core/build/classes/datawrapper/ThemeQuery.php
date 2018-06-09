<?php



/**
 * Skeleton subclass for performing query and update operations on the 'theme' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class ThemeQuery extends BaseThemeQuery
{

    public function allThemesForUser() {
        global $dw_config;

        $user = DatawrapperSession::getUser();

        $themes = array();

        $defaultIds = $dw_config['default-themes'] ?? ["default"];

        foreach ($defaultIds as $def) {
            $themes[] = ThemeQuery::create()->findPk($def);
        }

        if ($user->isAdmin()) {
            $allThemes = ThemeQuery::create()->find();

            foreach ($allThemes as $theme) {
                if (in_array($theme->getId(), $defaultIds)) continue;

                $themes[] = $theme;
            }
        } else {
            $userThemes = UserThemeQuery::create()
                ->filterByUser($user)
                ->find();

            foreach ($userThemes as $theme) {
                $themes[] = $theme->getTheme();
            }

            $organization = $user->getCurrentOrganization();

            if ($organization) {
                $orgThemes = OrganizationThemeQuery::create()
                    ->filterByOrganization($organization)
                    ->find();

                foreach ($orgThemes as $theme) {
                    $themes[] = $theme->getTheme();
                }

            }
        }

        usort($themes, function($a, $b) {
            return strtolower($a->getTitle()) > strtolower($b->getTitle()) ? 1 : -1;
        });

        return $themes;
    }

}
