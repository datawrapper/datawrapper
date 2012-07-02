#!/bin/sh
php ../scripts/gen_template_cache.php
xgettext --default-domain=messages -o messages.pot --from-code=UTF-8 -n --omit-header -L PHP ../scripts/cache/??/??/*.php
