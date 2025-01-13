import test from 'ava';
import chart from './chart.js';
import '../../tests/helpers/setup-browser-env.js';
import set from 'lodash/set.js';
import cloneDeep from 'lodash/cloneDeep.js';

test('chart.translate returns the correct translation', t => {
    const dwChart = chart({});
    const translations = {
        'translation-key': 'This is a translation',
        'translation-key-with-replacements': 'This is the $0 translation, it is $1',
    };
    dwChart.translations(translations);
    t.is(dwChart.translate('translation-key'), 'This is a translation');
    t.is(
        dwChart.translate('translation-key-with-replacements', 'best', 'awesome'),
        'This is the best translation, it is awesome'
    );
});

test('chart.translate returns editor translations when chart is in editor', t => {
    const editorTranslations = {
        'translation-key': 'Das ist eine Übersetzung',
        'translation-key-with-replacements': 'Das ist die $0 Übersetzung, sie ist $1',
    };

    // this emulates the 'in editor' context
    const parentWindow = cloneDeep(window);
    window.parent = parentWindow;
    set(window, 'parent.dw.backend.__messages.chart', editorTranslations);
    set(window, 'parent.dw.backend.hooks', {});

    const dwChart = chart({});
    t.truthy(dwChart.inEditor());

    const translations = {
        'translation-key': 'This is a translation',
        'translation-key-with-replacements': 'This is the $0 translation, it is $1',
    };

    // chart scope translations
    dwChart.translations(translations);
    t.is(dwChart.translate('translation-key'), 'This is a translation');
    t.is(
        dwChart.translate('translation-key-with-replacements', 'best', 'awesome'),
        'This is the best translation, it is awesome'
    );

    // editor scope translations
    t.is(dwChart.translate('translation-key', true), 'Das ist eine Übersetzung');
    t.is(
        dwChart.translate('translation-key-with-replacements', true, 'beste', 'super'),
        'Das ist die beste Übersetzung, sie ist super'
    );
});
