type Concat<TPrefix extends string, TRest extends string | undefined> = TRest extends undefined
    ? TPrefix
    : `${TPrefix}.${TRest}`;

type ConcatArray<TPrefix extends string, TRest extends Readonly<string[]> | undefined> =
    TRest extends Readonly<[infer Head, ...infer Tail]>
        ? [TPrefix, Head, ...Tail] extends string[]
            ? Readonly<[TPrefix, Head, ...Tail]>
            : never
        : Readonly<[TPrefix]>;

/**
 * const x1 = { a: { b: 'c' }, d: 'e', f: ['g', 'h', { i: 'j' } ] } as const;
 * StringPaths<typeof x1> = "a" | "d" | "f" | "a.b" | "f.0" | "f.1" | "f.2" | "f.2.i"
 *
 * const x2 = { a: { b: 'c' }, d: 'e', f: ['g', 'h', { i: 'j' } ] };
 * StringPaths<typeof x2> = "a" | "d" | "f" | "a.b" | `f.${number}` | `f.${number}.i`
 *
 * const x3 = { a: { b: 'c' as any }, d: 'e' };
 * StringPaths<typeof x3> = "a" | "d" | "a.b" | `a.b.${string}`
 *
 * type X4 = { a?: { b?: 'c' }, d: 'e' };
 * StringPaths<X4> = "a" | "d" | "a.b"
 */
type StringPaths<TObj> =
    TObj extends Record<string | number | symbol, unknown>
        ? {
              [TKey in keyof TObj & (string | number)]:
                  | `${TKey}`
                  | Concat<`${TKey}`, StringPaths<TObj[TKey]>>;
          }[keyof TObj & string]
        : TObj extends Readonly<unknown[]>
          ? `0` extends keyof TObj
              ? {
                    [TKey in keyof TObj & `${number}`]:
                        | `${TKey}`
                        | Concat<`${TKey}`, StringPaths<TObj[TKey]>>;
                }[keyof TObj & `${number}`]
              : `${number}` | Concat<`${number}`, StringPaths<TObj[number]>>
          : undefined;

type ArrayPaths<TObj> =
    TObj extends Record<string | number | symbol, unknown>
        ? {
              [TKey in keyof TObj & (string | number)]:
                  | [`${TKey}`]
                  | ConcatArray<`${TKey}`, ArrayPaths<TObj[TKey]>>;
          }[keyof TObj & string]
        : TObj extends Readonly<unknown[]>
          ? `0` extends keyof TObj
              ? {
                    [TKey in keyof TObj & `${number}`]:
                        | [`${TKey}`]
                        | ConcatArray<`${TKey}`, ArrayPaths<TObj[TKey]>>;
                }[keyof TObj & `${number}`]
              : [`${number}`] | ConcatArray<`${number}`, ArrayPaths<TObj[number]>>
          : undefined;

export type Paths<TObj> =
    | (StringPaths<TObj> & string)
    | ((ArrayPaths<TObj> & Readonly<string[]>) & (string | string[]));

export type NullablePaths<TObj> = Paths<TObj> | null;

type GetValueByKey<TObj, TKey extends string> = TKey extends `${infer TNumber extends number}`
    ? `0` extends keyof TObj
        ? TNumber extends keyof TObj
            ? TObj[TNumber]
            : never
        : number extends keyof TObj
          ? TObj[number]
          : never
    : TKey extends keyof TObj
      ? TObj[TKey]
      : never;

/**
 * const x1 = { a: { b: 'c' }, d: 'e', f: ['g', 'h', { i: 'j' } ] } as const;
 * GetValueByStringPath<typeof x1, 'a'> = { b: 'c' }
 * GetValueByStringPath<typeof x1, 'a.b'> = 'c'
 * GetValueByStringPath<typeof x1, 'a.b.c'> = never
 * GetValueByStringPath<typeof x1, 'c'> = never
 * GetValueByStringPath<typeof x1, 'f.1'> = { 'h' }
 * GetValueByStringPath<typeof x1, 'f.1.i'> = never
 * GetValueByStringPath<typeof x1, 'f.2.i'> = 'j'
 * GetValueByStringPath<typeof x1, 'f.10'> = never
 *
 * const x2 = { a: { b: 'c' }, d: 'e', f: [{ i: 'j' }, { i: 'k'}] };
 * GetValueByStringPath<typeof x2, 'f.0'> = { i: string }
 * GetValueByStringPath<typeof x2, 'f.0.i'> = string
 * GetValueByStringPath<typeof x2, 'f.10'> = { i: string }
 * GetValueByStringPath<typeof x2, 'f.10.i'> = string
 *
 * const x3 = { a: { b: 'c' as any }, d: 'e' };
 * GetValueByStringPath<typeof x3, 'a.b'> = any
 * GetValueByStringPath<typeof x3, 'a.b.c'> = any
 * GetValueByStringPath<typeof x3, 'a.b.c.d'> = any
 */
type GetValueByStringPath<TObj, TPath extends string> = TObj extends undefined
    ? never
    : TPath extends `${infer TPrefix}.${infer TRest}`
      ? GetValueByStringPath<GetValueByKey<TObj, TPrefix>, TRest>
      : TPath extends ''
        ? TObj
        : GetValueByKey<TObj, TPath>;

type GetValueByArrayPath<TObj, TPath extends Readonly<string[]>> = TObj extends undefined
    ? never
    : TPath extends Readonly<[infer TPrefix extends string, ...infer TRest extends string[]]>
      ? TRest extends Readonly<[unknown, ...unknown[]]>
          ? GetValueByArrayPath<GetValueByKey<TObj, TPrefix>, TRest>
          : GetValueByKey<TObj, TPrefix>
      : TPath extends Readonly<[]>
        ? TObj
        : never;

export type GetValueByPath<
    TObj,
    TPath extends string | Readonly<string[]> | null | undefined,
> = TPath extends null | undefined
    ? TObj
    : TPath extends string
      ? GetValueByStringPath<TObj, TPath>
      : TPath extends Readonly<string[]>
        ? GetValueByArrayPath<TObj, TPath>
        : never;

/**
 * Recursively iterate over all property paths of an object and apply the function.
 *
 * Example: { a: { b: 1 }, c: 'foo' } => ['a', 'b'], ['c']
 *
 * @param obj Object to iterate over
 * @param fn Function to apply for each property path
 * @param path Path to the current value: Must be empty when calling this function externally and is used internally for recursion
 */
export function iterateObjectPaths<
    O extends object,
    Fn extends (path: string[], value: unknown) => unknown,
>(obj: O, fn: Fn, path = [] as string[]): void {
    for (const key in obj) {
        const value = obj[key];
        const currentPath = [...path, key];
        if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            !(value instanceof Date) &&
            Object.keys(value).length > 0
        ) {
            iterateObjectPaths(value, fn, currentPath);
        } else {
            fn(currentPath, value);
        }
    }
}

/**
 * Returns list of key paths defined in an object
 *
 * @param {object} object
 * @returns {string[]} list of key paths
 */
export function getObjectPaths<O extends object>(obj: O): string[] {
    const keys: string[] = [];
    iterateObjectPaths(obj, path => {
        keys.push(path.join('.'));
    });
    return keys;
}
