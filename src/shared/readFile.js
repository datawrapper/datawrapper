/* global Uint8Array,jschardet */

import jschardet from '/static/vendor/jschardet/jschardet.min.js';

export default function(file, callback) {

    var reader = new FileReader();
    reader.onload = function() {
        try {
            var array = new Uint8Array(reader.result);
            var string = "";
            for (var i = 0; i < array.length; ++i) {
                string += String.fromCharCode(array[i]);
            }
            let res = jschardet.detect(string);
            reader = new FileReader();
            reader.onload = () => callback(null, reader.result);
            reader.readAsText(file, res.encoding);
        } catch (e) {
            console.warn(e);
            callback(null, reader.result);
        }
    };
    reader.readAsArrayBuffer(file);
}
