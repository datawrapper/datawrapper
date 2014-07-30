

dw.theme = (function(){

    var __themes = {};

    var theme = function(id) {
        return __themes[id];
    };

    theme.register = function(id) {
        var parent = arguments.length == 3 ? __themes[arguments[1]] : dw.theme.base,
            props = arguments[arguments.length - 1];

        __themes[id] = extend({}, parent, { id: id }, props);
    };

    /*
     * taken from jQuery 1.10.2 $.extend, but changed a little
     * so that arrays are not deep-copied. also deep-coping
     * cannot be turned off anymore.
     */
    function extend() {
        var options, name, src, copy, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length;

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !_.isFunction(target) ) {
            target = {};
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( copy && isPlainObject(copy) ) {
                        clone = src && isPlainObject(src) ? src : {};

                        // Never move original objects, clone them
                        target[ name ] = extend( clone, copy );
                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
        // Return the modified object
        return target;
    }

    function isPlainObject(o) {
        return _.isObject(o) && !_.isArray(o) && !_.isFunction(o);
    }

    return theme;

})();

