#!/bin/bash

#
# this script parses the Datawrapper source code for
# translations (using xgettext) and converts the po-files
# to JSON
#

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
rm -Rf tmpl_cache/*
php gen_template_cache.php
xgettext --default-domain=core -o messages.pot --from-code=UTF-8 -n --omit-header -k__ -L PHP ../controller/*.php tmpl_cache/*.php ../www/index.php ../www/api/index.php ../lib/api/*.php ../lib/api/*/*.php ../lib/core/build/classes/datawrapper/*.php ../lib/session/*.php ../lib/templates/*.php ../lib/utils/*.php
php po2json.php -i messages.pot -o ../locale/messages.json
rm messages.pot

for dir in $(ls -1d ../plugins/*/)
do
    PLUGIN=${dir:11}
    PLUGIN=${PLUGIN:0:${#PLUGIN}-1}
    mkdir -p "../plugins/$PLUGIN/locale"
    POFILE="../plugins/$PLUGIN/locale/messages.pot"
    JSONFILE="../plugins/$PLUGIN/locale/messages.json"
    xgettext --default-domain="plugin-$PLUGIN" -k__ -o "$POFILE" --from-code=UTF-8 -n --omit-header -L PHP $(shopt -s nullglob; echo ../plugins/$PLUGIN/*.php) $(shopt -s nullglob; echo ../scripts/tmpl_cache/plugins/${PLUGIN}__*.php)
    if [ -f "$POFILE" ]
    then
        php ../scripts/po2json.php -i "$POFILE" -o "$JSONFILE"
        rm "$POFILE"
    fi
    if [ ! -f "$JSONFILE" ]
    then
        rmdir "../plugins/$PLUGIN/locale"
    fi
done