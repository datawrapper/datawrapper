#!/bin/bash
# read version from package.json
CUR_DIR="$( pwd )"
SCRIPT_DIR="$( dirname "${BASH_SOURCE[0]}" )"
cd $SCRIPT_DIR

VERSION=$(python -c 'import json;print json.loads(open("../package.json").read())["version"]')

# generate js that's packed with each chart
cat src/dw.start.js src/dw.dataset.js src/dw.column.js src/dw.column.types.js src/dw.datasource.js src/dw.datasource.delimited.js src/dw.utils.js src/dw.utils.filter.js src/dw.chart.js src/dw.visualization.js src/dw.visualization.base.js src/dw.theme.js src/dw.theme.base.js src/dw.end.js > dw-2.0.js

cd $CUR_DIR

