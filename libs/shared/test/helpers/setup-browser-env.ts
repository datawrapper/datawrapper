import { JSDOM } from 'jsdom';

const window = new JSDOM('', { pretendToBeVisual: true, url: 'http://localhost' }).window;

global.window = window as unknown as Window & typeof globalThis;

global.document = window.document;
