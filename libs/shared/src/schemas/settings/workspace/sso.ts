import Joi from 'joi';

const protocolsSchema = Joi.object({
    openId: Joi.object({
        clientSecret: Joi.string().allow(null).allow(''),
        clientId: Joi.string().allow(null).allow(''),
        domain: Joi.string().allow(null).allow(''),
    }),
    saml: Joi.object({
        certificate: Joi.string().allow(null).allow(''),
        disableRequestedAuthnContext: Joi.boolean().default(false),
        entityId: Joi.string().allow(null).allow(''),
        url: Joi.string().allow(null).allow(''),
    }),
});

export const ssoSchema = Joi.object({
    protocols: protocolsSchema,
    protocol: Joi.string().valid('openId', 'saml'),
    enabled: Joi.boolean().default(false),
    automaticProvisioning: Joi.boolean().default(false),
});

export const ssoSecretsSchema = Joi.object({
    protocols: Joi.object({
        openId: Joi.object({
            clientSecret: Joi.string().allow(null).allow(''),
        }),
        saml: Joi.object({
            certificate: Joi.string().allow(null).allow(''),
        }),
    }),
});
