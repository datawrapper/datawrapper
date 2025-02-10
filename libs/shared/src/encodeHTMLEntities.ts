/**
 * Encodes HTML entities in a string.
 * @warning Only works in browser environment!
 */
export function encodeHTMLEntities(text: string) {
    const encoder = document.createElement('div');
    encoder.innerText = text;
    return encoder.innerHTML;
}
