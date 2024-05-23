import Joi from 'joi';

import { CHART_ID_REGEXP } from '../chartConstants.js';
import { isValidMySQLJSON } from '../validation.js';

export const themeIdSchema = Joi.string()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-{1,2}[a-z0-9]+)*$/)
    .min(2)
    .example('datawrapper');

export const preparedChartSchema: Record<string, Joi.Schema> = {
    id: Joi.string().pattern(CHART_ID_REGEXP),
    type: Joi.string()
        .pattern(/^[a-z0-9]+(?:-{1,2}[a-z0-9]+)*$/)
        .example('d3-lines')
        .description(
            'Type of the chart ([Reference](https://developer.datawrapper.de/v3.0/docs/chart-types))'
        ),
    title: Joi.string()
        .example('My cool chart')
        .allow('')
        .description('Title of your chart. This will be the chart headline.'),
    theme: themeIdSchema,
    lastEditStep: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .description('Current position in chart editor workflow'),

    publishedAt: Joi.date().allow(null),
    publicUrl: Joi.string().uri().allow(null),
    publicVersion: Joi.number().integer().allow(null),

    deleted: Joi.boolean(),
    deletedAt: Joi.date(),

    forkable: Joi.boolean(),
    isFork: Joi.boolean(),
    forkedFrom: Joi.string().allow(null),

    metadata: Joi.object({
        data: Joi.object({
            transpose: Joi.boolean()
        }).unknown(true)
    })
        .description('Metadata that saves all chart specific settings and options.')
        .unknown(true)
        .custom(v => {
            if (!isValidMySQLJSON(v)) {
                throw new Error('Invalid JSON');
            }
            return v;
        }),
    language: Joi.string()
        .regex(/^[a-z]{2}([_-][A-Z]{2})?$/)
        .description('Visualization locale (e.g. en-US)'),
    externalData: Joi.string().uri().allow('').allow(null).description('URL of external dataset'),

    customFields: Joi.object().pattern(
        Joi.string(),
        Joi.alternatives().try(Joi.number(), Joi.boolean(), Joi.string())
    ),
    keywords: Joi.string(),
    utf8: Joi.boolean(),

    createdAt: Joi.alternatives().try(Joi.date(), Joi.string()),
    lastModifiedAt: Joi.alternatives().try(Joi.date(), Joi.string()),

    publicId: Joi.string().pattern(CHART_ID_REGEXP),
    folderId: Joi.number().allow(null),
    authorId: Joi.number().integer().allow(null),
    author: Joi.object({
        name: Joi.string().allow(null),
        email: Joi.string().allow(null)
    }),
    organizationId: Joi.string().allow(null)
};

export function getPartialChartSchema(keys: string[]): Record<string, Joi.Schema> {
    return keys.reduce((acc, key) => {
        if (!preparedChartSchema[key]) {
            throw new Error(`Unknown key "${key}" in chart schema`);
        }
        acc[key] = preparedChartSchema[key];
        return acc;
    }, {} as Record<string, Joi.Schema>);
}
