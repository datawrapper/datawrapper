/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import Table from './Table.html';

const columnHeaders = [
    { name: 'One sortable header', orderBy: 'foo' },
    { name: 'Two sortable headers', orderBy: 'bar' },
    { name: 'Three sortable headers', orderBy: 'baz' },
    { name: 'One static header' },
    { name: 'Two static headers' }
];

test.beforeEach(t => {
    t.context = $('<div />');
    $(document.body)
        .empty()
        .append(t.context);
});

test('Render a table with `thead` and `tbody` elements', t => {
    new Table({
        target: t.context[0],
        data: { columnHeaders }
    });

    const tableElement = t.context.children();
    t.is(tableElement.get(0).tagName, 'TABLE');
    t.is(tableElement.children().get(0).tagName, 'THEAD');
    t.is(tableElement.children().get(1).tagName, 'TBODY');
});

test('Render table rows passed as children', t => {
    new Table({
        target: t.context[0],
        data: { columnHeaders },
        slots: { default: $('<tr><td>TEST</td></tr>').get(0) }
    });

    t.is(t.context.find('tbody').html(), '<tr><td>TEST</td></tr>');
});

test('Render a "th" element for each header item', t => {
    new Table({
        target: t.context[0],
        data: { columnHeaders }
    });

    t.is(t.context.find('th').get().length, 5);
    t.is(t.context.find('th:nth-child(1)').text(), 'One sortable header');
    t.is(t.context.find('th:nth-child(2)').text(), 'Two sortable headers');
    t.is(t.context.find('th:nth-child(3)').text(), 'Three sortable headers');
    t.is(t.context.find('th:nth-child(4)').text(), 'One static header');
    t.is(t.context.find('th:nth-child(5)').text(), 'Two static headers');
});

test('Render links for items where an "orderBy" prop is provided', t => {
    new Table({
        target: t.context[0],
        data: { columnHeaders }
    });

    const linkElements = t.context.find('a');
    t.is(linkElements.get().length, 3);
    t.is(linkElements.get(0).href, '?orderBy=foo');
    t.is(linkElements.get(1).href, '?orderBy=bar');
    t.is(linkElements.get(2).href, '?orderBy=baz');
});

test.cb('Clicking links should trigger a "sort" event', t => {
    t.plan(1);

    const table = new Table({
        target: t.context[0],
        data: { columnHeaders }
    });

    table.on('sort', item => {
        t.deepEqual(item, 'bar');
        t.end();
    });

    t.context.find('a')[1].click();
});
