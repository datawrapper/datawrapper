import numeral from 'numeral';
import chroma from 'chroma-js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import weekYear from 'dayjs/plugin/weekYear.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import sportsSeasonFormat from '@datawrapper/shared/sportsSeasonFormat';
import clone from 'lodash/clone.js';
import base from './visualization.base.js';

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek); // Required by advancedFormat
dayjs.extend(localizedFormat);
dayjs.extend(sportsSeasonFormat);
dayjs.extend(timezone); // Required by advancedFormat
dayjs.extend(weekOfYear); // Required by advancedFormat
dayjs.extend(weekYear); // Required by advancedFormat

const __vis = new Map();

function visualization(id, target, hash) {
    if (!__vis.has(id)) {
        console.warn('unknown visualization type: ' + id);
        const known = Array.from(__vis.keys());
        if (known.length > 0) console.warn('try one of these instead: ' + known.join(', '));
        return false;
    }
    if (!hash || !__vis.get(id).has(hash)) {
        // fall back to first registered hash
        hash = Array.from(__vis.get(id).keys())[0];
    }

    function getParents(vis) {
        const parents = [];

        while (vis.parentVis && vis.parentVis !== 'base') {
            vis = __vis.get(vis.parentVis).get(hash);
            parents.push({ id: vis.parentVis, vis });
        }

        return parents.reverse();
    }

    const vis = clone(base);

    const parents = getParents(__vis.get(id).get(hash));
    parents.push({ id, vis: __vis.get(id).get(hash) });
    parents.forEach(el => {
        Object.assign(
            vis,
            typeof el.vis.init === 'function' ? el.vis.init({ target }) : el.vis.init,
            { id }
        );
    });

    vis.libraries(visualization.libraries);

    if (target) {
        vis.target(target);
    }

    vis.setup();

    return vis;
}

/**
 * Register a new visualization, called by out vis render code
 *
 * @param {string} id visualization id, e.g. 'd3-bars-stacked'
 * @param {string|null} parentVis parent visualization id, e.g. 'd3-bars' (optional)
 * @param {function} init render method
 * @param {string} hash for supporting multiple versions (optional)
 * @param {string} hash for supporting multiple versions of the global dw object (optional)
 */
visualization.register = function (id, parentVis, initFunc, hash = 'nohash', dwJsHash) {
    if (!__vis.has(id)) __vis.set(id, new Map());
    __vis.get(id).set(hash, {
        parentVis: parentVis || 'base',
        init: initFunc
    });

    // also register on the versioned dw instance
    if (dwJsHash) {
        window.dw?.versions?.[dwJsHash]?.visualization?.register(id, parentVis, initFunc, hash);
    }
};

visualization.has = function (id) {
    return __vis.has(id);
};

visualization.hasVisHash = function (id, hash) {
    return __vis.has(id) && __vis.get(id).has(hash);
};

visualization.libraries = {
    numeral,
    chroma,
    dayjs
};

visualization.base = base;

export default visualization;
