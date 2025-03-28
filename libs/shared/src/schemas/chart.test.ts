import test from 'ava';
import Joi from 'joi';
import { getPartialChartSchema, themeIdSchema } from './chart';

test('getPartialChartSchema returns the correct schema, and only the given keys', t => {
    const keys = ['title', 'type'];
    const actualSchema = getPartialChartSchema(keys);

    const expected = {
        title: Joi.string()
            .example('My cool chart')
            .allow('')
            .description('Title of your chart. This will be the chart headline.'),
        type: Joi.string()
            .pattern(/^[a-z0-9]+(?:-{1,2}[a-z0-9]+)*$/)
            .example('d3-lines')
            .description(
                'Type of the chart ([Reference](https://developer.datawrapper.de/v3.0/docs/chart-types))'
            ),
    };

    t.deepEqual(actualSchema, expected);
});

test('getPartialChartSchema throws an error if an unknown key is passed', t => {
    const keys = ['title', 'theme', 'unknownKey'];

    t.throws(() => getPartialChartSchema(keys));
});

for (const [id, errorExpected] of [
    ['datawrapper', false],
    ['1-dwhj123', false],
    ['drafts', true],
    ['a', true],
    ['$@dw?', true],
] as const) {
    test(`themeIdSchema: "${id}" is ${errorExpected ? 'invalid' : 'valid'}`, t => {
        const { error } = themeIdSchema.validate(id);
        t.is(!!error, errorExpected);
    });
}
