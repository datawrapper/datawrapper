/* global XLSX , FileReader */
// eslint-disable-next-line
import '/static/vendor/xlsx/xlsx.full.min.js';

/**
 * parses an XLS spreadsheet file
 */
export default function (file, callback) {
    const rABS =
        typeof FileReader !== 'undefined' && (FileReader.prototype || {}).readAsBinaryString;
    const reader = new FileReader();

    reader.onload = function () {
        try {
            const data = !rABS ? new Uint8Array(reader.result) : reader.result;
            const wb = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
            callback(
                null,
                wb.SheetNames.map(n => {
                    return {
                        name: n,
                        sheet: wb.Sheets[n],
                        csv: XLSX.utils.sheet_to_csv(wb.Sheets[n])
                    };
                })
            );
        } catch (e) {
            console.error(e);
            callback(null, reader.result);
        }
    };
    reader.readAsBinaryString(file);
}
