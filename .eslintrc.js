module.exports = {
    parser: 'babel-eslint',
    rules: {
        'no-sequences': 'error',
        eqeqeq: ['error', 'smart'],
        'no-multiple-empty-lines': ['error', { max: 1 }],
        'no-console': ['error', { allow: ['warn', 'error'] }]
    },
    plugins: ['html', '@tivac/svelte']
};
