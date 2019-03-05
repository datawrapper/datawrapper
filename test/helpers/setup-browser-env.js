// Setup browser-env for use with AVA
// https://github.com/avajs/ava/blob/master/docs/recipes/browser-testing.md

require('browser-env')(['window', 'document', 'navigator'], { runScripts: 'dangerously' });
