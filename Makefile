
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

build: svelte-all-v2

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