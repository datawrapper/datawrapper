import Joi from 'joi';

const CustomFieldSchema = Joi.object({
    key: Joi.string().required(),
    description: Joi.string().required(),
    items: Joi.array().items(Joi.string()).optional(),
    title: Joi.string().required(),
    type: Joi.string().required().valid('radio', 'checkbox', 'textArea', 'text'),
    displayInArchive: Joi.boolean().default(false),
});

export const customFieldsSchema = Joi.object({
    fields: Joi.array().items(CustomFieldSchema),
    enableShowInArchive: Joi.boolean().default(false),
});
