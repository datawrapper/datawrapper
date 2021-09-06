import test from 'ava';
import { defaultColors } from './defaultColors.js';

const tests = [
    {
        testName: 'Dark background color defined in theme',
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
        testName: 'Custom chart element basecolor,background & blend ratios defined in theme',
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
    }
];

tests.forEach(function (testData) {
    test(testData.testName, t => {
        t.deepEqual(defaultColors(testData.theme), testData.expectedResult);
    });
});
