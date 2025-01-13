import test from 'ava';
import { buildCreatePath } from './buildCreatePath';

const testCases = [
    [{ type: 'chart' }, '/create/chart'], // workspace can be omitted
    [{ workspace: null, type: 'chart' }, '/create/chart'], // workspace can be null
    [{ workspace: null, type: 'table' }, '/create/table'],
    [{ workspace: null, type: 'map' }, '/select/map'],
    [{ workspace: null, type: 'd3-maps-choropleth' }, '/create/map?type=d3-maps-choropleth'],
    [{ workspace: null, type: 'd3-maps-symbols' }, '/create/map?type=d3-maps-symbols'],
    [{ workspace: null, type: 'locator-map' }, '/create/map?type=locator-map'],
    [{ workspace: 'some-workspace', type: 'chart' }, '/some-workspace/create/chart'],
    [{ workspace: 'workspace', type: 'table' }, '/workspace/create/table'],
    [{ workspace: 'workspace', type: 'map' }, '/workspace/select/map'],
    [
        { workspace: 'workspace', type: 'd3-maps-choropleth' },
        '/workspace/create/map?type=d3-maps-choropleth',
    ],
    [
        { workspace: 'workspace', type: 'd3-maps-symbols' },
        '/workspace/create/map?type=d3-maps-symbols',
    ],
    [{ workspace: 'workspace', type: 'locator-map' }, '/workspace/create/map?type=locator-map'],

    // in a team
    [
        { workspace: 'workspace', type: 'locator-map', teamId: 'aTeam' },
        '/workspace/create/map?type=locator-map&team=aTeam',
    ],
    [
        { workspace: 'workspace', type: 'd3-maps-choropleth', teamId: 'aTeam' },
        '/workspace/create/map?type=d3-maps-choropleth&team=aTeam',
    ],
    [
        { workspace: 'workspace', type: 'd3-maps-symbols', teamId: 'aTeam' },
        '/workspace/create/map?type=d3-maps-symbols&team=aTeam',
    ],
    [{ workspace: 'workspace', type: 'map', teamId: 'aTeam' }, '/workspace/select/map?team=aTeam'],
    [
        { workspace: 'workspace', type: 'chart', teamId: 'aTeam' },
        '/workspace/create/chart?team=aTeam',
    ],
    [{ workspace: null, type: 'chart', teamId: 'aTeam' }, '/create/chart?team=aTeam'],

    // in a folder
    [
        { workspace: 'workspace', type: 'locator-map', folderId: 'folderA' },
        '/workspace/create/map?type=locator-map&folder=folderA',
    ],
    [
        { workspace: 'workspace', type: 'd3-maps-choropleth', folderId: 'folderA' },
        '/workspace/create/map?type=d3-maps-choropleth&folder=folderA',
    ],
    [
        { workspace: 'workspace', type: 'd3-maps-symbols', folderId: 'folderA' },
        '/workspace/create/map?type=d3-maps-symbols&folder=folderA',
    ],
    [
        { workspace: 'workspace', type: 'map', folderId: 'folderA' },
        '/workspace/select/map?folder=folderA',
    ],
    [
        { workspace: 'workspace', type: 'chart', folderId: 'folderA' },
        '/workspace/create/chart?folder=folderA',
    ],
    [{ workspace: null, type: 'chart', folderId: 'folderA' }, '/create/chart?folder=folderA'],

    // in a team and folder (only folder makes it to the path)
    [
        { workspace: 'workspace', type: 'locator-map', folderId: 'folderA', teamId: 'aTeam' },
        '/workspace/create/map?type=locator-map&folder=folderA',
    ],
    [
        { workspace: 'workspace', type: 'map', folderId: 'folderA', teamId: 'aTeam' },
        '/workspace/select/map?folder=folderA',
    ],
    [
        { workspace: 'workspace', type: 'chart', folderId: 'folderA', teamId: 'aTeam' },
        '/workspace/create/chart?folder=folderA',
    ],
    [
        { workspace: null, type: 'chart', folderId: 'folderA', teamId: 'aTeam' },
        '/create/chart?folder=folderA',
    ],

    // office and embedded params
    [
        {
            workspace: 'test-workspace',
            type: 'locator-map',
            folderId: 'folderA',
            office: 'true',
            embedded: 'true',
        },
        '/test-workspace/create/map?type=locator-map&folder=folderA&office=true&embedded=true',
    ],
    [
        {
            workspace: 'test-workspace',
            type: 'chart',
            folderId: 'folderA',
            embedded: '1',
        },
        '/test-workspace/create/chart?folder=folderA&embedded=1',
    ],
    [
        {
            workspace: 'test-workspace',
            type: 'chart',
            embedded: '1',
        },
        '/test-workspace/create/chart?embedded=1',
    ],
    [
        {
            workspace: null,
            type: 'map',
            embedded: '1',
        },
        '/select/map?embedded=1',
    ],
    [
        {
            workspace: null,
            type: 'map',
            teamId: 'some-team',
            embedded: null,
            office: 'some-office',
            randomIgnoredParam: 'random',
        },
        '/select/map?team=some-team&office=some-office',
    ],
];

for (const [input, expected] of testCases) {
    test(`buildCreatePath for ${JSON.stringify(input)} is "${expected}"`, t => {
        const { workspace, teamId, folderId, office, embedded, type } = input as {
            workspace?: string | null;
            teamId?: string | null;
            folderId?: string | number | null;
            office?: string | boolean | undefined | null;
            embedded?: string | boolean | undefined | null;
            type:
                | 'chart'
                | 'map'
                | 'table'
                | 'd3-maps-choropleth'
                | 'd3-maps-symbols'
                | 'locator-map';
        };
        t.is(
            buildCreatePath({ workspace, teamId, folderId, office, embedded, type }),
            expected as string
        );
    });
}
