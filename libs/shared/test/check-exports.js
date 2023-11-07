/*
 * Make sure that all exported files are contained within the package.json `exports` field.
 */
import fs from 'node:fs/promises';

function isModuleInExports(filename, exports) {
    const moduleName = filename.replace(/\.ts$/, '');
    const distDeclarationCJS = `./dist/cjs/${moduleName}.d.cts`;
    const distDeclarationESM = `./dist/esm/${moduleName}.d.ts`;
    const distCJS = `./dist/cjs/${moduleName}.cjs`;
    const distESM = `./dist/esm/${moduleName}.js`;
    return (
        exports[`./${moduleName}.d.ts`]?.require === distDeclarationCJS &&
        exports[`./${moduleName}.d.ts`]?.['default'] === distDeclarationESM &&
        exports[`./${moduleName}.js`]?.require === distCJS &&
        exports[`./${moduleName}.js`]?.['default'] === distESM &&
        exports[`./${moduleName}`]?.require === distCJS &&
        exports[`./${moduleName}`]?.['default'] === distESM &&
        exports[`./dist/cjs/${moduleName}.cjs`]?.require === distCJS &&
        exports[`./dist/cjs/${moduleName}.cjs`]?.['default'] === distESM
    );
}

async function main() {
    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));

    process.stdout.write('Checking the index module\n');
    if (
        packageJson.exports['.']?.require !== './dist/cjs/index.cjs' ||
        packageJson.exports['.']?.['default'] !== './dist/esm/index.js'
    ) {
        process.stderr.write(
            "Failed. The index module is not present in the package.json 'exports' field.\n"
        );
        process.exit(1);
    }

    process.stdout.write('Checking the package.json file itself\n');
    if (packageJson.exports['./package.json'] !== './package.json') {
        process.stderr.write(
            "Failed. The ./package.json file is not present in the package.json 'exports' field.\n"
        );
        process.exit(1);
    }

    const filesInDist = await fs.readdir('./src/');
    const filesInDistPure = (await fs.readdir('./src/pure/')).map(filename => `pure/${filename}`);

    const missing = [];
    for (const filename of [...filesInDist, ...filesInDistPure]) {
        if (filename.endsWith('.test.ts') || filename.endsWith('.d.ts') || filename === 'pure') {
            process.stdout.write(`Skipping known file ${filename}\n`);
        } else if (filename.endsWith('.ts')) {
            process.stdout.write(`Checking module file ${filename}\n`);
            if (!isModuleInExports(filename, packageJson.exports)) {
                missing.push(filename);
            }
        } else {
            process.stdout.write(`Skipping unknown file ${filename}\n`);
        }
    }

    if (missing.length > 0) {
        process.stderr.write(
            "Failed. These files are present in the src/ folder, but not in the package.json 'exports' field:\n"
        );
        for (const m of missing) {
            process.stderr.write(`    ${m}\n`);
        }
        process.exit(1);
    }
    process.stdout.write('All checks succeeded!\n');
}

main().catch(console.error);
