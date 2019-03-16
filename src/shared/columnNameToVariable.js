/**
 * converts a column name to a variable name that can be used in the custom
 * column editor. variable names can't contain spaces and special characters
 * and are also converted to lowercase.
 *
 * @param {string} name -- name of the column
 * @returns {string} -- variable name
 */
export default function columnNameToVariable(name) {
    return name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '_') // Replace spaces with _
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/-/g, '_') // Replace multiple - with single -
        .replace(/__+/g, '_') // Replace multiple - with single -
        .replace(/^_+/, '') // Trim - from start of text
        .replace(/_+$/, '') // Trim - from end of text
        .replace(/^(\d)/, '_$1') // If first char is a number, prefix with _
        .replace(
            /^(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)$/,
            '$1_'
        ); // avoid reserved keywords
}
