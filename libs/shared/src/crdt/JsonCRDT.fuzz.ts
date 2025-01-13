import test from 'ava';
import cloneDeep from 'lodash/cloneDeep.js';
import setWith from 'lodash/setWith.js';
import sampleSize from 'lodash/sampleSize.js';
import get from 'lodash/get.js';
import omit from 'lodash/omit.js';
import { iterateObjectPaths } from '../objectPaths.js';
import { nanoid } from 'nanoid';
import util from 'util';
import isPrimitive from '../isPrimitive.js';
import { parseArgs } from 'node:util';

import { type ItemArray, ArrayItem } from './types.js';
import {
    isItemArray,
    isPathToItemArrayAncestor,
    pathStringToArray,
    pathArrayToString,
} from './utils.js';
import { Update } from './CRDT.js';
import { JsonCRDT } from './JsonCRDT.js';
import { isEmpty } from 'lodash';

const FLAGS = {
    primitiveToObject: false,
    objectToPrimitive: false,
};

function oneOf(...fns: (() => any)[]) {
    const fn = fns[Math.floor(Math.random() * fns.length)];
    return fn();
}

/*
 * Execute the function with a certain chance provided as percentage.
 * @param chance - The chance in percentage that the function should be executed.
 * @param fn - The function to be executed.
 * @returns - A tuple with the first value being a boolean indicating if the function was executed and the second value being the result of the function.
 */
function withChance(chance: number, fn: () => any) {
    if (Math.random() < chance) {
        return [true, fn()];
    }
    return [false, undefined];
}

class Generate {
    static integer(high = 25, low = 0): number {
        return Math.floor(Math.random() * (high - low) + low);
    }

    static boolean(): boolean {
        return Math.random() < 0.5;
    }

    static string(): string {
        return nanoid(5);
    }

    static null(): null {
        return null;
    }

    static undefined(): undefined {
        return undefined;
    }

    static date(
        from = new Date('2024-02-14T12:43:43.014Z'),
        to = new Date('2024-02-21T12:43:43.014Z')
    ): Date {
        return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
    }

    static primitiveValueGenerators = [
        this.integer,
        this.boolean,
        this.string,
        this.null,
        this.undefined,
        this.date,
    ];

    static anyPrimitiveValue(): unknown {
        return oneOf(...Generate.primitiveValueGenerators);
    }

    static array<T>(
        size?: number,
        generator: () => T = () => Generate.anyPrimitiveValue() as T
    ): T[] {
        return Array.from({ length: size ?? Generate.integer() }, () => generator());
    }

    static itemArray(size?: number, itemSize?: number, generator?: () => unknown): ItemArray {
        return Generate.array(size, () => Generate.arrayItem(itemSize, generator)) as ItemArray;
    }

    static arrayItem(size?: number, generator?: () => unknown): ArrayItem {
        return { ...Generate.flatObject(size, generator), id: Generate.string() };
    }

    static flatObject(size?: number, generator?: () => unknown): object {
        const arr = Generate.array(size, generator);
        return arr.reduce((acc: { [key: string]: unknown }, item: unknown) => {
            const key = Generate.string();
            acc[key] = item;
            return acc;
        }, {}) as object;
    }

    static emptyObject(): object {
        return {};
    }

    static arrayGenerators = [this.array, this.itemArray];

    static anyValueExceptNestedObject(): any {
        return oneOf(...Generate.primitiveValueGenerators, Generate.emptyObject);
    }

    static nestedObject(
        size?: number,
        maxDepth?: number,
        allowItemArrays = false
    ): object | unknown {
        const depth = maxDepth ?? 3;
        if (depth === 0) return Generate.anyPrimitiveValue();
        return this.flatObject(size, () =>
            oneOf(
                ...this.primitiveValueGenerators,
                ...(allowItemArrays ? this.arrayGenerators : [this.array]),
                this.emptyObject,
                () => Generate.nestedObject(Math.floor((size ?? 5) / 2), depth - 1, allowItemArrays)
            )
        );
    }
}

class Mutate {
    mutations = {
        atomicArray: {
            swap: 0,
            append: 0,
            delete: 0,
            shuffle: 0,
        },
        itemArray: {
            items: {
                mutate: 0,
                add: 0,
                delete: 0,
            },
            add: 0,
            shuffle: 0,
            delete: 0,
        },
        objectProperties: {
            mutate: 0,
            add: 0,
            delete: 0,
        },
        primitive: 0,
    };

    constructor(private pathsToItemArrays: string[]) {}

