import Joi from 'joi';

export const userSchema: Record<string, Joi.Schema> = {
    id: Joi.string().regex(/^\d+$/),
    name: Joi.string()
        .allow(null)
        .allow('')
        .example('Carol Danvers')
        .pattern(/^[^<>'"]*$/),
    presenceColor: Joi.string()
        .pattern(/^[a-zA-Z-\d]+$/, { name: 'Color var name' })
        .description('The preferred color to use for user precense pin.'),
    avatar: Joi.string().uri()
};
