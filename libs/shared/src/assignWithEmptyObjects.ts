import isPrimitive from './isPrimitive.js';

/**
 * Deeply assigns the values of all enumerable-own-properties from one or more source objects to a
 * target object. Returns the target object.
 *
 * Based on `assign-deep` (https://github.com/jonschlinkert/assign-deep/)
 *
 * The only difference is that we delete keys if the value in the source
 * object is `undefined`.
 */
function assignWithEmptyObjects<TObject>(target: TObject): TObject;
function assignWithEmptyObjects<TObject, TSource>(
    target: TObject,
    source: TSource
): TObject & TSource;
function assignWithEmptyObjects<TObject, TSource1, TSource2>(
    target: TObject,
    source1: TSource1,
    source2: TSource2
): TObject & TSource1 & TSource2;
function assignWithEmptyObjects<TObject, TSource1, TSource2, TSource3>(
    target: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
): TObject & TSource1 & TSource2 & TSource3;
function assignWithEmptyObjects<TObject, TSource1, TSource2, TSource3, TSource4>(
    target: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
): TObject & TSource1 & TSource2 & TSource3 & TSource4;
function assignWithEmptyObjects<TObject, TSource>(
    target: TObject,
    ...args: TSource[]
): TObject & TSource {
    let i = 0;
    if (isPrimitive(target)) target = args[i++] as TSource & TObject;
    if (!target) target = {} as TSource & TObject;

    for (; i < args.length; i++) {
        if (!isObject(args[i])) continue;

        for (const k of Object.keys(args[i] ?? {})) {
            const key = k as (keyof TObject & keyof TSource) & string;
            if (!isValidKey(key)) continue;

            if (isObject(target[key]) && isObject(args[i]?.[key]) && !isEmpty(args[i]?.[key])) {
                assignWithEmptyObjects(target[key] as object, args[i]?.[key] as object);
            } else if (args[i]?.[key] === undefined) {
                delete target[key];
            } else if (isArray(target[key]) && isArray(args[i]?.[key])) {
                target[key] = assignWithEmptyObjectsInArray(
                    target[key] as Array<unknown>,
                    args[i]?.[key] as Array<unknown>
                ) as (TObject & TSource)[keyof TObject & keyof TSource & string];
            } else {
                target[key] = args[i]?.[key] as (TObject & TSource)[keyof TObject &
                    keyof TSource &
                    string];
            }
        }
    }
    return target as TObject & TSource;
}

export default assignWithEmptyObjects;

function isArray(val: unknown): val is Array<unknown> {
    return Array.isArray(val);
}

function isObject(val: unknown): val is object {
    return typeof val === 'function' || Object.prototype.toString.call(val) === '[object Object]';
}

function isEmpty(val: unknown): val is Record<string, never> {
    return !val || Object.keys(val).length === 0;
}

/** to prevent prototype pollution */
function isValidKey(
    key: unknown
): key is Exclude<string, '__proto__' | 'constructor' | 'prototype'> | number | symbol {
    return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

function assignWithEmptyObjectsInArray(target: unknown[], source: unknown[]): unknown[] {
    const targetItems = new Map(target.filter(hasId).map(item => [item.id, item]));
    const newArray = [];
    for (let i = 0; i < source.length; i++) {
        const sourceItem = source[i];
        if (!hasId(sourceItem)) {
            // array item has no id, so we can only assign all of it
            newArray[i] = sourceItem;
            continue;
        }
        if (!targetItems.has(sourceItem.id)) {
            // array item is new
            newArray[i] = sourceItem;
            continue;
        }
        newArray[i] = assignWithEmptyObjects(targetItems.get(sourceItem.id), sourceItem);
    }
    return newArray;
}

type HasId = { id: unknown };

function hasId(item: unknown): item is HasId {
    return isObject(item) && 'id' in item;
}
