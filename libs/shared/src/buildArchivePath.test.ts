import test from 'ava';
import { buildArchivePath } from './buildArchivePath';

const testSearchParams = new URLSearchParams({
    orderBy: 'lastModifiedAt',
    order: 'ASC',
    search: 'foo',
    minLastEditStep: '0'
});

const testCases = [
    // without params
    [{}, '/archive'],
    [{ teamId: null, folderId: null, workspace: null }, '/archive'],
    [{ teamId: 'test-team', folderId: null, workspace: null }, '/archive/team/test-team'],
    [{ teamId: null, folderId: 'test-folder', workspace: null }, '/archive/test-folder'],
    [{ teamId: null, folderId: 1234, workspace: null }, '/archive/1234'], // folderId can be numeric
    [{ teamId: null, folderId: null, workspace: 'test-workspace' }, '/test-workspace/archive'],
    [
        { teamId: 'test-team', folderId: 'test-folder', workspace: null },
        '/archive/team/test-team/test-folder'
    ],
    [
        { teamId: 'test-team', workspace: 'test-workspace' },
        '/test-workspace/archive/team/test-team'
    ],
    [
        { folderId: 'test-folder', workspace: 'test-workspace' },
        '/test-workspace/archive/test-folder'
    ],
    [
        { teamId: 'test-team', folderId: 'test-folder', workspace: 'test-workspace' },
        '/test-workspace/archive/team/test-team/test-folder'
    ],

    // with params
    [
        { searchParams: testSearchParams },
        '/archive?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        { teamId: null, folderId: null, workspace: null, searchParams: testSearchParams },
        '/archive?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        { teamId: 'test-team', folderId: null, workspace: null, searchParams: testSearchParams },
        '/archive/team/test-team?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        { teamId: null, folderId: 'test-folder', workspace: null, searchParams: testSearchParams },
        '/archive/test-folder?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        { teamId: null, folderId: 1234, workspace: null, searchParams: testSearchParams },
        '/archive/1234?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ], // folderId can be numeric
    [
        {
            teamId: null,
            folderId: null,
            workspace: 'test-workspace',
            searchParams: testSearchParams
        },
        '/test-workspace/archive?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        {
            teamId: 'test-team',
            folderId: 'test-folder',
            workspace: null,
            searchParams: testSearchParams
        },
        '/archive/team/test-team/test-folder?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        { teamId: 'test-team', workspace: 'test-workspace', searchParams: testSearchParams },
        '/test-workspace/archive/team/test-team?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        { folderId: 'test-folder', workspace: 'test-workspace', searchParams: testSearchParams },
        '/test-workspace/archive/test-folder?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        {
            teamId: 'test-team',
            folderId: 'test-folder',
            workspace: 'test-workspace',
            searchParams: testSearchParams
        },
        '/test-workspace/archive/team/test-team/test-folder?orderBy=lastModifiedAt&order=ASC&search=foo&minLastEditStep=0'
    ],
    [
        {
            teamId: 'test-team',
            folderId: 'test-folder',
            workspace: null,
            searchParams: new URLSearchParams({ a: 'b' })
        },
        '/archive/team/test-team/test-folder?a=b'
    ],
    [
        {
            searchParams: new URLSearchParams({ a: 'b', c: 'd' })
        },
        '/archive?a=b&c=d'
    ],
    [
        {
            workspace: 'test-workspace',
            searchParams: new URLSearchParams({ a: 'b', number: '000' })
        },
        '/test-workspace/archive?a=b&number=000'
    ],
    [
        {
            teamId: null,
            folderId: null,
            workspace: null,
            searchParams: null
        },
        '/archive'
    ],

    // with office param

    [
        {
            teamId: null,
            folderId: null,
            workspace: null,
            searchParams: new URLSearchParams({
                office: '1'
            })
        },
        '/integrations/powerpoint/archive?office=1'
    ],
    [
        {
            teamId: null,
            folderId: null,
            workspace: 'test-workspace', // TODO: @workspaces: we should include workspaces in the powerpoint path as well
            searchParams: new URLSearchParams({
                office: '1'
            })
        },
        '/integrations/powerpoint/archive?office=1'
    ],
    [
        {
            teamId: 'test-team',
            folderId: null,
            workspace: null,
            searchParams: new URLSearchParams({
                office: 'abc'
            })
        },
        '/integrations/powerpoint/archive/team/test-team?office=abc'
    ],
    [
        {
            teamId: 'test-team',
            folderId: '123',
            workspace: null,
            searchParams: new URLSearchParams({
                office: 'abc'
            })
        },
        '/integrations/powerpoint/archive/team/test-team/123?office=abc'
    ],
    [
        {
            teamId: 'test-team',
            folderId: '123',
            workspace: 'some-workspace',
            searchParams: new URLSearchParams({
                office: 'abc'
            })
        },
        '/integrations/powerpoint/archive/team/test-team/123?office=abc'
    ],
    [
        {
            searchParams: new URLSearchParams({ a: 'b', number: '000', office: '1' })
        },
        '/integrations/powerpoint/archive?a=b&number=000&office=1'
    ]
];

for (const [input, expected] of testCases) {
    test(`buildArchivePath for ${JSON.stringify(input)} is "${expected}"`, t => {
        const { teamId, folderId, workspace, searchParams } = input as {
            teamId?: string | null;
            folderId?: string | number | null;
            workspace?: string | null;
            searchParams?: URLSearchParams | null;
        };
        t.is(buildArchivePath({ teamId, folderId, workspace, searchParams }), expected as string);
    });
}
