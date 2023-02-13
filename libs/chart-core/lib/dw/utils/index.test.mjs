import test from 'ava';
import { getChartIdFromUrl, getEmbedJsonUrl } from './index.mjs';

test('getChartIdFromUrl() - detect ids', t => {
    t.is(getChartIdFromUrl('https://datawrapper.dwcdn.net/3tKYp/'), '3tKYp');
    t.is(getChartIdFromUrl('https://datawrapper.dwcdn.net/3tKYp/2/'), '3tKYp');
    t.is(getChartIdFromUrl('/3tKYp/'), '3tKYp');
    t.is(getChartIdFromUrl('/3tKYp/16/'), '3tKYp');
    t.is(getChartIdFromUrl('https://gcs-test.vis4.net/charts/3tKYp/14/'), '3tKYp');
});

test('getChartIdFromUrl() - detect non-embed urls', t => {
    t.is(getChartIdFromUrl('https://datawrapper.dwcdn.net/3tKp/'), null);
    t.is(getChartIdFromUrl('https://datawrapper.dwcdn.net/3tKYp/2a/'), null);
    t.is(getChartIdFromUrl('/3tKYp/foo/'), null);
    t.is(getChartIdFromUrl('/3tKYp/16/data.csv'), null);
    t.is(getChartIdFromUrl('https://gcs-test.vis4.net/charts/3tKYp/14/embed.json'), null);
});

test('getEmbedJsonUrl() - local preview', t => {
    t.deepEqual(getEmbedJsonUrl('http://app.datawrapper.local/preview/ABCDE/embed.js', '12345'), {
        url: 'http://app.datawrapper.local/preview/12345/embed.json',
        pathPrefix: 'preview/'
    });
});

test('getEmbedJsonUrl() - published chart', t => {
    t.deepEqual(getEmbedJsonUrl('https://datawrapper.dwcdn.net/3tKYp/3/embed.js', '12345'), {
        url: 'https://datawrapper.dwcdn.net/12345/embed.json',
        pathPrefix: ''
    });
    t.deepEqual(getEmbedJsonUrl('https://datawrapper.dwcdn.net/3tKYp/embed.js', '12345'), {
        url: 'https://datawrapper.dwcdn.net/12345/embed.json',
        pathPrefix: ''
    });
    t.deepEqual(getEmbedJsonUrl('https://gcs-test.vis4.net/charts/3tKYp/14/embed.js', '12345'), {
        url: 'https://gcs-test.vis4.net/charts/12345/embed.json',
        pathPrefix: 'charts/'
    });
});
