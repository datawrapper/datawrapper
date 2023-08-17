/**
 * Notice that '_' and '-' are among the charecters a chart id is allowed to contain. We don't
 * generate chart ids with these special characters anymore, but we used to, so we must keep
 * supporting such charts.
 */
export const CHART_ID_ALLOWED_CHARS =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';

function escapeRegExpChars(chars: string): string {
    return chars.replace(/-/g, '\\-');
}

export const CHART_ID_PATTERN = `[${escapeRegExpChars(CHART_ID_ALLOWED_CHARS)}]{5}`;

export const CHART_ID_REGEXP = new RegExp(`^${CHART_ID_PATTERN}$`);
