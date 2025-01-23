const reg =
    /^https:\/\/docs.google.com\/spreadsheets\/d\/([0-9a-zA-Z\-_]+)\/(edit|export)(.*?[?&#]gid=([0-9]+))?/;

export function isSpreadsheetUrl(url: string) {
    return reg.test(url);
}

export function convertSpreadsheetUrl(url: string) {
    const m = url.match(reg);
    if (m) {
        const spreadsheetId = m[1];
        const sheetId = m[4];
        return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&id=${spreadsheetId}${
            sheetId ? '&gid=' + sheetId : ''
        }`;
    }
    return url;
}
