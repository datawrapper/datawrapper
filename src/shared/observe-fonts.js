import FontFaceObserver from 'fontfaceobserver';

/**
 * Function that returns a promise, that resolves when all fonts,
 * specified in fontsJSON and typographyJSON have been loaded.
 *
 * @export
 * @param {Object|Array} fontsJSON
 * @param {Object} typographyJSON
 * @returns {Promise}
 */
export default function observeFonts(fontsJSON, typographyJSON) {
    /* Render vis again after fonts have been loaded */
    const loadingFonts = Array.isArray(fontsJSON) ? [] : Object.keys(fontsJSON);
    const fonts = new Set(loadingFonts);

    Object.keys(typographyJSON).forEach(key => {
        const typefaceKey = typographyJSON[key].typeface;
        if (typefaceKey) {
            const typeFaces = typefaceKey.split(',').map(t => t.trim());
            typeFaces.forEach(face => fonts.add(face));
        }
    });

    const observers = [];
    fonts.forEach(font => {
        const obs = new FontFaceObserver(font);
        observers.push(obs.load(null, 5000));
    });

    return Promise.all(observers);
}
