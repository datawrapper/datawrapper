/*!
  * Ender-Overlay: Highly Customizable Overlay for Ender
  * copyright Andras Nemeseri @nemeseri 2012 | License MIT
  * https://github.com/nemeseri/ender-overlay
  */
!function ($) {
    var is,
        transition;

    // from valentine
    is = {
        fun: function (f) {
            return typeof f === 'function';
        },
        arr: function (ar) {
            return ar instanceof Array;
        },
        obj: function (o) {
            return o instanceof Object && !is.fun(o) && !is.arr(o);
        }
    };

    /*
        Based on Bootstrap
        Mozilla and Webkit support only
    */
    transition = (function () {
        var st = document.createElement("div").style,
            transitionEnd = "TransitionEnd",
            transitionProp = "Transition",
            support = st.transition !== undefined ||
                st.WebkitTransition !== undefined ||
                st.MozTransition !== undefined;

        return support && {
            prop: (function () {
                if (st.WebkitTransition !== undefined) {
                    transitionProp = "WebkitTransition";
                } else if (st.MozTransition !== undefined) {
                    transitionProp = "MozTransition";
                }
                return transitionProp;
            }()),
            end: (function () {
                if (st.WebkitTransition !== undefined) {
                    transitionEnd = "webkitTransitionEnd";
                } else if (st.MozTransition !== undefined) {
                    transitionEnd = "transitionend";
                }
                return transitionEnd;
            }())
        };
    }());

    function extend() {
        // based on jQuery deep merge
        var options, name, src, copy, clone,
            target = arguments[0], i = 1, length = arguments.length;

        for (; i < length; i += 1) {
            if ((options = arguments[i]) !== null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (copy && (is.obj(copy))) {
                        clone = src && is.obj(src) ? src : {};
                        target[name] = extend(clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }

    function clone(obj) {
        if (null === obj || "object" !== typeof obj) {
            return obj;
        }
        var copy = obj.constructor(),
            attr;
        for (attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr];
            }
        }
        return copy;
    }

    // from jquery
    function proxy(fn, context) {
        var slice = Array.prototype.slice,
            args = slice.call(arguments, 2);
        return function () {
            return fn.apply(context, args.concat(slice.call(arguments)));
        };
    }

    function animate(options) {
        var el = options.el,
            complete = options.complete ? options.complete : function () {},
            animation,
            dummy;

        // no animation obj OR animation is not available,
        // fallback to css and call the callback
        if (! options.animation ||
            ! (el.animate || (options.css3transition && transition))) {
            el.css(options.fallbackCss);
            complete();
            return;
        }

        // we will animate, apply start CSS
        if (options.animStartCss) {
            if (options.animStartCss.opacity === 0) {
                options.animStartCss.opacity = 0.01; // ie quirk
            }
            el.css(options.animStartCss);
        }
        animation = options.animation;

        // css3 setted, if available apply the css
        if (options.css3transition && transition) {
            dummy = el[0].offsetWidth; // force reflow; source: bootstrap
            el[0].style[transition.prop] = "all " + animation.duration + "ms ease-out";

            // takaritas
            delete animation.duration;

            el.css(animation);
            //el.unbind(transition.end);
            el.bind(transition.end, function () {
                // delete transition properties and events
                el.unbind(transition.end);
                el[0].style[transition.prop] = "none";
                complete();
            });
        } else if (window.ender) {
            // use morpheus
            el.animate(extend(animation, {"complete": complete}));
        } else {
            // use animate from jquery
            el.animate(animation, animation.duration, "swing", complete);
        }
    }

    /*
        OverlayMask Constructor
    */
    function OverlayMask(settings) {
        this.init(settings);
    }

    OverlayMask.prototype = {
        init: function (options) {
            this.options = {
                id: "ender-overlay-mask",
                zIndex: 9998,
                opacity: 0.6,
                color: "#777"
            };

            extend(this.options, options || {});

            var $mask = $("#" + this.options.id),
                opt = this.options;

            if (! $mask.length) {
                $mask = $("<div></div>")
                    .attr("id", this.options.id)
                    .css({
                        display: "none",
                        position: "absolute",
                        top: 0,
                        left: 0
                    })
                    .appendTo("body");
            }

            this.$mask = $mask;
        },

        show: function () {
            // apply instance mask options
            var opt = this.options,
                docSize = this.getDocSize(),
                animObj = false;

            this.$mask.css({
                zIndex: opt.zIndex,
                backgroundColor: opt.color,
                width: docSize.width,
                height: docSize.height
            });

            if (opt.durationIn) {
                animObj = {
                    opacity: opt.opacity,
                    duration: opt.durationIn
                };
            }

            animate({
                el: this.$mask,
                animStartCss: {
                    opacity: 0.01, // ie quirk
                    display: "block"
                },
                animation: animObj,
                fallbackCss: {display: "block", opacity: opt.opacity},
                css3transition: opt.css3transition
            });

        },

        hide: function () {
            var opt = this.options,
                self = this,
                animObj = false;

            if (opt.durationOut) {
                animObj = {
                    opacity: 0,
                    duration: opt.durationOut
                };
            }

            animate({
                el: this.$mask,
                animation: animObj,
                complete: function () {
                    self.$mask.css({display: "none"});
                },
                fallbackCss: {display: "none"},
                css3transition: opt.css3transition
            });
        },

        getDocSize: function () {
            if (window.ender) { // ender
                return {
                    width: $("body").width(),
                    height: $.doc().height
                };
            } else { // jquery
                return {
                    width: $(document).width(),
                    height: $(document).height()
                };
            }
        },

        getMask: function () {
            return this.$mask;
        }
    };

    /*
        Overlay Constructor
    */
    function Overlay(el, settings) {
        this.init(el, settings);

        // only return the API
        // instead of this
        return this.getApi();
    }

    Overlay.prototype = {
        init: function ($el, options) {
            this.options = {
                top: 80,
                position: "absolute",
                cssClass: "ender-overlay",
                close: ".close",
                trigger: null,
                zIndex: 9999,
                showMask: true,
                closeOnEsc: true,
                closeOnMaskClick: true,
                autoOpen: false,
                allowMultipleDisplay: false,

                // morpheus required for JS fallback
                css3transition: false, // experimental

                // start values before animation
                startAnimationCss: {
                    opacity: 0.01 // ie quirk
                },

                // morpheus animation options
                animationIn: {
                    opacity: 1,
                    duration: 250
                },

                animationOut: {
                    opacity: 0,
                    duration: 250
                },

                mask: {},

                onBeforeOpen: function () {},
                onBeforeClose: function () {},
                onOpen: function () {},
                onClose: function () {}
            };

            this.setOptions(options);
            this.$overlay = $el.css({
                display: "none"
            });

            if (this.options.showMask) {
                this.mask = new OverlayMask(this.options.mask);
            }

            // prevent multiple event binding
            if (! this.$overlay.attr("data-overlayloaded")) {
                this.attachEvents();
                this.$overlay.attr("data-overlayloaded", 1);
            }

            if (this.options.autoOpen) {
                this.open();
            }
        },

        attachEvents: function () {
            var self = this,
                opt = this.options;

            // Bind open method to trigger's click event
            if (opt.trigger && $(opt.trigger).length) {
                $(opt.trigger).click(function (e) {
                    e.preventDefault();
                    self.open();
                });
            }

            this.$overlay
                .delegate(opt.close, 'click', function (e) {
                    e.preventDefault();
                    self.close();
                });

            // attach event listeners
            $(document).bind("ender-overlay.close", function () {
                self.close();
            });

            $(document).bind("ender-overlay.closeOverlay", function () {
                self.close(true);
            });

            if (opt.closeOnEsc) {
                $(document).keyup(function (e) {
                    self.onKeyUp(e);
                });
            }

            if (this.mask && opt.closeOnMaskClick) {
                this.mask.getMask().click(function () {
                    self.close();
                });
            }
        },

        setupOverlay: function () {
            var opt = this.options,
                topPos = opt.top,
                scrollTop = $(window).scrollTop(),
                overlayWidth = this.$overlay.width();

            // setup overlay
            this.$overlay
                .addClass(opt.cssClass)
                .appendTo("body");

            if (opt.position === "absolute") {
                topPos += scrollTop;
            }

            // width is not defined explicitly
            // so we try to find out
            if (overlayWidth === 0) {
                this.$overlay.css({
                    display: "block",
                    position: "absolute",
                    left: -9999
                });
                overlayWidth = this.$overlay.width();
            }

            this.$overlay.css({
                display: "none",
                position: opt.position,
                top: topPos,
                left: "50%",
                zIndex: opt.zIndex,
                marginLeft: overlayWidth / 2 * -1
            });
        },

        open: function (dontOpenMask) {
            var opt = this.options,
                self = this,
                animationIn = opt.animationIn ? clone(opt.animationIn) : false,
                api = this.getApi();

            if (this.$overlay.css("display") === "block" ||
                opt.onBeforeOpen(api) === false) {
                return;
            }

            this.setupOverlay();

            if (! opt.allowMultipleDisplay) {
                $(document).trigger("ender-overlay.closeOverlay");
            }

            animate({
                el: this.$overlay,
                animStartCss: extend({display: "block"}, opt.startAnimationCss),
                animation: animationIn,
                complete: function () {
                    if (animationIn && animationIn.opacity === 1) {
                        self.$overlay.css({ "filter": "" }); // ie quirk
                    }
                    self.options.onOpen(api);
                },
                fallbackCss: {display: "block", opacity: 1},
                css3transition: opt.css3transition
            });

            if (this.mask &&
                typeof dontOpenMask === "undefined") {
                this.mask.show();
            }
        },

        close: function (dontHideMask) {
            var opt = this.options,
                self = this,
                animationOut = opt.animationOut ? clone(opt.animationOut) : false,
                api = this.getApi();

            if (opt.onBeforeClose(api) === false ||
                this.$overlay.css("display") !== "block") {
                return;
            }

            animate({
                el: this.$overlay,
                animation: animationOut,
                complete: function () {
                    self.$overlay.css({display: "none"});
                    self.options.onClose(api);
                },
                fallbackCss: {display: "none", opacity: 0},
                css3transition: opt.css3transition
            });

            if (this.mask &&
                typeof dontHideMask === "undefined") {
                this.mask.hide();
            }
        },

        onKeyUp: function (e) {
            if (e.keyCode === 27 &&
                this.$overlay.css("display") !== "none") {
                this.close();
            }
        },

        getOverlay: function () {
            return this.$overlay;
        },

        getOptions: function () {
            return this.options;
        },

        setOptions: function (options) {
            extend(this.options, options || {});
            var opt = this.options;

            if (opt.animationIn === "none") {
                opt.animationIn = false;
            }

            if (opt.animationOut === "none") {
                opt.animationOut = false;
            }

            if (opt.showMask) {
                // If there is no explicit duration set for OverlayMask
                // set it from overlay animation
                if (! opt.mask.durationIn && opt.animationIn && opt.animationIn.duration) {
                    opt.mask.durationIn = opt.animationIn.duration;
                }

                if (! opt.mask.durationOut && opt.animationOut && opt.animationOut.duration) {
                    opt.mask.durationOut = opt.animationOut.duration;
                }

                // no animation
                if (! opt.mask.durationIn && ! opt.animationIn) {
                    opt.mask.durationIn = 0;
                }

                if (! opt.mask.durationOut && ! opt.animationOut) {
                    opt.mask.durationOut = 0;
                }

                if (typeof opt.mask.css3transition !== "boolean") {
                    opt.mask.css3transition = opt.css3transition;
                }
            }

        },

        getApi: function () {
            return {
                open: proxy(this.open, this),
                close: proxy(this.close, this),
                getOverlay: proxy(this.getOverlay, this),
                getOptions: proxy(this.getOptions, this),
                setOptions: proxy(this.setOptions, this)
            };
        }
    };

    $.fn.overlay = function (options) {
        var el = $(this).first();
        return new Overlay(el, options);
    };

}(window.ender || window.jQuery);