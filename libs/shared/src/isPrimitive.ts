type Primitive = string | number | boolean | symbol | bigint | null | undefined;
function isPrimitive(val: unknown): val is Primitive {
    return typeof val === 'object' ? val === null : typeof val !== 'function';
}

export default isPrimitive;
