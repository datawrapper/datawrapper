const DECIMAL_MATCH_REGEX = /\.(0*)\[(0+)\]\s*$/;
const NO_SUFFIX_REGEX = /[\d\]]$/;

// strips out square brackets that represent optional decimals
export function forceOptionalDecimals(format) {
    const formatTrimmed = format.trim();
    if (DECIMAL_MATCH_REGEX.test(formatTrimmed)) {
        const withoutBrackets = formatTrimmed.replace(DECIMAL_MATCH_REGEX, '.$1$2');
        return withoutBrackets;
    }
    return formatTrimmed;
}

function detectExtraZeros(value, format) {
    const m = format.match(DECIMAL_MATCH_REGEX);
    if (!m) {
        return 0;
    }
    const digits = m[2].length;

    let zeros = 0;
    for (let i = 0; i < digits; i++) {
        if (value.charAt(value.length - 1 - i) === '0') {
            zeros += 1;
        }
    }
    if (m[1] === '' && zeros === digits) {
        zeros += 1;
    }
    return zeros;
}

// move extra zeros to spans, for the purpose of aligning numbers with inconsistent decimals
export function hideExtraZeros(value, format) {
    if (!format) {
        throw new Error(`No format specified`);
    }
    const valueTrimmed = value.trim();
    const formatTrimmed = format.trim();

    const suffix = NO_SUFFIX_REGEX.test(formatTrimmed) === false;
    if (suffix) {
        return valueTrimmed;
    }

    const zeros = detectExtraZeros(valueTrimmed, formatTrimmed);
    if (zeros === 0) {
        return valueTrimmed;
    }

    const visible = valueTrimmed.slice(0, valueTrimmed.length - zeros);
    const hidden = valueTrimmed.slice(-zeros);
    const output = `${visible}<span class="decimals" aria-hidden="true">${hidden}</span>`;
    return output;
}
