let __notifications = [];

function notify(notification) {
    notification.remove = () => {
        __notifications = __notifications.filter(d => d !== notification);
        window.parent.dw.backend.fire('notifications.change', __notifications);
    };
    __notifications.push(notification);
    try {
        window.parent.dw.backend.fire('notifications.change', __notifications);
        return notification.remove;
    } catch (ex) {
        /* not in editor, do nothing */
    }
}
export default notify;
