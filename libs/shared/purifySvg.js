import purifyHtml from './purifyHtml.js';

const ALLOWED_SVG_ELEMENTS = [
    'a',
    'animate',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'defs',
    'desc',
    'discard',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feDropShadow',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'foreignObject',
    'g',
    'hatch',
    'hatchpath',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'set',
    'stop',
    'style',
    'svg',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tspan',
    'use',
    'view'
]
    .map(tag => `<${tag}>`)
    .join('');

function purifyXml(input, allowed) {
    // Replace void tags (e.g. `<circle />`) with immediately closed tags
    // (e.g. `<circle></circle>`), otherwise purifyHtml leaves the tags open and closes them only
    // sometime later, which results in a functionally different markup.
    return purifyHtml(input && input.replace(/<([A-Za-z]+)(.+?)\s*\/>/g, '<$1$2></$1>'), allowed);
}

export default function purifySvg(input) {
    return purifyXml(input, ALLOWED_SVG_ELEMENTS);
}
