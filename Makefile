
all: dw.js/dw-2.0.js

messages:
	scripts/update-messages.sh

dw.js/dw-2.0.js: dw.js/src/*.js
	dw.js/make