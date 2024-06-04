import test from 'ava';
import { nameFromEmail } from './nameFromEmail';

test('nameFromEmail returns the part before the @ symbol directly for a single word email', t => {
    const name = nameFromEmail('user@example.com');
    t.is(name, 'user');
});

test('nameFromEmail replaces dots with spaces for multi word emails', t => {
    const name = nameFromEmail('user.name@example.com');
    t.is(name, 'user name');
});

test('nameFromEmail returns an empty string for undefined or null emails', t => {
    const name = nameFromEmail(undefined);
    t.is(name, '');

    const name2 = nameFromEmail(null);
    t.is(name2, '');
});
