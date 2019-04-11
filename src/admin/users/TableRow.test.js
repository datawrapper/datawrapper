/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import TableRow from './TableRow.html';

const roleOptions = [
    { name: 'role / admin', slug: 'admin', icon: 'fire' },
    { name: 'role / editor', slug: 'editor', icon: 'user' },
    { name: 'role / pending', slug: 'pending', icon: 'user' }
];

const user = {
    chartCount: 0,
    createdAt: '2019-03-18T17:19:59.000Z',
    email: 'abby@example.com',
    id: '4711',
    language: 'en_US',
    name: 'Abby Example',
    role: 'editor',
    url: 'http://api.datawrapper.local:18080/v3/users/2',
    teams: [{ name: 'foo' }, { name: 'bar' }]
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
        data: { user, roleOptions }
    });

    const rootElement = t.context.children();
    t.is(rootElement.prop('tagName'), 'TR');
});

test('Render a link to the details page', t => {
    new TableRow({
        target: t.context[0],
        data: { user, roleOptions }
    });

    const linkElements = t.context.find('a');
    t.is(linkElements.attr('href'), '?currentUser=4711');
});

test('Render a list of teams', t => {
    new TableRow({
        target: t.context[0],
        data: { user, roleOptions }
    });

    const teams = t.context.find('[data-test="display-teams"]');
    t.is(teams.text(), 'foo, bar');
});

test.skip('Render a formatted creation date', t => {
    // TODO: This test requires loaded translations in order to properly format the date. How to deal with that?
    new TableRow({
        target: t.context[0],
        data: { user, roleOptions }
    });
    const teams = t.context.find('[data-test="display-createdat"]');
    t.is(teams.text(), 'Mar 18, 2019 6:19 PM');
});

test.cb('Fire a "navigate" event when link is clicked', t => {
    const tableRow = new TableRow({
        target: t.context[0],
        data: { user, roleOptions }
    });

    t.plan(1);
    tableRow.on('navigate', userId => {
        t.is(userId, '4711');
        t.end();
    });
    t.context.find('a[href$="4711"]').trigger('click');
});

test.cb('Fire a "save" event with name & email when save button is clicked', t => {
    const tableRow = new TableRow({
        target: t.context[0],
        data: { user, roleOptions }
    });

    // Click on edit button:
    t.context.find('[data-test="action-edit"]').trigger('click');

    // Enter new name:
    t.context
        .find('[data-test="input-name"]')
        .val('Bob Example')
        .trigger('input');

    // Enter new email:
    t.context
        .find('[data-test="input-email"]')
        .val('bob@example.com')
        .trigger('input');

    // Expect `save` to be fired with updated name & email:
    t.plan(3);
    tableRow.on('save', ({ userId, changes: { name, email } }) => {
        t.is(userId, '4711');
        t.is(name, 'Bob Example');
        t.is(email, 'bob@example.com');
        t.end();
    });

    t.context.find('[data-test="action-save"]').trigger('click');
});

test.cb('Fire a "save" event with only the changed properties', t => {
    const tableRow = new TableRow({
        target: t.context[0],
        data: { user, roleOptions }
    });

    // Click on edit button:
    t.context.find('[data-test="action-edit"]').trigger('click');

    // Enter new name:
    t.context
        .find('[data-test="input-name"]')
        .val('Bob Example')
        .trigger('input');

    // Expect `save` to be fired with only the new name
    t.plan(3);
    tableRow.on('save', ({ userId, changes }) => {
        t.is(userId, '4711');
        t.is(changes.name, 'Bob Example');
        t.is(Object.keys(changes).length, 1);
        t.end();
    });

    t.context.find('[data-test="action-save"]').trigger('click');
});
