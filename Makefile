
GENERATED_FILES = \
	dw.js/dw-2.0.js \
	www/static/css/datawrapper.css

.PHONY: plugins

all: $(GENERATED_FILES)

clean:
	rm -f -- $(GENERATED_FILES)

dw.js/dw-2.0.js: dw.js/src/*.js
	cd dw.js && grunt

assets: www/static/css/datawrapper.css www/static/css/chart.base.css

# www/static/js/dw-2.0.js: dw.js/dw-2.0.js
# 	@cp dw.js/dw-2.0.js www/static/js/

# www/static/js/dw-2.0.min.js: dw.js/dw-2.0.js
# 	@php -r "require 'vendor/autoload.php'; file_put_contents('www/static/js/dw-2.0.min.js', \JShrink\Minifier::minify(file_get_contents('dw.js/dw-2.0.js')));"

translations:
	scripts/update-translations

www/static/css/datawrapper.css: assets/styles/datawrapper/* assets/styles/datawrapper/**/* assets/styles/datawrapper/**/**/*
	node_modules/.bin/lessc assets/styles/datawrapper/main.less > $@

svelte:
	cd src && rollup -c

svelte-dev:
	cd src && rollup -cw

plugins:
	scripts/install-plugins
