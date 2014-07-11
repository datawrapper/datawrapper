
all: dw.js/dw-2.0.js /
	www/static/js/dw-2.0.min.js

messages:
	scripts/update-messages.sh

www/static/js/dw-2.0.min.js: dw.js/dw-2.0.js

dw.js/dw-2.0.js: dw.js/src/*.js
	dw.js/make