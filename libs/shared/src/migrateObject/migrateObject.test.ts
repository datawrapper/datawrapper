import test from 'ava';
import Joi from 'joi';
import { migrateObject } from './migrateObject';
import { getValueFromArray } from './valueMigrations';

test('migrateObject migrates settings based on simple string mapping', t => {
    const legacySettings = {
        oldPath: 'value',
    };
    const mapping = {
        oldPath: 'newPath',
    };
    const migratedSettings = migrateObject(legacySettings, mapping);
    t.deepEqual(migratedSettings, {
        newPath: 'value',
    });
});

test('migrateObject migrates deeply nested objects', t => {
    const legacySettings = {
        nested: {
            oldPath: 'value',
            anotherPath: 'anotherValue',
        },
    };
    const mapping = {
        'nested.oldPath': 'newNested.newPath',
        'nested.anotherPath': 'newNested.anotherPath',
    };
    const migratedSettings = migrateObject(legacySettings, mapping);
    t.deepEqual(migratedSettings, {
        newNested: {
            newPath: 'value',
            anotherPath: 'anotherValue',
        },
    });
});

test('migrateObject should migrate arrays', t => {
    const legacySettings = {
        oldPath: ['value1', 'value2'],
    };
    const mapping = {
        oldPath: 'newPath',
    };
    const migratedSettings = migrateObject(legacySettings, mapping);
    t.deepEqual(migratedSettings, {
        newPath: ['value1', 'value2'],
    });
});

test('migrateObject migrates to multiple paths', t => {
    const legacySettings = {
        oldPath: 123,
    };
    const mapping = {
        oldPath: ['newPath2.nested', 'newPath1'],
    };
    const migratedSettings = migrateObject(legacySettings, mapping);
    t.deepEqual(migratedSettings, {
        newPath1: 123,
        newPath2: { nested: 123 },
    });
});

test('migrateObject migrates to multiple paths using simple string mapping', t => {
    const legacySettings = {
        oldPath: 123,
    };
    const mapping = {
        oldPath: ['newPath2.nested', 'newPath1'],
    };
    const migratedSettings = migrateObject(legacySettings, mapping);
    t.deepEqual(migratedSettings, {
        newPath1: 123,
        newPath2: { nested: 123 },
    });
});

test('migrateObject should not fail but also not create a new path if the old path does not exist', t => {
    const legacySettings = {};
    const mapping = {
        oldPath: 'newPath',
    };
    const migratedSettings = migrateObject(legacySettings, mapping);
    t.deepEqual(migratedSettings, {});
});

test('migrateObject should throw if the migrated settings do not match the provided schema', t => {
    const newSchema = Joi.object({
        NOTpath: Joi.string(),
    });
    const legacySettings = {
        oldPath: 'value',
    };
    const mapping = {
        oldPath: 'newPath',
    };
    t.throws(() => migrateObject(legacySettings, mapping, newSchema));
});

test('migrateObject should not throw if the migrated settings match the provided schema', t => {
    const newSchema = Joi.object({
        newPath: Joi.string(),
    });
    const legacySettings = {
        oldPath: 'value',
    };
    const mapping = {
        oldPath: 'newPath',
    };
    t.notThrows(() => migrateObject(legacySettings, mapping, newSchema));
    t.deepEqual(migrateObject(legacySettings, mapping, newSchema), {
        newPath: 'value',
    });
});

test('migrateObject modifies the value with the migrateValue function', t => {
    const newSchema = Joi.object({
        newPath: Joi.number(),
    });
    const legacySettings = {
        oldPath: '1234',
    };
    const mapping = {
        oldPath: {
            newPath: 'newPath',
            valueMigration: (oldValue: unknown) => parseInt(oldValue as string, 10),
        },
    };
    t.notThrows(() => migrateObject(legacySettings, mapping, newSchema));
    t.deepEqual(migrateObject(legacySettings, mapping, newSchema), {
        newPath: 1234,
    });
});

