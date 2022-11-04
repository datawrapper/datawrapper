module.exports = {
    extensions: ['ts'],
    files: ['src/**/*.test.*', '!src/**/*.perf.test.*'],
    require: ['ts-node/register', './test/helpers/setup-browser-env.ts'],
    nodeArguments: ['--no-warnings'],
    timeout: '40s'
};
