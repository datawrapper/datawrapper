
define(function() {

    return function(vis, chart) {
        // ungroup groups
        _.each(vis.options, function(opt, key) {
            if (opt.type == 'group') {
                _.each(opt.options, function(o,k) {
                    vis.options[k] = o;
                });
                delete vis.options[key];
            }
        });

        // at first set default values
        _.each(vis.options, function(opt, key) {
            if (_.isUndefined(chart.get('metadata.visualize.'+key)) && !_.isUndefined(opt.default)) {
                chart.set('metadata.visualize.'+key, opt.default);
            }
        });
        // now check dependencies
        checkDepends();

        // trigger vis option synchronization
        _.each(vis.options, function(opt, key) {
            if (!$('#vis-options-'+key).hasClass('hidden')) {
                if (chart.get('metadata.visualize.'+key) === undefined && opt.default) {
                    chart.set('metadata.visualize.'+key, opt.default);
                }
                // fire custom event so hooked vis options can sync
                dw.backend.fire('sync-option:' + $.trim(opt.type), {
                    chart: chart,
                    vis: dw.backend.currentVis,
                    key: key,
                    option: opt
                });
            }
        });
        chart.onChange(checkDepends);

        /*
         * check visibility of each option (evaluate "depends-on" property)
         */
        function checkDepends() {
            var axesColumns = {},
                dataset = chart.dataset(),
                compRegex = /(>=?|<=?)([0-9]+(?:\.[0-9])?)/,
                minColsRegex = /chart\.min_columns\[([^\]]+)\]/,
                maxColsRegex = /chart\.max_columns\[([^\]]+)\]/,
                minValueRegex = /chart\.min_value\[([^\]]+)\]/,
                maxValueRegex = /chart\.max_value\[([^\]]+)\]/,
                columnTypeRegex = /chart\.column_type\[([^\]]+)\]/,
                magnitudeRangeRegex = /chart\.magnitude_range\[([^\]]+)\]/,
                isNullRegex = /isnull\(([^\)]+)\)/,
                _vis = dw.backend.currentVis;

            _.each(_vis.meta.axes, function(opts, key) {
                var columns = _vis.axes(true)[key];
                axesColumns[key] = _.isArray(columns) ? columns : columns ? [columns] : [];
            });

            _.each(vis.options, function(opt, key) {
                var visible = true;
                if (opt['depends-on'] !== undefined) {
                    // special conditions:
                    _.each(opt['depends-on'], function(val, key) {
                        if (minColsRegex.test(key)) {
                            key = key.match(minColsRegex)[1];
                            visible = visible && !_.isUndefined(axesColumns[key]) && axesColumns[key].length >= +val;
                        } else if (maxColsRegex.test(key)) {
                            key = key.match(maxColsRegex)[1];
                            visible = visible && !_.isUndefined(axesColumns[key]) && axesColumns[key].length <= +val;
                        } else if (key == 'chart.missing_values') {
                            visible = visible && chart.hasMissingValues() == val;
                        } else if (key == 'chart.min_row_num') {
                            visible = visible && dataset.numRows() >= +val;
                        }  else if (key == 'chart.max_row_num') {
                            visible = visible && dataset.numRows() <= +val;
                        } else if (minValueRegex.test(key)) {
                            key = key.match(minValueRegex)[1];
                            visible = visible && !_.isUndefined(axesColumns[key]) &&
                                        compare(dw.utils.minMax(axesColumns[key])[0]);
                        } else if (maxValueRegex.test(key)) {
                            key = key.match(maxValueRegex)[1];
                            visible = visible && !_.isUndefined(axesColumns[key]) &&
                                        compare(dw.utils.minMax(axesColumns[key])[1]);
                        } else if (magnitudeRangeRegex.test(key)) {
                            key = key.match(magnitudeRangeRegex)[1];
                            visible = visible && !_.isUndefined(axesColumns[key]) &&
                                compare(dw.utils.magnitudeRange(dw.utils.minMax(axesColumns[key])));
                        } else if (columnTypeRegex.test(key)) {
                            key = key.match(columnTypeRegex)[1];
                            visible = visible && !_.isUndefined(axesColumns[key]) &&
                                        axesColumns[key][0].type() == val;
                        } else if (isNullRegex.test(key)) {
                            key = key.match(isNullRegex)[1];
                            visible = visible && _.isNull(chart.get('metadata.visualize.'+key, null)) === val;
                        } else {

                            visible = visible && chart.get('metadata.visualize.'+key) == val;
                        }

                        function compare(v) {
                            if (_.isNumber(val)) return v == val;
                            if (compRegex.test(val)) {
                                var m = val.match(compRegex);
                                if (m[1] == '<') return +v < +m[2];
                                if (m[1] == '<=') return +v <= +m[2];
                                if (m[1] == '>') return +v > +m[2];
                                if (m[1] == '>=') return +v >= +m[2];
                            }
                        }
                    });
                }
                if (visible) $('#vis-options-'+key).removeClass('hidden');
                else $('#vis-options-'+key).addClass('hidden');
            });
        }
    };

});