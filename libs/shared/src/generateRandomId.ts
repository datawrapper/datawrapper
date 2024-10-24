import { nanoid } from 'nanoid';

/**
 * Generates a unique random string.
 * @returns a random string of length 10
 */
export function generateRandomId(): string {
    return nanoid(10);
}
