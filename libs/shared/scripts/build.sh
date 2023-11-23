#!/bin/sh

# Notice that this script must have /bin/sh hashbang not /bin/bash, because we call it from the
# worker Dockerfile, which doesn't have bash.

set -eu

dir=$(cd "$(dirname "$0")" || exit 1; pwd -P)
cd "$dir"/..

# Build CJS into dist.new/cjs
rm -Rf dist.new/*
node_modules/.bin/tsc --project ./tsconfig.build.cjs.json --outDir dist.new/cjs

# Change extensions to .cjs, so that the modules can be imported from this `type: module` package.
find dist.new/cjs -name '*.js' -exec sh -c 'mv -v "$1" "${1%.js}.cjs"' _ {} \;
find dist.new/cjs -name '*.js.map' -exec sh -c 'mv -v "$1" "${1%.js.map}.cjs.map"' _ {} \;
find dist.new/cjs -name '*.ts' -exec sh -c 'mv -v "$1" "${1%.ts}.cts"' _ {} \;
if sed --help 2>&1 | grep -E 'GNU sed|BusyBox'; then
    find dist.new/cjs -name '*.cjs' -exec sed -i -E 's|require\("(\.{1,2}/.+)\.js"\)|require("\1.cjs")|' {} \;
else
    find dist.new/cjs -name '*.cjs' -exec sed -i '' -E 's|require\("(\.{1,2}/.+)\.js"\)|require("\1.cjs")|' {} \;
fi

# Build ESM into dist.new/esm
node_modules/.bin/tsc --project ./tsconfig.build.esm.json --outDir dist.new/esm

# Merge the content of dist.new/ into dist/ to avoid downtime
if [ -e dist ]; then
    cp -av dist.new/* dist
else
    cp -av dist.new dist
fi
