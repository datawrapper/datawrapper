/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import Details from './Details.html';

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
    t.context = $('<div />');
    $(document.body)
        .empty()
        .append(t.context);
});

test('Render a modal view', t => {
    new Details({
        target: t.context[0],
        data: { user }
    });

    const rootElement = t.context.children();
    t.true(rootElement.hasClass('modal'));
    t.is(rootElement.attr('role'), 'dialog');
    t.is(rootElement.attr('tabindex'), '-1');
});

test.cb('Fire a "close" event when close button is clicked', t => {
    t.plan(1);

    const details = new Details({
        target: t.context[0],
        data: { user }
    });

    details.on('close', () => {
        t.pass();
        t.end();
    });

    t.context.find('[aria-label="Close"]').trigger('click');
});
