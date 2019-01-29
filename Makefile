
GENERATED_FILES = \
	dw.js/dw-2.0.js \
	www/static/css/datawrapper.css

.PHONY: plugins

all: $(GENERATED_FILES)

clean:
	rm -f -- $(GENERATED_FILES)

dw.js/dw-2.0.js: dw.js/src/*.js
	cd dw.js && ../node_modules/.bin/grunt

assets: www/static/css/datawrapper.css www/static/css/chart.base.css

# www/static/js/dw-2.0.js: dw.js/dw-2.0.js
# 	@cp dw.js/dw-2.0.js www/static/js/

# www/static/js/dw-2.0.min.js: dw.js/dw-2.0.js
# 	@php -r "require 'vendor/autoload.php'; file_put_contents('www/static/js/dw-2.0.min.js', \JShrink\Minifier::minify(file_get_contents('dw.js/dw-2.0.js')));"

translations:
	scripts/update-translations

www/static/css/datawrapper.css: assets/styles/datawrapper/* assets/styles/datawrapper/**/* assets/styles/datawrapper/**/**/*
	node_modules/.bin/lessc assets/styles/datawrapper/main.less > $@

build: svelte-all

svelte: \
	www/static/js/svelte/account.js \
	www/static/js/svelte/controls.js \
	www/static/js/svelte/controls/hot.js \
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

plugins:
	scripts/install-plugins

propel:
	cd lib/core && ../../vendor/propel/propel1/generator/bin/propel-gen om
	cd lib/core && ../../vendor/propel/propel1/generator/bin/propel-gen sql
	composer dump-autoload


www/static/js/svelte/account.js: src/account/*
	cd src && ROLLUP_TGT_APP=account ../node_modules/.bin/rollup -c

www/static/js/svelte/controls.js: src/controls/* src/editor/*
	cd src && ROLLUP_TGT_APP=controls ../node_modules/.bin/rollup -c

www/static/js/svelte/controls/hot.js: src/controls/hot/*
	cd src && ROLLUP_TGT_APP=controls/hot ../node_modules/.bin/rollup -c

www/static/js/svelte/describe.js: src/describe/*
	cd src && ROLLUP_TGT_APP=describe ../node_modules/.bin/rollup -c

www/static/js/svelte/editor.js: src/editor/*
	cd src && ROLLUP_TGT_APP=editor ../node_modules/.bin/rollup -c

www/static/js/svelte/publish.js: src/publish/*
	cd src && ROLLUP_TGT_APP=publish ../node_modules/.bin/rollup -c

www/static/js/svelte/publish_old.js: src/publish/*
	cd src && ROLLUP_TGT_APP=publish_old ../node_modules/.bin/rollup -c

www/static/js/svelte/publish/sidebar.js: src/publish/sidebar/*
	cd src && ROLLUP_TGT_APP=publish/sidebar ../node_modules/.bin/rollup -c

www/static/js/svelte/upload.js: src/upload/*
	cd src && ROLLUP_TGT_APP=upload ../node_modules/.bin/rollup -c

templates/chart/embed.twig: src/embed/*
	cd src && ROLLUP_TGT_APP=embed ../node_modules/.bin/rollup -c
