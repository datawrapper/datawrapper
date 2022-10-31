import test from 'ava';
import { defaultColors } from './defaultColors';

const tests = [
    {
        name: 'Dark background color defined in theme',
        theme: {
            colors: {
                background: '#333333'
            }
        },
        expectedResult: {
            tickText: {
                secondary: '#9d9d9d',
                primary: '#d9d9d9'
            },
            series: '#f1f1f1',
            value: '#d9d9d9',
            axis: '#f1f1f1',
            gridline: '#707070',
            fallbackBaseColor: '#f1f1f1'
        }
    },
    {
        name: 'Custom chart element basecolor,background & blend ratios defined in theme',
        theme: {
            colors: {
                background: '#FCB716',
                chartContentBaseColor: '#ffffff',
                bgBlendRatios: {
                    gridline: 0.5,
                    tickText: {
                        primary: 0,
                        secondary: 0
                    }
                }
            }
        },
        expectedResult: {
            tickText: {
                secondary: '#ffffff',
                primary: '#ffffff'
            },
            series: '#ffffff',
            value: '#fef2e4',
            axis: '#ffffff',
            gridline: '#fedeb5',
            fallbackBaseColor: '#ffffff'
        }
    },
    {
        name: "No fail when theme doesn't have any data",
        theme: {},
        expectedResult: {
            tickText: {
                secondary: '#a6a6a6',
                primary: '#7b7b7b'
            },
            series: '#333333',
            value: '#7b7b7b',
            axis: '#333333',
            gridline: '#e8e8e8',
            fallbackBaseColor: '#333333'
        }
    }
] as const;

tests.forEach(({ theme, name, expectedResult }) => {
    test(name, t => {
        t.deepEqual(defaultColors(theme), expectedResult);
    });
});
