#!/bin/bash
rm -Rf ../scripts/tmpl_cache/*
php ../scripts/gen_template_cache.php
xgettext --default-domain=core -o messages.pot --from-code=UTF-8 -n --omit-header -k__ -L PHP ../controller/*.php ../scripts/tmpl_cache/*.php ../www/index.php ../www/api/index.php ../lib/api/*.php ../lib/api/*/*.php ../lib/core/build/classes/datawrapper/*.php ../lib/session/*.php ../lib/templates/*.php ../lib/utils/*.php
php ../scripts/po2json.php -i messages.pot -o messages.json
rm messages.pot

for dir in $(ls -1 ../plugins)
do
    PLUGIN=$dir
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