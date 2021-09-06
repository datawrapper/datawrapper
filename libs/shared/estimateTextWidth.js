/**
 * returns the estimated width of a given text in Roboto.
 * this method has proven to be a good compromise between pixel-perfect
 * but expensive text measuring methods using canvas or getClientBoundingRect
 * and just multiplying the number of characters with a fixed width.
 *
 * be warned that this is just a rough estimate of the text width. the
 * character widths will vary from typeface to typeface and may be
 * off quite a bit for some fonts (like monospace fonts).
 *
 * @exports estimateTextWidth
 * @kind function
 *
 * @param {string} text - the text to measure
 * @param {number} fontSize - the output font size (optional, default is 14)
 *
 * @example
 * import estimateTextWidth from '@datawrapper/shared/estimateTextWidth';
 * // or import {estimateTextWidth} from '@datawrapper/shared';
 * const width = estimateTextWidth('my text', 12);
 *
 * @export
 * @returns {number}
 */
export default function estimateTextWidth(text, fontSize = 14) {
    const f = fontSize / 14;
    return text.split('').reduce((w, char) => w + (CHAR_W[char] || CHAR_W.a), 0) * f;
}

const CHAR_W = {
    a: 9,
    A: 10,
    b: 9,
    B: 10,
    c: 8,
    C: 10,
    d: 9,
    D: 11,
    e: 9,
    E: 9,
    f: 5,
    F: 8,
    g: 9,
    G: 11,
    h: 9,
    H: 11,
    i: 4,
    I: 4,
    j: 4,
    J: 4,
    k: 8,
    K: 9,
    l: 4,
    L: 8,
    m: 14,
    M: 12,
    n: 9,
    N: 10,
    o: 9,
    O: 11,
    p: 9,
    P: 8,
    q: 9,
    Q: 11,
    r: 6,
    R: 10,
    s: 7,
    S: 9,
    t: 5,
    T: 9,
    u: 9,
    U: 10,
    v: 8,
    V: 10,
    w: 11,
    W: 14,
    x: 8,
    X: 10,
    y: 8,
    Y: 9,
    z: 7,
    Z: 10,
    '.': 4,
    '!': 4,
    '|': 4,
    ',': 4,
    ':': 5,
    ';': 5,
    '-': 5,
    '+': 12,
    ' ': 4
};
