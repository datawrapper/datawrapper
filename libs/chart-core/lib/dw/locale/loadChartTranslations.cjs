/* eslint-env node */
const fs = require('node:fs/promises');
const path = require('node:path');

const chartTranslationsPath = path.join(__dirname, 'chart-translations.json');

let chartTranslationsCache;

async function loadChartTranslations() {
    if (!chartTranslationsCache) {
        chartTranslationsCache = JSON.parse(await fs.readFile(chartTranslationsPath, 'utf-8'));
    }
    return chartTranslationsCache;
}

module.exports = loadChartTranslations;
