CHANGELOG
---------

### 1.2.9
* added support for S3 domain alias (e.g. s3.datawrapper.de)
* added support for S3 endpoints
* refactored chart publication, fixed occosional bug that stopped chart publication
* live-generating chart thumbnails during chart editing instead of during publication
* you need to migrate the database schema, see [commit message](https://github.com/datawrapper/datawrapper/commit/015fd7a95c5bc5521a9fa2112f9b3bd564995e2b)
* changed mysql engine to innodb
* center preview chart in editor
* replaced old data table with handsontable widget


### 1.2.8
* made job execution (e.g. static chart exports) fail safe
* added admin page showing job status
* you need to migrate the database schema, see [commit message](https://github.com/datawrapper/datawrapper/commit/288a8f13343268e8d8ad46a1f6930a33818fad24)

### 1.2.7
* added generic support for hierarchical datasets
* fixed chart export

### 1.2.6
* visualizations now may define [localized strings](https://github.com/datawrapper/datawrapper/wiki/Visualization-Meta.json-Properties#locale)
* fixed bug with localized numbers in charts
* fixed stack percentages in fullscreen mode
* fixed Piwik tracking code

### 1.2.5
* added percentage stacking mode to stacked column charts
* improved session garbage collection
* fixed ABZV logo
* improved line charts coloring and labeling
* fixed colors in dark theme
* updated German locale
* bugfixes

### 1.2.4
* fixed several IE bugs
* fixed label transitions in bar charts
* updated to jQuery 1.9.1

### 1.2
* animated chart transitions for bar,column and pie charts
* added visual chart selector
* improved editor UI
* redirecting IE6 visitors to static chart
* extensive chart testing in multiple browsers
* simplified installation

### 1.1
* fullscreen mode
* customizable colors
* export static PNG/PDF
* filled line charts
* new theme: Playfair
* spanish translation
* fixed session bug
* updated to bootstrap 2.2
* lots of bugfixes
* [release notes](http://blog.datawrapper.de/2012/datawrapper-1-1/)

### 1.0.2
* publishing charts to Amazon S3

### 1.0
* complete rewrite of old prototype
* replaced Highcharts with custom charts based on d3 and Raphael.js
* [release notes](http://blog.datawrapper.de/2012/hello-world-datawrapper/)