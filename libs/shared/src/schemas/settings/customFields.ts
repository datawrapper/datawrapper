import Joi from 'joi';

const CustomFieldSchema = Joi.object({
    key: Joi.string().required(),
    description: Joi.string().required(),
    items: Joi.string().allow(''),
    title: Joi.string().required(),
    type: Joi.string().required().valid('radio', 'checkbox', 'textArea', 'text'),
});

export const customFieldsSchema = Joi.object({
    fields: Joi.array().items(CustomFieldSchema),
    enableShowInArchive: Joi.boolean().default(false),
});