    value(value: any, path?: string): any {
        if (path && this.pathsToItemArrays.includes(path)) {
            return this.itemArray(value);
        }
        if (Array.isArray(value)) {
            return this.atomicArray(value);
        }
        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
            return this.object(value, path);
        }
        return this.primitiveValue(value);
    }

    arrayItem(item: ArrayItem): ArrayItem {
        const mutateValue = (): ArrayItem => {
            const keys = Object.keys(item);
            const key = keys[Math.floor(Math.random() * keys.length)];
            if (key === 'id') return item;
            const value = get(item, key);
            const newValue = this.value(value);
            this.mutations.itemArray.items.mutate += 1;
            return setWith(item, key, newValue, Object);
        };

        const addValue = (): ArrayItem => {
            this.mutations.itemArray.items.add += 1;
            return setWith(item, Generate.string(), Generate.anyPrimitiveValue(), Object);
        };

        const removeValue = (): ArrayItem => {
            const keys = Object.keys(item);
            const key = keys[Math.floor(Math.random() * keys.length)];
            if (key === 'id') return item;
            this.mutations.itemArray.items.delete += 1;
            return setWith(item, key, undefined, Object);
        };
        return oneOf(mutateValue, addValue, removeValue);
    }

    itemArray(itemArr: ItemArray): ItemArray {
        const deleteItem = (): ItemArray => {
            const index = Generate.integer(itemArr.length);
            this.mutations.itemArray.delete += 1;
            return [...itemArr.slice(0, index), ...itemArr.slice(index + 1)];
        };
        const addItem = (): ItemArray => {
            const index = Generate.integer(itemArr.length);
            this.mutations.itemArray.add += 1;
            return [...itemArr.slice(0, index), Generate.arrayItem(), ...itemArr.slice(index)];
        };
        const mutateItem = (): ItemArray => {
            const index = Generate.integer(itemArr.length);
            const item = itemArr[index];
            const newItem = this.arrayItem(item);
            return [...itemArr.slice(0, index), newItem, ...itemArr.slice(index + 1)];
        };
        const shuffleItems = (): ItemArray => {
            this.mutations.itemArray.shuffle += 1;
            return (cloneDeep(itemArr) as Array<ArrayItem>).sort(() => Math.random() - 0.5);
        };
        if (itemArr.length === 0) return addItem();
        return oneOf(deleteItem, addItem, mutateItem, shuffleItems);
    }

    primitiveValue(value: any): any {
        if (FLAGS.primitiveToObject) {
            const [done, newValue] = withChance(0.1, () => {
                return Generate.nestedObject(5, 2);
            });
            if (done) return newValue;
        }
        this.mutations.primitive += 1;
        return Generate.anyPrimitiveValue();
    }

    atomicArray(arr: any[]): any[] {
        const swap = () => {
            this.mutations.atomicArray.swap += 1;
            return Generate.array();
        };
        const append = () => {
            this.mutations.atomicArray.append += 1;
            return [...arr, ...Generate.array()];
        };
        const remove = () => {
            this.mutations.atomicArray.delete += 1;
            return arr.filter(() => Math.random() < 0.5);
        };
        const shuffle = () => {
            this.mutations.atomicArray.shuffle += 1;
            return arr.sort(() => Math.random() - 0.5);
        };
        return oneOf(swap, append, remove, shuffle);
    }

    object(o: object, path?: string): object {
        const obj = cloneDeep(o);
        const insert = () => {
            this.mutations.objectProperties.add += 1;
            return setWith(obj, Generate.string(), Generate.anyValueExceptNestedObject(), Object);
        };

        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return insert();
        }

        const key = keys[Math.floor(Math.random() * keys.length)];
        const value = get(obj, key);
        const newPath = path ? pathArrayToString([path, key]) : key;

        const deleteKey = () => {
            this.mutations.objectProperties.delete += 1;
            return omit(obj, key);
        };

        const mutateValue = () => {
            this.mutations.objectProperties.mutate += 1;
            const newValue = this.value(value, newPath);
            return setWith(obj, key, newValue, Object);
        };

        const convertToPrimitive = () => {
            if (isPathToItemArrayAncestor(this.pathsToItemArrays, pathStringToArray(newPath))) {
                // The CRDT does not support deletion of item arrays
                return mutateValue();
            }
            return setWith(obj, key, Generate.anyPrimitiveValue(), Object);
        };

        if (isPrimitive(value)) {
            return oneOf(deleteKey, mutateValue, insert);
        }
        if (FLAGS.objectToPrimitive) {
            return oneOf(mutateValue, insert, convertToPrimitive);
        }
        return oneOf(mutateValue, insert);
    }
}

function getEmptyAndItemArrayPaths(data: object): string[] {
    const paths: string[] = [];
    iterateObjectPaths(data, path => {
        const value = get(data, path);
        if (Array.isArray(value) && (isEmpty(value) || isItemArray(value))) {
            paths.push(path.join('.'));
        }
    });
    return paths;
}

class Fuzz {
    data: object;
    pathsToItemArrays: string[];
    mutator: Mutate;
    stats = {
        distribution: {
            atomicArray: 0,
            itemArray: 0,
            primitive: 0,
        },
        mutations: {
            atomicArray: {
                swap: 0,
                append: 0,
                delete: 0,
                shuffle: 0,
            },
            itemArray: {
                items: {
                    mutate: 0,
                    add: 0,
                    delete: 0,
                },
                add: 0,
                shuffle: 0,
                delete: 0,
            },
            objectProperties: {
                add: 0,
                delete: 0,
                mutate: 0,
            },
            primitive: 0,
        },
    };

