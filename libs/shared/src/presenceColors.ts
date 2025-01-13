export const presenceColors = [
    'color-dw-presence-10',
    'color-dw-presence-20',
    'color-dw-presence-30',
    'color-dw-presence-40',
    'color-dw-presence-50',
    'color-dw-presence-60',
    'color-dw-presence-70',
    'color-dw-presence-80',
    'color-dw-presence-90',
    'color-dw-presence-100',
    'color-dw-presence-110',
    'color-dw-presence-120',
] as const;

export function getRandomPresenceColor() {
    return presenceColors[Math.floor(Math.random() * presenceColors.length)];
}
