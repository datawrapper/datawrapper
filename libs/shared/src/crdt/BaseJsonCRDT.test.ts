import anyTest, { TestFn } from 'ava';
import { BaseJsonCRDT } from './BaseJsonCRDT.js';
import { Clock } from './Clock.js';
import sinon, { type SinonSandbox } from 'sinon';
import { TIMESTAMP_KEY } from './constants.js';

const test = anyTest as TestFn<{ sandbox: SinonSandbox }>;

test.beforeEach(t => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always(t => {
    t.context.sandbox.restore();
});

test(`constructor - works with flat object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 'some value', b: 2, c: 3 } });
    t.deepEqual(crdt.data(), { a: 'some value', b: 2, c: 3 });
});

test(`constructor - works with nested object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: { b: { c: { d: { e: { f: 1 } } } } } } });
    t.deepEqual(crdt.data(), { a: { b: { c: { d: { e: { f: 1 } } } } } });
});

test(`constructor - works with arrays`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: [1, 2, 3], b: [4, 5, 6] } });
    t.deepEqual(crdt.data(), { a: [1, 2, 3], b: [4, 5, 6] });
});

test('_initData - filters out null values', t => {
    const crdt = new BaseJsonCRDT({ data: { a: null, b: { c: 'some value', d: null } } });
    t.deepEqual(crdt.data(), { b: { c: 'some value' } });
});

