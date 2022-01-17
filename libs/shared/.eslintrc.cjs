module.exports = {
    env: {
        browser: true,
        commonjs: true
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
