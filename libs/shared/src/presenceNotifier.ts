import type { Action } from 'svelte/action';
import { Writable } from 'svelte/store';

export type CollaborationRoom = Writable<{
    pinAnchors: Map<string, { element: HTMLElement; offset?: { x: number; y: number } }>;
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
export const presenceNotifier = ((element: HTMLElement, options: Options) => {
    let { room, path, offset } = options;

    if (!room) {
        // without a collaboration room we do nothing
        return {};
    }

    if (!path || !path?.trim()) {
        console.warn('[presenceNotifier] invalid control path: ' + path, element);
        return {};
    }

    function registerAnchor() {
        room.update($room => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $room.pinAnchors.set(path!, { element, offset });
            return $room;
        });
    }
    registerAnchor();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const handleFocusIn = () => room.sendPresenceMessage(path!, true);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const handleFocusOut = () => room.sendPresenceMessage(path!, false);
    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);

    return {
        update(options: Options) {
            // make options reactive
            ({ room, path, offset } = options);
            registerAnchor();
        },
        destroy() {
            // send blur, to remove pin for others
            handleFocusOut();

            // unregister anchor
            room.update($room => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $room.pinAnchors.delete(path!);
                return $room;
            });

            element.removeEventListener('focusin', handleFocusIn);
            element.removeEventListener('focusout', handleFocusOut);
        }
    };
}) satisfies Action<HTMLElement, Options>;
