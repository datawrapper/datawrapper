import debounce from 'lodash/debounce.js';
import type { Action } from 'svelte/action';
import type { Writable } from 'svelte/store';

/**
 * Debug presence paths.
 * Will add a `data-path` attribute containing the path to all elements that use the action.
 */
const DEBUG_PATHS = false;

const PIN_HIDE_TIMEOUT = 6000;

export type CollaborationUser = {
    id: string;
    name: string;
    showPresence?: boolean;
    color?: string;
    path?: string | null;
    selectedPaths?: string[];
    step?: string;
    tab?: string;
    img?: string;
};

type PinAnchor = {
    element: HTMLElement | SVGElement;
    offset?: { x: number; y: number };
    classList: string[];
};

export type CollaborationRoom = Writable<{
    pinAnchors: Map<string, PinAnchor>;
    users: CollaborationUser[];
    disconnected: boolean;
}> & {
    /** Used to send focus and blur messages to other users in the same collaboration room. */
    sendPresenceMessage: (path: string, isFocus?: boolean) => void;

    /** Used to send selection changed messages to other users in the same collaboration room. */
    sendSelectionChangedMessage: (paths: string[]) => void;

    publishUserState: () => void;
    reconnect: () => void;
    disconnect: () => void;
};

type Options = {
    room: CollaborationRoom;
    path: string | null;
} & (
    | {
          showEvent?: string | null;
          hideEvent?: string | null;
          show?: never;
      }
    | {
          show: boolean;
          showEvent?: never;
          hideEvent?: never;
      }
) &
    (
        | {
              registerElement?: false;
              offset?: { x: number; y: number };
              class?: string;
          }
        | {
              registerElement: true;
              offset?: never;
              class?: never;
          }
    );

/**
 *  Svelte Action enabling the control level presence indicator placement.
 *
 *  Handles the registering of anchor points and commuinicating
 *  when users are focusing and bluring inputs over web sockets.
 * ---
 * @param options.room - the collaboration room to use for communication.
 * ---
 * @param options.path - path to the control, used to identify the anchor point.
 * ---
 * @param options.showEvent - event to listen for to show pin. use `null` to skip eventlistener.
 * @default 'focusin'
 * ---
 * @param options.hideEvent - event to listen for to hide pin. use `null` to skip eventlistener,
 *                            and to automatically hide the pin again after the showEvent after delay.
 * @default 'focusout'
 * ---
 * @param options.show - if set, overrides the event handlers and sets the pin visibility.
 * @default undefined
 * ---
 * @param options.registerElement - If `false`, the element will not be registered as an anchor point,
 *  allowing the use of a shared path for multiple elements.
 * @default true
 * ---
 * @param options.offset - offset from the anchor point.
 * @default { x: 0, y: 0 }
 * ---
 * @param options.class - class or classes to add to the element when focused, `--user-color`
 *  css variable will be set on the element to the user's color in `FloatingUserAvatars.svelte`.
 * @default ''
 */
export const presenceNotifier = ((element: HTMLElement | SVGElement, options: Options) => {
    let {
        room,
        path,
        show,
        showEvent = 'focusin',
        hideEvent = 'focusout',
        registerElement = true,
        offset,
        class: className = ''
    } = options;
    let classList = className.split(' ').filter(Boolean);

    if (!room || path === null) {
        // without a collaboration room, or with a null path, we do nothing
        return {};
    }

    if (!path?.trim() || path.trim().startsWith('.')) {
        console.warn('[presenceNotifier] invalid control path: ' + path, element);
        return {};
    }

    if (DEBUG_PATHS) {
        element.dataset.path = path;
    }

    room.update($room => {
        if (path && registerElement) $room.pinAnchors.set(path, { element, offset, classList });
        return $room;
    });

    const handleFocusIn = () => {
        if (path) room.sendPresenceMessage(path, true);
        if (!hideEvent) handleFocusOut();
    };

    const hidePin = () => {
        if (path) room.sendPresenceMessage(path, false);
    };

    const handleFocusOut = debounce(hidePin, PIN_HIDE_TIMEOUT);

    // if show is undefined, the pin will be shown/hidden based on the showEvent/hideEvent
    // if show is a boolean, the pin will be shown/hidden based on the value of show
    if (typeof show === 'undefined') {
        if (showEvent) element.addEventListener(showEvent, handleFocusIn);
        if (hideEvent) element.addEventListener(hideEvent, handleFocusOut);
    } else if (show) {
        handleFocusIn();
    }

    return {
        update(options: Options) {
            // make options reactive
            const oldPath = path;
            const oldRegisterElement = registerElement;
            const oldShowEvent = showEvent;
            const oldHideEvent = hideEvent;
            const oldShow = show;

            ({
                room,
                path,
                show,
                showEvent = 'focusin',
                hideEvent = 'focusout',
                offset,
                class: className = '',
                registerElement = true
            } = options);
            classList = className.split(' ').filter(Boolean);

            if (typeof show === 'boolean' && oldShow !== show) {
                if (show) {
                    handleFocusIn();
                } else {
                    handleFocusOut();
                }
            }

            if (oldShowEvent !== showEvent || typeof oldShow !== typeof show) {
                if (typeof oldShow === 'undefined' && oldShowEvent) {
                    element.removeEventListener(oldShowEvent, handleFocusIn);
                }
                if (typeof show === 'undefined' && showEvent) {
                    element.addEventListener(showEvent, handleFocusIn);
                }
            }
            if (oldHideEvent !== hideEvent || typeof oldShow !== typeof show) {
                if (typeof oldShow === 'undefined' && oldHideEvent) {
                    element.removeEventListener(oldHideEvent, handleFocusOut);
                }
                if (typeof show === 'undefined' && hideEvent) {
                    element.addEventListener(hideEvent, handleFocusOut);
                }
            }

            // re-register anchor
            room.update($room => {
                if (oldPath && oldRegisterElement && oldPath !== path) {
                    $room.pinAnchors.delete(oldPath);
                }
                if (path && registerElement) {
                    $room.pinAnchors.set(path, { element, offset, classList });
                }

                if (DEBUG_PATHS) {
                    element.dataset.path = path ?? '';
                }

                return $room;
            });
        },
        destroy() {
            // send blur, to remove pin for others
            handleFocusOut();

            // unregister anchor
            room.update($room => {
                if (path && registerElement) $room.pinAnchors.delete(path);
                return $room;
            });

            if (typeof show === 'undefined') {
                if (showEvent) element.removeEventListener(showEvent, handleFocusIn);
                if (hideEvent) element.removeEventListener(hideEvent, handleFocusOut);
            }
        }
    };
}) satisfies Action<HTMLElement | SVGElement, Options>;
