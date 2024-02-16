import type { Action } from 'svelte/action';
import { Writable } from 'svelte/store';

export type CollaborationUser = {
    id: string;
    name: string;
    showPresence: boolean;
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
    showEvent?: string | null;
    hideEvent?: string | null;
} & (
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
 *
 * @param options.room - the collaboration room to use for communication.
 *
 * @param options.path - path to the control, used to identify the anchor point.
 *
 * @param options.showEvent - event to listen for to show pin, defaults to `'focusin'`. use `null` to skip evenlistener.
 *
 * @param options.hideEvent - event to listen for to hide pin, defaults to `'focusout'`. use `null` to skip evenlistener.
 *
 * @param options.offset - offset from the anchor point, defaults to `{ x: 0, y: 0 }`.
 *
 * @param options.class - class or classes to add to the element when focused, `--user-color`
 *  css variable will be set on the element to the user's color in `FloatingUserAvatars.svelte`.
 *
 * @param options.registerElement - defaults to `true`. If `false`, the element will not be registered as an anchor point,
 *  allowing the use of a shared path for multiple elements.
 */
export const presenceNotifier = ((element: HTMLElement | SVGElement, options: Options) => {
    let {
        room,
        path,
        offset,
        class: className = '',
        registerElement = true,
        showEvent = 'focusin',
        hideEvent = 'focusout'
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
        if (path && registerElement) $room.pinAnchors.set(path, { element, offset, classList });
        return $room;
    });

    const handleFocusIn = () => {
        if (path) room.sendPresenceMessage(path, true);
    };
    const handleFocusOut = () => {
        if (path) room.sendPresenceMessage(path, false);
    };
    if (showEvent) element.addEventListener(showEvent, handleFocusIn);
    if (hideEvent) element.addEventListener(hideEvent, handleFocusOut);

    return {
        update(options: Options) {
            // make options reactive
            const oldPath = path;
            const oldRegisterElement = registerElement;
            const oldShowEvent = showEvent;
            const oldHideEvent = hideEvent;
            ({
                room,
                path,
                offset,
                class: className = '',
                registerElement = true,
                showEvent = 'focusin',
                hideEvent = 'focusout'
            } = options);
            classList = className.split(' ').filter(Boolean);

            if (oldShowEvent !== showEvent) {
                if (oldShowEvent) element.removeEventListener(oldShowEvent, handleFocusIn);
                if (showEvent) element.addEventListener(showEvent, handleFocusIn);
            }
            if (oldHideEvent !== hideEvent) {
                if (oldHideEvent) element.removeEventListener(oldHideEvent, handleFocusOut);
                if (hideEvent) element.addEventListener(hideEvent, handleFocusOut);
            }

            // re-register anchor
            room.update($room => {
                if (oldPath && !oldRegisterElement) {
                    $room.pinAnchors.delete(oldPath);
                }
                if (path && registerElement) {
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
                if (path && registerElement) $room.pinAnchors.delete(path);
                return $room;
            });

            if (showEvent) element.removeEventListener(showEvent, handleFocusIn);
            if (hideEvent) element.removeEventListener(hideEvent, handleFocusOut);
        }
    };
}) satisfies Action<HTMLElement | SVGElement, Options>;
