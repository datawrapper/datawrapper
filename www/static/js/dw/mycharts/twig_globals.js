define(function(require) {
    return {
        init: function(twig) {
            this.globals = twig;
            delete this.init;
        }
    }
});
