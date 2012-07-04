#!/bin/sh
php ../scripts/gen_template_cache.php
xgettext --default-domain=messages -o messages.pot --from-code=UTF-8 -n --omit-header -L PHP ../controller/*.php ../scripts/tmpl_cache/*.php ../www/index.php ../www/api/index.php ../lib/api/*.php ../lib/api/*/*.php ../lib/core/build/classes/datawrapper/*.php ../lib/session/*.php ../lib/templates/*.php ../lib/utils/*.php
