#!/bin/sh
php ../scripts/gen_template_cache.php
xgettext --default-domain=core -o messages.pot --from-code=UTF-8 -n --omit-header -L PHP ../controller/*.php ../scripts/tmpl_cache/*.php ../www/index.php ../www/api/index.php ../lib/api/*.php ../lib/api/*/*.php ../lib/core/build/classes/datawrapper/*.php ../lib/session/*.php ../lib/templates/*.php ../lib/utils/*.php
for dir in $(find ../plugins -type d -depth 1)
do
    PLUGIN=${dir:11}
    mkdir -p "../plugins/$PLUGIN/locale"
    xgettext --default-domain="plugin-$PLUGIN" -o "../plugins/$PLUGIN/locale/messages.pot" --from-code=UTF-8 -n --omit-header -L PHP `echo ../plugins/$PLUGIN/*.php`
done
