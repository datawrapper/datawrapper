import test from 'ava';
import {
    getMentionsFromTipTapJson,
    getUserIdFromMention,
    getChartLinksFromTipTapJson,
    getChartIdFromLink,
} from './mentionsAndChartLinks';

test('getMentionsFromTipTapJson works for trivial case', t => {
    const set = getMentionsFromTipTapJson(trivialMentionsJson);
    t.deepEqual([...set], ['user:1202']);
});

test('getMentionsFromTipTapJson works for complex nested cases', t => {
    const set = getMentionsFromTipTapJson(deeplyNestedMentionsJson);
    t.deepEqual([...set].sort(), ['user:1', 'user:1206', 'user:1145'].sort());
});

test('getMentionsFromTipTapJson works for empty object', t => {
    const set = getMentionsFromTipTapJson({});
    t.deepEqual([...set], []);
});

test('getUserIdFromMention extracts a correct user id from a mention string', t => {
    t.is(getUserIdFromMention('user:1234'), 1234);
    t.is(getUserIdFromMention('user:0'), 0);
});

test('getUserIdFromMention throws an error when the mention is not a valid user mention string', t => {
    t.throws(() => getUserIdFromMention('not a user mention string'));
    t.throws(() => getUserIdFromMention('chart:vx7pm'));
    t.throws(() => getUserIdFromMention('comment:1234'));
    t.throws(() => getUserIdFromMention('user:'));
    t.throws(() => getUserIdFromMention('user:abc'));
});

test('getChartLinksFromTipTapJson works for trivial case', t => {
    const set = getChartLinksFromTipTapJson(trivialChartLinksJson);
    t.deepEqual([...set], ['chart:abcde']);
});

test('getChartLinksFromTipTapJson works for complex nested cases', t => {
    const set = getChartLinksFromTipTapJson(deeplyNestedChartLinksJson);
    t.deepEqual(
        [...set].sort(),
        ['chart:abcde', 'chart:fghij', 'chart:klmno', 'chart:pqrst'].sort()
    );
});

test('getChartLinksFromTipTapJson works for empty object', t => {
    const set = getChartLinksFromTipTapJson({});
    t.deepEqual([...set], []);
});

test('getChartIdFromLink extracts a correct chart id from a link string', t => {
    t.is(getChartIdFromLink('chart:abcde'), 'abcde');
    t.is(getChartIdFromLink('chart:0Ha9H'), '0Ha9H');
});

test('getChartIdFromLink throws an error when the link is not a valid chart link string', t => {
    t.throws(() => getChartIdFromLink('not a chart link string'));
    t.throws(() => getChartIdFromLink('user:1234'));
    t.throws(() => getChartIdFromLink('comment:1234'));
    t.throws(() => getChartIdFromLink('chart:'));
    t.throws(() => getChartIdFromLink('chart:abcdefg'));
});

/**
 * Equivalent to plain text "@Sophie Xeon".
 */
const trivialMentionsJson = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                {
                    type: 'mention',
                    attrs: {
                        id: 'user:1202',
                        label: 'Sophie Xeon',
                    },
                },
            ],
        },
    ],
};

/**
 * Equivalent to plain text '#abcde: "chart title"'.
 */
const trivialChartLinksJson = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                {
                    type: 'chart',
                    attrs: {
                        id: 'chart:abcde',
                        label: '#abcde: "chart title"',
                    },
                },
            ],
        },
    ],
};

/**
 * Equivalent to the following markdown:
top level mention: @Lorem ipsumand some more text afterwards

*   nested mention:@shadow@test.com


> @Mr Oizo

[@mention with a link](https://example.com)
 */
const deeplyNestedMentionsJson = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                {
                    type: 'text',
                    text: 'top level mention: ',
                },
                {
                    type: 'mention',
                    attrs: {
                        id: 'user:1',
                        label: 'Lorem ipsum',
                    },
                },
                {
                    type: 'text',
                    text: 'and some more text afterwards',
                },
            ],
        },
        {
            type: 'paragraph',
        },
        {
            type: 'bulletList',
            content: [
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'nested mention:',
                                },
                                {
                                    type: 'mention',
                                    attrs: {
                                        id: 'user:1145',
                                        label: 'shadow@test.com',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'paragraph',
        },
        {
            type: 'blockquote',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'mention',
                            attrs: {
                                id: 'user:1206',
                                label: 'Mr Oizo',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'paragraph',
        },
        {
            type: 'paragraph',
            content: [
                {
                    type: 'mention',
                    attrs: {
                        id: 'user:1145',
                        label: 'mention with a link',
                    },
                    marks: [
                        {
                            type: 'link',
                            attrs: {
                                href: 'https://example.com',
                                target: '_blank',
                                rel: 'noopener noreferrer nofollow',
                                class: null,
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

/**
 * Equivalent to the following markdown:
top level link: #abcde: "chart title 1" and some more text afterwards

*   nested link: #fghij: "chart title 2"


> #klmno: "chart title 3"

[#pqrst: "chart title 4"](https://example.com)
 */
const deeplyNestedChartLinksJson = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                {
                    type: 'text',
                    text: 'top level link: ',
                },
                {
                    type: 'chart',
                    attrs: {
                        id: 'chart:abcde',
                        label: '#abcde: "chart title 1"',
                    },
                },
                {
                    type: 'text',
                    text: 'and some more text afterwards',
                },
            ],
        },
        {
            type: 'paragraph',
        },
        {
            type: 'bulletList',
            content: [
                {
                    type: 'listItem',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'nested link:',
                                },
                                {
                                    type: 'chart',
                                    attrs: {
                                        id: 'chart:fghij',
                                        label: '#fghij: "chart title 2"',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'paragraph',
        },
        {
            type: 'blockquote',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'chart',
                            attrs: {
                                id: 'chart:klmno',
                                label: '#klmno: "chart title 3"',
                            },
                        },
                    ],
                },
            ],
        },
        {
            type: 'paragraph',
        },
        {
            type: 'paragraph',
            content: [
                {
                    type: 'chart',
                    attrs: {
                        id: 'chart:pqrst',
                        label: '#pqrst: "chart title 4"',
                    },
                    marks: [
                        {
                            type: 'link',
                            attrs: {
                                href: 'https://example.com',
                                target: '_blank',
                                rel: 'noopener noreferrer nofollow',
                                class: null,
                            },
                        },
                    ],
                },
            ],
        },
    ],
};
