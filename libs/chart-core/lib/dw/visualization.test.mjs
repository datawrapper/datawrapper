import test from 'ava';
import visualization from './visualization.mjs';
import '../../tests/helpers/setup-browser-env.mjs';

test.beforeEach(t => {
    t.context.id = `vis-${Math.floor(Math.random() * 1000).toString(36)}`;
});

test('register and instanciate a visualization', t => {
    visualization.register(t.context.id, {
        foo() {
            return 42;
        }
    });
    t.is(visualization.has(t.context.id), true);
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    t.is(vis.id, t.context.id);
    t.is(typeof vis.render, 'function');
    t.is(typeof vis.foo, 'function');
    t.is(vis.foo(), 42);
});

test('extend a visualization', t => {
    visualization.register('parent', {
        bar() {
            return 42;
        },
        foo() {
            return 100;
        }
    });
    visualization.register(t.context.id, 'parent', {
        foo() {
            return 10;
        }
    });
    t.is(visualization.has(t.context.id), true);
    t.is(visualization.has('parent'), true);
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    t.is(typeof vis.bar, 'function');
    t.is(typeof vis.foo, 'function');
    t.is(vis.bar(), 42);
    t.is(vis.foo(), 10);
});

test('visualization renders into container', t => {
    visualization.register(t.context.id, {
        render(el) {
            el.innerHTML = 'It <b>worked</b>';
            this.renderingComplete();
        }
    });
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    vis.__beforeRender();
    vis.render(element);
    t.is(element.innerHTML, 'It <b>worked</b>');
});

test('visualization rendered returns promise', async t => {
    visualization.register(t.context.id, {
        render(el) {
            this.__beforeRender();
            setTimeout(() => {
                el.innerHTML = 'It <b>worked</b>';
                this.renderingComplete();
            }, 100);
        }
    });
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    vis.render(element);
    t.is(element.innerHTML, '');
    await vis.rendered();
    t.is(element.innerHTML, 'It <b>worked</b>');
    t.is(vis.__rendered, true);
});

test('promise gets resolved even after re-rendering', async t => {
    visualization.register(t.context.id, {
        render(el) {
            this.__beforeRender();
            setTimeout(() => {
                el.innerHTML = 'It <b>worked</b>';
                this.renderingComplete();
            }, 100);
        }
    });
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    vis.render(element);
    const promise1 = vis.rendered();
    vis.render(element);
    t.is(element.innerHTML, '');
    await promise1;
    t.is(element.innerHTML, 'It <b>worked</b>');
    t.is(vis.__rendered, true);
});

test('visualization rendered multiple times', async t => {
    let cnt = 0;
    visualization.register(t.context.id, {
        render(el) {
            this.__beforeRender();
            setTimeout(() => {
                el.innerHTML = `rendered ${++cnt} times`;
                this.renderingComplete();
            }, 100);
        }
    });
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    const t0 = new Date().getTime();
    setTimeout(() => vis.render(element), 0); // finised in 100ms
    setTimeout(() => vis.render(element), 50); // finished in 150ms
    setTimeout(() => vis.render(element), 100); // finished in 200ms
    setTimeout(() => vis.render(element), 350); // finished in 450ms
    t.is(element.innerHTML, '');
    await vis.rendered();
    const diff = new Date().getTime() - t0;
    t.true(diff >= 750); // 450 + 300
    t.true(diff < 800);
    t.is(element.innerHTML, 'rendered 4 times');
    t.is(vis.__rendered, true);
});

test('visualization can set custom resolve timeout', async t => {
    let cnt = 0;
    visualization.register(t.context.id, {
        __resolveRenderedAfter: 150,
        render(el) {
            this.__beforeRender();
            setTimeout(() => {
                el.innerHTML = `rendered ${++cnt} times`;
                this.renderingComplete();
            }, 100);
        }
    });
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    const t0 = new Date().getTime();
    setTimeout(() => vis.render(element), 0); // finised in 100ms
    setTimeout(() => vis.render(element), 50); // finished in 150ms
    setTimeout(() => vis.render(element), 100); // finished in 200ms
    setTimeout(() => vis.render(element), 350); // finished in 450ms
    t.is(element.innerHTML, '');
    t.is(element.innerHTML, '');
    await vis.rendered();
    const diff = new Date().getTime() - t0;
    t.true(diff > 350); // 200+150
    t.true(diff < 400);
    t.is(element.innerHTML, 'rendered 3 times');
    t.is(vis.__rendered, true);
});

test('visualization renderred promise is rejected after timeout', async t => {
    let cnt = 0;
    visualization.register(t.context.id, {
        __resolveRenderedAfter: 50,
        __rejectRenderedAfter: 250,
        render(el) {
            this.__beforeRender();
            setTimeout(() => {
                el.innerHTML = `rendered ${++cnt} times`;
                this.renderingComplete();
            }, 500);
        }
    });
    const element = document.createElement('div');
    const vis = visualization(t.context.id, element);
    vis.render(element);
    await t.throwsAsync(async () => await vis.rendered(), { message: 'timeout after 250ms' });
    t.is(element.innerHTML, '');
    t.is(vis.__rendered, false);
});
