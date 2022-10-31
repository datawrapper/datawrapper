// We have to use `const ... = require` syntax here because there are no type definitions for this package
// eslint-disable-next-line @typescript-eslint/no-var-requires
const browserEnv = require('browser-env');
import raf from 'raf';

browserEnv();
global.requestAnimationFrame = raf;
