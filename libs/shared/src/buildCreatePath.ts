/**
 * Construct the path to an visualization creation route given a workspace and type.
 * There is no validation of the parameters, so the caller is responsible for ensuring that they are valid.
 */

export type CreateChartType =
    | 'chart'
    | 'map'
    | 'table'
    | 'd3-maps-choropleth'
    | 'd3-maps-symbols'
    | 'locator-map';

export function buildCreatePath({
    workspace,
    teamId,
    folderId,
    type,
    office,
    embedded,
}: {
    workspace?: string | null | undefined; // TODO: @launch:workspaces - once all data is migrated to workspaces, this parameter should become required
    type: CreateChartType;
    teamId?: string | null | undefined;
    folderId?: string | number | null | undefined;
    office?: string | boolean | undefined | null;
    embedded?: string | boolean | undefined | null;
}): string {
    let path = '/';

    const params = new URLSearchParams();
    if (workspace) {
        path += `${workspace}/`;
    }
    if (type === 'map') {
        path += `select/${type}`;
    } else if (type === 'chart' || type === 'table') {
        path += `create/${type}`;
    } else {
        path += `create/map`;
        params.set('type', type);
    }

    if (folderId) {
        params.set('folder', folderId.toString());
    } else if (teamId) {
        params.set('team', teamId);
    }

    if (office) {
        params.set('office', office.toString());
    }
    if (embedded) {
        params.set('embedded', embedded.toString());
    }

    if (params.toString()) {
        path += `?${params.toString()}`;
    }

    return path;
}
