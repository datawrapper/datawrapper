import test from 'ava';
import sinon from 'sinon';
import { CollaborationRoom, presenceNotifier, Options } from './presenceNotifier';
import { get, writable } from 'svelte/store';

type FakeRoom = CollaborationRoom & {
    sendPresenceMessage: sinon.SinonSpy;
    sendSelectionChangedMessage: sinon.SinonSpy;
    publishUserState: sinon.SinonSpy;
    disconnect: sinon.SinonSpy;
    reconnect: sinon.SinonSpy;
};
function withRoom(testFn: (room: FakeRoom) => Promise<void> | void) {
    const roomStore = writable({ pinAnchors: new Map(), users: [], disconnected: false });
    const room = {
        ...roomStore,
        sendPresenceMessage: sinon.fake(),
        sendSelectionChangedMessage: sinon.fake(),
        publishUserState: sinon.fake(),
        disconnect: sinon.fake(),
        reconnect: sinon.fake()
    };

    return testFn(room);
}

function createFakeAddEventListener(element: FakeElement) {
    return sinon.fake((event: string, handler: CallableFunction) => {
        if (!element.eventListeners.has(event)) {
            element.eventListeners.set(event, new Set());
        }
        element.eventListeners.get(event)?.add(handler);
    });
}
function createFakeRemoveEventListener(element: FakeElement) {
    return sinon.fake((event: string, handler: CallableFunction) => {
        element.eventListeners.get(event)?.delete(handler);
    });
}
function triggerEvent(element: FakeElement, event: string) {
    element.eventListeners.get(event)?.forEach(handler => handler());
}

type FakeElement = (HTMLElement | SVGElement) & {
    addEventListener: sinon.SinonSpy;
    removeEventListener: sinon.SinonSpy;
    eventListeners: Map<string, Set<CallableFunction>>;
    triggerEvent: (event: string) => void;
};
function createFakeElement(): FakeElement {
    const element = document.createElement('div') as unknown as FakeElement;
    document.body.appendChild(element);
    element.eventListeners = new Map();

    sinon.stub(element, 'addEventListener').callsFake(createFakeAddEventListener(element));
    sinon.stub(element, 'removeEventListener').callsFake(createFakeRemoveEventListener(element));
    element.triggerEvent = (event: string) => triggerEvent(element, event);
    sinon.stub(element, 'focus').callsFake(() => element.triggerEvent('focusin'));
    sinon.stub(element, 'blur').callsFake(() => element.triggerEvent('focusout'));

    return element;
}

type FakeNotifier = ReturnType<typeof presenceNotifier>;
async function withPresenceNotifier(
    options: Options,
    testFn: (notifier: FakeNotifier, element: FakeElement) => Promise<void> | void
) {
    const element = createFakeElement();
    const notifier = presenceNotifier(element, options) as FakeNotifier;

    await testFn(notifier, element);

    notifier.destroy?.();
    element.remove();
}

test.afterEach(() => {
    sinon.reset();
});

// room
test('[room = undefined] does nothing', async t => {
    await withRoom(async room => {
        await withPresenceNotifier({ room: undefined, path: 'path' }, (notifier, element) => {
            t.deepEqual(notifier, {});
            t.true(element.addEventListener.notCalled);
            t.true(room.sendPresenceMessage.notCalled);
        });
    });
});

// path
test('[path = null] does nothing', async t => {
    await withRoom(async room => {
        await withPresenceNotifier({ path: null }, (notifier, element) => {
            t.deepEqual(notifier, {});
            t.true(element.addEventListener.notCalled);
            t.true(room.sendPresenceMessage.notCalled);
            t.is(get(room).pinAnchors.size, 0);
        });
    });
});

test("[path = ''] does nothing", async t => {
    await withRoom(async room => {
        await withPresenceNotifier({ path: '' }, (notifier, element) => {
            t.deepEqual(notifier, {});
            t.true(element.addEventListener.notCalled);
            t.true(room.sendPresenceMessage.notCalled);
            t.is(get(room).pinAnchors.size, 0);
        });
    });
});

test('[path] old path is unregistered when path is updated', async t => {
    const path = 'path';
    const newPath = 'newPath';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room }, (notifier, element) => {
            t.is(get(room).pinAnchors.size, 1);
            t.is(get(room).pinAnchors.get(path)?.element, element);

            notifier.update?.({ room, path: newPath });

            t.is(get(room).pinAnchors.size, 1);
            t.is(get(room).pinAnchors.get(path), undefined);
            t.is(get(room).pinAnchors.get(newPath)?.element, element);
        });
    });
});

// showEvent and hideEvent
test("[showEvent='focusin' hideEvent='focusout'] sends presence message on 'focusin' and 'focusout'", async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room }, (notifier, element) => {
            t.true(element.addEventListener.calledWithMatch('focusin', sinon.match.func));
            t.true(room.sendPresenceMessage.notCalled);

            element.focus();

            t.true(room.sendPresenceMessage.calledWith(path, true));

            element.blur();
            // flush to skip debounce
            notifier.flushDebounce?.();

            t.true(room.sendPresenceMessage.calledWith(path, false));
        });
    });
});

