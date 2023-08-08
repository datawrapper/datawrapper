module.exports = {
    env: {
        browser: true,
        commonjs: true
    },
    parserOptions: {
        project: 'libs/shared/tsconfig.json'
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
