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
import { teamPreferencesSchema } from './team.js';
// regular settings

export const teamSettings = Joi.object({
    hidden: {
        zipEmbedJs: Joi.string().optional(),
    },
    configuration: overridingConfigurationSchema,
    preferences: teamPreferencesSchema,
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
