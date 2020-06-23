/* global Uint8Array, FileReader */

// eslint-disable-next-line
import jschardet from '/static/vendor/jschardet/jschardet.min.js';

export default function (file, callback) {
    var reader = new FileReader();
    reader.onload = function () {
        try {
            var array = new Uint8Array(reader.result);
            var string = '';
            let nonAscii = 0;
            for (var i = 0; i < array.length; ++i) {
                if (array[i] > 122) nonAscii++;
                string += String.fromCharCode(array[i]);
            }
            // eslint-disable-next-line
            let res = jschardet.detect(string);
            // jschardet performs poorly if there are not a lot of non-ascii characters
            // in the input file, so we'll just ignore what it says and assume utf-8
            // (unless jschardet is *really* sure ;)
            if (res.confidence <= 0.95 && nonAscii < 10) res.encoding = 'utf-8';
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
