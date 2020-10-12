<?php



/**
 * Skeleton subclass for performing query and update operations on the 'chart' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class ChartQuery extends BaseChartQuery {

    /**
     * creates a new empty chart
     */
    public function createEmptyChart($user) {
        $cfg = $GLOBALS['dw_config'];
        $defaults = isset($cfg['defaults']) ? $cfg['defaults'] : array();

        $chart = new Chart();
        $chart->setId($this->getUnusedRandomId());
        $chart->setCreatedAt(time());
        $chart->setLastModifiedAt(time());
        if ($user->isLoggedIn()) {
            $chart->setAuthorId($user->getId());
            $org = $user->getCurrentOrganization();
            if (!empty($org)) {
                $chart->setOrganization($org);

                $settings = $org->getSettings();
                if (isset($settings["default"]["folder"])) {
                    $folder = FolderQuery::create()->findPk($settings["default"]["folder"]);
                    if (!is_null($folder) && $folder->getOrgId() == $org->getId()) {
                        $chart->setInFolder($folder->getId());
                    }
                 }
            }
        } else {
            // remember session id to be able to assign this chart
            // to a newly registered user
            $chart->setGuestSession(session_id());
        }
        // find a nice, more or less unique title
        $untitled = __('Insert title here');
        $title = '[ ' . $untitled . ' ]';
        $chart->setTitle($title);

        $chart->setLocale(str_replace("_", '-', DatawrapperSession::getLanguage()));
        
        $chart->setType(isset($defaults['vis']) ? $defaults['vis'] : 'bar-chart');

        $chart->setTheme(isset($defaults['theme']) ? $defaults['theme'] : 'default');

        if ($user->isLoggedIn()) {
            $org = $user->getCurrentOrganization();
            if (!empty($org)) {
                $settings = $org->getSettings();
                if (isset($settings["default"]) && isset($settings["default"]["locale"])) {
                    $chart->setLocale($settings["default"]["locale"]);
                }

                $def_org_theme = $org->getDefaultTheme();
                if (!empty($def_org_theme) && ThemeQuery::create()->findPk($def_org_theme)) {
                    $chart->setTheme($def_org_theme);
                }
            }
        }

        $defaultMeta = Chart::defaultMetaData();
        $themeMeta = ThemeQuery::create()->findPk($chart->getTheme())->getThemeData('metadata') ?? [];
        $meta = array_merge_recursive_simple($defaultMeta, $themeMeta);
        $chart->setMetadata(json_encode($meta));

        $chart->setShowInGallery(isset($defaults['show_in_gallery']) ? $defaults['show_in_gallery'] : false);
        $chart->save();
        return $chart;
    }

    public function getUnusedRandomId() {
        do {
            $randid = self::_rand_chars(5);
        } while ($this->findOneById($randid));
        return $randid;
    }

    /*
     * copy an existing chart and store it as new
     */
    public function copyChart($src, $changeTitle = true, $copyData = true) {
        $chart = new Chart();
        $user = Session::getUser();

        // new id
        $chart->setId($this->getUnusedRandomId());
        // but the rest remains the same
        $chart->setUser($src->getUser());
        $chart->setTitle($src->getTitle(). ($changeTitle ? ' ('.__('Copy').')' : ''));
        $chart->setRawMetadata($src->getRawMetadata());
        $chart->setTheme($src->getTheme());
        $chart->setLocale($src->getLocale());
        $chart->setType($src->getType());
        $chart->setCreatedAt(time());
        $chart->setLastModifiedAt(time());
        $chart->setForkedFrom($src->getId());
        $chart->setOrganization($src->getOrganization());
        $chart->setInFolder($src->getInFolder());
        $chart->setExternalData($src->getExternalData());

        if ($user->isAdmin() && $user->getId() != $chart->getUser()->getId()) {
            // an admin duplicates a chart from someone else
            // transfer chart ownership to admin
            $chart->setUser($user);
            $chart->setOrganization(null);
            $chart->setInFolder(null);
        }

        $chart->setLastEditStep(3);

        if ($copyData) {
            // make sure the cached data is fresh
            $src->refreshExternalData();
        }

        $chart->save();

        if ($copyData) {
            // we need to copy the data, too
            $chart->writeData($src->loadData());
        }

        Hooks::execute(Hooks::CHART_COPY, $src, $chart);

        return $chart;
    }

    public function copyPublicChart($src, $user) {
        if ($src->getLastEditStep() < 5) {
            return null;
        }
        $chart = $this->copyChart($src, true, false);
        // use original title
        $chart->setTitle($src->getTitle());
        $public = $src->getPublicChart();

        if ($public) {
            $chart->setType($public->getType());
            $chart->setTitle($public->getTitle());
            $chart->setRawMetadata($public->getMetadata());
        }

        if ($user->isLoggedIn()) {
            $chart->setUser($user);
            $chart->setOrganization($user->getCurrentOrganization());
        } else {
            // remember session id to be able to assign this chart
            // to a newly registered user
            $chart->setOrganization(null);
            $chart->setAuthorId(null);
            $chart->setGuestSession(session_id());
        }

        $chart->save();

        if ($public) {
            if (!empty($public->getExternalData())) {
                $chart->setExternalData($public->getExternalData());
                $chart->refreshExternalData();
            } else {
                $chart->writeData($public->loadData());
            }
        }

        return $chart;
    }

    /*
     * generate a random id string for charts
     */
    protected static function _rand_chars($l, $u = FALSE) {
        // implementation taken from http://www.php.net/manual/de/function.rand.php#87487
        $c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
        if (!$u) for ($s = '', $i = 0, $z = strlen($c)-1; $i < $l; $x = rand(0,$z), $s .= $c{$x}, $i++);
        else for ($i = 0, $z = strlen($c)-1, $s = $c{rand(0,$z)}, $i = 1; $i != $l; $x = rand(0,$z), $s .= $c{$x}, $s = ($s{$i} == $s{$i-1} ? substr($s,0,-1) : $s), $i=strlen($s));
        return $s;
    }

    /*
     * My Charts
     */
    private function publicChartsByIdQuery($id, $org, $filter, $order='date') {
        if (isset($filter['q'])) {
            // this is a special hack for the mycharts search, where
            // we want to search accross all charts a user has access to
            $user = UserQuery::create()->findPk($id);
            $conditions = ['user'];
            $query = $this->condition('is-user', 'Chart.AuthorId = ?', $user->getId())
                ->condition('no-org', 'chart.organization_id is NULL')
                ->combine(['is-user', 'no-org'], 'and', 'user');
            $orgs = [];
            foreach ($user->getOrganizations() as $org) {
                $query = $query->condition('org-'.$org->getId(), 'Chart.OrganizationId = ?', $org->getId());
                $orgs[] = $org->getId();
                $conditions[] = 'org-'.$org->getId();
            }
            $query = $query->where($conditions, 'or');

        } else {
            if ($org) {
                $query = $this->filterByOrganizationId($id);
            } else {
                $query = $this->filterByAuthorId($id)
                    ->filterByOrganizationId(null);
            }
        }

        switch ($order) {
            case 'title': $query->orderByTitle(); break;
            case 'published_at': $query->orderByPublishedAt('desc'); break;
            case 'theme': $query->orderByTheme(); break;
            case 'type': $query->orderByType(); break;
            case 'status': $query->orderByLastEditStep('desc'); break;
            case 'created_at': $query->orderByCreatedAt('desc'); break;
            default: $query->orderByLastModifiedAt('desc'); break;
        }
        $query->filterByLastEditStep(array('min' => 2));
        if (count($filter) > 0) {
            foreach ($filter as $key => $val) {
                switch ($key) {
                    case 'layout':
                    case 'theme':
                        $query->filterByTheme($val);
                        break;
                    case 'vis':
                        $query->filterByType($val);
                        break;
                    case 'month':
                        $query->filterByCreatedAt(array('min' => $val.'-01', 'max' => $val.'-31'));
                        break;
                    case 'folder':
                        $query->filterByInFolder($val);
                        break;
                    case 'q':
                        $query->condition('in-title', 'Chart.Title LIKE ?', '%'.$val.'%');
                        $query->condition('in-intro', 'Chart.Metadata LIKE ?', '%"intro":"%'.$val.'%"%');
                        $query->condition('in-source', 'Chart.Metadata LIKE ?', '%"source-name":"%'.$val.'%"%');
                        $query->condition('in-source-url', 'Chart.Metadata LIKE ?', '%"source-url":"%'.$val.'%"%');
                        $query->where(array('in-title', 'in-intro', 'in-source', 'in-source-url'), 'or');
                        break;
                    case 'status':
                        if ($val == 'published') $query->filterByLastEditStep(array('min' => 4));
                        else if ($val == 'draft') $query->filterByLastEditStep(array('max'=> 3));
                }
            }
        }
        return $query->filterByDeleted(false);
    }

    public function getPublicChartsById($id, $org, $filter=array(), $start=0, $perPage=15, $order=false) {
        return $this
            ->publicChartsByIdQuery($id, $org, $filter, $order)
            ->limit($perPage)
            ->offset($start)
            ->find();
    }

    public function countPublicChartsById($id, $org, $filter=array()) {
        return $this
            ->publicChartsByIdQuery($id, $org, $filter)
            ->count();
    }

    public function getGuestCharts() {
        return $this
            ->filterByGuestSession(session_id())
            ->filterByDeleted(false)
            ->orderByCreatedAt('desc')
            ->find();
    }

    /*
     * Gallery Charts
     */

    private function galleryChartsQuery($filter) {
        $query = $this->filterByShowInGallery(true)
            ->filterByLastEditStep(array('min' => 5))
            ->filterByDeleted(false)
            ->orderByCreatedAt('desc');
        foreach ($filter as $key => $val) {
            if ($key == 'layout') $query->filterByTheme($val);
            if ($key == 'vis') $query->filterByType($val);
            if ($key == 'month') $query->filterByCreatedAt(array('min' => $val.'-01', 'max' => $val.'-31'));
        }
        return $query;
    }

    public function getGalleryCharts($filter=array(), $start=0, $perPage=15) {
        return $this
            ->galleryChartsQuery($filter)
            ->limit($perPage)
            ->offset($start)
            ->find();
    }

    public function countGalleryCharts($filter=array()) {
        return $this
            ->galleryChartsQuery($filter)
            ->count();
    }

    public function filterByUserAccess($user) {
        $org_ids = [];
        foreach ($user->getOrganizations() as $org) {
            $org_ids[] = $org->getId();
        }
        return $this
            ->filterByDeleted(false)
            ->condition('user', 'chart.author_id = ?', $user->getId())
            ->condition('org', 'chart.organization_id IN ?', $org_ids)
            ->where(['user', 'org'], 'or');
    }

} // ChartQuery
