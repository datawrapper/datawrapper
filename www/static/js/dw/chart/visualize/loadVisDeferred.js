
define(function() {

    return (function() {
        var callbacks = $.Callbacks();
        return {
            promise: function() {
                return {
                    done: function(cb) {
                        callbacks.add(cb);
                    }
                };
            },
            resolve: function() {
                callbacks.fire();
            }
        };
    })();

});