const patternRotation = {
    horizontal: 90,
    vertical: 0,
    'diagonal-up': 135,
    'diagonal-down': 45
};

/**
 * draws a configurable pattern into an svg pattern def, so that it can be used as a fill
 *
 * @exports drawPattern
 * @kind function
 *
 * @param {*} parameters -- style parameters for the pattern
 */
export default function drawPattern({
    defs,
    id,
    stroke = 'black',
    strokeWidth = 1,
    lineGap = 10,
    patternType = 'horizontal',
    rotation = 0,
    scale = 1,
    flipV = false
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
}
