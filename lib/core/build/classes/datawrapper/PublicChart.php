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
     * writes raw csv data to the file system store
     *
     * @param csvdata  raw csv data string
     */
    public function writeData($csvdata) {
        $cfg = $GLOBALS['dw_config'];

        if (isset($cfg['charts-s3']) && isset($cfg['charts-s3']['write'])
            && $cfg['charts-s3']['write'] == true) {
            // s3 filename
            $filename = 's3://' . $cfg['charts-s3']['bucket'] . '/' .
                $this->getChart()->getRelativeDataPath() . '/' . $this->getDataFilename();
        } else {
            // local filename
            $path = $this->getChart()->getDataPath();
            if (!file_exists($path)) mkdir($path, 0775);
            $filename = $path . '/' . $this->getDataFilename();
        }

        file_put_contents($filename, $csvdata);
        return $filename;
    }

    /**
     * load data from file sytem
     */
    public function loadData() {
        $config = $GLOBALS['dw_config'];

        if (isset($config['charts-s3']) && $config['charts-s3']['read']) {
            $filename = 's3://' . $config['charts-s3']['bucket'] . '/' .
              $this->getRelativeDataPath() . '/' .$this->getDataFilename();
        } else {
            $filename = $this->getDataPath() . '/' . $this->getDataFilename();
        }
        try {
            return file_get_contents($filename);
        } catch (Exception $ex) {
            return '';
        }
    }
}
