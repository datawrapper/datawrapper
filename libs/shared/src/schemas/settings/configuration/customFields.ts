import Joi from 'joi';

type CustomFieldSetting = {
    key: string;
    title: string;
    type: 'text' | 'number' | 'radio' | 'checkbox' | 'textArea' | 'select';
    items?: string[];
    description?: string;
    displayInArchive?: boolean;
};

const CustomFieldSchema = Joi.object({
    key: Joi.string()
        .regex(/^[a-zA-Z0-9-_()]*$/)
        .required(),
    title: Joi.string().required(),
    type: Joi.string()
        .valid('text', 'number', 'radio', 'checkbox', 'textArea', 'select')
        .required(),
    description: Joi.string().allow('').optional(),
    items: Joi.when('type', {
        is: Joi.valid('radio', 'select'),
        then: Joi.array().items(Joi.string()).required().min(1),
        otherwise: Joi.array().items(Joi.string()).optional(),
    }),
    displayInArchive: Joi.boolean().optional().default(false),
});

export const customFieldsSchema = Joi.object({
    fields: Joi.array()
        .items(CustomFieldSchema)
        .custom((value, helpers) => {
            const keySet = new Set(value.map((v: CustomFieldSetting) => v.key));
            if (keySet.size !== value.length) {
                return helpers.error('customFields.keysUnique');
            }
            return value;
        }),
    enableShowInArchive: Joi.boolean().default(false),
});
