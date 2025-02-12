import Joi from 'joi';
import { hostingSecretsSchema } from './hosting.js';

export { hostingSecretsSchema } from './hosting.js';

export const overridableSecretsConfigurationSchema = Joi.object({
    hosting: hostingSecretsSchema,
});

const OverridingConfigurationSetSchema = {
    override: Joi.boolean(),
};

export const overridingSecretsConfigurationSchema = Joi.object({
    hosting: hostingSecretsSchema.append(OverridingConfigurationSetSchema),
});
