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

    public function allThemesForUser($chart = null) {
        global $dw_config;

        $user = DatawrapperSession::getUser();

        if (!empty($chart) && $chart->getOrganization() !== null) {
            $organization = $chart->getOrganization();
        } else {
            $organization = $user->getCurrentOrganization();
        }

        $includeDefaultThemes = true;

        $themes = array();

        $defaultIds = $dw_config['default-themes'] ?? ["default"];

        if ($organization) {
            if ($organization->getSettings("restrictDefaultThemes")) {
                $includeDefaultThemes = false;
            }
        }

        if ($includeDefaultThemes) {
            foreach ($defaultIds as $def) {
                $themes[] = ThemeQuery::create()->findPk($def);
            }
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

    /*
     * looks for a theme with id $theme_id that can be
     * access by $user
     */
    public function findUserTheme($user, $theme_id) {
        $theme = ThemeQuery::create()->findPk($theme_id);
        if (!$theme) return false;;

        global $dw_config;
        $defaultIds = $dw_config['default-themes'] ?? ["default"];

        if ($user->isAdmin()) {
            return $theme;
        }

        // default themes
        if (in_array($theme_id, $defaultIds)) {
            return $theme;
        }

        $userThemes = UserThemeQuery::create()
            ->filterByUser($user)
            ->filterByTheme($theme)
            ->find();
        if (count($userThemes) > 0) return $theme;

        $organization = $user->getCurrentOrganization();
        if ($organization) {
            $orgThemes = OrganizationThemeQuery::create()
                ->filterByOrganization($organization)
                ->filterByTheme($theme)
                ->find();
            if (count($orgThemes) > 0) return $theme;
        }

        // print_r();
        // if (count($userThemes))
        // foreach ($userThemes as $theme) {
        //     $themes[] = $theme->getTheme();
        // }
    }

}
