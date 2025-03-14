export type ExportFormatPreset = {
    plain?: boolean;
    filename: string;
    format: 'png' | 'pdf' | 'svg';
    dark?: boolean | undefined;
    width?: number | undefined;
    height?: number | 'auto' | undefined;
    logo?: 'on' | 'off' | 'auto' | undefined;
    ligatures?: boolean | undefined;
    zoom?: number | undefined;
    scale?: number | undefined;
    borderWidth?: number | undefined;
    transparent?: boolean | undefined;
    colorMode?: 'cmyk' | 'rgb' | undefined;
    unit?: 'in' | 'mm' | 'px' | undefined;
};

/**
 * Default image formats for export.
 */
export const DEFAULT_IMAGE_FORMATS: ExportFormatPreset[] = [
    {
        filename: 'plain-s',
        zoom: 2,
        format: 'png',
        width: 600,
        height: 300,
        borderWidth: 30,
        plain: true,
        dark: false,
    },
    {
        filename: 'plain',
        zoom: 2,
        format: 'png',
        width: 600,
        height: 'auto',
        borderWidth: 10,
        plain: true,
        dark: false,
    },
    {
        filename: 'full',
        zoom: 2,
        format: 'png',
        width: 600,
        height: 'auto',
        borderWidth: 10,
        plain: false,
        dark: false,
    },
];
