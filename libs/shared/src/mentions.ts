import { JSONContent } from '@tiptap/core';

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
