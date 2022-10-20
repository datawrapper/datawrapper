import browserEnv from 'browser-env';
import raf from 'raf';

browserEnv();
global.requestAnimationFrame = raf;
