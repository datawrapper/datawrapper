module.exports = {
    extensions: ['ts'],
    files: ['./src/**/*.perf.test.*'],
    require: ['./test/helpers/setup-browser-env.ts'],
    nodeArguments: ['--import=tsx', '--no-warnings'],
    timeout: '2m'
};
