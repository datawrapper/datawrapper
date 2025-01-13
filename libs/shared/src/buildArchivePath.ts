/**
 * Construct the path to a page in the archive given a workspace, team ID, folder ID and URL search parameters.
 * Any of the parameters can be null or undefined, meaning that part of the path will be omitted.
 * There is no validation of the parameters, so the caller is responsible for ensuring that they are valid.
 */

export function buildArchivePath({
    workspace,
    teamId,
    folderId,
    searchParams,
}: {
    workspace: string | null | undefined; // TODO: @launch:workspaces - once all data is migrated to worksaces, this parameter should become required
    teamId: string | null | undefined;
    folderId: string | number | null | undefined;
    searchParams?: URLSearchParams | null;
}) {
    const params = searchParams?.toString();

    let prefix = workspace ? `/${workspace}` : '';
    if (searchParams?.has('office')) {
        prefix = `/integrations/powerpoint`; // TODO: @workspaces: we might want to include workspaces in the powerpoint path as well at some point
    }

    const url =
        `${prefix}/archive${teamId ? `/team/${teamId}` : ''}${folderId ? `/${folderId}` : ''}` +
        (params ? `?${params}` : '');
    return url;
}
