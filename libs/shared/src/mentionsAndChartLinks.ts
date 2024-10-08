import { JSONContent } from '@tiptap/core';
import { CHART_ID_REGEXP } from './chartConstants.js';

export function getMentionsFromTipTapJson(node: JSONContent, mentions = new Set<string>()) {
    if (node.type === 'mention' && node.attrs?.id) {
        mentions.add(node.attrs.id);
        return mentions;
    }
    for (const children of node.content || []) {
        getMentionsFromTipTapJson(children, mentions);
    }
    return mentions;
}

/**
 *  Given a mention string of a user mention, return the user id.
 */
export function getUserIdFromMention(mention: string): number {
    const mentionStringParts = mention.split(':');
    if (!mentionStringParts[0] || mentionStringParts[0] !== 'user') {
        throw new Error(
            `Invalid user mention format: ${mention}. Mention must start with "user:".`
        );
    }
    if (!mentionStringParts[1]) {
        throw new Error(`Invalid user mention format: ${mention}. No user id found in mention.`);
    }
    const mentionId = Number(mentionStringParts[1]);
    if (isNaN(mentionId)) {
        throw new Error(
            `Invalid user mention format: ${mention}. User id is not a number in mention.`
        );
    }
    return mentionId;
}

export function getChartLinksFromTipTapJson(node: JSONContent, links = new Set<string>()) {
    if (node.type === 'chart' && node.attrs?.id) {
        links.add(node.attrs.id);
        return links;
    }
    for (const children of node.content || []) {
        getChartLinksFromTipTapJson(children, links);
    }
    return links;
}

/**
 *  Given a mention string of a user mention, return the user id.
 */
export function getChartIdFromLink(link: string): string {
    const mentionStringParts = link.split(':');
    if (!mentionStringParts[0] || mentionStringParts[0] !== 'chart') {
        throw new Error(`Invalid chart link format: ${link}. Link must start with "chart:".`);
    }
    if (!mentionStringParts[1]) {
        throw new Error(`Invalid chart link format: ${link}. No chart id found in link.`);
    }
    const chartId = mentionStringParts[1];
    const chartIdIsValid = CHART_ID_REGEXP.test(chartId);
    if (!chartIdIsValid) {
        throw new Error(`Invalid chart link format: ${link}. Chart id isn't valid.`);
    }
    return chartId;
}
