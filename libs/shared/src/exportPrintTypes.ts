type Unit = 'in' | 'mm' | 'px';

type GenericExportParams = {
    width: number;
    disableExif?: boolean;
    height: number | 'auto';
    plain?: boolean;
    include?: 'full' | 'plain';
    logo?: 'on' | 'off' | 'auto' | undefined;
    logoId?: string | undefined;
    fullVector?: boolean;
    delay?: number;
    dark?: boolean;
    transparent?: boolean;
    default?: boolean;
    border?: { color?: string; width: number };
};

export type PdfExportParams = GenericExportParams & {
    colorMode?: 'rgb' | 'cmyk';
    ligatures?: boolean;
    unit?: Unit;
    scale?: number;
};

export type PdfExportResult = {
    dataURI: string;
    json: unknown;
    warnings: unknown;
};

export type PngExportParams = GenericExportParams & {
    zoom?: number;
};

export type PngExportResult = {
    dataURI: string;
    json: unknown;
    warnings: unknown;
};

export type SvgExportParams = GenericExportParams & {
    unit?: Unit;
    scale?: number;
};

export type SvgExportResult = {
    json: unknown;
    warnings: unknown;
    xml: string;
};

export type ExportPrint = {
    pdf(params: PdfExportParams): PdfExportResult;
    svg(params: SvgExportParams): SvgExportResult;
};
