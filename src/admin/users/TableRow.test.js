/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import TableRow from './TableRow.html';

const user = {
    chartCount: 0,
    createdAt: '2019-03-18T17:19:59.000Z',
    email: 'abby@example.com',
    id: 4711,
    language: 'en_US',
    name: 'Abby Example',
    role: 3,
    url: 'http://api.datawrapper.local:18080/v3/users/2'
};

test.beforeEach(t => {
    t.context = $('<table />');
    $(document.body)
        .empty()
        .append(t.context);
});

test('Render a "tr" element', t => {
    new TableRow({
        target: t.context[0],
        data: { user }
    });

    const rootElement = t.context.children();
    t.is(rootElement.prop('tagName'), 'TR');
});

test('Render a link to the details page', t => {
    new TableRow({
        target: t.context[0],
        data: { user }
    });

    const linkElements = t.context.find('a');
    t.is(linkElements.attr('href'), '?currentUser=4711');
});

test.cb('Clicking links should trigger a "navigate" event', t => {
    t.plan(1);

    const tableRow = new TableRow({
        target: t.context[0],
        data: { user }
    });

    tableRow.on('navigate', userId => {
        t.is(userId, 4711);
        t.end();
    });

    t.context.find('a[href$="4711"]')[0].click();
});
