import equalish from './equalish.js';

/**
 * Performs one-dimensional k-means clustering on an array of
 * numbers. Useful for finding n groups of "similar values".
 *
 * @exports kMeans
 * @kind function
 *
 * @example
 * import kMeans from '@datawrapper/shared/kMeans';
 *
 * const values = [1, 1.1, 1.2, 2.1, 3, 3.1, 3.2, 3.3, 7, 7.1, 10];
 * // returns [[1, 1.1, 1.2, 2.1], [3, 3.1, 3.2, 3.3], [7, 7.1, 10]]
 * kMeans(values, 3)
 *
 * @param {number[]} values - sorted array of numbers
 * @param {number} numCluster - the desired cluster count
 * @returns {array.<number[]>} - array of clusters
 */
export default function kMeans(values, numClusters) {
    const clusters = [];
    const centroids = [];
    let oldCentroids = [];
    let changed = false;

    // initialise group arrays
    for (let initClusters = 0; initClusters < numClusters; initClusters++) {
        clusters[initClusters] = [];
    }

    // pick initial centroids at evenly distributed values
    const initialCentroids = Math.round(values.length / (numClusters + 1));
    for (let i = 0; i < numClusters; i++) {
        centroids[i] = values[initialCentroids * (i + 1)];
    }

    let maxIterations = 20;

    do {
        // reset clusters
        for (let j = 0; j < numClusters; j++) {
            clusters[j].length = 0;
        }

        changed = false;
        let newCluster = -1;

        for (let i = 0; i < values.length; i++) {
            let minDistance = -1;

            // compute distances to centroid for each cluster
            // to find the "nearest" cluster for this value
            for (let j = 0; j < numClusters; j++) {
                const distance = Math.abs(centroids[j] - values[i]);

                if (minDistance === -1 || distance <= minDistance) {
                    minDistance = distance;
                    newCluster = j;
                }
            }
            // push value into "nearest" cluster
            clusters[newCluster].push(values[i]);
        }

        oldCentroids = centroids.slice(0);

        // set new cluster centroids at avg of values in cluster
        for (let j = 0; j < numClusters; j++) {
            let total = 0;
            for (let i = 0; i < clusters[j].length; i++) {
                total += clusters[j][i];
            }
            centroids[j] = total / clusters[j].length;
        }

        // check if centroids are stable
        for (let j = 0; j < numClusters; j++) {
            if (!equalish(centroids[j], oldCentroids[j])) {
                changed = true;
            }
        }
    } while (changed && maxIterations-- > 0);
    return clusters.filter(c => c.length);
}
