import DOMPurify from 'dompurify';

export default function purifySvg(input) {
    return DOMPurify.sanitize(input, {
        USE_PROFILES: { svg: true, svgFilters: true },
        KEEP_CONTENT: false
    });
}
