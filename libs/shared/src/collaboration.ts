export const CHART_EDITOR_WRITABLE_KEYS = [
    'title',
    'theme',
    'type',
    'metadata',
    'language',
    'externalData',
    'lastEditStep',
    'publicId',
    'publicVersion',
    'publishedAt',
    'publicUrl',
];

export const EVENTS = {
    CHART_UPDATES: 'chart.updates',
    CHART_DATA_UPDATES: 'chart.data.updates',
    CHART_EVENT: 'chart.event',
    // The publish state is emitted by the client that triggered the publish.
    // So this is a client event and needs to be prefixed by `client-`.
    // See Pusher docs: https://pusher.com/docs/channels/using_channels/events/#triggering-client-events
    CHART_PUBLISH_STATE: 'client-chart.publish.state',
} as const;

export const SOCKET_ID_HEADER = 'x-socket-id';
