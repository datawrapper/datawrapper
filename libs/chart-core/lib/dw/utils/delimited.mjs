function escapeDelimitedValue(value, delimiter, quoteChar) {
    const s = String(value);
    if (s.indexOf(quoteChar) !== -1) {
        // A double-quote appearing inside a field MUST be escaped by preceding it with another
        // double quote, and the field itself MUST be enclosed in double quotes.
        // See paragraph 8 at https://csv-spec.org/#csv-format-specification
        return quoteChar + s.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar) + quoteChar;
    }
    if (new RegExp(`[\n\r${delimiter}]`).test(s)) {
        // Fields containing line breaks (CRLF, LF, or CR), double quotes, or the delimiter
        // character (normally a comma) MUST be enclosed in double-quotes.
        // See paragraph 7 at https://csv-spec.org/#csv-format-specification
        return quoteChar + s + quoteChar;
    }
    return s;
}

export function formatDelimited(
    rows,
    { delimiter = ',', quoteChar = '"', lineTerminator = '\n' } = {}
) {
    return rows
        .map(row =>
            row.map(value => escapeDelimitedValue(value, delimiter, quoteChar)).join(delimiter)
        )
        .join(lineTerminator);
}

export default {
    formatDelimited
};
