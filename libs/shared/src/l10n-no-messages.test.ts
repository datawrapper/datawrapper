import test from 'ava';
import { __, keyExists } from './l10n';

test.before(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.dw = {} as any;
});

test('__ returns the passed key with prefix MISSING when the global dw.backend.messages object is not defined ', t => {
    t.is(__('non-existent-key'), 'MISSING:non-existent-key');
});

test('keyExists returns false when the global dw.backend.messages object is not defined', t => {
    t.false(keyExists('non-existent-key'));
});
