import test from 'ava';
import getOverlayColor from './getOverlayColor.js';

const overlayOne = {
    color: 7,
    opacity: 0.35
};
const overlayTwo = {
    color: '#ff5e4b',
    opacity: 0.35
};
const baseColor = '#000000';
const theme = {
    colors: {
        palette: [
            '#18a1cd',
            '#1d81a2',
            '#15607a',
            '#00dca6',
            '#09bb9f',
            '#009076',
            '#c4c4c4',
            '#c71e1d',
            '#fa8c00',
            '#ffca76',
            '#ffe59c'
        ]
    }
};

test('check color from with color from palette', t => {
    t.deepEqual(getOverlayColor(overlayOne, baseColor, theme), 'rgba(199,30,29, 0.35)');
});

test('check color without palette', t => {
    t.deepEqual(getOverlayColor(overlayTwo, baseColor, theme), 'rgba(255,94,75, 0.35)');
});
