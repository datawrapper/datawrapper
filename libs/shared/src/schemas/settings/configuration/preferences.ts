import Joi from 'joi';

export const preferencesSchema = Joi.object({
    defaults: Joi.object({
        metadata: Joi.object({
            publish: Joi.object({
                active: Joi.boolean(),
                'embed-height': Joi.number(),
                'embed-width': Joi.number(),
            }),
            basemap: Joi.string(),
        }),
        locale: Joi.string(),
        embed: Joi.object({
            custom: Joi.object({
                template: Joi.string(),
                text: Joi.string(),
                title: Joi.string(),
            }),
            code: Joi.string().valid('responsive', 'iframe', 'web-component', 'custom'),
        }),
        webToPrint: Joi.any(),
    }),
    preview: Joi.object({
        widths: Joi.object({
            mobile: Joi.number(),
            tablet: Joi.number(),
            desktop: Joi.number(),
        }),
    }),
    csv: Joi.object({
        localized: Joi.boolean(),
    }),
    archive: Joi.object({
        folders: Joi.array().items(Joi.string()),
    }),
});
