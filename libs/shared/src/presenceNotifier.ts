import type { Action } from 'svelte/action';
import { Writable } from 'svelte/store';

export type CollaborationRoom = Writable<{
    pinAnchors: Map<string, { element: Element; offset?: { x: number; y: number } }>;
}> & {
    /** Used to send focus and blur messages to other users in the same collaboration room. */
    sendPresenceMessage: (path: string, isFocus?: boolean) => void;
};

type Options = { room: CollaborationRoom; path: string | null; offset?: { x: number; y: number } };

/**
 *  Svelte Action enabling the control level presence indicator placement.
 *
 *  Handles the registering of anchor points and commuinicating
 *  when users are focusing and bluring inputs over web sockets.
 */
export const presenceNotifier = ((element: Element, options: Options) => {
    let { room, path, offset } = options;

    if (!room) {
        // without a collaboration room we do nothing
        return {};
    }

    if (!path || !path?.trim()) {
        console.warn('[presenceNotifier] invalid control path: ' + path, element);
        return {};
    }

    room.update($room => {
        if (path) $room.pinAnchors.set(path, { element, offset });
        return $room;
    });

    const handleFocusIn = () => {
        if (path) room.sendPresenceMessage(path, true);
    };
    const handleFocusOut = () => {
        if (path) room.sendPresenceMessage(path, false);
    };
    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);

    return {
        update(options: Options) {
            // make options reactive
            const oldPath = path;
            ({ room, path, offset } = options);

            // re-register anchor
            room.update($room => {
                if (oldPath) $room.pinAnchors.delete(oldPath);
                if (path) $room.pinAnchors.set(path, { element, offset });
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

            element.removeEventListener('focusin', handleFocusIn);
            element.removeEventListener('focusout', handleFocusOut);
        }
    };
}) satisfies Action<Element, Options>;
