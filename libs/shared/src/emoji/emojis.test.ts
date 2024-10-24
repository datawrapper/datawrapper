import test from 'ava';
import { useEmojis } from './emojis';
import * as nodeEmoji from 'node-emoji';

test('useEmojis returns the emoji helper', t => {
    const emojis = useEmojis();
    t.deepEqual(Object.keys(emojis), [
        'supportedEmojis',
        'skinTones',
        'getDataByNodeEmojiName',
        'getEmojiWithSkinTone',
        'search'
    ]);
});

test('useEmojis initializes the supported emojis when first used', t => {
    const supportedEmojis = useEmojis().supportedEmojis;
    t.true(Array.isArray(supportedEmojis));
    t.true(supportedEmojis.length > 0);
});

test('useEmojis().supportedEmojis only includes emojis supported by node-emoji', t => {
    const supportedEmojis = useEmojis().supportedEmojis;
    t.is(
        supportedEmojis.filter(emoji => nodeEmoji.has(emoji.emoji)).length,
        supportedEmojis.length
    );
});

test('useEmojis().supportedEmojis include the name used by node-emoji', t => {
    const supportedEmojis = useEmojis().supportedEmojis;
    t.true(
        supportedEmojis.every(
            emoji => emoji.nodeEmojiName && typeof emoji.nodeEmojiName === 'string'
        )
    );
});

test('useEmojis().getDataByNodeEmojiName returns the emoji data for the given node-emoji name with wrapping colons', t => {
    const emoji = useEmojis().getDataByNodeEmojiName(':wave:');
    t.truthy(emoji);
    if (!emoji) return; // checked above
    t.like(emoji, {
        name: 'waving hand',
        slug: 'waving_hand',
        group: 'People & Body',
        skin_tone_support: true,
        emoji: '👋'
    });
});

test('useEmojis().getDataByNodeEmojiName returns the emoji data for the given node-emoji name without wrapping colons', t => {
    const emoji = useEmojis().getDataByNodeEmojiName('wave');
    t.like(emoji, {
        name: 'waving hand',
        slug: 'waving_hand',
        group: 'People & Body',
        skin_tone_support: true,
        emoji: '👋'
    });
});

test('useEmojis().getEmojiWithSkinTone returns the specific emoji with the given skin tone when passed as a string', t => {
    t.is(useEmojis().getEmojiWithSkinTone('👋', 'none'), '👋');
    t.is(useEmojis().getEmojiWithSkinTone('👋', 'white'), '👋🏻');
    t.is(useEmojis().getEmojiWithSkinTone('👋', 'creamWhite'), '👋🏼');
    t.is(useEmojis().getEmojiWithSkinTone('👋', 'lightBrown'), '👋🏽');
    t.is(useEmojis().getEmojiWithSkinTone('👋', 'brown'), '👋🏾');
    t.is(useEmojis().getEmojiWithSkinTone('👋', 'darkBrown'), '👋🏿');
});

test('useEmojis().getEmojiWithSkinTone returns the specific emoji with the given skin tone when passed as an object', t => {
    const emoji = useEmojis().getDataByNodeEmojiName(':wave:');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'none'), '👋');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'white'), '👋🏻');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'creamWhite'), '👋🏼');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'lightBrown'), '👋🏽');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'brown'), '👋🏾');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'darkBrown'), '👋🏿');
});

test('useEmojis().getEmojiWithSkinTone returns the specific emoji without skin tone for emoji that does not support skin tones when passed as a string', t => {
    t.is(useEmojis().getEmojiWithSkinTone('↗️', 'none'), '↗️');
    t.is(useEmojis().getEmojiWithSkinTone('↗️', 'white'), '↗️');
    t.is(useEmojis().getEmojiWithSkinTone('↗️', 'darkBrown'), '↗️');
});

test('useEmojis().getEmojiWithSkinTone returns the specific emoji without skin tone for emoji that does not support skin tones when passed as an object', t => {
    const emoji = useEmojis().getDataByNodeEmojiName(':arrow_upper_right:');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'none'), '↗️');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'white'), '↗️');
    t.is(useEmojis().getEmojiWithSkinTone(emoji, 'darkBrown'), '↗️');
});

test('useEmojis().search fuzzy searches for emojis based on a query', t => {
    const results = useEmojis().search('wave');
    t.like(results[0], {
        name: 'waving hand',
        slug: 'waving_hand',
        group: 'People & Body',
        skin_tone_support: true,
        emoji: '👋'
    });
});

test('useEmojis().skinTones returns all available skin tones', t => {
    t.deepEqual(useEmojis().skinTones, [
        'none',
        'white',
        'creamWhite',
        'lightBrown',
        'brown',
        'darkBrown'
    ]);
});
