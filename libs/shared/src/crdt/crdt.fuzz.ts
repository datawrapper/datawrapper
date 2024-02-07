import test from 'ava';
import { isItemArray, CRDT, Update } from './crdt.js';
import { Timestamp, Timestamps, type ItemArray, ArrayItem } from './clock.js';
import { JsonCRDT } from './JsonCRDT.js';
import isEmpty from 'lodash/isEmpty.js';
import cloneDeep from 'lodash/cloneDeep.js';
import setWith from 'lodash/setWith.js';
import get from 'lodash/get.js';
import omit from 'lodash/omit.js';
import { iterateObjectPaths } from '../objectPaths.js';
import { nanoid } from 'nanoid';
import util from 'util';
import { ExecutionContext } from 'ava';
import isPrimitive from '../isPrimitive.js';
/*
CRDT implementation using a single counter to track updates.
This version has two methods, `foreignUpdate` and `selfUpdate`, which are used to update the data.
The counter is part of the class and is incremented on every self update.
*/
export class CRDTWrapper<O extends object, T extends Timestamps<O>> {
    private crdt: JsonCRDT<O>;

    constructor(nodeId: number, data: O, timestamps?: T) {
        this.crdt = new JsonCRDT(nodeId, data, timestamps);
    }

    /**
     * Update the CRDT with foreign data and timestamp
     * @param patch.data The data patch to apply
     * @param patch.timestamp The timestamp assosicated with the data patch
     */
    foreignUpdate(patch: Update) {
        this.crdt.applyUpdate(patch);
    }

    /**
    Increments the counter and updates the internal CRDT with the given data.
    @param data The data patch to apply
    @returns A patch object that contains the applied data patch and the assosicated timestamp
    */
    selfUpdate(newData: object): Update | false {
        const diff = CRDT.calculateDiff(this.data(), newData);
        if (isEmpty(diff)) {
            return false;
        }
        return this.crdt.createUpdate(diff);
    }

    data(): O {
        return this.crdt.data();
    }

    timestamp(): Timestamp {
        return this.crdt.timestamp();
    }

    counter(): number {
        return this.crdt.counter();
    }

    logs() {
        return this.crdt.logs();
    }
}

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

    static primitiveValueGenerators = [
        this.integer,
        this.boolean,
        this.string,
        this.null,
        this.undefined
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

    static arrayGenerators = [this.array, this.itemArray];

    static anyNonObjectValue(): any {
        return oneOf(...Generate.primitiveValueGenerators, ...Generate.arrayGenerators);
    }

    static nestedObject(size?: number, maxDepth?: number): object {
        const depth = maxDepth ?? 3;
        if (depth === 0) return Generate.anyNonObjectValue();
        return Generate.flatObject(size, () =>
            oneOf(
                () => Generate.nestedObject(size, depth - 1),
                () => Generate.anyNonObjectValue()
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
        primitive: {
            insert: 0,
            delete: 0,
            mutate: 0
        }
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
        if (typeof value === 'object' && value !== null) {
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
        this.mutations.primitive.mutate += 1;
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

    object(obj: object): object {
        const insert = () => {
            this.mutations.primitive.insert += 1;
            return setWith(obj, Generate.string(), Generate.anyPrimitiveValue(), Object);
        };

        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return insert();
        }

        const key = keys[Math.floor(Math.random() * keys.length)];
        const value = get(obj, key);

        const deleteKey = () => {
            this.mutations.primitive.delete += 1;
            return omit(obj, key);
        };

        const mutateValue = () => {
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
            primitive: {
                insert: 0,
                delete: 0,
                mutate: 0
            }
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
    const numCRDTs = options?.numCRDTs ?? Generate.integer(7, 3);
    const log = options?.log ?? false;

    const fuzz = new Fuzz(size, maxDepth);

    const crdts = Generate.array(
        numCRDTs,
        () => new CRDTWrapper(Generate.integer(99999999), fuzz.get())
    );

    const patches: Update[] = [];
    for (let _ = 0; _ < numPatches; _++) {
        crdts.forEach(crdt => {
            for (let __ = 0; __ < numMutations; __++) {
                const patch = crdt.selfUpdate(fuzz.mutate(crdt.data()));
                if (patch) patches.push(patch);
            }
        });
    }

    crdts.forEach(crdt => {
        const shuffledPatches = patches.sort(() => Math.random() - 0.5);
        shuffledPatches.forEach(patch => {
            crdt.foreignUpdate(patch);
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
    for (let i = 0; i < 5; i++) {
        multipleInstances(t);
    }
});
