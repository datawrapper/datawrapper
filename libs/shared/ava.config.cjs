module.exports = {
    extensions: ['ts'],
    files: ['src/**/*.test.*', '!src/**/*.perf.test.*'],
    require: ['./test/helpers/setup-browser-env.ts'],
    nodeArguments: ['--loader=tsx', '--no-warnings'],
    timeout: '40s'
};
