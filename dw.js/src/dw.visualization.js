

dw.visualization = (function(){

    var __vis = {};

    var visualization = function(id) {
        return new __vis[id]();
    };

    visualization.register = function(id) {
        var parent = arguments.length == 3 ? __vis[arguments[1]].prototype : dw.visualization.base,
            props = arguments[arguments.length - 1],
            vis = __vis[id] = function() {};

        _.extend(vis.prototype, parent, { id: id }, props);
    };

    return visualization;

})();

