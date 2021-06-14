import { put } from '@datawrapper/shared/httpReq';
import debounce from 'debounce-promise';

const cache = {};

export default debounce(function (team, settings, defaultTheme) {
    const hash = JSON.stringify({ team, settings, defaultTheme });
    if (cache[team.id] === hash) {
        cache[team.id] = hash;
        // nothing has changed since last call
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
    cache[team.id] = hash;
    return put(`/v3/teams/${team.id}`, {
        payload: {
            name: team.name,
            defaultTheme,
            settings: settings
        }
    });
}, 500);
