# Automated testing

This project uses [AVA](https://github.com/avajs/ava) and [browser-env](https://github.com/lukechilds/browser-env) for client-side unit testing. Use `npm test` to run all tests.

## Running test during development

To run tests during development, you can use `npm run test:watch`, or AVA directly. Using `ava --watch` (or `-w`) will run tests in [watch mode](https://github.com/avajs/ava/blob/master/docs/recipes/watch-mode.md). For more info on running tests, see the [AVA CLI documentation](https://github.com/avajs/ava/blob/master/docs/05-command-line.md).

```
# Run and watch test with verbose output:
npm run test:watch # (equivalent to running ava --watch --verbose)

# You can also run specific test files individually:
npx ava -w ./src/example/ExampleComponent.test.js

# or use patterns:
npx ava -w ./src/example/*
```
The main reason the `test:watch` mode exists is to make it easier to write tests. Instead of having to manually re-run `npm test` again and again, you can just watch the tests passing or failing in the background.

## Adding new tests

To add new tests, simply add a file with the test code right next to the file that contains the code you want to test, using the following naming scheme:

```
example
  ├── exampleUtility.js
  ├── exampleUtility.test.js
  ├── ExampleComponent.html
  └── ExampleComponent.test.js

```

To declare a test you use the `test` function you imported from AVA and provide a title and implementation function. The function will be called when your test is run.

```
import test from 'ava';

test('my passing test', t => {
	t.pass();
});
```

AVA has support for testing callbacks, async functions, promises, observables and many more. For examples on how to write tests, see the example folder and the [AVA documentation](https://github.com/avajs/ava/blob/master/docs/01-writing-tests.md).
