import Joi from 'joi';

export const preferencesSchema = Joi.object({
    defaults: Joi.object({
        metadata: Joi.object({
            publish: Joi.object({
                'embed-height': Joi.number(),
                'embed-width': Joi.number(),
            }),
        }),
        locale: Joi.string(),
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
            mobile: Joi.number(),
            tablet: Joi.number(),
            desktop: Joi.number(),
        }),
    }),
    csv: Joi.object({
        localized: Joi.boolean(),
    }),
});
