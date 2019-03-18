(function () {
'use strict';

window.addEventListener("message", function(event) {
    if (typeof event.data["datawrapper-height"] != "undefined") {
        for (var chartId in event.data["datawrapper-height"]) {
            var iframe = document.getElementById("datawrapper-chart-" + chartId);
            if (!iframe) { continue; }
            iframe.style.height = event.data["datawrapper-height"][chartId] + "px";
        }
    }
});

}());
