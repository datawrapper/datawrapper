import DOMPurify from 'isomorphic-dompurify';

export default function purifySvg(input: string) {
    return DOMPurify.sanitize(input, {
        USE_PROFILES: { svg: true, svgFilters: true },
        KEEP_CONTENT: false
    });
}
