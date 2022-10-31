export const UNIT_IN = 'in';
export const UNIT_MM = 'mm';
export const UNIT_PX = 'px';

type Unit = typeof UNIT_IN | typeof UNIT_MM | typeof UNIT_PX;

const DEFAULT_DPI = 96;

function mmToIn(mm: number) {
    return mm / 25.4;
}

function inToMm(inch: number) {
    return inch * 25.4;
}

export function inToPx(inch: number, dpi = DEFAULT_DPI) {
    return inch * dpi;
}

export function pxToIn(px: number, dpi = DEFAULT_DPI) {
    return px / dpi;
}

export function unitToPx(value: number, unit: Unit, dpi = DEFAULT_DPI) {
    switch (unit) {
        case UNIT_PX:
            return value;
        case UNIT_IN:
            return inToPx(value, dpi);
        case UNIT_MM:
            return inToPx(mmToIn(value), dpi);
        default:
            throw new Error('Invalid unit');
    }
}

export function pxToUnit(px: number, unit: Unit, dpi = DEFAULT_DPI) {
    switch (unit) {
        case UNIT_PX:
            return px;
        case UNIT_IN:
            return pxToIn(px, dpi);
        case UNIT_MM:
            return inToMm(pxToIn(px, dpi));
        default:
            throw new Error('Invalid unit');
    }
}
