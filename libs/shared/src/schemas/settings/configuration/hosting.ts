import Joi from 'joi';

const HostingPdfFtpSchema = Joi.object({
    directory: Joi.string().allow(''),
    enabled: Joi.boolean(),
    filename: Joi.string().allow(''),
    server: Joi.string().allow(''),
    user: Joi.string().allow(''),
});

const HostingPdfS3Schema = Joi.object({
    accessKeyId: Joi.string().allow(''),
    bucket: Joi.string().allow(''),
    enabled: Joi.boolean(),
    filename: Joi.string().allow(''),
    prefix: Joi.string().allow(''),
    region: Joi.string().allow(''),
});

const HostingPdfSchema = Joi.object({
    ftp: HostingPdfFtpSchema,
    s3: HostingPdfS3Schema,
});

const HostingChartsConfigSchema = Joi.object({
    disableRedirect: Joi.boolean(),
    hashPublishing: Joi.boolean(),
    urls: Joi.object({
        hostname: Joi.string().allow(''),
        protocol: Joi.string().valid('http', 'https'),
        prefix: Joi.string().allow(''),
    }),
    disableRedirects: Joi.boolean(),
});

const HostingChartsProvidersSftpSchema = Joi.object({
    host: Joi.string().allow(''),
    port: Joi.number().integer(),
    username: Joi.string().allow(''),
    prefix: Joi.string().allow(''),
    authMethod: Joi.string(),
});
const HostingChartsProvidersS3Schema = Joi.object({
    bucket: Joi.string().allow(''),
    prefix: Joi.string().allow(''),
    region: Joi.string().allow(''),
    acl: Joi.string().valid(
        'private',
        'public-read',
        'public-read-write',
        'authenticated-read',
        'aws-exec-read',
        'bucket-owner-read',
        'bucket-owner-full-control',
        'log-delivery-write'
    ),
    cacheControl: Joi.string()
        .valid(
            'no-cache, no-store',
            'max-age=60',
            'max-age=3600',
            'max-age=7200',
            'max-age=14400',
            'max-age=28800'
        )
        .optional(),
});
const HostingChartsProvidersGcsSchema = Joi.object({
    privateKeyId: Joi.string().allow(''),
    projectId: Joi.string().allow(''),
    clientId: Joi.string().allow(''),
    clientEmail: Joi.string().allow(''),
    bucket: Joi.string().allow(''),
    prefix: Joi.string().allow(''),
});

const HostingChartsProvidersSchema = Joi.object({
    sftp: HostingChartsProvidersSftpSchema,
    s3: HostingChartsProvidersS3Schema,
    gcs: HostingChartsProvidersGcsSchema,
});

const HostingChartsSchema = Joi.object({
    providers: HostingChartsProvidersSchema,
    config: HostingChartsConfigSchema,
    provider: Joi.string().valid('dwcdn', 's3', 'sftp', 'gcs').default('dwcdn'),
});

export const hostingSchema = Joi.object({
    pdf: HostingPdfSchema,
    charts: HostingChartsSchema,
});

export const hostingSecretsSchema = Joi.object({
    charts: Joi.object({
        providers: Joi.object({
            sftp: Joi.object({
                passphrase: Joi.string().allow(''),
                password: Joi.string().allow(''),
                privateKey: Joi.string().allow(''),
            }),
            s3: Joi.object({
                accessKey: Joi.string().allow(''),
                secretKey: Joi.string().allow(''),
            }),
            gcs: Joi.object({
                privateKey: Joi.string().allow(''),
            }),
        }),
    }),
    pdf: Joi.object({
        ftp: Joi.object({
            password: Joi.string().allow(''),
        }),
        s3: Joi.object({
            secret: Joi.string().allow(''),
        }),
    }),
});