    constructor(size?: number, maxDepth?: number) {
        this.data = Generate.nestedObject(size, maxDepth, true) as object;
        this.pathsToItemArrays = getEmptyAndItemArrayPaths(this.data);
        this.mutator = new Mutate(this.pathsToItemArrays);
    }

    private computeDistribution() {
        iterateObjectPaths(this.data, path => {
            const value = get(this.data, path);
            if (isItemArray(value)) this.stats.distribution.itemArray += 1;
            else if (Array.isArray(value)) this.stats.distribution.atomicArray += 1;
            else this.stats.distribution.primitive += 1;
        });
    }

    private updateStats() {
        this.computeDistribution();
        this.stats.mutations = this.mutator.mutations;
    }

    get() {
        return {
            initData: cloneDeep(this.data),
            pathsToItemArrays: this.pathsToItemArrays,
        };
    }

    mutate(inputData: object, mutations?: number): object {
        let data = cloneDeep(inputData);
        mutations = mutations ?? Generate.integer(10);
        for (let i = 0; i < mutations; i++) {
            data = this.mutator.object(data);
        }
        return data;
    }

    describe() {
        this.updateStats();
        // eslint-disable-next-line no-console
        console.log(util.inspect(this.stats, false, null, true));
    }
}

function multipleInstances(
    iteration = 0,
    options?: {
        size?: number;
        maxDepth?: number;
        numUpdates?: number;
        numMutations?: number;
        numCRDTs?: number;
        log?: boolean;
    }
) {
    return () => {
        test(`fuzzing: ${iteration}. iteration`, t => {
            const size = options?.size ?? Generate.integer(10, 5);
            const maxDepth = options?.maxDepth ?? Generate.integer(5, 2);
            const numUpdates = options?.numUpdates ?? Generate.integer(100, 10);
            const numMutations = options?.numMutations ?? Generate.integer(10, 1);
            const numCRDTs = options?.numCRDTs ?? Generate.integer(10, 3);
            const log = options?.log ?? false;

            const fuzz = new Fuzz(size, maxDepth);

            const { initData, pathsToItemArrays } = fuzz.get();
            const crdts = Generate.array(
                numCRDTs,
                () =>
                    new JsonCRDT({
                        nodeId: Generate.integer(99999999),
                        data: initData,
                        pathsToItemArrays,
                    })
            );

            const updates: Update<any>[] = [];
            for (let _ = 0; _ < numUpdates; _++) {
                crdts.forEach(crdt => {
                    const diff = crdt.calculateDiff(fuzz.mutate(crdt.data(), numMutations));
                    const update = crdt.createUpdate(diff);
                    if (update) updates.push(update);
                });
            }

            // apply updates to all crdts in different order
            crdts.forEach(crdt => {
                const shuffledupdates = updates.sort(() => Math.random() - 0.5);
                shuffledupdates.forEach(update => {
                    crdt.applyUpdate(update);

                    // confirm that the crdt can be re-initialized from the serialized data
                    const newCrdt = JsonCRDT.fromSerialized(crdt.serialize());
                    t.deepEqual(crdt, newCrdt);
                });
            });

            // confirm that re-initializing the crdt with data and timestamps results in the final crdt state
            let backendCrdt = new JsonCRDT({ nodeId: 0, data: initData, pathsToItemArrays });

            const shuffledupdates = updates.sort(() => Math.random() - 0.5);
            shuffledupdates.forEach(update => {
                // re-initialize the backend crdt with the same data and timestamps
                const newBackendCrdt = JsonCRDT.fromSerialized(backendCrdt.serialize());

                t.deepEqual(backendCrdt, newBackendCrdt);
                backendCrdt = newBackendCrdt;

                // apply the update to the backend crdt
                backendCrdt.applyUpdate(update);
            });

            // all crdt instances have the same data
            if (log) fuzz.describe();
            // all crdt instances have the same data
            crdts.forEach(crdt => {
                t.deepEqual(crdt.data(), crdts[0].data());
            });

            t.deepEqual(crdts[0].data(), backendCrdt.data());
        });
    };
}

// invoke with `npm run fuzz -- -- --runs=3 --primitiveToObject`

const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
        primitiveToObject: { type: 'boolean', default: false },
        objectToPrimitive: { type: 'boolean', default: false },
        runs: { type: 'string', default: '10' },
    },
});

const { runs, primitiveToObject, objectToPrimitive } = values;

FLAGS.primitiveToObject = primitiveToObject ?? false;
FLAGS.objectToPrimitive = objectToPrimitive ?? false;

Array.from({ length: Number(runs) }).forEach((_, i) => {
    multipleInstances(i + 1, {
        // size: 20,
        // numCRDTs: 5,
        // numUpdates: 50
    })();
});
