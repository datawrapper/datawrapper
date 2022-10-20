import chroma from 'chroma-js';

export default function (color, bg, minContrastRatio) {
    const MAX_ITER = 10;
    const EPS = 0.2;
    const [curL, C, H] = chroma(color).lch();
    const bgL = chroma(bg).lch()[0];
    const curC = chroma.contrast(color, bg);

    if (curC >= minContrastRatio) return color;

    const darkMaxC = chroma.contrast('#000000', bg);
    const lightMaxC = chroma.contrast('#ffffff', bg);
    const darken =
        (bgL > curL && darkMaxC >= minContrastRatio) ||
        (bgL <= curL && lightMaxC < minContrastRatio);

    return darken ? test(0, curL, MAX_ITER) : test(curL, 100, MAX_ITER);

    function test(low, high, i) {
        const mid = (low + high) * 0.5;
        const col = chroma.lch([mid, C, H]);
        const curC = chroma.contrast(col, bg);
        if (Math.abs(curC - minContrastRatio) < EPS || !i) {
            // close enough
            return col.hex();
        }

        const evenDarker =
            (curC < minContrastRatio && darken) || (curC > minContrastRatio && !darken);
        return evenDarker ? test(low, mid, i - 1) : test(mid, high, i - 1);
    }
}
