import Joi from 'joi';

const Format = Joi.object({
    borderWidth: Joi.number(),
    dark: Joi.boolean(),
    filename: Joi.string(),
    format: Joi.string().valid('png', 'pdf', 'svg'),
    height: Joi.alternatives().try(Joi.number(), Joi.string().valid('auto')),
    width: Joi.number(),
    plain: Joi.boolean(),
    logo: Joi.string(),
    zoom: Joi.number(),
    transparent: Joi.boolean(),
});

const ImagesDownloadSchema = Joi.object({
    localized: Joi.boolean(),
    name: Joi.string(),
    format: Joi.string(),
    formats: Joi.array().items(Format),
});
export const imagesSchema = Joi.object({
    waitForImagesDuringPublish: Joi.boolean().default(false),
    download: ImagesDownloadSchema,
});
