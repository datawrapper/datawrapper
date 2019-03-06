/**
 * computes the polygon area
 *
 * @param {array[]} vertices -- polygon vertices as [[x,y], [x,y], ...] array
 * @returns {number} -- polygon area, might be negative
 */
export default function(vertices) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
        var addX = vertices[i][0];
        var addY = vertices[i === vertices.length - 1 ? 0 : i + 1][1];
        var subX = vertices[i === vertices.length - 1 ? 0 : i + 1][0];
        var subY = vertices[i][1];

        total += addX * addY * 0.5;
        total -= subX * subY * 0.5;
    }

    return total;
}
