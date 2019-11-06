import { patchJSON } from '@datawrapper/shared/fetch';

/* globals dw */
export default async function(team, settings, defaultTheme) {
    return patchJSON(
        `${window.location.protocol}//${dw.backend.__api_domain}/v3/teams/${this.get().team.id}`,
        JSON.stringify({
            name: team.name,
            defaultTheme,
            settings
        })
    );
}
