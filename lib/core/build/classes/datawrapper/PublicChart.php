<?php



/**
 * Skeleton subclass for representing a row from the 'chart_public' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class PublicChart extends BasePublicChart {
    private $assets;

    /*
     * copy the current chart data to this public chart
     */
    public function update() {
        $chart = $this->getChart();
        // copy metadata
        $this->setTitle($chart->getTitle());
        $this->setType($chart->getType());
        $this->setMetadata($chart->getRawMetadata());
        $this->setExternalData($chart->getExternalData());
        $this->setAuthorId($chart->getAuthorId());
        $this->setOrganizationId($chart->getOrganizationId());
        $this->save();
        // copy data
        $this->writeData($chart->loadData());
    }

    /**
     * get the filename of this charts data file, which is usually
     * just the chart id + csv extension
     */
    protected function getDataFilename() {
        return $this->getId() . '.public.csv';
    }

    /**
     * writes any asset to the asset store using v3 api
     */
    public function writeAsset($filename, $data) {
        if (!$this->assets) $this->assets = [];

        [$status, $body] = call_v3_api('PUT',
            '/charts/' . $this->getId() . '/assets/' . $filename, $data, "text/csv");

        if (!in_array($status, [200, 201, 204])) {
            throw new RuntimeException('Could not write chart asset using v3 API.');
        }

        $this->assets[$filename] = $data;
        $this->setLastModifiedAt(time());
    }

    /**
     * writes raw csv data to the asset store using v3 api
     *
     * @param csvdata  raw csv data string
     */
    public function writeData($csvdata) {
        $this->writeAsset($this->getDataFilename(), $csvdata);
    }

    /**
     * load any asset from the asset store using v3 api
     */
    public function loadAsset($filename) {
        if (!$this->assets) $this->assets = [];

        if (empty($this->assets[$filename])) {
            [$status, $body] = call_v3_api('GET',
            '/charts/' . $this->getId() . '/assets/' . $filename);

            if (!in_array($status, [200, 201, 204, 404])) {
                throw new RuntimeException('Could not read chart asset using v3 API.');
            }

            if ($status == "404") {
                $this->assets[$filename] = "";
            } else {
                $this->assets[$filename] = (
                    gettype($body) == "string"
                    ? (preg_match('/^\s+$/', $body) ? '' : $body)
                    : json_encode_safe($body, 1)
                );
            }
        }

        return $this->assets[$filename];
    }

    /**
     * load data from the asset store using v3 api
     */
    public function loadData() {
        return $this->loadAsset($this->getDataFilename());
    }

    public function updateMetadata($key, $value) {
        $meta = json_decode($this->getMetadata(), true);
        $keys = explode('.', $key);
        $p = &$meta;
        foreach ($keys as $key) {
            if (!isset($p[$key])) $p[$key] = array();
            $p = &$p[$key];
        }
        $p = $value;
        $this->setMetadata(json_encode($meta, JSON_UNESCAPED_UNICODE));
    }
}
