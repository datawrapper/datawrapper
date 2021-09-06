## Rules for contributing

In order to avoid this collection of shared methods to become an absolute mess, you need to follow the contributing
guide if you want to change or add code to this repository. 

### Everything should be a pull request

Please do not push any changes directly to the `master` branch (unless it's a very urgent bug fix). Instead
make your changes in a `branch` and create a pull requests and request a review. The PR reviewer will then
help you with the code change and check that it passes the guidelines outlined in this document.

### Document exported functions

Every exported function and class must be documented using [valid JSdoc syntax](https://jsdoc.app/) or
else nobody will know what this function does, and how it can be used. Please also explain all the
function parameters and the returned values, and if possible, also provide at least one usage example.
To see what this looks like, check out the existing functions in this repo, like 
[this one](https://github.com/datawrapper/shared/blob/master/arrayToObject.js#L1-L27). The
[API reference in the readme](https://github.com/datawrapper/shared/blob/master/README.md#api-reference)
is **generated automatically** from the documentation.

### Write tests for every function

Every function that is exported here should be tested to ensure it is working as expected. Just
create a `myFunction.test.js` and write a couple of tests by passing valid (or invalid) input
to the function and checking that it returns the expected values (or throws an exception). For 
reference, just look at the existing tests (like [this one](https://github.com/datawrapper/shared/blob/master/columnNameToVariable.test.js)).


### Use proper semantic versioning

This repository uses semantic versioning. If you add a function/class to it, you need to
increase the **minor** version using `npm version minor`. If you fix something in an existing
function/class, you need to increase the **patch version** using `npm version patch`.

### Push release tags to Github

When you release a new version you need to **tag the release** and make sure to **push the
tags to Github**. Otherwise the CI won't automatically deploy the new version to npm. Fortunately
if you use `npm version` the release tag is created automatically, you only need to make sure
it's being pushed to Github using `git push --tags`. 

You can also setup your local `git` to automatically push tags to Github. Just add `followTags = true`
to the `[push]` section of your local [~/.gitconfig](https://github.com/sto3psl/dotfiles/blob/master/.gitconfig#L144-L145)
file.

### Write release notes on Github

This repository is being used in many place and by many developers. To know what you're getting
when updating `shared` from one version to another, we need to document the releases. So
after bumping the _minor_ or _patch_ version (using `npm version minor|patch`) and pushing the
release tags to Github you need to write release notes.

To do so go on the [releaes page](https://github.com/datawrapper/shared/releases) in this repo,
click on the tag you want to use and then hit the "Edit tag" button in the upper right. Use
the tag itself as release title (e.g. `v0.9.7`) and write a brief description of the changes
you made (like we did for [v0.8.0](https://github.com/datawrapper/shared/releases/tag/v0.8.0), 
for instance). Then hit "Publish release".

