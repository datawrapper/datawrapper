/**
 * Construct the path to an editor route given a workspace, chartId, and the step.
 * Any of the parameters besides the chartId can be null or undefined, meaning that they will be omitted from the path (in case of the workspace) or the path will not have a step (in case of the step).
 * or set to a default ('edit' in case of the step).
 * There is no validation of the parameters, so the caller is responsible for ensuring that they are valid.
 */

export function buildChartPath({
    workspace,
    chartId,
    step,
    searchParams
}: {
    workspace: string | null | undefined; // TODO: @launch:workspaces - once all data is migrated to worksaces, this parameter should become required
    chartId: string;
    step: string | null | undefined;
    searchParams?: URLSearchParams | null;
}): string {
    let path = '/';

    if (workspace) {
        path += `${workspace}/`;
    }

    if (!step) step = 'edit';
    path += `edit/${chartId}/${step}`;

    const params = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    path += params;

    return path;
}
