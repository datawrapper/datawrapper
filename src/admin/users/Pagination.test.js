/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import Pagination from './Pagination.html';

const paginationItems = [
    { state: { limit: 3, offset: 0 } },
    { state: { limit: 3, offset: 3 } },
    { state: { limit: 3, offset: 6 } },
    { state: { limit: 3, offset: 9 } },
    { state: { limit: 3, offset: 12 } },
    { state: { limit: 3, offset: 15 } },
    { state: { limit: 3, offset: 18 } },
    { state: { limit: 3, offset: 21 } },
    { state: { limit: 3, offset: 24 } }
];

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Render a "«" link to the first page as the first item', t => {
    new Pagination({
        target: t.context,
        data: {
            pages: paginationItems
        }
    });

    const el = $('a', t.context).first();
    t.is(el.text(), '«');
    t.is(el.attr('href'), '?limit=3&offset=0');
});

test('Render a "»" link to the last page as the last item', t => {
    new Pagination({
        target: t.context,
        data: {
            pages: paginationItems
        }
    });

    const el = $('a', t.context).last();
    t.is(el.text(), '»');
    t.is(el.attr('href'), '?limit=3&offset=24');
});

test('Render numbered links for each page', t => {
    new Pagination({
        target: t.context,
        data: {
            pages: paginationItems
        }
    });

    const elements = $('a', t.context);

    t.is($(elements[1]).text(), '1');
    t.is($(elements[1]).attr('href'), '?limit=3&offset=0');

    t.is($(elements[2]).text(), '2');
    t.is($(elements[2]).attr('href'), '?limit=3&offset=3');

    t.is($(elements[3]).text(), '3');
    t.is($(elements[3]).attr('href'), '?limit=3&offset=6');

    t.is($(elements[4]).text(), '4');
    t.is($(elements[4]).attr('href'), '?limit=3&offset=9');

    t.is($(elements[5]).text(), '5');
    t.is($(elements[5]).attr('href'), '?limit=3&offset=12');
});

test.cb('Clicking links should trigger a "navigate" event', t => {
    t.plan(1);

    const pagination = new Pagination({
        target: t.context,
        data: {
            pages: paginationItems
        }
    });

    pagination.on('navigate', item => {
        t.deepEqual(item, { limit: 3, offset: 3 });
        t.end();
    });

    $('a', t.context)[2].click();
});
