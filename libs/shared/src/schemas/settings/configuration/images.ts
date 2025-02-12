import Joi from 'joi';

const Format = Joi.object({
    borderWidth: Joi.number().default(0),
    dark: Joi.boolean().default(false),
    filename: Joi.string(),
    format: Joi.string().valid('png', 'pdf', 'svg').default('png'),
    size: Joi.object({
        height: Joi.number().default(450),
        width: Joi.number().default(375),
    }),
    plain: Joi.boolean().default(false),
    logo: Joi.string(),
    zoom: Joi.number().default(2),
    transparent: Joi.boolean().default(false),
});

const ImagesDownloadSchema = Joi.object({
    localized: Joi.boolean().default(false),
    name: Joi.string().default('{{ LOWER(title) }}'),
    format: Joi.string().default('full'),
    formats: Joi.array().items(Format),
});

export const imagesSchema = Joi.object({
    waitForImagesDuringPublish: Joi.boolean().default(false),
    download: ImagesDownloadSchema,
});
