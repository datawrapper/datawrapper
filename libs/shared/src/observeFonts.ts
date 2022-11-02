import FontFaceObserver from 'fontfaceobserver';
import { FontObject, Typography } from './themeTypes';

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
export = function observeFonts(
    fontsJSON: Record<string, { type?: string }> | string[],
    typographyJSON: Typography
) {
    /* Render vis again after fonts have been loaded */
    const fontsSet = new Set(
        Array.isArray(fontsJSON)
            ? []
            : Object.keys(fontsJSON).filter(key => fontsJSON[key].type === 'font')
    );
    const fontsObjects: FontObject[] = [];
    Object.keys(typographyJSON.fontFamilies || {}).forEach(fontFamily => {
        typographyJSON.fontFamilies[fontFamily].forEach(fontface => {
            /* If this font is being used in a font family */
            if (fontsSet.has(fontface.name)) {
                /* Remove it form the list of fonts to wait for */
                fontsSet.delete(fontface.name);
                /* And add it again with theme-defined weight and style */
                fontsObjects.push({
                    family: fontFamily,
                    props: {
                        weight: fontface.weight || 400,
                        style: fontface.style || 'normal'
                    }
                });
            }
        });
    });

    const observers: Promise<void>[] = [];
    fontsSet.forEach(font => {
        const obs = new FontFaceObserver(font);
        observers.push(obs.load(null, 5000));
    });
    fontsObjects.forEach(font => {
        const obs = new FontFaceObserver(font.family, font.props);
        observers.push(obs.load(null, 5000));
    });

    return Promise.all(observers);
};
