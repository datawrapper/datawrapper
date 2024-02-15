import test from 'ava';
import { isItemArray } from './BaseJsonCRDT.js';
import { Update } from './CRDT.js';
import { type ItemArray, ArrayItem } from './Clock.js';
import { JsonCRDT } from './JsonCRDT.js';
import cloneDeep from 'lodash/cloneDeep.js';
import setWith from 'lodash/setWith.js';
import get from 'lodash/get.js';
import omit from 'lodash/omit.js';
import { iterateObjectPaths } from '../objectPaths.js';
import { nanoid } from 'nanoid';
import util from 'util';
import { ExecutionContext } from 'ava';
import isPrimitive from '../isPrimitive.js';

function oneOf(...fns: (() => any)[]) {
    const fn = fns[Math.floor(Math.random() * fns.length)];
    return fn();
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
        this.date
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

    static nestedObject(size?: number, maxDepth?: number): object | unknown {
        const depth = maxDepth ?? 3;
        if (depth === 0) return Generate.anyPrimitiveValue();
        return Generate.flatObject(size, () =>
            oneOf(
                ...Generate.primitiveValueGenerators,
                ...Generate.arrayGenerators,
                Generate.emptyObject
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
            shuffle: 0
        },
        itemArray: {
            items: {
                mutate: 0,
                add: 0,
                delete: 0
            },
            add: 0,
            shuffle: 0,
            delete: 0
        },
        objectProperties: {
            mutate: 0,
            add: 0,
            delete: 0
        },
        primitive: 0
    };

    value(value: any): any {
        if (isItemArray(value)) {
            return this.itemArray(value);
        }
        if (isAtomicArray(value)) {
            return this.atomicArray(value);
        }
        if (Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
            return this.object(value);
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
        return oneOf(deleteItem, addItem, mutateItem, shuffleItems);
    }

    primitiveValue(value: any): any {
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

    object(o: object): object {
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

        const deleteKey = () => {
            this.mutations.objectProperties.delete += 1;
            return omit(obj, key);
        };

        const mutateValue = () => {
            this.mutations.objectProperties.mutate += 1;
            const newValue = this.value(value);
            return setWith(obj, key, newValue, Object);
        };

        if (isPrimitive(value)) {
            return oneOf(deleteKey, mutateValue, insert);
        }
        return oneOf(mutateValue, insert);
    }
}

function isAtomicArray(value: any): boolean {
    return Array.isArray(value) && value.length > 0; // empty arrays could be item arrays so we can't return true here
}

class Fuzz {
    data: object;
    mutator: Mutate;
    stats = {
        distribution: {
            atomicArray: 0,
            itemArray: 0,
            primitive: 0
        },
        mutations: {
            atomicArray: {
                swap: 0,
                append: 0,
                delete: 0,
                shuffle: 0
            },
            itemArray: {
                items: {
                    mutate: 0,
                    add: 0,
                    delete: 0
                },
                add: 0,
                shuffle: 0,
                delete: 0
            },
            objectProperties: {
                add: 0,
                delete: 0,
                mutate: 0
            },
            primitive: 0
        }
    };

    constructor(size?: number, maxDepth?: number) {
        this.data = Generate.nestedObject(size, maxDepth);
        this.mutator = new Mutate();
    }

    private computeDistribution() {
        iterateObjectPaths(this.data, path => {
            const value = get(this.data, path);
            if (isItemArray(value)) this.stats.distribution.itemArray += 1;
            else if (isAtomicArray(value)) this.stats.distribution.atomicArray += 1;
            else this.stats.distribution.primitive += 1;
        });
    }

    private updateStats() {
        this.computeDistribution();
        this.stats.mutations = this.mutator.mutations;
    }

    get() {
        return cloneDeep(this.data);
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
    t: ExecutionContext,
    options?: {
        size?: number;
        maxDepth?: number;
        numPatches?: number;
        numMutations?: number;
        numCRDTs?: number;
        log: boolean;
    }
) {
    const size = options?.size ?? Generate.integer(10, 5);
    const maxDepth = options?.maxDepth ?? Generate.integer(5, 2);
    const numPatches = options?.numPatches ?? Generate.integer(100, 10);
    const numMutations = options?.numMutations ?? Generate.integer(10, 1);
    const numCRDTs = options?.numCRDTs ?? Generate.integer(10, 3);
    const log = options?.log ?? false;

    const fuzz = new Fuzz(size, maxDepth);

    const initData = fuzz.get();
    const crdts = Generate.array(
        numCRDTs,
        () => new JsonCRDT(Generate.integer(99999999), initData)
    );

    const patches: Update<any>[] = [];
    for (let _ = 0; _ < numPatches; _++) {
        crdts.forEach(crdt => {
            const diff = crdt.calculateDiff(fuzz.mutate(crdt.data(), numMutations));
            const patch = crdt.createUpdate(diff);
            if (patch) patches.push(patch);
        });
    }

    crdts.forEach(crdt => {
        const shuffledPatches = patches.sort(() => Math.random() - 0.5);
        shuffledPatches.forEach(patch => {
            crdt.applyUpdate(patch);
        });
    });

    if (log) fuzz.describe();
    // all crdt instances have the same data
    crdts.forEach(crdt => {
        t.deepEqual(crdt.data(), crdts[0].data());
        // eslint-disable-next-line no-console
        if (log) console.log(crdt.logs());
    });
}

test(`fuzzing (multiple instances)`, t => {
    for (let i = 0; i < 10; i++) {
        multipleInstances(t);
    }
});
