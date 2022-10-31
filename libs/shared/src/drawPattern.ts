const patternRotation: Record<string, number> = {
    horizontal: 90,
    vertical: 0,
    'diagonal-up': 135,
    'diagonal-down': 45
};

type Drawing = {
    append(type: string): Drawing;
    attr(type: string, value: string | number): Drawing;
};

/**
 * draws a configurable pattern into an svg pattern def, so that it can be used as a fill
 *
 * @exports drawPattern
 * @kind function
 *
 * @param {*} parameters -- style parameters for the pattern
 */
export = function drawPattern({
    defs,
    id,
    stroke = 'black',
    strokeWidth = 1,
    lineGap = 10,
    patternType = 'horizontal',
    rotation = 0,
    scale = 1,
    flipV = false
}: {
    defs: Drawing;
    id: string;
    stroke: string;
    strokeWidth: number;
    lineGap: number;
    patternType: string;
    rotation: number;
    scale: number;
    flipV: boolean;
}) {
    const patternWidth = (lineGap + strokeWidth) * scale;
    let rot = patternRotation[patternType] || 0;
    if (flipV) {
        rot = 180 - rot;
    }
    defs.append('pattern')
        .attr('id', id)
        .attr('patternTransform', `rotate(${rot - rotation} 0 0)`)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('height', patternWidth)
        .attr('width', patternWidth)
        .append('line')
        .attr('x1', patternWidth / 2)
        .attr('y1', 0)
        .attr('x2', patternWidth / 2)
        .attr('y2', patternWidth)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth * scale);
};
