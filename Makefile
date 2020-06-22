
GENERATED_FILES = \
	www/static/css/datawrapper.css

.PHONY: plugins

all: $(GENERATED_FILES)

clean:
	rm -f -- $(GENERATED_FILES)

assets: www/static/css/datawrapper.css www/static/css/chart.base.css

sync-db:
	@php scripts/sync-db.php

translations:
	scripts/update-translations

www/static/css/datawrapper.css: assets/styles/datawrapper/* assets/styles/datawrapper/**/* assets/styles/datawrapper/**/**/*
	node_modules/.bin/lessc assets/styles/datawrapper/main.less > $@

build: svelte-all

svelte: \
	www/static/js/svelte/account.js \
	www/static/js/svelte/describe.js \
	www/static/js/svelte/editor.js \
	www/static/js/svelte/publish.js \
	www/static/js/svelte/publish/sidebar.js \
	www/static/js/svelte/publish_old.js \
	www/static/js/svelte/upload.js

svelte-all:
	cd src && ../node_modules/.bin/rollup -c

svelte-dev:
	cd src && ../node_modules/.bin/rollup -cw

svelte-all-v2:
	cd src/v2 && npm run build

svelte-dev-v2:
	cd src/v2 && npm run dev

plugins:
	scripts/install-plugins

propel:
	cd lib/core && ../../vendor/propel/propel1/generator/bin/propel-gen om
	cd lib/core && ../../vendor/propel/propel1/generator/bin/propel-gen sql
	composer dump-autoload

www/static/js/svelte/upload.js: src/upload/*
	cd src && ROLLUP_TGT_APP=upload ../node_modules/.bin/rollup -c
