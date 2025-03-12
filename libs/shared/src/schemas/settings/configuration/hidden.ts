import Joi from 'joi';

export const hiddenSchema = Joi.object({
    enableEditThisChart: Joi.boolean().default(false),
    zipEmbedJs: Joi.boolean().default(false),
    privateBasemapGroups: Joi.object().pattern(Joi.string(), Joi.boolean()),
    customFormats: Joi.object({
        date: Joi.array().items(
            Joi.object({
                label: Joi.string(),
                value: Joi.string(),
            })
        ),
        number: Joi.array().items(
            Joi.object({
                label: Joi.string(),
                value: Joi.string(),
            })
        ),
    }),
    locales: {
        numeral: Joi.object(),
        dayjs: Joi.object(),
    },
});
