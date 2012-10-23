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
        $i = 0;
        while ($i++ < 10) {
            try {
                $chart = new Chart();
                $chart->setId(self::_rand_chars(5));
                $chart->setCreatedAt(time());
                $chart->setLastModifiedAt(time());
                if ($user->isLoggedIn()) {
                    $chart->setAuthorId($user->getId());
                } else {
                    // remember session id to be able to assign this chart
                    // to a newly registered user
                    $chart->setGuestSession(session_id());
                }
                // find a nice, more or less unique title
                $untitled = _('Untitled');
                $title = '[' . $untitled;
                $untitledCharts = $this->filterByAuthorId($user->getId())
                    ->filterByTitle('['.$untitled.'%')
                    ->filterByDeleted(false)
                    ->find();
                if (count($untitledCharts) > 0) $title .= '-'.count($untitledCharts);
                $chart->setTitle($title . ']');

                // todo: use global default theme
                $chart->setTheme(isset($GLOBALS['dw_config']['default_theme']) ? $GLOBALS['dw_config']['default_theme'] : 'default');
                $chart->setLocale(''); // no default locale
                $chart->setType(isset($GLOBALS['dw_config']['default_vis']) ? $GLOBALS['dw_config']['default_vis'] : 'bar-chart');

                $defaultMeta = Chart::defaultMetaData();

                $chart->setMetadata(json_encode($defaultMeta));
                // $chart->setLanguage($user->getLanguage());  // defaults to user language
                $chart->save();
                break;
            } catch (Exception $e) {
                print $e;
                continue;
            }
        }
        if ($chart->isNew()) {
            throw Exception('could not get an id for the chart');
        } else {
            return $chart;
        }
    }

    /*
     * copy an existing chart and store it as new
     */
    public function copyChart($src) {
        $chart = new Chart();
        // new id
        $chart->setId(self::_rand_chars(5));
        // but the rest remains the same
        $chart->setUser($src->getUser());
        $chart->setTitle($src->getTitle().' ('._('Copy').')');
        $chart->setMetadata(json_encode($src->getMetadata()));
        $chart->setTheme($src->getTheme());
        $chart->setLocale($src->getLocale());
        $chart->setType($src->getType());
        $chart->setCreatedAt(time());
        $chart->setLastModifiedAt(time());

        $chart->setLastEditStep(3);

        // we need to copy the data, too
        $chart->writeData($src->loadData());

        $chart->save();

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


    public function getPublicChartsByUser($user, $key = '', $val = '') {
        $query = $this->filterByAuthorId($user->getId())
            ->filterByDeleted(false)
            ->orderByLastModifiedAt('desc')
            ->filterByLastEditStep(array('min' => 2));

        if ($key == 'layout') $query->filterByTheme($val);
        if ($key == 'vis') $query->filterByType($val);
        if ($key == 'month') $query->filterByCreatedAt(array('min' => $val.'-01', 'max' => $val.'-31'));
        return $query->find();
    }


} // ChartQuery
