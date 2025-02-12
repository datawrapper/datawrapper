import Joi from 'joi';

const foreignIntegrationSchema = Joi.object({
    enabled: Joi.boolean(),
    webhookUrl: Joi.string(),
});

export const integrationsSchema = Joi.object({
    slack: foreignIntegrationSchema,
    msTeams: foreignIntegrationSchema,
    custom: foreignIntegrationSchema.append({
        unpublishWebhookUrl: Joi.string().optional(),
    }),
});
