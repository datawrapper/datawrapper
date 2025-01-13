import keywordsByEmoji from './assets/keywordsByEmojiJSON.js';
import dataByEmoji from './assets/dataByEmojiJSON.js';
import * as nodeEmoji from 'node-emoji';
import type { SkinToneType } from 'skin-tone';
import skinTone from 'skin-tone';
import uFuzzy from '@leeoniya/ufuzzy';
import { trim, uniqBy } from 'lodash-es';

/**
 * EmojiJSON contains all emojis with info such as category, we take only the ones that are supported by node-emoji
 * and populate them with keywords from emojilib for searchability.
 */
let supportedEmojis: EmojiData[] = [];

function setupSupportedEmojis(): EmojiData[] {
    return Object.entries(dataByEmoji)
        .filter(([emoji, _value]) => nodeEmoji.has(emoji))
        .map(([emoji, value]) => ({
            ...value,
            emoji: emoji as Emoji,
            // We can safely use non-null assertion here because we only include emojis that are supported by node-emoji in the filter above.
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            nodeEmojiName: nodeEmoji.find(emoji)!.key,
            keywords: keywordsByEmoji[emoji as Emoji] as string[],
        }));
}

const fuzzySearch = new uFuzzy({
    // Set operational mode to "Single Error".
    // See https://github.com/leeoniya/uFuzzy#how-it-works for details.
    intraMode: 1,
});

function setupSearch() {
    const haystack: string[] = [];
    const lookup: Record<number, EmojiData> = {};

    // Create an entry for each keyword of each emoji.
    // This leads to better results because matches of an entire keyword are ranked higher than matches of a substring.
    // Note that we need a separate lookup object because the search result only contains the index of the haystack.
    for (const emoji of supportedEmojis) {
        for (const keyword of emoji.keywords) {
            haystack.push(keyword);
            lookup[haystack.length - 1] = emoji;
        }
    }

    const query = (query: string): EmojiData[] => {
        const [, info, orderedIndexes] = fuzzySearch.search(haystack, query);
        return uniqBy(orderedIndexes?.map(index => lookup[info.idx[index]]) || [], 'slug');
    };

    return { query };
}

let search: ReturnType<typeof setupSearch> | undefined;

export function useEmojis() {
    // Lazy initialization of the supported emojis.
    if (!supportedEmojis.length) {
        supportedEmojis = setupSupportedEmojis();
    }

    /**
     * Get an emoji by its string representation.
     * @param emoji The string representation of the emoji.
     *
     * @example
     * getDataByEmojiString('👋') // { name: 'waving hand', ... }
     *
     * @returns The emoji or undefined if it doesn't exist.
     */
    function getDataByEmojiString(emoji: string): EmojiData | undefined {
        return supportedEmojis.find(e => e.emoji === emoji);
    }

    return {
        /**
         * All available emojis. This list is filtered to only include emojis that are supported by node-emoji.
         */
        supportedEmojis,

        skinTones: [
            'none',
            'white',
            'creamWhite',
            'lightBrown',
            'brown',
            'darkBrown',
        ] as SkinToneType[],

        /**
         * Get an emoji by its node-emoji name.
         * @param nodeEmojiName The name of the emoji as used by node-emoji. Can include wrapping colons.
         *
         * @example
         * getDataByNodeEmojiName(':wave:') // { name: 'waving hand', ... }
         * getDataByNodeEmojiName('wave') // { name: 'waving hand', ... }
         *
         * @returns The emoji with the given name or undefined if it doesn't exist.
         */
        getDataByNodeEmojiName: (nodeEmojiName: string): EmojiData | undefined => {
            const cleanedName = trim(nodeEmojiName, ':');
            return supportedEmojis.find(emoji => emoji.nodeEmojiName === cleanedName);
        },

        /**
         * Get the specific emoji with the given skin tone.
         *
         * @param emoji When a string is passed, it has to be the actual unicode emoji, not the name.
         * @param tone The skin tone to apply.
         *
         * @returns The unicode emoji with the skin tone applied.
         */

        getEmojiWithSkinTone: (
            emoji: string | EmojiData | undefined,
            tone: SkinToneType
        ): string => {
            const emojiData = typeof emoji === 'string' ? getDataByEmojiString(emoji) : emoji;
            if (!emojiData) return '';
            if (!emojiData.skin_tone_support) {
                // If the emoji doesn't support skin tones, return the emoji without a skin tone modifier.
                tone = 'none';
            }
            return skinTone(emojiData.emoji, tone);
        },

        /**
         * Search for emojis based on a query.
         */
        search: (query: string): EmojiData[] => {
            // Lazy initialization of the search index.
            if (!search) {
                search = setupSearch();
            }

            return search.query(query.toLowerCase());
        },
    };
}
/**
 * Note that the emojis contain additional fields but we don't care about them.
 */
export type EmojiData = {
    /**
     * Readable name of the emoji.
     * @example "waving hand"
     */
    name: string;

    /**
     * Name of the emoji as used by node-emoji.
     * This is the value that is/should be stored for reactions.
     */
    nodeEmojiName: EmojiName;

    /**
     * Slugified name of the emoji (underscored).
     * @example "waving_hand"
     */
    slug: string;

    /**
     * Group of the emoji.
     * @example "People & Body"
     */
    group: string;

    /**
     * The emoji itself.
     * @example "👋"
     */
    emoji: Emoji;

    /**
     * Keywords that can be used to search for the emoji.
     * Includes the emoji slug.
     * @example ['waving_hand', 'wave', 'hands', 'gesture', ...]
     */
    keywords: string[];

    /**
     * Whether the emoji supports skin tone modifiers.
     */
    skin_tone_support: boolean;
};

declare const emojiBrand: unique symbol;
/**
 * The unicode representation of an emoji.
 * @example "👋"
 */
export type Emoji = string & { [emojiBrand]: void };

/**
 * The name of an emoji as used by node-emoji.
 * @example ":wave:"
 */
export type EmojiName = string;

export type EmojiSkinTone = SkinToneType;
