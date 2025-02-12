import Joi from 'joi';
import { get, set, forEach } from 'lodash';

/**
 * Describing how to migrate a value to a path in the new object.
 *
 * To migrate the value to a new path unchanged, use a string.
 * To migrate the value to a new path with a transformation, use an object with a `path` and a `valueMigration` function.
 * To migrate the value to multiple new paths, use an array of migration strategies.
 *
 */
type MigrationStrategy =
    | string
    | {
          newPath: string;
          valueMigration: (oldValue: unknown) => unknown;
      }
    | MigrationStrategy[];

/**
 * Mapping the strategy to migrate a value from an old path to a new path for each key in the object.
 */
type PathMapping = {
    [key: string]: MigrationStrategy;
};

/**
 * Migrate an object from a legacy schema to a new schema.
 *
 * @param legacyObject The object to migrate
 * @param pathMapping An object that maps the old legacy path to the new path using a migration strategy
 * @param newSchema [optional] A Joi schema to validate the migrated object against
 * @returns The migrated object
 */
export function migrateObject(
    legacyObject: object,
    pathMapping: PathMapping,
    newSchema?: Joi.ObjectSchema
): object {
    const migratedObject: { [key: string]: unknown } = {};
    forEach(pathMapping, (strategy, oldPath) => {
        migrateValue(legacyObject, migratedObject, oldPath, strategy);
    });
    if (newSchema) Joi.assert(migratedObject, newSchema);
    return migratedObject;
}

/**
 * Migrate a value from an old path to a new path using a migration strategy.
 */
function migrateValue(
    legacyObject: object,
    migratedObject: object,
    oldPath: string,
    strategy: MigrationStrategy
) {
    if (Array.isArray(strategy)) {
        // the old value will be migrated to multiple new paths
        strategy.forEach(strategy => {
            migrateValue(legacyObject, migratedObject, oldPath, strategy);
        });
        return;
    }

    const oldValue = get(legacyObject, oldPath);
    if (typeof strategy === 'string') {
        // the old value will be migrated to a new path unchanged
        const newPath = strategy;
        if (oldValue !== undefined) set(migratedObject, newPath, oldValue);
        return;
    }
    // the old value will be migrated to a new path with a value migration function
    const { newPath, valueMigration } = strategy;
    const newValue = valueMigration(oldValue);
    if (newValue !== undefined) set(migratedObject, newPath, newValue);
}
