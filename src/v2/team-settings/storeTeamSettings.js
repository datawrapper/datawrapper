import { patchJSON } from '@datawrapper/shared/fetch';
import debounce from 'debounce-promise';
/* globals dw */
export default debounce(function(team, settings, defaultTheme) {
    return patchJSON(
        `${window.location.protocol}//${dw.backend.__api_domain}/v3/teams/${team.id}`,
        JSON.stringify({
            name: team.name,
            defaultTheme,
            settings: settings
        })
    );
}, 500);