test(`data - returns immutable object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 1, b: 2, c: 3 } });

    const data = crdt.data();
    t.not(data, crdt.data());

    data.a = 99;
    t.deepEqual(crdt.data(), { a: 1, b: 2, c: 3 });
});

test('data - returns data without null values', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            key: {
                a: 1,
                b: null,
                c: {
                    d: null,
                    e: 2
                },
                f: false,
                g: 0,
                h: ''
            }
        }
    });

    t.deepEqual(crdt.data(), {
        key: {
            a: 1,
            c: {
                e: 2
            },
            f: false,
            g: 0,
            h: ''
        }
    });
});

test(`timestamps - returns immutable object`, t => {
    const crdt = new BaseJsonCRDT({ data: { a: 1, b: 2, c: 3 } });

    // perform update to be sure there are timestamps
    crdt.update({ a: 2, b: 3, c: 4 }, '1-1');

    const timestamps = crdt.timestamps();
    t.not(timestamps, crdt.timestamps());

    timestamps.a = { [TIMESTAMP_KEY]: '99-99' };
    t.deepEqual(crdt.timestamps(), {
        a: { [TIMESTAMP_KEY]: '1-1' },
        b: { [TIMESTAMP_KEY]: '1-1' },
        c: { [TIMESTAMP_KEY]: '1-1' }
    });
});

test('basic serialization and re-initialization', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: 'some value',
            b: [
                { id: '1', value: 1 },
                { id: '2', value: 2 }
            ]
        }
    });

    const serialized = crdt.serialize();
    const crdt2 = BaseJsonCRDT.fromSerialized(serialized);

    t.deepEqual(crdt, crdt2);
});

test('fromSerialized - works after item array deletion', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: 'some value',
            b: [
                { id: '1', value: 1 },
                { id: '2', value: 2 }
            ]
        },
        pathsToItemArrays: ['b']
    });

    // delete one item
    crdt.update({ b: { '1': { id: '1', _index: null } } }, '1-1');

    // re-initialize with timestamps
    const crdt2 = BaseJsonCRDT.fromSerialized(crdt.serialize());
    t.deepEqual(crdt2.data(), { a: 'some value', b: [{ id: '2', value: 2 }] });

    // re inserted item is ignored
    crdt2.update({ b: { '1': { value: 9, _index: 0 } } }, '1-2');
    t.deepEqual(crdt2.data(), { a: 'some value', b: [{ id: '2', value: 2 }] });
});

test('pathsToItemArrays does not change, even if array that could be item array is added to the crdt,', t => {
    const crdt = new BaseJsonCRDT({
        data: {
            a: 'some value',
            arr: [
                { id: '1', value: 1 },
                { id: '2', value: 2 }
            ]
        }
    });

    t.deepEqual(crdt.serialize().pathsToItemArrays, []);
});

test('_getTimestamp returns timestamp at exact path', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: 1
                }
            },
            x: 3
        },
        timestamps: {
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-2'
                    }
                }
            },
            x: {
                [TIMESTAMP_KEY]: '1-3'
            }
        },
        pathsToItemArrays: []
    });

    t.deepEqual(crdt._getTimestamp(['a', 'b', 'c']), '1-2');
    t.deepEqual(crdt._getTimestamp(['a', 'b']), undefined);
    t.deepEqual(crdt._getTimestamp(['a']), '1-1');
    t.deepEqual(crdt._getTimestamp(['a', 'b', 'c', 'd']), undefined);
    t.deepEqual(crdt._getTimestamp(['x']), '1-3');
    t.deepEqual(crdt._getTimestamp(['y']), undefined);
    t.deepEqual(crdt._getTimestamp(['x', 'y']), undefined);
    t.deepEqual(crdt._getTimestamp([]), undefined);
});

test('_getTimestamps returns timestamps object at path (including children)', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: 1
                }
            },
            x: 3
        },
        timestamps: {
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-2'
                    }
                }
            },
            x: {
                [TIMESTAMP_KEY]: '1-3'
            }
        },
        pathsToItemArrays: []
    });

    t.deepEqual(crdt._getTimestamps(['a', 'b', 'c']), {
        [TIMESTAMP_KEY]: '1-2'
    });
    t.deepEqual(crdt._getTimestamps(['a', 'b']), {
        c: {
            [TIMESTAMP_KEY]: '1-2'
        }
    });
    t.deepEqual(crdt._getTimestamps(['a']), {
        [TIMESTAMP_KEY]: '1-1',
        b: {
            c: {
                [TIMESTAMP_KEY]: '1-2'
            }
        }
    });
    t.deepEqual(crdt._getTimestamps(['a', 'b', 'c', 'd']), undefined);
    t.deepEqual(crdt._getTimestamps(['x']), {
        [TIMESTAMP_KEY]: '1-3'
    });
    t.deepEqual(crdt._getTimestamps(['y']), undefined);
    t.deepEqual(crdt._getTimestamps(['x', 'y']), undefined);
    t.deepEqual(crdt._getTimestamps([]), undefined);
});

test('_getClock always returns clock instance at exact path or minimum clock', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: 1
                }
            },
            x: 3
        },
        timestamps: {
            a: {
                [TIMESTAMP_KEY]: '1-1',
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-2'
                    }
                }
            },
            x: {
                [TIMESTAMP_KEY]: '1-3'
            }
        },
        pathsToItemArrays: []
    });

    t.deepEqual(crdt._getClock(['a', 'b', 'c']), new Clock('1-2'));
    t.deepEqual(crdt._getClock(['a', 'b']), new Clock());
    t.deepEqual(crdt._getClock(['a']), new Clock('1-1'));
    t.deepEqual(crdt._getClock(['a', 'b', 'c', 'd']), new Clock());
    t.deepEqual(crdt._getClock(['x']), new Clock('1-3'));
    t.deepEqual(crdt._getClock(['y']), new Clock());
    t.deepEqual(crdt._getClock(['x', 'y']), new Clock());
    t.deepEqual(crdt._getClock([]), new Clock());
});

test('_updateValue - updates existing atomic value', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                c: {
                    d: [],
                    e: 'test'
                },
                f: false
            }
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['a'], 2, '1-1');
    t.is(stub._updateExistingAtomicValue.callCount, 1);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [], e: 'test' }, f: false } });

    crdt._updateValue(['b', 'c', 'd'], [1, 2, 3], '1-2');
    t.is(stub._updateExistingAtomicValue.callCount, 2);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [1, 2, 3], e: 'test' }, f: false } });

    crdt._updateValue(['b', 'c', 'e'], 'new', '1-3');
    t.is(stub._updateExistingAtomicValue.callCount, 3);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [1, 2, 3], e: 'new' }, f: false } });

    crdt._updateValue(['b', 'f'], true, '1-4');
    t.is(stub._updateExistingAtomicValue.callCount, 4);
    t.deepEqual(crdt.data(), { a: 2, b: { c: { d: [1, 2, 3], e: 'new' }, f: true } });
});

test('_updateValue - updates item array index', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: [
                {
                    id: 'c',
                    d: [],
                    e: 'test'
                },
                {
                    id: 'd',
                    d: [],
                    e: 'test123'
                }
            ]
        },
        pathsToItemArrays: ['b']
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['b', 'c', '_index'], 2, '1-1');
    t.is(stub._updateItemArrayIndex.callCount, 1);

    crdt._updateValue(['b', 'd', '_index'], 0, '1-2');
    t.is(stub._updateItemArrayIndex.callCount, 2);

    t.deepEqual(crdt.data(), {
        a: 1,
        b: [
            {
                id: 'd',
                d: [],
                e: 'test123'
            },
            {
                id: 'c',
                d: [],
                e: 'test'
            }
        ]
    });
});

test('_updateValue - updates an object', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                c: {
                    d: 1
                }
            }
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['b', 'c'], 'test', '1-1');
    t.is(stub._updateObject.callCount, 1);
    t.deepEqual(crdt.data(), { a: 1, b: { c: 'test' } });

    crdt._updateValue(['b'], [], '1-2');
    t.is(stub._updateObject.callCount, 2);
    t.deepEqual(crdt.data(), { a: 1, b: [] });
});

test('_updateValue - inserts a new value into existing object', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                b1: {
                    b2: 1
                }
            }
        }
    });

    const stub = sandbox.spy(crdt);

    // Root insert
    crdt._updateValue(['c'], 'test', '1-1');
    t.is(stub._insertNewValue.callCount, 1);
    t.deepEqual(crdt.data(), { a: 1, b: { b1: { b2: 1 } }, c: 'test' });

    // Insert into existing object
    crdt._updateValue(['b', 'b1', 'b1a'], 123, '1-2');
    t.is(stub._insertNewValue.callCount, 2);
    t.deepEqual(crdt.data(), { a: 1, b: { b1: { b2: 1, b1a: 123 } }, c: 'test' });

    // Deeply nested insert
    crdt._updateValue(['b', 'b1', 'c1', 'c2', 'c3'], [1, 2, 3], '1-3');
    t.is(stub._insertNewValue.callCount, 3);
    t.deepEqual(crdt.data(), {
        a: 1,
        b: { b1: { b2: 1, b1a: 123, c1: { c2: { c3: [1, 2, 3] } } } },
        c: 'test'
    });
});

test('_updateValue - inserts new value replacing atomic ancestor', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1,
            b: {
                b1: {
                    b2: 1
                }
            }
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['b', 'b1', 'b2', 'b3'], 'test', '1-1');
    t.is(stub._insertNewValue.callCount, 1);
    t.deepEqual(crdt.data(), { a: 1, b: { b1: { b2: { b3: 'test' } } } });

    crdt._updateValue(['a', 'a1', 'a2'], 123, '1-2');
    t.is(stub._insertNewValue.callCount, 2);
    t.deepEqual(crdt.data(), { a: { a1: { a2: 123 } }, b: { b1: { b2: { b3: 'test' } } } });
});

test('_updateValue - multiple calls replacing atomic ancestor only modifies it once', t => {
    const { sandbox } = t.context;

    const crdt = new BaseJsonCRDT({
        data: {
            a: 1
        }
    });

    const stub = sandbox.spy(crdt);

    crdt._updateValue(['a', 'b', 'c'], 'test', '1-1');
    crdt._updateValue(['a', 'b', 'e'], 'test', '1-1');

    t.is(stub._insertNewValue.callCount, 2);
});

test('_partialDelete - deletes outdated child values and keeps newer ones', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    },
                    e: 2
                },
                f: 3
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    },
                    e: {
                        [TIMESTAMP_KEY]: '1-5'
                    }
                },
                f: {
                    [TIMESTAMP_KEY]: '1-3'
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-4' });

    t.deepEqual(crdt.data(), {
        a: {
            b: {
                e: 2
            },
            f: 3
        }
    });
});

test('_partialDelete - updates timestamps of deleted values', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    },
                    e: 2
                },
                f: 3
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    },
                    e: {
                        [TIMESTAMP_KEY]: '1-5'
                    }
                },
                f: {
                    [TIMESTAMP_KEY]: '1-3'
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-4' });

    t.deepEqual(crdt.timestamps(), {
        a: {
            b: {
                c: {
                    [TIMESTAMP_KEY]: '1-4',
                    d: {
                        [TIMESTAMP_KEY]: '1-4'
                    }
                },
                e: {
                    [TIMESTAMP_KEY]: '1-5'
                }
            },
            f: {
                [TIMESTAMP_KEY]: '1-3'
            }
        }
    });
});

test('_partialDelete - removes empty parent objects of deleted children', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    },
                    e: 2,
                    f: {
                        g: {
                            h: 3
                        },
                        i: 4
                    },
                    j: 5
                }
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    },
                    e: {
                        [TIMESTAMP_KEY]: '1-5'
                    },
                    f: {
                        g: {
                            [TIMESTAMP_KEY]: '1-2',
                            h: {
                                [TIMESTAMP_KEY]: '1-3'
                            }
                        },
                        i: {
                            [TIMESTAMP_KEY]: '1-4'
                        }
                    },
                    j: {
                        [TIMESTAMP_KEY]: '1-12'
                    }
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-9' });

    t.deepEqual(crdt.data(), {
        a: {
            b: {
                j: 5
            }
        }
    });
});

test('_partialDelete - removes empty parent objects of deleted children only up to the path it was called on', t => {
    const crdt = new BaseJsonCRDT<object>({
        data: {
            a: {
                b: {
                    c: {
                        d: 1
                    }
                }
            }
        },
        timestamps: {
            a: {
                b: {
                    c: {
                        [TIMESTAMP_KEY]: '1-1',
                        d: {
                            [TIMESTAMP_KEY]: '1-2'
                        }
                    }
                }
            }
        },
        pathsToItemArrays: []
    });

    crdt._partialDelete({ path: ['a', 'b'], newTimestamp: '1-9' });

    t.deepEqual(crdt.data(), {
        a: {
            // Even though `b` is empty, it is not removed,
            //  because the partial deletion was called on `b`
            b: {}
        }
    });
});
