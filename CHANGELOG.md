CHANGELOG
---------

### 1.9.0
* allow adding of notes below charts
* grouping of vis options in chart editor
* load js libs in reverse order of vis inheritance
* bugfixes with cli publishing
* fixed automatic number format guessing
* replaced old dw.js make script with Gruntfile.js
* admin-themes now shows when themes have been last used
* added hook for adding markup below describe step sidebar
* changed syntax to plugin.php download [giturl]

### 1.8.2
* bugfix with data table in describe step
* allow hiding of admin controllers in admin menu
* fixed deleting charts
* several minor bug fixes

### 1.8.1
* added link to mycharts to account pages menu
* simplified api for alternative signins
* prevent chart previews to be rendered in iframes (optional)
* removed obsolete controller /chart/:chart_id/static

### 1.8.0
* added product system.
* important note: Please run scripts/migrate/1.8.0.sql and composer install after updating.
* removed email-based theme restrictions
* removed plugin export-image from core
* instanciate all plugins first, then run their init() functions
* chart editor redesign
* default theme for organizations
* added support for class-less plugins
* automake mode for easier development
* added twig filter 'css'
* refactored stylesheets using LESS
* simplified plugin system, added support for init.php
* autoloading plugin dependencies if installed using composer
* allow configuration of mail sender
* line chart: custom range in y axis
* line chart: x range annotations
* removed fancy toggle-panel footer
* fixed stupid line chart mobile bug

### 1.7.11
* fixed symlink creation in plugin installation
* reloading chart preview if chart locale changes
* resolving plugin names from class name, not path
* fixed user deletion api

### 1.7.10
* load chart specific locale, if different from UI
* allow hooking into visualize step sidebar
* removed vendor libs from repo
* made Datawrapper Composer-ready
* do not send email activation mails when the email address has not been altered
* minor improvements for the account settings
* fixed delete-account button
* fixed XSS vulnerability
* replaced ext-mysql with PDO in the session handler
* do not use the mysql extension in the check_server script
* cleaned up makefile
* replaces JSMin with JShrink

### 1.7.9
* refactored controller code base
* refactored account templates
* allowing access to plugin classes
* bugfixes

### 1.7.8
* re-structured header navbar
* added font awesome
* allow filtering of missing values in bar charts
* tooltips in header navbar

### 1.7.7
* switched top nav from fixed to static
* added vis option textarea
* flattened navbar appearance
* added hook for customizing navbar logo

### 1.7.6
* disabled fullscreen mode in default theme
* fixed gallery preview
* allowed disabling of login logging
* renamed ``cdn_asset_base_url`` config to ``asset_domain``

### 1.7.5
* user settings: don't complain about existing email if it hasn't been changed
* let admins reset a users password
* replacing n-dashes with normal dashes (increasing tolerance for bad copy & paste input)
* ignoring percentage signs in data input

### 1.7.4
* added json api for themes
* forcing lowercase organization ids

### 1.7.3
* enabled setting initial sorting of data tables
* fixed chart display on mobile devices

### 1.7.2
* fixed access rights for graphic editors
* showing more useful page titles
* removed legacy code

### 1.7.1
* replaced hard-coded CDN path with config value
* bugfix: duplicating charts within organization
* bugfix: pie charts with zeros in dataset
* bugfix: include organization id in md5 hash computation to make sure assets are copied to different S3 buckets
* bugfix: chart publication progress now shown properly

### 1.7.0
* storing reference to source chart on forking/duplicating
* data attributes in header nav
* support hooking into header nav
* re-arranged header nav
* showing lang code in header nav
* added speaking descriptions to core plugins
* added api for managing organizations
* allowing organziation specific plugin configuration
* allowing users in organization to use private plugins
* support for making plugins private
* added organizations
* svg icons for visualization
* replaced old color picker

### 1.6.2
* revised event flow in visualize step
* made pie charts less ugly
* added placeholder image for nojs.png
* fixed bar chart labels
* fixed highlighting of labels with quotes
* line chart: fallback to normal x-axis if not all date values could be parsed
* line chart: fixed label width calculation
* line chart: allowing more lines to be labeled
* removing all related jobs on chart deletion

### 1.6.1
* allow users to select column input format (to resolve ambiguous formats)
* bugfixes

### 1.6
* fixed theme inheritance, no more deep-copying of arrays
* improved language in email communication
* updated Propel to 1.6.8
* updated Twig to 1.13.2
* showing recent charts in dropdown nav
* enabled data attribution in visualize step
* added automatic number formatting
* added column oauth_signin to user table (see migrate sql)
* refactored JavaScript and CSS out of Twig templates
* renamed chart data file to data.csv
* plugin.php can now install plugins from git urls
* display chart id in gallery/mycharts if there's no title
* using [insert title here] as default chart title
* refactored core chart javascript into /js/dw/chart.base.js
* added log scale mode to line chart
* moved transpose button into first table header cell
* bugfixes

### 1.5.4
* added dw.utils.smartRound
* plugin install script performs health checks
* checking for plugin dependencies
* refactored gallery as plugin
* date columns now support ISO week format (eg 2013-W37 or 2013-W37-3)
* improved admin dashboard
* dataset allows adding columns at run-time
* auto-populating missing text columns
* added experimental live-editing features (disabled for now)
* added new API: dataset.reset, dataset.indexOf, dataset.add, column.indexOf
* refactored admin pages into separate plugins
* several hotfixes for 1.5.3

### 1.5.3
* allowing external websites to provide data and some chart preset
* improved parsing of dates
* improved formatting of dates
* made Datawrapper ready for HTTPS
* don't show the resize iframe notification more than one time
* fixed display of missing values in line-charts
* improved grid lines in line charts with date axis
* removed label rotation in line charts
* fixed bug in grouped column charts

### 1.5.2
* publishing just the assets needed by visualizations
* visualizations are now able to specify assets dynamically
* simplified dw.js/make: using jsmin.php if uglifyjs not available on server
* allowing some html in chart titles
* updated chroma.js
* themes can now define some gradients
* removing most HTML from chart data
* throtteling chart re-rendering in vis editor
* visualizations can now support smart re-rendering (instead of full reloads)
* fixed bug in data-table
* some more bugfixes

### 1.5.1
* automatically creating a new hashed url for theme javascript
* visualization throws exception if data is insufficient
* chart.dataset() can now take a new dataset
* renamed vis.setX to vis.x()
* fixed charts in admin dashboard

### 1.5.0
* simplified visualization api
* column chart allows ignoring of missing values
* redesigned custom color picker
* enabled multi-selection in custom color picker
* one-dimensional visualizations (pie,bars,...) now showing single column (instead of single row)
* removed bar chart setting 'labels inside bars'
* added separators in vis options
* added new conditions for vis options
* added fallback message when JS is disabled
* refactored javascript core
* refactored core visualizations to new javascript core
* refactored custom color feature
* added axes definitions to visualizations
* added column public_version to chart table
* incrementing public_version on every publication
* appended public_version to public chart urls
* showing big warning that the chart url has changed after republication
* fixed overlapping labels in line charts
* added legend position inside right in line charts
* visualizations can now check browser compatibility
* added table plugin_data
* added plugin interface for storing and reading persistent data
* removed setting 'labels-inside-bars' from bar chart
* fixed bar chart bug (too much white-space for long labels)
* output formatting of values now handled by columns (45998931)
* line chart: allow filling below lines
* column chart: show bars as thin lines if too many bars are displayed
* chart notifications
* vendor libs used by vis plugins are now loaded from external CDN
* automatically creating a new hashed url for vis javascript

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
