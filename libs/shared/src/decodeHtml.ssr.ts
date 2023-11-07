import { parseDocument } from 'htmlparser2';
import { textContent } from 'domutils';

export default function decodeHtml(input: string) {
    return textContent(parseDocument(input));
}
