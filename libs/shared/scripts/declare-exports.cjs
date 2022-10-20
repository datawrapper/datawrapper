#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const { join } = require('path');

/*
 * this script generates the `exports` declaration in
 * package.json
 */

fs.readdir(join(__dirname, '../src'), function (err, files) {
    const exports = {
        '.': {
            require: './dist/cjs/index.js',
            default: './dist/mjs/index.js'
        }
    };
    files.forEach(file => {
        file = file.replace('.ts', '.js');
        if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            exports[`./${file}`] = {
                require: `./dist/cjs/${file.replace('.js', '.cjs')}`,
                default: `./dist/mjs/${file}`
            };
        }
    });
    const pkgJsonFile = join(__dirname, '../package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonFile, 'utf-8'));
    pkgJson.exports = exports;
    fs.writeFileSync(pkgJsonFile, JSON.stringify(pkgJson, null, 4));
});
