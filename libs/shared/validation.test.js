import test from 'ava';
import { isAllowedSourceUrl } from './validation.js';

test('isAllowedSourceUrl', t => {
    t.true(isAllowedSourceUrl('http://www.datawrapper.de'));
    t.true(isAllowedSourceUrl('https://www.datawrapper.de'));
    t.true(isAllowedSourceUrl('HTTPS://WWW.DATAWRAPPER.DE'));
    t.true(isAllowedSourceUrl('ftp://www.datawrapper.de'));
    t.false(isAllowedSourceUrl('ssh://www.datawrapper.de'));
    t.false(isAllowedSourceUrl('javascript:alert()'));
    t.false(isAllowedSourceUrl('foo'));
    t.false(isAllowedSourceUrl(''));
});
