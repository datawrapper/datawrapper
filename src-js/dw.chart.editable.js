(function(){

    // Datawrapper.EditableChart
    // -------------------------

    //
    var EditableChart = Datawrapper.EditableChart = function(attributes) {
        var me = this;
        me.__attributes = attributes;
        me.__changed = false;
        me.__changeCallbacks = [];
        me.__saveCallbacks = [];
        me.__syncedElements = [];
    };

    _.extend(EditableChart.prototype, Datawrapper.Chart.prototype, {

        set: function(key, value) {
            var keys = key.split('.'),
                me = this,
                lastKey = keys.pop(),
                pt = me.__attributes;

            // resolve property until the parent dict
            _.each(keys, function(key) {
                if (_.isArray(pt[key]) && pt[key].length === 0) {
                    pt[key] = {};
                }
                pt = pt[key];
            });

            // check if new value is set
            if (!_.isEqual(pt[lastKey], value)) {
                pt[lastKey] = value;
                me.__changed = true;
                clearTimeout(me.__saveTimeout);
                me.__saveTimeout = setTimeout(function() {
                    me.save();
                }, 800);
                _.each(me.__changeCallbacks, function(cb) {
                    cb.call(this, me, key, value);
                });
            }
            return this;
        },

        onChange: function(callback) {
            this.__changeCallbacks.push(callback);
        },

        sync: function(el, attribute, _default) {
            if (_.isString(el)) el = $(el);
            el.data('sync-attribute', attribute);

            // initialize current state in UI
            var curVal = this.get(attribute, _default);
            if (el.is('input[type=checkbox]')) {
                if (curVal) el.attr('checked', 'checked');
                else el.removeAttr('checked');
            } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                el.val(curVal);
            } else if (el.is('input[type=radio]')) {
                if (_.isBoolean(curVal)) {
                    curVal = curVal ? 'yes' : 'no';
                }
                $('input:radio[name='+el.attr('name')+'][value='+curVal+']').attr('checked', 'checked');
            }

            var chart = this;

            chart.__syncedElements.push(el);

            function storeElementValue(el) {
                var attr, val;
                // Resolve attribute string to a pointer to the attribute
                attr = el.data('sync-attribute');

                if (el.is('input[type=checkbox]')) {
                    val = el.attr('checked') == 'checked';
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

            window.onbeforeunload = function(e) {
                //console.debug('onbeforeunload()');
                if (chart.__changed) return 'Caution: unsaved changes';
                //_.each(chart.__syncedElements, storeElementValue);
                //var res = chart.save();
                //if (res === false) return undefined;
                //return 'Please wait a second until the data has been saved!';
            };
        },

        onSave: function(callback) {
            this.__saveCallbacks.push(callback);
        },

        save: function(sync) {
            // saves the chart meta data to Datawrapper
            //console.debug('save()', this.__changed);
            if (!this.__changed) return false;
            clearTimeout(this.__saveTimeout);
            var chart = this;
            $.ajax({
                url: '/api/charts/'+this.get('id'),
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(this.__attributes),
                processData: false,
                context: this,
                success: function(data) {
                    //console.debug('save completed');
                    if (data.status == "ok") {
                        this.__changed = false;
                        // run callbacks
                        _.each(this.__saveCallbacks, function(cb) {
                            cb.call(this, chart);
                        });
                    } else {
                        console.warn('could not save the chart', data);
                    }
                }
            });
            return true;
        }
    });

}).call(this);