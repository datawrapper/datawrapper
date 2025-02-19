/**
 * Create a SHA-256 hash from any object or primitive value.
 */
export async function hash(data: object | string | number): Promise<string> {
    // Convert the input string to an ArrayBuffer
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));

    // Generate the hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);

    // Convert the ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
