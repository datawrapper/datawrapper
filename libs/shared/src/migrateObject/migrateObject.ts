import Joi from 'joi';
import { get, set, forEach, isArray } from 'lodash';

type MigrateTo = {
    path: string;
    value?: (oldValue: unknown) => unknown;
};

type PathMapping = {
    [key: string]: MigrateTo | MigrateTo[] | string | string[];
};

export function splitArray(
    probablyArray: unknown[] | unknown,
    index: number,
    migrateValue?: (value: unknown) => unknown
) {
    let oldValue;
    try {
        oldValue = (probablyArray as unknown[])[index];
    } catch (e) {
        return undefined;
    }
    const newValue = migrateValue ? migrateValue(oldValue) : oldValue;
    return newValue;
}

function migrateValue(
    legacyObject: object,
    migratedObject: object,
    oldPath: string,
    MigrateTo: MigrateTo | string
) {
    if (typeof MigrateTo === 'string') {
        set(migratedObject, MigrateTo, get(legacyObject, oldPath));
        return;
    }
    const { path, value } = MigrateTo;
    const newValue = value ? value(get(legacyObject, oldPath)) : get(legacyObject, oldPath);
    if (newValue !== undefined) set(migratedObject, path, newValue);
}

/**
 * Migrate an object from a legacy schema to a new schema.
 * @param legacyObject The object to migrate
 * @param pathMapping An object that maps the old legacy path to the new path using MigrateTo objects
 * @param newSchema [optional] A Joi schema to validate the migrated object against
 * @returns The migrated object
 */
export function migrateObject(
    legacyObject: object,
    pathMapping: PathMapping,
    newSchema?: Joi.ObjectSchema
): object {
    const migratedObject: { [key: string]: unknown } = {};
    forEach(pathMapping, (MigrateTo, oldPath) => {
        if (isArray(MigrateTo)) {
            MigrateTo.forEach(MigrateToItem => {
                migrateValue(legacyObject, migratedObject, oldPath, MigrateToItem);
            });
        } else {
            migrateValue(legacyObject, migratedObject, oldPath, MigrateTo);
        }
    });
    if (newSchema) Joi.assert(migratedObject, newSchema);
    return migratedObject;
}
