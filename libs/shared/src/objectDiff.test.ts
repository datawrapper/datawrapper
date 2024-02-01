import test from 'ava';
import objectDiff from './objectDiff';
import cloneDeep from 'lodash/cloneDeep';
import defaultsDeep from 'lodash/defaultsDeep';

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
            },
            listWithIds: [
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
                {
                    id: 3,
                    nestedListWithIds: [
                        { id: 1, name: 'A' },
                        { id: 2, name: 'B' }
                    ]
                }
            ],
            mixedList: [
                { id: 1, name: 'A' },
                { name: 'B' }, // no `id` property
                { id: 3, name: 'C' },
                { id: 4, name: 'D' },
                null
            ]
        }
    }
};

type PartialPartial<TObj, TKey extends keyof TObj> = Omit<TObj, TKey> & Partial<Pick<TObj, TKey>>;

test('comparing equal object returns empty diff', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    t.deepEqual(objectDiff(source, target), {});
});

test('added keys produce correct diff', t => {
    const source: PartialPartial<typeof testData, 'author'> = cloneDeep(testData);
    const target = cloneDeep(testData);
    delete source.author;
    t.deepEqual(objectDiff(source, target), { author: testData.author });
});

test('added 2nd-level keys produce correct diff', t => {
    const source = cloneDeep(testData);
    const target = defaultsDeep({}, testData, { author: { id: 123 } });
    t.deepEqual(objectDiff(source, target), { author: { id: 123 } });
});

test('removed key produces null diff', t => {
    const source = cloneDeep(testData);
    const target: PartialPartial<typeof testData, 'author'> = cloneDeep(testData);
    delete target.author;
    t.deepEqual(objectDiff(source, target), { author: null });
});

test('removed 2nd-level key produces null diff', t => {
    const source = cloneDeep(testData);
    const target: Omit<typeof testData, 'author'> & {
        author: PartialPartial<typeof testData['author'], 'email'>;
    } = cloneDeep(testData);
    delete target.author.email;
    t.deepEqual(objectDiff(source, target), { author: { email: null } });
});

test('ignored keys are ignored', t => {
    const source = cloneDeep(testData);
    const target: PartialPartial<typeof testData, 'author'> = defaultsDeep({}, testData, {
        metadata: { author: 'new' }
    });
    delete target.author; // ignored
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

test('arrays of objects containing IDs are compared (property updates)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.listWithIds[0].name = 'New name';
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: { listWithIds: [{ id: 1, name: 'New name' }, { id: 2 }, { id: 3 }] }
        }
    });
});

test('arrays of objects containing IDs are compared (property deletion)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    delete target.metadata.visualize.listWithIds[0].name;
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: { listWithIds: [{ id: 1, name: null }, { id: 2 }, { id: 3 }] }
        }
    });
});

test('arrays of objects containing IDs are compared (insertion of new elements)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.listWithIds.push({ id: 4, name: 'New element' });
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                listWithIds: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4, name: 'New element' }]
            }
        }
    });
});

test('arrays of objects containing IDs are compared (deletion of elements)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.listWithIds = target.metadata.visualize.listWithIds.slice(1); // remove first
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                listWithIds: [{ id: 2 }, { id: 3 }]
            }
        }
    });
});

test('arrays of objects containing IDs are compared (order updates)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.listWithIds = target.metadata.visualize.listWithIds.sort(
        (a, b) => b.id - a.id
    ); // revert order
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                listWithIds: [{ id: 3 }, { id: 2 }, { id: 1 }]
            }
        }
    });
});

test('nested arrays of objects containing IDs are compared (property updates)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    target.metadata.visualize.listWithIds[2].nestedListWithIds![0].name = 'New name';
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                listWithIds: [
                    { id: 1 },
                    { id: 2 },
                    {
                        id: 3,
                        nestedListWithIds: [{ id: 1, name: 'New name' }, { id: 2 }]
                    }
                ]
            }
        }
    });
});

