import FontFaceObserver from 'fontfaceobserver';

/**
 * Function that returns a promise, that resolves when all fonts,
 * specified in fontsJSON and typographyJSON have been loaded.
 *
 * @exports observeFonts
 * @kind function
 *
 * @param {Object|Array} fontsJSON
 * @param {Object} typographyJSON
 * @returns {Promise}
 */
export default function observeFonts(fontsJSON, typographyJSON) {
    /* Render vis again after fonts have been loaded */
    const fonts = new Set(
        Array.isArray(fontsJSON)
            ? []
            : Object.keys(fontsJSON).filter(key => fontsJSON[key].type === 'font')
    );
    Object.keys(typographyJSON.fontFamilies || {}).forEach(fontFamily => {
        typographyJSON.fontFamilies[fontFamily].forEach(fontface => {
            /* If this font is being used in a font family */
            if (fonts.has(fontface.name)) {
                /* Remove it form the list of fonts to wait for */
                fonts.delete(fontface.name);
                /* And add it again with theme-defined weight and style */
                fonts.add({
                    family: fontFamily,
                    props: {
                        weight: fontface.weight || 400,
                        style: fontface.style || 'normal'
                    }
                });
            }
        });
    });

    const observers = [];
    fonts.forEach(font => {
        const obs =
            typeof font === 'string'
                ? new FontFaceObserver(font)
                : new FontFaceObserver(font.family, font.props);
        observers.push(obs.load(null, 5000));
    });

    return Promise.all(observers);
}
