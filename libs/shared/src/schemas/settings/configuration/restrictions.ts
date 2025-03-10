import Joi from 'joi';

export const restrictionsSchema = Joi.object({
    flags: Joi.object({
        byline: Joi.boolean().default(false),
        datawrapperAttribution: Joi.boolean().default(false),
        downloadImage: Joi.boolean().default(false),
        downloadPdf: Joi.boolean().default(false),
        downloadSvg: Joi.boolean().default(false),
        embed: Joi.boolean().default(false),
        getTheData: Joi.boolean().default(false),
        layoutSelector: Joi.boolean().default(false),
        outputLocale: Joi.boolean().default(false),
        socialSharing: Joi.boolean().default(false),
    }),
    restrictDefaultThemes: Joi.boolean().default(false),
    disableVisualizations: Joi.object({
        allowAdmins: Joi.boolean().default(false),
        enabled: Joi.boolean().default(false),
        visualizations: Joi.object().pattern(Joi.string(), Joi.boolean()),
    }),
});
