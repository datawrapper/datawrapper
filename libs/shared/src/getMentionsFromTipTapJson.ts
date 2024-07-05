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
