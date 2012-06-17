(function(){

    // Datawrapper.Chart
    // -----------------

    //
    var Chart = Datawrapper.Chart = function(attributes) {
        this.__attributes = attributes;
        this.__changed = false;
    };

    _.extend(Chart.prototype, {

        get: function(key) {
            var keys = key.split('.'),
                pt = this.__attributes;

            _.each(keys, function(key) {
                pt = pt[key];
            });
            return pt;
        },

        set: function(key, value) {
            var keys = key.split('.'),
                me = this,
                lastKey = keys.pop(),
                pt = me.__attributes;

            _.each(keys, function(key) {
                pt = pt[key];
            });
            pt[lastKey] = value;
            me.__changed = true;
            if (me.__saveTimeout) clearTimeout(me.__saveTimeout);
            me.__saveTimeout = setTimeout(function() {
                me.save();
            }, 1000);
            return this;
        },

        sync: function(el, attribute) {
            if (_.isString(el)) el = $(el);
            el.data('sync-attribute', attribute);

            var curVal = this.get(attribute);
            if (el.is('input[type=checkbox]')) {
                if (curVal) el.attr('checked', 'checked');
                else el.removeAttr('checked');
            } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                el.val(curVal);
            }

            var chart = this;
            el.change(function(evt) {
                var el = $(evt.target),
                    attr, val;

                // Resolve attribute string to a pointer to the attribute
                attr = el.data('sync-attribute');

                if (el.is('input[type=checkbox]')) {
                    val = el.attr('checked') == 'checked';
                } else if (el.is('input[type=text]') || el.is('textarea') || el.is('select')) {
                    val = el.val();
                }
                if (val !== undefined) chart.set(attr, val);
            });
        },

        save: function() {
            // saves the chart meta data to Datawrapper
            if (!this.__changed) return;
            $.ajax({
                url: '/api/charts/'+this.get('id'),
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(this.__attributes),
                processData: false,
                context: this,
                success: function(data) {
                    if (data.status == "ok") {
                        console.log('saved chart');
                        this.__changed = false;
                    } else {
                        console.warn('could not save the chart', data);
                    }
                }
            });
        }
    });

}).call(this);