export function isCSV(s: string) {
    return (
        (s.indexOf('\n') > -1 ||
            s.indexOf('\t') > -1 ||
            s.indexOf(',') > -1 ||
            s.indexOf(';') > -1) &&
        s.toLowerCase().indexOf('</html>') === -1 &&
        s.toLowerCase().indexOf('</svg>') === -1
    );
}

export function isJSON(s: string) {
    try {
        JSON.parse(s);
        return true;
    } catch (e) {
        return false;
    }
}
