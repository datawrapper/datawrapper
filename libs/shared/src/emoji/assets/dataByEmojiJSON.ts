import { type Emoji } from '../emojis.js';

/**
 * Source: https://github.com/muan/unicode-emoji-json/blob/main/data-by-emoji.json
 */
const emojiDataByEmoji = {
    '😀': {
        name: 'grinning face',
        slug: 'grinning_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😃': {
        name: 'grinning face with big eyes',
        slug: 'grinning_face_with_big_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😄': {
        name: 'grinning face with smiling eyes',
        slug: 'grinning_face_with_smiling_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😁': {
        name: 'beaming face with smiling eyes',
        slug: 'beaming_face_with_smiling_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😆': {
        name: 'grinning squinting face',
        slug: 'grinning_squinting_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😅': {
        name: 'grinning face with sweat',
        slug: 'grinning_face_with_sweat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤣': {
        name: 'rolling on the floor laughing',
        slug: 'rolling_on_the_floor_laughing',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '😂': {
        name: 'face with tears of joy',
        slug: 'face_with_tears_of_joy',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🙂': {
        name: 'slightly smiling face',
        slug: 'slightly_smiling_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🙃': {
        name: 'upside-down face',
        slug: 'upside_down_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🫠': {
        name: 'melting face',
        slug: 'melting_face',
        group: 'Smileys & Emotion',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '😉': {
        name: 'winking face',
        slug: 'winking_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😊': {
        name: 'smiling face with smiling eyes',
        slug: 'smiling_face_with_smiling_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😇': {
        name: 'smiling face with halo',
        slug: 'smiling_face_with_halo',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🥰': {
        name: 'smiling face with hearts',
        slug: 'smiling_face_with_hearts',
        group: 'Smileys & Emotion',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '😍': {
        name: 'smiling face with heart-eyes',
        slug: 'smiling_face_with_heart_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤩': {
        name: 'star-struck',
        slug: 'star_struck',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '😘': {
        name: 'face blowing a kiss',
        slug: 'face_blowing_a_kiss',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😗': {
        name: 'kissing face',
        slug: 'kissing_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '☺️': {
        name: 'smiling face',
        slug: 'smiling_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😚': {
        name: 'kissing face with closed eyes',
        slug: 'kissing_face_with_closed_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😙': {
        name: 'kissing face with smiling eyes',
        slug: 'kissing_face_with_smiling_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🥲': {
        name: 'smiling face with tear',
        slug: 'smiling_face_with_tear',
        group: 'Smileys & Emotion',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '😋': {
        name: 'face savoring food',
        slug: 'face_savoring_food',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😛': {
        name: 'face with tongue',
        slug: 'face_with_tongue',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😜': {
        name: 'winking face with tongue',
        slug: 'winking_face_with_tongue',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤪': {
        name: 'zany face',
        slug: 'zany_face',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '😝': {
        name: 'squinting face with tongue',
        slug: 'squinting_face_with_tongue',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤑': {
        name: 'money-mouth face',
        slug: 'money_mouth_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🤗': {
        name: 'smiling face with open hands',
        slug: 'smiling_face_with_open_hands',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🤭': {
        name: 'face with hand over mouth',
        slug: 'face_with_hand_over_mouth',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🫢': {
        name: 'face with open eyes and hand over mouth',
        slug: 'face_with_open_eyes_and_hand_over_mouth',
        group: 'Smileys & Emotion',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🫣': {
        name: 'face with peeking eye',
        slug: 'face_with_peeking_eye',
        group: 'Smileys & Emotion',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🤫': {
        name: 'shushing face',
        slug: 'shushing_face',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🤔': {
        name: 'thinking face',
        slug: 'thinking_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🫡': {
        name: 'saluting face',
        slug: 'saluting_face',
        group: 'Smileys & Emotion',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🤐': {
        name: 'zipper-mouth face',
        slug: 'zipper_mouth_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🤨': {
        name: 'face with raised eyebrow',
        slug: 'face_with_raised_eyebrow',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '😐': {
        name: 'neutral face',
        slug: 'neutral_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '😑': {
        name: 'expressionless face',
        slug: 'expressionless_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😶': {
        name: 'face without mouth',
        slug: 'face_without_mouth',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🫥': {
        name: 'dotted line face',
        slug: 'dotted_line_face',
        group: 'Smileys & Emotion',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '😶‍🌫️': {
        name: 'face in clouds',
        slug: 'face_in_clouds',
        group: 'Smileys & Emotion',
        emoji_version: '13.1',
        unicode_version: '13.1',
        skin_tone_support: false
    },
    '😏': {
        name: 'smirking face',
        slug: 'smirking_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😒': {
        name: 'unamused face',
        slug: 'unamused_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🙄': {
        name: 'face with rolling eyes',
        slug: 'face_with_rolling_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😬': {
        name: 'grimacing face',
        slug: 'grimacing_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😮‍💨': {
        name: 'face exhaling',
        slug: 'face_exhaling',
        group: 'Smileys & Emotion',
        emoji_version: '13.1',
        unicode_version: '13.1',
        skin_tone_support: false
    },
    '🤥': {
        name: 'lying face',
        slug: 'lying_face',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🫨': {
        name: 'shaking face',
        slug: 'shaking_face',
        group: 'Smileys & Emotion',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🙂‍↔️': {
        name: 'head shaking horizontally',
        slug: 'head_shaking_horizontally',
        group: 'Smileys & Emotion',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '🙂‍↕️': {
        name: 'head shaking vertically',
        slug: 'head_shaking_vertically',
        group: 'Smileys & Emotion',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '😌': {
        name: 'relieved face',
        slug: 'relieved_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😔': {
        name: 'pensive face',
        slug: 'pensive_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😪': {
        name: 'sleepy face',
        slug: 'sleepy_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤤': {
        name: 'drooling face',
        slug: 'drooling_face',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '😴': {
        name: 'sleeping face',
        slug: 'sleeping_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😷': {
        name: 'face with medical mask',
        slug: 'face_with_medical_mask',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤒': {
        name: 'face with thermometer',
        slug: 'face_with_thermometer',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🤕': {
        name: 'face with head-bandage',
        slug: 'face_with_head_bandage',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🤢': {
        name: 'nauseated face',
        slug: 'nauseated_face',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🤮': {
        name: 'face vomiting',
        slug: 'face_vomiting',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🤧': {
        name: 'sneezing face',
        slug: 'sneezing_face',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥵': {
        name: 'hot face',
        slug: 'hot_face',
        group: 'Smileys & Emotion',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥶': {
        name: 'cold face',
        slug: 'cold_face',
        group: 'Smileys & Emotion',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥴': {
        name: 'woozy face',
        slug: 'woozy_face',
        group: 'Smileys & Emotion',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '😵': {
        name: 'face with crossed-out eyes',
        slug: 'face_with_crossed_out_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😵‍💫': {
        name: 'face with spiral eyes',
        slug: 'face_with_spiral_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '13.1',
        unicode_version: '13.1',
        skin_tone_support: false
    },
    '🤯': {
        name: 'exploding head',
        slug: 'exploding_head',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🤠': {
        name: 'cowboy hat face',
        slug: 'cowboy_hat_face',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥳': {
        name: 'partying face',
        slug: 'partying_face',
        group: 'Smileys & Emotion',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥸': {
        name: 'disguised face',
        slug: 'disguised_face',
        group: 'Smileys & Emotion',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '😎': {
        name: 'smiling face with sunglasses',
        slug: 'smiling_face_with_sunglasses',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🤓': {
        name: 'nerd face',
        slug: 'nerd_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🧐': {
        name: 'face with monocle',
        slug: 'face_with_monocle',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '😕': {
        name: 'confused face',
        slug: 'confused_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🫤': {
        name: 'face with diagonal mouth',
        slug: 'face_with_diagonal_mouth',
        group: 'Smileys & Emotion',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '😟': {
        name: 'worried face',
        slug: 'worried_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🙁': {
        name: 'slightly frowning face',
        slug: 'slightly_frowning_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '☹️': {
        name: 'frowning face',
        slug: 'frowning_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '😮': {
        name: 'face with open mouth',
        slug: 'face_with_open_mouth',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😯': {
        name: 'hushed face',
        slug: 'hushed_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😲': {
        name: 'astonished face',
        slug: 'astonished_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😳': {
        name: 'flushed face',
        slug: 'flushed_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥺': {
        name: 'pleading face',
        slug: 'pleading_face',
        group: 'Smileys & Emotion',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥹': {
        name: 'face holding back tears',
        slug: 'face_holding_back_tears',
        group: 'Smileys & Emotion',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '😦': {
        name: 'frowning face with open mouth',
        slug: 'frowning_face_with_open_mouth',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😧': {
        name: 'anguished face',
        slug: 'anguished_face',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😨': {
        name: 'fearful face',
        slug: 'fearful_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😰': {
        name: 'anxious face with sweat',
        slug: 'anxious_face_with_sweat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😥': {
        name: 'sad but relieved face',
        slug: 'sad_but_relieved_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😢': {
        name: 'crying face',
        slug: 'crying_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😭': {
        name: 'loudly crying face',
        slug: 'loudly_crying_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😱': {
        name: 'face screaming in fear',
        slug: 'face_screaming_in_fear',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😖': {
        name: 'confounded face',
        slug: 'confounded_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😣': {
        name: 'persevering face',
        slug: 'persevering_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😞': {
        name: 'disappointed face',
        slug: 'disappointed_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😓': {
        name: 'downcast face with sweat',
        slug: 'downcast_face_with_sweat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😩': {
        name: 'weary face',
        slug: 'weary_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😫': {
        name: 'tired face',
        slug: 'tired_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥱': {
        name: 'yawning face',
        slug: 'yawning_face',
        group: 'Smileys & Emotion',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '😤': {
        name: 'face with steam from nose',
        slug: 'face_with_steam_from_nose',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😡': {
        name: 'enraged face',
        slug: 'enraged_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😠': {
        name: 'angry face',
        slug: 'angry_face',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤬': {
        name: 'face with symbols on mouth',
        slug: 'face_with_symbols_on_mouth',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '😈': {
        name: 'smiling face with horns',
        slug: 'smiling_face_with_horns',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '👿': {
        name: 'angry face with horns',
        slug: 'angry_face_with_horns',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💀': {
        name: 'skull',
        slug: 'skull',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☠️': {
        name: 'skull and crossbones',
        slug: 'skull_and_crossbones',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '💩': {
        name: 'pile of poo',
        slug: 'pile_of_poo',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤡': {
        name: 'clown face',
        slug: 'clown_face',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '👹': {
        name: 'ogre',
        slug: 'ogre',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👺': {
        name: 'goblin',
        slug: 'goblin',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👻': {
        name: 'ghost',
        slug: 'ghost',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👽': {
        name: 'alien',
        slug: 'alien',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👾': {
        name: 'alien monster',
        slug: 'alien_monster',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤖': {
        name: 'robot',
        slug: 'robot',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '😺': {
        name: 'grinning cat',
        slug: 'grinning_cat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😸': {
        name: 'grinning cat with smiling eyes',
        slug: 'grinning_cat_with_smiling_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😹': {
        name: 'cat with tears of joy',
        slug: 'cat_with_tears_of_joy',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😻': {
        name: 'smiling cat with heart-eyes',
        slug: 'smiling_cat_with_heart_eyes',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😼': {
        name: 'cat with wry smile',
        slug: 'cat_with_wry_smile',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😽': {
        name: 'kissing cat',
        slug: 'kissing_cat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🙀': {
        name: 'weary cat',
        slug: 'weary_cat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😿': {
        name: 'crying cat',
        slug: 'crying_cat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '😾': {
        name: 'pouting cat',
        slug: 'pouting_cat',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🙈': {
        name: 'see-no-evil monkey',
        slug: 'see_no_evil_monkey',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🙉': {
        name: 'hear-no-evil monkey',
        slug: 'hear_no_evil_monkey',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🙊': {
        name: 'speak-no-evil monkey',
        slug: 'speak_no_evil_monkey',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💌': {
        name: 'love letter',
        slug: 'love_letter',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💘': {
        name: 'heart with arrow',
        slug: 'heart_with_arrow',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💝': {
        name: 'heart with ribbon',
        slug: 'heart_with_ribbon',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💖': {
        name: 'sparkling heart',
        slug: 'sparkling_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💗': {
        name: 'growing heart',
        slug: 'growing_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💓': {
        name: 'beating heart',
        slug: 'beating_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💞': {
        name: 'revolving hearts',
        slug: 'revolving_hearts',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💕': {
        name: 'two hearts',
        slug: 'two_hearts',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💟': {
        name: 'heart decoration',
        slug: 'heart_decoration',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❣️': {
        name: 'heart exclamation',
        slug: 'heart_exclamation',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '💔': {
        name: 'broken heart',
        slug: 'broken_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❤️‍🔥': {
        name: 'heart on fire',
        slug: 'heart_on_fire',
        group: 'Smileys & Emotion',
        emoji_version: '13.1',
        unicode_version: '13.1',
        skin_tone_support: false
    },
    '❤️‍🩹': {
        name: 'mending heart',
        slug: 'mending_heart',
        group: 'Smileys & Emotion',
        emoji_version: '13.1',
        unicode_version: '13.1',
        skin_tone_support: false
    },
    '❤️': {
        name: 'red heart',
        slug: 'red_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🩷': {
        name: 'pink heart',
        slug: 'pink_heart',
        group: 'Smileys & Emotion',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🧡': {
        name: 'orange heart',
        slug: 'orange_heart',
        group: 'Smileys & Emotion',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '💛': {
        name: 'yellow heart',
        slug: 'yellow_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💚': {
        name: 'green heart',
        slug: 'green_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💙': {
        name: 'blue heart',
        slug: 'blue_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🩵': {
        name: 'light blue heart',
        slug: 'light_blue_heart',
        group: 'Smileys & Emotion',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '💜': {
        name: 'purple heart',
        slug: 'purple_heart',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤎': {
        name: 'brown heart',
        slug: 'brown_heart',
        group: 'Smileys & Emotion',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🖤': {
        name: 'black heart',
        slug: 'black_heart',
        group: 'Smileys & Emotion',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🩶': {
        name: 'grey heart',
        slug: 'grey_heart',
        group: 'Smileys & Emotion',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🤍': {
        name: 'white heart',
        slug: 'white_heart',
        group: 'Smileys & Emotion',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '💋': {
        name: 'kiss mark',
        slug: 'kiss_mark',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💯': {
        name: 'hundred points',
        slug: 'hundred_points',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💢': {
        name: 'anger symbol',
        slug: 'anger_symbol',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💥': {
        name: 'collision',
        slug: 'collision',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💫': {
        name: 'dizzy',
        slug: 'dizzy',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💦': {
        name: 'sweat droplets',
        slug: 'sweat_droplets',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💨': {
        name: 'dashing away',
        slug: 'dashing_away',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕳️': {
        name: 'hole',
        slug: 'hole',
        group: 'Smileys & Emotion',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '💬': {
        name: 'speech balloon',
        slug: 'speech_balloon',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👁️‍🗨️': {
        name: 'eye in speech bubble',
        slug: 'eye_in_speech_bubble',
        group: 'Smileys & Emotion',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🗨️': {
        name: 'left speech bubble',
        slug: 'left_speech_bubble',
        group: 'Smileys & Emotion',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🗯️': {
        name: 'right anger bubble',
        slug: 'right_anger_bubble',
        group: 'Smileys & Emotion',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '💭': {
        name: 'thought balloon',
        slug: 'thought_balloon',
        group: 'Smileys & Emotion',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '💤': {
        name: 'ZZZ',
        slug: 'zzz',
        group: 'Smileys & Emotion',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👋': {
        name: 'waving hand',
        slug: 'waving_hand',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤚': {
        name: 'raised back of hand',
        slug: 'raised_back_of_hand',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🖐️': {
        name: 'hand with fingers splayed',
        slug: 'hand_with_fingers_splayed',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '✋': {
        name: 'raised hand',
        slug: 'raised_hand',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🖖': {
        name: 'vulcan salute',
        slug: 'vulcan_salute',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🫱': {
        name: 'rightwards hand',
        slug: 'rightwards_hand',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🫲': {
        name: 'leftwards hand',
        slug: 'leftwards_hand',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🫳': {
        name: 'palm down hand',
        slug: 'palm_down_hand',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🫴': {
        name: 'palm up hand',
        slug: 'palm_up_hand',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🫷': {
        name: 'leftwards pushing hand',
        slug: 'leftwards_pushing_hand',
        group: 'People & Body',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.0'
    },
    '🫸': {
        name: 'rightwards pushing hand',
        slug: 'rightwards_pushing_hand',
        group: 'People & Body',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.0'
    },
    '👌': {
        name: 'OK hand',
        slug: 'ok_hand',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤌': {
        name: 'pinched fingers',
        slug: 'pinched_fingers',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '🤏': {
        name: 'pinching hand',
        slug: 'pinching_hand',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '✌️': {
        name: 'victory hand',
        slug: 'victory_hand',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤞': {
        name: 'crossed fingers',
        slug: 'crossed_fingers',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🫰': {
        name: 'hand with index finger and thumb crossed',
        slug: 'hand_with_index_finger_and_thumb_crossed',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🤟': {
        name: 'love-you gesture',
        slug: 'love_you_gesture',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🤘': {
        name: 'sign of the horns',
        slug: 'sign_of_the_horns',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤙': {
        name: 'call me hand',
        slug: 'call_me_hand',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '👈': {
        name: 'backhand index pointing left',
        slug: 'backhand_index_pointing_left',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👉': {
        name: 'backhand index pointing right',
        slug: 'backhand_index_pointing_right',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👆': {
        name: 'backhand index pointing up',
        slug: 'backhand_index_pointing_up',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🖕': {
        name: 'middle finger',
        slug: 'middle_finger',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👇': {
        name: 'backhand index pointing down',
        slug: 'backhand_index_pointing_down',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '☝️': {
        name: 'index pointing up',
        slug: 'index_pointing_up',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🫵': {
        name: 'index pointing at the viewer',
        slug: 'index_pointing_at_the_viewer',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '👍': {
        name: 'thumbs up',
        slug: 'thumbs_up',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👎': {
        name: 'thumbs down',
        slug: 'thumbs_down',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '✊': {
        name: 'raised fist',
        slug: 'raised_fist',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👊': {
        name: 'oncoming fist',
        slug: 'oncoming_fist',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤛': {
        name: 'left-facing fist',
        slug: 'left_facing_fist',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤜': {
        name: 'right-facing fist',
        slug: 'right_facing_fist',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '👏': {
        name: 'clapping hands',
        slug: 'clapping_hands',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙌': {
        name: 'raising hands',
        slug: 'raising_hands',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🫶': {
        name: 'heart hands',
        slug: 'heart_hands',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '👐': {
        name: 'open hands',
        slug: 'open_hands',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤲': {
        name: 'palms up together',
        slug: 'palms_up_together',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🤝': {
        name: 'handshake',
        slug: 'handshake',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🙏': {
        name: 'folded hands',
        slug: 'folded_hands',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '✍️': {
        name: 'writing hand',
        slug: 'writing_hand',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '💅': {
        name: 'nail polish',
        slug: 'nail_polish',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤳': {
        name: 'selfie',
        slug: 'selfie',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '💪': {
        name: 'flexed biceps',
        slug: 'flexed_biceps',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🦾': {
        name: 'mechanical arm',
        slug: 'mechanical_arm',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🦿': {
        name: 'mechanical leg',
        slug: 'mechanical_leg',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🦵': {
        name: 'leg',
        slug: 'leg',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🦶': {
        name: 'foot',
        slug: 'foot',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '👂': {
        name: 'ear',
        slug: 'ear',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🦻': {
        name: 'ear with hearing aid',
        slug: 'ear_with_hearing_aid',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👃': {
        name: 'nose',
        slug: 'nose',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🧠': {
        name: 'brain',
        slug: 'brain',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🫀': {
        name: 'anatomical heart',
        slug: 'anatomical_heart',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🫁': {
        name: 'lungs',
        slug: 'lungs',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🦷': {
        name: 'tooth',
        slug: 'tooth',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🦴': {
        name: 'bone',
        slug: 'bone',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '👀': {
        name: 'eyes',
        slug: 'eyes',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👁️': {
        name: 'eye',
        slug: 'eye',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '👅': {
        name: 'tongue',
        slug: 'tongue',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👄': {
        name: 'mouth',
        slug: 'mouth',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫦': {
        name: 'biting lip',
        slug: 'biting_lip',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '👶': {
        name: 'baby',
        slug: 'baby',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🧒': {
        name: 'child',
        slug: 'child',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '👦': {
        name: 'boy',
        slug: 'boy',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👧': {
        name: 'girl',
        slug: 'girl',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🧑': {
        name: 'person',
        slug: 'person',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '👱': {
        name: 'person blond hair',
        slug: 'person_blond_hair',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👨': {
        name: 'man',
        slug: 'man',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🧔': {
        name: 'person beard',
        slug: 'person_beard',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧔‍♂️': {
        name: 'man beard',
        slug: 'man_beard',
        group: 'People & Body',
        emoji_version: '13.1',
        unicode_version: '13.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '🧔‍♀️': {
        name: 'woman beard',
        slug: 'woman_beard',
        group: 'People & Body',
        emoji_version: '13.1',
        unicode_version: '13.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👨‍🦰': {
        name: 'man red hair',
        slug: 'man_red_hair',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '👨‍🦱': {
        name: 'man curly hair',
        slug: 'man_curly_hair',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '👨‍🦳': {
        name: 'man white hair',
        slug: 'man_white_hair',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '👨‍🦲': {
        name: 'man bald',
        slug: 'man_bald',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '👩': {
        name: 'woman',
        slug: 'woman',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👩‍🦰': {
        name: 'woman red hair',
        slug: 'woman_red_hair',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🧑‍🦰': {
        name: 'person red hair',
        slug: 'person_red_hair',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👩‍🦱': {
        name: 'woman curly hair',
        slug: 'woman_curly_hair',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🧑‍🦱': {
        name: 'person curly hair',
        slug: 'person_curly_hair',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👩‍🦳': {
        name: 'woman white hair',
        slug: 'woman_white_hair',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🧑‍🦳': {
        name: 'person white hair',
        slug: 'person_white_hair',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👩‍🦲': {
        name: 'woman bald',
        slug: 'woman_bald',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🧑‍🦲': {
        name: 'person bald',
        slug: 'person_bald',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👱‍♀️': {
        name: 'woman blond hair',
        slug: 'woman_blond_hair',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👱‍♂️': {
        name: 'man blond hair',
        slug: 'man_blond_hair',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧓': {
        name: 'older person',
        slug: 'older_person',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '👴': {
        name: 'old man',
        slug: 'old_man',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👵': {
        name: 'old woman',
        slug: 'old_woman',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙍': {
        name: 'person frowning',
        slug: 'person_frowning',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙍‍♂️': {
        name: 'man frowning',
        slug: 'man_frowning',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙍‍♀️': {
        name: 'woman frowning',
        slug: 'woman_frowning',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙎': {
        name: 'person pouting',
        slug: 'person_pouting',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙎‍♂️': {
        name: 'man pouting',
        slug: 'man_pouting',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙎‍♀️': {
        name: 'woman pouting',
        slug: 'woman_pouting',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙅': {
        name: 'person gesturing NO',
        slug: 'person_gesturing_no',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙅‍♂️': {
        name: 'man gesturing NO',
        slug: 'man_gesturing_no',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙅‍♀️': {
        name: 'woman gesturing NO',
        slug: 'woman_gesturing_no',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙆': {
        name: 'person gesturing OK',
        slug: 'person_gesturing_ok',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙆‍♂️': {
        name: 'man gesturing OK',
        slug: 'man_gesturing_ok',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙆‍♀️': {
        name: 'woman gesturing OK',
        slug: 'woman_gesturing_ok',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '💁': {
        name: 'person tipping hand',
        slug: 'person_tipping_hand',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '💁‍♂️': {
        name: 'man tipping hand',
        slug: 'man_tipping_hand',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '💁‍♀️': {
        name: 'woman tipping hand',
        slug: 'woman_tipping_hand',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙋': {
        name: 'person raising hand',
        slug: 'person_raising_hand',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙋‍♂️': {
        name: 'man raising hand',
        slug: 'man_raising_hand',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙋‍♀️': {
        name: 'woman raising hand',
        slug: 'woman_raising_hand',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧏': {
        name: 'deaf person',
        slug: 'deaf_person',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧏‍♂️': {
        name: 'deaf man',
        slug: 'deaf_man',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧏‍♀️': {
        name: 'deaf woman',
        slug: 'deaf_woman',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🙇': {
        name: 'person bowing',
        slug: 'person_bowing',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🙇‍♂️': {
        name: 'man bowing',
        slug: 'man_bowing',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🙇‍♀️': {
        name: 'woman bowing',
        slug: 'woman_bowing',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤦': {
        name: 'person facepalming',
        slug: 'person_facepalming',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤦‍♂️': {
        name: 'man facepalming',
        slug: 'man_facepalming',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤦‍♀️': {
        name: 'woman facepalming',
        slug: 'woman_facepalming',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤷': {
        name: 'person shrugging',
        slug: 'person_shrugging',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤷‍♂️': {
        name: 'man shrugging',
        slug: 'man_shrugging',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤷‍♀️': {
        name: 'woman shrugging',
        slug: 'woman_shrugging',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍⚕️': {
        name: 'health worker',
        slug: 'health_worker',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍⚕️': {
        name: 'man health worker',
        slug: 'man_health_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍⚕️': {
        name: 'woman health worker',
        slug: 'woman_health_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🎓': {
        name: 'student',
        slug: 'student',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🎓': {
        name: 'man student',
        slug: 'man_student',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🎓': {
        name: 'woman student',
        slug: 'woman_student',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🏫': {
        name: 'teacher',
        slug: 'teacher',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🏫': {
        name: 'man teacher',
        slug: 'man_teacher',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🏫': {
        name: 'woman teacher',
        slug: 'woman_teacher',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍⚖️': {
        name: 'judge',
        slug: 'judge',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍⚖️': {
        name: 'man judge',
        slug: 'man_judge',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍⚖️': {
        name: 'woman judge',
        slug: 'woman_judge',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🌾': {
        name: 'farmer',
        slug: 'farmer',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🌾': {
        name: 'man farmer',
        slug: 'man_farmer',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🌾': {
        name: 'woman farmer',
        slug: 'woman_farmer',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🍳': {
        name: 'cook',
        slug: 'cook',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🍳': {
        name: 'man cook',
        slug: 'man_cook',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🍳': {
        name: 'woman cook',
        slug: 'woman_cook',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🔧': {
        name: 'mechanic',
        slug: 'mechanic',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🔧': {
        name: 'man mechanic',
        slug: 'man_mechanic',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🔧': {
        name: 'woman mechanic',
        slug: 'woman_mechanic',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🏭': {
        name: 'factory worker',
        slug: 'factory_worker',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🏭': {
        name: 'man factory worker',
        slug: 'man_factory_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🏭': {
        name: 'woman factory worker',
        slug: 'woman_factory_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍💼': {
        name: 'office worker',
        slug: 'office_worker',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍💼': {
        name: 'man office worker',
        slug: 'man_office_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍💼': {
        name: 'woman office worker',
        slug: 'woman_office_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🔬': {
        name: 'scientist',
        slug: 'scientist',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🔬': {
        name: 'man scientist',
        slug: 'man_scientist',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🔬': {
        name: 'woman scientist',
        slug: 'woman_scientist',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍💻': {
        name: 'technologist',
        slug: 'technologist',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍💻': {
        name: 'man technologist',
        slug: 'man_technologist',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍💻': {
        name: 'woman technologist',
        slug: 'woman_technologist',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🎤': {
        name: 'singer',
        slug: 'singer',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🎤': {
        name: 'man singer',
        slug: 'man_singer',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🎤': {
        name: 'woman singer',
        slug: 'woman_singer',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🎨': {
        name: 'artist',
        slug: 'artist',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🎨': {
        name: 'man artist',
        slug: 'man_artist',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🎨': {
        name: 'woman artist',
        slug: 'woman_artist',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍✈️': {
        name: 'pilot',
        slug: 'pilot',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍✈️': {
        name: 'man pilot',
        slug: 'man_pilot',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍✈️': {
        name: 'woman pilot',
        slug: 'woman_pilot',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🚀': {
        name: 'astronaut',
        slug: 'astronaut',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🚀': {
        name: 'man astronaut',
        slug: 'man_astronaut',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🚀': {
        name: 'woman astronaut',
        slug: 'woman_astronaut',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🚒': {
        name: 'firefighter',
        slug: 'firefighter',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '👨‍🚒': {
        name: 'man firefighter',
        slug: 'man_firefighter',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👩‍🚒': {
        name: 'woman firefighter',
        slug: 'woman_firefighter',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👮': {
        name: 'police officer',
        slug: 'police_officer',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👮‍♂️': {
        name: 'man police officer',
        slug: 'man_police_officer',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👮‍♀️': {
        name: 'woman police officer',
        slug: 'woman_police_officer',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🕵️': {
        name: 'detective',
        slug: 'detective',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '2.0'
    },
    '🕵️‍♂️': {
        name: 'man detective',
        slug: 'man_detective',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🕵️‍♀️': {
        name: 'woman detective',
        slug: 'woman_detective',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '💂': {
        name: 'guard',
        slug: 'guard',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '💂‍♂️': {
        name: 'man guard',
        slug: 'man_guard',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '💂‍♀️': {
        name: 'woman guard',
        slug: 'woman_guard',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🥷': {
        name: 'ninja',
        slug: 'ninja',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '👷': {
        name: 'construction worker',
        slug: 'construction_worker',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👷‍♂️': {
        name: 'man construction worker',
        slug: 'man_construction_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👷‍♀️': {
        name: 'woman construction worker',
        slug: 'woman_construction_worker',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🫅': {
        name: 'person with crown',
        slug: 'person_with_crown',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🤴': {
        name: 'prince',
        slug: 'prince',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '👸': {
        name: 'princess',
        slug: 'princess',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👳': {
        name: 'person wearing turban',
        slug: 'person_wearing_turban',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👳‍♂️': {
        name: 'man wearing turban',
        slug: 'man_wearing_turban',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👳‍♀️': {
        name: 'woman wearing turban',
        slug: 'woman_wearing_turban',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👲': {
        name: 'person with skullcap',
        slug: 'person_with_skullcap',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🧕': {
        name: 'woman with headscarf',
        slug: 'woman_with_headscarf',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🤵': {
        name: 'person in tuxedo',
        slug: 'person_in_tuxedo',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤵‍♂️': {
        name: 'man in tuxedo',
        slug: 'man_in_tuxedo',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '🤵‍♀️': {
        name: 'woman in tuxedo',
        slug: 'woman_in_tuxedo',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '👰': {
        name: 'person with veil',
        slug: 'person_with_veil',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '👰‍♂️': {
        name: 'man with veil',
        slug: 'man_with_veil',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '👰‍♀️': {
        name: 'woman with veil',
        slug: 'woman_with_veil',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '🤰': {
        name: 'pregnant woman',
        slug: 'pregnant_woman',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🫃': {
        name: 'pregnant man',
        slug: 'pregnant_man',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🫄': {
        name: 'pregnant person',
        slug: 'pregnant_person',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '14.0'
    },
    '🤱': {
        name: 'breast-feeding',
        slug: 'breast_feeding',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '👩‍🍼': {
        name: 'woman feeding baby',
        slug: 'woman_feeding_baby',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '👨‍🍼': {
        name: 'man feeding baby',
        slug: 'man_feeding_baby',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '🧑‍🍼': {
        name: 'person feeding baby',
        slug: 'person_feeding_baby',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '👼': {
        name: 'baby angel',
        slug: 'baby_angel',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🎅': {
        name: 'Santa Claus',
        slug: 'santa_claus',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🤶': {
        name: 'Mrs. Claus',
        slug: 'mrs_claus',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🧑‍🎄': {
        name: 'mx claus',
        slug: 'mx_claus',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.0'
    },
    '🦸': {
        name: 'superhero',
        slug: 'superhero',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🦸‍♂️': {
        name: 'man superhero',
        slug: 'man_superhero',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🦸‍♀️': {
        name: 'woman superhero',
        slug: 'woman_superhero',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🦹': {
        name: 'supervillain',
        slug: 'supervillain',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🦹‍♂️': {
        name: 'man supervillain',
        slug: 'man_supervillain',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🦹‍♀️': {
        name: 'woman supervillain',
        slug: 'woman_supervillain',
        group: 'People & Body',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '11.0'
    },
    '🧙': {
        name: 'mage',
        slug: 'mage',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧙‍♂️': {
        name: 'man mage',
        slug: 'man_mage',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧙‍♀️': {
        name: 'woman mage',
        slug: 'woman_mage',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧚': {
        name: 'fairy',
        slug: 'fairy',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧚‍♂️': {
        name: 'man fairy',
        slug: 'man_fairy',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧚‍♀️': {
        name: 'woman fairy',
        slug: 'woman_fairy',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧛': {
        name: 'vampire',
        slug: 'vampire',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧛‍♂️': {
        name: 'man vampire',
        slug: 'man_vampire',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧛‍♀️': {
        name: 'woman vampire',
        slug: 'woman_vampire',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧜': {
        name: 'merperson',
        slug: 'merperson',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧜‍♂️': {
        name: 'merman',
        slug: 'merman',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧜‍♀️': {
        name: 'mermaid',
        slug: 'mermaid',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧝': {
        name: 'elf',
        slug: 'elf',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧝‍♂️': {
        name: 'man elf',
        slug: 'man_elf',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧝‍♀️': {
        name: 'woman elf',
        slug: 'woman_elf',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧞': {
        name: 'genie',
        slug: 'genie',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧞‍♂️': {
        name: 'man genie',
        slug: 'man_genie',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧞‍♀️': {
        name: 'woman genie',
        slug: 'woman_genie',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧟': {
        name: 'zombie',
        slug: 'zombie',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧟‍♂️': {
        name: 'man zombie',
        slug: 'man_zombie',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧟‍♀️': {
        name: 'woman zombie',
        slug: 'woman_zombie',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧌': {
        name: 'troll',
        slug: 'troll',
        group: 'People & Body',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '💆': {
        name: 'person getting massage',
        slug: 'person_getting_massage',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '💆‍♂️': {
        name: 'man getting massage',
        slug: 'man_getting_massage',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '💆‍♀️': {
        name: 'woman getting massage',
        slug: 'woman_getting_massage',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '💇': {
        name: 'person getting haircut',
        slug: 'person_getting_haircut',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '💇‍♂️': {
        name: 'man getting haircut',
        slug: 'man_getting_haircut',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '💇‍♀️': {
        name: 'woman getting haircut',
        slug: 'woman_getting_haircut',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚶': {
        name: 'person walking',
        slug: 'person_walking',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🚶‍♂️': {
        name: 'man walking',
        slug: 'man_walking',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚶‍♀️': {
        name: 'woman walking',
        slug: 'woman_walking',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚶‍➡️': {
        name: 'person walking facing right',
        slug: 'person_walking_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🚶‍♀️‍➡️': {
        name: 'woman walking facing right',
        slug: 'woman_walking_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🚶‍♂️‍➡️': {
        name: 'man walking facing right',
        slug: 'man_walking_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🧍': {
        name: 'person standing',
        slug: 'person_standing',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧍‍♂️': {
        name: 'man standing',
        slug: 'man_standing',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧍‍♀️': {
        name: 'woman standing',
        slug: 'woman_standing',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧎': {
        name: 'person kneeling',
        slug: 'person_kneeling',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧎‍♂️': {
        name: 'man kneeling',
        slug: 'man_kneeling',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧎‍♀️': {
        name: 'woman kneeling',
        slug: 'woman_kneeling',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '🧎‍➡️': {
        name: 'person kneeling facing right',
        slug: 'person_kneeling_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🧎‍♀️‍➡️': {
        name: 'woman kneeling facing right',
        slug: 'woman_kneeling_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🧎‍♂️‍➡️': {
        name: 'man kneeling facing right',
        slug: 'man_kneeling_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🧑‍🦯': {
        name: 'person with white cane',
        slug: 'person_with_white_cane',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '🧑‍🦯‍➡️': {
        name: 'person with white cane facing right',
        slug: 'person_with_white_cane_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '👨‍🦯': {
        name: 'man with white cane',
        slug: 'man_with_white_cane',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👨‍🦯‍➡️': {
        name: 'man with white cane facing right',
        slug: 'man_with_white_cane_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '👩‍🦯': {
        name: 'woman with white cane',
        slug: 'woman_with_white_cane',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👩‍🦯‍➡️': {
        name: 'woman with white cane facing right',
        slug: 'woman_with_white_cane_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🧑‍🦼': {
        name: 'person in motorized wheelchair',
        slug: 'person_in_motorized_wheelchair',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '🧑‍🦼‍➡️': {
        name: 'person in motorized wheelchair facing right',
        slug: 'person_in_motorized_wheelchair_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '👨‍🦼': {
        name: 'man in motorized wheelchair',
        slug: 'man_in_motorized_wheelchair',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👨‍🦼‍➡️': {
        name: 'man in motorized wheelchair facing right',
        slug: 'man_in_motorized_wheelchair_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '👩‍🦼': {
        name: 'woman in motorized wheelchair',
        slug: 'woman_in_motorized_wheelchair',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👩‍🦼‍➡️': {
        name: 'woman in motorized wheelchair facing right',
        slug: 'woman_in_motorized_wheelchair_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🧑‍🦽': {
        name: 'person in manual wheelchair',
        slug: 'person_in_manual_wheelchair',
        group: 'People & Body',
        emoji_version: '12.1',
        unicode_version: '12.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.1'
    },
    '🧑‍🦽‍➡️': {
        name: 'person in manual wheelchair facing right',
        slug: 'person_in_manual_wheelchair_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '👨‍🦽': {
        name: 'man in manual wheelchair',
        slug: 'man_in_manual_wheelchair',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👨‍🦽‍➡️': {
        name: 'man in manual wheelchair facing right',
        slug: 'man_in_manual_wheelchair_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '👩‍🦽': {
        name: 'woman in manual wheelchair',
        slug: 'woman_in_manual_wheelchair',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👩‍🦽‍➡️': {
        name: 'woman in manual wheelchair facing right',
        slug: 'woman_in_manual_wheelchair_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🏃': {
        name: 'person running',
        slug: 'person_running',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🏃‍♂️': {
        name: 'man running',
        slug: 'man_running',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏃‍♀️': {
        name: 'woman running',
        slug: 'woman_running',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏃‍➡️': {
        name: 'person running facing right',
        slug: 'person_running_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🏃‍♀️‍➡️': {
        name: 'woman running facing right',
        slug: 'woman_running_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '🏃‍♂️‍➡️': {
        name: 'man running facing right',
        slug: 'man_running_facing_right',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '15.1'
    },
    '💃': {
        name: 'woman dancing',
        slug: 'woman_dancing',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🕺': {
        name: 'man dancing',
        slug: 'man_dancing',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🕴️': {
        name: 'person in suit levitating',
        slug: 'person_in_suit_levitating',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '👯': {
        name: 'people with bunny ears',
        slug: 'people_with_bunny_ears',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👯‍♂️': {
        name: 'men with bunny ears',
        slug: 'men_with_bunny_ears',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👯‍♀️': {
        name: 'women with bunny ears',
        slug: 'women_with_bunny_ears',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '🧖': {
        name: 'person in steamy room',
        slug: 'person_in_steamy_room',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧖‍♂️': {
        name: 'man in steamy room',
        slug: 'man_in_steamy_room',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧖‍♀️': {
        name: 'woman in steamy room',
        slug: 'woman_in_steamy_room',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧗': {
        name: 'person climbing',
        slug: 'person_climbing',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧗‍♂️': {
        name: 'man climbing',
        slug: 'man_climbing',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧗‍♀️': {
        name: 'woman climbing',
        slug: 'woman_climbing',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🤺': {
        name: 'person fencing',
        slug: 'person_fencing',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🏇': {
        name: 'horse racing',
        slug: 'horse_racing',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '⛷️': {
        name: 'skier',
        slug: 'skier',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏂': {
        name: 'snowboarder',
        slug: 'snowboarder',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🏌️': {
        name: 'person golfing',
        slug: 'person_golfing',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏌️‍♂️': {
        name: 'man golfing',
        slug: 'man_golfing',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏌️‍♀️': {
        name: 'woman golfing',
        slug: 'woman_golfing',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏄': {
        name: 'person surfing',
        slug: 'person_surfing',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🏄‍♂️': {
        name: 'man surfing',
        slug: 'man_surfing',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏄‍♀️': {
        name: 'woman surfing',
        slug: 'woman_surfing',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚣': {
        name: 'person rowing boat',
        slug: 'person_rowing_boat',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🚣‍♂️': {
        name: 'man rowing boat',
        slug: 'man_rowing_boat',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚣‍♀️': {
        name: 'woman rowing boat',
        slug: 'woman_rowing_boat',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏊': {
        name: 'person swimming',
        slug: 'person_swimming',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🏊‍♂️': {
        name: 'man swimming',
        slug: 'man_swimming',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏊‍♀️': {
        name: 'woman swimming',
        slug: 'woman_swimming',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '⛹️': {
        name: 'person bouncing ball',
        slug: 'person_bouncing_ball',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '2.0'
    },
    '⛹️‍♂️': {
        name: 'man bouncing ball',
        slug: 'man_bouncing_ball',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '⛹️‍♀️': {
        name: 'woman bouncing ball',
        slug: 'woman_bouncing_ball',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏋️': {
        name: 'person lifting weights',
        slug: 'person_lifting_weights',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '2.0'
    },
    '🏋️‍♂️': {
        name: 'man lifting weights',
        slug: 'man_lifting_weights',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🏋️‍♀️': {
        name: 'woman lifting weights',
        slug: 'woman_lifting_weights',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚴': {
        name: 'person biking',
        slug: 'person_biking',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🚴‍♂️': {
        name: 'man biking',
        slug: 'man_biking',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚴‍♀️': {
        name: 'woman biking',
        slug: 'woman_biking',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚵': {
        name: 'person mountain biking',
        slug: 'person_mountain_biking',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🚵‍♂️': {
        name: 'man mountain biking',
        slug: 'man_mountain_biking',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🚵‍♀️': {
        name: 'woman mountain biking',
        slug: 'woman_mountain_biking',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤸': {
        name: 'person cartwheeling',
        slug: 'person_cartwheeling',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤸‍♂️': {
        name: 'man cartwheeling',
        slug: 'man_cartwheeling',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤸‍♀️': {
        name: 'woman cartwheeling',
        slug: 'woman_cartwheeling',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤼': {
        name: 'people wrestling',
        slug: 'people_wrestling',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🤼‍♂️': {
        name: 'men wrestling',
        slug: 'men_wrestling',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '🤼‍♀️': {
        name: 'women wrestling',
        slug: 'women_wrestling',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '🤽': {
        name: 'person playing water polo',
        slug: 'person_playing_water_polo',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤽‍♂️': {
        name: 'man playing water polo',
        slug: 'man_playing_water_polo',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤽‍♀️': {
        name: 'woman playing water polo',
        slug: 'woman_playing_water_polo',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤾': {
        name: 'person playing handball',
        slug: 'person_playing_handball',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤾‍♂️': {
        name: 'man playing handball',
        slug: 'man_playing_handball',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤾‍♀️': {
        name: 'woman playing handball',
        slug: 'woman_playing_handball',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤹': {
        name: 'person juggling',
        slug: 'person_juggling',
        group: 'People & Body',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '3.0'
    },
    '🤹‍♂️': {
        name: 'man juggling',
        slug: 'man_juggling',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🤹‍♀️': {
        name: 'woman juggling',
        slug: 'woman_juggling',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧘': {
        name: 'person in lotus position',
        slug: 'person_in_lotus_position',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧘‍♂️': {
        name: 'man in lotus position',
        slug: 'man_in_lotus_position',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🧘‍♀️': {
        name: 'woman in lotus position',
        slug: 'woman_in_lotus_position',
        group: 'People & Body',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '5.0'
    },
    '🛀': {
        name: 'person taking bath',
        slug: 'person_taking_bath',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '1.0'
    },
    '🛌': {
        name: 'person in bed',
        slug: 'person_in_bed',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '4.0'
    },
    '🧑‍🤝‍🧑': {
        name: 'people holding hands',
        slug: 'people_holding_hands',
        group: 'People & Body',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👭': {
        name: 'women holding hands',
        slug: 'women_holding_hands',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👫': {
        name: 'woman and man holding hands',
        slug: 'woman_and_man_holding_hands',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '👬': {
        name: 'men holding hands',
        slug: 'men_holding_hands',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '12.0'
    },
    '💏': {
        name: 'kiss',
        slug: 'kiss',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👩‍❤️‍💋‍👨': {
        name: 'kiss woman, man',
        slug: 'kiss_woman_man',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👨‍❤️‍💋‍👨': {
        name: 'kiss man, man',
        slug: 'kiss_man_man',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👩‍❤️‍💋‍👩': {
        name: 'kiss woman, woman',
        slug: 'kiss_woman_woman',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '💑': {
        name: 'couple with heart',
        slug: 'couple_with_heart',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👩‍❤️‍👨': {
        name: 'couple with heart woman, man',
        slug: 'couple_with_heart_woman_man',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👨‍❤️‍👨': {
        name: 'couple with heart man, man',
        slug: 'couple_with_heart_man_man',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👩‍❤️‍👩': {
        name: 'couple with heart woman, woman',
        slug: 'couple_with_heart_woman_woman',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: true,
        skin_tone_support_unicode_version: '13.1'
    },
    '👨‍👩‍👦': {
        name: 'family man, woman, boy',
        slug: 'family_man_woman_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👩‍👧': {
        name: 'family man, woman, girl',
        slug: 'family_man_woman_girl',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👩‍👧‍👦': {
        name: 'family man, woman, girl, boy',
        slug: 'family_man_woman_girl_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👩‍👦‍👦': {
        name: 'family man, woman, boy, boy',
        slug: 'family_man_woman_boy_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👩‍👧‍👧': {
        name: 'family man, woman, girl, girl',
        slug: 'family_man_woman_girl_girl',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👨‍👦': {
        name: 'family man, man, boy',
        slug: 'family_man_man_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👨‍👧': {
        name: 'family man, man, girl',
        slug: 'family_man_man_girl',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👨‍👧‍👦': {
        name: 'family man, man, girl, boy',
        slug: 'family_man_man_girl_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👨‍👦‍👦': {
        name: 'family man, man, boy, boy',
        slug: 'family_man_man_boy_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👨‍👧‍👧': {
        name: 'family man, man, girl, girl',
        slug: 'family_man_man_girl_girl',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👩‍👩‍👦': {
        name: 'family woman, woman, boy',
        slug: 'family_woman_woman_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👩‍👩‍👧': {
        name: 'family woman, woman, girl',
        slug: 'family_woman_woman_girl',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👩‍👩‍👧‍👦': {
        name: 'family woman, woman, girl, boy',
        slug: 'family_woman_woman_girl_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👩‍👩‍👦‍👦': {
        name: 'family woman, woman, boy, boy',
        slug: 'family_woman_woman_boy_boy',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👩‍👩‍👧‍👧': {
        name: 'family woman, woman, girl, girl',
        slug: 'family_woman_woman_girl_girl',
        group: 'People & Body',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '👨‍👦': {
        name: 'family man, boy',
        slug: 'family_man_boy',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👨‍👦‍👦': {
        name: 'family man, boy, boy',
        slug: 'family_man_boy_boy',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👨‍👧': {
        name: 'family man, girl',
        slug: 'family_man_girl',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👨‍👧‍👦': {
        name: 'family man, girl, boy',
        slug: 'family_man_girl_boy',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👨‍👧‍👧': {
        name: 'family man, girl, girl',
        slug: 'family_man_girl_girl',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👩‍👦': {
        name: 'family woman, boy',
        slug: 'family_woman_boy',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👩‍👦‍👦': {
        name: 'family woman, boy, boy',
        slug: 'family_woman_boy_boy',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👩‍👧': {
        name: 'family woman, girl',
        slug: 'family_woman_girl',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👩‍👧‍👦': {
        name: 'family woman, girl, boy',
        slug: 'family_woman_girl_boy',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '👩‍👧‍👧': {
        name: 'family woman, girl, girl',
        slug: 'family_woman_girl_girl',
        group: 'People & Body',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '🗣️': {
        name: 'speaking head',
        slug: 'speaking_head',
        group: 'People & Body',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '👤': {
        name: 'bust in silhouette',
        slug: 'bust_in_silhouette',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👥': {
        name: 'busts in silhouette',
        slug: 'busts_in_silhouette',
        group: 'People & Body',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🫂': {
        name: 'people hugging',
        slug: 'people_hugging',
        group: 'People & Body',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '👪': {
        name: 'family',
        slug: 'family',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧑‍🧑‍🧒': {
        name: 'family adult, adult, child',
        slug: 'family_adult_adult_child',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '🧑‍🧑‍🧒‍🧒': {
        name: 'family adult, adult, child, child',
        slug: 'family_adult_adult_child_child',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '🧑‍🧒': {
        name: 'family adult, child',
        slug: 'family_adult_child',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '🧑‍🧒‍🧒': {
        name: 'family adult, child, child',
        slug: 'family_adult_child_child',
        group: 'People & Body',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '👣': {
        name: 'footprints',
        slug: 'footprints',
        group: 'People & Body',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐵': {
        name: 'monkey face',
        slug: 'monkey_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐒': {
        name: 'monkey',
        slug: 'monkey',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦍': {
        name: 'gorilla',
        slug: 'gorilla',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦧': {
        name: 'orangutan',
        slug: 'orangutan',
        group: 'Animals & Nature',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🐶': {
        name: 'dog face',
        slug: 'dog_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐕': {
        name: 'dog',
        slug: 'dog',
        group: 'Animals & Nature',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🦮': {
        name: 'guide dog',
        slug: 'guide_dog',
        group: 'Animals & Nature',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🐕‍🦺': {
        name: 'service dog',
        slug: 'service_dog',
        group: 'Animals & Nature',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🐩': {
        name: 'poodle',
        slug: 'poodle',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐺': {
        name: 'wolf',
        slug: 'wolf',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦊': {
        name: 'fox',
        slug: 'fox',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦝': {
        name: 'raccoon',
        slug: 'raccoon',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🐱': {
        name: 'cat face',
        slug: 'cat_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐈': {
        name: 'cat',
        slug: 'cat',
        group: 'Animals & Nature',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🐈‍⬛': {
        name: 'black cat',
        slug: 'black_cat',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🦁': {
        name: 'lion',
        slug: 'lion',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐯': {
        name: 'tiger face',
        slug: 'tiger_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐅': {
        name: 'tiger',
        slug: 'tiger',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐆': {
        name: 'leopard',
        slug: 'leopard',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐴': {
        name: 'horse face',
        slug: 'horse_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫎': {
        name: 'moose',
        slug: 'moose',
        group: 'Animals & Nature',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🫏': {
        name: 'donkey',
        slug: 'donkey',
        group: 'Animals & Nature',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🐎': {
        name: 'horse',
        slug: 'horse',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦄': {
        name: 'unicorn',
        slug: 'unicorn',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🦓': {
        name: 'zebra',
        slug: 'zebra',
        group: 'Animals & Nature',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🦌': {
        name: 'deer',
        slug: 'deer',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦬': {
        name: 'bison',
        slug: 'bison',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🐮': {
        name: 'cow face',
        slug: 'cow_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐂': {
        name: 'ox',
        slug: 'ox',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐃': {
        name: 'water buffalo',
        slug: 'water_buffalo',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐄': {
        name: 'cow',
        slug: 'cow',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐷': {
        name: 'pig face',
        slug: 'pig_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐖': {
        name: 'pig',
        slug: 'pig',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐗': {
        name: 'boar',
        slug: 'boar',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐽': {
        name: 'pig nose',
        slug: 'pig_nose',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐏': {
        name: 'ram',
        slug: 'ram',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐑': {
        name: 'ewe',
        slug: 'ewe',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐐': {
        name: 'goat',
        slug: 'goat',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐪': {
        name: 'camel',
        slug: 'camel',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐫': {
        name: 'two-hump camel',
        slug: 'two_hump_camel',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦙': {
        name: 'llama',
        slug: 'llama',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🦒': {
        name: 'giraffe',
        slug: 'giraffe',
        group: 'Animals & Nature',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🐘': {
        name: 'elephant',
        slug: 'elephant',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦣': {
        name: 'mammoth',
        slug: 'mammoth',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🦏': {
        name: 'rhinoceros',
        slug: 'rhinoceros',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦛': {
        name: 'hippopotamus',
        slug: 'hippopotamus',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🐭': {
        name: 'mouse face',
        slug: 'mouse_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐁': {
        name: 'mouse',
        slug: 'mouse',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐀': {
        name: 'rat',
        slug: 'rat',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐹': {
        name: 'hamster',
        slug: 'hamster',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐰': {
        name: 'rabbit face',
        slug: 'rabbit_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐇': {
        name: 'rabbit',
        slug: 'rabbit',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐿️': {
        name: 'chipmunk',
        slug: 'chipmunk',
        group: 'Animals & Nature',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🦫': {
        name: 'beaver',
        slug: 'beaver',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🦔': {
        name: 'hedgehog',
        slug: 'hedgehog',
        group: 'Animals & Nature',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🦇': {
        name: 'bat',
        slug: 'bat',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🐻': {
        name: 'bear',
        slug: 'bear',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐻‍❄️': {
        name: 'polar bear',
        slug: 'polar_bear',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🐨': {
        name: 'koala',
        slug: 'koala',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐼': {
        name: 'panda',
        slug: 'panda',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦥': {
        name: 'sloth',
        slug: 'sloth',
        group: 'Animals & Nature',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🦦': {
        name: 'otter',
        slug: 'otter',
        group: 'Animals & Nature',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🦨': {
        name: 'skunk',
        slug: 'skunk',
        group: 'Animals & Nature',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🦘': {
        name: 'kangaroo',
        slug: 'kangaroo',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🦡': {
        name: 'badger',
        slug: 'badger',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🐾': {
        name: 'paw prints',
        slug: 'paw_prints',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦃': {
        name: 'turkey',
        slug: 'turkey',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐔': {
        name: 'chicken',
        slug: 'chicken',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐓': {
        name: 'rooster',
        slug: 'rooster',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐣': {
        name: 'hatching chick',
        slug: 'hatching_chick',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐤': {
        name: 'baby chick',
        slug: 'baby_chick',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐥': {
        name: 'front-facing baby chick',
        slug: 'front_facing_baby_chick',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐦': {
        name: 'bird',
        slug: 'bird',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐧': {
        name: 'penguin',
        slug: 'penguin',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕊️': {
        name: 'dove',
        slug: 'dove',
        group: 'Animals & Nature',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🦅': {
        name: 'eagle',
        slug: 'eagle',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦆': {
        name: 'duck',
        slug: 'duck',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦢': {
        name: 'swan',
        slug: 'swan',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🦉': {
        name: 'owl',
        slug: 'owl',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦤': {
        name: 'dodo',
        slug: 'dodo',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪶': {
        name: 'feather',
        slug: 'feather',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🦩': {
        name: 'flamingo',
        slug: 'flamingo',
        group: 'Animals & Nature',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🦚': {
        name: 'peacock',
        slug: 'peacock',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🦜': {
        name: 'parrot',
        slug: 'parrot',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪽': {
        name: 'wing',
        slug: 'wing',
        group: 'Animals & Nature',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🐦‍⬛': {
        name: 'black bird',
        slug: 'black_bird',
        group: 'Animals & Nature',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🪿': {
        name: 'goose',
        slug: 'goose',
        group: 'Animals & Nature',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🐦‍🔥': {
        name: 'phoenix',
        slug: 'phoenix',
        group: 'Animals & Nature',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '🐸': {
        name: 'frog',
        slug: 'frog',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐊': {
        name: 'crocodile',
        slug: 'crocodile',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐢': {
        name: 'turtle',
        slug: 'turtle',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦎': {
        name: 'lizard',
        slug: 'lizard',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🐍': {
        name: 'snake',
        slug: 'snake',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐲': {
        name: 'dragon face',
        slug: 'dragon_face',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐉': {
        name: 'dragon',
        slug: 'dragon',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🦕': {
        name: 'sauropod',
        slug: 'sauropod',
        group: 'Animals & Nature',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🦖': {
        name: 'T-Rex',
        slug: 't_rex',
        group: 'Animals & Nature',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🐳': {
        name: 'spouting whale',
        slug: 'spouting_whale',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐋': {
        name: 'whale',
        slug: 'whale',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🐬': {
        name: 'dolphin',
        slug: 'dolphin',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦭': {
        name: 'seal',
        slug: 'seal',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🐟': {
        name: 'fish',
        slug: 'fish',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐠': {
        name: 'tropical fish',
        slug: 'tropical_fish',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐡': {
        name: 'blowfish',
        slug: 'blowfish',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦈': {
        name: 'shark',
        slug: 'shark',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🐙': {
        name: 'octopus',
        slug: 'octopus',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐚': {
        name: 'spiral shell',
        slug: 'spiral_shell',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪸': {
        name: 'coral',
        slug: 'coral',
        group: 'Animals & Nature',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🪼': {
        name: 'jellyfish',
        slug: 'jellyfish',
        group: 'Animals & Nature',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🐌': {
        name: 'snail',
        slug: 'snail',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦋': {
        name: 'butterfly',
        slug: 'butterfly',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🐛': {
        name: 'bug',
        slug: 'bug',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐜': {
        name: 'ant',
        slug: 'ant',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🐝': {
        name: 'honeybee',
        slug: 'honeybee',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪲': {
        name: 'beetle',
        slug: 'beetle',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🐞': {
        name: 'lady beetle',
        slug: 'lady_beetle',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🦗': {
        name: 'cricket',
        slug: 'cricket',
        group: 'Animals & Nature',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🪳': {
        name: 'cockroach',
        slug: 'cockroach',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🕷️': {
        name: 'spider',
        slug: 'spider',
        group: 'Animals & Nature',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕸️': {
        name: 'spider web',
        slug: 'spider_web',
        group: 'Animals & Nature',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🦂': {
        name: 'scorpion',
        slug: 'scorpion',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🦟': {
        name: 'mosquito',
        slug: 'mosquito',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪰': {
        name: 'fly',
        slug: 'fly',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪱': {
        name: 'worm',
        slug: 'worm',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🦠': {
        name: 'microbe',
        slug: 'microbe',
        group: 'Animals & Nature',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '💐': {
        name: 'bouquet',
        slug: 'bouquet',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌸': {
        name: 'cherry blossom',
        slug: 'cherry_blossom',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💮': {
        name: 'white flower',
        slug: 'white_flower',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪷': {
        name: 'lotus',
        slug: 'lotus',
        group: 'Animals & Nature',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🏵️': {
        name: 'rosette',
        slug: 'rosette',
        group: 'Animals & Nature',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌹': {
        name: 'rose',
        slug: 'rose',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥀': {
        name: 'wilted flower',
        slug: 'wilted_flower',
        group: 'Animals & Nature',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🌺': {
        name: 'hibiscus',
        slug: 'hibiscus',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌻': {
        name: 'sunflower',
        slug: 'sunflower',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌼': {
        name: 'blossom',
        slug: 'blossom',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌷': {
        name: 'tulip',
        slug: 'tulip',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪻': {
        name: 'hyacinth',
        slug: 'hyacinth',
        group: 'Animals & Nature',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🌱': {
        name: 'seedling',
        slug: 'seedling',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪴': {
        name: 'potted plant',
        slug: 'potted_plant',
        group: 'Animals & Nature',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🌲': {
        name: 'evergreen tree',
        slug: 'evergreen_tree',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌳': {
        name: 'deciduous tree',
        slug: 'deciduous_tree',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌴': {
        name: 'palm tree',
        slug: 'palm_tree',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌵': {
        name: 'cactus',
        slug: 'cactus',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌾': {
        name: 'sheaf of rice',
        slug: 'sheaf_of_rice',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌿': {
        name: 'herb',
        slug: 'herb',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☘️': {
        name: 'shamrock',
        slug: 'shamrock',
        group: 'Animals & Nature',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🍀': {
        name: 'four leaf clover',
        slug: 'four_leaf_clover',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍁': {
        name: 'maple leaf',
        slug: 'maple_leaf',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍂': {
        name: 'fallen leaf',
        slug: 'fallen_leaf',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍃': {
        name: 'leaf fluttering in wind',
        slug: 'leaf_fluttering_in_wind',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪹': {
        name: 'empty nest',
        slug: 'empty_nest',
        group: 'Animals & Nature',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🪺': {
        name: 'nest with eggs',
        slug: 'nest_with_eggs',
        group: 'Animals & Nature',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🍄': {
        name: 'mushroom',
        slug: 'mushroom',
        group: 'Animals & Nature',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍇': {
        name: 'grapes',
        slug: 'grapes',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍈': {
        name: 'melon',
        slug: 'melon',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍉': {
        name: 'watermelon',
        slug: 'watermelon',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍊': {
        name: 'tangerine',
        slug: 'tangerine',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍋': {
        name: 'lemon',
        slug: 'lemon',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🍋‍🟩': {
        name: 'lime',
        slug: 'lime',
        group: 'Food & Drink',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '🍌': {
        name: 'banana',
        slug: 'banana',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍍': {
        name: 'pineapple',
        slug: 'pineapple',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥭': {
        name: 'mango',
        slug: 'mango',
        group: 'Food & Drink',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🍎': {
        name: 'red apple',
        slug: 'red_apple',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍏': {
        name: 'green apple',
        slug: 'green_apple',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍐': {
        name: 'pear',
        slug: 'pear',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🍑': {
        name: 'peach',
        slug: 'peach',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍒': {
        name: 'cherries',
        slug: 'cherries',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍓': {
        name: 'strawberry',
        slug: 'strawberry',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫐': {
        name: 'blueberries',
        slug: 'blueberries',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🥝': {
        name: 'kiwi fruit',
        slug: 'kiwi_fruit',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🍅': {
        name: 'tomato',
        slug: 'tomato',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫒': {
        name: 'olive',
        slug: 'olive',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🥥': {
        name: 'coconut',
        slug: 'coconut',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🥑': {
        name: 'avocado',
        slug: 'avocado',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🍆': {
        name: 'eggplant',
        slug: 'eggplant',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥔': {
        name: 'potato',
        slug: 'potato',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥕': {
        name: 'carrot',
        slug: 'carrot',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🌽': {
        name: 'ear of corn',
        slug: 'ear_of_corn',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌶️': {
        name: 'hot pepper',
        slug: 'hot_pepper',
        group: 'Food & Drink',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🫑': {
        name: 'bell pepper',
        slug: 'bell_pepper',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🥒': {
        name: 'cucumber',
        slug: 'cucumber',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥬': {
        name: 'leafy green',
        slug: 'leafy_green',
        group: 'Food & Drink',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥦': {
        name: 'broccoli',
        slug: 'broccoli',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧄': {
        name: 'garlic',
        slug: 'garlic',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🧅': {
        name: 'onion',
        slug: 'onion',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🥜': {
        name: 'peanuts',
        slug: 'peanuts',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🫘': {
        name: 'beans',
        slug: 'beans',
        group: 'Food & Drink',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🌰': {
        name: 'chestnut',
        slug: 'chestnut',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫚': {
        name: 'ginger root',
        slug: 'ginger_root',
        group: 'Food & Drink',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🫛': {
        name: 'pea pod',
        slug: 'pea_pod',
        group: 'Food & Drink',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🍄‍🟫': {
        name: 'brown mushroom',
        slug: 'brown_mushroom',
        group: 'Food & Drink',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '🍞': {
        name: 'bread',
        slug: 'bread',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥐': {
        name: 'croissant',
        slug: 'croissant',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥖': {
        name: 'baguette bread',
        slug: 'baguette_bread',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🫓': {
        name: 'flatbread',
        slug: 'flatbread',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🥨': {
        name: 'pretzel',
        slug: 'pretzel',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🥯': {
        name: 'bagel',
        slug: 'bagel',
        group: 'Food & Drink',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥞': {
        name: 'pancakes',
        slug: 'pancakes',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🧇': {
        name: 'waffle',
        slug: 'waffle',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🧀': {
        name: 'cheese wedge',
        slug: 'cheese_wedge',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🍖': {
        name: 'meat on bone',
        slug: 'meat_on_bone',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍗': {
        name: 'poultry leg',
        slug: 'poultry_leg',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥩': {
        name: 'cut of meat',
        slug: 'cut_of_meat',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🥓': {
        name: 'bacon',
        slug: 'bacon',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🍔': {
        name: 'hamburger',
        slug: 'hamburger',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍟': {
        name: 'french fries',
        slug: 'french_fries',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍕': {
        name: 'pizza',
        slug: 'pizza',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌭': {
        name: 'hot dog',
        slug: 'hot_dog',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🥪': {
        name: 'sandwich',
        slug: 'sandwich',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🌮': {
        name: 'taco',
        slug: 'taco',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌯': {
        name: 'burrito',
        slug: 'burrito',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🫔': {
        name: 'tamale',
        slug: 'tamale',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🥙': {
        name: 'stuffed flatbread',
        slug: 'stuffed_flatbread',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🧆': {
        name: 'falafel',
        slug: 'falafel',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🥚': {
        name: 'egg',
        slug: 'egg',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🍳': {
        name: 'cooking',
        slug: 'cooking',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥘': {
        name: 'shallow pan of food',
        slug: 'shallow_pan_of_food',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🍲': {
        name: 'pot of food',
        slug: 'pot_of_food',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫕': {
        name: 'fondue',
        slug: 'fondue',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🥣': {
        name: 'bowl with spoon',
        slug: 'bowl_with_spoon',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🥗': {
        name: 'green salad',
        slug: 'green_salad',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🍿': {
        name: 'popcorn',
        slug: 'popcorn',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🧈': {
        name: 'butter',
        slug: 'butter',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🧂': {
        name: 'salt',
        slug: 'salt',
        group: 'Food & Drink',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥫': {
        name: 'canned food',
        slug: 'canned_food',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🍱': {
        name: 'bento box',
        slug: 'bento_box',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍘': {
        name: 'rice cracker',
        slug: 'rice_cracker',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍙': {
        name: 'rice ball',
        slug: 'rice_ball',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍚': {
        name: 'cooked rice',
        slug: 'cooked_rice',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍛': {
        name: 'curry rice',
        slug: 'curry_rice',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍜': {
        name: 'steaming bowl',
        slug: 'steaming_bowl',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍝': {
        name: 'spaghetti',
        slug: 'spaghetti',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍠': {
        name: 'roasted sweet potato',
        slug: 'roasted_sweet_potato',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍢': {
        name: 'oden',
        slug: 'oden',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍣': {
        name: 'sushi',
        slug: 'sushi',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍤': {
        name: 'fried shrimp',
        slug: 'fried_shrimp',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍥': {
        name: 'fish cake with swirl',
        slug: 'fish_cake_with_swirl',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥮': {
        name: 'moon cake',
        slug: 'moon_cake',
        group: 'Food & Drink',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🍡': {
        name: 'dango',
        slug: 'dango',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥟': {
        name: 'dumpling',
        slug: 'dumpling',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🥠': {
        name: 'fortune cookie',
        slug: 'fortune_cookie',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🥡': {
        name: 'takeout box',
        slug: 'takeout_box',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🦀': {
        name: 'crab',
        slug: 'crab',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🦞': {
        name: 'lobster',
        slug: 'lobster',
        group: 'Food & Drink',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🦐': {
        name: 'shrimp',
        slug: 'shrimp',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦑': {
        name: 'squid',
        slug: 'squid',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦪': {
        name: 'oyster',
        slug: 'oyster',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🍦': {
        name: 'soft ice cream',
        slug: 'soft_ice_cream',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍧': {
        name: 'shaved ice',
        slug: 'shaved_ice',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍨': {
        name: 'ice cream',
        slug: 'ice_cream',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍩': {
        name: 'doughnut',
        slug: 'doughnut',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍪': {
        name: 'cookie',
        slug: 'cookie',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎂': {
        name: 'birthday cake',
        slug: 'birthday_cake',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍰': {
        name: 'shortcake',
        slug: 'shortcake',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧁': {
        name: 'cupcake',
        slug: 'cupcake',
        group: 'Food & Drink',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥧': {
        name: 'pie',
        slug: 'pie',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🍫': {
        name: 'chocolate bar',
        slug: 'chocolate_bar',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍬': {
        name: 'candy',
        slug: 'candy',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍭': {
        name: 'lollipop',
        slug: 'lollipop',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍮': {
        name: 'custard',
        slug: 'custard',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍯': {
        name: 'honey pot',
        slug: 'honey_pot',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍼': {
        name: 'baby bottle',
        slug: 'baby_bottle',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🥛': {
        name: 'glass of milk',
        slug: 'glass_of_milk',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '☕': {
        name: 'hot beverage',
        slug: 'hot_beverage',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫖': {
        name: 'teapot',
        slug: 'teapot',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🍵': {
        name: 'teacup without handle',
        slug: 'teacup_without_handle',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍶': {
        name: 'sake',
        slug: 'sake',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍾': {
        name: 'bottle with popping cork',
        slug: 'bottle_with_popping_cork',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🍷': {
        name: 'wine glass',
        slug: 'wine_glass',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍸': {
        name: 'cocktail glass',
        slug: 'cocktail_glass',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍹': {
        name: 'tropical drink',
        slug: 'tropical_drink',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍺': {
        name: 'beer mug',
        slug: 'beer_mug',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🍻': {
        name: 'clinking beer mugs',
        slug: 'clinking_beer_mugs',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥂': {
        name: 'clinking glasses',
        slug: 'clinking_glasses',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥃': {
        name: 'tumbler glass',
        slug: 'tumbler_glass',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🫗': {
        name: 'pouring liquid',
        slug: 'pouring_liquid',
        group: 'Food & Drink',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🥤': {
        name: 'cup with straw',
        slug: 'cup_with_straw',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧋': {
        name: 'bubble tea',
        slug: 'bubble_tea',
        group: 'Food & Drink',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🧃': {
        name: 'beverage box',
        slug: 'beverage_box',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🧉': {
        name: 'mate',
        slug: 'mate',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🧊': {
        name: 'ice',
        slug: 'ice',
        group: 'Food & Drink',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🥢': {
        name: 'chopsticks',
        slug: 'chopsticks',
        group: 'Food & Drink',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🍽️': {
        name: 'fork and knife with plate',
        slug: 'fork_and_knife_with_plate',
        group: 'Food & Drink',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🍴': {
        name: 'fork and knife',
        slug: 'fork_and_knife',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥄': {
        name: 'spoon',
        slug: 'spoon',
        group: 'Food & Drink',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🔪': {
        name: 'kitchen knife',
        slug: 'kitchen_knife',
        group: 'Food & Drink',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🫙': {
        name: 'jar',
        slug: 'jar',
        group: 'Food & Drink',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🏺': {
        name: 'amphora',
        slug: 'amphora',
        group: 'Food & Drink',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌍': {
        name: 'globe showing Europe-Africa',
        slug: 'globe_showing_europe_africa',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌎': {
        name: 'globe showing Americas',
        slug: 'globe_showing_americas',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌏': {
        name: 'globe showing Asia-Australia',
        slug: 'globe_showing_asia_australia',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌐': {
        name: 'globe with meridians',
        slug: 'globe_with_meridians',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🗺️': {
        name: 'world map',
        slug: 'world_map',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🗾': {
        name: 'map of Japan',
        slug: 'map_of_japan',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧭': {
        name: 'compass',
        slug: 'compass',
        group: 'Travel & Places',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🏔️': {
        name: 'snow-capped mountain',
        slug: 'snow_capped_mountain',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⛰️': {
        name: 'mountain',
        slug: 'mountain',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌋': {
        name: 'volcano',
        slug: 'volcano',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗻': {
        name: 'mount fuji',
        slug: 'mount_fuji',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏕️': {
        name: 'camping',
        slug: 'camping',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏖️': {
        name: 'beach with umbrella',
        slug: 'beach_with_umbrella',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏜️': {
        name: 'desert',
        slug: 'desert',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏝️': {
        name: 'desert island',
        slug: 'desert_island',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏞️': {
        name: 'national park',
        slug: 'national_park',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏟️': {
        name: 'stadium',
        slug: 'stadium',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏛️': {
        name: 'classical building',
        slug: 'classical_building',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏗️': {
        name: 'building construction',
        slug: 'building_construction',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🧱': {
        name: 'brick',
        slug: 'brick',
        group: 'Travel & Places',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪨': {
        name: 'rock',
        slug: 'rock',
        group: 'Travel & Places',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪵': {
        name: 'wood',
        slug: 'wood',
        group: 'Travel & Places',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🛖': {
        name: 'hut',
        slug: 'hut',
        group: 'Travel & Places',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🏘️': {
        name: 'houses',
        slug: 'houses',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏚️': {
        name: 'derelict house',
        slug: 'derelict_house',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏠': {
        name: 'house',
        slug: 'house',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏡': {
        name: 'house with garden',
        slug: 'house_with_garden',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏢': {
        name: 'office building',
        slug: 'office_building',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏣': {
        name: 'Japanese post office',
        slug: 'japanese_post_office',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏤': {
        name: 'post office',
        slug: 'post_office',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🏥': {
        name: 'hospital',
        slug: 'hospital',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏦': {
        name: 'bank',
        slug: 'bank',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏨': {
        name: 'hotel',
        slug: 'hotel',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏩': {
        name: 'love hotel',
        slug: 'love_hotel',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏪': {
        name: 'convenience store',
        slug: 'convenience_store',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏫': {
        name: 'school',
        slug: 'school',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏬': {
        name: 'department store',
        slug: 'department_store',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏭': {
        name: 'factory',
        slug: 'factory',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏯': {
        name: 'Japanese castle',
        slug: 'japanese_castle',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏰': {
        name: 'castle',
        slug: 'castle',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💒': {
        name: 'wedding',
        slug: 'wedding',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗼': {
        name: 'Tokyo tower',
        slug: 'tokyo_tower',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗽': {
        name: 'Statue of Liberty',
        slug: 'statue_of_liberty',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛪': {
        name: 'church',
        slug: 'church',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕌': {
        name: 'mosque',
        slug: 'mosque',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛕': {
        name: 'hindu temple',
        slug: 'hindu_temple',
        group: 'Travel & Places',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🕍': {
        name: 'synagogue',
        slug: 'synagogue',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '⛩️': {
        name: 'shinto shrine',
        slug: 'shinto_shrine',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕋': {
        name: 'kaaba',
        slug: 'kaaba',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '⛲': {
        name: 'fountain',
        slug: 'fountain',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛺': {
        name: 'tent',
        slug: 'tent',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌁': {
        name: 'foggy',
        slug: 'foggy',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌃': {
        name: 'night with stars',
        slug: 'night_with_stars',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏙️': {
        name: 'cityscape',
        slug: 'cityscape',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌄': {
        name: 'sunrise over mountains',
        slug: 'sunrise_over_mountains',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌅': {
        name: 'sunrise',
        slug: 'sunrise',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌆': {
        name: 'cityscape at dusk',
        slug: 'cityscape_at_dusk',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌇': {
        name: 'sunset',
        slug: 'sunset',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌉': {
        name: 'bridge at night',
        slug: 'bridge_at_night',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♨️': {
        name: 'hot springs',
        slug: 'hot_springs',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎠': {
        name: 'carousel horse',
        slug: 'carousel_horse',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛝': {
        name: 'playground slide',
        slug: 'playground_slide',
        group: 'Travel & Places',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🎡': {
        name: 'ferris wheel',
        slug: 'ferris_wheel',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎢': {
        name: 'roller coaster',
        slug: 'roller_coaster',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💈': {
        name: 'barber pole',
        slug: 'barber_pole',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎪': {
        name: 'circus tent',
        slug: 'circus_tent',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚂': {
        name: 'locomotive',
        slug: 'locomotive',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚃': {
        name: 'railway car',
        slug: 'railway_car',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚄': {
        name: 'high-speed train',
        slug: 'high_speed_train',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚅': {
        name: 'bullet train',
        slug: 'bullet_train',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚆': {
        name: 'train',
        slug: 'train',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚇': {
        name: 'metro',
        slug: 'metro',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚈': {
        name: 'light rail',
        slug: 'light_rail',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚉': {
        name: 'station',
        slug: 'station',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚊': {
        name: 'tram',
        slug: 'tram',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚝': {
        name: 'monorail',
        slug: 'monorail',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚞': {
        name: 'mountain railway',
        slug: 'mountain_railway',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚋': {
        name: 'tram car',
        slug: 'tram_car',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚌': {
        name: 'bus',
        slug: 'bus',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚍': {
        name: 'oncoming bus',
        slug: 'oncoming_bus',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🚎': {
        name: 'trolleybus',
        slug: 'trolleybus',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚐': {
        name: 'minibus',
        slug: 'minibus',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚑': {
        name: 'ambulance',
        slug: 'ambulance',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚒': {
        name: 'fire engine',
        slug: 'fire_engine',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚓': {
        name: 'police car',
        slug: 'police_car',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚔': {
        name: 'oncoming police car',
        slug: 'oncoming_police_car',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🚕': {
        name: 'taxi',
        slug: 'taxi',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚖': {
        name: 'oncoming taxi',
        slug: 'oncoming_taxi',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚗': {
        name: 'automobile',
        slug: 'automobile',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚘': {
        name: 'oncoming automobile',
        slug: 'oncoming_automobile',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🚙': {
        name: 'sport utility vehicle',
        slug: 'sport_utility_vehicle',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛻': {
        name: 'pickup truck',
        slug: 'pickup_truck',
        group: 'Travel & Places',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🚚': {
        name: 'delivery truck',
        slug: 'delivery_truck',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚛': {
        name: 'articulated lorry',
        slug: 'articulated_lorry',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚜': {
        name: 'tractor',
        slug: 'tractor',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🏎️': {
        name: 'racing car',
        slug: 'racing_car',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏍️': {
        name: 'motorcycle',
        slug: 'motorcycle',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🛵': {
        name: 'motor scooter',
        slug: 'motor_scooter',
        group: 'Travel & Places',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🦽': {
        name: 'manual wheelchair',
        slug: 'manual_wheelchair',
        group: 'Travel & Places',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🦼': {
        name: 'motorized wheelchair',
        slug: 'motorized_wheelchair',
        group: 'Travel & Places',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🛺': {
        name: 'auto rickshaw',
        slug: 'auto_rickshaw',
        group: 'Travel & Places',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🚲': {
        name: 'bicycle',
        slug: 'bicycle',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛴': {
        name: 'kick scooter',
        slug: 'kick_scooter',
        group: 'Travel & Places',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🛹': {
        name: 'skateboard',
        slug: 'skateboard',
        group: 'Travel & Places',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🛼': {
        name: 'roller skate',
        slug: 'roller_skate',
        group: 'Travel & Places',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🚏': {
        name: 'bus stop',
        slug: 'bus_stop',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛣️': {
        name: 'motorway',
        slug: 'motorway',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🛤️': {
        name: 'railway track',
        slug: 'railway_track',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🛢️': {
        name: 'oil drum',
        slug: 'oil_drum',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⛽': {
        name: 'fuel pump',
        slug: 'fuel_pump',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛞': {
        name: 'wheel',
        slug: 'wheel',
        group: 'Travel & Places',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🚨': {
        name: 'police car light',
        slug: 'police_car_light',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚥': {
        name: 'horizontal traffic light',
        slug: 'horizontal_traffic_light',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚦': {
        name: 'vertical traffic light',
        slug: 'vertical_traffic_light',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛑': {
        name: 'stop sign',
        slug: 'stop_sign',
        group: 'Travel & Places',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🚧': {
        name: 'construction',
        slug: 'construction',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⚓': {
        name: 'anchor',
        slug: 'anchor',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛟': {
        name: 'ring buoy',
        slug: 'ring_buoy',
        group: 'Travel & Places',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '⛵': {
        name: 'sailboat',
        slug: 'sailboat',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛶': {
        name: 'canoe',
        slug: 'canoe',
        group: 'Travel & Places',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🚤': {
        name: 'speedboat',
        slug: 'speedboat',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛳️': {
        name: 'passenger ship',
        slug: 'passenger_ship',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⛴️': {
        name: 'ferry',
        slug: 'ferry',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🛥️': {
        name: 'motor boat',
        slug: 'motor_boat',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🚢': {
        name: 'ship',
        slug: 'ship',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✈️': {
        name: 'airplane',
        slug: 'airplane',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛩️': {
        name: 'small airplane',
        slug: 'small_airplane',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🛫': {
        name: 'airplane departure',
        slug: 'airplane_departure',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛬': {
        name: 'airplane arrival',
        slug: 'airplane_arrival',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🪂': {
        name: 'parachute',
        slug: 'parachute',
        group: 'Travel & Places',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '💺': {
        name: 'seat',
        slug: 'seat',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚁': {
        name: 'helicopter',
        slug: 'helicopter',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚟': {
        name: 'suspension railway',
        slug: 'suspension_railway',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚠': {
        name: 'mountain cableway',
        slug: 'mountain_cableway',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚡': {
        name: 'aerial tramway',
        slug: 'aerial_tramway',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛰️': {
        name: 'satellite',
        slug: 'satellite',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🚀': {
        name: 'rocket',
        slug: 'rocket',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛸': {
        name: 'flying saucer',
        slug: 'flying_saucer',
        group: 'Travel & Places',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🛎️': {
        name: 'bellhop bell',
        slug: 'bellhop_bell',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🧳': {
        name: 'luggage',
        slug: 'luggage',
        group: 'Travel & Places',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '⌛': {
        name: 'hourglass done',
        slug: 'hourglass_done',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏳': {
        name: 'hourglass not done',
        slug: 'hourglass_not_done',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⌚': {
        name: 'watch',
        slug: 'watch',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏰': {
        name: 'alarm clock',
        slug: 'alarm_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏱️': {
        name: 'stopwatch',
        slug: 'stopwatch',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '⏲️': {
        name: 'timer clock',
        slug: 'timer_clock',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🕰️': {
        name: 'mantelpiece clock',
        slug: 'mantelpiece_clock',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕛': {
        name: 'twelve o’clock',
        slug: 'twelve_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕧': {
        name: 'twelve-thirty',
        slug: 'twelve_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕐': {
        name: 'one o’clock',
        slug: 'one_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕜': {
        name: 'one-thirty',
        slug: 'one_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕑': {
        name: 'two o’clock',
        slug: 'two_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕝': {
        name: 'two-thirty',
        slug: 'two_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕒': {
        name: 'three o’clock',
        slug: 'three_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕞': {
        name: 'three-thirty',
        slug: 'three_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕓': {
        name: 'four o’clock',
        slug: 'four_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕟': {
        name: 'four-thirty',
        slug: 'four_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕔': {
        name: 'five o’clock',
        slug: 'five_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕠': {
        name: 'five-thirty',
        slug: 'five_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕕': {
        name: 'six o’clock',
        slug: 'six_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕡': {
        name: 'six-thirty',
        slug: 'six_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕖': {
        name: 'seven o’clock',
        slug: 'seven_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕢': {
        name: 'seven-thirty',
        slug: 'seven_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕗': {
        name: 'eight o’clock',
        slug: 'eight_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕣': {
        name: 'eight-thirty',
        slug: 'eight_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕘': {
        name: 'nine o’clock',
        slug: 'nine_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕤': {
        name: 'nine-thirty',
        slug: 'nine_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕙': {
        name: 'ten o’clock',
        slug: 'ten_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕥': {
        name: 'ten-thirty',
        slug: 'ten_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🕚': {
        name: 'eleven o’clock',
        slug: 'eleven_o_clock',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕦': {
        name: 'eleven-thirty',
        slug: 'eleven_thirty',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌑': {
        name: 'new moon',
        slug: 'new_moon',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌒': {
        name: 'waxing crescent moon',
        slug: 'waxing_crescent_moon',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌓': {
        name: 'first quarter moon',
        slug: 'first_quarter_moon',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌔': {
        name: 'waxing gibbous moon',
        slug: 'waxing_gibbous_moon',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌕': {
        name: 'full moon',
        slug: 'full_moon',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌖': {
        name: 'waning gibbous moon',
        slug: 'waning_gibbous_moon',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌗': {
        name: 'last quarter moon',
        slug: 'last_quarter_moon',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌘': {
        name: 'waning crescent moon',
        slug: 'waning_crescent_moon',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌙': {
        name: 'crescent moon',
        slug: 'crescent_moon',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌚': {
        name: 'new moon face',
        slug: 'new_moon_face',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌛': {
        name: 'first quarter moon face',
        slug: 'first_quarter_moon_face',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌜': {
        name: 'last quarter moon face',
        slug: 'last_quarter_moon_face',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌡️': {
        name: 'thermometer',
        slug: 'thermometer',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '☀️': {
        name: 'sun',
        slug: 'sun',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌝': {
        name: 'full moon face',
        slug: 'full_moon_face',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🌞': {
        name: 'sun with face',
        slug: 'sun_with_face',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🪐': {
        name: 'ringed planet',
        slug: 'ringed_planet',
        group: 'Travel & Places',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '⭐': {
        name: 'star',
        slug: 'star',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌟': {
        name: 'glowing star',
        slug: 'glowing_star',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌠': {
        name: 'shooting star',
        slug: 'shooting_star',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌌': {
        name: 'milky way',
        slug: 'milky_way',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☁️': {
        name: 'cloud',
        slug: 'cloud',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛅': {
        name: 'sun behind cloud',
        slug: 'sun_behind_cloud',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛈️': {
        name: 'cloud with lightning and rain',
        slug: 'cloud_with_lightning_and_rain',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌤️': {
        name: 'sun behind small cloud',
        slug: 'sun_behind_small_cloud',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌥️': {
        name: 'sun behind large cloud',
        slug: 'sun_behind_large_cloud',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌦️': {
        name: 'sun behind rain cloud',
        slug: 'sun_behind_rain_cloud',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌧️': {
        name: 'cloud with rain',
        slug: 'cloud_with_rain',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌨️': {
        name: 'cloud with snow',
        slug: 'cloud_with_snow',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌩️': {
        name: 'cloud with lightning',
        slug: 'cloud_with_lightning',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌪️': {
        name: 'tornado',
        slug: 'tornado',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌫️': {
        name: 'fog',
        slug: 'fog',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌬️': {
        name: 'wind face',
        slug: 'wind_face',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🌀': {
        name: 'cyclone',
        slug: 'cyclone',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌈': {
        name: 'rainbow',
        slug: 'rainbow',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌂': {
        name: 'closed umbrella',
        slug: 'closed_umbrella',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☂️': {
        name: 'umbrella',
        slug: 'umbrella',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '☔': {
        name: 'umbrella with rain drops',
        slug: 'umbrella_with_rain_drops',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛱️': {
        name: 'umbrella on ground',
        slug: 'umbrella_on_ground',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⚡': {
        name: 'high voltage',
        slug: 'high_voltage',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❄️': {
        name: 'snowflake',
        slug: 'snowflake',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☃️': {
        name: 'snowman',
        slug: 'snowman',
        group: 'Travel & Places',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⛄': {
        name: 'snowman without snow',
        slug: 'snowman_without_snow',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☄️': {
        name: 'comet',
        slug: 'comet',
        group: 'Travel & Places',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔥': {
        name: 'fire',
        slug: 'fire',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💧': {
        name: 'droplet',
        slug: 'droplet',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🌊': {
        name: 'water wave',
        slug: 'water_wave',
        group: 'Travel & Places',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎃': {
        name: 'jack-o-lantern',
        slug: 'jack_o_lantern',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎄': {
        name: 'Christmas tree',
        slug: 'christmas_tree',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎆': {
        name: 'fireworks',
        slug: 'fireworks',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎇': {
        name: 'sparkler',
        slug: 'sparkler',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧨': {
        name: 'firecracker',
        slug: 'firecracker',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '✨': {
        name: 'sparkles',
        slug: 'sparkles',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎈': {
        name: 'balloon',
        slug: 'balloon',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎉': {
        name: 'party popper',
        slug: 'party_popper',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎊': {
        name: 'confetti ball',
        slug: 'confetti_ball',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎋': {
        name: 'tanabata tree',
        slug: 'tanabata_tree',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎍': {
        name: 'pine decoration',
        slug: 'pine_decoration',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎎': {
        name: 'Japanese dolls',
        slug: 'japanese_dolls',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎏': {
        name: 'carp streamer',
        slug: 'carp_streamer',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎐': {
        name: 'wind chime',
        slug: 'wind_chime',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎑': {
        name: 'moon viewing ceremony',
        slug: 'moon_viewing_ceremony',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧧': {
        name: 'red envelope',
        slug: 'red_envelope',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🎀': {
        name: 'ribbon',
        slug: 'ribbon',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎁': {
        name: 'wrapped gift',
        slug: 'wrapped_gift',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎗️': {
        name: 'reminder ribbon',
        slug: 'reminder_ribbon',
        group: 'Activities',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎟️': {
        name: 'admission tickets',
        slug: 'admission_tickets',
        group: 'Activities',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎫': {
        name: 'ticket',
        slug: 'ticket',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎖️': {
        name: 'military medal',
        slug: 'military_medal',
        group: 'Activities',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏆': {
        name: 'trophy',
        slug: 'trophy',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏅': {
        name: 'sports medal',
        slug: 'sports_medal',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🥇': {
        name: '1st place medal',
        slug: '1st_place_medal',
        group: 'Activities',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥈': {
        name: '2nd place medal',
        slug: '2nd_place_medal',
        group: 'Activities',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥉': {
        name: '3rd place medal',
        slug: '3rd_place_medal',
        group: 'Activities',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '⚽': {
        name: 'soccer ball',
        slug: 'soccer_ball',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⚾': {
        name: 'baseball',
        slug: 'baseball',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥎': {
        name: 'softball',
        slug: 'softball',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🏀': {
        name: 'basketball',
        slug: 'basketball',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏐': {
        name: 'volleyball',
        slug: 'volleyball',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🏈': {
        name: 'american football',
        slug: 'american_football',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏉': {
        name: 'rugby football',
        slug: 'rugby_football',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🎾': {
        name: 'tennis',
        slug: 'tennis',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥏': {
        name: 'flying disc',
        slug: 'flying_disc',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🎳': {
        name: 'bowling',
        slug: 'bowling',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏏': {
        name: 'cricket game',
        slug: 'cricket_game',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🏑': {
        name: 'field hockey',
        slug: 'field_hockey',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🏒': {
        name: 'ice hockey',
        slug: 'ice_hockey',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🥍': {
        name: 'lacrosse',
        slug: 'lacrosse',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🏓': {
        name: 'ping pong',
        slug: 'ping_pong',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🏸': {
        name: 'badminton',
        slug: 'badminton',
        group: 'Activities',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🥊': {
        name: 'boxing glove',
        slug: 'boxing_glove',
        group: 'Activities',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥋': {
        name: 'martial arts uniform',
        slug: 'martial_arts_uniform',
        group: 'Activities',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🥅': {
        name: 'goal net',
        slug: 'goal_net',
        group: 'Activities',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '⛳': {
        name: 'flag in hole',
        slug: 'flag_in_hole',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛸️': {
        name: 'ice skate',
        slug: 'ice_skate',
        group: 'Activities',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎣': {
        name: 'fishing pole',
        slug: 'fishing_pole',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🤿': {
        name: 'diving mask',
        slug: 'diving_mask',
        group: 'Activities',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🎽': {
        name: 'running shirt',
        slug: 'running_shirt',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎿': {
        name: 'skis',
        slug: 'skis',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛷': {
        name: 'sled',
        slug: 'sled',
        group: 'Activities',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🥌': {
        name: 'curling stone',
        slug: 'curling_stone',
        group: 'Activities',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🎯': {
        name: 'bullseye',
        slug: 'bullseye',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪀': {
        name: 'yo-yo',
        slug: 'yo_yo',
        group: 'Activities',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🪁': {
        name: 'kite',
        slug: 'kite',
        group: 'Activities',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🔫': {
        name: 'water pistol',
        slug: 'water_pistol',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎱': {
        name: 'pool 8 ball',
        slug: 'pool_8_ball',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔮': {
        name: 'crystal ball',
        slug: 'crystal_ball',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪄': {
        name: 'magic wand',
        slug: 'magic_wand',
        group: 'Activities',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🎮': {
        name: 'video game',
        slug: 'video_game',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕹️': {
        name: 'joystick',
        slug: 'joystick',
        group: 'Activities',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎰': {
        name: 'slot machine',
        slug: 'slot_machine',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎲': {
        name: 'game die',
        slug: 'game_die',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧩': {
        name: 'puzzle piece',
        slug: 'puzzle_piece',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧸': {
        name: 'teddy bear',
        slug: 'teddy_bear',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪅': {
        name: 'piñata',
        slug: 'pinata',
        group: 'Activities',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪩': {
        name: 'mirror ball',
        slug: 'mirror_ball',
        group: 'Activities',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🪆': {
        name: 'nesting dolls',
        slug: 'nesting_dolls',
        group: 'Activities',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '♠️': {
        name: 'spade suit',
        slug: 'spade_suit',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♥️': {
        name: 'heart suit',
        slug: 'heart_suit',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♦️': {
        name: 'diamond suit',
        slug: 'diamond_suit',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♣️': {
        name: 'club suit',
        slug: 'club_suit',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♟️': {
        name: 'chess pawn',
        slug: 'chess_pawn',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🃏': {
        name: 'joker',
        slug: 'joker',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🀄': {
        name: 'mahjong red dragon',
        slug: 'mahjong_red_dragon',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎴': {
        name: 'flower playing cards',
        slug: 'flower_playing_cards',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎭': {
        name: 'performing arts',
        slug: 'performing_arts',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🖼️': {
        name: 'framed picture',
        slug: 'framed_picture',
        group: 'Activities',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎨': {
        name: 'artist palette',
        slug: 'artist_palette',
        group: 'Activities',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧵': {
        name: 'thread',
        slug: 'thread',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪡': {
        name: 'sewing needle',
        slug: 'sewing_needle',
        group: 'Activities',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🧶': {
        name: 'yarn',
        slug: 'yarn',
        group: 'Activities',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪢': {
        name: 'knot',
        slug: 'knot',
        group: 'Activities',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '👓': {
        name: 'glasses',
        slug: 'glasses',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕶️': {
        name: 'sunglasses',
        slug: 'sunglasses',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🥽': {
        name: 'goggles',
        slug: 'goggles',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥼': {
        name: 'lab coat',
        slug: 'lab_coat',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🦺': {
        name: 'safety vest',
        slug: 'safety_vest',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '👔': {
        name: 'necktie',
        slug: 'necktie',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👕': {
        name: 't-shirt',
        slug: 't_shirt',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👖': {
        name: 'jeans',
        slug: 'jeans',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧣': {
        name: 'scarf',
        slug: 'scarf',
        group: 'Objects',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧤': {
        name: 'gloves',
        slug: 'gloves',
        group: 'Objects',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧥': {
        name: 'coat',
        slug: 'coat',
        group: 'Objects',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🧦': {
        name: 'socks',
        slug: 'socks',
        group: 'Objects',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '👗': {
        name: 'dress',
        slug: 'dress',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👘': {
        name: 'kimono',
        slug: 'kimono',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥻': {
        name: 'sari',
        slug: 'sari',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🩱': {
        name: 'one-piece swimsuit',
        slug: 'one_piece_swimsuit',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🩲': {
        name: 'briefs',
        slug: 'briefs',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🩳': {
        name: 'shorts',
        slug: 'shorts',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '👙': {
        name: 'bikini',
        slug: 'bikini',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👚': {
        name: 'woman’s clothes',
        slug: 'woman_s_clothes',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪭': {
        name: 'folding hand fan',
        slug: 'folding_hand_fan',
        group: 'Objects',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '👛': {
        name: 'purse',
        slug: 'purse',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👜': {
        name: 'handbag',
        slug: 'handbag',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👝': {
        name: 'clutch bag',
        slug: 'clutch_bag',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛍️': {
        name: 'shopping bags',
        slug: 'shopping_bags',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎒': {
        name: 'backpack',
        slug: 'backpack',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🩴': {
        name: 'thong sandal',
        slug: 'thong_sandal',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '👞': {
        name: 'man’s shoe',
        slug: 'man_s_shoe',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👟': {
        name: 'running shoe',
        slug: 'running_shoe',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🥾': {
        name: 'hiking boot',
        slug: 'hiking_boot',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🥿': {
        name: 'flat shoe',
        slug: 'flat_shoe',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '👠': {
        name: 'high-heeled shoe',
        slug: 'high_heeled_shoe',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👡': {
        name: 'woman’s sandal',
        slug: 'woman_s_sandal',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🩰': {
        name: 'ballet shoes',
        slug: 'ballet_shoes',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '👢': {
        name: 'woman’s boot',
        slug: 'woman_s_boot',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪮': {
        name: 'hair pick',
        slug: 'hair_pick',
        group: 'Objects',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '👑': {
        name: 'crown',
        slug: 'crown',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '👒': {
        name: 'woman’s hat',
        slug: 'woman_s_hat',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎩': {
        name: 'top hat',
        slug: 'top_hat',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎓': {
        name: 'graduation cap',
        slug: 'graduation_cap',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧢': {
        name: 'billed cap',
        slug: 'billed_cap',
        group: 'Objects',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🪖': {
        name: 'military helmet',
        slug: 'military_helmet',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '⛑️': {
        name: 'rescue worker’s helmet',
        slug: 'rescue_worker_s_helmet',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📿': {
        name: 'prayer beads',
        slug: 'prayer_beads',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '💄': {
        name: 'lipstick',
        slug: 'lipstick',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💍': {
        name: 'ring',
        slug: 'ring',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💎': {
        name: 'gem stone',
        slug: 'gem_stone',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔇': {
        name: 'muted speaker',
        slug: 'muted_speaker',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔈': {
        name: 'speaker low volume',
        slug: 'speaker_low_volume',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🔉': {
        name: 'speaker medium volume',
        slug: 'speaker_medium_volume',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔊': {
        name: 'speaker high volume',
        slug: 'speaker_high_volume',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📢': {
        name: 'loudspeaker',
        slug: 'loudspeaker',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📣': {
        name: 'megaphone',
        slug: 'megaphone',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📯': {
        name: 'postal horn',
        slug: 'postal_horn',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔔': {
        name: 'bell',
        slug: 'bell',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔕': {
        name: 'bell with slash',
        slug: 'bell_with_slash',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🎼': {
        name: 'musical score',
        slug: 'musical_score',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎵': {
        name: 'musical note',
        slug: 'musical_note',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎶': {
        name: 'musical notes',
        slug: 'musical_notes',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎙️': {
        name: 'studio microphone',
        slug: 'studio_microphone',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎚️': {
        name: 'level slider',
        slug: 'level_slider',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎛️': {
        name: 'control knobs',
        slug: 'control_knobs',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎤': {
        name: 'microphone',
        slug: 'microphone',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎧': {
        name: 'headphone',
        slug: 'headphone',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📻': {
        name: 'radio',
        slug: 'radio',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎷': {
        name: 'saxophone',
        slug: 'saxophone',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪗': {
        name: 'accordion',
        slug: 'accordion',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🎸': {
        name: 'guitar',
        slug: 'guitar',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎹': {
        name: 'musical keyboard',
        slug: 'musical_keyboard',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎺': {
        name: 'trumpet',
        slug: 'trumpet',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎻': {
        name: 'violin',
        slug: 'violin',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪕': {
        name: 'banjo',
        slug: 'banjo',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🥁': {
        name: 'drum',
        slug: 'drum',
        group: 'Objects',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🪘': {
        name: 'long drum',
        slug: 'long_drum',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪇': {
        name: 'maracas',
        slug: 'maracas',
        group: 'Objects',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '🪈': {
        name: 'flute',
        slug: 'flute',
        group: 'Objects',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '📱': {
        name: 'mobile phone',
        slug: 'mobile_phone',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📲': {
        name: 'mobile phone with arrow',
        slug: 'mobile_phone_with_arrow',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☎️': {
        name: 'telephone',
        slug: 'telephone',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📞': {
        name: 'telephone receiver',
        slug: 'telephone_receiver',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📟': {
        name: 'pager',
        slug: 'pager',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📠': {
        name: 'fax machine',
        slug: 'fax_machine',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔋': {
        name: 'battery',
        slug: 'battery',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪫': {
        name: 'low battery',
        slug: 'low_battery',
        group: 'Objects',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🔌': {
        name: 'electric plug',
        slug: 'electric_plug',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💻': {
        name: 'laptop',
        slug: 'laptop',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🖥️': {
        name: 'desktop computer',
        slug: 'desktop_computer',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🖨️': {
        name: 'printer',
        slug: 'printer',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⌨️': {
        name: 'keyboard',
        slug: 'keyboard',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🖱️': {
        name: 'computer mouse',
        slug: 'computer_mouse',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🖲️': {
        name: 'trackball',
        slug: 'trackball',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '💽': {
        name: 'computer disk',
        slug: 'computer_disk',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💾': {
        name: 'floppy disk',
        slug: 'floppy_disk',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💿': {
        name: 'optical disk',
        slug: 'optical_disk',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📀': {
        name: 'dvd',
        slug: 'dvd',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧮': {
        name: 'abacus',
        slug: 'abacus',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🎥': {
        name: 'movie camera',
        slug: 'movie_camera',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎞️': {
        name: 'film frames',
        slug: 'film_frames',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📽️': {
        name: 'film projector',
        slug: 'film_projector',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🎬': {
        name: 'clapper board',
        slug: 'clapper_board',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📺': {
        name: 'television',
        slug: 'television',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📷': {
        name: 'camera',
        slug: 'camera',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📸': {
        name: 'camera with flash',
        slug: 'camera_with_flash',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '📹': {
        name: 'video camera',
        slug: 'video_camera',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📼': {
        name: 'videocassette',
        slug: 'videocassette',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔍': {
        name: 'magnifying glass tilted left',
        slug: 'magnifying_glass_tilted_left',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔎': {
        name: 'magnifying glass tilted right',
        slug: 'magnifying_glass_tilted_right',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🕯️': {
        name: 'candle',
        slug: 'candle',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '💡': {
        name: 'light bulb',
        slug: 'light_bulb',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔦': {
        name: 'flashlight',
        slug: 'flashlight',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏮': {
        name: 'red paper lantern',
        slug: 'red_paper_lantern',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪔': {
        name: 'diya lamp',
        slug: 'diya_lamp',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '📔': {
        name: 'notebook with decorative cover',
        slug: 'notebook_with_decorative_cover',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📕': {
        name: 'closed book',
        slug: 'closed_book',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📖': {
        name: 'open book',
        slug: 'open_book',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📗': {
        name: 'green book',
        slug: 'green_book',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📘': {
        name: 'blue book',
        slug: 'blue_book',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📙': {
        name: 'orange book',
        slug: 'orange_book',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📚': {
        name: 'books',
        slug: 'books',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📓': {
        name: 'notebook',
        slug: 'notebook',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📒': {
        name: 'ledger',
        slug: 'ledger',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📃': {
        name: 'page with curl',
        slug: 'page_with_curl',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📜': {
        name: 'scroll',
        slug: 'scroll',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📄': {
        name: 'page facing up',
        slug: 'page_facing_up',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📰': {
        name: 'newspaper',
        slug: 'newspaper',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗞️': {
        name: 'rolled-up newspaper',
        slug: 'rolled_up_newspaper',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📑': {
        name: 'bookmark tabs',
        slug: 'bookmark_tabs',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔖': {
        name: 'bookmark',
        slug: 'bookmark',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏷️': {
        name: 'label',
        slug: 'label',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '💰': {
        name: 'money bag',
        slug: 'money_bag',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪙': {
        name: 'coin',
        slug: 'coin',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '💴': {
        name: 'yen banknote',
        slug: 'yen_banknote',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💵': {
        name: 'dollar banknote',
        slug: 'dollar_banknote',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💶': {
        name: 'euro banknote',
        slug: 'euro_banknote',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '💷': {
        name: 'pound banknote',
        slug: 'pound_banknote',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '💸': {
        name: 'money with wings',
        slug: 'money_with_wings',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💳': {
        name: 'credit card',
        slug: 'credit_card',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🧾': {
        name: 'receipt',
        slug: 'receipt',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '💹': {
        name: 'chart increasing with yen',
        slug: 'chart_increasing_with_yen',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✉️': {
        name: 'envelope',
        slug: 'envelope',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📧': {
        name: 'e-mail',
        slug: 'e_mail',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📨': {
        name: 'incoming envelope',
        slug: 'incoming_envelope',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📩': {
        name: 'envelope with arrow',
        slug: 'envelope_with_arrow',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📤': {
        name: 'outbox tray',
        slug: 'outbox_tray',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📥': {
        name: 'inbox tray',
        slug: 'inbox_tray',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📦': {
        name: 'package',
        slug: 'package',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📫': {
        name: 'closed mailbox with raised flag',
        slug: 'closed_mailbox_with_raised_flag',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📪': {
        name: 'closed mailbox with lowered flag',
        slug: 'closed_mailbox_with_lowered_flag',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📬': {
        name: 'open mailbox with raised flag',
        slug: 'open_mailbox_with_raised_flag',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📭': {
        name: 'open mailbox with lowered flag',
        slug: 'open_mailbox_with_lowered_flag',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📮': {
        name: 'postbox',
        slug: 'postbox',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗳️': {
        name: 'ballot box with ballot',
        slug: 'ballot_box_with_ballot',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '✏️': {
        name: 'pencil',
        slug: 'pencil',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✒️': {
        name: 'black nib',
        slug: 'black_nib',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🖋️': {
        name: 'fountain pen',
        slug: 'fountain_pen',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🖊️': {
        name: 'pen',
        slug: 'pen',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🖌️': {
        name: 'paintbrush',
        slug: 'paintbrush',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🖍️': {
        name: 'crayon',
        slug: 'crayon',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📝': {
        name: 'memo',
        slug: 'memo',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💼': {
        name: 'briefcase',
        slug: 'briefcase',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📁': {
        name: 'file folder',
        slug: 'file_folder',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📂': {
        name: 'open file folder',
        slug: 'open_file_folder',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗂️': {
        name: 'card index dividers',
        slug: 'card_index_dividers',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📅': {
        name: 'calendar',
        slug: 'calendar',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📆': {
        name: 'tear-off calendar',
        slug: 'tear_off_calendar',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗒️': {
        name: 'spiral notepad',
        slug: 'spiral_notepad',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🗓️': {
        name: 'spiral calendar',
        slug: 'spiral_calendar',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📇': {
        name: 'card index',
        slug: 'card_index',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📈': {
        name: 'chart increasing',
        slug: 'chart_increasing',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📉': {
        name: 'chart decreasing',
        slug: 'chart_decreasing',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📊': {
        name: 'bar chart',
        slug: 'bar_chart',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📋': {
        name: 'clipboard',
        slug: 'clipboard',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📌': {
        name: 'pushpin',
        slug: 'pushpin',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📍': {
        name: 'round pushpin',
        slug: 'round_pushpin',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📎': {
        name: 'paperclip',
        slug: 'paperclip',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🖇️': {
        name: 'linked paperclips',
        slug: 'linked_paperclips',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '📏': {
        name: 'straight ruler',
        slug: 'straight_ruler',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📐': {
        name: 'triangular ruler',
        slug: 'triangular_ruler',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✂️': {
        name: 'scissors',
        slug: 'scissors',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗃️': {
        name: 'card file box',
        slug: 'card_file_box',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🗄️': {
        name: 'file cabinet',
        slug: 'file_cabinet',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🗑️': {
        name: 'wastebasket',
        slug: 'wastebasket',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🔒': {
        name: 'locked',
        slug: 'locked',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔓': {
        name: 'unlocked',
        slug: 'unlocked',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔏': {
        name: 'locked with pen',
        slug: 'locked_with_pen',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔐': {
        name: 'locked with key',
        slug: 'locked_with_key',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔑': {
        name: 'key',
        slug: 'key',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🗝️': {
        name: 'old key',
        slug: 'old_key',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🔨': {
        name: 'hammer',
        slug: 'hammer',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪓': {
        name: 'axe',
        slug: 'axe',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '⛏️': {
        name: 'pick',
        slug: 'pick',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⚒️': {
        name: 'hammer and pick',
        slug: 'hammer_and_pick',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛠️': {
        name: 'hammer and wrench',
        slug: 'hammer_and_wrench',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🗡️': {
        name: 'dagger',
        slug: 'dagger',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⚔️': {
        name: 'crossed swords',
        slug: 'crossed_swords',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '💣': {
        name: 'bomb',
        slug: 'bomb',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪃': {
        name: 'boomerang',
        slug: 'boomerang',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🏹': {
        name: 'bow and arrow',
        slug: 'bow_and_arrow',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛡️': {
        name: 'shield',
        slug: 'shield',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🪚': {
        name: 'carpentry saw',
        slug: 'carpentry_saw',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🔧': {
        name: 'wrench',
        slug: 'wrench',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪛': {
        name: 'screwdriver',
        slug: 'screwdriver',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🔩': {
        name: 'nut and bolt',
        slug: 'nut_and_bolt',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⚙️': {
        name: 'gear',
        slug: 'gear',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🗜️': {
        name: 'clamp',
        slug: 'clamp',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⚖️': {
        name: 'balance scale',
        slug: 'balance_scale',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🦯': {
        name: 'white cane',
        slug: 'white_cane',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🔗': {
        name: 'link',
        slug: 'link',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛓️‍💥': {
        name: 'broken chain',
        slug: 'broken_chain',
        group: 'Objects',
        emoji_version: '15.1',
        unicode_version: '15.1',
        skin_tone_support: false
    },
    '⛓️': {
        name: 'chains',
        slug: 'chains',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🪝': {
        name: 'hook',
        slug: 'hook',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🧰': {
        name: 'toolbox',
        slug: 'toolbox',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧲': {
        name: 'magnet',
        slug: 'magnet',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪜': {
        name: 'ladder',
        slug: 'ladder',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '⚗️': {
        name: 'alembic',
        slug: 'alembic',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🧪': {
        name: 'test tube',
        slug: 'test_tube',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧫': {
        name: 'petri dish',
        slug: 'petri_dish',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧬': {
        name: 'dna',
        slug: 'dna',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🔬': {
        name: 'microscope',
        slug: 'microscope',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔭': {
        name: 'telescope',
        slug: 'telescope',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '📡': {
        name: 'satellite antenna',
        slug: 'satellite_antenna',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💉': {
        name: 'syringe',
        slug: 'syringe',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🩸': {
        name: 'drop of blood',
        slug: 'drop_of_blood',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '💊': {
        name: 'pill',
        slug: 'pill',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🩹': {
        name: 'adhesive bandage',
        slug: 'adhesive_bandage',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🩼': {
        name: 'crutch',
        slug: 'crutch',
        group: 'Objects',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🩺': {
        name: 'stethoscope',
        slug: 'stethoscope',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🩻': {
        name: 'x-ray',
        slug: 'x_ray',
        group: 'Objects',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🚪': {
        name: 'door',
        slug: 'door',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛗': {
        name: 'elevator',
        slug: 'elevator',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪞': {
        name: 'mirror',
        slug: 'mirror',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪟': {
        name: 'window',
        slug: 'window',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🛏️': {
        name: 'bed',
        slug: 'bed',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🛋️': {
        name: 'couch and lamp',
        slug: 'couch_and_lamp',
        group: 'Objects',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🪑': {
        name: 'chair',
        slug: 'chair',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🚽': {
        name: 'toilet',
        slug: 'toilet',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪠': {
        name: 'plunger',
        slug: 'plunger',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🚿': {
        name: 'shower',
        slug: 'shower',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛁': {
        name: 'bathtub',
        slug: 'bathtub',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🪤': {
        name: 'mouse trap',
        slug: 'mouse_trap',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪒': {
        name: 'razor',
        slug: 'razor',
        group: 'Objects',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🧴': {
        name: 'lotion bottle',
        slug: 'lotion_bottle',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧷': {
        name: 'safety pin',
        slug: 'safety_pin',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧹': {
        name: 'broom',
        slug: 'broom',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧺': {
        name: 'basket',
        slug: 'basket',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧻': {
        name: 'roll of paper',
        slug: 'roll_of_paper',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪣': {
        name: 'bucket',
        slug: 'bucket',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🧼': {
        name: 'soap',
        slug: 'soap',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🫧': {
        name: 'bubbles',
        slug: 'bubbles',
        group: 'Objects',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🪥': {
        name: 'toothbrush',
        slug: 'toothbrush',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🧽': {
        name: 'sponge',
        slug: 'sponge',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🧯': {
        name: 'fire extinguisher',
        slug: 'fire_extinguisher',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🛒': {
        name: 'shopping cart',
        slug: 'shopping_cart',
        group: 'Objects',
        emoji_version: '3.0',
        unicode_version: '3.0',
        skin_tone_support: false
    },
    '🚬': {
        name: 'cigarette',
        slug: 'cigarette',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⚰️': {
        name: 'coffin',
        slug: 'coffin',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🪦': {
        name: 'headstone',
        slug: 'headstone',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '⚱️': {
        name: 'funeral urn',
        slug: 'funeral_urn',
        group: 'Objects',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🧿': {
        name: 'nazar amulet',
        slug: 'nazar_amulet',
        group: 'Objects',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🪬': {
        name: 'hamsa',
        slug: 'hamsa',
        group: 'Objects',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🗿': {
        name: 'moai',
        slug: 'moai',
        group: 'Objects',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪧': {
        name: 'placard',
        slug: 'placard',
        group: 'Objects',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🪪': {
        name: 'identification card',
        slug: 'identification_card',
        group: 'Objects',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '🏧': {
        name: 'ATM sign',
        slug: 'atm_sign',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚮': {
        name: 'litter in bin sign',
        slug: 'litter_in_bin_sign',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚰': {
        name: 'potable water',
        slug: 'potable_water',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '♿': {
        name: 'wheelchair symbol',
        slug: 'wheelchair_symbol',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚹': {
        name: 'men’s room',
        slug: 'men_s_room',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚺': {
        name: 'women’s room',
        slug: 'women_s_room',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚻': {
        name: 'restroom',
        slug: 'restroom',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚼': {
        name: 'baby symbol',
        slug: 'baby_symbol',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚾': {
        name: 'water closet',
        slug: 'water_closet',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛂': {
        name: 'passport control',
        slug: 'passport_control',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛃': {
        name: 'customs',
        slug: 'customs',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛄': {
        name: 'baggage claim',
        slug: 'baggage_claim',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🛅': {
        name: 'left luggage',
        slug: 'left_luggage',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '⚠️': {
        name: 'warning',
        slug: 'warning',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚸': {
        name: 'children crossing',
        slug: 'children_crossing',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '⛔': {
        name: 'no entry',
        slug: 'no_entry',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚫': {
        name: 'prohibited',
        slug: 'prohibited',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚳': {
        name: 'no bicycles',
        slug: 'no_bicycles',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚭': {
        name: 'no smoking',
        slug: 'no_smoking',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚯': {
        name: 'no littering',
        slug: 'no_littering',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚱': {
        name: 'non-potable water',
        slug: 'non_potable_water',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🚷': {
        name: 'no pedestrians',
        slug: 'no_pedestrians',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '📵': {
        name: 'no mobile phones',
        slug: 'no_mobile_phones',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔞': {
        name: 'no one under eighteen',
        slug: 'no_one_under_eighteen',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☢️': {
        name: 'radioactive',
        slug: 'radioactive',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '☣️': {
        name: 'biohazard',
        slug: 'biohazard',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '⬆️': {
        name: 'up arrow',
        slug: 'up_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↗️': {
        name: 'up-right arrow',
        slug: 'up_right_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '➡️': {
        name: 'right arrow',
        slug: 'right_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↘️': {
        name: 'down-right arrow',
        slug: 'down_right_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⬇️': {
        name: 'down arrow',
        slug: 'down_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↙️': {
        name: 'down-left arrow',
        slug: 'down_left_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⬅️': {
        name: 'left arrow',
        slug: 'left_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↖️': {
        name: 'up-left arrow',
        slug: 'up_left_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↕️': {
        name: 'up-down arrow',
        slug: 'up_down_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↔️': {
        name: 'left-right arrow',
        slug: 'left_right_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↩️': {
        name: 'right arrow curving left',
        slug: 'right_arrow_curving_left',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '↪️': {
        name: 'left arrow curving right',
        slug: 'left_arrow_curving_right',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⤴️': {
        name: 'right arrow curving up',
        slug: 'right_arrow_curving_up',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⤵️': {
        name: 'right arrow curving down',
        slug: 'right_arrow_curving_down',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔃': {
        name: 'clockwise vertical arrows',
        slug: 'clockwise_vertical_arrows',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔄': {
        name: 'counterclockwise arrows button',
        slug: 'counterclockwise_arrows_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔙': {
        name: 'BACK arrow',
        slug: 'back_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔚': {
        name: 'END arrow',
        slug: 'end_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔛': {
        name: 'ON! arrow',
        slug: 'on_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔜': {
        name: 'SOON arrow',
        slug: 'soon_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔝': {
        name: 'TOP arrow',
        slug: 'top_arrow',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛐': {
        name: 'place of worship',
        slug: 'place_of_worship',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '⚛️': {
        name: 'atom symbol',
        slug: 'atom_symbol',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🕉️': {
        name: 'om',
        slug: 'om',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '✡️': {
        name: 'star of David',
        slug: 'star_of_david',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '☸️': {
        name: 'wheel of dharma',
        slug: 'wheel_of_dharma',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '☯️': {
        name: 'yin yang',
        slug: 'yin_yang',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '✝️': {
        name: 'latin cross',
        slug: 'latin_cross',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '☦️': {
        name: 'orthodox cross',
        slug: 'orthodox_cross',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '☪️': {
        name: 'star and crescent',
        slug: 'star_and_crescent',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '☮️': {
        name: 'peace symbol',
        slug: 'peace_symbol',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🕎': {
        name: 'menorah',
        slug: 'menorah',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔯': {
        name: 'dotted six-pointed star',
        slug: 'dotted_six_pointed_star',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🪯': {
        name: 'khanda',
        slug: 'khanda',
        group: 'Symbols',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '♈': {
        name: 'Aries',
        slug: 'aries',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♉': {
        name: 'Taurus',
        slug: 'taurus',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♊': {
        name: 'Gemini',
        slug: 'gemini',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♋': {
        name: 'Cancer',
        slug: 'cancer',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♌': {
        name: 'Leo',
        slug: 'leo',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♍': {
        name: 'Virgo',
        slug: 'virgo',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♎': {
        name: 'Libra',
        slug: 'libra',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♏': {
        name: 'Scorpio',
        slug: 'scorpio',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♐': {
        name: 'Sagittarius',
        slug: 'sagittarius',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♑': {
        name: 'Capricorn',
        slug: 'capricorn',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♒': {
        name: 'Aquarius',
        slug: 'aquarius',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♓': {
        name: 'Pisces',
        slug: 'pisces',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⛎': {
        name: 'Ophiuchus',
        slug: 'ophiuchus',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔀': {
        name: 'shuffle tracks button',
        slug: 'shuffle_tracks_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔁': {
        name: 'repeat button',
        slug: 'repeat_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔂': {
        name: 'repeat single button',
        slug: 'repeat_single_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '▶️': {
        name: 'play button',
        slug: 'play_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏩': {
        name: 'fast-forward button',
        slug: 'fast_forward_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏭️': {
        name: 'next track button',
        slug: 'next_track_button',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⏯️': {
        name: 'play or pause button',
        slug: 'play_or_pause_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '◀️': {
        name: 'reverse button',
        slug: 'reverse_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏪': {
        name: 'fast reverse button',
        slug: 'fast_reverse_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏮️': {
        name: 'last track button',
        slug: 'last_track_button',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🔼': {
        name: 'upwards button',
        slug: 'upwards_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏫': {
        name: 'fast up button',
        slug: 'fast_up_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔽': {
        name: 'downwards button',
        slug: 'downwards_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏬': {
        name: 'fast down button',
        slug: 'fast_down_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⏸️': {
        name: 'pause button',
        slug: 'pause_button',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⏹️': {
        name: 'stop button',
        slug: 'stop_button',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⏺️': {
        name: 'record button',
        slug: 'record_button',
        group: 'Symbols',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '⏏️': {
        name: 'eject button',
        slug: 'eject_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🎦': {
        name: 'cinema',
        slug: 'cinema',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔅': {
        name: 'dim button',
        slug: 'dim_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔆': {
        name: 'bright button',
        slug: 'bright_button',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '📶': {
        name: 'antenna bars',
        slug: 'antenna_bars',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🛜': {
        name: 'wireless',
        slug: 'wireless',
        group: 'Symbols',
        emoji_version: '15.0',
        unicode_version: '15.0',
        skin_tone_support: false
    },
    '📳': {
        name: 'vibration mode',
        slug: 'vibration_mode',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📴': {
        name: 'mobile phone off',
        slug: 'mobile_phone_off',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '♀️': {
        name: 'female sign',
        slug: 'female_sign',
        group: 'Symbols',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '♂️': {
        name: 'male sign',
        slug: 'male_sign',
        group: 'Symbols',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '⚧️': {
        name: 'transgender symbol',
        slug: 'transgender_symbol',
        group: 'Symbols',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '✖️': {
        name: 'multiply',
        slug: 'multiply',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '➕': {
        name: 'plus',
        slug: 'plus',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '➖': {
        name: 'minus',
        slug: 'minus',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '➗': {
        name: 'divide',
        slug: 'divide',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🟰': {
        name: 'heavy equals sign',
        slug: 'heavy_equals_sign',
        group: 'Symbols',
        emoji_version: '14.0',
        unicode_version: '14.0',
        skin_tone_support: false
    },
    '♾️': {
        name: 'infinity',
        slug: 'infinity',
        group: 'Symbols',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '‼️': {
        name: 'double exclamation mark',
        slug: 'double_exclamation_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⁉️': {
        name: 'exclamation question mark',
        slug: 'exclamation_question_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❓': {
        name: 'red question mark',
        slug: 'red_question_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❔': {
        name: 'white question mark',
        slug: 'white_question_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❕': {
        name: 'white exclamation mark',
        slug: 'white_exclamation_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❗': {
        name: 'red exclamation mark',
        slug: 'red_exclamation_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '〰️': {
        name: 'wavy dash',
        slug: 'wavy_dash',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💱': {
        name: 'currency exchange',
        slug: 'currency_exchange',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💲': {
        name: 'heavy dollar sign',
        slug: 'heavy_dollar_sign',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⚕️': {
        name: 'medical symbol',
        slug: 'medical_symbol',
        group: 'Symbols',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '♻️': {
        name: 'recycling symbol',
        slug: 'recycling_symbol',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⚜️': {
        name: 'fleur-de-lis',
        slug: 'fleur_de_lis',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🔱': {
        name: 'trident emblem',
        slug: 'trident_emblem',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '📛': {
        name: 'name badge',
        slug: 'name_badge',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔰': {
        name: 'Japanese symbol for beginner',
        slug: 'japanese_symbol_for_beginner',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⭕': {
        name: 'hollow red circle',
        slug: 'hollow_red_circle',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✅': {
        name: 'check mark button',
        slug: 'check_mark_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '☑️': {
        name: 'check box with check',
        slug: 'check_box_with_check',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✔️': {
        name: 'check mark',
        slug: 'check_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❌': {
        name: 'cross mark',
        slug: 'cross_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❎': {
        name: 'cross mark button',
        slug: 'cross_mark_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '➰': {
        name: 'curly loop',
        slug: 'curly_loop',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '➿': {
        name: 'double curly loop',
        slug: 'double_curly_loop',
        group: 'Symbols',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '〽️': {
        name: 'part alternation mark',
        slug: 'part_alternation_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✳️': {
        name: 'eight-spoked asterisk',
        slug: 'eight_spoked_asterisk',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '✴️': {
        name: 'eight-pointed star',
        slug: 'eight_pointed_star',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '❇️': {
        name: 'sparkle',
        slug: 'sparkle',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '©️': {
        name: 'copyright',
        slug: 'copyright',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '®️': {
        name: 'registered',
        slug: 'registered',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '™️': {
        name: 'trade mark',
        slug: 'trade_mark',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '#️⃣': {
        name: 'keycap #',
        slug: 'keycap_number_sign',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '*️⃣': {
        name: 'keycap *',
        slug: 'keycap_asterisk',
        group: 'Symbols',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '0️⃣': {
        name: 'keycap 0',
        slug: 'keycap_0',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '1️⃣': {
        name: 'keycap 1',
        slug: 'keycap_1',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '2️⃣': {
        name: 'keycap 2',
        slug: 'keycap_2',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '3️⃣': {
        name: 'keycap 3',
        slug: 'keycap_3',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '4️⃣': {
        name: 'keycap 4',
        slug: 'keycap_4',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '5️⃣': {
        name: 'keycap 5',
        slug: 'keycap_5',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '6️⃣': {
        name: 'keycap 6',
        slug: 'keycap_6',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '7️⃣': {
        name: 'keycap 7',
        slug: 'keycap_7',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '8️⃣': {
        name: 'keycap 8',
        slug: 'keycap_8',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '9️⃣': {
        name: 'keycap 9',
        slug: 'keycap_9',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔟': {
        name: 'keycap 10',
        slug: 'keycap_10',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔠': {
        name: 'input latin uppercase',
        slug: 'input_latin_uppercase',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔡': {
        name: 'input latin lowercase',
        slug: 'input_latin_lowercase',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔢': {
        name: 'input numbers',
        slug: 'input_numbers',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔣': {
        name: 'input symbols',
        slug: 'input_symbols',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔤': {
        name: 'input latin letters',
        slug: 'input_latin_letters',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🅰️': {
        name: 'A button (blood type)',
        slug: 'a_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆎': {
        name: 'AB button (blood type)',
        slug: 'ab_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🅱️': {
        name: 'B button (blood type)',
        slug: 'b_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆑': {
        name: 'CL button',
        slug: 'cl_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆒': {
        name: 'COOL button',
        slug: 'cool_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆓': {
        name: 'FREE button',
        slug: 'free_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    ℹ️: {
        name: 'information',
        slug: 'information',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆔': {
        name: 'ID button',
        slug: 'id_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    'Ⓜ️': {
        name: 'circled M',
        slug: 'circled_m',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆕': {
        name: 'NEW button',
        slug: 'new_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆖': {
        name: 'NG button',
        slug: 'ng_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🅾️': {
        name: 'O button (blood type)',
        slug: 'o_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆗': {
        name: 'OK button',
        slug: 'ok_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🅿️': {
        name: 'P button',
        slug: 'p_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆘': {
        name: 'SOS button',
        slug: 'sos_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆙': {
        name: 'UP! button',
        slug: 'up_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🆚': {
        name: 'VS button',
        slug: 'vs_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈁': {
        name: 'Japanese “here” button',
        slug: 'japanese_here_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈂️': {
        name: 'Japanese “service charge” button',
        slug: 'japanese_service_charge_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈷️': {
        name: 'Japanese “monthly amount” button',
        slug: 'japanese_monthly_amount_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈶': {
        name: 'Japanese “not free of charge” button',
        slug: 'japanese_not_free_of_charge_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈯': {
        name: 'Japanese “reserved” button',
        slug: 'japanese_reserved_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🉐': {
        name: 'Japanese “bargain” button',
        slug: 'japanese_bargain_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈹': {
        name: 'Japanese “discount” button',
        slug: 'japanese_discount_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈚': {
        name: 'Japanese “free of charge” button',
        slug: 'japanese_free_of_charge_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈲': {
        name: 'Japanese “prohibited” button',
        slug: 'japanese_prohibited_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🉑': {
        name: 'Japanese “acceptable” button',
        slug: 'japanese_acceptable_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈸': {
        name: 'Japanese “application” button',
        slug: 'japanese_application_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈴': {
        name: 'Japanese “passing grade” button',
        slug: 'japanese_passing_grade_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈳': {
        name: 'Japanese “vacancy” button',
        slug: 'japanese_vacancy_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '㊗️': {
        name: 'Japanese “congratulations” button',
        slug: 'japanese_congratulations_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '㊙️': {
        name: 'Japanese “secret” button',
        slug: 'japanese_secret_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈺': {
        name: 'Japanese “open for business” button',
        slug: 'japanese_open_for_business_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🈵': {
        name: 'Japanese “no vacancy” button',
        slug: 'japanese_no_vacancy_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔴': {
        name: 'red circle',
        slug: 'red_circle',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🟠': {
        name: 'orange circle',
        slug: 'orange_circle',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟡': {
        name: 'yellow circle',
        slug: 'yellow_circle',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟢': {
        name: 'green circle',
        slug: 'green_circle',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🔵': {
        name: 'blue circle',
        slug: 'blue_circle',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🟣': {
        name: 'purple circle',
        slug: 'purple_circle',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟤': {
        name: 'brown circle',
        slug: 'brown_circle',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '⚫': {
        name: 'black circle',
        slug: 'black_circle',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⚪': {
        name: 'white circle',
        slug: 'white_circle',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🟥': {
        name: 'red square',
        slug: 'red_square',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟧': {
        name: 'orange square',
        slug: 'orange_square',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟨': {
        name: 'yellow square',
        slug: 'yellow_square',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟩': {
        name: 'green square',
        slug: 'green_square',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟦': {
        name: 'blue square',
        slug: 'blue_square',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟪': {
        name: 'purple square',
        slug: 'purple_square',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '🟫': {
        name: 'brown square',
        slug: 'brown_square',
        group: 'Symbols',
        emoji_version: '12.0',
        unicode_version: '12.0',
        skin_tone_support: false
    },
    '⬛': {
        name: 'black large square',
        slug: 'black_large_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '⬜': {
        name: 'white large square',
        slug: 'white_large_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '◼️': {
        name: 'black medium square',
        slug: 'black_medium_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '◻️': {
        name: 'white medium square',
        slug: 'white_medium_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '◾': {
        name: 'black medium-small square',
        slug: 'black_medium_small_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '◽': {
        name: 'white medium-small square',
        slug: 'white_medium_small_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '▪️': {
        name: 'black small square',
        slug: 'black_small_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '▫️': {
        name: 'white small square',
        slug: 'white_small_square',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔶': {
        name: 'large orange diamond',
        slug: 'large_orange_diamond',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔷': {
        name: 'large blue diamond',
        slug: 'large_blue_diamond',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔸': {
        name: 'small orange diamond',
        slug: 'small_orange_diamond',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔹': {
        name: 'small blue diamond',
        slug: 'small_blue_diamond',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔺': {
        name: 'red triangle pointed up',
        slug: 'red_triangle_pointed_up',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔻': {
        name: 'red triangle pointed down',
        slug: 'red_triangle_pointed_down',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '💠': {
        name: 'diamond with a dot',
        slug: 'diamond_with_a_dot',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔘': {
        name: 'radio button',
        slug: 'radio_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔳': {
        name: 'white square button',
        slug: 'white_square_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🔲': {
        name: 'black square button',
        slug: 'black_square_button',
        group: 'Symbols',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏁': {
        name: 'chequered flag',
        slug: 'chequered_flag',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🚩': {
        name: 'triangular flag',
        slug: 'triangular_flag',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🎌': {
        name: 'crossed flags',
        slug: 'crossed_flags',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🏴': {
        name: 'black flag',
        slug: 'black_flag',
        group: 'Flags',
        emoji_version: '1.0',
        unicode_version: '1.0',
        skin_tone_support: false
    },
    '🏳️': {
        name: 'white flag',
        slug: 'white_flag',
        group: 'Flags',
        emoji_version: '0.7',
        unicode_version: '0.7',
        skin_tone_support: false
    },
    '🏳️‍🌈': {
        name: 'rainbow flag',
        slug: 'rainbow_flag',
        group: 'Flags',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '🏳️‍⚧️': {
        name: 'transgender flag',
        slug: 'transgender_flag',
        group: 'Flags',
        emoji_version: '13.0',
        unicode_version: '13.0',
        skin_tone_support: false
    },
    '🏴‍☠️': {
        name: 'pirate flag',
        slug: 'pirate_flag',
        group: 'Flags',
        emoji_version: '11.0',
        unicode_version: '11.0',
        skin_tone_support: false
    },
    '🇦🇨': {
        name: 'flag Ascension Island',
        slug: 'flag_ascension_island',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇩': {
        name: 'flag Andorra',
        slug: 'flag_andorra',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇪': {
        name: 'flag United Arab Emirates',
        slug: 'flag_united_arab_emirates',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇫': {
        name: 'flag Afghanistan',
        slug: 'flag_afghanistan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇬': {
        name: 'flag Antigua & Barbuda',
        slug: 'flag_antigua_barbuda',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇮': {
        name: 'flag Anguilla',
        slug: 'flag_anguilla',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇱': {
        name: 'flag Albania',
        slug: 'flag_albania',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇲': {
        name: 'flag Armenia',
        slug: 'flag_armenia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇴': {
        name: 'flag Angola',
        slug: 'flag_angola',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇶': {
        name: 'flag Antarctica',
        slug: 'flag_antarctica',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇷': {
        name: 'flag Argentina',
        slug: 'flag_argentina',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇸': {
        name: 'flag American Samoa',
        slug: 'flag_american_samoa',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇹': {
        name: 'flag Austria',
        slug: 'flag_austria',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇺': {
        name: 'flag Australia',
        slug: 'flag_australia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇼': {
        name: 'flag Aruba',
        slug: 'flag_aruba',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇽': {
        name: 'flag Åland Islands',
        slug: 'flag_aland_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇦🇿': {
        name: 'flag Azerbaijan',
        slug: 'flag_azerbaijan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇦': {
        name: 'flag Bosnia & Herzegovina',
        slug: 'flag_bosnia_herzegovina',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇧': {
        name: 'flag Barbados',
        slug: 'flag_barbados',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇩': {
        name: 'flag Bangladesh',
        slug: 'flag_bangladesh',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇪': {
        name: 'flag Belgium',
        slug: 'flag_belgium',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇫': {
        name: 'flag Burkina Faso',
        slug: 'flag_burkina_faso',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇬': {
        name: 'flag Bulgaria',
        slug: 'flag_bulgaria',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇭': {
        name: 'flag Bahrain',
        slug: 'flag_bahrain',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇮': {
        name: 'flag Burundi',
        slug: 'flag_burundi',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇯': {
        name: 'flag Benin',
        slug: 'flag_benin',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇱': {
        name: 'flag St. Barthélemy',
        slug: 'flag_st_barthelemy',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇲': {
        name: 'flag Bermuda',
        slug: 'flag_bermuda',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇳': {
        name: 'flag Brunei',
        slug: 'flag_brunei',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇴': {
        name: 'flag Bolivia',
        slug: 'flag_bolivia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇶': {
        name: 'flag Caribbean Netherlands',
        slug: 'flag_caribbean_netherlands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇷': {
        name: 'flag Brazil',
        slug: 'flag_brazil',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇸': {
        name: 'flag Bahamas',
        slug: 'flag_bahamas',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇹': {
        name: 'flag Bhutan',
        slug: 'flag_bhutan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇻': {
        name: 'flag Bouvet Island',
        slug: 'flag_bouvet_island',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇼': {
        name: 'flag Botswana',
        slug: 'flag_botswana',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇾': {
        name: 'flag Belarus',
        slug: 'flag_belarus',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇧🇿': {
        name: 'flag Belize',
        slug: 'flag_belize',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇦': {
        name: 'flag Canada',
        slug: 'flag_canada',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇨': {
        name: 'flag Cocos (Keeling) Islands',
        slug: 'flag_cocos_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇩': {
        name: 'flag Congo - Kinshasa',
        slug: 'flag_congo_kinshasa',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇫': {
        name: 'flag Central African Republic',
        slug: 'flag_central_african_republic',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇬': {
        name: 'flag Congo - Brazzaville',
        slug: 'flag_congo_brazzaville',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇭': {
        name: 'flag Switzerland',
        slug: 'flag_switzerland',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇮': {
        name: 'flag Côte d’Ivoire',
        slug: 'flag_cote_d_ivoire',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇰': {
        name: 'flag Cook Islands',
        slug: 'flag_cook_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇱': {
        name: 'flag Chile',
        slug: 'flag_chile',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇲': {
        name: 'flag Cameroon',
        slug: 'flag_cameroon',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇳': {
        name: 'flag China',
        slug: 'flag_china',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇨🇴': {
        name: 'flag Colombia',
        slug: 'flag_colombia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇵': {
        name: 'flag Clipperton Island',
        slug: 'flag_clipperton_island',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇷': {
        name: 'flag Costa Rica',
        slug: 'flag_costa_rica',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇺': {
        name: 'flag Cuba',
        slug: 'flag_cuba',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇻': {
        name: 'flag Cape Verde',
        slug: 'flag_cape_verde',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇼': {
        name: 'flag Curaçao',
        slug: 'flag_curacao',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇽': {
        name: 'flag Christmas Island',
        slug: 'flag_christmas_island',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇾': {
        name: 'flag Cyprus',
        slug: 'flag_cyprus',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇨🇿': {
        name: 'flag Czechia',
        slug: 'flag_czechia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇩🇪': {
        name: 'flag Germany',
        slug: 'flag_germany',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇩🇬': {
        name: 'flag Diego Garcia',
        slug: 'flag_diego_garcia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇩🇯': {
        name: 'flag Djibouti',
        slug: 'flag_djibouti',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇩🇰': {
        name: 'flag Denmark',
        slug: 'flag_denmark',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇩🇲': {
        name: 'flag Dominica',
        slug: 'flag_dominica',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇩🇴': {
        name: 'flag Dominican Republic',
        slug: 'flag_dominican_republic',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇩🇿': {
        name: 'flag Algeria',
        slug: 'flag_algeria',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇦': {
        name: 'flag Ceuta & Melilla',
        slug: 'flag_ceuta_melilla',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇨': {
        name: 'flag Ecuador',
        slug: 'flag_ecuador',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇪': {
        name: 'flag Estonia',
        slug: 'flag_estonia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇬': {
        name: 'flag Egypt',
        slug: 'flag_egypt',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇭': {
        name: 'flag Western Sahara',
        slug: 'flag_western_sahara',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇷': {
        name: 'flag Eritrea',
        slug: 'flag_eritrea',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇸': {
        name: 'flag Spain',
        slug: 'flag_spain',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇪🇹': {
        name: 'flag Ethiopia',
        slug: 'flag_ethiopia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇪🇺': {
        name: 'flag European Union',
        slug: 'flag_european_union',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇫🇮': {
        name: 'flag Finland',
        slug: 'flag_finland',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇫🇯': {
        name: 'flag Fiji',
        slug: 'flag_fiji',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇫🇰': {
        name: 'flag Falkland Islands',
        slug: 'flag_falkland_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇫🇲': {
        name: 'flag Micronesia',
        slug: 'flag_micronesia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇫🇴': {
        name: 'flag Faroe Islands',
        slug: 'flag_faroe_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇫🇷': {
        name: 'flag France',
        slug: 'flag_france',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇬🇦': {
        name: 'flag Gabon',
        slug: 'flag_gabon',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇧': {
        name: 'flag United Kingdom',
        slug: 'flag_united_kingdom',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇬🇩': {
        name: 'flag Grenada',
        slug: 'flag_grenada',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇪': {
        name: 'flag Georgia',
        slug: 'flag_georgia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇫': {
        name: 'flag French Guiana',
        slug: 'flag_french_guiana',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇬': {
        name: 'flag Guernsey',
        slug: 'flag_guernsey',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇭': {
        name: 'flag Ghana',
        slug: 'flag_ghana',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇮': {
        name: 'flag Gibraltar',
        slug: 'flag_gibraltar',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇱': {
        name: 'flag Greenland',
        slug: 'flag_greenland',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇲': {
        name: 'flag Gambia',
        slug: 'flag_gambia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇳': {
        name: 'flag Guinea',
        slug: 'flag_guinea',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇵': {
        name: 'flag Guadeloupe',
        slug: 'flag_guadeloupe',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇶': {
        name: 'flag Equatorial Guinea',
        slug: 'flag_equatorial_guinea',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇷': {
        name: 'flag Greece',
        slug: 'flag_greece',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇸': {
        name: 'flag South Georgia & South Sandwich Islands',
        slug: 'flag_south_georgia_south_sandwich_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇹': {
        name: 'flag Guatemala',
        slug: 'flag_guatemala',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇺': {
        name: 'flag Guam',
        slug: 'flag_guam',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇼': {
        name: 'flag Guinea-Bissau',
        slug: 'flag_guinea_bissau',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇬🇾': {
        name: 'flag Guyana',
        slug: 'flag_guyana',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇭🇰': {
        name: 'flag Hong Kong SAR China',
        slug: 'flag_hong_kong_sar_china',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇭🇲': {
        name: 'flag Heard & McDonald Islands',
        slug: 'flag_heard_mcdonald_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇭🇳': {
        name: 'flag Honduras',
        slug: 'flag_honduras',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇭🇷': {
        name: 'flag Croatia',
        slug: 'flag_croatia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇭🇹': {
        name: 'flag Haiti',
        slug: 'flag_haiti',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇭🇺': {
        name: 'flag Hungary',
        slug: 'flag_hungary',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇨': {
        name: 'flag Canary Islands',
        slug: 'flag_canary_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇩': {
        name: 'flag Indonesia',
        slug: 'flag_indonesia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇪': {
        name: 'flag Ireland',
        slug: 'flag_ireland',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇱': {
        name: 'flag Israel',
        slug: 'flag_israel',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇲': {
        name: 'flag Isle of Man',
        slug: 'flag_isle_of_man',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇳': {
        name: 'flag India',
        slug: 'flag_india',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇴': {
        name: 'flag British Indian Ocean Territory',
        slug: 'flag_british_indian_ocean_territory',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇶': {
        name: 'flag Iraq',
        slug: 'flag_iraq',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇷': {
        name: 'flag Iran',
        slug: 'flag_iran',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇸': {
        name: 'flag Iceland',
        slug: 'flag_iceland',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇮🇹': {
        name: 'flag Italy',
        slug: 'flag_italy',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇯🇪': {
        name: 'flag Jersey',
        slug: 'flag_jersey',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇯🇲': {
        name: 'flag Jamaica',
        slug: 'flag_jamaica',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇯🇴': {
        name: 'flag Jordan',
        slug: 'flag_jordan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇯🇵': {
        name: 'flag Japan',
        slug: 'flag_japan',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇰🇪': {
        name: 'flag Kenya',
        slug: 'flag_kenya',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇬': {
        name: 'flag Kyrgyzstan',
        slug: 'flag_kyrgyzstan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇭': {
        name: 'flag Cambodia',
        slug: 'flag_cambodia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇮': {
        name: 'flag Kiribati',
        slug: 'flag_kiribati',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇲': {
        name: 'flag Comoros',
        slug: 'flag_comoros',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇳': {
        name: 'flag St. Kitts & Nevis',
        slug: 'flag_st_kitts_nevis',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇵': {
        name: 'flag North Korea',
        slug: 'flag_north_korea',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇷': {
        name: 'flag South Korea',
        slug: 'flag_south_korea',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇰🇼': {
        name: 'flag Kuwait',
        slug: 'flag_kuwait',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇾': {
        name: 'flag Cayman Islands',
        slug: 'flag_cayman_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇰🇿': {
        name: 'flag Kazakhstan',
        slug: 'flag_kazakhstan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇦': {
        name: 'flag Laos',
        slug: 'flag_laos',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇧': {
        name: 'flag Lebanon',
        slug: 'flag_lebanon',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇨': {
        name: 'flag St. Lucia',
        slug: 'flag_st_lucia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇮': {
        name: 'flag Liechtenstein',
        slug: 'flag_liechtenstein',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇰': {
        name: 'flag Sri Lanka',
        slug: 'flag_sri_lanka',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇷': {
        name: 'flag Liberia',
        slug: 'flag_liberia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇸': {
        name: 'flag Lesotho',
        slug: 'flag_lesotho',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇹': {
        name: 'flag Lithuania',
        slug: 'flag_lithuania',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇺': {
        name: 'flag Luxembourg',
        slug: 'flag_luxembourg',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇻': {
        name: 'flag Latvia',
        slug: 'flag_latvia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇱🇾': {
        name: 'flag Libya',
        slug: 'flag_libya',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇦': {
        name: 'flag Morocco',
        slug: 'flag_morocco',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇨': {
        name: 'flag Monaco',
        slug: 'flag_monaco',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇩': {
        name: 'flag Moldova',
        slug: 'flag_moldova',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇪': {
        name: 'flag Montenegro',
        slug: 'flag_montenegro',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇫': {
        name: 'flag St. Martin',
        slug: 'flag_st_martin',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇬': {
        name: 'flag Madagascar',
        slug: 'flag_madagascar',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇭': {
        name: 'flag Marshall Islands',
        slug: 'flag_marshall_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇰': {
        name: 'flag North Macedonia',
        slug: 'flag_north_macedonia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇱': {
        name: 'flag Mali',
        slug: 'flag_mali',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇲': {
        name: 'flag Myanmar (Burma)',
        slug: 'flag_myanmar',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇳': {
        name: 'flag Mongolia',
        slug: 'flag_mongolia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇴': {
        name: 'flag Macao SAR China',
        slug: 'flag_macao_sar_china',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇵': {
        name: 'flag Northern Mariana Islands',
        slug: 'flag_northern_mariana_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇶': {
        name: 'flag Martinique',
        slug: 'flag_martinique',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇷': {
        name: 'flag Mauritania',
        slug: 'flag_mauritania',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇸': {
        name: 'flag Montserrat',
        slug: 'flag_montserrat',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇹': {
        name: 'flag Malta',
        slug: 'flag_malta',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇺': {
        name: 'flag Mauritius',
        slug: 'flag_mauritius',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇻': {
        name: 'flag Maldives',
        slug: 'flag_maldives',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇼': {
        name: 'flag Malawi',
        slug: 'flag_malawi',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇽': {
        name: 'flag Mexico',
        slug: 'flag_mexico',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇾': {
        name: 'flag Malaysia',
        slug: 'flag_malaysia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇲🇿': {
        name: 'flag Mozambique',
        slug: 'flag_mozambique',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇦': {
        name: 'flag Namibia',
        slug: 'flag_namibia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇨': {
        name: 'flag New Caledonia',
        slug: 'flag_new_caledonia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇪': {
        name: 'flag Niger',
        slug: 'flag_niger',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇫': {
        name: 'flag Norfolk Island',
        slug: 'flag_norfolk_island',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇬': {
        name: 'flag Nigeria',
        slug: 'flag_nigeria',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇮': {
        name: 'flag Nicaragua',
        slug: 'flag_nicaragua',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇱': {
        name: 'flag Netherlands',
        slug: 'flag_netherlands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇴': {
        name: 'flag Norway',
        slug: 'flag_norway',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇵': {
        name: 'flag Nepal',
        slug: 'flag_nepal',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇷': {
        name: 'flag Nauru',
        slug: 'flag_nauru',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇺': {
        name: 'flag Niue',
        slug: 'flag_niue',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇳🇿': {
        name: 'flag New Zealand',
        slug: 'flag_new_zealand',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇴🇲': {
        name: 'flag Oman',
        slug: 'flag_oman',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇦': {
        name: 'flag Panama',
        slug: 'flag_panama',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇪': {
        name: 'flag Peru',
        slug: 'flag_peru',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇫': {
        name: 'flag French Polynesia',
        slug: 'flag_french_polynesia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇬': {
        name: 'flag Papua New Guinea',
        slug: 'flag_papua_new_guinea',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇭': {
        name: 'flag Philippines',
        slug: 'flag_philippines',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇰': {
        name: 'flag Pakistan',
        slug: 'flag_pakistan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇱': {
        name: 'flag Poland',
        slug: 'flag_poland',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇲': {
        name: 'flag St. Pierre & Miquelon',
        slug: 'flag_st_pierre_miquelon',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇳': {
        name: 'flag Pitcairn Islands',
        slug: 'flag_pitcairn_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇷': {
        name: 'flag Puerto Rico',
        slug: 'flag_puerto_rico',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇸': {
        name: 'flag Palestinian Territories',
        slug: 'flag_palestinian_territories',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇹': {
        name: 'flag Portugal',
        slug: 'flag_portugal',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇼': {
        name: 'flag Palau',
        slug: 'flag_palau',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇵🇾': {
        name: 'flag Paraguay',
        slug: 'flag_paraguay',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇶🇦': {
        name: 'flag Qatar',
        slug: 'flag_qatar',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇷🇪': {
        name: 'flag Réunion',
        slug: 'flag_reunion',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇷🇴': {
        name: 'flag Romania',
        slug: 'flag_romania',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇷🇸': {
        name: 'flag Serbia',
        slug: 'flag_serbia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇷🇺': {
        name: 'flag Russia',
        slug: 'flag_russia',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇷🇼': {
        name: 'flag Rwanda',
        slug: 'flag_rwanda',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇦': {
        name: 'flag Saudi Arabia',
        slug: 'flag_saudi_arabia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇧': {
        name: 'flag Solomon Islands',
        slug: 'flag_solomon_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇨': {
        name: 'flag Seychelles',
        slug: 'flag_seychelles',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇩': {
        name: 'flag Sudan',
        slug: 'flag_sudan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇪': {
        name: 'flag Sweden',
        slug: 'flag_sweden',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇬': {
        name: 'flag Singapore',
        slug: 'flag_singapore',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇭': {
        name: 'flag St. Helena',
        slug: 'flag_st_helena',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇮': {
        name: 'flag Slovenia',
        slug: 'flag_slovenia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇯': {
        name: 'flag Svalbard & Jan Mayen',
        slug: 'flag_svalbard_jan_mayen',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇰': {
        name: 'flag Slovakia',
        slug: 'flag_slovakia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇱': {
        name: 'flag Sierra Leone',
        slug: 'flag_sierra_leone',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇲': {
        name: 'flag San Marino',
        slug: 'flag_san_marino',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇳': {
        name: 'flag Senegal',
        slug: 'flag_senegal',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇴': {
        name: 'flag Somalia',
        slug: 'flag_somalia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇷': {
        name: 'flag Suriname',
        slug: 'flag_suriname',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇸': {
        name: 'flag South Sudan',
        slug: 'flag_south_sudan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇹': {
        name: 'flag São Tomé & Príncipe',
        slug: 'flag_sao_tome_principe',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇻': {
        name: 'flag El Salvador',
        slug: 'flag_el_salvador',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇽': {
        name: 'flag Sint Maarten',
        slug: 'flag_sint_maarten',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇾': {
        name: 'flag Syria',
        slug: 'flag_syria',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇸🇿': {
        name: 'flag Eswatini',
        slug: 'flag_eswatini',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇦': {
        name: 'flag Tristan da Cunha',
        slug: 'flag_tristan_da_cunha',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇨': {
        name: 'flag Turks & Caicos Islands',
        slug: 'flag_turks_caicos_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇩': {
        name: 'flag Chad',
        slug: 'flag_chad',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇫': {
        name: 'flag French Southern Territories',
        slug: 'flag_french_southern_territories',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇬': {
        name: 'flag Togo',
        slug: 'flag_togo',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇭': {
        name: 'flag Thailand',
        slug: 'flag_thailand',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇯': {
        name: 'flag Tajikistan',
        slug: 'flag_tajikistan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇰': {
        name: 'flag Tokelau',
        slug: 'flag_tokelau',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇱': {
        name: 'flag Timor-Leste',
        slug: 'flag_timor_leste',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇲': {
        name: 'flag Turkmenistan',
        slug: 'flag_turkmenistan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇳': {
        name: 'flag Tunisia',
        slug: 'flag_tunisia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇴': {
        name: 'flag Tonga',
        slug: 'flag_tonga',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇷': {
        name: 'flag Türkiye',
        slug: 'flag_turkiye',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇹': {
        name: 'flag Trinidad & Tobago',
        slug: 'flag_trinidad_tobago',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇻': {
        name: 'flag Tuvalu',
        slug: 'flag_tuvalu',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇼': {
        name: 'flag Taiwan',
        slug: 'flag_taiwan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇹🇿': {
        name: 'flag Tanzania',
        slug: 'flag_tanzania',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇺🇦': {
        name: 'flag Ukraine',
        slug: 'flag_ukraine',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇺🇬': {
        name: 'flag Uganda',
        slug: 'flag_uganda',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇺🇲': {
        name: 'flag U.S. Outlying Islands',
        slug: 'flag_u_s_outlying_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇺🇳': {
        name: 'flag United Nations',
        slug: 'flag_united_nations',
        group: 'Flags',
        emoji_version: '4.0',
        unicode_version: '4.0',
        skin_tone_support: false
    },
    '🇺🇸': {
        name: 'flag United States',
        slug: 'flag_united_states',
        group: 'Flags',
        emoji_version: '0.6',
        unicode_version: '0.6',
        skin_tone_support: false
    },
    '🇺🇾': {
        name: 'flag Uruguay',
        slug: 'flag_uruguay',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇺🇿': {
        name: 'flag Uzbekistan',
        slug: 'flag_uzbekistan',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇻🇦': {
        name: 'flag Vatican City',
        slug: 'flag_vatican_city',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇻🇨': {
        name: 'flag St. Vincent & Grenadines',
        slug: 'flag_st_vincent_grenadines',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇻🇪': {
        name: 'flag Venezuela',
        slug: 'flag_venezuela',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇻🇬': {
        name: 'flag British Virgin Islands',
        slug: 'flag_british_virgin_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇻🇮': {
        name: 'flag U.S. Virgin Islands',
        slug: 'flag_u_s_virgin_islands',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇻🇳': {
        name: 'flag Vietnam',
        slug: 'flag_vietnam',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇻🇺': {
        name: 'flag Vanuatu',
        slug: 'flag_vanuatu',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇼🇫': {
        name: 'flag Wallis & Futuna',
        slug: 'flag_wallis_futuna',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇼🇸': {
        name: 'flag Samoa',
        slug: 'flag_samoa',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇽🇰': {
        name: 'flag Kosovo',
        slug: 'flag_kosovo',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇾🇪': {
        name: 'flag Yemen',
        slug: 'flag_yemen',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇾🇹': {
        name: 'flag Mayotte',
        slug: 'flag_mayotte',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇿🇦': {
        name: 'flag South Africa',
        slug: 'flag_south_africa',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇿🇲': {
        name: 'flag Zambia',
        slug: 'flag_zambia',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🇿🇼': {
        name: 'flag Zimbabwe',
        slug: 'flag_zimbabwe',
        group: 'Flags',
        emoji_version: '2.0',
        unicode_version: '2.0',
        skin_tone_support: false
    },
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿': {
        name: 'flag England',
        slug: 'flag_england',
        group: 'Flags',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🏴󠁧󠁢󠁳󠁣󠁴󠁿': {
        name: 'flag Scotland',
        slug: 'flag_scotland',
        group: 'Flags',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    },
    '🏴󠁧󠁢󠁷󠁬󠁳󠁿': {
        name: 'flag Wales',
        slug: 'flag_wales',
        group: 'Flags',
        emoji_version: '5.0',
        unicode_version: '5.0',
        skin_tone_support: false
    }
} as Record<
    Emoji,
    {
        name: string;
        slug: string;
        group: string;
        emoji_version: string;
        unicode_version: string;
        skin_tone_support: boolean;
    }
>;

export default emojiDataByEmoji;
