/**
 * A delayed highlight setter
 *
 * @exports highlightTimer
 * @kind function
 *
 * @example
 * import {highlightTimer} from '@datawrapper/shared';
 * const myTimer = highlightTimer(value => {
 *     if (value) {
 *         selection.style('opacity', d => d === value ? 1 : 0.3);
 *     } else {
 *         selection.style('opacity', 1);
 *     }
 * });
 *
 * lines.on('mouseenter', d => myTimer.set(d));
 * chart.on('mouseleave', myTimer.clear);
 *
 * @param {function} action - the highlight action callback
 * @param {int} delay - how long something needs to be highlighted before
 *		the highlight triggers (in milliseconds)
 * @returns {object}
 */
export default function highlightTimer(action, delay = 700) {
    let setTimer;
    let highlighted = false;
    let inactive = true;
    return {
        set(value) {
            if (highlighted !== value) {
                if (setTimer) clearTimeout(setTimer);
                setTimeout(
                    () => {
                        inactive = false;
                        action(highlighted);
                    },
                    inactive ? delay : 0
                );
            }
            highlighted = value;
        },
        clear() {
            highlighted = null;
            inactive = true;
            if (setTimer) clearTimeout(setTimer);
            action(null);
        },
        get() {
            return highlighted;
        }
    };
}