test('nested arrays of objects containing IDs are compared (insertion of new elements)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    target.metadata.visualize.listWithIds[2].nestedListWithIds!.push({
        id: 3,
        name: 'New element'
    });
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                listWithIds: [
                    { id: 1 },
                    { id: 2 },
                    {
                        id: 3,
                        nestedListWithIds: [{ id: 1 }, { id: 2 }, { id: 3, name: 'New element' }]
                    }
                ]
            }
        }
    });
});

test('nested arrays of objects containing IDs are compared (deletion of elements)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    target.metadata.visualize.listWithIds[2].nestedListWithIds =
        target.metadata.visualize.listWithIds[2].nestedListWithIds!.slice(1); // remove first
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                listWithIds: [
                    { id: 1 },
                    { id: 2 },
                    {
                        id: 3,
                        nestedListWithIds: [{ id: 2 }]
                    }
                ]
            }
        }
    });
});

test('nested arrays of objects containing IDs are compared (order updates)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    target.metadata.visualize.listWithIds[2].nestedListWithIds =
        target.metadata.visualize.listWithIds[2].nestedListWithIds!.sort((a, b) => b.id - a.id); // revert order
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                listWithIds: [
                    { id: 1 },
                    { id: 2 },
                    {
                        id: 3,
                        nestedListWithIds: [{ id: 2 }, { id: 1 }]
                    }
                ]
            }
        }
    });
});

test('arrays of mixed objects (with and without IDs) are compared (property updates)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.mixedList[0]!.name = 'New name';
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                mixedList: [{ id: 1, name: 'New name' }, { name: 'B' }, { id: 3 }, { id: 4 }, null]
            }
        }
    });
});

test('arrays of mixed objects (with and without IDs) are compared (removal of id property)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    delete target.metadata.visualize.mixedList[3]!.id;
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                mixedList: [{ id: 1 }, { name: 'B' }, { id: 3 }, { name: 'D' }, null]
            }
        }
    });
});

test('arrays of mixed objects (with and without IDs) are compared (insertion of new elements)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.mixedList.push({ name: 'New element' });
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                mixedList: [
                    { id: 1 },
                    { name: 'B' },
                    { id: 3 },
                    { id: 4 },
                    null,
                    { name: 'New element' }
                ]
            }
        }
    });
});

test('arrays of mixed objects (with and without IDs) are compared (deletion of elements)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.mixedList = target.metadata.visualize.mixedList.slice(1); // remove first
    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                mixedList: [{ name: 'B' }, { id: 3 }, { id: 4 }, null]
            }
        }
    });
});

test('arrays of mixed objects (with and without IDs) are compared (order updates)', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.mixedList = target.metadata.visualize.mixedList.sort(
        (a, b) =>
            target.metadata.visualize.mixedList.indexOf(b) -
            target.metadata.visualize.mixedList.indexOf(a)
    ); // revert order

    t.deepEqual(objectDiff(source, target), {
        metadata: {
            visualize: {
                mixedList: [null, { id: 4 }, { id: 3 }, { name: 'B' }, { id: 1 }]
            }
        }
    });
});

test('custom diffArray function', t => {
    const source = cloneDeep(testData);
    const target = cloneDeep(testData);
    target.metadata.visualize.list = ['A', 'B', 'C']; // delete D

    const diffArray = (sourceArr: unknown[], targetArr: unknown[]) => {
        const diff: Record<string, null> = {};
        for (const item of sourceArr) {
            if (typeof item !== 'string') {
                // if items are not strings just return the target array
                return targetArr;
            }
            if (!targetArr.includes(item)) {
                // mark deleted items with null
                diff[item] = null;
            }
        }
        return diff;
    };

    t.deepEqual(objectDiff(source, target, null, { diffArray }), {
        metadata: {
            visualize: {
                list: { D: null }
            }
        }
    });
});
