/**
 * Computes the area of a polygon
 * @exports area
 * @kind function
 *
 * @param {array[]} vertices -- polygon vertices as [[x,y], [x,y], ...] array
 * @returns {number} -- polygon area, might be negative
 */
export default function area(vertices: [number, number][]): number {
    let total = 0;

    for (let i = 0, l = vertices.length; i < l; i++) {
        const addX = vertices[i][0];
        const addY = vertices[i === vertices.length - 1 ? 0 : i + 1][1];
        const subX = vertices[i === vertices.length - 1 ? 0 : i + 1][0];
        const subY = vertices[i][1];

        total += addX * addY * 0.5;
        total -= subX * subY * 0.5;
    }

    return total;
}
