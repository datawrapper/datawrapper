import Joi from 'joi';

const foreignIntegrationSchema = Joi.object({
    enabled: Joi.boolean().default(false),
    webhookUrl: Joi.string().uri().optional().allow(''),
});

export const integrationsSchema = Joi.object({
    slack: foreignIntegrationSchema,
    msTeams: foreignIntegrationSchema,
    custom: foreignIntegrationSchema.append({
        unpublishWebhookUrl: Joi.string().uri().optional().allow(''),
    }),
});
