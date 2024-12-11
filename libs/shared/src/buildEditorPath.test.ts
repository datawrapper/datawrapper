import test from 'ava';
import { buildEditorPath } from './buildEditorPath';

const testCases = [
    [{ chartId: 'ABCDE' }, '/edit/ABCDE/edit'],
    [{ chartId: 'ABCDE', workspace: null, step: null, searchParams: null }, '/edit/ABCDE/edit'],
    [{ workspace: 'test-workspace', chartId: 'ABCDE' }, '/test-workspace/edit/ABCDE/edit'],
    [{ chartId: 'ABCDE', step: 'describe' }, '/edit/ABCDE/describe'],
    [{ chartId: 'ABCDE', step: 'preview' }, '/edit/ABCDE/preview'],
    [{ workspace: 'test', chartId: 'ABCDE', step: 'someStep' }, '/test/edit/ABCDE/someStep'],
    [{ workspace: null, chartId: 'ABCDE', step: 'anotherStep' }, '/edit/ABCDE/anotherStep'],
    [{ workspace: 'test', chartId: 'ABCDE', step: null }, '/test/edit/ABCDE/edit'],
    [{ workspace: null, chartId: 'ABCDE', step: null }, '/edit/ABCDE/edit'],
    [
        { workspace: null, chartId: 'ABCDE', step: 'visualize#refine' },
        '/edit/ABCDE/visualize#refine'
    ],
    [
        {
            chartId: 'ABCDE',
            step: 'describe',
            searchParams: new URLSearchParams({
                comment: '123'
            })
        },
        '/edit/ABCDE/describe?comment=123'
    ],
    [
        {
            chartId: 'ABCDE',
            searchParams: new URLSearchParams({
                a: '1',
                b: '2'
            })
        },
        '/edit/ABCDE/edit?a=1&b=2'
    ],

    [
        {
            workspace: 'ws',
            chartId: 'ABCDE',
            step: 'visualize#refine',
            searchParams: new URLSearchParams({ comment: '123' })
        },
        '/ws/edit/ABCDE/visualize#refine?comment=123'
    ]
];

for (const [input, expected] of testCases) {
    test(`buildEditorPath for ${JSON.stringify(input)} is "${expected}"`, t => {
        const { workspace, chartId, step, searchParams } = input as {
            workspace?: string | null;
            chartId: string;
            step?: string | null;
            searchParams?: URLSearchParams | null;
        };
        t.is(buildEditorPath({ workspace, chartId, step, searchParams }), expected as string);
    });
}
