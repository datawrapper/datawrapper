export default function(locale, callback) {
    if (window.Globalize.cultures.hasOwnProperty(locale)) {
        window.Globalize.culture(locale);
        if (typeof callback == "function") callback();
    } else {
        getScript(`/static/vendor/globalize/cultures/globalize.culture.${locale}.js`, () => {
            window.Globalize.culture(locale);
            if (typeof callback == "function") callback();
        });
    }
}

function getScript(url, callback) {
    let script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = (_, isAbort) => {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;
            if(!isAbort) { if (callback) callback(); }
        }
    };

    script.src = URL;
    prior.parentNode.insertBefore(script, prior);
}
