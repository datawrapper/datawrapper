import htmlparser2 from 'htmlparser2';
import domutils from 'domutils';

export default function decodeHtml(input) {
    return domutils.textContent(htmlparser2.parseDocument(input));
}
