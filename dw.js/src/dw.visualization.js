/* globals dw,_ */

dw.visualization = (function() {
    var __vis = {};

    var visualization = function(id) {
        if (!__vis[id]) {
            console.warn('unknown visualization type: ' + id);
            var known = _.keys(__vis);
            if (known.length > 0) console.warn('try one of these instead: ' + known.join(', '));
            return false;
        }
        return new __vis[id]();
    };

    visualization.register = function(id) {
        var parent = arguments.length === 3 ? __vis[arguments[1]].prototype : dw.visualization.base;
        var props = arguments[arguments.length - 1];
        var vis = (__vis[id] = function() {});

        _.extend(vis.prototype, parent, { id: id }, props);
    };

    visualization.has = function(id) {
        return __vis[id] !== undefined;
    };

    return visualization;
})();
