
GENERATED_FILES = \
	www/static/css/datawrapper.css

.PHONY: plugins

all: $(GENERATED_FILES)

clean:
	rm -f -- $(GENERATED_FILES)

assets: www/static/css/datawrapper.css www/static/css/chart.base.css

sync-db:
	@php scripts/sync-db.php

www/static/css/datawrapper.css: assets/styles/datawrapper/* assets/styles/datawrapper/**/* assets/styles/datawrapper/**/**/*
	node_modules/.bin/lessc assets/styles/datawrapper/main.less > $@

build: svelte-all

svelte-all:
	cd src && npm run build

svelte-dev:
	cd src && npm run dev

plugins:
	scripts/install-plugins

propel:
	cd lib/core && ../../vendor/propel/propel1/generator/bin/propel-gen om
	cd lib/core && ../../vendor/propel/propel1/generator/bin/propel-gen sql
	composer dump-autoload
