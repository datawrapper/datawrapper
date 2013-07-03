CHANGELOG
---------

### 1.4.3
* fixed severe bug in base theme (hotfix)
* allowed using uncompressed JS in chart preview
* allowed inverting of y axis in line charts
* fixed analytics in core

### 1.4.2
* refactored themes into plugin
* refactored l10n into a class

### 1.4.1
* refactored demo datasets into plugins
* minor bugfixes

### 1.4.0
* added table plugin
* added plugins system
* created datawrapper hook system (lib/hooks)
* refactored visualizations to plugins
* replaced gettext translation with generic JSON files
* simplified plugin localization
* refactored static image export into plugin

### 1.3.3
* trimming row labels in filter UI
* increased character limit to 40 chars
* trimming labels before counting characters
* fixed column chart label positions
* fixed line chart legend position
* bugfix: change password in settings

### 1.3.2
* added (optional) higher security for passwords, [read more](https://github.com/datawrapper/datawrapper/wiki/Enabling-secure-auth-key).
* added page for setting up admin account after fresh install
* fixed admin dashboard
* allowed customization of title
* refactored defaults in config
* allowed setting default for show_in_gallery
* enabled inverting the nav bar
* fixed bar chart display with negative bars

### 1.3.1
* allowed changing job status in admin page
* added job status 'canceled'
* ensured minimum width/height of 1 pixel for bars in bar/column charts
* allowed customization of logo
* allowed insertion of custom css

### 1.3.0
* allowed input of named colors
* ignoring data series by clicking table header
* made MyCharts page searchable
* allowed preventing guest access
* customizable home page
* customizable languages
* added roles sysadmin and graphic-editor
* line chart interprets time series data
* bugfix: chart editor overrides preferred embed size in visualize step
* showing translation status in admin pages
* special date selector for time series shown in 1d charts
* mycharts: allowed filtering charts by publish status
* show warning if negative values are displayed in stacked bar charts
* show values on hover in grouped/stacked bar charts

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
