import type { Action } from 'svelte/action';
import { Writable } from 'svelte/store';

export type CollaborationUser = {
    id: string;
    name: string;
    showPresence?: boolean;
    color?: string;
    path?: string | null;
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
};

type Options = {
    room: CollaborationRoom;
    path: string | null;
    offset?: { x: number; y: number };
    class?: string;
} & (
    | {
          showEvent?: string;
          hideEvent?: string;
          show?: never;
      }
    | {
          show: boolean;
          showEvent?: never;
          hideEvent?: never;
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
 * @param options.hideEvent - event to listen for to hide pin. use `null` to skip eventlistener.
 * @default 'focusout'
 * ---
 * @param options.show - if set, overrides the event handlers and sets the pin visibility.
 * @default undefined
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
        offset,
        class: className = '',
        showEvent = 'focusin',
        hideEvent = 'focusout',
        show
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

    room.update($room => {
        if (path) $room.pinAnchors.set(path, { element, offset, classList });
        return $room;
    });

    const handleFocusIn = () => {
        if (path) room.sendPresenceMessage(path, true);
    };
    const handleFocusOut = () => {
        if (path) room.sendPresenceMessage(path, false);
    };

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
            const oldShowEvent = showEvent;
            const oldHideEvent = hideEvent;
            const oldShow = show;

            ({
                room,
                path,
                offset,
                class: className = '',
                showEvent = 'focusin',
                hideEvent = 'focusout',
                show
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
                if (typeof oldShow === 'undefined') {
                    element.removeEventListener(oldShowEvent, handleFocusIn);
                }
                if (typeof show === 'undefined') {
                    element.addEventListener(showEvent, handleFocusIn);
                }
            }
            if (oldHideEvent !== hideEvent || typeof oldShow !== typeof show) {
                if (typeof oldShow === 'undefined') {
                    element.removeEventListener(oldHideEvent, handleFocusOut);
                }
                if (typeof show === 'undefined') {
                    element.addEventListener(hideEvent, handleFocusOut);
                }
            }

            // re-register anchor
            room.update($room => {
                if (oldPath && oldPath !== path) {
                    $room.pinAnchors.delete(oldPath);
                }
                if (path) {
                    $room.pinAnchors.set(path, { element, offset, classList });
                }
                return $room;
            });
        },
        destroy() {
            // send blur, to remove pin for others
            handleFocusOut();

            // unregister anchor
            room.update($room => {
                if (path) $room.pinAnchors.delete(path);
                return $room;
            });

            if (typeof show === 'undefined') {
                if (showEvent) element.removeEventListener(showEvent, handleFocusIn);
                if (hideEvent) element.removeEventListener(hideEvent, handleFocusOut);
            }
        }
    };
}) satisfies Action<HTMLElement | SVGElement, Options>;
