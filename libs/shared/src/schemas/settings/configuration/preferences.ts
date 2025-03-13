import Joi from 'joi';

export const preferencesSchema = Joi.object({
    defaults: Joi.object({
        metadata: Joi.object({
            publish: Joi.object({
                'embed-height': Joi.number(),
                'embed-width': Joi.number(),
            }),
            visualize: Joi.object({
                basemap: Joi.string(),
            }),
        }),
        locale: Joi.string().allow(null),
        embed: Joi.object({
            custom: Joi.object({
                template: Joi.string().allow(''),
                text: Joi.string().allow(''),
                title: Joi.string().allow(''),
            }),
            code: Joi.string().valid('responsive', 'iframe', 'web-component', 'custom'),
        }),
        webToPrint: Joi.boolean(),
    }),
    preview: Joi.object({
        widths: Joi.object({
            mobile: Joi.number().integer(),
            tablet: Joi.number().integer(),
            desktop: Joi.number().integer(),
        }),
    }),
    csv: Joi.object({
        localized: Joi.boolean(),
    }),
});
