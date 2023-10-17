/*
 * Make sure that all exported files are contained within the package.json `exports` field.
 */
const fs = require('node:fs/promises');

try {
    main();
} catch (error) {
    console.error(error);
}

async function main() {
    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));

    const filesInDist = await fs.readdir('./src/');
    const filesInDistPure = (await fs.readdir('./src/pure/')).map(file => `pure/${file}`);

    const missing = [];
    for (const file of [...filesInDist, ...filesInDistPure]) {
        if (fileNotInExports(packageJson.exports, file)) {
            missing.push(file);
        }
    }

    if (missing.length > 0) {
        const errorMessage = `These files are present in the src/ folder, but not in the package.json 'export' field.
    ${missing.join('\n')}`;
        throw new Error(errorMessage);
    }
}

function fileNotInExports(expected, filename) {
    if (filename.includes('.d.ts')) {
        return expected[`./${filename}`];
    }
    const hasJsFile = expected[`./${filename.replace('.ts', '.js')}`];
    const hasDefinition = expected[`./${filename.replace('.ts', '.d.ts')}`];
    const hasBareExport = expected[`./${filename.replace('.ts', '')}`];
    return (
        filename.includes('.') &&
        !filename.includes('.test.') &&
        (!hasJsFile || !hasDefinition || !hasBareExport)
    );
}
