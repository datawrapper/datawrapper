type GenericExportParams = {
    width: number;
    height: number | 'auto';
    plain: boolean;
    logo: string | undefined;
    logoId: string | undefined;
    fullVector: boolean;
    delay?: number;
    dark: boolean;
    transparent: boolean;
};

type PdfExportParams = GenericExportParams & {
    border: { width: number };
    colorMode: string;
    ligatures: boolean;
    unit: string;
    scale: number;
};

type PdfExportResult = {
    dataURI: string;
    json: unknown;
    warnings: unknown;
};

type SvgExportParams = GenericExportParams & {
    unit?: string;
    scale?: number;
};

type SvgExportResult = {
    json: unknown;
    warnings: unknown;
    xml: string;
};

export type ExportPrint = {
    pdf(params: PdfExportParams): PdfExportResult;
    svg(params: SvgExportParams): SvgExportResult;
};
