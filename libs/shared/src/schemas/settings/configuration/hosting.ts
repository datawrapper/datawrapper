import Joi from 'joi';

const HostingPdfFtpSchema = Joi.object({
    directory: Joi.string(),
    enabled: Joi.boolean(),
    filename: Joi.string(),
    server: Joi.string(),
    user: Joi.string(),
});

const HostingPdfS3Schema = Joi.object({
    accessKeyId: Joi.string(),
    bucket: Joi.string(),
    enabled: Joi.boolean(),
    filename: Joi.string(),
    prefix: Joi.string(),
    region: Joi.string(),
});

const HostingPdfSchema = Joi.object({
    ftp: HostingPdfFtpSchema,
    s3: HostingPdfS3Schema,
});

const HostingChartsConfigSchema = Joi.object({
    disableRedirect: Joi.boolean(),
    hashPublishing: Joi.boolean(),
    urls: Joi.object({
        hostname: Joi.string(),
        protocol: Joi.string().valid('http', 'https'),
        prefix: Joi.string(),
    }),
});

const HostingChartsProvidersSftpSchema = Joi.object({
    host: Joi.string(),
    port: Joi.number(),
    username: Joi.string(),
    prefix: Joi.string(),
});
const HostingChartsProvidersS3Schema = Joi.object({
    endpoint: Joi.string(),
    bucket: Joi.string(),
    prefix: Joi.string(),
    region: Joi.string(),
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
    privateKeyId: Joi.string(),
    projectId: Joi.string(),
    clientId: Joi.string(),
    clientEmail: Joi.string(),
    bucket: Joi.string(),
    prefix: Joi.string(),
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
                passphrase: Joi.string(),
                password: Joi.string(),
                privateKey: Joi.string(),
            }),
            s3: Joi.object({
                accessKey: Joi.string(),
                secretKey: Joi.string(),
            }),
            gcs: Joi.object({
                privateKey: Joi.string(),
            }),
        }),
    }),
    pdf: Joi.object({
        ftp: Joi.object({
            password: Joi.string(),
        }),
        s3: Joi.object({
            secretAccessKey: Joi.string(),
        }),
    }),
});
