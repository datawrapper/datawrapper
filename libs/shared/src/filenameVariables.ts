type FilenameVariable = {
    label: string;
    name: string;
    type: 'text' | 'date' | 'number';
    chartProperty: string;
    value: string | number;
};

/**
 * Returns a list of variables that can be used in image download filename template strings, e.g.
 * `{{ LOWER(title) }}`
 *
 * @param customFields to take into account for template variables
 * @returns
 */
export default function filenameVariables(
    customFields: { key?: string; title: string }[]
): FilenameVariable[] {
    const variables = [
        {
            label: 'Title',
            name: 'title',
            type: 'text' as const,
            chartProperty: 'title',
            value: 'Example Title',
        },
        {
            label: 'Published At',
            name: 'published_at',
            type: 'date' as const,
            chartProperty: 'published_at',
            value: '2022-03-24T13:49:07.232Z',
        },
        {
            label: 'Public ID',
            name: 'public_id',
            type: 'text' as const,
            chartProperty: 'publicId',
            value: 'Abc12',
        },
        {
            label: 'Public Version',
            name: 'public_version',
            type: 'number' as const,
            chartProperty: 'public_version',
            value: 1,
        },
        {
            label: 'Language',
            name: 'language',
            type: 'text' as const,
            chartProperty: 'language',
            value: 'en-US',
        },
        {
            label: 'Intro',
            name: 'intro',
            type: 'text' as const,
            chartProperty: 'metadata.describe.intro',
            value: 'Example Intro',
        },
        {
            label: 'Byline',
            name: 'byline',
            type: 'text' as const,
            chartProperty: 'metadata.describe.byline',
            value: 'Example Byline',
        },
    ];

    const customFieldVariables = customFields
        .filter((customField): customField is { key: string; title: string } => {
            // remove custom fields that don't have a key
            return !!customField.key;
        })
        .map(({ key, title }) => {
            return {
                label: `${title} (Custom)`,
                name: key,
                type: 'text' as const,
                chartProperty: `metadata.custom.${key}`,
                value: 'Example Custom Field',
            };
        });
    variables.push(...customFieldVariables);
    return variables;
}
