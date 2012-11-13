<?php

interface IDatawrapper_Publish {

    // copies static chart files to a CDN
    function publish($files);

    // removes static chart files from CDN
    function unpublish($files);

    // returns url of published chart
    function getUrl($chart);

}