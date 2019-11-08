import { patchJSON } from '@datawrapper/shared/fetch';
import debounce from 'debounce-promise';

const cache = {};

/* globals dw */
export default debounce(function(team, settings, defaultTheme) {
    const hash = JSON.stringify({ team, settings, defaultTheme });
    if (!cache[team.id] || cache[team.id] === hash) {
        cache[team.id] = hash;
        // nothing has changed since last call
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
    cache[team.id] = hash;
    return patchJSON(
        `${window.location.protocol}//${dw.backend.__api_domain}/v3/teams/${team.id}`,
        JSON.stringify({
            name: team.name,
            defaultTheme,
            settings: settings
        })
    );
}, 500);
