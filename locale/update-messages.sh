#!/bin/sh
php ../scripts/gen_template_cache.php
xgettext --default-domain=core -o messages.pot --from-code=UTF-8 -n --omit-header -k__ -L PHP ../controller/*.php ../scripts/tmpl_cache/*.php ../www/index.php ../www/api/index.php ../lib/api/*.php ../lib/api/*/*.php ../lib/core/build/classes/datawrapper/*.php ../lib/session/*.php ../lib/templates/*.php ../lib/utils/*.php
php ../scripts/po2json.php -i messages.pot -o m.json
rm messages.pot

for dir in $(find ../plugins -type d -depth 1)
do
    PLUGIN=${dir:11}
    mkdir -p "../plugins/$PLUGIN/locale"
    POFILE="../plugins/$PLUGIN/locale/messages.pot"
    JSONFILE="../plugins/$PLUGIN/locale/messages.json"
    xgettext --default-domain="plugin-$PLUGIN" -k__ -o "$POFILE" --from-code=UTF-8 -n --omit-header -L PHP `echo ../plugins/$PLUGIN/*.php`
    if [ -f "$POFILE" ]
    then
        php ../scripts/po2json.php -i "$POFILE" -o "$JSONFILE"
        rm "$POFILE"
    fi
done