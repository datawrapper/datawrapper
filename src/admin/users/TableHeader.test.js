/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import TableHeader from './TableHeader.html';

const headerItems = [
    { name: 'One sortable header', orderBy: 'foo' },
    { name: 'Two sortable headers', orderBy: 'bar' },
    { name: 'Three sortable headers', orderBy: 'baz' },
    { name: 'One static header' },
    { name: 'Two static headers' }
];

test.beforeEach(t => {
    t.context = $('<table />');
    $(document.body)
        .empty()
        .append(t.context);
});

test('Render a "thead" element', t => {
    new TableHeader({
        target: t.context[0],
        data: { headerItems }
    });

    const rootElement = t.context.children();
    t.is(rootElement.prop('tagName'), 'THEAD');
});

test('Render a "th" element for each header item', t => {
    new TableHeader({
        target: t.context[0],
        data: { headerItems }
    });

    t.is(t.context.find('th').get().length, 5);
    t.is(t.context.find('th:nth-child(1)').text(), 'One sortable header');
    t.is(t.context.find('th:nth-child(2)').text(), 'Two sortable headers');
    t.is(t.context.find('th:nth-child(3)').text(), 'Three sortable headers');
    t.is(t.context.find('th:nth-child(4)').text(), 'One static header');
    t.is(t.context.find('th:nth-child(5)').text(), 'Two static headers');
});

test('Render links for items where an "orderBy" prop is provided', t => {
    new TableHeader({
        target: t.context[0],
        data: { headerItems }
    });

    const linkElements = t.context.find('a');
    t.is(linkElements.get().length, 3);
    t.is(linkElements.get(0).href, '?orderBy=foo');
    t.is(linkElements.get(1).href, '?orderBy=bar');
    t.is(linkElements.get(2).href, '?orderBy=baz');
});

test.cb('Clicking links should trigger a "sort" event', t => {
    t.plan(1);

    const tableHeader = new TableHeader({
        target: t.context[0],
        data: { headerItems }
    });

    tableHeader.on('sort', item => {
        t.deepEqual(item, 'bar');
        t.end();
    });

    t.context.find('a')[1].click();
});
