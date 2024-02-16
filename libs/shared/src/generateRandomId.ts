import { nanoid } from 'nanoid';

/**
 * Generates a unique id for annotations.
 * We need to assign ids to annotations so that we can perform fine-grained conflict resolution on them (see {@link CRDT}).
 * It's part of shared because it's used by old and new controls.
 * @returns a random string of length 10
 */
export function generateRandomId() {
    return nanoid(10);
}
