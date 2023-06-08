import numeral from 'numeral';
import chroma from 'chroma-js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import weekYear from 'dayjs/plugin/weekYear.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import sportsSeasonFormat from '@datawrapper/shared/sportsSeasonFormat.js';
import clone from 'underscore/modules/clone.js';
import base from './visualization.base.mjs';

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek); // Required by advancedFormat
dayjs.extend(localizedFormat);
dayjs.extend(sportsSeasonFormat);
dayjs.extend(timezone); // Required by advancedFormat
dayjs.extend(weekOfYear); // Required by advancedFormat
dayjs.extend(weekYear); // Required by advancedFormat

const __vis = {};

function visualization(id, target) {
    if (!__vis[id]) {
        console.warn('unknown visualization type: ' + id);
        const known = Object.keys(__vis);
        if (known.length > 0) console.warn('try one of these instead: ' + known.join(', '));
        return false;
    }

    function getParents(vis) {
        const parents = [];

        while (vis.parentVis !== 'base') {
            vis = __vis[vis.parentVis];
            parents.push({ id: vis.parentVis, vis });
        }

        return parents.reverse();
    }

    const vis = clone(base);

    const parents = getParents(__vis[id]);
    parents.push({ id, vis: __vis[id] });
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

visualization.register = function (id) {
    let parentVis, init;

    if (arguments.length === 2) {
        parentVis = 'base';
        init = arguments[1];
    } else if (arguments.length === 3) {
        parentVis = arguments[1];
        init = arguments[2];
    }

    __vis[id] = {
        parentVis,
        init
    };
};

visualization.has = function (id) {
    return __vis[id] !== undefined;
};

visualization.libraries = {
    numeral,
    chroma,
    dayjs
};

visualization.base = base;

export default visualization;
