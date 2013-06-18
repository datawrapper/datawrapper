<?php

class DatawrapperPlugin_Visualization extends DatawrapperPlugin {

    public function init() {
        $meta = $this->getMeta();
        $datasets = $this->getDemoDataSets();
        $demo_hook = DatawrapperHooks::GET_DEMO_DATASETS;
        if (!empty($meta)) DatawrapperVisualization::register($this, $meta);
        if (!empty($datasets)){
        	$first_element =  reset($datasets);
        	if(is_array($first_element)){
        		foreach ($datasets as $key => $dataset) {
        			DatawrapperHooks::register($demo_hook, function() use ($dataset){
        				return $dataset;
        			});
        		}
        	} else {
        		DatawrapperHooks::register($demo_hook, function() use ($datasets){
        			return $datasets;
        		});
        	}
        }
    }

    public function getMeta() {
        return array();
    }

    public function getDemoDataSets() {
    	return array();
    }

}