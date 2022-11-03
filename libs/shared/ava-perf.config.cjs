module.exports = {
    extensions: ['ts'],
    files: ['./src/**/*.perf.test.*'],
    require: ['ts-node/register', './test/helpers/setup-browser-env.ts'],
    nodeArguments: ['--no-warnings']
};
