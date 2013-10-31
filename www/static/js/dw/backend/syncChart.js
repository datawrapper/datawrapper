
define(function() {

    return function(chart) {
        var saveTimeout,
            unsavedChanges = false,
            nextSaveDeferred = $.Deferred(),
            saveCallbacks = [];

        function save() {
            $.ajax({
                url: '/api/charts/'+chart.get('id'),
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(chart.attributes()),
                processData: false,
                success: function(data) {
                    //console.debug('save completed');
                    if (data.status == "ok") {
                        // run callbacks
                        unsavedChanges = false;
                        _.each(saveCallbacks, function(cb) {
                            cb(chart);
                        });
                        nextSaveDeferred.resolve(data);
                        // create new deferred
                        nextSaveDeferred = $.Deferred();
                    } else {
                        console.warn('could not save the chart', data);
                    }
                }
            });
        }

        chart.save = save;

        chart.onSave = function(callback) {
            saveCallbacks.push(callback);
        };

        chart.hasUnsavedChanges = function() {
            return unsavedChanges;
        };

        chart.nextSavePromise = function() {
            return nextSaveDeferred.promise();
        };

        chart.sync = function(el, attribute, _default) {
          if (_.isString(el)) el = $(el);
            el.data('sync-attribute', attribute);

            // initialize current state in UI
            var curVal = chart.get(attribute, _default);
            if (el.is('input[type=checkbox]'))  {
                el.prop('checked', curVal);
            } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                el.val(curVal);
            } else if (el.is('input[type=radio]')) {
                if (_.isBoolean(curVal)) {
                    curVal = curVal ? 'yes' : 'no';
                }
                $('input:radio[name='+el.attr('name')+'][value='+curVal+']').prop('checked', 'checked');
            }

            function storeElementValue(el) {
                var attr, val;
                // Resolve attribute string to a pointer to the attribute
                attr = el.data('sync-attribute');

                if (el.is('input[type=checkbox]')) {
                    val = el.prop('checked');
                } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                    val = el.val();
                } else if (el.is('input[type=radio]')) {
                    val = $('input:radio[name='+el.attr('name')+']:checked').val();
                    if (val === 'yes') val = true;
                    else if (val === 'no') val = false;
                }
                if (val !== undefined) {
                    chart.set(attr, val);
                }
            }

            el.change(function(evt) {
                storeElementValue($(evt.target));
            });

            if (el.is('input[type=text]') || el.is('textarea')) {
                el.keyup(function(evt) {
                    storeElementValue($(evt.target));
                });
            }
        };

        chart.onChange(function() {
            unsavedChanges = true;
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(save, 800);
        });

        window.onbeforeunload = function(e) {
            if (unsavedChanges) return 'Caution: unsaved changes';
        };
    };

});