test('migrateObject migrates objects', t => {
    const newSchema = Joi.object({
        newObject: Joi.object({
            someValue: Joi.string(),
            anotherValue: Joi.string(),
            aThirdValue: Joi.string().allow(null),
        }),
        finallyIam: Joi.string(),
    });
    const legacySettings = {
        oldObject: {
            someValue: '1234',
            anotherValue: '5678',
            aThirdValue: null,
            get_me: 'out_of_this_object',
        },
    };
    const mapping = {
        oldObject: {
            newPath: 'newObject',
            valueMigration: (oldValue: unknown) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { get_me, ...newObject } = oldValue as Record<string, unknown>;
                return newObject;
            },
        },
        'oldObject.get_me': 'finallyIam',
    };
    t.notThrows(() => migrateObject(legacySettings, mapping, newSchema));
    t.deepEqual(migrateObject(legacySettings, mapping, newSchema), {
        newObject: {
            someValue: '1234',
            anotherValue: '5678',
            aThirdValue: null,
        },
        finallyIam: 'out_of_this_object',
    });
});

test('migrateObject can split up arrays during migration using splitArray function', t => {
    const newSchema = Joi.object({
        migrated: Joi.object({
            path: Joi.object({
                formerArray0: Joi.string(),
                formerArray1: Joi.string(),
            }),
        }),
    });
    const legacySettings = {
        oldPath: ['value1', 'value2'],
    };
    const mapping = {
        oldPath: [
            {
                newPath: 'migrated.path.formerArray0',
                valueMigration: (oldValue: unknown) => getValueFromArray(oldValue, 0),
            },
            {
                newPath: 'migrated.path.formerArray1',
                valueMigration: (oldValue: unknown) => getValueFromArray(oldValue, 1),
            },
        ],
    };
    t.deepEqual(migrateObject(legacySettings, mapping, newSchema), {
        migrated: {
            path: {
                formerArray0: 'value1',
                formerArray1: 'value2',
            },
        },
    });
});

test('migrateObject can split up arrays during migration using splitArray function - when array is missing a value', t => {
    const newSchema = Joi.object({
        migrated: Joi.object({
            path: Joi.object({
                formerArray0: Joi.string(),
                formerArray1: Joi.string(),
            }),
        }),
    });

    const legacySettings = {
        oldPath: ['value1'],
    };
    const mapping = {
        oldPath: [
            {
                newPath: 'migrated.path.formerArray0',
                valueMigration: (oldValue: unknown) => getValueFromArray(oldValue, 0),
            },
            {
                newPath: 'migrated.path.formerArray1',
                valueMigration: (oldValue: unknown) => getValueFromArray(oldValue, 1),
            },
        ],
    };
    t.deepEqual(migrateObject(legacySettings, mapping, newSchema), {
        migrated: {
            path: {
                formerArray0: 'value1',
            },
        },
    });
});

test('migrateObject can split up arrays during migration using splitArray function - when array does not exist', t => {
    const newSchema = Joi.object({
        migrated: Joi.object({
            path: Joi.object({
                formerArray0: Joi.string(),
                formerArray1: Joi.string(),
            }),
        }),
    });
    const legacySettings = {};
    const mapping = {
        oldPath: [
            {
                newPath: 'migrated.path.formerArray0',
                valueMigration: (oldValue: unknown) => getValueFromArray(oldValue, 0),
            },
            {
                newPath: 'migrated.path.formerArray1',
                valueMigration: (oldValue: unknown) => getValueFromArray(oldValue, 1),
            },
        ],
    };
    t.deepEqual(migrateObject(legacySettings, mapping, newSchema), {});
});

test('migrateObject can split up arrays during migration using splitArray function - with custom migrateValue function', t => {
    const newSchema = Joi.object({
        migrated: Joi.object({
            path: Joi.object({
                formerArray0: Joi.number(),
                formerArray1: Joi.number(),
            }),
        }),
    });
    const legacySettings = {
        oldPath: ['1', ''],
    };

    const migrateValue = (value: unknown) => {
        if (value === '') return undefined;
        return parseInt(value as string, 10);
    };
    const mapping = {
        oldPath: [
            {
                newPath: 'migrated.path.formerArray0',
                valueMigration: (oldValue: unknown) => migrateValue(getValueFromArray(oldValue, 0)),
            },
            {
                newPath: 'migrated.path.formerArray1',
                valueMigration: (oldValue: unknown) => migrateValue(getValueFromArray(oldValue, 1)),
            },
        ],
    };
    t.deepEqual(migrateObject(legacySettings, mapping, newSchema), {
        migrated: {
            path: {
                formerArray0: 1,
            },
        },
    });
});
