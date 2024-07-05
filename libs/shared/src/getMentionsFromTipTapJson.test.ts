import test from 'ava';
import { getMentionsFromTipTapJson } from './getMentionsFromTipTapJson';

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
                        label: 'Sophie Xeon'
                    }
                }
            ]
        }
    ]
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
                    text: 'top level mention: '
                },
                {
                    type: 'mention',
                    attrs: {
                        id: 'user:1',
                        label: 'Lorem ipsum'
                    }
                },
                {
                    type: 'text',
                    text: 'and some more text afterwards'
                }
            ]
        },
        {
            type: 'paragraph'
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
                                    text: 'nested mention:'
                                },
                                {
                                    type: 'mention',
                                    attrs: {
                                        id: 'user:1145',
                                        label: 'shadow@test.com'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: 'paragraph'
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
                                label: 'Mr Oizo'
                            }
                        }
                    ]
                }
            ]
        },
        {
            type: 'paragraph'
        },
        {
            type: 'paragraph',
            content: [
                {
                    type: 'mention',
                    attrs: {
                        id: 'user:1145',
                        label: 'mention with a link'
                    },
                    marks: [
                        {
                            type: 'link',
                            attrs: {
                                href: 'https://example.com',
                                target: '_blank',
                                rel: 'noopener noreferrer nofollow',
                                class: null
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
