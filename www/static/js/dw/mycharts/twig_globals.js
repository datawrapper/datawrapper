define(function () {
    return {
        init: function (twig) {
            this.globals = twig;
            delete this.init;
        }
    };
});
