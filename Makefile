
GENERATED_FILES = \
	dw.js/dw-2.0.js \
	www/static/js/dw-2.0.js \
	www/static/js/dw-2.0.min.js

all: $(GENERATED_FILES)

clean:
	rm -f -- $(GENERATED_FILES)

dw.js/dw-2.0.js: dw.js/src/*.js
	@dw.js/make

www/static/js/dw-2.0.js: dw.js/dw-2.0.js
	@cp dw.js/dw-2.0.js www/static/js/

www/static/js/dw-2.0.min.js: dw.js/dw-2.0.js
	@php -r "require 'vendor/autoload.php'; file_put_contents('www/static/js/dw-2.0.min.js', \JShrink\Minifier::minify(file_get_contents('dw.js/dw-2.0.js')));"

messages:
	scripts/update-messages.sh
