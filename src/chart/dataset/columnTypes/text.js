import _ from 'underscore';

export default function() {
    return {
        parse: _.identity,
        errors: function() {
            return 0;
        },
        name: function() {
            return 'text';
        },
        formatter: function() {
            return _.identity;
        },
        isValid: function() {
            return true;
        },
        format: function() {}
    };
}