test("[showEvent='focusin' hideEvent=null] sends blur message after delay if hideEvent isn't set", async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room, hideEvent: null }, (notifier, element) => {
            t.true(element.addEventListener.calledWithMatch('focusin', sinon.match.func));
            t.false(element.addEventListener.calledWithMatch('focusout', sinon.match.func));
            t.true(room.sendPresenceMessage.notCalled);

            element.focus();

            t.true(room.sendPresenceMessage.calledWith(path, true));

            // flush to skip debounce
            notifier.flushDebounce?.();

            t.is(room.sendPresenceMessage.callCount, 2);
            t.true(room.sendPresenceMessage.calledWith(path, false));
        });
    });
});

test("[showEvent='click' hideEvent='keypress'] custom event names", async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier(
            { path, room, showEvent: 'click', hideEvent: 'keypress' },
            (notifier, element) => {
                t.true(element.addEventListener.calledWithMatch('click', sinon.match.func));
                t.true(element.addEventListener.calledWithMatch('keypress', sinon.match.func));
                t.true(room.sendPresenceMessage.notCalled);

                // focus should not trigger presence messages
                element.focus();
                t.false(room.sendPresenceMessage.calledWith(path, true));

                element.triggerEvent('click');
                t.true(room.sendPresenceMessage.calledWith(path, true));

                // blur should not trigger presence messages
                element.blur();
                // flush to skip debounce
                notifier.flushDebounce?.();
                t.false(room.sendPresenceMessage.calledWith(path, false));

                element.triggerEvent('keypress');
                // flush to skip debounce
                notifier.flushDebounce?.();
                t.true(room.sendPresenceMessage.calledWith(path, false));
            }
        );
    });
});

test('[showEvent hideEvent] removes old listeners and adds new ones when changing events', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room }, (notifier, element) => {
            t.true(element.addEventListener.calledWithMatch('focusin', sinon.match.func));
            t.true(element.addEventListener.calledWithMatch('focusout', sinon.match.func));

            notifier.update?.({ path, room, showEvent: 'click', hideEvent: 'keypress' });

            t.true(element.removeEventListener.calledWithMatch('focusin', sinon.match.func));
            t.true(element.removeEventListener.calledWithMatch('focusout', sinon.match.func));
            t.true(element.addEventListener.calledWithMatch('click', sinon.match.func));
            t.true(element.addEventListener.calledWithMatch('keypress', sinon.match.func));
        });
    });
});

// show
test("[show] doesn't set listeners if set", async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, show: true, room }, (_, element) => {
            t.true(element.addEventListener.notCalled);
            t.true(room.sendPresenceMessage.calledWith(path, true));
        });
    });
});

test('[show] switching sends presence messages', async t => {
    const path = 'path';

    await withRoom(async room => {
        const options = { path, room };
        await withPresenceNotifier({ ...options, show: false }, notifier => {
            t.true(room.sendPresenceMessage.notCalled);

            notifier.update?.({ ...options, show: true });
            t.true(room.sendPresenceMessage.calledWith(path, true));

            notifier.update?.({ ...options, show: false });
            // flush to skip debounce
            notifier.flushDebounce?.();

            t.true(room.sendPresenceMessage.calledWith(path, false));
        });
    });
});

test('[show] removes event listeners when set', async t => {
    const path = 'path';

    await withRoom(async room => {
        const options = { path, room };
        for (const show of [true, false]) {
            await withPresenceNotifier(options, (notifier, element) => {
                t.true(element.addEventListener.calledWithMatch('focusin', sinon.match.func));
                t.true(element.addEventListener.calledWithMatch('focusout', sinon.match.func));

                notifier.update?.({ ...options, show });

                t.true(element.removeEventListener.calledWithMatch('focusin', sinon.match.func));
                t.true(element.removeEventListener.calledWithMatch('focusout', sinon.match.func));

                // focus and blur should not trigger presence messages when show is set
                room.sendPresenceMessage.resetHistory();
                if (show) {
                    element.blur();
                    // flush to skip debounce
                    notifier.flushDebounce?.();

                    t.false(room.sendPresenceMessage.calledWith(path, false));
                } else {
                    element.focus();

                    t.false(room.sendPresenceMessage.calledWith(path, true));
                }
            });
        }
    });
});

test('[show] sets listeners when unset', async t => {
    const path = 'path';

    await withRoom(async room => {
        const options = { path, room };
        for (const show of [true, false]) {
            await withPresenceNotifier({ ...options, show }, (notifier, element) => {
                t.true(element.addEventListener.notCalled);

                notifier.update?.({ ...options, show: undefined });

                t.true(element.addEventListener.calledWithMatch('focusin', sinon.match.func));
                t.true(element.addEventListener.calledWithMatch('focusout', sinon.match.func));

                // focus and blur should trigger presence messages when show is unset
                element.focus();
                t.true(room.sendPresenceMessage.calledWith(path, true));

                element.blur();
                // flush to skip debounce
                notifier.flushDebounce?.();

                t.true(room.sendPresenceMessage.calledWith(path, false));
            });
        }
    });
});

