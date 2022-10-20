import test from 'ava';
import objectDiff from './objectDiff.js';
import cloneDeep from 'lodash/cloneDeep.js';

const testData = {
    title: 'Nice title',
    last_modified_at: new Date(2022, 2, 31, 10, 0, 0),
    author: {
        name: 'creator',
        email: 'admin@datawrapper.de'
    },
    metadata: {
        annotate: {
            notes: 'Some notes here'
        },
        describe: {
            intro: 'This is an intro'
        },
        visualize: {
            sharing: {
                enabled: true
            },
            list: ['A', 'B', 'C', 'D'],
            custom: {
                Apple: '#ff0000',
                Banana: '#ffff00',
                Orange: '#cc0044'
            }
        }
    }
};

test('comparing equal object returns empty diff', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    t.deepEqual(objectDiff(source, target), {});
});

test('added keys produce correct diff', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    delete source.author;
    t.deepEqual(objectDiff(source, target), { author: testData.author });
});

test('added 2nd-level keys produce correct diff', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.author.id = 123;
    t.deepEqual(objectDiff(source, target), { author: { id: 123 } });
});

test('removed key produces null diff', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    delete target.author;
    t.deepEqual(objectDiff(source, target), { author: null });
});

test('removed 2nd-level key produces null diff', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    delete target.author.email;
    t.deepEqual(objectDiff(source, target), { author: { email: null } });
});

test('ignored keys are ignored', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    delete target.author; // ignored
    target.metadata.author = 'new'; // not ignored, because only first-level keys are ignored
    t.deepEqual(objectDiff(source, target, ['title', 'metadata']), { metadata: { author: 'new' } });
});

test('arrays are replaced entirely', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.list.length = 2;
    t.deepEqual(objectDiff(source, target), { metadata: { visualize: { list: ['A', 'B'] } } });
});

test('date objects are compared properly', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    const now = new Date();
    target.last_modified_at = now;
    t.deepEqual(objectDiff(source, target), { last_modified_at: now });
});

test('date objects are ignored properly', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    const now = new Date();
    target.last_modified_at = now;
    t.deepEqual(objectDiff(source, target, ['title', 'metadata']), {});
});

test('boolean keys are compared', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.sharing.enabled = false;
    t.deepEqual(objectDiff(source, target), {
        metadata: { visualize: { sharing: { enabled: false } } }
    });
});

test('multiple keys are compared', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.title = 'New title!';
    target.metadata.annotate.notes = 'New notes!';
    t.deepEqual(objectDiff(source, target), {
        title: 'New title!',
        metadata: { annotate: { notes: 'New notes!' } }
    });
});
