
define(function() {

    return function(s) {
        s = s.replace(/[-_\s]+(.)?/g, function(match, c){ return c.toUpperCase(); });
        s = s.substr(0, 1).toUpperCase() + s.substr(1);
        return s;
    };

});