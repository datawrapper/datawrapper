import Guest from './Guest.html';
import { Store } from 'svelte/store.js';
const store = new Store({});
export default { App: Guest, store };
