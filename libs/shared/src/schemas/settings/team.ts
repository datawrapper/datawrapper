import Joi from 'joi';

export const teamPreferencesSchema = Joi.object({
    defaultFolder: Joi.number().integer().allow(null),
});
