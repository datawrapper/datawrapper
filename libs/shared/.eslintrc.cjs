module.exports = {
    env: {
        browser: true,
        commonjs: true
    },
    settings: {
        polyfills: ['Promise', 'fetch']
    },
    overrides: [
        {
            files: ['jsdoc2md/**'],
            env: {
                browser: false,
                node: true
            }
        }
    ]
};
