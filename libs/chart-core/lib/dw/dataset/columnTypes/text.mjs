import { identity } from 'underscore';

export default function() {
    return {
        parse: identity,
        errors: function() {
            return 0;
        },
        name: function() {
            return 'text';
        },
        isValid: function() {
            return true;
        },
        format: function() {}
    };
}
