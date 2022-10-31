type AfterClone<T> = T extends undefined | null | number | string
    ? T
    : T extends Date
    ? string
    : T extends Record<string | number, unknown>
    ? {
          [TKey in keyof T & (string | number)]: AfterClone<T[TKey]>;
      }
    : T extends Readonly<unknown[]>
    ? `0` extends keyof T
        ? {
              [TKey in keyof T & `${number}`]: AfterClone<T[TKey]>;
          }
        : AfterClone<T[number]>[]
    : undefined;

/**
 * Clones an object
 *
 * @exports clone
 * @kind function
 *
 * @param {*} object - the thing that should be cloned
 * @returns {*} - the cloned thing
 */
function clone<T>(o: T): AfterClone<T>;
function clone(o: unknown) {
    if (!o || typeof o !== 'object') return o;
    try {
        return JSON.parse(JSON.stringify(o));
    } catch (e) {
        return o;
    }
}

export = clone;
