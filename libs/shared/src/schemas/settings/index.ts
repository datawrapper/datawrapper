import Joi from 'joi';
import {
    overridableConfigurationSchema,
    overridingConfigurationSchema,
} from './configuration/index.js';
import {
    overridingSecretsConfigurationSchema,
    overridableSecretsConfigurationSchema,
} from './configuration/secrets.js';
import { ssoSchema, ssoSecretsSchema } from './sso.js';

// regular settings

export const teamSettings = Joi.object({
    defaultFolder: Joi.number().integer().allow(null),
    hidden: {
        zipEmbedJs: Joi.string().optional(),
    },
    configuration: overridingConfigurationSchema,
});

export const workspaceSettings = Joi.object({
    sso: ssoSchema,
    configuration: overridableConfigurationSchema,
});

export const mergedSettings = teamSettings.concat(workspaceSettings);

// secrets
export const secretTeamSettings = Joi.object({
    configuration: overridingSecretsConfigurationSchema,
});

export const secretWorkspaceSettings = Joi.object({
    sso: ssoSecretsSchema,
    configuration: overridableSecretsConfigurationSchema,
});

export const secretMergedSettings = secretTeamSettings.concat(secretWorkspaceSettings);

// settings with secrets
export const teamSettingsWithSecrets = teamSettings.concat(secretTeamSettings);
export const workspaceSettingsWithSecrets = workspaceSettings.concat(secretWorkspaceSettings);
export const mergedSettingsWithSecrets = mergedSettings.concat(secretMergedSettings);
