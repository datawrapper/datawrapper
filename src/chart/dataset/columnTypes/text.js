const _identity = d => d;

export default function() {
    return {
        parse: _identity,
        errors: function() {
            return 0;
        },
        name: function() {
            return 'text';
        },
        formatter: function() {
            return _identity;
        },
        isValid: function() {
            return true;
        },
        format: function() {}
    };
}