test("[show=true hideEvent=null] doesn't send blur message after delay if controlled with show and hideEvent isn't set", async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier(
            { path, room, hideEvent: null, show: true } as unknown as Options,
            notifier => {
                t.true(room.sendPresenceMessage.calledWith(path, true));

                // flush to skip debounce
                notifier.flushDebounce?.();

                t.false(room.sendPresenceMessage.calledWith(path, false));
            }
        );
    });
});

// registerElement
test('[registerElement = false] does not register element', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room, registerElement: false }, () => {
            t.is(get(room).pinAnchors.size, 0);
        });
    });
});

test('[registerElement = false] still sends presence messages', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room, registerElement: false }, (notifier, element) => {
            element.focus();
            t.true(room.sendPresenceMessage.calledWith(path, true));

            element.blur();
            // flush to skip debounce
            notifier.flushDebounce?.();

            t.true(room.sendPresenceMessage.calledWith(path, false));
        });
    });
});

test('[registerElement] unregisters when updated to false', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room }, notifier => {
            t.is(get(room).pinAnchors.size, 1);

            notifier.update?.({ path, room, registerElement: false });

            t.is(get(room).pinAnchors.size, 0);
        });
    });
});

test('[registerElement] registers when updated to true', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room, registerElement: false }, notifier => {
            t.is(get(room).pinAnchors.size, 0);

            notifier.update?.({ path, room, registerElement: true });

            t.is(get(room).pinAnchors.size, 1);
        });
    });
});

test('[registerElement] can switch path and registerElement in a single update', async t => {
    const path = 'path';
    const newPath = 'newPath';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room }, notifier => {
            t.is(get(room).pinAnchors.size, 1);

            notifier.update?.({ path: newPath, room, registerElement: false });

            t.is(get(room).pinAnchors.size, 0);
        });
    });
});

test('[registerElement] multiple elements can share one path if only one of them has registerElement set to true', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room, registerElement: false }, async (_, element1) => {
            t.is(get(room).pinAnchors.size, 0);
            await withPresenceNotifier(
                { path, room, registerElement: true },
                (notifier2, element2) => {
                    t.is(get(room).pinAnchors.size, 1);

                    element1.focus();
                    t.true(room.sendPresenceMessage.calledWith(path, true));
                    t.is(room.sendPresenceMessage.callCount, 1);

                    element2.blur();
                    // flush to skip debounce
                    notifier2.flushDebounce?.();

                    t.true(room.sendPresenceMessage.calledWith(path, false));
                    t.is(room.sendPresenceMessage.callCount, 2);
                }
            );
        });
    });
});

// offset class
test('[offset class] registers element and display options', async t => {
    const path = 'path';
    const offset = { x: 1, y: 2 };
    const className = 'is-flex bg-blue';

    await withRoom(async room => {
        await withPresenceNotifier(
            { path, room, offset, class: className },
            (notifier, element) => {
                t.true(notifier.destroy instanceof Function);
                t.true(notifier.update instanceof Function);

                t.is(get(room).pinAnchors.size, 1);
                t.deepEqual(get(room).pinAnchors.get(path), {
                    element,
                    offset,
                    classList: ['is-flex', 'bg-blue']
                });
            }
        );
    });
});

test('[offset class] updates display options', async t => {
    const path = 'path';
    const offset = { x: 1, y: 2 };
    const className = 'is-flex bg-blue';

    await withRoom(async room => {
        await withPresenceNotifier(
            { path, room, offset, class: className },
            (notifier, element) => {
                t.deepEqual(get(room).pinAnchors.get(path), {
                    element,
                    offset,
                    classList: ['is-flex', 'bg-blue']
                });

                const newOffset = { x: 3, y: 4 };
                const newClassName = 'is-flex bg-red';

                notifier.update?.({ path, room, offset: newOffset, class: newClassName });

                t.deepEqual(get(room).pinAnchors.get(path), {
                    element,
                    offset: newOffset,
                    classList: ['is-flex', 'bg-red']
                });
            }
        );
    });
});

// destroy
test('[notifier.destroy()] removes listeners and element from room', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room }, (notifier, element) => {
            notifier.destroy?.();

            t.true(element.removeEventListener.calledWithMatch('focusin', sinon.match.func));
            t.true(element.removeEventListener.calledWithMatch('focusout', sinon.match.func));
            t.is(get(room).pinAnchors.size, 0);
        });
    });
});

test('[notifier.destroy()] sends blur message instantly', async t => {
    const path = 'path';

    await withRoom(async room => {
        await withPresenceNotifier({ path, room }, (notifier, element) => {
            element.focus();
            t.true(room.sendPresenceMessage.calledWith(path, true));

            notifier.destroy?.();
            t.true(room.sendPresenceMessage.calledWith(path, false));
        });
    });
});
