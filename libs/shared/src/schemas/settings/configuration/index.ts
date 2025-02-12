import Joi from 'joi';
import { hostingSchema } from './hosting.js';
import { imagesSchema } from './images.js';
import { integrationsSchema } from './integrations.js';
import { customFieldsSchema } from './customFields.js';
import { preferencesSchema } from './preferences.js';

export { hostingSchema } from './hosting.js';
export { imagesSchema } from './images.js';
export { integrationsSchema } from './integrations.js';
export { customFieldsSchema } from './customFields.js';
export { preferencesSchema } from './preferences.js';

export const overridableConfigurationSchema = Joi.object({
    hosting: hostingSchema,
    images: imagesSchema,
    integrations: integrationsSchema,
    customFields: customFieldsSchema,
    preferences: preferencesSchema,
});

const OverridingConfigurationSetSchema = {
    override: Joi.boolean(),
};

export const overridingConfigurationSchema = Joi.object({
    hosting: hostingSchema.append(OverridingConfigurationSetSchema),
    images: imagesSchema.append(OverridingConfigurationSetSchema),
    integrations: integrationsSchema.append(OverridingConfigurationSetSchema),
    customFields: customFieldsSchema.append(OverridingConfigurationSetSchema),
    preferences: preferencesSchema.append(OverridingConfigurationSetSchema),
});
